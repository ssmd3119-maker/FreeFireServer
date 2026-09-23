/**
 * GetTopNDailyLeaderboard  (Empty -> AccountLeaderboardRes)
 *
 * Ported from ported_3.js (handleGetTopNDailyLeaderboard).
 * reference: handle_GetTopNDailyLeaderboard @ htpp.py:5924 (empty stub).
 * resType resolved best-effort to AccountLeaderboardRes. Empty board.
 */

'use strict';

const { requireAccount } = require('./_shared');
const rankingService = require('../services/rankingService');

function handleGetTopNDailyLeaderboard(reqObj, ctx) {
  const account = requireAccount(ctx);
  if (!account) return {};
  const uid = account.uid || account.account_id || 0;
  return rankingService.buildAccountLeaderboardRes({ main_type: 1, page_size: 50 }, uid);
}

module.exports = {
  endpoint: 'GetTopNDailyLeaderboard',
  reqType: 'Empty',
  resType: 'AccountLeaderboardRes',
  handler: handleGetTopNDailyLeaderboard
};
