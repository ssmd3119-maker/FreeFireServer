/**
 * Leaderboard (CSLeaderboardReq -> AccountLeaderboardRes)
 * Handles in-game global leaderboard requests for Bermuda BR and Clash Squad.
 */

'use strict';

const { requireAccount } = require('./_shared');
const rankingService = require('../services/rankingService');

function handleLeaderboard(reqObj, ctx) {
  const account = requireAccount(ctx);
  const uid = account ? (account.uid || account.account_id) : 0;
  return rankingService.buildAccountLeaderboardRes(reqObj, uid);
}

module.exports = {
  endpoint: 'Leaderboard',
  reqType: 'CSLeaderboardReq',
  resType: 'AccountLeaderboardRes',
  handler: handleLeaderboard
};
