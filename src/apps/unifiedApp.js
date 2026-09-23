'use strict';

const cors = require('cors');
const config = require('../../config/default');
const { createBaseApp, finalizeApp } = require('./base');
const createProtocolRouter = require('../protocol/router');
const { renderDashboard } = require('../admin/dashboardHtml');

/**
 * Unified application server (port 3000):
 * - GET /: Interactive Web Admin & Diagnostics Dashboard
 * - /live: Version discovery endpoint (ver.php)
 * - /api: Admin, account management, diagnostics, and stats endpoints
 * - /: Full binary protocol router (handles all AES/Protobuf commands, both auth and game)
 */
module.exports = function createUnifiedApp() {
  const app = createBaseApp();

  if (config.security && config.security.cors) {
    app.use(cors(config.security.cors));
  }

  // Dashboard endpoints for browser & AI Studio preview
  app.get('/', (req, res) => {
    res.type('html');
    res.send(renderDashboard());
  });

  app.get('/dashboard', (req, res) => {
    res.type('html');
    res.send(renderDashboard());
  });

  // Client discovery and version manifest
  app.use('/live', require('../routes/version'));

  // Admin & diagnostics API
  app.use('/api', require('../routes/index'));
  app.get('/game-modes', (req, res, next) => {
    req.url = '/game-modes';
    require('../routes/index')(req, res, next);
  });

  // Game protocol router (handles both auth and general game protocol endpoints)
  app.use('/', createProtocolRouter());

  return finalizeApp(app, 'unified');
};
