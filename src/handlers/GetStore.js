/**
 * GetStore  (CSGetStoreReq -> CSGetStoreRes)
 *
 * Ported from ported_2.js (handleGetStore). reference: get_store @3923 returns
 * one sample StoreDesc (store_id 1, item_id 102000006, free).
 */

'use strict';

const { requireAccount } = require('./_shared');
const { getAllStoreItems } = require('../services/shopService');

function handleGetStore(reqObj, ctx) {
  const account = requireAccount(ctx);
  if (!account) return {};

  const allItems = getAllStoreItems();
  ctx.logger.info(`[shop] GetStore uid=${account.uid} returning ${allItems.length} items`);

  return {
    store_items: allItems.map((item) => ({
      store_id: item.store_id,
      sort_id: item.sort_id,
      item_id: item.item_id,
      name: item.name,
      desc: item.desc || '',
      coins_price: item.coins_price || 0,
      gems_price: item.gems_price || 0,
      discount_price: item.discount_price || 0,
      tag_type: item.tag_type || 0,
      tag_value: 0,
      is_new: Boolean(item.is_new),
      is_recommended: Boolean(item.is_recommended),
      type_override: item.type_override || '',
      added_time: '2024-01-01 00:00:00',
      expire_time: '2035-12-31 23:59:59',
      expire_timestamp: 2082758399,
      limited_purchase_times: 0,
      purchase_times: 0,
      language: 'default'
    }))
  };
}

module.exports = {
  endpoint: 'GetStore',
  reqType: 'CSGetStoreReq',
  resType: 'CSGetStoreRes',
  handler: handleGetStore
};
