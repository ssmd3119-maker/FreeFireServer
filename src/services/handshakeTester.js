'use strict';

const http = require('http');
const aes = require('../protocol/aes');
const protos = require('../protocol/protos');
const accounts = require('../db/accounts');

function post(port, path, body, token) {
  return new Promise((resolve, reject) => {
    const headers = {
      'Content-Type': 'application/octet-stream',
      'Content-Length': body.length
    };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    const req = http.request(
      { host: '127.0.0.1', port, path, method: 'POST', headers, timeout: 5000 },
      (res) => {
        const chunks = [];
        res.on('data', (d) => chunks.push(d));
        res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks) }));
      }
    );
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy(new Error('Request timed out'));
    });
    req.write(body);
    req.end();
  });
}

const enc = (type, obj) =>
  aes.encrypt(
    Buffer.from(
      protos.lookup(type).encode(protos.lookup(type).fromObject(obj)).finish()
    )
  );

const dec = (type, buf) => {
  try {
    return protos.lookup(type).toObject(protos.lookup(type).decode(buf), {
      longs: String,
      enums: Number,
      defaults: true
    });
  } catch (err) {
    return { decodeError: err.message };
  }
};

async function runHandshakeTest(port = 3000, testNickname = 'AgentTestPlayer') {
  const steps = [];
  const startTime = Date.now();

  try {
    // Drop deterministic guest account for a fresh test
    try {
      accounts.db.prepare('DELETE FROM accounts WHERE open_id = ?').run('guest-default');
    } catch (_) {}

    const loginReq = {
      open_id_type: '',
      plat_id: 1,
      language: 'en',
      client_version: '1.70.0'
    };

    // Step 1: MajorLogin (guest, fresh) -> Expect 404
    const s1Start = Date.now();
    const r1 = await post(port, '/MajorLogin', enc('LoginReq', loginReq));
    const s1Dur = Date.now() - s1Start;
    const s1Success = r1.status === 404;
    steps.push({
      step: 1,
      name: 'MajorLogin (Guest Pre-check)',
      status: r1.status,
      durationMs: s1Dur,
      success: s1Success,
      details: s1Success
        ? 'Received expected 404 (prompt client to show registration screen)'
        : `Unexpected status ${r1.status}`
    });

    // Step 2: MajorRegister -> Expect 200
    const s2Start = Date.now();
    const r2 = await post(
      port,
      '/MajorRegister',
      enc('PlatformRegisterReq', { nickname: testNickname })
    );
    const s2Dur = Date.now() - s2Start;
    let reg = dec('MajorRegisterRes', r2.body);
    if (!reg || reg.decodeError) reg = dec('PlatformRegisterRes', r2.body);
    const s2Success = r2.status === 200;
    steps.push({
      step: 2,
      name: 'MajorRegister (Create Profile)',
      status: r2.status,
      durationMs: s2Dur,
      success: s2Success,
      details: s2Success
        ? `Registered account successfully (nickname: ${testNickname})`
        : `Registration failed with HTTP ${r2.status}`,
      payload: reg
    });

    // Step 3: MajorLogin (Guest known) -> Expect 200 with Bearer token
    const s3Start = Date.now();
    const r3 = await post(port, '/MajorLogin', enc('LoginReq', loginReq));
    const s3Dur = Date.now() - s3Start;
    const log = dec('MajorLoginRes', r3.body);
    const s3Success = r3.status === 200 && Boolean(log.account_id) && Boolean(log.token);
    steps.push({
      step: 3,
      name: 'MajorLogin (Authenticate Session)',
      status: r3.status,
      durationMs: s3Dur,
      success: s3Success,
      details: s3Success
        ? `Authenticated account #${log.account_id} with JWT/Bearer token`
        : `Login failed with HTTP ${r3.status}`,
      tokenPreview: log.token ? `${log.token.slice(0, 16)}...` : null,
      accountId: log.account_id
    });

    // Step 4: GetLoginData -> Expect 200 with populated player profile
    const s4Start = Date.now();
    const r4 = await post(port, '/GetLoginData', enc('LoginReq', loginReq), log.token);
    const s4Dur = Date.now() - s4Start;
    const acc = dec('LoginRes', r4.body);
    const s4Success = r4.status === 200 && acc.nickname === testNickname;
    steps.push({
      step: 4,
      name: 'GetLoginData (Sync Player State)',
      status: r4.status,
      durationMs: s4Dur,
      success: s4Success,
      details: s4Success
        ? `Player data synced (Level: ${acc.level || 1}, Coins: ${acc.coins || 0}, Exp: ${acc.exp || 0})`
        : `Sync failed with HTTP ${r4.status}`,
      player: {
        nickname: acc.nickname,
        level: acc.level,
        coins: acc.coins,
        diamonds: acc.diamonds
      }
    });

    const totalDur = Date.now() - startTime;
    const passed = steps.every((s) => s.success);

    return {
      success: passed,
      durationMs: totalDur,
      steps,
      message: passed
        ? 'All 4 handshake steps passed cleanly! Game protocol handshake is fully verified.'
        : 'One or more handshake steps failed.'
    };
  } catch (err) {
    return {
      success: false,
      durationMs: Date.now() - startTime,
      steps,
      error: err.message
    };
  }
}

module.exports = { runHandshakeTest };
