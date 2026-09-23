/**
 * GetDailyLeaderboardByAccountID  (AccountIDReq -> AccountLeaderboardRes)
 *
 * Ported verbatim from ported_3.js (handleGetDailyLeaderboardByAccountID).
 * reference: handle_GetDailyLeaderboardByAccountID @ htpp.py:5929 (empty stub).
 * resType resolved best-effort to AccountLeaderboardRes. Returns an empty board.
 */

'use strict';

const { requireAccount } = require('./_shared');
const rankingService = require('../services/rankingService');

function handleGetDailyLeaderboardByAccountID(reqObj, ctx) {
  const account = requireAccount(ctx);
  if (!account) return {};
  const targetId = (reqObj && reqObj.account_id) ? Number(reqObj.account_id) : (account.uid || account.account_id || 0);
  return rankingService.buildAccountLeaderboardRes({ main_type: 1, page_size: 50 }, targetId);
}

module.exports = {
  endpoint: 'GetDailyLeaderboardByAccountID',
  reqType: 'AccountIDReq',
  resType: 'AccountLeaderboardRes',
  handler: handleGetDailyLeaderboardByAccountID
};
