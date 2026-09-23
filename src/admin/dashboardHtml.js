'use strict';

function renderDashboard() {
  return `<!DOCTYPE html>
<html lang="en" class="h-full bg-slate-950 text-slate-100">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Free Fire Server</title>
  <meta name="description" content="Game emulator and API server for Free Fire with account management, protocol handlers, and live admin dashboard." />
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @keyframes pulse-slow {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.95); }
    }
    .pulse-dot {
      animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
  </style>
</head>
<body class="h-full flex flex-col font-sans antialiased text-slate-200 selection:bg-amber-500 selection:text-black">
  <!-- Top Navigation Bar -->
  <header id="app-header" class="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-lg">
          FF
        </div>
        <div>
          <div class="flex items-center space-x-2">
            <h1 class="font-bold text-slate-100 text-base sm:text-lg tracking-tight">Free Fire Server</h1>
            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 pulse-dot"></span>
              Live v1.70.1
            </span>
          </div>
          <p class="text-xs text-slate-400 hidden sm:block">Protocol AES-128-CBC &bull; Protobuf v3 &bull; Unified Service</p>
        </div>
      </div>
      
      <div class="flex items-center space-x-3">
        <button id="btn-refresh" onclick="loadAllData()" class="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition">
          <svg class="w-3.5 h-3.5 mr-1.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
        <a href="/live/ver.php" target="_blank" class="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold transition">
          View ver.php
        </a>
      </div>
    </div>
  </header>

  <!-- Main Content Area -->
  <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
    <!-- Stat Counter Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div id="card-stat-accounts" class="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5">
        <span class="text-xs font-medium uppercase tracking-wider text-slate-400">Total Accounts</span>
        <div class="mt-2 flex items-baseline justify-between">
          <span id="stat-accounts" class="text-2xl sm:text-3xl font-bold text-slate-100">--</span>
          <span class="text-xs text-slate-500">SQLite Repo</span>
        </div>
      </div>

      <div id="card-stat-online" class="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5">
        <span class="text-xs font-medium uppercase tracking-wider text-slate-400">Online Players</span>
        <div class="mt-2 flex items-baseline justify-between">
          <span id="stat-online" class="text-2xl sm:text-3xl font-bold text-emerald-400">0</span>
          <span class="text-xs text-slate-500">Bus Presence</span>
        </div>
      </div>

      <div id="card-stat-endpoints" class="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5">
        <span class="text-xs font-medium uppercase tracking-wider text-slate-400">Mapped Endpoints</span>
        <div class="mt-2 flex items-baseline justify-between">
          <span id="stat-endpoints" class="text-2xl sm:text-3xl font-bold text-slate-100">494</span>
          <span class="text-xs text-slate-500">COW Protobuf</span>
        </div>
      </div>

      <div id="card-stat-uptime" class="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5">
        <span class="text-xs font-medium uppercase tracking-wider text-slate-400">Server Uptime</span>
        <div class="mt-2 flex items-baseline justify-between">
          <span id="stat-uptime" class="text-xl sm:text-2xl font-bold text-amber-400">--</span>
          <span class="text-xs text-slate-500">Port 3000</span>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="border-b border-slate-800 flex space-x-2 sm:space-x-4 overflow-x-auto text-sm font-medium">
      <button onclick="switchTab('tab-overview')" id="tab-btn-overview" class="tab-btn border-b-2 border-amber-500 text-amber-400 pb-3 px-3 transition whitespace-nowrap">
        Diagnostics & Handshake
      </button>
      <button onclick="switchTab('tab-modes')" id="tab-btn-modes" class="tab-btn border-b-2 border-transparent text-slate-400 hover:text-slate-200 pb-3 px-3 transition whitespace-nowrap">
        Match Modes (4)
      </button>
      <button onclick="switchTab('tab-shop')" id="tab-btn-shop" class="tab-btn border-b-2 border-transparent text-slate-400 hover:text-slate-200 pb-3 px-3 transition whitespace-nowrap">
        Shop & Lucky Royale
      </button>
      <button onclick="switchTab('tab-rankings')" id="tab-btn-rankings" class="tab-btn border-b-2 border-transparent text-slate-400 hover:text-slate-200 pb-3 px-3 transition whitespace-nowrap">
        Global Rankings (Bermuda & CS)
      </button>
      <button onclick="switchTab('tab-accounts')" id="tab-btn-accounts" class="tab-btn border-b-2 border-transparent text-slate-400 hover:text-slate-200 pb-3 px-3 transition whitespace-nowrap">
        Accounts Management
      </button>
      <button onclick="switchTab('tab-endpoints')" id="tab-btn-endpoints" class="tab-btn border-b-2 border-transparent text-slate-400 hover:text-slate-200 pb-3 px-3 transition whitespace-nowrap">
        Endpoints Explorer (<span id="tab-count-endpoints">494</span>)
      </button>
      <button onclick="switchTab('tab-system')" id="tab-btn-system" class="tab-btn border-b-2 border-transparent text-slate-400 hover:text-slate-200 pb-3 px-3 transition whitespace-nowrap">
        System & Config
      </button>
    </div>

    <!-- TAB 1: Diagnostics & Handshake -->
    <section id="tab-overview" class="tab-content space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Live Handshake Tester -->
        <div class="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-base font-semibold text-slate-100">Live Client Handshake Test</h2>
              <p class="text-xs text-slate-400">Executes the official 4-step AES-encrypted Protobuf handshake</p>
            </div>
            <button id="btn-run-handshake" onclick="runHandshakeTest()" class="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center shadow-lg shadow-emerald-950">
              <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Run Handshake Test
            </button>
          </div>

          <!-- Handshake Steps Visualizer -->
          <div id="handshake-steps" class="space-y-3 bg-slate-950/70 border border-slate-800 rounded-lg p-4">
            <div class="flex items-start space-x-3 text-sm">
              <span class="w-6 h-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-xs font-semibold shrink-0">1</span>
              <div>
                <p class="font-medium text-slate-300">Step 1: POST /MajorLogin (Empty open_id)</p>
                <p class="text-xs text-slate-500">Unregistered guest client connects. Expects HTTP 404 to prompt registration dialog.</p>
              </div>
            </div>
            <div class="flex items-start space-x-3 text-sm">
              <span class="w-6 h-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-xs font-semibold shrink-0">2</span>
              <div>
                <p class="font-medium text-slate-300">Step 2: POST /MajorRegister (Create Nickname)</p>
                <p class="text-xs text-slate-500">Client sends chosen nickname. Server provisions account ID and seeds wallet.</p>
              </div>
            </div>
            <div class="flex items-start space-x-3 text-sm">
              <span class="w-6 h-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-xs font-semibold shrink-0">3</span>
              <div>
                <p class="font-medium text-slate-300">Step 3: POST /MajorLogin (Authenticate Session)</p>
                <p class="text-xs text-slate-500">Client re-authenticates. Server verifies credentials and issues Bearer JWT token.</p>
              </div>
            </div>
            <div class="flex items-start space-x-3 text-sm">
              <span class="w-6 h-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-xs font-semibold shrink-0">4</span>
              <div>
                <p class="font-medium text-slate-300">Step 4: POST /GetLoginData (Sync State)</p>
                <p class="text-xs text-slate-500">Client presents Bearer token. Server returns player profile, loadout, levels, and coins.</p>
              </div>
            </div>
          </div>

          <!-- Test Output Terminal -->
          <div id="handshake-result-container" class="hidden">
            <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex justify-between items-center">
              <span>Test Result Logs</span>
              <span id="handshake-badge" class="px-2 py-0.5 rounded text-xs"></span>
            </div>
            <pre id="handshake-output" class="bg-slate-950 p-3 rounded-lg text-xs font-mono text-emerald-400 border border-slate-800 overflow-x-auto max-h-64"></pre>
          </div>
        </div>

        <!-- Quick Reference Box -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 class="text-base font-semibold text-slate-100">Primary Server Endpoints</h2>
          <div class="space-y-2.5 text-xs">
            <div class="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <div class="flex items-center justify-between font-mono">
                <span class="text-amber-400 font-semibold">GET /live/ver.php</span>
                <span class="text-slate-500">HTTP/1.1</span>
              </div>
              <p class="text-slate-400 mt-1">Client version handshake & server discovery</p>
            </div>

            <div class="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <div class="flex items-center justify-between font-mono">
                <span class="text-emerald-400 font-semibold">POST /MajorLogin</span>
                <span class="text-slate-500">AES-Protobuf</span>
              </div>
              <p class="text-slate-400 mt-1">Player authentication & token generation</p>
            </div>

            <div class="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <div class="flex items-center justify-between font-mono">
                <span class="text-emerald-400 font-semibold">POST /GetLoginData</span>
                <span class="text-slate-500">AES-Protobuf</span>
              </div>
              <p class="text-slate-400 mt-1">Game state, inventory, currency sync</p>
            </div>

            <div class="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <div class="flex items-center justify-between font-mono">
                <span class="text-sky-400 font-semibold">GET /api/stats</span>
                <span class="text-slate-500">JSON</span>
              </div>
              <p class="text-slate-400 mt-1">Server health, memory, and presence statistics</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- TAB: Match Modes (Bermuda Classic & Clash Squad) -->
    <section id="tab-modes" class="tab-content hidden space-y-6">
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div>
          <h2 class="text-base font-semibold text-slate-100">Supported Match Modes</h2>
          <p class="text-xs text-slate-400">Available game modes advertised via TCP GameOpeningInfo and Custom Room rules</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Card 1: Bermuda Classic -->
          <div class="bg-slate-950 border border-amber-500/30 rounded-xl overflow-hidden flex flex-col justify-between">
            <div class="p-5 space-y-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <span class="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
                  <h3 class="text-lg font-bold text-slate-100">Bermuda Classic</h3>
                </div>
                <span class="px-2.5 py-1 rounded text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Battle Royale
                </span>
              </div>

              <p class="text-xs text-slate-400">
                Classic Battle Royale on Bermuda island (Paradise). Supports Solo, Duo, and Squad survival matches with up to 48 players.
              </p>

              <div class="grid grid-cols-2 gap-2 text-xs font-mono">
                <div class="bg-slate-900 p-2 rounded border border-slate-800">
                  <span class="text-slate-500 block text-[10px] uppercase font-sans">Game Mode ID</span>
                  <span class="text-emerald-400 font-bold">1 (BattleRoyale)</span>
                </div>
                <div class="bg-slate-900 p-2 rounded border border-slate-800">
                  <span class="text-slate-500 block text-[10px] uppercase font-sans">Map ID / Config</span>
                  <span class="text-amber-400 font-bold">Map 1 / Config 1001</span>
                </div>
                <div class="bg-slate-900 p-2 rounded border border-slate-800">
                  <span class="text-slate-500 block text-[10px] uppercase font-sans">Group Modes</span>
                  <span class="text-slate-200">Solo, Duo, Squad</span>
                </div>
                <div class="bg-slate-900 p-2 rounded border border-slate-800">
                  <span class="text-slate-500 block text-[10px] uppercase font-sans">Max Members</span>
                  <span class="text-slate-200">48 / 30 / 20 Players</span>
                </div>
              </div>

              <div class="space-y-1.5 text-xs text-slate-300">
                <div class="flex items-center space-x-2">
                  <svg class="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                  <span>Advertised in <code class="font-mono text-amber-400 text-[11px]">GameOpeningInfoReq</code> (Proto 3, Cmd 7)</span>
                </div>
                <div class="flex items-center space-x-2">
                  <svg class="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                  <span>Accepted in <code class="font-mono text-amber-400 text-[11px]">MatchmakingStartReq</code> queue</span>
                </div>
                <div class="flex items-center space-x-2">
                  <svg class="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                  <span>Custom Room creation rules & Classic drop presets enabled</span>
                </div>
              </div>
            </div>

            <div class="p-4 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between text-xs">
              <span class="text-slate-400">Match Mode: <strong class="text-slate-200">Classic (1)</strong></span>
              <span class="text-emerald-400 font-semibold flex items-center">
                <span class="w-2 h-2 rounded-full bg-emerald-400 mr-1.5"></span> Enabled
              </span>
            </div>
          </div>

          <!-- Card 2: Bermuda Ranked -->
          <div class="bg-slate-950 border border-amber-500/30 rounded-xl overflow-hidden flex flex-col justify-between">
            <div class="p-5 space-y-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <span class="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
                  <h3 class="text-lg font-bold text-slate-100">Bermuda Ranked</h3>
                </div>
                <span class="px-2.5 py-1 rounded text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  BR Ranked
                </span>
              </div>

              <p class="text-xs text-slate-400">
                Competitive Battle Royale survival on Bermuda. Features ranked rating, RP tiers, competitive point bonuses and season leaderboards.
              </p>

              <div class="grid grid-cols-2 gap-2 text-xs font-mono">
                <div class="bg-slate-900 p-2 rounded border border-slate-800">
                  <span class="text-slate-500 block text-[10px] uppercase font-sans">Game Mode ID</span>
                  <span class="text-emerald-400 font-bold">1 (BattleRoyale)</span>
                </div>
                <div class="bg-slate-900 p-2 rounded border border-slate-800">
                  <span class="text-slate-500 block text-[10px] uppercase font-sans">Map ID / Config</span>
                  <span class="text-amber-400 font-bold">Map 1 / Config 1001</span>
                </div>
                <div class="bg-slate-900 p-2 rounded border border-slate-800">
                  <span class="text-slate-500 block text-[10px] uppercase font-sans">Group Modes</span>
                  <span class="text-slate-200">Solo, Duo, Squad</span>
                </div>
                <div class="bg-slate-900 p-2 rounded border border-slate-800">
                  <span class="text-slate-500 block text-[10px] uppercase font-sans">Match Mode ID</span>
                  <span class="text-amber-400 font-bold">2 (RANKING)</span>
                </div>
              </div>

              <div class="space-y-1.5 text-xs text-slate-300">
                <div class="flex items-center space-x-2">
                  <svg class="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                  <span>Rank rating points & Tier settlement support</span>
                </div>
                <div class="flex items-center space-x-2">
                  <svg class="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                  <span>Rank level limits registered in <code class="font-mono text-amber-400 text-[11px]">ranking_level_limit_list</code></span>
                </div>
              </div>
            </div>

            <div class="p-4 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between text-xs">
              <span class="text-slate-400">Match Mode: <strong class="text-slate-200">Ranked BR (2)</strong></span>
              <span class="text-emerald-400 font-semibold flex items-center">
                <span class="w-2 h-2 rounded-full bg-emerald-400 mr-1.5"></span> Enabled
              </span>
            </div>
          </div>

          <!-- Card 3: Clash Squad -->
          <div class="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between">
            <div class="p-5 space-y-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <span class="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
                  <h3 class="text-lg font-bold text-slate-100">Clash Squad (CS)</h3>
                </div>
                <span class="px-2.5 py-1 rounded text-xs font-semibold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  Round-based 4v4
                </span>
              </div>

              <p class="text-xs text-slate-400">
                Tactical 4v4 round-based combat on Bermuda with buy phase economy, advanced custom room settings, and MVP screens.
              </p>

              <div class="grid grid-cols-2 gap-2 text-xs font-mono">
                <div class="bg-slate-900 p-2 rounded border border-slate-800">
                  <span class="text-slate-500 block text-[10px] uppercase font-sans">Game Mode ID</span>
                  <span class="text-sky-400 font-bold">15 (Clash Squad)</span>
                </div>
                <div class="bg-slate-900 p-2 rounded border border-slate-800">
                  <span class="text-slate-500 block text-[10px] uppercase font-sans">Map ID / Config</span>
                  <span class="text-amber-400 font-bold">Map 1 / Config 1015</span>
                </div>
                <div class="bg-slate-900 p-2 rounded border border-slate-800">
                  <span class="text-slate-500 block text-[10px] uppercase font-sans">Group Modes</span>
                  <span class="text-slate-200">Squad (4v4)</span>
                </div>
                <div class="bg-slate-900 p-2 rounded border border-slate-800">
                  <span class="text-slate-500 block text-[10px] uppercase font-sans">Max Members</span>
                  <span class="text-slate-200">8 / 6 / 4 / 2 Players</span>
                </div>
              </div>

              <div class="space-y-1.5 text-xs text-slate-300">
                <div class="flex items-center space-x-2">
                  <svg class="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                  <span>Advertised in <code class="font-mono text-amber-400 text-[11px]">GameOpeningInfoReq</code> (Proto 3, Cmd 7)</span>
                </div>
                <div class="flex items-center space-x-2">
                  <svg class="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                  <span>Accepted in <code class="font-mono text-amber-400 text-[11px]">MatchmakingStartReq</code> queue</span>
                </div>
                <div class="flex items-center space-x-2">
                  <svg class="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                  <span>CS Advanced Economy & Custom Room store configurations</span>
                </div>
              </div>
            </div>

            <div class="p-4 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between text-xs">
              <span class="text-slate-400">Match Mode: <strong class="text-slate-200">Casual (1) / Ranked (6)</strong></span>
              <span class="text-emerald-400 font-semibold flex items-center">
                <span class="w-2 h-2 rounded-full bg-emerald-400 mr-1.5"></span> Enabled
              </span>
            </div>
          </div>

          <!-- Card 4: Training Grounds -->
          <div class="bg-slate-950 border border-purple-500/30 rounded-xl overflow-hidden flex flex-col justify-between">
            <div class="p-5 space-y-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <span class="w-3 h-3 rounded-full bg-purple-400 animate-pulse"></span>
                  <h3 class="text-lg font-bold text-slate-100">Training Grounds</h3>
                </div>
                <span class="px-2.5 py-1 rounded text-xs font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  Target & Combat Practice
                </span>
              </div>

              <p class="text-xs text-slate-400">
                Alpha Island training facility. Features weapon testing range, moving target practice, and free-for-all combat ring with instant respawn.
              </p>

              <div class="grid grid-cols-2 gap-2 text-xs font-mono">
                <div class="bg-slate-900 p-2 rounded border border-slate-800">
                  <span class="text-slate-500 block text-[10px] uppercase font-sans">Game Mode ID</span>
                  <span class="text-purple-400 font-bold">23 (GameMode_Training)</span>
                </div>
                <div class="bg-slate-900 p-2 rounded border border-slate-800">
                  <span class="text-slate-500 block text-[10px] uppercase font-sans">Map ID / Config</span>
                  <span class="text-amber-400 font-bold">Map 7 / Config 7023</span>
                </div>
                <div class="bg-slate-900 p-2 rounded border border-slate-800">
                  <span class="text-slate-500 block text-[10px] uppercase font-sans">Group Modes</span>
                  <span class="text-slate-200">Solo Practice, Combat Zone</span>
                </div>
                <div class="bg-slate-900 p-2 rounded border border-slate-800">
                  <span class="text-slate-500 block text-[10px] uppercase font-sans">Match Mode ID</span>
                  <span class="text-purple-400 font-bold">5 (MatchMode_TRAINING)</span>
                </div>
              </div>

              <div class="space-y-1.5 text-xs text-slate-300">
                <div class="flex items-center space-x-2">
                  <svg class="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                  <span>Scene: <code class="font-mono text-purple-400 text-[11px]">SCENE_PVP_ALPHAISLAND</code> (Config 7023)</span>
                </div>
                <div class="flex items-center space-x-2">
                  <svg class="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                  <span>No waiting island, no parachute drops, no safezone shrink</span>
                </div>
                <div class="flex items-center space-x-2">
                  <svg class="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                  <span>Instant weapon rack pickup & target practice</span>
                </div>
              </div>
            </div>

            <div class="p-4 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between text-xs">
              <span class="text-slate-400">Match Mode: <strong class="text-slate-200">Training (5)</strong></span>
              <span class="text-emerald-400 font-semibold flex items-center">
                <span class="w-2 h-2 rounded-full bg-emerald-400 mr-1.5"></span> Enabled
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- TAB: Shop & Lucky Royale -->
    <section id="tab-shop" class="tab-content hidden space-y-6">
      <!-- Lucky Royale Management & Simulator Card -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div class="flex items-center space-x-2">
              <span class="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
              <h2 class="text-base font-semibold text-slate-100">Lucky Royale Management & Simulator</h2>
            </div>
            <p class="text-xs text-slate-400">Configure wheels, customize prize pools, calibrate drop odds, and simulate live gacha pulls</p>
          </div>
          <div class="flex items-center space-x-2 text-xs">
            <span class="px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">Endpoints: GetGachaDesc (153) • GetGachaInfo (154) • PurchaseGacha (158)</span>
          </div>
        </div>

        <!-- Wheel Selector Tabs & Add Wheel Button -->
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div class="flex flex-wrap items-center gap-2" id="wheel-selector-buttons">
            <!-- Populated dynamically by loadWheels() -->
          </div>
          <button onclick="openAddWheelModal()" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center shadow-lg shadow-emerald-950">
            <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            + Add Wheel
          </button>
        </div>

        <!-- Active Wheel Action Box -->
        <div class="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="space-y-1 text-center md:text-left">
            <div class="flex items-center justify-center md:justify-start space-x-2">
              <h3 id="active-wheel-title" class="text-base font-bold text-slate-100">Diamond Royale</h3>
              <span id="active-wheel-badge" class="px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-500/20 text-sky-400 border border-sky-500/30">Diamonds</span>
              <span id="active-wheel-id-badge" class="px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-800">Chest #1001</span>
            </div>
            <p id="active-wheel-grandprize" class="text-xs text-amber-400">Grand Prize: Sakura Kimono Bundle (Legendary)</p>
          </div>
          <div class="flex flex-wrap items-center justify-center gap-2">
            <button onclick="openEditWheelModal()" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center">
              <svg class="w-3.5 h-3.5 mr-1 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              Edit Wheel
            </button>
            <button onclick="deleteActiveWheel()" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition flex items-center">
              <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              Delete
            </button>
            <div class="h-6 w-px bg-slate-800 mx-1 hidden sm:block"></div>
            <button id="btn-spin-1" onclick="spinActiveWheel(1)" class="px-4 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/10 transition flex items-center">
              <span>Spin 1x</span>
              <span id="spin-1-price" class="ml-1.5 font-mono text-[11px] opacity-80">(60 💎)</span>
            </button>
            <button id="btn-spin-10" onclick="spinActiveWheel(10)" class="px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition flex items-center">
              <span>Spin 10+1x</span>
              <span id="spin-10-price" class="ml-1.5 font-mono text-[11px] opacity-80">(540 💎)</span>
            </button>
          </div>
        </div>

        <!-- Spin Results Display Box -->
        <div id="spin-results-box" class="hidden bg-slate-950 border border-amber-500/40 rounded-xl p-4 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center">
              <span class="w-2 h-2 rounded-full bg-amber-400 mr-2"></span> Spin Outcome (<span id="spin-drop-count">0</span> items)
            </span>
            <span id="jackpot-alert" class="hidden px-2.5 py-0.5 rounded text-xs font-bold bg-amber-500 text-slate-950 animate-bounce">
              ★ GRAND PRIZE WON! ★
            </span>
          </div>
          <div id="spin-drops-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            <!-- Dynamic drop cards -->
          </div>
        </div>

        <!-- Reward Pool Preview & Management Header -->
        <div class="space-y-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-400">Available Prize Pool & Drop Odds</h4>
              <p class="text-[11px] text-slate-500">Tune individual drop weights to control exact item probabilities for clients</p>
            </div>
            <button onclick="openAddPrizeModal()" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition flex items-center self-start sm:self-auto">
              <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              + Add Prize to Pool
            </button>
          </div>
          <div id="wheel-pool-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            <!-- Dynamic pool list -->
          </div>
        </div>
      </div>

      <!-- Shop Catalog Section & Item Management -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div class="flex items-center space-x-2">
              <span class="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse"></span>
              <h2 class="text-base font-semibold text-slate-100">In-Game Store Catalog & Mall Management</h2>
            </div>
            <p class="text-xs text-slate-400">Add, edit, discount, or remove characters, outfits, weapons, emotes, and pets delivered via GetStore (CSGetStoreRes)</p>
          </div>

          <!-- Store Stats & Top Actions -->
          <div class="flex flex-wrap items-center gap-2">
            <div class="flex items-center space-x-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5">
              <span class="text-slate-400">Total Items:</span>
              <span id="stat-shop-total" class="font-bold text-amber-400">0</span>
            </div>
            <button onclick="openAddStoreItemModal()" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/10 transition flex items-center">
              <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              + Add Store Item
            </button>
            <button onclick="resetShopCatalog()" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition" title="Restore standard default catalog">
              Reset Catalog
            </button>
          </div>
        </div>

        <!-- Filter, Category & Search Bar -->
        <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          <!-- Shop Category Filters -->
          <div class="flex items-center space-x-1.5 overflow-x-auto text-xs font-medium pb-1 md:pb-0">
            <button onclick="filterShop('all')" id="shop-filter-all" class="shop-filter-btn px-2.5 py-1 rounded bg-amber-500 text-slate-950 font-bold whitespace-nowrap">All</button>
            <button onclick="filterShop('7')" id="shop-filter-7" class="shop-filter-btn px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 whitespace-nowrap">Characters</button>
            <button onclick="filterShop('8')" id="shop-filter-8" class="shop-filter-btn px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 whitespace-nowrap">Bundles</button>
            <button onclick="filterShop('9')" id="shop-filter-9" class="shop-filter-btn px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 whitespace-nowrap">Weapons</button>
            <button onclick="filterShop('11')" id="shop-filter-11" class="shop-filter-btn px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 whitespace-nowrap">Emotes</button>
            <button onclick="filterShop('12')" id="shop-filter-12" class="shop-filter-btn px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 whitespace-nowrap">Pets</button>
            <button onclick="filterShop('6')" id="shop-filter-6" class="shop-filter-btn px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 whitespace-nowrap">Fashion</button>
            <button onclick="filterShop('10')" id="shop-filter-10" class="shop-filter-btn px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 whitespace-nowrap">Props</button>
          </div>

          <!-- Tag & Search Filters -->
          <div class="flex items-center space-x-2">
            <select id="shop-tag-select" onchange="filterShopByTag(this.value)" class="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-amber-500">
              <option value="all">All Tags</option>
              <option value="0">Regular (None)</option>
              <option value="1">Discount / Sale</option>
              <option value="2">Hot</option>
              <option value="3">New</option>
              <option value="4">Limited Time</option>
            </select>
            <div class="relative flex-1 sm:w-56">
              <input id="input-shop-search" oninput="onShopSearch(this.value)" type="text" placeholder="Search by name or ID..." class="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500" />
              <svg class="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
          </div>
        </div>

        <!-- Store Grid -->
        <div id="shop-items-grid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <!-- Populated by JavaScript -->
        </div>
      </div>
    </section>

    <!-- TAB: Global Rankings (Bermuda & Clash Squad) -->
    <section id="tab-rankings" class="tab-content hidden space-y-6">
      <!-- Mode & Metric Switcher Bar -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div class="flex items-center space-x-2">
              <span class="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
              <h2 class="text-base font-semibold text-slate-100">Global Leaderboard Service</h2>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">Season 7 Active</span>
            </div>
            <p class="text-xs text-slate-400">Track and display global player standings across Bermuda Battle Royale and Clash Squad 4v4 modes</p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <!-- Mode Switcher -->
            <div class="bg-slate-950 border border-slate-800 rounded-lg p-1 flex space-x-1">
              <button onclick="setRankingMode('bermuda')" id="rank-mode-btn-bermuda" class="rank-mode-btn px-3 py-1.5 rounded-md text-xs font-bold bg-amber-500 text-slate-950 transition flex items-center space-x-1.5">
                <span>🌴</span>
                <span>Bermuda (BR)</span>
              </button>
              <button onclick="setRankingMode('clash_squad')" id="rank-mode-btn-clash_squad" class="rank-mode-btn px-3 py-1.5 rounded-md text-xs font-semibold bg-transparent text-slate-400 hover:text-slate-200 transition flex items-center space-x-1.5">
                <span>⚔️</span>
                <span>Clash Squad (CS)</span>
              </button>
            </div>

            <!-- Record Match Button -->
            <button onclick="openMatchSimModal()" class="px-3.5 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 transition flex items-center shadow-lg shadow-amber-950">
              <svg class="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Simulate Match Result
            </button>
          </div>
        </div>

        <!-- Filter & Search Toolbar -->
        <div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
          <!-- Metric Selectors -->
          <div class="flex items-center space-x-1.5 text-xs">
            <span class="text-slate-500 font-medium mr-1">Sort By:</span>
            <button onclick="setRankingMetric('score')" id="rank-metric-btn-score" class="rank-metric-btn px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold transition">
              🏆 Ranked Rating (<span id="metric-score-label">RP</span>)
            </button>
            <button onclick="setRankingMetric('kills')" id="rank-metric-btn-kills" class="rank-metric-btn px-2.5 py-1 rounded bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700 transition">
              🎯 Total Kills
            </button>
            <button onclick="setRankingMetric('wins')" id="rank-metric-btn-wins" class="rank-metric-btn px-2.5 py-1 rounded bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700 transition">
              👑 Booyahs (Wins)
            </button>
          </div>

          <div class="flex items-center space-x-2">
            <!-- Region Filter -->
            <select id="rank-region-select" onchange="setRankingRegion(this.value)" class="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-amber-500">
              <option value="GLOBAL">🌐 Global (All Regions)</option>
              <option value="BR">🇧🇷 Brazil (BR)</option>
              <option value="IND">🇮🇳 India (IND)</option>
              <option value="NA">🇺🇸 North America (NA)</option>
              <option value="EU">🇪🇺 Europe (EU)</option>
              <option value="SG">🇸🇬 Southeast Asia (SG)</option>
              <option value="ID">🇮🇩 Indonesia (ID)</option>
            </select>

            <!-- Search Filter -->
            <div class="relative">
              <input type="text" id="rank-search-input" onkeyup="filterRankingList()" placeholder="Filter player or UID..." class="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-amber-500 w-44 sm:w-56" />
              <svg class="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Overview Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- #1 Champion Card -->
        <div class="bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/40 rounded-xl p-4 flex items-center space-x-3.5">
          <div class="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl shrink-0">
            👑
          </div>
          <div class="overflow-hidden">
            <span class="text-[11px] font-semibold text-amber-400 uppercase tracking-wider block">Global #1 Champion</span>
            <h3 id="rank-top1-name" class="font-bold text-slate-100 truncate text-sm">--</h3>
            <span id="rank-top1-stat" class="text-xs text-amber-300 font-mono">--</span>
          </div>
        </div>

        <!-- Grandmaster Threshold Card -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center space-x-3.5">
          <div class="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-2xl shrink-0">
            💎
          </div>
          <div>
            <span class="text-[11px] font-semibold text-purple-400 uppercase tracking-wider block">Grandmaster Cutoff</span>
            <div class="flex items-baseline space-x-2">
              <span id="rank-gm-threshold" class="text-lg font-bold text-slate-100 font-mono">4,000 RP</span>
              <span class="text-[11px] text-slate-500">Top 100</span>
            </div>
            <span class="text-xs text-slate-400">Heroic cutoff: <span id="rank-heroic-threshold" class="font-mono text-slate-200">3,200 RP</span></span>
          </div>
        </div>

        <!-- Total Ranked Players -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center space-x-3.5">
          <div class="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-2xl shrink-0">
            👥
          </div>
          <div>
            <span class="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block">Total Competitors</span>
            <div class="flex items-baseline space-x-2">
              <span id="rank-total-players" class="text-lg font-bold text-slate-100 font-mono">--</span>
              <span class="text-[11px] text-slate-500">Tracked</span>
            </div>
            <span class="text-xs text-slate-400">Grandmasters: <span id="rank-gm-count" class="font-mono text-amber-400">--</span></span>
          </div>
        </div>

        <!-- Protocol Endpoints Card -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center space-x-3.5">
          <div class="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-2xl shrink-0">
            📡
          </div>
          <div>
            <span class="text-[11px] font-semibold text-sky-400 uppercase tracking-wider block">Client Sync</span>
            <div class="flex items-baseline space-x-2">
              <span class="text-sm font-bold text-slate-200">Protobuf v3</span>
            </div>
            <span class="text-xs text-slate-400 font-mono">Leaderboard (39) • TopN</span>
          </div>
        </div>
      </div>

      <!-- Top 3 Podium -->
      <div id="rank-podium-container" class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <!-- Populated by JavaScript -->
      </div>

      <!-- Leaderboard Table -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div class="p-4 border-b border-slate-800 flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <h3 class="font-semibold text-slate-200 text-sm">Global Player Standings</h3>
            <span id="rank-table-count" class="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400">0 players</span>
          </div>
          <div class="text-xs text-slate-400 flex items-center space-x-2">
            <span>Showing top 50 competitors</span>
            <button onclick="loadRankingsData()" class="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-950 text-slate-400 font-medium uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th class="py-3 px-4 w-14 text-center">Rank</th>
                <th class="py-3 px-4">Player</th>
                <th class="py-3 px-4">Tier</th>
                <th class="py-3 px-4 text-right" id="th-rating-col">Ranked Rating</th>
                <th class="py-3 px-4 text-right">Kills (K/D)</th>
                <th class="py-3 px-4 text-right">Booyahs (Win %)</th>
                <th class="py-3 px-4 text-right">Matches</th>
                <th class="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody id="rank-table-body" class="divide-y divide-slate-800/60 font-medium">
              <!-- Populated by JavaScript -->
            </tbody>
          </table>
        </div>
      </div>

      <!-- Match Simulation Modal -->
      <div id="match-sim-modal" class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm hidden flex items-center justify-center p-4">
        <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
          <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <div class="flex items-center space-x-2">
              <span class="text-xl">⚡</span>
              <h3 class="text-base font-bold text-slate-100">Simulate Match Settlement</h3>
            </div>
            <button onclick="closeMatchSimModal()" class="text-slate-400 hover:text-slate-200 text-lg">&times;</button>
          </div>

          <form onsubmit="handleSimulateMatchSubmit(event)" class="space-y-4 text-xs">
            <div>
              <label class="block text-slate-300 font-medium mb-1">Target Player</label>
              <select id="sim-player-select" required class="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-amber-500">
                <!-- Populated dynamically -->
              </select>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-slate-300 font-medium mb-1">Mode</label>
                <select id="sim-mode-select" class="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-amber-500">
                  <option value="bermuda">🌴 Bermuda (Battle Royale)</option>
                  <option value="clash_squad">⚔️ Clash Squad (4v4 CS)</option>
                </select>
              </div>

              <div>
                <label class="block text-slate-300 font-medium mb-1">Outcome</label>
                <select id="sim-outcome-select" class="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-amber-500">
                  <option value="win">👑 Victory (Booyah!)</option>
                  <option value="loss">💀 Defeat</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="block text-slate-300 font-medium mb-1">Eliminations (Kills)</label>
                <input type="number" id="sim-kills-input" min="0" max="40" value="5" class="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-amber-500" />
              </div>
              <div>
                <label class="block text-slate-300 font-medium mb-1">Deaths</label>
                <input type="number" id="sim-deaths-input" min="0" max="15" value="1" class="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-amber-500" />
              </div>
              <div>
                <label class="block text-slate-300 font-medium mb-1">Damage Dealt</label>
                <input type="number" id="sim-damage-input" min="0" max="10000" value="1850" class="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-amber-500" />
              </div>
            </div>

            <div class="pt-2">
              <label class="block text-slate-400 font-normal mb-1">Optional Score Delta (+RP or +Stars override, leave blank for auto-calc)</label>
              <input type="number" id="sim-delta-input" placeholder="e.g. +35 or -15" class="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-amber-500" />
            </div>

            <div id="sim-feedback-box" class="hidden p-3 rounded-lg text-xs"></div>

            <div class="flex items-center justify-end space-x-2 pt-2">
              <button type="button" onclick="closeMatchSimModal()" class="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition">
                Cancel
              </button>
              <button type="submit" id="btn-submit-match-sim" class="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition flex items-center">
                <span>Record & Settle Match</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>

    <!-- TAB 2: Accounts Management -->
    <section id="tab-accounts" class="tab-content hidden space-y-6">
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 class="text-base font-semibold text-slate-100">Registered Accounts</h2>
            <p class="text-xs text-slate-400">View, search, create, and manage player accounts in the database</p>
          </div>
          <div class="flex items-center space-x-2">
            <input
              id="input-search-account"
              type="text"
              placeholder="Search nickname or UID..."
              oninput="debounceSearch()"
              class="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 w-52 sm:w-64"
            />
            <button onclick="openCreateAccountModal()" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition">
              + New Account
            </button>
          </div>
        </div>

        <!-- Accounts Table -->
        <div class="overflow-x-auto rounded-lg border border-slate-800">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th class="py-3 px-4">UID</th>
                <th class="py-3 px-4">Nickname</th>
                <th class="py-3 px-4">Level</th>
                <th class="py-3 px-4">Role</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4">Created</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody id="accounts-table-body" class="divide-y divide-slate-800/60 font-mono text-slate-300">
              <tr>
                <td colspan="7" class="py-6 text-center text-slate-500 font-sans">Loading accounts...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- TAB 3: Endpoints Explorer -->
    <section id="tab-endpoints" class="tab-content hidden space-y-4">
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 class="text-base font-semibold text-slate-100">COW Protocol Endpoints Catalog</h2>
            <p class="text-xs text-slate-400">Binary protocol command definitions mapped to Protobuf request/response messages</p>
          </div>
          <input
            id="input-search-endpoint"
            type="text"
            placeholder="Filter endpoint name or command..."
            oninput="filterEndpoints()"
            class="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 w-64"
          />
        </div>

        <div class="overflow-x-auto rounded-lg border border-slate-800 max-h-[600px]">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 sticky top-0">
              <tr>
                <th class="py-3 px-4">Endpoint</th>
                <th class="py-3 px-4">Cmd Hex</th>
                <th class="py-3 px-4">Request Type</th>
                <th class="py-3 px-4">Response Type</th>
                <th class="py-3 px-4">Caller Reference</th>
              </tr>
            </thead>
            <tbody id="endpoints-table-body" class="divide-y divide-slate-800/60 font-mono text-slate-300">
              <tr>
                <td colspan="5" class="py-6 text-center text-slate-500 font-sans">Loading endpoints catalog...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- TAB 4: System & Config -->
    <section id="tab-system" class="tab-content hidden space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 text-xs">
          <h2 class="text-base font-semibold text-slate-100 font-sans">Architecture & Ports</h2>
          <div class="divide-y divide-slate-800/60">
            <div class="py-2 flex justify-between">
              <span class="text-slate-400">Service Architecture</span>
              <span class="font-mono text-slate-200">Unified Mode (Port 3000)</span>
            </div>
            <div class="py-2 flex justify-between">
              <span class="text-slate-400">Public HTTP Port</span>
              <span class="font-mono text-slate-200">3000 (0.0.0.0)</span>
            </div>
            <div class="py-2 flex justify-between">
              <span class="text-slate-400">TCP Gateway Port</span>
              <span class="font-mono text-slate-200">10300 (or internal 8084)</span>
            </div>
            <div class="py-2 flex justify-between">
              <span class="text-slate-400">Game Client Version</span>
              <span class="font-mono text-slate-200">1.70.0 (Server v1.70.1)</span>
            </div>
            <div class="py-2 flex justify-between">
              <span class="text-slate-400">Database Storage</span>
              <span class="font-mono text-slate-200">better-sqlite3 (WAL Mode)</span>
            </div>
            <div class="py-2 flex justify-between">
              <span class="text-slate-400">Event Bus Engine</span>
              <span id="sys-bus-mode" class="font-mono text-slate-200">In-Memory Bus / Redis Compatible</span>
            </div>
          </div>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 text-xs">
          <h2 class="text-base font-semibold text-slate-100 font-sans">Runtime Environment</h2>
          <div class="divide-y divide-slate-800/60">
            <div class="py-2 flex justify-between">
              <span class="text-slate-400">Node.js Version</span>
              <span id="sys-node-ver" class="font-mono text-slate-200">--</span>
            </div>
            <div class="py-2 flex justify-between">
              <span class="text-slate-400">Platform</span>
              <span id="sys-platform" class="font-mono text-slate-200">--</span>
            </div>
            <div class="py-2 flex justify-between">
              <span class="text-slate-400">Process Memory (RSS)</span>
              <span id="sys-mem" class="font-mono text-slate-200">--</span>
            </div>
            <div class="py-2 flex justify-between">
              <span class="text-slate-400">AES Cipher Key</span>
              <span class="font-mono text-slate-200">Static 16-byte Garena COW key</span>
            </div>
            <div class="py-2 flex justify-between">
              <span class="text-slate-400">JWT Matchmaker Secret</span>
              <span class="font-mono text-slate-200">Configured / Active</span>
            </div>
            <div class="py-2 flex justify-between">
              <span class="text-slate-400">Environment Node</span>
              <span id="sys-node-id" class="font-mono text-slate-200">--</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>

  <!-- Create Account Modal -->
  <div id="modal-create-account" class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
    <div class="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-semibold text-slate-100">Create Test Account</h3>
        <button onclick="closeCreateAccountModal()" class="text-slate-400 hover:text-slate-200">✕</button>
      </div>
      <form id="form-create-account" onsubmit="handleCreateAccount(event)" class="space-y-3 text-xs">
        <div>
          <label class="block text-slate-400 mb-1">Nickname</label>
          <input id="create-nickname" type="text" required placeholder="e.g. ShadowHunter" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-slate-400 mb-1">Initial Level</label>
            <input id="create-level" type="number" min="1" max="100" value="1" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500" />
          </div>
          <div>
            <label class="block text-slate-400 mb-1">Initial Gold</label>
            <input id="create-gold" type="number" min="0" value="5000" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500" />
          </div>
        </div>
        <div class="flex justify-end space-x-2 pt-2">
          <button type="button" onclick="closeCreateAccountModal()" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300">Cancel</button>
          <button type="submit" class="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold">Create Account</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Store Item Modal (Add & Edit) -->
  <div id="modal-store-item" class="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
    <div class="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 id="modal-store-title" class="text-sm font-bold text-slate-100 flex items-center">
          <span class="w-2 h-2 rounded-full bg-amber-400 mr-2"></span> Add Store Item
        </h3>
        <button onclick="closeStoreItemModal()" class="text-slate-400 hover:text-slate-200 text-sm">✕</button>
      </div>
      <form id="form-store-item" onsubmit="saveStoreItem(event)" class="space-y-3 text-xs">
        <input type="hidden" id="store-form-id" value="" />
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-slate-300 mb-1 font-medium">Item ID (In-game ID) *</label>
            <input id="store-input-item-id" type="number" required placeholder="e.g. 102000035" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-amber-500" />
            <span class="text-[10px] text-slate-500">Character, skin, bundle or emote ID</span>
          </div>
          <div>
            <label class="block text-slate-300 mb-1 font-medium">Category *</label>
            <select id="store-input-category" required class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500">
              <option value="7;0">Characters (Tab 7)</option>
              <option value="8;0">Bundles & Outfits (Tab 8)</option>
              <option value="9;0">Weapon Skins (Tab 9)</option>
              <option value="11;0">Emotes & Collections (Tab 11)</option>
              <option value="12;0">Pet Companions (Tab 12)</option>
              <option value="6;0">Fashion & Clothes (Tab 6)</option>
              <option value="10;0">Crates & Consumables (Tab 10)</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-slate-300 mb-1 font-medium">Item Name *</label>
          <input id="store-input-name" type="text" required placeholder="e.g. DJ Alok, Sakura Kimono Bundle" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500" />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label class="block text-slate-300 mb-1 font-medium">Diamonds (💎) Price</label>
            <input id="store-input-gems" type="number" min="0" value="0" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-amber-500" />
          </div>
          <div>
            <label class="block text-slate-300 mb-1 font-medium">Gold Coins (🪙) Price</label>
            <input id="store-input-coins" type="number" min="0" value="0" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-amber-500" />
          </div>
          <div>
            <label class="block text-slate-300 mb-1 font-medium">Discount Price (💎)</label>
            <input id="store-input-discount" type="number" min="0" value="0" placeholder="0 = no discount" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-amber-500" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-slate-300 mb-1 font-medium">Tag Badge</label>
            <select id="store-input-tag" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500">
              <option value="0">None (Normal)</option>
              <option value="1">Sale / Discount (1)</option>
              <option value="2">Hot (2)</option>
              <option value="3">New (3)</option>
              <option value="4">Limited Time (4)</option>
            </select>
          </div>
          <div class="flex items-center space-x-4 pt-5">
            <label class="flex items-center space-x-2 cursor-pointer text-slate-300">
              <input id="store-input-recommended" type="checkbox" class="rounded bg-slate-950 border-slate-800 text-amber-500 focus:ring-0" />
              <span>Recommended</span>
            </label>
            <label class="flex items-center space-x-2 cursor-pointer text-slate-300">
              <input id="store-input-new" type="checkbox" class="rounded bg-slate-950 border-slate-800 text-amber-500 focus:ring-0" />
              <span>New Flag</span>
            </label>
          </div>
        </div>

        <div>
          <label class="block text-slate-300 mb-1 font-medium">Description</label>
          <textarea id="store-input-desc" rows="2" placeholder="Item description, active skill stats, lore..." class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"></textarea>
        </div>

        <div class="flex justify-end space-x-2 pt-3 border-t border-slate-800">
          <button type="button" onclick="closeStoreItemModal()" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition">Cancel</button>
          <button type="submit" id="btn-save-store-item" class="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition">Save Item</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Lucky Royale Wheel Modal (Add & Edit) -->
  <div id="modal-gacha-wheel" class="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
    <div class="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 id="modal-wheel-title" class="text-sm font-bold text-slate-100 flex items-center">
          <span class="w-2 h-2 rounded-full bg-emerald-400 mr-2"></span> Add Lucky Royale Wheel
        </h3>
        <button onclick="closeWheelModal()" class="text-slate-400 hover:text-slate-200 text-sm">✕</button>
      </div>
      <form id="form-gacha-wheel" onsubmit="saveWheel(event)" class="space-y-3 text-xs">
        <input type="hidden" id="wheel-form-id" value="" />

        <div>
          <label class="block text-slate-300 mb-1 font-medium">Wheel Chest ID *</label>
          <input id="wheel-input-id" type="number" required placeholder="e.g. 1006" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-amber-500" />
          <span class="text-[10px] text-slate-500">Unique numeric chest identifier</span>
        </div>

        <div>
          <label class="block text-slate-300 mb-1 font-medium">Wheel Name *</label>
          <input id="wheel-input-name" type="text" required placeholder="e.g. Hyperbook Royale, Supercar Wheel" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500" />
        </div>

        <div>
          <label class="block text-slate-300 mb-1 font-medium">Spin Currency *</label>
          <select id="wheel-input-coin-type" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500">
            <option value="2">Diamonds (💎 Gems)</option>
            <option value="1">Gold Coins (🪙 Gold)</option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-slate-300 mb-1 font-medium">Spin 1x Price</label>
            <input id="wheel-input-once-price" type="number" min="1" required value="60" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-amber-500" />
          </div>
          <div>
            <label class="block text-slate-300 mb-1 font-medium">Spin 10+1x Price</label>
            <input id="wheel-input-ten-price" type="number" min="1" required value="540" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-amber-500" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-slate-300 mb-1 font-medium">Grand Prize Item ID *</label>
            <input id="wheel-input-gp-id" type="number" required placeholder="e.g. 203000181" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-amber-500" />
          </div>
          <div>
            <label class="block text-slate-300 mb-1 font-medium">Grand Prize Name *</label>
            <input id="wheel-input-gp-name" type="text" required placeholder="e.g. Sakura Kimono Bundle" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500" />
          </div>
        </div>

        <div class="flex justify-end space-x-2 pt-3 border-t border-slate-800">
          <button type="button" onclick="closeWheelModal()" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition">Cancel</button>
          <button type="submit" id="btn-save-wheel" class="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition">Save Wheel</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Lucky Royale Prize Pool Item Modal (Add & Edit) -->
  <div id="modal-gacha-prize" class="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
    <div class="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 id="modal-prize-title" class="text-sm font-bold text-slate-100 flex items-center">
          <span class="w-2 h-2 rounded-full bg-amber-400 mr-2"></span> Add Prize to Pool
        </h3>
        <button onclick="closePrizeModal()" class="text-slate-400 hover:text-slate-200 text-sm">✕</button>
      </div>
      <form id="form-gacha-prize" onsubmit="savePrize(event)" class="space-y-3 text-xs">
        <input type="hidden" id="prize-form-chest-id" value="" />
        <input type="hidden" id="prize-form-old-item-id" value="" />

        <div>
          <label class="block text-slate-300 mb-1 font-medium">Item ID *</label>
          <input id="prize-input-id" type="number" required placeholder="e.g. 102000004" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-amber-500" />
        </div>

        <div>
          <label class="block text-slate-300 mb-1 font-medium">Item Name *</label>
          <input id="prize-input-name" type="text" required placeholder="e.g. AK47 Blue Flame Draco" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-slate-300 mb-1 font-medium">Rarity / Glow</label>
            <select id="prize-input-level" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500">
              <option value="3">Legendary ★★★ (Gold)</option>
              <option value="2">Rare ★★ (Purple)</option>
              <option value="1">Normal ★ (Standard)</option>
            </select>
          </div>
          <div>
            <label class="block text-slate-300 mb-1 font-medium">Drop Weight *</label>
            <input id="prize-input-weight" type="number" min="1" max="1000" required value="10" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-amber-500" />
          </div>
        </div>

        <p class="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
          💡 <span class="font-semibold text-slate-300">Drop Odds Hint:</span> Drop percentage = (Item Weight / Total Pool Weight) × 100%. Set lower weight (e.g. 3) for jackpot, higher weight (e.g. 50) for common drops.
        </p>

        <div class="flex justify-end space-x-2 pt-3 border-t border-slate-800">
          <button type="button" onclick="closePrizeModal()" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition">Cancel</button>
          <button type="submit" id="btn-save-prize" class="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition">Save Prize</button>
        </div>
      </form>
    </div>
  </div>

  <script>
    let allEndpoints = [];
    let searchDebounceTimer = null;

    function switchTab(tabId) {
      document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
      document.querySelectorAll('.tab-btn').forEach(el => {
        el.classList.remove('border-amber-500', 'text-amber-400');
        el.classList.add('border-transparent', 'text-slate-400');
      });
      const target = document.getElementById(tabId);
      if (target) target.classList.remove('hidden');
      const btn = document.getElementById('tab-btn-' + tabId.replace('tab-', ''));
      if (btn) {
        btn.classList.add('border-amber-500', 'text-amber-400');
        btn.classList.remove('border-transparent', 'text-slate-400');
      }
      if (tabId === 'tab-endpoints' && allEndpoints.length === 0) {
        loadEndpoints();
      }
      if (tabId === 'tab-shop') {
        loadShopData();
      }
      if (tabId === 'tab-rankings') {
        loadRankingsData();
      }
    }

    async function loadAllData() {
      await Promise.all([loadStats(), loadAccounts(), loadRankingsSummary(), loadShopData()]);
    }

    async function loadStats() {
      try {
        const res = await fetch('/api/stats');
        if (!res.ok) return;
        const data = await res.json();
        document.getElementById('stat-accounts').textContent = data.accountsCount ?? '--';
        document.getElementById('stat-online').textContent = data.onlineCount ?? '0';
        document.getElementById('stat-endpoints').textContent = data.endpointsCount ?? '494';
        document.getElementById('stat-uptime').textContent = formatUptime(data.uptimeSec ?? 0);
        
        if (data.system) {
          document.getElementById('sys-node-ver').textContent = data.system.nodeVersion || '--';
          document.getElementById('sys-platform').textContent = data.system.platform || '--';
          document.getElementById('sys-mem').textContent = data.system.memoryRss || '--';
          document.getElementById('sys-node-id').textContent = data.system.nodeId || '--';
        }
      } catch (err) {
        console.warn('Failed to load stats:', err);
      }
    }

    function formatUptime(sec) {
      if (!sec) return '0s';
      const d = Math.floor(sec / 86400);
      const h = Math.floor((sec % 86400) / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = Math.floor(sec % 60);
      if (d > 0) return d + 'd ' + h + 'h';
      if (h > 0) return h + 'h ' + m + 'm';
      if (m > 0) return m + 'm ' + s + 's';
      return s + 's';
    }

    async function loadAccounts(searchQuery = '') {
      const tbody = document.getElementById('accounts-table-body');
      try {
        const url = searchQuery ? '/api/accounts?q=' + encodeURIComponent(searchQuery) : '/api/accounts';
        const res = await fetch(url);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        const list = data.accounts || [];
        if (list.length === 0) {
          tbody.innerHTML = '<tr><td colspan="7" class="py-6 text-center text-slate-500 font-sans">No accounts found. Click "+ New Account" to create one.</td></tr>';
          return;
        }
        tbody.innerHTML = list.map(acc => {
          const isBanned = acc.banned === true || acc.banned === 1;
          const statusBadge = isBanned
            ? '<span class="px-2 py-0.5 rounded text-xs bg-rose-500/15 text-rose-400 border border-rose-500/30">Banned</span>'
            : '<span class="px-2 py-0.5 rounded text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">Active</span>';
          const createdStr = acc.created_at ? new Date(acc.created_at * 1000).toLocaleDateString() : 'N/A';
          return \`
            <tr class="hover:bg-slate-800/40 transition">
              <td class="py-3 px-4 font-bold text-slate-200">#\${acc.account_id || acc.uid}</td>
              <td class="py-3 px-4 font-sans text-slate-100 font-medium">\${escapeHtml(acc.nickname || 'Guest')}</td>
              <td class="py-3 px-4">Lv.\${acc.level || 1}</td>
              <td class="py-3 px-4 font-sans text-slate-400">\${acc.role === 1 ? 'Admin' : 'Player'}</td>
              <td class="py-3 px-4 font-sans">\${statusBadge}</td>
              <td class="py-3 px-4 text-slate-500 font-sans">\${createdStr}</td>
              <td class="py-3 px-4 text-right space-x-1.5 font-sans">
                <button onclick="toggleBan(\${acc.account_id || acc.uid}, \${!isBanned})" class="px-2 py-1 rounded text-xs \${isBanned ? 'bg-slate-800 text-emerald-400 hover:bg-slate-700' : 'bg-slate-800 text-rose-400 hover:bg-slate-700'}">
                  \${isBanned ? 'Unban' : 'Ban'}
                </button>
              </td>
            </tr>
          \`;
        }).join('');
      } catch (err) {
        tbody.innerHTML = '<tr><td colspan="7" class="py-6 text-center text-rose-400 font-sans">Error loading accounts: ' + escapeHtml(err.message) + '</td></tr>';
      }
    }

    function debounceSearch() {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        const query = document.getElementById('input-search-account').value.trim();
        loadAccounts(query);
      }, 300);
    }

    async function toggleBan(uid, shouldBan) {
      try {
        const action = shouldBan ? 'ban' : 'unban';
        const res = await fetch('/api/accounts/' + uid + '/' + action, { method: 'POST' });
        if (res.ok) {
          loadAccounts(document.getElementById('input-search-account').value.trim());
          loadStats();
        }
      } catch (err) {
        alert('Action failed: ' + err.message);
      }
    }

    async function loadEndpoints() {
      const tbody = document.getElementById('endpoints-table-body');
      try {
        const res = await fetch('/api/endpoints');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        allEndpoints = data.endpoints || [];
        document.getElementById('tab-count-endpoints').textContent = allEndpoints.length;
        renderEndpointsTable(allEndpoints);
      } catch (err) {
        tbody.innerHTML = '<tr><td colspan="5" class="py-6 text-center text-rose-400 font-sans">Error loading endpoints: ' + escapeHtml(err.message) + '</td></tr>';
      }
    }

    function renderEndpointsTable(list) {
      const tbody = document.getElementById('endpoints-table-body');
      if (!list || list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="py-6 text-center text-slate-500 font-sans">No matching endpoints found.</td></tr>';
        return;
      }
      tbody.innerHTML = list.slice(0, 100).map(e => \`
        <tr class="hover:bg-slate-800/40 transition">
          <td class="py-2.5 px-4 font-bold text-amber-400">\${escapeHtml(e.endpoint || '')}</td>
          <td class="py-2.5 px-4 text-slate-400">\${escapeHtml(e.cmd_hex || '')}</td>
          <td class="py-2.5 px-4 text-slate-300">\${escapeHtml(e.reqType || '--')}</td>
          <td class="py-2.5 px-4 text-slate-300">\${escapeHtml(e.resType || '--')}</td>
          <td class="py-2.5 px-4 text-slate-500 truncate max-w-xs" title="\${escapeHtml(e.caller || '')}">\${escapeHtml(e.caller || '')}</td>
        </tr>
      \`).join('');
    }

    function filterEndpoints() {
      const q = document.getElementById('input-search-endpoint').value.toLowerCase().trim();
      if (!q) {
        renderEndpointsTable(allEndpoints);
        return;
      }
      const filtered = allEndpoints.filter(e =>
        (e.endpoint && e.endpoint.toLowerCase().includes(q)) ||
        (e.cmd_hex && e.cmd_hex.toLowerCase().includes(q)) ||
        (e.reqType && e.reqType.toLowerCase().includes(q)) ||
        (e.resType && e.resType.toLowerCase().includes(q))
      );
      renderEndpointsTable(filtered);
    }

    async function runHandshakeTest() {
      const btn = document.getElementById('btn-run-handshake');
      const container = document.getElementById('handshake-result-container');
      const output = document.getElementById('handshake-output');
      const badge = document.getElementById('handshake-badge');
      btn.disabled = true;
      btn.innerHTML = '<span class="animate-spin mr-1.5">⟳</span> Testing Handshake...';
      container.classList.remove('hidden');
      output.textContent = 'Initiating 4-step AES-encrypted Protobuf handshake test on port 3000...\\n';
      
      try {
        const res = await fetch('/api/test/handshake', { method: 'POST' });
        const data = await res.json();
        
        let text = '=== FREE FIRE SERVER HANDSHAKE TEST ===\\n';
        text += 'Overall Result: ' + (data.success ? 'PASSED (100%)' : 'FAILED') + '\\n';
        text += 'Total Duration: ' + (data.durationMs || 0) + 'ms\\n\\n';
        
        if (data.steps && data.steps.length) {
          data.steps.forEach(s => {
            const icon = s.success ? '✓' : '✗';
            text += \`[\${icon}] Step \${s.step}: \${s.name} -> HTTP \${s.status} (\${s.durationMs}ms)\\n\`;
            text += \`    Details: \${s.details}\\n\`;
            if (s.tokenPreview) text += \`    Bearer Token: \${s.tokenPreview}\\n\`;
            if (s.player) text += \`    Synced Player: \${JSON.stringify(s.player)}\\n\`;
            text += '\\n';
          });
        }
        
        if (data.message) text += 'Summary: ' + data.message + '\\n';
    // ----------------------------------------------------
    // STORE & LUCKY ROYALE MANAGEMENT LOGIC
    // ----------------------------------------------------
    let allShopItems = [];
    let currentShopCategory = 'all';
    let currentShopTag = 'all';
    let currentShopSearch = '';
    let allWheels = [];
    let currentWheelId = 1001;

    async function loadShopData() {
      await Promise.all([loadShop(), loadWheels()]);
    }

    // --- STORE CATALOG MANAGEMENT ---

    async function loadShop(category = currentShopCategory) {
      currentShopCategory = category;
      const grid = document.getElementById('shop-items-grid');
      try {
        const res = await fetch('/api/shop');
        const data = await res.json();
        allShopItems = data.items || [];

        // Update stats
        const totalSpan = document.getElementById('stat-shop-total');
        if (totalSpan) totalSpan.textContent = allShopItems.length;

        renderShopGrid();
      } catch (err) {
        grid.innerHTML = '<div class="col-span-full py-8 text-center text-rose-400">Error loading store catalog: ' + escapeHtml(err.message) + '</div>';
      }
    }

    function renderShopGrid() {
      const grid = document.getElementById('shop-items-grid');
      if (!grid) return;

      let filtered = allShopItems;

      // Category filter
      if (currentShopCategory && currentShopCategory !== 'all') {
        filtered = filtered.filter(item => {
          const cat = (item.type_override || '').split(';')[0];
          return cat === currentShopCategory;
        });
      }

      // Tag filter
      if (currentShopTag !== 'all') {
        const tagNum = Number(currentShopTag);
        filtered = filtered.filter(item => Number(item.tag_type || 0) === tagNum);
      }

      // Search filter
      if (currentShopSearch.trim()) {
        const q = currentShopSearch.toLowerCase().trim();
        filtered = filtered.filter(item =>
          (item.name && item.name.toLowerCase().includes(q)) ||
          (item.desc && item.desc.toLowerCase().includes(q)) ||
          String(item.item_id).includes(q) ||
          String(item.store_id).includes(q)
        );
      }

      if (filtered.length === 0) {
        grid.innerHTML = '<div class="col-span-full py-12 text-center text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800/80">No store items match your current filter. Click "+ Add Store Item" to create one.</div>';
        return;
      }

      const tagBadges = {
        0: '',
        1: '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">SALE</span>',
        2: '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">HOT</span>',
        3: '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">NEW</span>',
        4: '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">LIMITED</span>'
      };

      const categoryLabels = {
        '7': 'Character',
        '8': 'Outfit Bundle',
        '9': 'Weapon Skin',
        '11': 'Collection & Emote',
        '12': 'Pet Companion',
        '6': 'Fashion & Clothes',
        '10': 'Voucher / Consumable'
      };

      grid.innerHTML = filtered.map(item => {
        const catPrefix = (item.type_override || '').split(';')[0];
        const catName = categoryLabels[catPrefix] || 'Store Item';
        const tagHtml = tagBadges[item.tag_type] || '';

        let priceHtml = '';
        if (item.gems_price > 0) {
          const displayGems = item.discount_price ? item.discount_price : item.gems_price;
          const originalGems = item.discount_price ? \`<span class="line-through text-slate-500 mr-1 text-[11px]">\${item.gems_price}</span>\` : '';
          priceHtml += \`<span class="font-bold text-sky-400 flex items-center font-mono">💎 \${originalGems}\${displayGems}</span>\`;
        }
        if (item.coins_price > 0) {
          if (priceHtml) priceHtml += '<span class="text-slate-600 mx-1.5">•</span>';
          priceHtml += \`<span class="font-bold text-amber-400 flex items-center font-mono">🪙 \${item.coins_price.toLocaleString()}</span>\`;
        }
        if (!priceHtml) {
          priceHtml = '<span class="text-emerald-400 font-bold">FREE</span>';
        }

        return \`
          <div class="bg-slate-950 border border-slate-800 hover:border-amber-500/40 rounded-xl p-4 flex flex-col justify-between transition group shadow-sm">
            <div class="space-y-2">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <span class="text-[10px] uppercase tracking-wider font-semibold text-slate-500 block">\${catName}</span>
                  <h4 class="font-bold text-slate-100 text-sm group-hover:text-amber-400 transition">\${escapeHtml(item.name)}</h4>
                </div>
                \${tagHtml}
              </div>
              <p class="text-xs text-slate-400 line-clamp-2">\${escapeHtml(item.desc || '')}</p>
            </div>

            <div class="mt-4 pt-3 border-t border-slate-900 space-y-3">
              <div class="flex items-center justify-between text-xs">
                <div class="flex items-center">
                  \${priceHtml}
                </div>
                <div class="flex items-center space-x-1.5 text-[10px] font-mono text-slate-500">
                  <span title="Store ID">#\${item.store_id}</span>
                  <span>•</span>
                  <span title="Item ID">ID:\${item.item_id}</span>
                </div>
              </div>

              <div class="flex items-center justify-end space-x-2 pt-1 border-t border-slate-900/80">
                <button onclick="openEditStoreItemModal(\${item.store_id})" class="px-2.5 py-1 rounded text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center">
                  <svg class="w-3 h-3 mr-1 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  Edit
                </button>
                <button onclick="deleteStoreItem(\${item.store_id})" class="px-2.5 py-1 rounded text-[11px] font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition flex items-center">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  Delete
                </button>
              </div>
            </div>
          </div>
        \`;
      }).join('');
    }

    function filterShop(cat) {
      document.querySelectorAll('.shop-filter-btn').forEach(btn => {
        btn.classList.remove('bg-amber-500', 'text-slate-950', 'font-bold');
        btn.classList.add('bg-slate-800', 'text-slate-300');
      });
      const activeBtn = document.getElementById('shop-filter-' + cat);
      if (activeBtn) {
        activeBtn.classList.add('bg-amber-500', 'text-slate-950', 'font-bold');
        activeBtn.classList.remove('bg-slate-800', 'text-slate-300');
      }
      currentShopCategory = cat;
      renderShopGrid();
    }

    function filterShopByTag(tag) {
      currentShopTag = tag;
      renderShopGrid();
    }

    function onShopSearch(val) {
      currentShopSearch = val;
      renderShopGrid();
    }

    function openAddStoreItemModal() {
      document.getElementById('modal-store-title').innerHTML = '<span class="w-2 h-2 rounded-full bg-amber-400 mr-2"></span> Add In-Game Store Item';
      document.getElementById('store-form-id').value = '';
      document.getElementById('store-input-item-id').value = '';
      document.getElementById('store-input-item-id').disabled = false;
      document.getElementById('store-input-category').value = '7;0';
      document.getElementById('store-input-name').value = '';
      document.getElementById('store-input-gems').value = '599';
      document.getElementById('store-input-coins').value = '0';
      document.getElementById('store-input-discount').value = '0';
      document.getElementById('store-input-tag').value = '0';
      document.getElementById('store-input-recommended').checked = false;
      document.getElementById('store-input-new').checked = true;
      document.getElementById('store-input-desc').value = '';
      document.getElementById('btn-save-store-item').textContent = 'Add Item';
      document.getElementById('modal-store-item').classList.remove('hidden');
    }

    function openEditStoreItemModal(storeId) {
      const item = allShopItems.find(it => it.store_id === storeId);
      if (!item) return;

      document.getElementById('modal-store-title').innerHTML = '<span class="w-2 h-2 rounded-full bg-amber-400 mr-2"></span> Edit In-Game Store Item #' + item.store_id;
      document.getElementById('store-form-id').value = item.store_id;
      document.getElementById('store-input-item-id').value = item.item_id;
      document.getElementById('store-input-item-id').disabled = true;
      document.getElementById('store-input-category').value = item.type_override || '7;0';
      document.getElementById('store-input-name').value = item.name || '';
      document.getElementById('store-input-gems').value = item.gems_price || 0;
      document.getElementById('store-input-coins').value = item.coins_price || 0;
      document.getElementById('store-input-discount').value = item.discount_price || 0;
      document.getElementById('store-input-tag').value = String(item.tag_type || 0);
      document.getElementById('store-input-recommended').checked = Boolean(item.is_recommended);
      document.getElementById('store-input-new').checked = Boolean(item.is_new);
      document.getElementById('store-input-desc').value = item.desc || '';
      document.getElementById('btn-save-store-item').textContent = 'Update Item';
      document.getElementById('modal-store-item').classList.remove('hidden');
    }

    function closeStoreItemModal() {
      document.getElementById('modal-store-item').classList.add('hidden');
    }

    async function saveStoreItem(event) {
      event.preventDefault();
      const storeId = document.getElementById('store-form-id').value;
      const itemId = Number(document.getElementById('store-input-item-id').value);
      const name = document.getElementById('store-input-name').value.trim();
      const category = document.getElementById('store-input-category').value;
      const gemsPrice = Number(document.getElementById('store-input-gems').value || 0);
      const coinsPrice = Number(document.getElementById('store-input-coins').value || 0);
      const discountPrice = Number(document.getElementById('store-input-discount').value || 0);
      const tagType = Number(document.getElementById('store-input-tag').value || 0);
      const isRecommended = document.getElementById('store-input-recommended').checked;
      const isNew = document.getElementById('store-input-new').checked;
      const desc = document.getElementById('store-input-desc').value.trim();

      const payload = {
        item_id: itemId,
        name,
        type_override: category,
        gems_price: gemsPrice,
        coins_price: coinsPrice,
        discount_price: discountPrice,
        tag_type: tagType,
        is_recommended: isRecommended,
        is_new: isNew,
        desc
      };

      try {
        let res;
        if (storeId) {
          res = await fetch('/api/shop/' + encodeURIComponent(storeId), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        } else {
          res = await fetch('/api/shop', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        }

        const data = await res.json();
        if (!res.ok) {
          alert('Error: ' + (data.error || 'Failed to save store item'));
          return;
        }

        closeStoreItemModal();
        await loadShop();
      } catch (err) {
        alert('Network error: ' + err.message);
      }
    }

    async function deleteStoreItem(storeId) {
      const item = allShopItems.find(it => it.store_id === storeId);
      const name = item ? item.name : '#' + storeId;
      if (!confirm(\`Are you sure you want to remove "\${name}" from the store catalog?\`)) {
        return;
      }

      try {
        const res = await fetch('/api/shop/' + encodeURIComponent(storeId), {
          method: 'DELETE'
        });
        const data = await res.json();
        if (!res.ok) {
          alert('Error: ' + (data.error || 'Failed to delete store item'));
          return;
        }
        await loadShop();
      } catch (err) {
        alert('Network error: ' + err.message);
      }
    }

    async function resetShopCatalog() {
      if (!confirm('Reset the store catalog back to the official default items? Any custom store items will be restored.')) {
        return;
      }

      try {
        const res = await fetch('/api/shop/reset', { method: 'POST' });
        const data = await res.json();
        if (!res.ok) {
          alert('Error: ' + (data.error || 'Failed to reset catalog'));
          return;
        }
        alert(data.message || 'Store catalog restored successfully!');
        await loadShop();
      } catch (err) {
        alert('Network error: ' + err.message);
      }
    }

    // --- LUCKY ROYALE & WHEEL MANAGEMENT ---

    async function loadWheels() {
      try {
        const res = await fetch('/api/gacha');
        const data = await res.json();
        allWheels = data.wheels || [];

        renderWheelSelector();

        if (allWheels.length > 0) {
          if (!allWheels.some(w => w.chest_id === currentWheelId)) {
            currentWheelId = allWheels[0].chest_id;
          }
          selectWheel(currentWheelId);
        }
      } catch (err) {
        console.warn('Failed to load lucky royale wheels:', err);
      }
    }

    function renderWheelSelector() {
      const container = document.getElementById('wheel-selector-buttons');
      if (!container) return;

      container.innerHTML = allWheels.map(wheel => {
        const isSelected = wheel.chest_id === currentWheelId;
        const icon = wheel.coin_type === 1 ? '🪙' : '💎';
        return \`
          <button onclick="selectWheel(\${wheel.chest_id})" id="wheel-btn-\${wheel.chest_id}" class="wheel-btn px-3 py-1.5 rounded-lg text-xs font-semibold \${isSelected ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'} transition flex items-center">
            <span class="mr-1.5">\${icon}</span>
            <span>\${escapeHtml(wheel.chest_name)}</span>
          </button>
        \`;
      }).join('');
    }

    function selectWheel(chestId) {
      currentWheelId = chestId;
      const wheel = allWheels.find(w => w.chest_id === chestId) || allWheels[0];
      if (!wheel) return;

      // Update selector buttons styling
      document.querySelectorAll('.wheel-btn').forEach(btn => {
        btn.classList.remove('bg-amber-500', 'text-slate-950', 'font-bold');
        btn.classList.add('bg-slate-800', 'text-slate-300');
      });
      const activeBtn = document.getElementById('wheel-btn-' + chestId);
      if (activeBtn) {
        activeBtn.classList.add('bg-amber-500', 'text-slate-950', 'font-bold');
        activeBtn.classList.remove('bg-slate-800', 'text-slate-300');
      }

      // Update active wheel action box
      document.getElementById('active-wheel-title').textContent = wheel.chest_name;
      const isGold = wheel.coin_type === 1;
      const badge = document.getElementById('active-wheel-badge');
      badge.textContent = isGold ? 'Gold Coins' : 'Diamonds';
      badge.className = 'px-2 py-0.5 rounded text-[11px] font-semibold ' + (isGold ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-sky-500/20 text-sky-400 border border-sky-500/30');

      const idBadge = document.getElementById('active-wheel-id-badge');
      if (idBadge) idBadge.textContent = 'Chest #' + wheel.chest_id;

      document.getElementById('active-wheel-grandprize').textContent = 'Grand Prize: ' + wheel.grand_prize_name + ' (Legendary Jackpot)';
      const sym = isGold ? '🪙' : '💎';
      document.getElementById('spin-1-price').textContent = '(' + wheel.once_price + ' ' + sym + ')';
      document.getElementById('spin-10-price').textContent = '(' + wheel.ten_price + ' ' + sym + ')';

      // Hide results box on wheel switch
      document.getElementById('spin-results-box').classList.add('hidden');

      // Update reward pool
      const poolGrid = document.getElementById('wheel-pool-grid');
      const totalWeight = wheel.reward_items.reduce((acc, it) => acc + (it.weight || 10), 0);

      poolGrid.innerHTML = wheel.reward_items.map(r => {
        const isJackpot = r.reward_level >= 3 || r.item_id === wheel.grand_prize_id;
        const pct = totalWeight > 0 ? ((r.weight / totalWeight) * 100).toFixed(1) : '0.0';
        const rarityBadge = isJackpot
          ? '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-950">LEGENDARY ★★★</span>'
          : (r.reward_level === 2
            ? '<span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">RARE ★★</span>'
            : '<span class="px-2 py-0.5 rounded text-[10px] text-slate-400 bg-slate-800 border border-slate-700">NORMAL ★</span>');

        return \`
          <div class="bg-slate-950 border \${isJackpot ? 'border-amber-500/40 bg-amber-500/5' : 'border-slate-800'} rounded-lg p-3 flex flex-col justify-between text-xs space-y-2 group shadow-sm">
            <div class="flex items-start justify-between gap-2">
              <div class="space-y-0.5">
                <span class="font-bold text-slate-200 block group-hover:text-amber-400 transition">\${escapeHtml(r.name)}</span>
                <span class="text-[10px] font-mono text-slate-500">Item ID: \${r.item_id}</span>
              </div>
              <div class="text-right space-y-1">
                \${rarityBadge}
                <span class="block text-[11px] font-mono text-amber-400 font-semibold">\${pct}% drop</span>
              </div>
            </div>

            <div class="flex items-center justify-between pt-2 border-t border-slate-900 text-[11px] text-slate-500">
              <span>Weight: <strong class="text-slate-300 font-mono">\${r.weight || 10}</strong></span>
              <div class="flex items-center space-x-1.5">
                <button onclick="openEditPrizeModal(\${r.item_id})" class="text-amber-400 hover:text-amber-300 transition text-[10px] font-medium">Edit</button>
                <span>•</span>
                <button onclick="deletePrize(\${r.item_id})" class="text-rose-400 hover:text-rose-300 transition text-[10px] font-medium">Remove</button>
              </div>
            </div>
          </div>
        \`;
      }).join('');
    }

    // Wheel Modal & Actions
    function openAddWheelModal() {
      document.getElementById('modal-wheel-title').innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-400 mr-2"></span> Add Lucky Royale Wheel';
      document.getElementById('wheel-form-id').value = '';
      const highestId = allWheels.reduce((max, w) => Math.max(max, w.chest_id), 1005);
      document.getElementById('wheel-input-id').value = highestId + 1;
      document.getElementById('wheel-input-id').disabled = false;
      document.getElementById('wheel-input-name').value = '';
      document.getElementById('wheel-input-coin-type').value = '2';
      document.getElementById('wheel-input-once-price').value = '60';
      document.getElementById('wheel-input-ten-price').value = '540';
      document.getElementById('wheel-input-gp-id').value = '203000181';
      document.getElementById('wheel-input-gp-name').value = '';
      document.getElementById('btn-save-wheel').textContent = 'Create Wheel';
      document.getElementById('modal-gacha-wheel').classList.remove('hidden');
    }

    function openEditWheelModal() {
      const wheel = allWheels.find(w => w.chest_id === currentWheelId);
      if (!wheel) return;

      document.getElementById('modal-wheel-title').innerHTML = '<span class="w-2 h-2 rounded-full bg-amber-400 mr-2"></span> Edit Lucky Royale Wheel #' + wheel.chest_id;
      document.getElementById('wheel-form-id').value = wheel.chest_id;
      document.getElementById('wheel-input-id').value = wheel.chest_id;
      document.getElementById('wheel-input-id').disabled = true;
      document.getElementById('wheel-input-name').value = wheel.chest_name || '';
      document.getElementById('wheel-input-coin-type').value = String(wheel.coin_type || 2);
      document.getElementById('wheel-input-once-price').value = wheel.once_price || 60;
      document.getElementById('wheel-input-ten-price').value = wheel.ten_price || 540;
      document.getElementById('wheel-input-gp-id').value = wheel.grand_prize_id || 0;
      document.getElementById('wheel-input-gp-name').value = wheel.grand_prize_name || '';
      document.getElementById('btn-save-wheel').textContent = 'Update Wheel';
      document.getElementById('modal-gacha-wheel').classList.remove('hidden');
    }

    function closeWheelModal() {
      document.getElementById('modal-gacha-wheel').classList.add('hidden');
    }

    async function saveWheel(event) {
      event.preventDefault();
      const editId = document.getElementById('wheel-form-id').value;
      const chestId = Number(document.getElementById('wheel-input-id').value);
      const chestName = document.getElementById('wheel-input-name').value.trim();
      const coinType = Number(document.getElementById('wheel-input-coin-type').value);
      const oncePrice = Number(document.getElementById('wheel-input-once-price').value);
      const tenPrice = Number(document.getElementById('wheel-input-ten-price').value);
      const grandPrizeId = Number(document.getElementById('wheel-input-gp-id').value);
      const grandPrizeName = document.getElementById('wheel-input-gp-name').value.trim();

      const payload = {
        chest_id: chestId,
        chest_name: chestName,
        coin_type: coinType,
        once_price: oncePrice,
        ten_price: tenPrice,
        grand_prize_id: grandPrizeId,
        grand_prize_name: grandPrizeName
      };

      try {
        let res;
        if (editId) {
          res = await fetch('/api/gacha/' + encodeURIComponent(editId), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        } else {
          res = await fetch('/api/gacha', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        }

        const data = await res.json();
        if (!res.ok) {
          alert('Error: ' + (data.error || 'Failed to save wheel'));
          return;
        }

        closeWheelModal();
        currentWheelId = chestId;
        await loadWheels();
      } catch (err) {
        alert('Network error: ' + err.message);
      }
    }

    async function deleteActiveWheel() {
      const wheel = allWheels.find(w => w.chest_id === currentWheelId);
      if (!wheel) return;
      if (allWheels.length <= 1) {
        alert('At least one wheel must remain in the Lucky Royale system.');
        return;
      }
      if (!confirm(\`Are you sure you want to permanently delete "\${wheel.chest_name}"?\`)) {
        return;
      }

      try {
        const res = await fetch('/api/gacha/' + encodeURIComponent(currentWheelId), {
          method: 'DELETE'
        });
        const data = await res.json();
        if (!res.ok) {
          alert('Error: ' + (data.error || 'Failed to delete wheel'));
          return;
        }

        const remaining = allWheels.filter(w => w.chest_id !== currentWheelId);
        if (remaining.length > 0) currentWheelId = remaining[0].chest_id;
        await loadWheels();
      } catch (err) {
        alert('Network error: ' + err.message);
      }
    }

    // Prize Pool Modal & Actions
    function openAddPrizeModal() {
      const wheel = allWheels.find(w => w.chest_id === currentWheelId);
      if (!wheel) return;

      document.getElementById('modal-prize-title').innerHTML = '<span class="w-2 h-2 rounded-full bg-amber-400 mr-2"></span> Add Prize to ' + escapeHtml(wheel.chest_name);
      document.getElementById('prize-form-chest-id').value = currentWheelId;
      document.getElementById('prize-form-old-item-id').value = '';
      document.getElementById('prize-input-id').value = '';
      document.getElementById('prize-input-id').disabled = false;
      document.getElementById('prize-input-name').value = '';
      document.getElementById('prize-input-level').value = '1';
      document.getElementById('prize-input-weight').value = '15';
      document.getElementById('btn-save-prize').textContent = 'Add Prize';
      document.getElementById('modal-gacha-prize').classList.remove('hidden');
    }

    function openEditPrizeModal(itemId) {
      const wheel = allWheels.find(w => w.chest_id === currentWheelId);
      if (!wheel) return;
      const prize = wheel.reward_items.find(r => r.item_id === itemId);
      if (!prize) return;

      document.getElementById('modal-prize-title').innerHTML = '<span class="w-2 h-2 rounded-full bg-amber-400 mr-2"></span> Edit Prize: ' + escapeHtml(prize.name);
      document.getElementById('prize-form-chest-id').value = currentWheelId;
      document.getElementById('prize-form-old-item-id').value = prize.item_id;
      document.getElementById('prize-input-id').value = prize.item_id;
      document.getElementById('prize-input-id').disabled = true;
      document.getElementById('prize-input-name').value = prize.name || '';
      document.getElementById('prize-input-level').value = String(prize.reward_level || 1);
      document.getElementById('prize-input-weight').value = prize.weight || 10;
      document.getElementById('btn-save-prize').textContent = 'Update Prize';
      document.getElementById('modal-gacha-prize').classList.remove('hidden');
    }

    function closePrizeModal() {
      document.getElementById('modal-gacha-prize').classList.add('hidden');
    }

    async function savePrize(event) {
      event.preventDefault();
      const chestId = document.getElementById('prize-form-chest-id').value;
      const oldItemId = document.getElementById('prize-form-old-item-id').value;
      const itemId = Number(document.getElementById('prize-input-id').value);
      const name = document.getElementById('prize-input-name').value.trim();
      const rewardLevel = Number(document.getElementById('prize-input-level').value);
      const weight = Number(document.getElementById('prize-input-weight').value);

      const payload = {
        item_id: itemId,
        name,
        reward_level: rewardLevel,
        weight
      };

      try {
        let res;
        if (oldItemId) {
          res = await fetch(\`/api/gacha/\${encodeURIComponent(chestId)}/items/\${encodeURIComponent(oldItemId)}\`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        } else {
          res = await fetch(\`/api/gacha/\${encodeURIComponent(chestId)}/items\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        }

        const data = await res.json();
        if (!res.ok) {
          alert('Error: ' + (data.error || 'Failed to save prize'));
          return;
        }

        closePrizeModal();
        await loadWheels();
      } catch (err) {
        alert('Network error: ' + err.message);
      }
    }

    async function deletePrize(itemId) {
      const wheel = allWheels.find(w => w.chest_id === currentWheelId);
      if (!wheel) return;
      if (wheel.reward_items.length <= 1) {
        alert('At least one item must remain in the prize pool.');
        return;
      }
      const prize = wheel.reward_items.find(r => r.item_id === itemId);
      const prizeName = prize ? prize.name : '#' + itemId;
      if (!confirm(\`Are you sure you want to remove "\${prizeName}" from the prize pool?\`)) {
        return;
      }

      try {
        const res = await fetch(\`/api/gacha/\${encodeURIComponent(currentWheelId)}/items/\${encodeURIComponent(itemId)}\`, {
          method: 'DELETE'
        });
        const data = await res.json();
        if (!res.ok) {
          alert('Error: ' + (data.error || 'Failed to delete prize'));
          return;
        }
        await loadWheels();
      } catch (err) {
        alert('Network error: ' + err.message);
      }
    }

    async function spinActiveWheel(count) {
      const btn1 = document.getElementById('btn-spin-1');
      const btn10 = document.getElementById('btn-spin-10');
      btn1.disabled = true;
      btn10.disabled = true;

      const resultsBox = document.getElementById('spin-results-box');
      const dropsGrid = document.getElementById('spin-drops-grid');
      const jackpotAlert = document.getElementById('jackpot-alert');
      const dropCountSpan = document.getElementById('spin-drop-count');

      try {
        const res = await fetch('/api/gacha/spin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chest_id: currentWheelId, count })
        });
        const data = await res.json();
        const drops = data.drops || [];

        dropCountSpan.textContent = drops.length;
        if (data.has_jackpot) {
          jackpotAlert.classList.remove('hidden');
        } else {
          jackpotAlert.classList.add('hidden');
        }

        dropsGrid.innerHTML = drops.map(d => {
          const isGold = d.reward_level >= 3;
          return \`
            <div class="p-3 rounded-lg border \${isGold ? 'bg-amber-500/15 border-amber-500 animate-pulse text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-200'} text-center space-y-1 transition transform hover:scale-105">
              <span class="text-xl block">\${isGold ? '🏆' : '🎁'}</span>
              <span class="text-xs font-bold block truncate" title="\${escapeHtml(d.name)}">\${escapeHtml(d.name)}</span>
              <span class="text-[10px] font-mono block opacity-70">#\${d.item_id}</span>
            </div>
          \`;
        }).join('');

        resultsBox.classList.remove('hidden');
      } catch (err) {
        alert('Spin failed: ' + err.message);
      } finally {
        btn1.disabled = false;
        btn10.disabled = false;
      }
    }

    // GLOBAL RANKINGS SERVICE (Bermuda & Clash Squad)
    // ----------------------------------------------------
    let currentRankingMode = 'bermuda';
    let currentRankingMetric = 'score';
    let currentRankingRegion = 'GLOBAL';
    let currentRankingsList = [];

    function setRankingMode(mode) {
      currentRankingMode = mode;
      document.querySelectorAll('.rank-mode-btn').forEach(btn => {
        btn.classList.remove('bg-amber-500', 'text-slate-950', 'font-bold');
        btn.classList.add('bg-transparent', 'text-slate-400');
      });
      const activeBtn = document.getElementById('rank-mode-btn-' + mode);
      if (activeBtn) {
        activeBtn.classList.add('bg-amber-500', 'text-slate-950', 'font-bold');
        activeBtn.classList.remove('bg-transparent', 'text-slate-400');
      }

      // Update metric label
      const scoreLabel = document.getElementById('metric-score-label');
      if (scoreLabel) scoreLabel.textContent = mode === 'bermuda' ? 'RP' : 'Stars';

      // Update table header
      const thRating = document.getElementById('th-rating-col');
      if (thRating) thRating.textContent = mode === 'bermuda' ? 'Rank Rating (RP)' : 'CS Rating (Stars)';

      loadRankingsData();
    }

    function setRankingMetric(metric) {
      currentRankingMetric = metric;
      document.querySelectorAll('.rank-metric-btn').forEach(btn => {
        btn.classList.remove('bg-amber-500/20', 'text-amber-300', 'border-amber-500/40', 'font-bold');
        btn.classList.add('bg-slate-800', 'text-slate-400', 'border-slate-700');
      });
      const activeBtn = document.getElementById('rank-metric-btn-' + metric);
      if (activeBtn) {
        activeBtn.classList.add('bg-amber-500/20', 'text-amber-300', 'border-amber-500/40', 'font-bold');
        activeBtn.classList.remove('bg-slate-800', 'text-slate-400', 'border-slate-700');
      }
      loadRankingsData();
    }

    function setRankingRegion(region) {
      currentRankingRegion = region;
      loadRankingsData();
    }

    async function loadRankingsSummary() {
      try {
        const res = await fetch('/api/rankings/summary');
        if (!res.ok) return;
        const data = await res.json();
        const top1 = currentRankingMode === 'bermuda' ? data.top_bermuda_player : data.top_clash_squad_player;
        if (top1) {
          const top1Name = document.getElementById('rank-top1-name');
          const top1Stat = document.getElementById('rank-top1-stat');
          if (top1Name) top1Name.textContent = top1.nickname;
          if (top1Stat) {
            top1Stat.textContent = currentRankingMode === 'bermuda'
              ? top1.score.toLocaleString() + ' RP • ' + top1.kills + ' Kills • ' + top1.wins + ' Booyahs'
              : top1.score + ' Stars • ' + top1.kills + ' Kills • ' + top1.wins + ' Wins';
          }
        }
        const gmCount = document.getElementById('rank-gm-count');
        if (gmCount) gmCount.textContent = data.grandmaster_players;
        const totalP = document.getElementById('rank-total-players');
        if (totalP) totalP.textContent = data.total_ranked_players;
      } catch (err) {
        console.error('loadRankingsSummary error:', err);
      }
    }

    async function loadRankingsData() {
      try {
        const url = \`/api/rankings?mode=\${currentRankingMode}&metric=\${currentRankingMetric}&region=\${currentRankingRegion}&limit=50\`;
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();
        currentRankingsList = data.items || [];

        // Update thresholds
        const gmThresh = document.getElementById('rank-gm-threshold');
        const heroicThresh = document.getElementById('rank-heroic-threshold');
        if (gmThresh && heroicThresh && data.thresholds) {
          const unit = currentRankingMode === 'bermuda' ? ' RP' : ' Stars';
          gmThresh.textContent = data.thresholds.GRANDMASTER.toLocaleString() + unit;
          heroicThresh.textContent = data.thresholds.HEROIC.toLocaleString() + unit;
        }

        // Update table count badge
        const countBadge = document.getElementById('rank-table-count');
        if (countBadge) countBadge.textContent = data.total + ' competitors (' + data.region + ')';

        // Render Podium (Top 3)
        renderPodium(currentRankingsList.slice(0, 3));

        // Render Table Body
        renderRankingsTable(currentRankingsList);

        // Populate sim modal player dropdown
        populateSimPlayerSelect(currentRankingsList);

        // Also update summary
        loadRankingsSummary();
      } catch (err) {
        console.error('loadRankingsData error:', err);
      }
    }

    function renderPodium(top3) {
      const container = document.getElementById('rank-podium-container');
      if (!container) return;

      if (!top3 || top3.length === 0) {
        container.innerHTML = '<div class="col-span-3 text-center text-slate-500 py-6 text-xs">No ranking data available for this selection.</div>';
        return;
      }

      const p1 = top3[0] || null;
      const p2 = top3[1] || null;
      const p3 = top3[2] || null;

      const renderCard = (p, rankNum, medal, borderClass, bgClass, hClass) => {
        if (!p) return '<div class="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-center text-slate-600 text-xs flex items-center justify-center ' + hClass + '">Unclaimed</div>';
        const isBermuda = currentRankingMode === 'bermuda';
        const ratingText = isBermuda ? p.score.toLocaleString() + ' RP' : p.score + ' Stars';

        return \`
          <div class="bg-slate-900 border \${borderClass} rounded-xl p-4 \${bgClass} flex flex-col justify-between space-y-3 relative overflow-hidden transition transform hover:-translate-y-1 shadow-lg">
            <div class="absolute -right-3 -top-3 w-14 h-14 rounded-full bg-white/5 flex items-end justify-start pl-3 pb-2 text-2xl opacity-60">
              \${medal}
            </div>
            <div class="flex items-center space-x-3">
              <span class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm bg-slate-950/80 border border-slate-700 text-slate-200">
                #\${rankNum}
              </span>
              <div class="overflow-hidden">
                <span class="font-bold text-slate-100 text-sm block truncate">\${escapeHtml(p.nickname)}</span>
                <span class="text-[10px] text-slate-400 font-mono">UID \${p.uid} • Lv.\${p.level} • \${p.region}</span>
              </div>
            </div>
            <div class="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
              <div>
                <span class="text-[10px] text-slate-400 uppercase tracking-wider block">\${isBermuda ? 'Rating' : 'Stars'}</span>
                <span class="font-bold text-amber-400 font-mono text-sm">\${ratingText}</span>
              </div>
              <div class="text-right">
                <span class="text-[10px] text-slate-400 uppercase tracking-wider block">K/D • Win Rate</span>
                <span class="font-medium text-slate-300 font-mono">\${p.kd_ratio} • \${p.win_rate}%</span>
              </div>
            </div>
          </div>
        \`;
      };

      container.innerHTML = \`
        \${renderCard(p2, 2, '🥈', 'border-slate-400/40', 'bg-slate-800/30', 'h-32')}
        \${renderCard(p1, 1, '👑', 'border-amber-500/60 shadow-amber-500/10', 'bg-gradient-to-b from-amber-500/15 via-slate-900 to-slate-900', 'h-36')}
        \${renderCard(p3, 3, '🥉', 'border-amber-700/40', 'bg-amber-950/10', 'h-32')}
      \`;
    }

    function renderRankingsTable(list) {
      const tbody = document.getElementById('rank-table-body');
      if (!tbody) return;

      if (!list || list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center py-8 text-slate-500 text-xs">No matching players found.</td></tr>';
        return;
      }

      const isBermuda = currentRankingMode === 'bermuda';

      tbody.innerHTML = list.map(p => {
        const tier = p.tier || { name: 'Bronze', bg: 'bg-amber-900/30 text-amber-500', icon: '🥉' };
        const scoreStr = isBermuda ? p.score.toLocaleString() + ' RP' : p.score + ' ★';
        const rankBadge = p.pos === 1
          ? '<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-500 text-slate-950">#1 👑</span>'
          : (p.pos === 2
            ? '<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-slate-300 text-slate-950">#2 🥈</span>'
            : (p.pos === 3
              ? '<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-700 text-slate-100">#3 🥉</span>'
              : '<span class="font-mono text-slate-400">#' + p.pos + '</span>'));

        return \`
          <tr class="hover:bg-slate-800/40 transition">
            <td class="py-3 px-4 text-center">\${rankBadge}</td>
            <td class="py-3 px-4">
              <div class="flex items-center space-x-2.5">
                <div class="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-sm shrink-0">
                  \${tier.icon}
                </div>
                <div class="overflow-hidden">
                  <div class="flex items-center space-x-1.5">
                    <span class="font-bold text-slate-200 truncate max-w-[130px] sm:max-w-[180px]">\${escapeHtml(p.nickname)}</span>
                    <span class="px-1 py-0.2 rounded text-[9px] font-mono bg-slate-800 text-slate-400">\${p.region}</span>
                  </div>
                  <span class="text-[10px] text-slate-400 font-mono block">UID \${p.uid} • Lv.\${p.level} \${p.clan_name ? '• ' + escapeHtml(p.clan_name) : ''}</span>
                </div>
              </div>
            </td>
            <td class="py-3 px-4">
              <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border \${tier.bg}">
                <span class="mr-1">\${tier.icon}</span>
                \${tier.name}
              </span>
            </td>
            <td class="py-3 px-4 text-right font-mono font-bold text-amber-400">\${scoreStr}</td>
            <td class="py-3 px-4 text-right font-mono text-slate-300">
              <div>\${p.kills.toLocaleString()}</div>
              <span class="text-[10px] text-slate-500">\${p.kd_ratio} K/D</span>
            </td>
            <td class="py-3 px-4 text-right font-mono text-slate-300">
              <div>\${p.wins.toLocaleString()}</div>
              <span class="text-[10px] text-emerald-400 font-semibold">\${p.win_rate}% win</span>
            </td>
            <td class="py-3 px-4 text-right font-mono text-slate-400">
              <div>\${p.games_played}</div>
              <span class="text-[10px] text-slate-500">\${p.damage.toLocaleString()} dmg</span>
            </td>
            <td class="py-3 px-4 text-center">
              <button onclick="openMatchSimModal(\${p.uid})" class="px-2.5 py-1 rounded bg-slate-800 hover:bg-amber-500/20 hover:text-amber-300 text-slate-400 hover:border-amber-500/30 border border-slate-700 transition text-[11px]">
                Simulate
              </button>
            </td>
          </tr>
        \`;
      }).join('');
    }

    function filterRankingList() {
      const q = (document.getElementById('rank-search-input')?.value || '').trim().toLowerCase();
      if (!q) {
        renderRankingsTable(currentRankingsList);
        return;
      }
      const filtered = currentRankingsList.filter(p =>
        p.nickname.toLowerCase().includes(q) ||
        String(p.uid).includes(q) ||
        (p.clan_name && p.clan_name.toLowerCase().includes(q))
      );
      renderRankingsTable(filtered);
    }

    function populateSimPlayerSelect(list) {
      const sel = document.getElementById('sim-player-select');
      if (!sel) return;
      sel.innerHTML = list.map(p =>
        \`<option value="\${p.uid}">\${escapeHtml(p.nickname)} (UID: \${p.uid}, Lv.\${p.level}, \${p.score} pts)</option>\`
      ).join('');
    }

    function openMatchSimModal(uid) {
      const modal = document.getElementById('match-sim-modal');
      if (!modal) return;
      modal.classList.remove('hidden');
      if (uid) {
        const sel = document.getElementById('sim-player-select');
        if (sel) sel.value = String(uid);
      }
      const feedback = document.getElementById('sim-feedback-box');
      if (feedback) feedback.classList.add('hidden');
    }

    function closeMatchSimModal() {
      const modal = document.getElementById('match-sim-modal');
      if (modal) modal.classList.add('hidden');
    }

    async function handleSimulateMatchSubmit(e) {
      e.preventDefault();
      const btn = document.getElementById('btn-submit-match-sim');
      btn.disabled = true;

      const uid = Number(document.getElementById('sim-player-select').value);
      const mode = document.getElementById('sim-mode-select').value;
      const outcome = document.getElementById('sim-outcome-select').value;
      const kills = Number(document.getElementById('sim-kills-input').value || 0);
      const deaths = Number(document.getElementById('sim-deaths-input').value || 1);
      const damage = Number(document.getElementById('sim-damage-input').value || 0);
      const deltaInput = document.getElementById('sim-delta-input').value;
      const scoreDelta = deltaInput !== '' ? Number(deltaInput) : null;

      const feedback = document.getElementById('sim-feedback-box');

      try {
        const res = await fetch('/api/rankings/record-match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid,
            mode,
            kills,
            deaths,
            damage,
            win: outcome === 'win',
            score_delta: scoreDelta
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Server error recording match');

        feedback.className = 'p-3 rounded-lg text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-300';
        const sign = data.score_delta >= 0 ? '+' : '';
        feedback.innerHTML = \`
          <strong>Match Recorded Successfully!</strong><br />
          Player: \${escapeHtml(data.player.nickname)} | Score Delta: <span class="font-mono font-bold">\${sign}\${data.score_delta}</span><br />
          New \${data.mode === 'bermuda' ? 'Bermuda RP' : 'CS Stars'}: <span class="font-mono font-bold text-amber-300">\${data.mode === 'bermuda' ? data.player.bermuda.score : data.player.clash_squad.score}</span> (Tier: \${data.mode === 'bermuda' ? data.player.bermuda.tier.name : data.player.clash_squad.tier.name})
        \`;
        feedback.classList.remove('hidden');

        // Reload rankings data to reflect change immediately
        loadRankingsData();
        setTimeout(() => {
          closeMatchSimModal();
        }, 1800);
      } catch (err) {
        feedback.className = 'p-3 rounded-lg text-xs bg-red-500/10 border border-red-500/30 text-red-300';
        feedback.textContent = 'Failed to record match: ' + err.message;
        feedback.classList.remove('hidden');
      } finally {
        btn.disabled = false;
      }
    }

    function escapeHtml(str) {
      return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    // Auto-load on startup
    loadAllData();
    setInterval(loadStats, 10000);
  </script>
</body>
</html>`;
}

module.exports = { renderDashboard };
