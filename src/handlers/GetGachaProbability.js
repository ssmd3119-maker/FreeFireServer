'use strict';

/**
 * GetGachaProbability  (CSGetLotteryProbabilityReq -> CSGetLotteryProbabilityRes)
 *
 * Provides probability table for Lucky Royale chests (rare tiers and level probabilities).
 */

function handleGetGachaProbability(reqObj, ctx) {
  ctx.logger.info(`[lucky_royale] GetGachaProbability`);
  return {
    rare_pr: [
      { rare_level: 3, probability: 150 },   // 1.5% Legendary / Grand Prize
      { rare_level: 2, probability: 2850 },  // 28.5% Rare / Epic
      { rare_level: 1, probability: 7000 }   // 70.0% Common / Standard
    ],
    level_pr: [
      { level: 3, probability: 150 },
      { level: 2, probability: 2850 },
      { level: 1, probability: 7000 }
    ]
  };
}

module.exports = {
  endpoint: 'GetGachaProbability',
  reqType: 'CSGetLotteryProbabilityReq',
  resType: 'CSGetLotteryProbabilityRes',
  handler: handleGetGachaProbability
};
