'use strict';

/**
 * Free Fire Store & Lucky Royale Catalog
 * Modeled from Free Fire 1.70 item specifications, dump.cs enums and protobuf definitions.
 */

// Tag types matching StoreTag enum in dump.cs
const StoreTag = {
  NONE: 0,
  DISCOUNT: 1,
  HOT: 2,
  NEW: 3,
  LIMITEDTIME: 4
};

// Store items catalog
const STORE_ITEMS = [
  // --- Avatars / Characters (Tab 7) ---
  {
    store_id: 101,
    sort_id: 1,
    item_id: 102000004,
    name: 'DJ Alok',
    desc: 'Drop the Beat: Creates a 5m aura that increases speed and heals 5 HP/sec for 10s',
    coins_price: 0,
    gems_price: 599,
    tag_type: StoreTag.HOT,
    is_new: false,
    is_recommended: true,
    type_override: '7;0'
  },
  {
    store_id: 102,
    sort_id: 2,
    item_id: 102000029,
    name: 'Chrono',
    desc: 'Time Turner: Creates a force field that blocks incoming fire and boosts movement',
    coins_price: 0,
    gems_price: 599,
    tag_type: StoreTag.HOT,
    is_new: false,
    is_recommended: true,
    type_override: '7;0'
  },
  {
    store_id: 103,
    sort_id: 3,
    item_id: 102000027,
    name: 'K (Captain Booyah)',
    desc: 'Master of All: Max EP increases by 50, toggle between Jiu-Jitsu and Psychology modes',
    coins_price: 0,
    gems_price: 599,
    tag_type: StoreTag.NEW,
    is_new: true,
    is_recommended: true,
    type_override: '7;0'
  },
  {
    store_id: 104,
    sort_id: 4,
    item_id: 101000030,
    name: 'Skyler',
    desc: 'Riptide Rhythm: Unleashes sonic wave destroying Gloo Walls; heals on Gloo placement',
    coins_price: 0,
    gems_price: 599,
    tag_type: StoreTag.NEW,
    is_new: true,
    is_recommended: true,
    type_override: '7;0'
  },
  {
    store_id: 105,
    sort_id: 5,
    item_id: 101000014,
    name: 'Hayato',
    desc: 'Bushido: Armor penetration increases as current HP decreases',
    coins_price: 8000,
    gems_price: 499,
    tag_type: StoreTag.HOT,
    is_new: false,
    is_recommended: true,
    type_override: '7;0'
  },
  {
    store_id: 106,
    sort_id: 6,
    item_id: 102000013,
    name: 'Moco',
    desc: 'Hacker Eye: Tags enemies shot for 5 seconds, sharing info with teammates',
    coins_price: 8000,
    gems_price: 399,
    tag_type: StoreTag.NONE,
    is_new: false,
    is_recommended: false,
    type_override: '7;0'
  },
  {
    store_id: 107,
    sort_id: 7,
    item_id: 102000005,
    name: 'Kelly',
    desc: 'Dash: Increases sprinting speed by 6%',
    coins_price: 2000,
    gems_price: 199,
    tag_type: StoreTag.NONE,
    is_new: false,
    is_recommended: false,
    type_override: '7;0'
  },
  {
    store_id: 108,
    sort_id: 8,
    item_id: 101000005,
    name: 'Andrew',
    desc: 'Armor Specialist: Reduces vest durability loss by 12%',
    coins_price: 2000,
    gems_price: 199,
    tag_type: StoreTag.NONE,
    is_new: false,
    is_recommended: false,
    type_override: '7;0'
  },
  {
    store_id: 109,
    sort_id: 9,
    item_id: 101000008,
    name: 'Kla',
    desc: 'Muay Thai: Fist damage increased by 400%',
    coins_price: 2000,
    gems_price: 199,
    tag_type: StoreTag.NONE,
    is_new: false,
    is_recommended: false,
    type_override: '7;0'
  },
  {
    store_id: 110,
    sort_id: 10,
    item_id: 102000008,
    name: 'Maxim',
    desc: 'Gluttony: Consumes mushrooms and uses medkits 25% faster',
    coins_price: 2000,
    gems_price: 199,
    tag_type: StoreTag.NONE,
    is_new: false,
    is_recommended: false,
    type_override: '7;0'
  },

  // --- Bundles & Outfits (Tab 8) ---
  {
    store_id: 201,
    sort_id: 11,
    item_id: 203000181,
    name: 'Sakura Kimono Bundle',
    desc: 'Legendary ceremonial blossom armor set with glowing petals',
    coins_price: 0,
    gems_price: 1199,
    tag_type: StoreTag.HOT,
    is_new: false,
    is_recommended: true,
    type_override: '8;3'
  },
  {
    store_id: 202,
    sort_id: 12,
    item_id: 203000166,
    name: 'Top Criminal (Red)',
    desc: 'Iconic masked red outlaw jumpsuit worn by top tier competitors',
    coins_price: 0,
    gems_price: 1499,
    tag_type: StoreTag.HOT,
    is_new: false,
    is_recommended: true,
    type_override: '8;3'
  },
  {
    store_id: 203,
    sort_id: 13,
    item_id: 203000092,
    name: 'Arctic Blue Bundle',
    desc: 'Cryogenic neon battle suit with animated frost particles',
    coins_price: 0,
    gems_price: 999,
    tag_type: StoreTag.DISCOUNT,
    discount_price: 799,
    is_new: false,
    is_recommended: true,
    type_override: '8;3'
  },
  {
    store_id: 204,
    sort_id: 14,
    item_id: 203000001,
    name: 'Hip Hop Streetwear',
    desc: 'Original Season 2 hip hop jacket, snapback cap and sneakers',
    coins_price: 0,
    gems_price: 899,
    tag_type: StoreTag.NONE,
    is_new: false,
    is_recommended: false,
    type_override: '8;3'
  },
  {
    store_id: 205,
    sort_id: 15,
    item_id: 201000001,
    name: 'Bunny Warrior Mask',
    desc: 'Combat helmet featuring menacing rabbit ears and metallic finish',
    coins_price: 5000,
    gems_price: 299,
    tag_type: StoreTag.NONE,
    is_new: false,
    is_recommended: false,
    type_override: '8;1'
  },

  // --- Weapons & Weapon Crates (Tab 9) ---
  {
    store_id: 301,
    sort_id: 16,
    item_id: 902000062,
    name: 'AK47 - Blue Flame Draco',
    desc: 'Evolution Gun: Blue draconic scales, firing animation, and custom kill announcement',
    coins_price: 0,
    gems_price: 1099,
    tag_type: StoreTag.HOT,
    is_new: false,
    is_recommended: true,
    type_override: '9;0'
  },
  {
    store_id: 302,
    sort_id: 17,
    item_id: 907000010,
    name: 'MP40 - Predatory Cobra',
    desc: 'Evolution Gun: Venomous cobra theme with increased fire rate and toxic reload effect',
    coins_price: 0,
    gems_price: 1099,
    tag_type: StoreTag.HOT,
    is_new: true,
    is_recommended: true,
    type_override: '9;0'
  },
  {
    store_id: 303,
    sort_id: 18,
    item_id: 901000036,
    name: 'AWM - Duke Swallowtail',
    desc: 'Aristocratic golden sniper rifle featuring increased damage and extra range',
    coins_price: 0,
    gems_price: 699,
    tag_type: StoreTag.DISCOUNT,
    discount_price: 499,
    is_new: false,
    is_recommended: true,
    type_override: '9;0'
  },
  {
    store_id: 304,
    sort_id: 19,
    item_id: 907000012,
    name: 'SCAR - Megalodon Alpha',
    desc: 'Apex predator assault rifle with shark jaw sights and hydrodynamic tracers',
    coins_price: 0,
    gems_price: 999,
    tag_type: StoreTag.NEW,
    is_new: true,
    is_recommended: false,
    type_override: '9;0'
  },
  {
    store_id: 305,
    sort_id: 20,
    item_id: 9,
    name: 'Desert Eagle - Golden Sheriff',
    desc: 'Gilded high-damage sidearm with engraved western patterns',
    coins_price: 6000,
    gems_price: 199,
    tag_type: StoreTag.NONE,
    is_new: false,
    is_recommended: false,
    type_override: '9;0'
  },

  // --- Collection & Emotes (Tab 11) ---
  {
    store_id: 401,
    sort_id: 21,
    item_id: 901000001,
    name: 'Tea Time Emote',
    desc: 'Pulls out an ornate golden table and takes a sip of afternoon tea',
    coins_price: 0,
    gems_price: 599,
    tag_type: StoreTag.HOT,
    is_new: false,
    is_recommended: true,
    type_override: '11;4'
  },
  {
    store_id: 402,
    sort_id: 22,
    item_id: 901000002,
    name: 'Flower of Love Emote',
    desc: 'Kneels down and offers an ethereal glowing red rose',
    coins_price: 0,
    gems_price: 499,
    tag_type: StoreTag.HOT,
    is_new: false,
    is_recommended: true,
    type_override: '11;4'
  },
  {
    store_id: 403,
    sort_id: 23,
    item_id: 901000003,
    name: 'LOL Emote',
    desc: 'Point and burst out laughing at your opponents',
    coins_price: 0,
    gems_price: 399,
    tag_type: StoreTag.HOT,
    is_new: false,
    is_recommended: false,
    type_override: '11;4'
  },
  {
    store_id: 404,
    sort_id: 24,
    item_id: 901000004,
    name: 'Dab Emote',
    desc: 'Execute a sharp victory dab',
    coins_price: 5000,
    gems_price: 199,
    tag_type: StoreTag.NONE,
    is_new: false,
    is_recommended: false,
    type_override: '11;4'
  },
  {
    store_id: 405,
    sort_id: 25,
    item_id: 902000001,
    name: 'Dragon Backpack Lv.3',
    desc: 'Backpack encased in a gold-plated eastern dragon that breathes fire',
    coins_price: 0,
    gems_price: 399,
    tag_type: StoreTag.HOT,
    is_new: false,
    is_recommended: false,
    type_override: '11;1'
  },
  {
    store_id: 406,
    sort_id: 26,
    item_id: 904000001,
    name: 'Flame Skyboard',
    desc: 'High velocity jet surfboard with trailing fiery exhaust',
    coins_price: 0,
    gems_price: 299,
    tag_type: StoreTag.NONE,
    is_new: false,
    is_recommended: false,
    type_override: '11;3'
  },

  // --- Pets (Tab 12) ---
  {
    store_id: 501,
    sort_id: 27,
    item_id: 906000001,
    name: 'Pet Ottero',
    desc: 'Double Blubber: Using Treatment Gun or Medkit restores EP equivalent to 65% of HP restored',
    coins_price: 0,
    gems_price: 499,
    tag_type: StoreTag.HOT,
    is_new: false,
    is_recommended: true,
    type_override: '12;0'
  },
  {
    store_id: 502,
    sort_id: 28,
    item_id: 906000002,
    name: 'Pet Falco',
    desc: 'Skyline Spree: 45% increase in gliding speed upon skydive; 50% increase in diving speed',
    coins_price: 0,
    gems_price: 499,
    tag_type: StoreTag.HOT,
    is_new: false,
    is_recommended: true,
    type_override: '12;0'
  },
  {
    store_id: 503,
    sort_id: 29,
    item_id: 906000005,
    name: 'Detective Panda',
    desc: 'Panda Blessings: Restores 10 HP immediately after each kill',
    coins_price: 8000,
    gems_price: 399,
    tag_type: StoreTag.NONE,
    is_new: false,
    is_recommended: false,
    type_override: '12;0'
  },

  // --- Consumables & Vouchers (Tab 10) ---
  {
    store_id: 601,
    sort_id: 30,
    item_id: 301000001,
    name: 'Diamond Royale Voucher',
    desc: 'Redeem for 1 Lucky Royale Diamond spin',
    coins_price: 0,
    gems_price: 60,
    tag_type: StoreTag.NONE,
    is_new: false,
    is_recommended: false,
    type_override: '10;0'
  },
  {
    store_id: 602,
    sort_id: 31,
    item_id: 301000002,
    name: 'Weapon Royale Voucher',
    desc: 'Redeem for 1 Lucky Royale Weapon spin',
    coins_price: 0,
    gems_price: 50,
    tag_type: StoreTag.NONE,
    is_new: false,
    is_recommended: false,
    type_override: '10;0'
  },
  {
    store_id: 603,
    sort_id: 32,
    item_id: 301000003,
    name: 'Incubator Voucher',
    desc: 'Redeem for 1 Lucky Royale Incubator spin',
    coins_price: 0,
    gems_price: 60,
    tag_type: StoreTag.NONE,
    is_new: false,
    is_recommended: false,
    type_override: '10;0'
  },
  {
    store_id: 604,
    sort_id: 33,
    item_id: 301000004,
    name: 'Custom Room Card',
    desc: 'Allows host to create 1 private custom room (Classic, Ranked or Clash Squad)',
    coins_price: 0,
    gems_price: 100,
    tag_type: StoreTag.HOT,
    is_new: false,
    is_recommended: true,
    type_override: '10;0'
  },
  {
    store_id: 605,
    sort_id: 34,
    item_id: 301000005,
    name: 'Name Change Card',
    desc: 'Single use item allowing player nickname modification',
    coins_price: 0,
    gems_price: 39,
    tag_type: StoreTag.NONE,
    is_new: false,
    is_recommended: false,
    type_override: '10;0'
  }
];

// Lucky Royale Wheels catalog
const LUCKY_ROYALE_WHEELS = [
  {
    chest_id: 1001,
    chest_name: 'Diamond Royale',
    currency_name: 'Diamonds (Gems)',
    coin_type: 2, // GEMS
    once_price: 60,
    ten_price: 540,
    grand_prize_id: 203000181,
    grand_prize_name: 'Sakura Kimono Bundle',
    jackpot_glow: 3,
    reward_items: [
      { item_id: 203000181, name: 'Sakura Kimono Bundle', reward_level: 3, weight: 5 },
      { item_id: 203000001, name: 'Hip Hop Top', reward_level: 2, weight: 15 },
      { item_id: 204000001, name: 'Hip Hop Bottom', reward_level: 2, weight: 20 },
      { item_id: 205000001, name: 'Hip Hop Shoes', reward_level: 1, weight: 25 },
      { item_id: 211000000, name: 'Hip Hop Cap', reward_level: 1, weight: 30 },
      { item_id: 902000001, name: 'Dragon Backpack Lv.3', reward_level: 2, weight: 15 },
      { item_id: 301000001, name: 'Diamond Royale Voucher', reward_level: 1, weight: 50 },
      { item_id: 102000006, name: 'Olivia Character', reward_level: 1, weight: 40 },
      { item_id: 301000005, name: 'Name Change Card', reward_level: 1, weight: 20 }
    ]
  },
  {
    chest_id: 1002,
    chest_name: 'Gold Royale',
    currency_name: 'Gold (Coins)',
    coin_type: 1, // COINS
    once_price: 300,
    ten_price: 3000,
    grand_prize_id: 203000092,
    grand_prize_name: 'Arctic Blue Bundle',
    jackpot_glow: 3,
    reward_items: [
      { item_id: 203000092, name: 'Arctic Blue Set', reward_level: 3, weight: 8 },
      { item_id: 201000001, name: 'Bunny Warrior Mask', reward_level: 2, weight: 20 },
      { item_id: 101000005, name: 'Andrew Character', reward_level: 1, weight: 35 },
      { item_id: 102000005, name: 'Kelly Character', reward_level: 1, weight: 35 },
      { item_id: 101000008, name: 'Kla Character', reward_level: 1, weight: 35 },
      { item_id: 901000004, name: 'Dab Emote', reward_level: 2, weight: 20 },
      { item_id: 901000005, name: 'Applause Emote', reward_level: 1, weight: 40 }
    ]
  },
  {
    chest_id: 1003,
    chest_name: 'Weapon Royale',
    currency_name: 'Diamonds (Gems)',
    coin_type: 2, // GEMS
    once_price: 50,
    ten_price: 500,
    grand_prize_id: 902000062,
    grand_prize_name: 'AK47 - Blue Flame Draco',
    jackpot_glow: 3,
    reward_items: [
      { item_id: 902000062, name: 'AK47 - Blue Flame Draco', reward_level: 3, weight: 5 },
      { item_id: 907000010, name: 'MP40 - Predatory Cobra', reward_level: 3, weight: 5 },
      { item_id: 901000036, name: 'AWM - Duke Swallowtail', reward_level: 2, weight: 15 },
      { item_id: 907000012, name: 'SCAR - Megalodon Alpha', reward_level: 2, weight: 15 },
      { item_id: 9, name: 'Desert Eagle - Golden Sheriff', reward_level: 1, weight: 30 },
      { item_id: 301000002, name: 'Weapon Royale Voucher', reward_level: 1, weight: 50 }
    ]
  },
  {
    chest_id: 1004,
    chest_name: 'Incubator',
    currency_name: 'Diamonds (Gems)',
    coin_type: 2, // GEMS
    once_price: 60,
    ten_price: 270,
    grand_prize_id: 203000166,
    grand_prize_name: 'Top Criminal (Red) Blueprint',
    jackpot_glow: 3,
    reward_items: [
      { item_id: 203000166, name: 'Top Criminal (Red) Blueprint', reward_level: 3, weight: 4 },
      { item_id: 301000003, name: 'Evolution Stone', reward_level: 2, weight: 16 },
      { item_id: 301000001, name: 'Incubator Voucher', reward_level: 1, weight: 40 },
      { item_id: 902000003, name: 'Shadow Wings', reward_level: 2, weight: 15 },
      { item_id: 904000001, name: 'Flame Skyboard', reward_level: 1, weight: 35 }
    ]
  },
  {
    chest_id: 1005,
    chest_name: 'Faded Wheel',
    currency_name: 'Diamonds (Gems)',
    coin_type: 2, // GEMS
    once_price: 40,
    ten_price: 360,
    grand_prize_id: 901000001,
    grand_prize_name: 'Tea Time Emote',
    jackpot_glow: 3,
    reward_items: [
      { item_id: 901000001, name: 'Tea Time Emote', reward_level: 3, weight: 6 },
      { item_id: 901000002, name: 'Flower of Love Emote', reward_level: 2, weight: 14 },
      { item_id: 901000003, name: 'LOL Emote', reward_level: 2, weight: 20 },
      { item_id: 906000001, name: 'Pet Ottero', reward_level: 2, weight: 15 },
      { item_id: 906000002, name: 'Pet Falco', reward_level: 2, weight: 15 },
      { item_id: 301000004, name: 'Custom Room Card', reward_level: 1, weight: 30 }
    ]
  }
];

module.exports = {
  StoreTag,
  STORE_ITEMS,
  LUCKY_ROYALE_WHEELS
};
