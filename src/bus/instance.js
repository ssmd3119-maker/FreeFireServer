'use strict';

// Lazily-created, process-wide Bus singleton for the Node tier (gateway + HTTP
// handlers). Returns null when REDIS_URL is unset — the bus is OPTIONAL: presence
// and other cross-layer features degrade to no-ops while everything else keeps
// working. Callers must treat the result as best-effort (null-check + catch).
const config = require('../../config/default');
const { Bus } = require('./index');
const { InMemoryBus } = require('./inMemoryBus');
const logger = require('../logger');

let created = false;
let bus = null;

function getBus() {
  if (created) return bus;
  created = true;
  const url = config.redis && config.redis.url;
  if (!url) {
    logger.info('[bus] no REDIS_URL — using in-memory bus');
    return (bus = new InMemoryBus({ source: process.env.BUS_SOURCE || config.nodeId || 'node', node: config.nodeId }));
  }
  try {
    bus = new Bus({ url, source: process.env.BUS_SOURCE || config.nodeId || 'node', node: config.nodeId });
    logger.info('[bus] shared instance connected');
  } catch (err) {
    logger.warn(`[bus] shared instance init failed: ${err.message} — using in-memory bus`);
    bus = new InMemoryBus({ source: process.env.BUS_SOURCE || config.nodeId || 'node', node: config.nodeId });
  }
  return bus;
}

module.exports = { getBus };
