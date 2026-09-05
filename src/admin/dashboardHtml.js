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
    }

    async function loadAllData() {
      await Promise.all([loadStats(), loadAccounts()]);
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
        if (data.error) text += 'Error: ' + data.error + '\\n';
        
        output.textContent = text;
        badge.textContent = data.success ? 'TEST PASSED' : 'TEST FAILED';
        badge.className = 'px-2 py-0.5 rounded text-xs ' + (data.success ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30');
        
        // Refresh accounts and stats
        loadAllData();
      } catch (err) {
        output.textContent = 'Handshake test execution error: ' + err.message;
        badge.textContent = 'ERROR';
        badge.className = 'px-2 py-0.5 rounded text-xs bg-rose-500/20 text-rose-400 border border-rose-500/30';
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Run Handshake Test';
      }
    }

    function openCreateAccountModal() {
      document.getElementById('modal-create-account').classList.remove('hidden');
    }
    function closeCreateAccountModal() {
      document.getElementById('modal-create-account').classList.add('hidden');
    }

    async function handleCreateAccount(e) {
      e.preventDefault();
      const nickname = document.getElementById('create-nickname').value.trim();
      const level = Number(document.getElementById('create-level').value) || 1;
      const gold = Number(document.getElementById('create-gold').value) || 5000;
      
      try {
        const res = await fetch('/api/accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nickname, level, gold })
        });
        const data = await res.json();
        if (res.ok) {
          closeCreateAccountModal();
          document.getElementById('create-nickname').value = '';
          loadAccounts();
          loadStats();
        } else {
          alert('Failed to create account: ' + (data.error || 'Unknown error'));
        }
      } catch (err) {
        alert('Network error: ' + err.message);
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
