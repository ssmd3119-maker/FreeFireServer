#!/bin/bash
# ==============================================================================
# Free Fire Server - Startup Script
# Starts the server processes (Unified mode or all individual background services)
# ==============================================================================

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

PID_DIR="$DIR/.pids"
LOG_DIR="$DIR/logs"
mkdir -p "$PID_DIR" "$LOG_DIR"

# Load environment variables if .env exists
if [ -f "$DIR/.env" ]; then
  # export variables ignoring comments
  export $(grep -v '^#' "$DIR/.env" | xargs -0 2>/dev/null || true)
fi

PORT="${APP_PORT:-${DEFAULT_APP_PORT:-3000}}"
TCP_PORT="${TCP_PORT:-10300}"
MODE="background"
START_ALL="false"

# Parse arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    -f|--foreground)
      MODE="foreground"
      shift
      ;;
    -a|--all|--workers)
      START_ALL="true"
      shift
      ;;
    -h|--help)
      echo "Usage: ./start.sh [options]"
      echo ""
      echo "Options:"
      echo "  -f, --foreground    Run main server in foreground (default: background daemon)"
      echo "  -a, --all           Also start auxiliary workers (settlement & matchmaker)"
      echo "  -h, --help          Show this help message"
      echo ""
      echo "To stop the servers, run: ./stop.sh"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Run './start.sh --help' for usage."
      exit 1
      ;;
  esac
done

# Function to check if a PID is alive
is_running() {
  local pid="$1"
  [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null
}

# Check if main server is already running via PID file or process list
MAIN_PID=""
if [ -f "$PID_DIR/server.pid" ]; then
  SAVED_PID="$(cat "$PID_DIR/server.pid" 2>/dev/null || true)"
  if is_running "$SAVED_PID"; then
    MAIN_PID="$SAVED_PID"
  else
    rm -f "$PID_DIR/server.pid"
  fi
fi

if [ -z "$MAIN_PID" ]; then
  FOUND_PID="$(pgrep -f "node.*src/server\.js" | head -n 1 || true)"
  if [ -n "$FOUND_PID" ]; then
    MAIN_PID="$FOUND_PID"
    echo "$MAIN_PID" > "$PID_DIR/server.pid"
  fi
fi

if [ -n "$MAIN_PID" ]; then
  echo "[-] Free Fire Server is already running (PID: $MAIN_PID)."
  echo "    Dashboard: http://127.0.0.1:$PORT"
  echo "    To stop it, run: ./stop.sh"
  exit 0
fi

echo "=================================================="
echo " Starting Free Fire Server..."
echo "=================================================="

# Check node installation
if ! command -v node >/dev/null 2>&1; then
  echo "[!] Error: Node.js is not installed or not in PATH."
  exit 1
fi

NODE_VER="$(node -v)"
echo "[*] Node runtime: $NODE_VER"
echo "[*] Target Port: $PORT (HTTP/Admin) | TCP Gateway: $TCP_PORT"

if [ "$MODE" = "foreground" ]; then
  echo "[*] Starting server in FOREGROUND mode..."
  echo "    Press Ctrl+C to stop."
  exec node src/server.js
fi

# Background daemon mode
SERVER_LOG="$LOG_DIR/server.log"
echo "[*] Starting unified server daemon (logging to $SERVER_LOG)..."
nohup node src/server.js > "$SERVER_LOG" 2>&1 &
SERVER_PID=$!
echo "$SERVER_PID" > "$PID_DIR/server.pid"
echo "[+] Main server process started (PID: $SERVER_PID)"

# Optionally start worker services (settlement and matchmaker)
if [ "$START_ALL" = "true" ]; then
  echo "[*] Starting auxiliary worker services..."
  
  SETTLE_LOG="$LOG_DIR/settlement.log"
  nohup node src/servers/settlement.js > "$SETTLE_LOG" 2>&1 &
  SETTLE_PID=$!
  echo "$SETTLE_PID" > "$PID_DIR/settlement.pid"
  echo "[+] Settlement service started (PID: $SETTLE_PID)"

  MM_LOG="$LOG_DIR/matchmaker.log"
  nohup node src/servers/matchmaker.js > "$MM_LOG" 2>&1 &
  MM_PID=$!
  echo "$MM_PID" > "$PID_DIR/matchmaker.pid"
  echo "[+] Matchmaker service started (PID: $MM_PID)"
fi

# Wait for server to initialize and respond to health checks
echo -n "[*] Waiting for server health check on port $PORT..."
SUCCESS="false"
for i in {1..20}; do
  sleep 0.5
  if ! is_running "$SERVER_PID"; then
    echo ""
    echo "[!] Error: Server process $SERVER_PID died unexpectedly."
    echo "--- Recent logs from $SERVER_LOG ---"
    tail -n 25 "$SERVER_LOG" 2>/dev/null || true
    rm -f "$PID_DIR/server.pid"
    exit 1
  fi

  HTTP_CODE="$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:$PORT/health" 2>/dev/null || true)"
  if [ "$HTTP_CODE" = "200" ]; then
    SUCCESS="true"
    break
  fi
  echo -n "."
done

echo ""
if [ "$SUCCESS" = "true" ]; then
  echo "=================================================="
  echo " [✓] Free Fire Server started successfully!"
  echo "=================================================="
  echo " - HTTP / Admin Dashboard : http://127.0.0.1:$PORT"
  echo " - TCP Protocol Gateway   : 0.0.0.0:$TCP_PORT"
  echo " - Main Server PID        : $SERVER_PID"
  echo " - Server Log             : $SERVER_LOG"
  echo ""
  echo "Useful commands:"
  echo " - View logs : tail -f $SERVER_LOG"
  echo " - Stop      : ./stop.sh"
  echo "=================================================="
else
  echo "[!] Warning: Server process is running (PID: $SERVER_PID) but did not respond with 200 on /health yet."
  echo "    Check log output with: tail -f $SERVER_LOG"
fi
