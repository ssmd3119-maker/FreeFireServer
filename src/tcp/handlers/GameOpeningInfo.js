'use strict';

/**
 * MATCHMAKING / GAMEOPENINGINFO  (GameOpeningInfoReq -> GameOpeningInfoRes)
 *
 * The client asks which game modes are currently open (right after connecting,
 * and when opening the mode-select screen). We advertise a single mode:
 *   map_id 1 (Paradise) + game_mode 15 (CS / ContraSquad)  -> config row 1015.
 * (see protocol/gamemode_and_map_config.txt)
 *
 * game_mode_name_list / mode_level_limit_list / ranking_level_limit_list are
 * optional and omitted; the client does not require them.
 */

const { EProtocol, EMatchmaking } = require('../protocol');

// Currently open game modes.
// map_id 1 (Paradise/Bermuda) + game_mode 1 (Battle Royale / Classic) -> config row 1001
// map_id 1 (Paradise/Bermuda) + game_mode 1 (BR Ranked)               -> config row 1001
// map_id 1 (Paradise/Bermuda) + game_mode 15 (CS / Clash Squad)       -> config row 1015
// map_id 1 (Paradise/Bermuda) + game_mode 15 (CS Ranked)              -> config row 1015
// map_id 7 (AlphaIsland)      + game_mode 23 (Training Ground)       -> config row 7023
// (see protocol/gamemode_and_map_config.txt and dump.cs: GameMode_Training = 23, MatchMode_TRAINING = 5)
const OPEN_MODES = [
  {
    map_id: 1,
    name: 'Bermuda Classic',
    game_mode: 1, // Bermuda Classic (Battle Royale)
    match_mode: 1, // CASUAL
    sort_id: 1,
    start_time: '00:00',
    end_time: '23:59',
    is_new: false,
    is_live_open: true,
    config_start_time: '2020-01-01 00:00:00',
    config_end_time: '2030-12-31 23:59:59',
    weekday: '1;2;3;4;5;6;7',
    tips: 'Battle Royale Classic',
    language: 'en',
    limited_count: 0,
    tag: 1,
    difficulty: '1',
    visual_map: 'https://foices.github.io/minhas_resources/bermuda.png'
  },
  {
    map_id: 1,
    name: 'Bermuda Ranked',
    game_mode: 1, // Bermuda Ranked (Battle Royale)
    match_mode: 2, // RANKING
    sort_id: 2,
    start_time: '00:00',
    end_time: '23:59',
    is_new: false,
    is_live_open: true,
    config_start_time: '2020-01-01 00:00:00',
    config_end_time: '2030-12-31 23:59:59',
    weekday: '1;2;3;4;5;6;7',
    tips: 'Ranked Survival',
    language: 'en',
    limited_count: 0,
    tag: 2,
    difficulty: '1',
    visual_map: 'https://foices.github.io/minhas_resources/bermuda.png'
  },
  { 
    map_id: 1, 
    name: 'Clash Squad',
    game_mode: 15, // Clash Squad
    match_mode: 1, 
    sort_id: 3, 
    start_time: '00:00',
    end_time: '23:59',
    is_new: false,
    is_live_open: true,
    config_start_time: '2020-01-01 00:00:00',
    config_end_time: '2030-12-31 23:59:59',
    weekday: '1;2;3;4;5;6;7',
    tips: 'Round-based 4v4 Combat',
    language: 'en',
    limited_count: 0,
    tag: 1,
    difficulty: '1',
    visual_map: 'https://foices.github.io/minhas_resources/contra_squad.png'
  },
  {
    map_id: 1,
    name: 'Clash Squad Ranked',
    game_mode: 15, // CS Ranked
    match_mode: 6, // CSRANKING
    sort_id: 4,
    start_time: '00:00',
    end_time: '23:59',
    is_new: false,
    is_live_open: true,
    config_start_time: '2020-01-01 00:00:00',
    config_end_time: '2030-12-31 23:59:59',
    weekday: '1;2;3;4;5;6;7',
    tips: 'CS Ranked 4v4',
    language: 'en',
    limited_count: 0,
    tag: 2,
    difficulty: '1',
    visual_map: 'https://foices.github.io/minhas_resources/contra_squad.png'
  },
  {
    map_id: 7, // EMapAlphaIsland
    name: 'Training Grounds',
    game_mode: 23, // GameMode_Training
    match_mode: 5, // MatchMode_TRAINING
    sort_id: 5,
    start_time: '00:00',
    end_time: '23:59',
    is_new: true,
    is_live_open: true,
    config_start_time: '2020-01-01 00:00:00',
    config_end_time: '2030-12-31 23:59:59',
    weekday: '1;2;3;4;5;6;7',
    tips: 'Combat & Target Practice',
    language: 'en',
    limited_count: 0,
    tag: 3,
    difficulty: '1',
    visual_map: 'https://foices.github.io/minhas_resources/training.png'
  }
];

function handler(reqObj, ctx) {
  const lang = reqObj.language || 'en';
  ctx.logger.info(
    `[tcp] GameOpeningInfo region="${reqObj.region || ''}" lang="${lang}" ` +
    `-> ${OPEN_MODES.length} open mode(s)`
  );
  return {
    opening_info_list: { gameOpeningInfos: OPEN_MODES },
    // server timezone offset (east of UTC) in seconds; only relevant to timed
    // events, of which we advertise none.
    timezone_offset_secs: -new Date().getTimezoneOffset() * 60,
    game_mode_name_list: {
      game_mode_names: [
        { mode_id: 1, language: lang, translation: 'Battle Royale' },
        { mode_id: 15, language: lang, translation: 'Clash Squad' },
        { mode_id: 23, language: lang, translation: 'Training Ground' }
      ]
    },
    mode_level_limit_list: {
      mode_level_limits: [
        { map_id: 1, game_mode: 1, level: 1 },
        { map_id: 1, game_mode: 15, level: 1 },
        { map_id: 7, game_mode: 23, level: 1 }
      ]
    },
    ranking_level_limit_list: {
      ranking_level_limits: [
        { match_mode: 1, game_mode: 1, guest_level: 1, normal_level: 1, guest_register_need_time: 0, normal_register_need_time: 0 },
        { match_mode: 2, game_mode: 1, guest_level: 1, normal_level: 1, guest_register_need_time: 0, normal_register_need_time: 0 },
        { match_mode: 1, game_mode: 15, guest_level: 1, normal_level: 1, guest_register_need_time: 0, normal_register_need_time: 0 },
        { match_mode: 6, game_mode: 15, guest_level: 1, normal_level: 1, guest_register_need_time: 0, normal_register_need_time: 0 },
        { match_mode: 5, game_mode: 23, guest_level: 1, normal_level: 1, guest_register_need_time: 0, normal_register_need_time: 0 }
      ]
    }
  };
}

module.exports = {
  protocol: EProtocol.MATCHMAKING,        // 3
  subcmd: EMatchmaking.GAMEOPENINGINFO,   // 7
  reqType: 'GameOpeningInfoReq',
  resType: 'GameOpeningInfoRes',
  handler
};
