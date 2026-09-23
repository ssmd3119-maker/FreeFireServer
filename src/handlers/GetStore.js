/**
 * GetStore  (CSGetStoreReq -> CSGetStoreRes)
 *
 * Ported from ported_2.js (handleGetStore). reference: get_store @3923 returns
 * one sample StoreDesc (store_id 1, item_id 102000006, free).
 */

'use strict';

const { requireAccount } = require('./_shared');
const { STORE_ITEMS } = require('../data/shopCatalog');

function handleGetStore(reqObj, ctx) {
  const account = requireAccount(ctx);
  if (!account) return {};

  ctx.logger.info(`[shop] GetStore uid=${account.uid} returning ${STORE_ITEMS.length} items`);

  return {
    store_items: STORE_ITEMS.map((item) => ({
      store_id: item.store_id,
      sort_id: item.sort_id,
      item_id: item.item_id,
      name: item.name,
      desc: item.desc,
      coins_price: item.coins_price,
      gems_price: item.gems_price,
      tag_type: item.tag_type,
      is_new: Boolean(item.is_new),
      is_recommended: Boolean(item.is_recommended),
      type_override: item.type_override || '',
      discount_price: item.discount_price || 0,
      limited_purchase_times: 0,
      purchase_times: 0
    }))
  };
}

module.exports = {
  endpoint: 'GetStore',
  reqType: 'CSGetStoreReq',
  resType: 'CSGetStoreRes',
  handler: handleGetStore
};
