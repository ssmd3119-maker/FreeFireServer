/**
 * PurchaseGacha (CSLotteryReq -> CSLotteryRes)
 *
 * reference handle_PurchaseGacha @ htpp.py:6140 — draw random items (x1 or x10)
 * and return them as lottery_goods. We drop the Lucky/items.json tables and use
 * a simple uniform draw over a small pool.
 */

'use strict';

const { requireAccount, randInt } = require('./_shared');
const { LUCKY_ROYALE_WHEELS } = require('../data/shopCatalog');

const AWARD_TYPE_ITEM = 1;

function pickWeightedItem(rewardItems) {
  const totalWeight = rewardItems.reduce((acc, it) => acc + (it.weight || 10), 0);
  let r = randInt(totalWeight);
  for (const it of rewardItems) {
    const w = it.weight || 10;
    if (r < w) return it;
    r -= w;
  }
  return rewardItems[0];
}

function handlePurchaseGacha(reqObj, ctx) {
  const account = requireAccount(ctx);
  if (!account) return {};

  const chestId = Number(reqObj.chest_id || 1001);
  const wheel = LUCKY_ROYALE_WHEELS.find((w) => w.chest_id === chestId) || LUCKY_ROYALE_WHEELS[0];

  // gacha_type === 2 indicates a x10 (multi) pull
  const isMulti = Number(reqObj.gacha_type) === 2 || Number(reqObj.count) === 10;
  const itemCount = isMulti ? (wheel.chest_id === 1004 ? 5 : 10) : 1;
  const price = isMulti ? wheel.ten_price : wheel.once_price;

  // Deduct currency if sufficient
  if (wheel.coin_type === 1) { // Coins/Gold
    if (account.coins >= price) account.coins -= price;
  } else { // Gems/Diamonds
    if (account.gems >= price) account.gems -= price;
  }

  if (account.wallet) {
    account.wallet.coins = account.coins;
    account.wallet.gems = account.gems;
  }

  // Draw items
  const drawnRewards = [];
  let hasBigReward = false;

  if (!account.backpack) account.backpack = { items: [] };
  if (!Array.isArray(account.backpack.items)) account.backpack.items = [];

  for (let i = 0; i < itemCount; i += 1) {
    const picked = pickWeightedItem(wheel.reward_items);
    drawnRewards.push(picked);
    if (picked.reward_level >= 3 || picked.item_id === wheel.grand_prize_id) {
      hasBigReward = true;
    }

    // Add to backpack
    const existing = account.backpack.items.find((it) => it.id === picked.item_id);
    if (existing) {
      existing.cnt = (existing.cnt || 1) + 1;
    } else {
      account.backpack.items.push({ id: picked.item_id, cnt: 1 });
    }
  }

  ctx.savePlayer();
  ctx.logger.info(
    `[lucky_royale] PurchaseGacha uid=${account.uid} chest_id=${chestId} pulls=${itemCount} ` +
    `cost=${price} hasBigReward=${hasBigReward} remainingCoins=${account.coins} remainingGems=${account.gems}`
  );

  const lotteryGoods = drawnRewards.map((reward) => ({
    origin_award_type: AWARD_TYPE_ITEM,
    origin_award_id: reward.item_id,
    origin_award_num: 1,
    dest_award_type: AWARD_TYPE_ITEM,
    dest_award_id: reward.item_id,
    dest_award_num: 1
  }));

  return {
    lottery_goods: lotteryGoods,
    lottery_count_weekly: 1,
    next_free_time: 0,
    limit_purchase_count_one: 999,
    limit_purchase_count_ten: 999,
    not_got_num: 0,
    first_draw_reward_num: 0,
    has_big_reward: hasBigReward
  };
}

module.exports = {
  endpoint: 'PurchaseGacha',
  reqType: 'CSLotteryReq',
  resType: 'CSLotteryRes',
  handler: handlePurchaseGacha
};
