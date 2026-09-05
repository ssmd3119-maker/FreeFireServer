'use strict';

const EventEmitter = require('events');
const { Envelope, encode, decode } = require('./proto');
const logger = require('../logger');

class InMemoryBus extends EventEmitter {
  constructor({ source = 'node', node = 'node' } = {}) {
    super();
    this.source = source;
    this.node = node;
    this.presence = new Map(); // uid -> { node, expiresAt }
    this.hashes = new Map(); // key -> Map(field -> val)
    this.kv = new Map(); // key -> { val, expiresAt }
    this.counters = new Map();
    this.locks = new Map(); // key -> { token, expiresAt }
    this.streams = new Map(); // type -> Array<{ id, env }>
    this.streamSubs = new Map(); // type -> Array<handler>
    this.matchServers = new Map(); // addr -> score
    this.pub = {
      ping: async () => 'PONG',
      mget: async (keys) => keys.map((k) => {
        const uid = k.replace(/^presence:/, '');
        const p = this.presence.get(uid);
        if (!p) return null;
        if (p.expiresAt && Date.now() > p.expiresAt) {
          this.presence.delete(uid);
          return null;
        }
        return p.node;
      }),
      pipeline: () => {
        const ops = [];
        return {
          set: (k, v, ex, ttl) => ops.push(() => {
            const uid = k.replace(/^presence:/, '');
            this.presence.set(uid, { node: v, expiresAt: Date.now() + ttl * 1000 });
          }),
          exec: async () => { ops.forEach((op) => op()); }
        };
      },
      scanStream: ({ match, count }) => {
        const emitter = new EventEmitter();
        process.nextTick(() => {
          const keys = Array.from(this.presence.keys()).map((k) => `presence:${k}`);
          emitter.emit('data', keys);
          emitter.emit('end');
        });
        return emitter;
      },
      zremrangebyscore: async (key, min, max) => 0,
      zrangebyscore: async (key, min, max) => [],
      hset: (k, f, v) => this.hset(k, f, v),
      hget: (k, f) => this.hget(k, f),
      hdel: (k, ...f) => this.hdel(k, ...f),
      hgetall: (k) => this.hgetall(k),
      hlen: (k) => this.hlen(k),
      incr: (k) => this.incr(k),
      set: (k, v, ex, ttl) => {
        if (ttl) return this.setKey(k, v, ttl);
        this.kv.set(k, { val: v, expiresAt: null });
        return 'OK';
      },
      get: (k) => this.getKey(k),
      eval: async () => 1
    };
  }

  _wrap(type, payloadType, obj) {
    const payload = encode(payloadType, obj);
    return Envelope.create({
      type,
      source: this.source,
      correlation_id: '',
      ts_unix_ms: Date.now(),
      payload
    });
  }

  async publish(type, payloadType, obj) {
    const env = this._wrap(type, payloadType, obj);
    if (!this.streams.has(type)) this.streams.set(type, []);
    const list = this.streams.get(type);
    list.push({ id: `${Date.now()}-${list.length}`, env });
    if (list.length > 1000) list.shift();

    const handlers = this.streamSubs.get(type) || [];
    for (const h of handlers) {
      Promise.resolve(h(env)).catch((e) => logger.warn(`[in-memory-bus] stream handler err: ${e.message}`));
    }
    return 'OK';
  }

  async publishPS(type, payloadType, obj) {
    const env = this._wrap(type, payloadType, obj);
    this.emit('ps:' + type, env);
    return 1;
  }

  subscribeStream(type, group, consumer, handler) {
    if (!this.streamSubs.has(type)) this.streamSubs.set(type, []);
    this.streamSubs.get(type).push(handler);
    return { status: 'ready', disconnect: () => {} };
  }

  subscribePS(type, handler) {
    const fn = (env) => {
      Promise.resolve(handler(env)).catch((e) => logger.warn(`[in-memory-bus] ps handler err: ${e.message}`));
    };
    this.on('ps:' + type, fn);
    return { status: 'ready', disconnect: () => this.off('ps:' + type, fn) };
  }

  async setPresence(accountId, ttlSec = 300) {
    const expiresAt = Date.now() + ttlSec * 1000;
    this.presence.set(String(accountId), { node: this.node, expiresAt });
    return 'OK';
  }

  async clearPresence(accountId) {
    this.presence.delete(String(accountId));
    return 1;
  }

  async getNode(accountId) {
    const p = this.presence.get(String(accountId));
    if (!p) return null;
    if (p.expiresAt && Date.now() > p.expiresAt) {
      this.presence.delete(String(accountId));
      return null;
    }
    return p.node;
  }

  async getNodes(accountIds) {
    const out = {};
    for (const id of accountIds || []) {
      const node = await this.getNode(id);
      if (node) out[id] = node;
    }
    return out;
  }

  async refreshPresence(accountIds, ttlSec = 300) {
    for (const id of accountIds || []) {
      await this.setPresence(id, ttlSec);
    }
  }

  async scanPresence() {
    const now = Date.now();
    const out = {};
    for (const [id, p] of this.presence.entries()) {
      if (p.expiresAt && now > p.expiresAt) {
        this.presence.delete(id);
      } else {
        out[id] = p.node;
      }
    }
    return out;
  }

  async getMatchServers(maxAgeSec = 30) {
    const now = Math.floor(Date.now() / 1000);
    const cutoff = now - maxAgeSec;
    const out = [];
    for (const [addr, score] of this.matchServers.entries()) {
      if (score >= cutoff) out.push(addr);
      else this.matchServers.delete(addr);
    }
    return out;
  }

  async hset(key, field, val) {
    if (!this.hashes.has(key)) this.hashes.set(key, new Map());
    this.hashes.get(key).set(String(field), String(val));
    return 1;
  }

  async hget(key, field) {
    const h = this.hashes.get(key);
    return h ? (h.get(String(field)) ?? null) : null;
  }

  async hdel(key, ...fields) {
    const h = this.hashes.get(key);
    if (!h) return 0;
    let cnt = 0;
    for (const f of fields) {
      if (h.delete(String(f))) cnt++;
    }
    return cnt;
  }

  async hgetall(key) {
    const h = this.hashes.get(key);
    if (!h) return {};
    const obj = {};
    for (const [k, v] of h.entries()) obj[k] = v;
    return obj;
  }

  async hlen(key) {
    const h = this.hashes.get(key);
    return h ? h.size : 0;
  }

  async incr(key) {
    const n = (this.counters.get(key) || 0) + 1;
    this.counters.set(key, n);
    return n;
  }

  async setKey(key, val, ttlSec) {
    const expiresAt = ttlSec ? Date.now() + ttlSec * 1000 : null;
    this.kv.set(key, { val, expiresAt });
    return 'OK';
  }

  async getKey(key) {
    const item = this.kv.get(key);
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.kv.delete(key);
      return null;
    }
    return item.val;
  }

  async acquireLock(key, token, ttlMs) {
    const now = Date.now();
    const cur = this.locks.get(key);
    if (cur && cur.expiresAt > now && cur.token !== token) return false;
    this.locks.set(key, { token, expiresAt: now + ttlMs });
    return true;
  }

  async renewLock(key, token, ttlMs) {
    const now = Date.now();
    const cur = this.locks.get(key);
    if (!cur || cur.token !== token || cur.expiresAt <= now) return false;
    cur.expiresAt = now + ttlMs;
    return true;
  }

  async releaseLock(key, token) {
    const cur = this.locks.get(key);
    if (!cur || cur.token !== token) return false;
    this.locks.delete(key);
    return true;
  }

  static payload(env, payloadType) {
    return decode(payloadType, env.payload);
  }

  async close() {
    this.removeAllListeners();
  }
}

module.exports = { InMemoryBus };
