'use strict';

const fs = require('fs');
const path = require('path');
const logger = require('../logger');
const { STORE_ITEMS: DEFAULT_STORE_ITEMS, LUCKY_ROYALE_WHEELS: DEFAULT_WHEELS, StoreTag } = require('../data/shopCatalog');

const DATA_DIR = path.resolve(__dirname, '../../data');
const SHOP_FILE = path.join(DATA_DIR, 'shop_catalog.json');
const GACHA_FILE = path.join(DATA_DIR, 'lucky_royale.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory caches
let storeItems = [];
let gachaWheels = [];

function loadData() {
  try {
    if (fs.existsSync(SHOP_FILE)) {
      const raw = fs.readFileSync(SHOP_FILE, 'utf8');
      storeItems = JSON.parse(raw);
    } else {
      storeItems = JSON.parse(JSON.stringify(DEFAULT_STORE_ITEMS));
      saveShopData();
    }
  } catch (err) {
    logger.error(`[shopService] Error loading shop_catalog.json: ${err.message}, falling back to defaults`);
    storeItems = JSON.parse(JSON.stringify(DEFAULT_STORE_ITEMS));
  }

  try {
    if (fs.existsSync(GACHA_FILE)) {
      const raw = fs.readFileSync(GACHA_FILE, 'utf8');
      gachaWheels = JSON.parse(raw);
    } else {
      gachaWheels = JSON.parse(JSON.stringify(DEFAULT_WHEELS));
      saveGachaData();
    }
  } catch (err) {
    logger.error(`[shopService] Error loading lucky_royale.json: ${err.message}, falling back to defaults`);
    gachaWheels = JSON.parse(JSON.stringify(DEFAULT_WHEELS));
  }

  logger.info(`[shopService] Loaded ${storeItems.length} store items and ${gachaWheels.length} lucky royale wheels`);
}

function saveShopData() {
  try {
    fs.writeFileSync(SHOP_FILE, JSON.stringify(storeItems, null, 2), 'utf8');
  } catch (err) {
    logger.error(`[shopService] Error saving shop_catalog.json: ${err.message}`);
  }
}

function saveGachaData() {
  try {
    fs.writeFileSync(GACHA_FILE, JSON.stringify(gachaWheels, null, 2), 'utf8');
  } catch (err) {
    logger.error(`[shopService] Error saving lucky_royale.json: ${err.message}`);
  }
}

// Initial load
loadData();

// ---------------------------------------------------------
// STORE CATALOG METHODS
// ---------------------------------------------------------

function getAllStoreItems(filter = {}) {
  let items = [...storeItems];

  if (filter.category && filter.category !== 'all') {
    items = items.filter((it) => it.type_override && it.type_override.startsWith(filter.category));
  }

  if (filter.tag !== undefined && filter.tag !== '' && filter.tag !== 'all') {
    const tagNum = Number(filter.tag);
    items = items.filter((it) => it.tag_type === tagNum);
  }

  if (filter.search) {
    const q = filter.search.toLowerCase().trim();
    items = items.filter(
      (it) =>
        it.name.toLowerCase().includes(q) ||
        (it.desc && it.desc.toLowerCase().includes(q)) ||
        String(it.item_id).includes(q) ||
        String(it.store_id).includes(q)
    );
  }

  return items;
}

function getStoreItemById(id) {
  const numId = Number(id);
  return storeItems.find((it) => it.store_id === numId || it.item_id === numId) || null;
}

function addStoreItem(itemData) {
  const itemId = Number(itemData.item_id);
  if (!itemId || itemId <= 0) {
    throw new Error('Valid numeric item_id is required');
  }

  const name = String(itemData.name || '').trim();
  if (!name) {
    throw new Error('Item name is required');
  }

  // Generate next store_id
  const maxStoreId = storeItems.reduce((max, it) => Math.max(max, it.store_id || 0), 100);
  const nextStoreId = maxStoreId + 1;

  const maxSortId = storeItems.reduce((max, it) => Math.max(max, it.sort_id || 0), 0);

  const newItem = {
    store_id: Number(itemData.store_id) || nextStoreId,
    sort_id: Number(itemData.sort_id) || maxSortId + 1,
    item_id: itemId,
    name: name,
    desc: String(itemData.desc || '').trim(),
    coins_price: Math.max(0, Number(itemData.coins_price || 0)),
    gems_price: Math.max(0, Number(itemData.gems_price || 0)),
    discount_price: Math.max(0, Number(itemData.discount_price || 0)),
    tag_type: Number(itemData.tag_type !== undefined ? itemData.tag_type : StoreTag.NONE),
    is_new: Boolean(itemData.is_new),
    is_recommended: Boolean(itemData.is_recommended),
    type_override: itemData.type_override || '7;0'
  };

  // Check if store_id already exists, if so generate fresh
  if (storeItems.some((it) => it.store_id === newItem.store_id)) {
    newItem.store_id = nextStoreId;
  }

  storeItems.push(newItem);
  saveShopData();
  logger.info(`[shopService] Added store item: ${newItem.name} (store_id=${newItem.store_id}, item_id=${newItem.item_id})`);
  return newItem;
}

function updateStoreItem(storeId, itemData) {
  const numStoreId = Number(storeId);
  const idx = storeItems.findIndex((it) => it.store_id === numStoreId);
  if (idx === -1) {
    throw new Error(`Store item #${storeId} not found`);
  }

  const existing = storeItems[idx];

  if (itemData.name !== undefined) existing.name = String(itemData.name).trim();
  if (itemData.desc !== undefined) existing.desc = String(itemData.desc).trim();
  if (itemData.item_id !== undefined) existing.item_id = Number(itemData.item_id);
  if (itemData.coins_price !== undefined) existing.coins_price = Math.max(0, Number(itemData.coins_price));
  if (itemData.gems_price !== undefined) existing.gems_price = Math.max(0, Number(itemData.gems_price));
  if (itemData.discount_price !== undefined) existing.discount_price = Math.max(0, Number(itemData.discount_price));
  if (itemData.tag_type !== undefined) existing.tag_type = Number(itemData.tag_type);
  if (itemData.is_new !== undefined) existing.is_new = Boolean(itemData.is_new);
  if (itemData.is_recommended !== undefined) existing.is_recommended = Boolean(itemData.is_recommended);
  if (itemData.type_override !== undefined) existing.type_override = itemData.type_override;
  if (itemData.sort_id !== undefined) existing.sort_id = Number(itemData.sort_id);

  saveShopData();
  logger.info(`[shopService] Updated store item #${numStoreId} (${existing.name})`);
  return existing;
}

function deleteStoreItem(storeId) {
  const numStoreId = Number(storeId);
  const idx = storeItems.findIndex((it) => it.store_id === numStoreId);
  if (idx === -1) {
    throw new Error(`Store item #${storeId} not found`);
  }

  const removed = storeItems.splice(idx, 1)[0];
  saveShopData();
  logger.info(`[shopService] Deleted store item #${numStoreId} (${removed.name})`);
  return removed;
}

function resetShopCatalog() {
  storeItems = JSON.parse(JSON.stringify(DEFAULT_STORE_ITEMS));
  saveShopData();
  logger.info(`[shopService] Reset store items to defaults (${storeItems.length} items)`);
  return storeItems;
}

// ---------------------------------------------------------
// LUCKY ROYALE WHEELS & PRIZE POOL METHODS
// ---------------------------------------------------------

function getAllWheels() {
  return [...gachaWheels];
}

function getWheelById(chestId) {
  const numChestId = Number(chestId);
  return gachaWheels.find((w) => w.chest_id === numChestId) || null;
}

function addWheel(wheelData) {
  const chestId = Number(wheelData.chest_id);
  if (!chestId || chestId <= 0) {
    throw new Error('Valid numeric chest_id is required');
  }

  if (gachaWheels.some((w) => w.chest_id === chestId)) {
    throw new Error(`Wheel with chest_id ${chestId} already exists`);
  }

  const chestName = String(wheelData.chest_name || '').trim();
  if (!chestName) {
    throw new Error('Wheel chest_name is required');
  }

  const newWheel = {
    chest_id: chestId,
    chest_name: chestName,
    currency_name: wheelData.coin_type === 1 ? 'Gold Coins' : 'Diamonds (Gems)',
    coin_type: Number(wheelData.coin_type) === 1 ? 1 : 2,
    once_price: Math.max(1, Number(wheelData.once_price || (wheelData.coin_type === 1 ? 300 : 60))),
    ten_price: Math.max(1, Number(wheelData.ten_price || (wheelData.coin_type === 1 ? 2700 : 540))),
    grand_prize_id: Number(wheelData.grand_prize_id || 0),
    grand_prize_name: String(wheelData.grand_prize_name || 'Jackpot Grand Prize').trim(),
    reward_items: Array.isArray(wheelData.reward_items) && wheelData.reward_items.length > 0
      ? wheelData.reward_items
      : [
          {
            item_id: Number(wheelData.grand_prize_id || 203000100),
            name: String(wheelData.grand_prize_name || 'Grand Prize Jackpot'),
            reward_level: 3,
            weight: 3
          },
          {
            item_id: 801000001,
            name: 'Gold Box Voucher',
            reward_level: 1,
            weight: 50
          }
        ]
  };

  gachaWheels.push(newWheel);
  saveGachaData();
  logger.info(`[shopService] Added lucky royale wheel: ${newWheel.chest_name} (chest_id=${newWheel.chest_id})`);
  return newWheel;
}

function updateWheel(chestId, wheelData) {
  const numChestId = Number(chestId);
  const wheel = gachaWheels.find((w) => w.chest_id === numChestId);
  if (!wheel) {
    throw new Error(`Wheel with chest_id ${chestId} not found`);
  }

  if (wheelData.chest_name !== undefined) wheel.chest_name = String(wheelData.chest_name).trim();
  if (wheelData.coin_type !== undefined) {
    wheel.coin_type = Number(wheelData.coin_type) === 1 ? 1 : 2;
    wheel.currency_name = wheel.coin_type === 1 ? 'Gold Coins' : 'Diamonds (Gems)';
  }
  if (wheelData.once_price !== undefined) wheel.once_price = Math.max(1, Number(wheelData.once_price));
  if (wheelData.ten_price !== undefined) wheel.ten_price = Math.max(1, Number(wheelData.ten_price));
  if (wheelData.grand_prize_id !== undefined) wheel.grand_prize_id = Number(wheelData.grand_prize_id);
  if (wheelData.grand_prize_name !== undefined) wheel.grand_prize_name = String(wheelData.grand_prize_name).trim();

  saveGachaData();
  logger.info(`[shopService] Updated wheel #${numChestId} (${wheel.chest_name})`);
  return wheel;
}

function deleteWheel(chestId) {
  const numChestId = Number(chestId);
  if (gachaWheels.length <= 1) {
    throw new Error('Cannot delete the last remaining Lucky Royale wheel');
  }

  const idx = gachaWheels.findIndex((w) => w.chest_id === numChestId);
  if (idx === -1) {
    throw new Error(`Wheel with chest_id ${chestId} not found`);
  }

  const removed = gachaWheels.splice(idx, 1)[0];
  saveGachaData();
  logger.info(`[shopService] Deleted wheel #${numChestId} (${removed.chest_name})`);
  return removed;
}

function addWheelReward(chestId, rewardData) {
  const numChestId = Number(chestId);
  const wheel = gachaWheels.find((w) => w.chest_id === numChestId);
  if (!wheel) {
    throw new Error(`Wheel with chest_id ${chestId} not found`);
  }

  const itemId = Number(rewardData.item_id);
  if (!itemId || itemId <= 0) {
    throw new Error('Valid numeric item_id is required');
  }

  const name = String(rewardData.name || '').trim();
  if (!name) {
    throw new Error('Reward item name is required');
  }

  if (wheel.reward_items.some((r) => r.item_id === itemId)) {
    throw new Error(`Item #${itemId} is already present in this wheel's prize pool`);
  }

  const reward = {
    item_id: itemId,
    name: name,
    reward_level: Math.min(3, Math.max(1, Number(rewardData.reward_level || 1))),
    weight: Math.max(1, Number(rewardData.weight || 10))
  };

  wheel.reward_items.push(reward);
  saveGachaData();
  logger.info(`[shopService] Added reward ${reward.name} (#${itemId}) to wheel #${numChestId}`);
  return reward;
}

function updateWheelReward(chestId, itemId, rewardData) {
  const numChestId = Number(chestId);
  const numItemId = Number(itemId);
  const wheel = gachaWheels.find((w) => w.chest_id === numChestId);
  if (!wheel) {
    throw new Error(`Wheel with chest_id ${chestId} not found`);
  }

  const reward = wheel.reward_items.find((r) => r.item_id === numItemId);
  if (!reward) {
    throw new Error(`Item #${itemId} not found in wheel #${chestId}`);
  }

  if (rewardData.name !== undefined) reward.name = String(rewardData.name).trim();
  if (rewardData.reward_level !== undefined) {
    reward.reward_level = Math.min(3, Math.max(1, Number(rewardData.reward_level)));
  }
  if (rewardData.weight !== undefined) {
    reward.weight = Math.max(1, Number(rewardData.weight));
  }

  saveGachaData();
  logger.info(`[shopService] Updated reward #${numItemId} in wheel #${numChestId}`);
  return reward;
}

function deleteWheelReward(chestId, itemId) {
  const numChestId = Number(chestId);
  const numItemId = Number(itemId);
  const wheel = gachaWheels.find((w) => w.chest_id === numChestId);
  if (!wheel) {
    throw new Error(`Wheel with chest_id ${chestId} not found`);
  }

  if (wheel.reward_items.length <= 1) {
    throw new Error('A wheel must contain at least 1 prize in its pool');
  }

  const idx = wheel.reward_items.findIndex((r) => r.item_id === numItemId);
  if (idx === -1) {
    throw new Error(`Item #${itemId} not found in wheel #${chestId}`);
  }

  const removed = wheel.reward_items.splice(idx, 1)[0];
  saveGachaData();
  logger.info(`[shopService] Removed reward #${numItemId} (${removed.name}) from wheel #${numChestId}`);
  return removed;
}

function simulateSpin(chestId, count = 1) {
  const numChestId = Number(chestId || 1001);
  const wheel = gachaWheels.find((w) => w.chest_id === numChestId) || gachaWheels[0];
  if (!wheel || !wheel.reward_items || wheel.reward_items.length === 0) {
    throw new Error('No rewards configured for this wheel');
  }

  const spinCount = Math.min(50, Math.max(1, Number(count)));
  const totalWeight = wheel.reward_items.reduce((acc, it) => acc + (it.weight || 10), 0);
  const drops = [];
  let hasJackpot = false;

  for (let i = 0; i < spinCount; i += 1) {
    let r = Math.floor(Math.random() * totalWeight);
    let chosen = wheel.reward_items[0];
    for (const it of wheel.reward_items) {
      const w = it.weight || 10;
      if (r < w) {
        chosen = it;
        break;
      }
      r -= w;
    }
    drops.push(chosen);
    if (chosen.reward_level >= 3 || chosen.item_id === wheel.grand_prize_id) {
      hasJackpot = true;
    }
  }

  return {
    wheel_id: wheel.chest_id,
    wheel_name: wheel.chest_name,
    count: spinCount,
    has_jackpot: hasJackpot,
    drops
  };
}

// ---------------------------------------------------------
// MALL TABS CONFIGURATION (for CSGetStoreTabRes & LoginDescRes)
// ---------------------------------------------------------

function getStoreTabs() {
  return [
    // MallTypeNormal (1)
    { table_type: 1, language: 'default', table_name: 'T_MALL_TAB_RECOMMEND', mall_type: 1, sort_id: 1 },
    { table_type: 7, language: 'default', table_name: 'T_MALL_TAB_CHARACTER', mall_type: 1, sort_id: 2 },
    { table_type: 8, language: 'default', table_name: 'T_MALL_TAB_BUNDLE', mall_type: 1, sort_id: 3 },
    { table_type: 6, language: 'default', table_name: 'T_MALL_TAB_FASHION', mall_type: 1, sort_id: 4 },
    { table_type: 9, language: 'default', table_name: 'T_MALL_TAB_WEAPON', mall_type: 1, sort_id: 5 },
    { table_type: 12, language: 'default', table_name: 'T_MALL_TAB_PET', mall_type: 1, sort_id: 6 },
    { table_type: 11, language: 'default', table_name: 'T_MALL_TAB_COLLECTION', mall_type: 1, sort_id: 7 },
    { table_type: 10, language: 'default', table_name: 'T_MALL_TAB_ITEM', mall_type: 1, sort_id: 8 },

    // MallTypeWeapon (2)
    { table_type: 3, language: 'default', table_name: 'T_16_W_LEGENDBOX', mall_type: 2, sort_id: 1 },
    { table_type: 9, language: 'default', table_name: 'T_MALL_TAB_WEAPON', mall_type: 2, sort_id: 2 },

    // MallTypeBox (3)
    { table_type: 3, language: 'default', table_name: 'T_MALL_TAB_BOX', mall_type: 3, sort_id: 1 },

    // MallTypeGift (4)
    { table_type: 4, language: 'default', table_name: 'T_MALL_TAB_GIFT', mall_type: 4, sort_id: 1 },

    // MallTypeExchange (5)
    { table_type: 5, language: 'default', table_name: 'T_MALL_TAB_EXCHANGE', mall_type: 5, sort_id: 1 }
  ];
}

module.exports = {
  StoreTag,
  getAllStoreItems,
  getStoreItemById,
  addStoreItem,
  updateStoreItem,
  deleteStoreItem,
  resetShopCatalog,
  getAllWheels,
  getWheelById,
  addWheel,
  updateWheel,
  deleteWheel,
  addWheelReward,
  updateWheelReward,
  deleteWheelReward,
  simulateSpin,
  getStoreTabs
};
