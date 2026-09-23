/**
 * LoginGetDesc  (CSLoginDescReq -> LoginDescRes)  [public, LoginGet* handshake]
 *
 * Returns the login-description blob the client needs to finish loading into the
 * lobby (adverts, switches, activity/gacha/ranking/store configs, ...).
 *
 * Previously this shipped the pre-serialized protocol/LoginDescRes.bin verbatim
 * (~130 KB, generated from original_to_read/gen_logindescres.py). That gave no
 * control over events. It now returns an editable plain object from
 * _loginDescData.js — trimmed to one representative entry per repeated field —
 * and lets the router encode it against LoginDescRes. Add/remove entries in the
 * data module to control adverts, activities, gacha banners, store tabs, etc.
 */

'use strict';

const loginDesc = require('./_loginDescData');
const { getAllWheels, getStoreTabs } = require('../services/shopService');

function buildDynamicGachaDescList() {
  const wheels = getAllWheels();
  return wheels.map((wheel, index) => {
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
}

function handler(reqObj, ctx) {
  ctx.logger.info('[login] LoginGetDesc -> LoginDescRes (live wheels and store tabs injected)');
  
  // Inject live dynamic gacha wheels and comprehensive store tables
  loginDesc.gacha_res = {
    gacha_desc_list: buildDynamicGachaDescList()
  };
  loginDesc.store_tab_res = {
    store_tables: getStoreTabs()
  };

  return loginDesc;
}

module.exports = {
  endpoint: 'LoginGetDesc',
  reqType: 'CSLoginDescReq',
  resType: 'LoginDescRes',
  handler
};
