'use strict';

require('dotenv').config();
const path = require('path');
const config = require('../config/default');
const logger = require('./logger');

if (process.env.SPLIT_SERVERS === 'true') {
  // Legacy multi-process split mode
  const { fork } = require('child_process');
  const SERVERS = [
    { name: 'live', file: 'servers/live.js' },
    { name: 'login', file: 'servers/login.js' },
    { name: 'main', file: 'servers/main.js' },
    { name: 'tcp', file: 'servers/tcp.js' }
  ];
  const children = [];
  let shuttingDown = false;

  function shutdownAll(exitCode) {
    if (shuttingDown) return;
    shuttingDown = true;
    for (const c of children) {
      try { c.kill('SIGTERM'); } catch (e) {}
    }
    setTimeout(() => process.exit(exitCode || 0), 1500).unref();
  }

  for (const s of SERVERS) {
    const child = fork(path.join(__dirname, s.file), [], { stdio: 'inherit' });
    children.push(child);
    child.on('exit', (code, signal) => {
      logger.error(`[launcher] ${s.name} exited (code=${code}, signal=${signal || 'none'})`);
      if (!shuttingDown) shutdownAll(1);
    });
  }

  process.on('SIGINT', () => { logger.info('[launcher] SIGINT received'); shutdownAll(0); });
  process.on('SIGTERM', () => { logger.info('[launcher] SIGTERM received'); shutdownAll(0); });
  logger.info(`[launcher] started ${SERVERS.length} split servers: ${SERVERS.map((s) => s.name).join(', ')}`);
} else {
  // Default: Unified server (dashboard + ver.php + api + all game protocols on port 3000)
  const createUnifiedApp = require('./apps/unifiedApp');
  const { startServer } = require('./servers/_start');
  const { createGateway } = require('./tcp/gateway');

  const PORT = Number(process.env.APP_PORT || process.env.DEFAULT_APP_PORT || 3000);
  const app = createUnifiedApp();
  const httpServer = startServer(app, PORT, 'unified');

  let tcpServer = null;
  const tcpPort = Number(process.env.TCP_PORT || config.ports.tcp || 10300);
  try {
    tcpServer = createGateway();
    tcpServer.listen(tcpPort, '0.0.0.0', () => {
      logger.info(`[tcp] gateway listening on 0.0.0.0:${tcpPort}`);
    });
    tcpServer.on('error', (err) => {
      logger.warn(`[tcp] gateway non-fatal error on port ${tcpPort}: ${err.message}`);
    });
  } catch (err) {
    logger.warn(`[tcp] gateway init warning: ${err.message}`);
  }

  function shutdown(signal) {
    logger.info(`[server] ${signal} received. Shutting down gracefully.`);
    try { if (httpServer) httpServer.close(); } catch (_) {}
    try { if (tcpServer) tcpServer.close(); } catch (_) {}
    setTimeout(() => process.exit(0), 1000).unref();
  }

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  logger.info(`[server] Free Fire Server running on 0.0.0.0:${PORT} (Unified mode)`);
}
