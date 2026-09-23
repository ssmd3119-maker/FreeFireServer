/**
 * GetGachaDesc  (-> CSGetGachaDescRes)
 *
 * Ported verbatim from ported_1.js (handleGetGachaDesc).
 * reference: @4112. One gacha chest with its item list (mapped to 1.70
 * GachaShowItemsWithJackpot + ClientChestType). The legendary item gets
 * reward_level 3 (gold glow).
 */

'use strict';

const { LUCKY_ROYALE_WHEELS } = require('../data/shopCatalog');

function handleGetGachaDesc(reqObj, ctx) {
  ctx.logger.info(`[lucky_royale] GetGachaDesc returning ${LUCKY_ROYALE_WHEELS.length} wheels`);

  const gachaDescList = LUCKY_ROYALE_WHEELS.map((wheel, index) => {
    const items = wheel.reward_items.map((r) => ({
      item_id: r.item_id,
      is_show: true,
      item_num: 1,
      reward_level: r.reward_level || 1
    }));

    return {
      chest_id: wheel.chest_id,
      chest_type: {
        chest_id: wheel.chest_id,
        priority: index + 1,
        coin_type: wheel.coin_type,
        chest_name: wheel.chest_name,
        once_price: wheel.once_price,
        ten_price: wheel.ten_price,
        extra_reward: true
      },
      item_list_with_jackpot: [
        {
          items,
          jackpot: wheel.grand_prize_id
        }
      ]
    };
  });

  return {
    gacha_desc_list: gachaDescList
  };
}

module.exports = {
  endpoint: 'GetGachaDesc',
  reqType: null,
  resType: 'CSGetGachaDescRes',
  handler: handleGetGachaDesc
};
