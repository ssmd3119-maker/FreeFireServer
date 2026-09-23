/**
 * GetGachaInfo (-> CSGetGachaInfoRes). Reference: get_gacha_info @4154 returns a
 * single GachaInfo with generous purchase limits. No reqType, so chest_id falls
 * back to the reference default (1001).
 *
 * Ported from ported_2.js (handleGetGachaInfo), preserving logic exactly.
 */

'use strict';

const { requireAccount } = require('./_shared');
const { LUCKY_ROYALE_WHEELS } = require('../data/shopCatalog');

function handleGetGachaInfo(reqObj, ctx) {
  const account = requireAccount(ctx);
  if (!account) return {};

  const gachaInfoList = LUCKY_ROYALE_WHEELS.map((w) => ({
    chest_id: w.chest_id,
    lottery_count_weekly: 0,
    next_free_time: 0,
    not_got_num: 0,
    limit_purchase_count_one: 999,
    limit_purchase_count_ten: 999,
    first_draw_reward_num: 0
  }));

  return {
    gacha_info_list: gachaInfoList
  };
}

module.exports = {
  endpoint: 'GetGachaInfo',
  reqType: null,
  resType: 'CSGetGachaInfoRes',
  handler: handleGetGachaInfo
};
