/**
 * Purchase  (CSPurchaseReq -> CSPurchaseRes)
 *
 * Ported from ported_3.js (handlePurchase). reference: purchase @ htpp.py:3968 —
 * grants the purchased item(s) for free and echoes back the (effectively
 * unlimited) wallet. We mirror that: append the item to the backpack and report
 * a no-cost transaction.
 */

'use strict';

const { requireAccount, nowSecs } = require('./_shared');
const { getStoreItemById } = require('../services/shopService');

function handlePurchase(reqObj, ctx) {
  const account = requireAccount(ctx);
  if (!account) return {};

  const storeItemId = Number(reqObj.store_item_id || 0);
  const cnt = Math.max(1, Number(reqObj.cnt || 1));

  // Find in store catalog if possible
  const catalogItem = getStoreItemById(storeItemId);

  const realItemId = catalogItem ? catalogItem.item_id : storeItemId;
  let coinsCost = 0;
  let gemsCost = 0;

  if (catalogItem) {
    const unitCoins = catalogItem.coins_price || 0;
    const unitGems = catalogItem.discount_price || catalogItem.gems_price || 0;
    coinsCost = unitCoins * cnt;
    gemsCost = unitGems * cnt;
  }

  // Deduct wallet if sufficient (or leave at 0 if no cost)
  if (coinsCost > 0 && account.coins >= coinsCost) {
    account.coins -= coinsCost;
  }
  if (gemsCost > 0 && account.gems >= gemsCost) {
    account.gems -= gemsCost;
  }

  if (account.wallet) {
    account.wallet.coins = account.coins;
    account.wallet.gems = account.gems;
  }

  // Add purchased item to player backpack
  if (realItemId) {
    if (!account.backpack) account.backpack = { items: [] };
    if (!Array.isArray(account.backpack.items)) account.backpack.items = [];

    const existing = account.backpack.items.find((it) => it.id === realItemId);
    if (existing) {
      existing.cnt = (existing.cnt || 1) + cnt;
    } else {
      account.backpack.items.push({ id: realItemId, cnt });
    }
  }

  ctx.savePlayer();
  ctx.logger.info(
    `[shop] Purchase uid=${account.uid} store_item_id=${storeItemId} real_item=${realItemId} cnt=${cnt} ` +
    `coinsCost=${coinsCost} gemsCost=${gemsCost} remainingCoins=${account.coins} remainingGems=${account.gems}`
  );

  return {
    data: {
      trans_id: nowSecs(),
      add_item_list: realItemId ? [{ id: realItemId, cnt }] : [],
      del_item_list: [],
      coins_delta: -coinsCost,
      gems_delta: -gemsCost
    },
    coins: account.coins || 0,
    gems: account.gems || 0
  };
}

module.exports = {
  endpoint: 'Purchase',
  reqType: 'CSPurchaseReq',
  resType: 'CSPurchaseRes',
  handler: handlePurchase
};
