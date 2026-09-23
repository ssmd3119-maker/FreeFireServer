/**
 * GetLeaderBoardThresholdScore (CSLeaderboardReq -> CSGetLeaderBoardThresholdScoreRes)
 * Returns the threshold score required for leaderboard / high rank tiers.
 */

'use strict';

const rankingService = require('../services/rankingService');

function handleGetLeaderBoardThresholdScore(reqObj) {
  const mainType = Number(reqObj && reqObj.main_type) || 1;
  return rankingService.getThresholdScore(mainType);
}

module.exports = {
  endpoint: 'GetLeaderBoardThresholdScore',
  reqType: 'CSLeaderboardReq',
  resType: 'CSGetLeaderBoardThresholdScoreRes',
  handler: handleGetLeaderBoardThresholdScore
};
