'use strict';

/**
 * Global Ranking Service for Free Fire Server
 * Tracks and serves global player rankings across:
 *  - Bermuda (Battle Royale Mode: Rank points, Kills, Booyahs/Wins)
 *  - Clash Squad (CS 4v4 Mode: CS Stars/Score, Kills, Round/Match Wins)
 */

const playerDb = require('../db/player');
const accounts = require('../db/accounts');
const logger = require('../logger');

// Ranking Constants
const SEASON_ID = 7;
const CS_SEASON_ID = 7;

// Ranked Tier Definitions (Free Fire Standard)
const TIERS = {
  1: { id: 1, name: 'Bronze', code: 'BRONZE', color: '#CD7F32', bg: 'bg-amber-900/30 text-amber-500 border-amber-700/50', icon: '🥉' },
  2: { id: 2, name: 'Silver', code: 'SILVER', color: '#C0C0C0', bg: 'bg-slate-700/40 text-slate-300 border-slate-500/50', icon: '🥈' },
  3: { id: 3, name: 'Gold', code: 'GOLD', color: '#FFD700', bg: 'bg-yellow-900/30 text-yellow-400 border-yellow-600/50', icon: '🥇' },
  4: { id: 4, name: 'Platinum', code: 'PLATINUM', color: '#00CED1', bg: 'bg-cyan-900/30 text-cyan-400 border-cyan-600/50', icon: '🛡️' },
  5: { id: 5, name: 'Diamond', code: 'DIAMOND', color: '#9370DB', bg: 'bg-purple-900/30 text-purple-300 border-purple-500/50', icon: '💎' },
  6: { id: 6, name: 'Heroic', code: 'HEROIC', color: '#FF4500', bg: 'bg-red-900/40 text-red-400 border-red-500/60', icon: '⚔️' },
  7: { id: 7, name: 'Grandmaster', code: 'GRANDMASTER', color: '#FFA500', bg: 'bg-amber-500/20 text-amber-300 border-amber-400/80 shadow-amber-500/20 shadow-lg', icon: '👑' }
};

// Thresholds
const BERMUDA_THRESHOLDS = {
  BRONZE: 1000,
  SILVER: 1300,
  GOLD: 1600,
  PLATINUM: 2100,
  DIAMOND: 2600,
  HEROIC: 3200,
  GRANDMASTER: 4000
};

const CS_THRESHOLDS = {
  BRONZE: 0,
  SILVER: 5,
  GOLD: 10,
  PLATINUM: 20,
  DIAMOND: 30,
  HEROIC: 50,
  GRANDMASTER: 80
};

function calculateBermudaTier(points) {
  const p = Number(points) || 1000;
  if (p >= BERMUDA_THRESHOLDS.GRANDMASTER) return 7;
  if (p >= BERMUDA_THRESHOLDS.HEROIC) return 6;
  if (p >= BERMUDA_THRESHOLDS.DIAMOND) return 5;
  if (p >= BERMUDA_THRESHOLDS.PLATINUM) return 4;
  if (p >= BERMUDA_THRESHOLDS.GOLD) return 3;
  if (p >= BERMUDA_THRESHOLDS.SILVER) return 2;
  return 1;
}

function calculateCSTier(stars) {
  const s = Number(stars) || 0;
  if (s >= CS_THRESHOLDS.GRANDMASTER) return 7;
  if (s >= CS_THRESHOLDS.HEROIC) return 6;
  if (s >= CS_THRESHOLDS.DIAMOND) return 5;
  if (s >= CS_THRESHOLDS.PLATINUM) return 4;
  if (s >= CS_THRESHOLDS.GOLD) return 3;
  if (s >= CS_THRESHOLDS.SILVER) return 2;
  return 1;
}

// Pre-seeded competitive world-class players to populate global leaderboards if db has few accounts
const SEED_PLAYERS = [
  {
    open_id: 'seed-nobru-01',
    nickname: 'FLUXO_Nobru',
    region: 'BR',
    level: 98,
    ranking_points: 4680,
    kills: 1420,
    wins: 388,
    games_played: 610,
    deaths: 310,
    damage: 984500,
    cs_ranking_points: 112,
    cs_kills: 1980,
    cs_wins: 412,
    cs_games_played: 520,
    cs_deaths: 340,
    cs_damage: 1245000,
    clan_name: 'FLUXO Esports',
    avatar_id: 102000004,
    banner_id: 900000014,
    head_pic: 902000003
  },
  {
    open_id: 'seed-totalgaming-02',
    nickname: 'TG_Ajjubhai94',
    region: 'IND',
    level: 95,
    ranking_points: 4520,
    kills: 1350,
    wins: 362,
    games_played: 580,
    deaths: 330,
    damage: 912000,
    cs_ranking_points: 105,
    cs_kills: 1840,
    cs_wins: 395,
    cs_games_played: 495,
    cs_deaths: 320,
    cs_damage: 1150000,
    clan_name: 'Total Gaming',
    avatar_id: 101000001,
    banner_id: 900000015,
    head_pic: 902000004
  },
  {
    open_id: 'seed-b2k-03',
    nickname: 'B2K_Born2Kill',
    region: 'EU',
    level: 96,
    ranking_points: 4410,
    kills: 1520,
    wins: 340,
    games_played: 590,
    deaths: 290,
    damage: 1050000,
    cs_ranking_points: 98,
    cs_kills: 1910,
    cs_wins: 370,
    cs_games_played: 480,
    cs_deaths: 300,
    cs_damage: 1180000,
    clan_name: 'Born2Kill',
    avatar_id: 102000008,
    banner_id: 900000016,
    head_pic: 902000005
  },
  {
    open_id: 'seed-raistar-04',
    nickname: '⚡RAISTAR⚡',
    region: 'IND',
    level: 94,
    ranking_points: 4350,
    kills: 1610,
    wins: 325,
    games_played: 570,
    deaths: 310,
    damage: 1080000,
    cs_ranking_points: 118,
    cs_kills: 2150,
    cs_wins: 430,
    cs_games_played: 540,
    cs_deaths: 310,
    cs_damage: 1320000,
    clan_name: 'Gyan Gaming',
    avatar_id: 102000018,
    banner_id: 900000017,
    head_pic: 902000006
  },
  {
    open_id: 'seed-loud-05',
    nickname: 'LOUD_Coringan',
    region: 'BR',
    level: 92,
    ranking_points: 4290,
    kills: 1280,
    wins: 315,
    games_played: 540,
    deaths: 320,
    damage: 860000,
    cs_ranking_points: 94,
    cs_kills: 1720,
    cs_wins: 355,
    cs_games_played: 460,
    cs_deaths: 315,
    cs_damage: 1090000,
    clan_name: 'LOUD',
    avatar_id: 102000028,
    banner_id: 900000018,
    head_pic: 902000007
  },
  {
    open_id: 'seed-two9-06',
    nickname: 'LOS_Two9',
    region: 'BR',
    level: 93,
    ranking_points: 4210,
    kills: 1450,
    wins: 300,
    games_played: 530,
    deaths: 305,
    damage: 975000,
    cs_ranking_points: 110,
    cs_kills: 2020,
    cs_wins: 405,
    cs_games_played: 510,
    cs_deaths: 295,
    cs_damage: 1280000,
    clan_name: 'Los Grandes',
    avatar_id: 102000012,
    banner_id: 900000019,
    head_pic: 902000008
  },
  {
    open_id: 'seed-white444-07',
    nickname: 'White444_Headshot',
    region: 'GLOBAL',
    level: 91,
    ranking_points: 4150,
    kills: 1580,
    wins: 290,
    games_played: 520,
    deaths: 280,
    damage: 1020000,
    cs_ranking_points: 102,
    cs_kills: 1940,
    cs_wins: 380,
    cs_games_played: 480,
    cs_deaths: 285,
    cs_damage: 1210000,
    clan_name: '444 Legion',
    avatar_id: 102000021,
    banner_id: 900000020,
    head_pic: 902000009
  },
  {
    open_id: 'seed-vincenzo-08',
    nickname: 'OP_VINCENZO',
    region: 'EU',
    level: 90,
    ranking_points: 4080,
    kills: 1390,
    wins: 285,
    games_played: 510,
    deaths: 295,
    damage: 930000,
    cs_ranking_points: 89,
    cs_kills: 1680,
    cs_wins: 340,
    cs_games_played: 450,
    cs_deaths: 290,
    cs_damage: 1060000,
    clan_name: 'OverPowered',
    avatar_id: 102000030,
    banner_id: 900000021,
    head_pic: 902000010
  },
  {
    open_id: 'seed-sksabbir-09',
    nickname: 'SK_SABBIR_BOSS',
    region: 'IND',
    level: 99,
    ranking_points: 3960,
    kills: 1310,
    wins: 275,
    games_played: 490,
    deaths: 310,
    damage: 890000,
    cs_ranking_points: 85,
    cs_kills: 1610,
    cs_wins: 330,
    cs_games_played: 440,
    cs_deaths: 300,
    cs_damage: 1020000,
    clan_name: 'BOSS Guild',
    avatar_id: 102000005,
    banner_id: 900000022,
    head_pic: 902000011
  },
  {
    open_id: 'seed-badge99-10',
    nickname: 'Badge_99_Official',
    region: 'IND',
    level: 89,
    ranking_points: 3880,
    kills: 1220,
    wins: 260,
    games_played: 475,
    deaths: 305,
    damage: 830000,
    cs_ranking_points: 79,
    cs_kills: 1530,
    cs_wins: 315,
    cs_games_played: 430,
    cs_deaths: 295,
    cs_damage: 980000,
    clan_name: 'Hawks Club',
    avatar_id: 102000009,
    banner_id: 900000023,
    head_pic: 902000012
  },
  {
    open_id: 'seed-ruok-11',
    nickname: 'Ruok_FF_King',
    region: 'SG',
    level: 92,
    ranking_points: 3820,
    kills: 1410,
    wins: 250,
    games_played: 460,
    deaths: 275,
    damage: 940000,
    cs_ranking_points: 84,
    cs_kills: 1660,
    cs_wins: 325,
    cs_games_played: 420,
    cs_deaths: 270,
    cs_damage: 1050000,
    clan_name: 'Siam Sniper',
    avatar_id: 102000013,
    banner_id: 900000024,
    head_pic: 902000013
  },
  {
    open_id: 'seed-level-up-12',
    nickname: 'Bonde_LevelUp',
    region: 'BR',
    level: 88,
    ranking_points: 3750,
    kills: 1190,
    wins: 245,
    games_played: 450,
    deaths: 290,
    damage: 810000,
    cs_ranking_points: 76,
    cs_kills: 1490,
    cs_wins: 305,
    cs_games_played: 410,
    cs_deaths: 285,
    cs_damage: 940000,
    clan_name: 'Bonde',
    avatar_id: 102000010,
    banner_id: 900000025,
    head_pic: 902000014
  },
  {
    open_id: 'seed-aura-13',
    nickname: 'AURA_Nescere',
    region: 'ID',
    level: 87,
    ranking_points: 3680,
    kills: 1140,
    wins: 238,
    games_played: 440,
    deaths: 295,
    damage: 780000,
    cs_ranking_points: 72,
    cs_kills: 1420,
    cs_wins: 295,
    cs_games_played: 395,
    cs_deaths: 280,
    cs_damage: 905000,
    clan_name: 'AURA Esports',
    avatar_id: 102000011,
    banner_id: 900000026,
    head_pic: 902000015
  },
  {
    open_id: 'seed-evos-14',
    nickname: 'EVOS_Sam13',
    region: 'ID',
    level: 91,
    ranking_points: 3620,
    kills: 1160,
    wins: 230,
    games_played: 430,
    deaths: 290,
    damage: 790000,
    cs_ranking_points: 68,
    cs_kills: 1390,
    cs_wins: 280,
    cs_games_played: 380,
    cs_deaths: 275,
    cs_damage: 880000,
    clan_name: 'EVOS Divine',
    avatar_id: 102000022,
    banner_id: 900000027,
    head_pic: 902000016
  },
  {
    open_id: 'seed-phoenix-15',
    nickname: 'Phoenix_Force_Joena',
    region: 'SG',
    level: 90,
    ranking_points: 3550,
    kills: 1110,
    wins: 225,
    games_played: 420,
    deaths: 285,
    damage: 760000,
    cs_ranking_points: 65,
    cs_kills: 1340,
    cs_wins: 270,
    cs_games_played: 370,
    cs_deaths: 265,
    cs_damage: 850000,
    clan_name: 'Phoenix Force',
    avatar_id: 102000029,
    banner_id: 900000028,
    head_pic: 902000017
  },
  {
    open_id: 'seed-na-sniper-16',
    nickname: 'NA_EagleEye',
    region: 'NA',
    level: 86,
    ranking_points: 3480,
    kills: 1080,
    wins: 215,
    games_played: 405,
    deaths: 280,
    damage: 740000,
    cs_ranking_points: 62,
    cs_kills: 1290,
    cs_wins: 260,
    cs_games_played: 360,
    cs_deaths: 260,
    cs_damage: 820000,
    clan_name: 'Apex Predators',
    avatar_id: 102000031,
    banner_id: 900000029,
    head_pic: 902000018
  },
  {
    open_id: 'seed-infinity-17',
    nickname: 'Infinity_Ghost',
    region: 'EU',
    level: 85,
    ranking_points: 3390,
    kills: 1030,
    wins: 205,
    games_played: 395,
    deaths: 275,
    damage: 710000,
    cs_ranking_points: 58,
    cs_kills: 1220,
    cs_wins: 245,
    cs_games_played: 345,
    cs_deaths: 250,
    cs_damage: 780000,
    clan_name: 'Ghost Division',
    avatar_id: 102000032,
    banner_id: 900000030,
    head_pic: 902000019
  },
  {
    open_id: 'seed-corinthians-18',
    nickname: 'SCCP_Fixa',
    region: 'BR',
    level: 87,
    ranking_points: 3320,
    kills: 990,
    wins: 198,
    games_played: 385,
    deaths: 270,
    damage: 685000,
    cs_ranking_points: 54,
    cs_kills: 1180,
    cs_wins: 235,
    cs_games_played: 335,
    cs_deaths: 245,
    cs_damage: 755000,
    clan_name: 'Corinthians FF',
    avatar_id: 102000033,
    banner_id: 900000031,
    head_pic: 902000020
  },
  {
    open_id: 'seed-titan-19',
    nickname: 'Titan_Striker',
    region: 'GLOBAL',
    level: 83,
    ranking_points: 3150,
    kills: 910,
    wins: 185,
    games_played: 365,
    deaths: 265,
    damage: 630000,
    cs_ranking_points: 48,
    cs_kills: 1090,
    cs_wins: 215,
    cs_games_played: 315,
    cs_deaths: 235,
    cs_damage: 695000,
    clan_name: 'Titan Vanguard',
    avatar_id: 102000034,
    banner_id: 900000032,
    head_pic: 902000021
  },
  {
    open_id: 'seed-shadow-20',
    nickname: 'Shadow_Ninja',
    region: 'NA',
    level: 81,
    ranking_points: 2980,
    kills: 840,
    wins: 168,
    games_played: 340,
    deaths: 255,
    damage: 580000,
    cs_ranking_points: 42,
    cs_kills: 990,
    cs_wins: 195,
    cs_games_played: 290,
    cs_deaths: 220,
    cs_damage: 635000,
    clan_name: 'Shadow Clan',
    avatar_id: 101000008,
    banner_id: 900000033,
    head_pic: 902000022
  }
];

class RankingService {
  constructor() {
    this._initialized = false;
    this.ensureSeedData();
  }

  /**
   * Automatically ensure database contains seeded top leaderboard players
   * so the global rankings are immediately populated and realistic.
   */
  ensureSeedData() {
    if (this._initialized) return;
    try {
      const count = accounts.db.prepare('SELECT COUNT(*) as c FROM accounts').get().c;
      if (count < 15) {
        logger.info('[ranking] Seeding initial global competitive player pool...');
        for (const p of SEED_PLAYERS) {
          const existing = playerDb.getByOpenId(p.open_id);
          if (!existing) {
            const acc = playerDb.createFromLogin({
              open_id: p.open_id,
              open_id_type: '1',
              nickname: p.nickname,
              region: p.region,
              level: p.level,
              client_version: '1.70.1'
            });
            acc.level = p.level;
            acc.ranking_points = p.ranking_points;
            acc.rank = calculateBermudaTier(p.ranking_points);
            acc.cs_ranking_points = p.cs_ranking_points;
            acc.cs_rank = calculateCSTier(p.cs_ranking_points);
            acc.clan = { id: 101, name: p.clan_name, role: 'member', rank: 1, points: 5000, members: [] };
            acc.selected_items = {
              avatar_id: p.avatar_id,
              banner_id: p.banner_id,
              head_pic: p.head_pic,
              clothes: [203000001, 211000000, 204000001, 205000001],
              slots: [102000004, 1, 2, 3]
            };
            acc.career = {
              games_played: p.games_played,
              wins: p.wins,
              kills: p.kills,
              deaths: p.deaths,
              damage: p.damage,
              cs_games_played: p.cs_games_played,
              cs_wins: p.cs_wins,
              cs_kills: p.cs_kills,
              cs_deaths: p.cs_deaths,
              cs_damage: p.cs_damage
            };
            playerDb.save(acc);
          }
        }
        logger.info('[ranking] Seeded global competitive players successfully.');
      }
      this._initialized = true;
    } catch (err) {
      logger.warn(`[ranking] ensureSeedData error: ${err.message}`);
    }
  }

  /**
   * Retrieve all player ranking objects from SQLite.
   */
  getAllPlayerProfiles() {
    this.ensureSeedData();
    const rows = accounts.db.prepare('SELECT account_id, state FROM accounts').all();
    const players = [];

    for (const row of rows) {
      let doc;
      try {
        doc = row.state ? JSON.parse(row.state) : {};
      } catch (_) {
        doc = {};
      }
      const uid = row.account_id;
      const nickname = doc.nickname || `Player_${uid}`;
      const level = doc.level || 1;
      const region = doc.region || 'GLOBAL';
      const clanName = (doc.clan && doc.clan.name) || '';
      const si = doc.selected_items || {};

      // Bermuda BR stats
      const brRP = doc.ranking_points != null ? Number(doc.ranking_points) : 1000;
      const brRank = calculateBermudaTier(brRP);
      const brCareer = doc.career || {};
      const brGames = Math.max(Number(brCareer.games_played || doc.games_played || 1), 1);
      const brWins = Number(brCareer.wins || doc.wins || 0);
      const brKills = Number(brCareer.kills || doc.kills || 0);
      const brDeaths = Math.max(Number(brCareer.deaths || doc.deaths || 1), 1);
      const brDamage = Number(brCareer.damage || doc.damage || (brKills * 350));
      const brKD = Number((brKills / brDeaths).toFixed(2));
      const brWinRate = Number(((brWins / brGames) * 100).toFixed(1));

      // Clash Squad stats
      const csStars = doc.cs_ranking_points != null ? Number(doc.cs_ranking_points) : 0;
      const csRank = calculateCSTier(csStars);
      const csGames = Math.max(Number(brCareer.cs_games_played || doc.cs_games_played || 1), 1);
      const csWins = Number(brCareer.cs_wins || doc.cs_wins || 0);
      const csKills = Number(brCareer.cs_kills || doc.cs_kills || 0);
      const csDeaths = Math.max(Number(brCareer.cs_deaths || doc.cs_deaths || 1), 1);
      const csDamage = Number(brCareer.cs_damage || doc.cs_damage || (csKills * 420));
      const csKD = Number((csKills / csDeaths).toFixed(2));
      const csWinRate = Number(((csWins / csGames) * 100).toFixed(1));

      players.push({
        uid,
        account_id: uid,
        nickname,
        level,
        exp: doc.exp || 0,
        region,
        clan_name: clanName,
        avatar_id: si.avatar_id || 102000004,
        banner_id: si.banner_id || 900000014,
        head_pic: si.head_pic || 902000003,

        // Bermuda BR
        bermuda: {
          score: brRP,
          ranking_points: brRP,
          rank: brRank,
          tier: TIERS[brRank],
          kills: brKills,
          wins: brWins,
          deaths: brDeaths,
          games_played: brGames,
          damage: brDamage,
          kd_ratio: brKD,
          win_rate: brWinRate
        },

        // Clash Squad
        clash_squad: {
          score: csStars,
          ranking_points: csStars,
          stars: csStars,
          rank: csRank,
          tier: TIERS[csRank],
          kills: csKills,
          wins: csWins,
          deaths: csDeaths,
          games_played: csGames,
          damage: csDamage,
          kd_ratio: csKD,
          win_rate: csWinRate
        }
      });
    }

    return players;
  }

  /**
   * Query global rankings with filtering, sorting, and pagination.
   *
   * @param {object} opts
   * @param {'bermuda'|'clash_squad'} [opts.mode='bermuda']
   * @param {'score'|'kills'|'wins'} [opts.metric='score']
   * @param {string} [opts.region='GLOBAL']
   * @param {number} [opts.page=1]
   * @param {number} [opts.limit=50]
   */
  getRankings({ mode = 'bermuda', metric = 'score', region = 'GLOBAL', page = 1, limit = 50 } = {}) {
    const validMode = mode === 'clash_squad' ? 'clash_squad' : 'bermuda';
    const validMetric = ['score', 'kills', 'wins'].includes(metric) ? metric : 'score';
    const curPage = Math.max(1, parseInt(page, 10) || 1);
    const curLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 50));

    let players = this.getAllPlayerProfiles();

    // Regional filter
    if (region && region.toUpperCase() !== 'GLOBAL') {
      players = players.filter((p) => p.region.toUpperCase() === region.toUpperCase());
    }

    // Sort descending by target mode and metric, with tie-breakers
    players.sort((a, b) => {
      const statA = a[validMode];
      const statB = b[validMode];
      const valA = statA[validMetric] || 0;
      const valB = statB[validMetric] || 0;

      if (valB !== valA) return valB - valA;
      // Secondary tie breaker: kills
      if (validMetric !== 'kills' && statB.kills !== statA.kills) {
        return statB.kills - statA.kills;
      }
      // Tertiary tie breaker: wins
      if (validMetric !== 'wins' && statB.wins !== statA.wins) {
        return statB.wins - statA.wins;
      }
      // Final tie breaker: level
      return b.level - a.level;
    });

    const total = players.length;
    // Assign 1-indexed rank position
    const rankedPlayers = players.map((p, index) => {
      const pos = index + 1;
      const stat = p[validMode];
      return {
        pos,
        uid: p.uid,
        account_id: p.uid,
        nickname: p.nickname,
        level: p.level,
        region: p.region,
        clan_name: p.clan_name,
        avatar_id: p.avatar_id,
        banner_id: p.banner_id,
        head_pic: p.head_pic,
        mode: validMode,
        metric: validMetric,
        score: stat.score,
        ranking_points: stat.ranking_points,
        rank: stat.rank,
        tier: stat.tier,
        kills: stat.kills,
        wins: stat.wins,
        deaths: stat.deaths,
        games_played: stat.games_played,
        damage: stat.damage,
        kd_ratio: stat.kd_ratio,
        win_rate: stat.win_rate
      };
    });

    const startIndex = (curPage - 1) * curLimit;
    const pagedItems = rankedPlayers.slice(startIndex, startIndex + curLimit);

    return {
      season_id: validMode === 'bermuda' ? SEASON_ID : CS_SEASON_ID,
      mode: validMode,
      metric: validMetric,
      region: region.toUpperCase(),
      total,
      page: curPage,
      limit: curLimit,
      total_pages: Math.ceil(total / curLimit),
      items: pagedItems,
      all_ranked: rankedPlayers,
      thresholds: validMode === 'bermuda' ? BERMUDA_THRESHOLDS : CS_THRESHOLDS
    };
  }

  /**
   * Get single player ranking profile across both Bermuda and Clash Squad.
   */
  getPlayerRanking(uid) {
    const targetUid = Number(uid);
    const all = this.getAllPlayerProfiles();
    const player = all.find((p) => p.uid === targetUid);
    if (!player) return null;

    // Get Bermuda position
    const brRankings = this.getRankings({ mode: 'bermuda', metric: 'score', limit: 1000 }).all_ranked;
    const brRankItem = brRankings.find((p) => p.uid === targetUid) || { pos: brRankings.length + 1 };

    // Get Clash Squad position
    const csRankings = this.getRankings({ mode: 'clash_squad', metric: 'score', limit: 1000 }).all_ranked;
    const csRankItem = csRankings.find((p) => p.uid === targetUid) || { pos: csRankings.length + 1 };

    return {
      uid: targetUid,
      nickname: player.nickname,
      level: player.level,
      region: player.region,
      clan_name: player.clan_name,
      avatar_id: player.avatar_id,
      banner_id: player.banner_id,
      head_pic: player.head_pic,
      bermuda: {
        pos: brRankItem.pos,
        ...player.bermuda
      },
      clash_squad: {
        pos: csRankItem.pos,
        ...player.clash_squad
      }
    };
  }

  /**
   * Record or simulate a match result for a player, updating stats and rank points.
   *
   * @param {object} payload
   * @param {number} payload.uid Player account ID
   * @param {'bermuda'|'clash_squad'} payload.mode Game mode
   * @param {number} [payload.kills=0]
   * @param {number} [payload.deaths=1]
   * @param {number} [payload.damage=0]
   * @param {boolean} [payload.win=false]
   * @param {number} [payload.score_delta] Optional override for RP / stars gained/lost
   */
  recordMatchResult({ uid, mode = 'bermuda', kills = 0, deaths = 1, damage = 0, win = false, score_delta = null } = {}) {
    const targetUid = Number(uid);
    const acc = playerDb.getById(targetUid);
    if (!acc) throw new Error(`Player ${targetUid} not found`);

    const validMode = mode === 'clash_squad' ? 'clash_squad' : 'bermuda';
    acc.career = acc.career || {};

    let delta = 0;
    if (score_delta !== null && score_delta !== undefined) {
      delta = Number(score_delta);
    } else {
      // Calculate realistic score delta based on performance
      if (validMode === 'bermuda') {
        delta = win ? (30 + (kills * 3)) : Math.max(-25, -15 + (kills * 2));
      } else {
        // Clash Squad stars: +1 on win, -1 on loss (minimum 0)
        delta = win ? 1 : -1;
      }
    }

    if (validMode === 'bermuda') {
      const prevRP = acc.ranking_points != null ? Number(acc.ranking_points) : 1000;
      const newRP = Math.max(1000, prevRP + delta);
      acc.ranking_points = newRP;
      acc.rank = calculateBermudaTier(newRP);
      acc.max_rank = Math.max(acc.max_rank || 1, acc.rank);

      acc.career.games_played = (acc.career.games_played || 0) + 1;
      acc.career.kills = (acc.career.kills || 0) + kills;
      acc.career.deaths = (acc.career.deaths || 0) + deaths;
      acc.career.damage = (acc.career.damage || 0) + (damage || kills * 320);
      if (win) acc.career.wins = (acc.career.wins || 0) + 1;
    } else {
      const prevStars = acc.cs_ranking_points != null ? Number(acc.cs_ranking_points) : 0;
      const newStars = Math.max(0, prevStars + delta);
      acc.cs_ranking_points = newStars;
      acc.cs_rank = calculateCSTier(newStars);
      acc.cs_max_rank = Math.max(acc.cs_max_rank || 1, acc.cs_rank);

      acc.career.cs_games_played = (acc.career.cs_games_played || 0) + 1;
      acc.career.cs_kills = (acc.career.cs_kills || 0) + kills;
      acc.career.cs_deaths = (acc.career.cs_deaths || 0) + deaths;
      acc.career.cs_damage = (acc.career.cs_damage || 0) + (damage || kills * 400);
      if (win) acc.career.cs_wins = (acc.career.cs_wins || 0) + 1;
    }

    playerDb.save(acc);
    logger.info(`[ranking] Recorded match for uid=${targetUid} mode=${validMode} win=${win} kills=${kills} delta=${delta}`);

    return {
      uid: targetUid,
      mode: validMode,
      win: !!win,
      kills,
      deaths,
      damage,
      score_delta: delta,
      player: this.getPlayerRanking(targetUid)
    };
  }

  /**
   * Build protobuf AccountLeaderboardRes from CSLeaderboardReq for game clients.
   *
   * @param {object} reqObj CSLeaderboardReq
   * @param {number} requestingUid Caller UID
   */
  buildAccountLeaderboardRes(reqObj = {}, requestingUid = 0) {
    const mainType = Number(reqObj.main_type || 0);
    // Map proto ELeaderboard.LeaderboardMainType:
    // 1 = RANKING_SCORE (Bermuda RP)
    // 2 = RANKING_KILLS (Bermuda Kills)
    // 3 = RANKING_WIN_COUNT (Bermuda Wins)
    // 11 = CS_RANKING_KILLS (CS Kills)
    // 12 = CS_RANKING_WINS (CS Wins)
    // 13 = CS_RANKING_SCORE (CS Score/Stars)
    let mode = 'bermuda';
    let metric = 'score';

    if (mainType === 11) {
      mode = 'clash_squad';
      metric = 'kills';
    } else if (mainType === 12) {
      mode = 'clash_squad';
      metric = 'wins';
    } else if (mainType === 13) {
      mode = 'clash_squad';
      metric = 'score';
    } else if (mainType === 2) {
      mode = 'bermuda';
      metric = 'kills';
    } else if (mainType === 3) {
      mode = 'bermuda';
      metric = 'wins';
    } else {
      mode = 'bermuda';
      metric = 'score';
    }

    const pageSize = Math.min(100, Math.max(10, Number(reqObj.page_size || 50)));
    const pageIndex = Math.max(1, Number(reqObj.page_index || 1));
    const region = reqObj.region || 'GLOBAL';

    const result = this.getRankings({ mode, metric, region, page: pageIndex, limit: pageSize });

    // Format proto AccountLeaderboardItem
    const items = result.items.map((p) => ({
      account_id: p.uid,
      score: Number(p[metric] || p.score || 0),
      pos: p.pos,
      account_profile: {
        basic_info: {
          account_id: p.uid,
          nickname: p.nickname,
          level: p.level,
          rank: p.rank,
          ranking_points: p.ranking_points,
          cs_rank: p.rank,
          cs_ranking_points: p.score,
          clan_name: p.clan_name,
          banner_id: p.banner_id,
          head_pic: p.head_pic,
          region: p.region,
          show_rank: true
        },
        stat: {
          account_id: p.uid,
          games_played: p.games_played,
          wins: p.wins,
          kills: p.kills,
          is_cs_ranking: mode === 'clash_squad'
        },
        rank: p.rank,
        ranking_points: p.ranking_points
      }
    }));

    // Find self item
    let selfItem = null;
    const callerRank = result.all_ranked.find((p) => p.uid === Number(requestingUid));
    if (callerRank) {
      selfItem = {
        account_id: callerRank.uid,
        score: Number(callerRank[metric] || callerRank.score || 0),
        pos: callerRank.pos,
        account_profile: {
          basic_info: {
            account_id: callerRank.uid,
            nickname: callerRank.nickname,
            level: callerRank.level,
            rank: callerRank.rank,
            ranking_points: callerRank.ranking_points,
            cs_rank: callerRank.rank,
            cs_ranking_points: callerRank.score,
            clan_name: callerRank.clan_name,
            banner_id: callerRank.banner_id,
            head_pic: callerRank.head_pic,
            region: callerRank.region,
            show_rank: true
          },
          stat: {
            account_id: callerRank.uid,
            games_played: callerRank.games_played,
            wins: callerRank.wins,
            kills: callerRank.kills,
            is_cs_ranking: mode === 'clash_squad'
          },
          rank: callerRank.rank,
          ranking_points: callerRank.ranking_points
        }
      };
    } else if (items.length > 0) {
      selfItem = items[0];
    }

    return {
      items,
      self: selfItem,
      leaderboard_size: result.total
    };
  }

  /**
   * Get threshold score for CSGetLeaderBoardThresholdScoreRes.
   */
  getThresholdScore(mainType = 1) {
    if (mainType === 13) {
      return { score: CS_THRESHOLDS.HEROIC };
    }
    return { score: BERMUDA_THRESHOLDS.HEROIC };
  }

  /**
   * Summary overview metrics for admin dashboard and reporting.
   */
  getSummary() {
    const brRankings = this.getRankings({ mode: 'bermuda', metric: 'score', limit: 1 }).items;
    const csRankings = this.getRankings({ mode: 'clash_squad', metric: 'score', limit: 1 }).items;
    const all = this.getAllPlayerProfiles();

    let grandmasterCount = 0;
    let heroicCount = 0;
    let totalKills = 0;
    let totalWins = 0;

    for (const p of all) {
      if (p.bermuda.rank === 7 || p.clash_squad.rank === 7) grandmasterCount++;
      if (p.bermuda.rank === 6 || p.clash_squad.rank === 6) heroicCount++;
      totalKills += (p.bermuda.kills + p.clash_squad.kills);
      totalWins += (p.bermuda.wins + p.clash_squad.wins);
    }

    return {
      season_id: SEASON_ID,
      total_ranked_players: all.length,
      top_bermuda_player: brRankings[0] || null,
      top_clash_squad_player: csRankings[0] || null,
      grandmaster_players: grandmasterCount,
      heroic_players: heroicCount,
      total_kills: totalKills,
      total_wins: totalWins,
      bermuda_thresholds: BERMUDA_THRESHOLDS,
      cs_thresholds: CS_THRESHOLDS
    };
  }
}

// Singleton instance
const rankingService = new RankingService();

module.exports = rankingService;
