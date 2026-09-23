/**
 * GetGachaDesc  (-> CSGetGachaDescRes)
 *
 * Ported verbatim from ported_1.js (handleGetGachaDesc).
 * reference: @4112. One gacha chest with its item list (mapped to 1.70
 * GachaShowItemsWithJackpot + ClientChestType). The legendary item gets
 * reward_level 3 (gold glow).
 */

'use strict';

const { getAllWheels } = require('../services/shopService');

function handleGetGachaDesc(reqObj, ctx) {
  const wheels = getAllWheels();
  ctx.logger.info(`[lucky_royale] GetGachaDesc returning ${wheels.length} wheels`);

  const gachaDescList = wheels.map((wheel, index) => {
    const items = wheel.reward_items.map((r, itemIdx) => ({
      item_id: r.item_id,
      is_show: true,
      item_num: 1,
      reward_level: r.reward_level || 1,
      id: itemIdx + 1,
      drop_up_ratio: r.reward_level >= 3 ? 2 : 1,
      is_drop_up_buffed: r.reward_level >= 3
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
        extra_reward: true,
        start_time: '2024-01-01 00:00:00',
        end_time: '2035-12-31 23:59:59',
        start_time_stamp: 1704067200,
        end_time_stamp: 2082758399,
        once_num: 1,
        ten_num: 10,
        color_id: wheel.coin_type === 1 ? 1 : 2,
        show_model_male: 102000004,
        show_model_female: 101000005,
        independent_entrance_type: 1
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
