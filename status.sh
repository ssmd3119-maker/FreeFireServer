#!/bin/bash
# ==============================================================================
# Free Fire Server - Status Script
# Inspects current running status and health of the server
# ==============================================================================

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

PID_DIR="$DIR/.pids"

# Load environment variables if .env exists
if [ -f "$DIR/.env" ]; then
  export $(grep -v '^#' "$DIR/.env" | xargs -0 2>/dev/null || true)
fi

PORT="${APP_PORT:-${DEFAULT_APP_PORT:-3000}}"
TCP_PORT="${TCP_PORT:-10300}"

echo "=================================================="
echo " Free Fire Server Status"
echo "=================================================="

is_running() {
  local pid="$1"
  [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null
}

PIDS="$(pgrep -f "node.*src/server\.js" || true)"

if [ -n "$PIDS" ]; then
  echo "[✓] Server is RUNNING"
  echo "    PID(s)  : $PIDS"
  echo "    HTTP    : http://127.0.0.1:$PORT"
  echo "    TCP     : 0.0.0.0:$TCP_PORT"

  # Health check
  HEALTH="$(curl -s --max-time 2 "http://127.0.0.1:$PORT/health" 2>/dev/null || true)"
  if [ -n "$HEALTH" ]; then
    echo "    Health  : OK ($HEALTH)"
  else
    echo "    Health  : Non-responsive on /health"
  fi
else
  echo "[-] Server is STOPPED"
  echo "    Run './start.sh' to start."
fi
echo "=================================================="
