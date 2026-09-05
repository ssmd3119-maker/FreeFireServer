'use strict';

// ROOM / ROOM_CREATE_RULE (subcmd 32). The client sends this with an EMPTY body when the room
// center / room list opens (COW::UIModelCustomRoom::RequestRoomCreateRules). The response's two
// lists set IsRoomCreateRulesInited + IsRoomCreateRuleDropInited, which gate
// UIRoomListController::OnBtnRoomCreate — WITHOUT this reply the Create button does nothing for
// Normal(room_type=1) / League(room_type=2) modes (Pet Rumble tab5 / Pet Mania tab3 bypass the
// gate with client-baked rules, which is why only those worked). See docs/custom-room-design.md.
//
// The create dialog is FULLY server-driven: the mode list (GetModeIDListByRoomType), the map
// grid (GetMapIDListByGameModeAndRoomType), members/spectators and the group toggles are ALL
// built from this response — the client has no independent whitelist. So any self-consistent
// ids populate the dialog; real ids only matter for correct on-screen NAMES. We advertise Clash
// Squad: game_mode 15 (the client's squad-first CS mode) on map_id 1 (Bermuda) — the ONLY map
// our match implementation runs CS on. mapConfigId = map_id*1000 + game_mode = 1015.
const { EProtocol, ECustomRoom } = require('../protocol');

const BERMUDA_MAP = 1;     // Bermuda (Paradise) — map_id 1
const CS_MAP = 1;          // Bermuda — the CS map our match server runs; mapConfigId 1015
const BR_MODE = 1;         // game_mode 1: Battle Royale / Bermuda Classic (mapConfigId 1001)
const CS_MODE = 15;        // game_mode 15: client special-cases this as squad-first (Clash Squad)
const GROUP_SOLO = 0;      // Solo
const GROUP_DUO = 1;       // Duo
const GROUP_SQUAD = 3;     // group_mode: 0 Solo, 1 Duo, 3 Squad/Quad, 5 Hexa
const ROOM_TYPE_CASUAL = 1;
const ROOM_TYPE_LEAGUE = 2;

// Bermuda Classic (Battle Royale) create rule
function classicRule(roomType, groupMode = GROUP_SQUAD) {
  return {
    map_id: BERMUDA_MAP,
    game_mode: BR_MODE,
    group_mode: groupMode,
    members: [48, 30, 20],
    spectators: [0, 1, 2, 4, 8],
    room_type: roomType,
    min_member_cnt: 2,
    enable_voice_chat: true
  };
}

// A minimal Classic drop/preset for Battle Royale
function classicDrop(id, roomType) {
  return {
    id,
    room_type: roomType,
    drop_type: 0,
    loc_key: 'CLASSIC',
    describe_key: 'Classic Battle Royale ruleset on Bermuda.',
    unlimited_ammo_switch: 0,
    air_drop_switch: 1,
    loadout_switch: 1,
    car_drop_switch: 1,
    air_ship_switch: 1,
    ban_gun_skin_attr: 0,
    hide_enemy_fashion: 0,
    friendly_fire: 0,
    hide_hud: 0,
    revival: 1
  };
}

// One CS create rule for the given room_type (Normal / League). members[0] is the default; we
// offer 4v4 down to 1v1 (total counts) so the host can pick a team size.
function csRule(roomType) {
  return {
    map_id: CS_MAP,
    game_mode: CS_MODE,
    group_mode: GROUP_SQUAD,
    members: [8, 6, 4, 2],
    spectators: [0, 1, 2],
    room_type: roomType,
    min_member_cnt: 2,
    enable_voice_chat: true
  };
}

// A minimal CS drop/preset so IsRoomCreateRuleDropInited flips and the CS settings panel has a
// baseline. drop_type=1 routes it into the client's CS drop list. loc_key/describe_key are the
// preset's localization keys (label only — a wrong key mislabels the preset, it doesn't block).
function csDrop(id, roomType) {
  const obj = {
    id,
    room_type: roomType,
    drop_type: 1,
    loc_key: 'RoomCreateDrop_CS',
    describe_key: 'RoomCreateDropDesc_CS',
    unlimited_ammo_switch: 0,
    air_drop_switch: 0,
    loadout_switch: 1,
    car_drop_switch: 0,
    air_ship_switch: 0,
    ban_gun_skin_attr: 0,
    hide_enemy_fashion: 0,
    friendly_fire: 0,
    hide_hud: 0,
    revival: 0
  };

  if (roomType == ROOM_TYPE_CASUAL) {
    obj.loc_key = "CASUAL"
    obj.describe_key = "The casual ruleset for matches."
  }

  return obj
}

async function handler(reqObj, ctx) {
  const res = {
    room_create_rules: [
      // Bermuda Classic (Battle Royale) rules: Squad, Duo, Solo
      classicRule(ROOM_TYPE_CASUAL, GROUP_SQUAD),
      classicRule(ROOM_TYPE_CASUAL, GROUP_DUO),
      classicRule(ROOM_TYPE_CASUAL, GROUP_SOLO),
      classicRule(ROOM_TYPE_LEAGUE, GROUP_SQUAD),
      // Clash Squad rules
      csRule(ROOM_TYPE_CASUAL),
      csRule(ROOM_TYPE_LEAGUE)
    ],
    room_create_rule_drops: [
      classicDrop(1, ROOM_TYPE_CASUAL),
      csDrop(2, ROOM_TYPE_CASUAL)
    ]
  };
  ctx.logger.info(`[tcp] RoomCreateRule uid=${ctx.account.uid} -> ${res.room_create_rules.length} rules / ${res.room_create_rule_drops.length} drops`);
  return res;
}

module.exports = {
  protocol: EProtocol.ROOM,               // 14
  subcmd: ECustomRoom.ROOM_CREATE_RULE,   // 32
  // proto.RoomCreateRuleRes (package `proto`, from gen_proto.py) has the AUTHORITATIVE tag
  // numbers — the DropDesc switch fields are DropPresetState enums at non-sequential tags
  // (6/8/10/11/12/13/14/15/16/17/18/19), so hand-numbering them collides a string onto an enum
  // tag and the client's protobuf-net throws Invalid wire-type. Always use the generated type.
  resType: 'proto.RoomCreateRuleRes',
  handler
};
