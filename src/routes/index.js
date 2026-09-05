'use strict';

const express = require('express');
const router = express.Router();
const os = require('os');
const config = require('../../config/default');
const accounts = require('../db/accounts');
const { getBus } = require('../bus/instance');
const { runHandshakeTest } = require('../services/handshakeTester');

// Parse JSON request bodies for API operations
router.use(express.json());

// 1. Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    server: 'Free Fire Server',
    version: config.version || '1.70.1',
    uptime: Math.floor(process.uptime()),
    timestamp: Date.now()
  });
});

// 2. Aggregate statistics
router.get('/stats', async (req, res) => {
  try {
    let accountsCount = 0;
    try {
      const row = accounts.db.prepare('SELECT COUNT(*) AS count FROM accounts').get();
      accountsCount = row ? row.count : 0;
    } catch (_) {}

    let onlineCount = 0;
    const bus = getBus();
    if (bus && bus.scanPresence) {
      try {
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 500));
        const presence = await Promise.race([bus.scanPresence(), timeoutPromise]);
        onlineCount = Object.keys(presence).length;
      } catch (_) {}
    }

    const mem = process.memoryUsage();
    const memRssMb = Math.round(mem.rss / 1024 / 1024) + ' MB';

    res.json({
      status: 'ok',
      accountsCount,
      onlineCount,
      endpointsCount: 494,
      uptimeSec: Math.floor(process.uptime()),
      system: {
        nodeVersion: process.version,
        platform: `${os.type()} ${os.arch()}`,
        memoryRss: memRssMb,
        nodeId: config.nodeId || os.hostname()
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Accounts list & search
router.get('/accounts', (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    const limit = Math.min(Number(req.query.limit || 50), 200);

    let rows = [];
    if (q) {
      const asNum = Number(q);
      if (!isNaN(asNum)) {
        rows = accounts.db
          .prepare(
            'SELECT account_id, open_id, nickname, level, clan_id, created_at, last_login_at, banned, role FROM accounts WHERE account_id = ? OR nickname LIKE ? LIMIT ?'
          )
          .all(asNum, `%${q}%`, limit);
      } else {
        rows = accounts.db
          .prepare(
            'SELECT account_id, open_id, nickname, level, clan_id, created_at, last_login_at, banned, role FROM accounts WHERE nickname LIKE ? LIMIT ?'
          )
          .all(`%${q}%`, limit);
      }
    } else {
      rows = accounts.db
        .prepare(
          'SELECT account_id, open_id, nickname, level, clan_id, created_at, last_login_at, banned, role FROM accounts ORDER BY account_id DESC LIMIT ?'
        )
        .all(limit);
    }

    res.json({ accounts: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Single account inspection
router.get('/accounts/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'invalid account id' });

    const row = accounts.db
      .prepare('SELECT * FROM accounts WHERE account_id = ?')
      .get(id);

    if (!row) return res.status(404).json({ error: 'account not found' });
    res.json({ account: row });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Create new account directly
router.post('/accounts', (req, res) => {
  try {
    const { nickname, level, gold } = req.body || {};
    if (!nickname || !String(nickname).trim()) {
      return res.status(400).json({ error: 'nickname is required' });
    }

    const now = Math.floor(Date.now() / 1000);
    const openId = `dev-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const info = accounts.db
      .prepare(
        `INSERT INTO accounts (open_id, open_id_type, nickname, plat_id, region, language, level, created_at, last_login_at)
         VALUES (?, 'dev', ?, 1, 'BR', 'en', ?, ?, ?)`
      )
      .run(openId, String(nickname).trim(), Number(level) || 1, now, now);

    res.status(201).json({
      ok: true,
      account_id: info.lastInsertRowid,
      nickname: String(nickname).trim()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Ban account
router.post('/accounts/:id/ban', (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'invalid id' });
    accounts.db.prepare('UPDATE accounts SET banned = 1 WHERE account_id = ?').run(id);

    const bus = getBus();
    if (bus && bus.publishPS) {
      bus.publishPS('session.revoke', 'SessionRevoke', { account_id: id, reason: 'banned by admin' }).catch(() => {});
    }

    res.json({ ok: true, account_id: id, banned: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Unban account
router.post('/accounts/:id/unban', (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'invalid id' });
    accounts.db.prepare('UPDATE accounts SET banned = 0 WHERE account_id = ?').run(id);
    res.json({ ok: true, account_id: id, banned: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Update nickname
router.post('/accounts/:id/nickname', (req, res) => {
  try {
    const id = Number(req.params.id);
    const { nickname } = req.body || {};
    if (!id || !nickname) return res.status(400).json({ error: 'missing id or nickname' });

    accounts.db.prepare('UPDATE accounts SET nickname = ? WHERE account_id = ?').run(String(nickname).trim(), id);
    res.json({ ok: true, account_id: id, nickname: String(nickname).trim() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Update role
router.post('/accounts/:id/role', (req, res) => {
  try {
    const id = Number(req.params.id);
    const { role } = req.body || {};
    if (!id) return res.status(400).json({ error: 'invalid id' });

    accounts.db.prepare('UPDATE accounts SET role = ? WHERE account_id = ?').run(Number(role) || 0, id);
    res.json({ ok: true, account_id: id, role: Number(role) || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 10. Run live handshake test
router.post('/test/handshake', async (req, res) => {
  try {
    const port = Number(process.env.APP_PORT || process.env.DEFAULT_APP_PORT || 3000);
    const result = await runHandshakeTest(port);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 11. Endpoints catalog
let cachedEndpoints = null;
router.get('/endpoints', (req, res) => {
  try {
    if (!cachedEndpoints) {
      cachedEndpoints = require('../../protocol/endpoint_map.json');
    }
    res.json({ endpoints: cachedEndpoints });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
