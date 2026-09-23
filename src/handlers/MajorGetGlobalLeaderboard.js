/**
 * MajorGetGlobalLeaderboard (CSLeaderboardReq -> AccountLeaderboardRes)
 * Handles global rankings queries for Bermuda and Clash Squad.
 */

'use strict';

const { requireAccount } = require('./_shared');
const rankingService = require('../services/rankingService');

function handleMajorGetGlobalLeaderboard(reqObj, ctx) {
  const account = requireAccount(ctx);
  const uid = account ? (account.uid || account.account_id) : 0;
  return rankingService.buildAccountLeaderboardRes(reqObj, uid);
}

module.exports = {
  endpoint: 'MajorGetGlobalLeaderboard',
  reqType: 'CSLeaderboardReq',
  resType: 'AccountLeaderboardRes',
  handler: handleMajorGetGlobalLeaderboard
};
