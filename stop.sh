#!/bin/bash
# ==============================================================================
# Free Fire Server - Stop Script
# Gracefully terminates all running server instances and auxiliary workers
# ==============================================================================

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

PID_DIR="$DIR/.pids"

echo "=================================================="
echo " Stopping Free Fire Server..."
echo "=================================================="

STOPPED_COUNT=0

# Helper to check if a process is running
is_running() {
  local pid="$1"
  [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null
}

# Helper to stop a process by PID
stop_pid() {
  local pid="$1"
  local name="$2"

  if is_running "$pid"; then
    echo "[*] Terminating $name (PID: $pid) with SIGTERM..."
    kill -15 "$pid" 2>/dev/null || true

    # Wait up to 5 seconds for graceful shutdown
    local count=0
    while is_running "$pid" && [ $count -lt 10 ]; do
      sleep 0.5
      count=$((count + 1))
    done

    if is_running "$pid"; then
      echo "[!] $name did not stop within 5s. Forcing SIGKILL..."
      kill -9 "$pid" 2>/dev/null || true
      sleep 0.5
    fi

    if ! is_running "$pid"; then
      echo "[✓] Stopped $name (PID: $pid)"
      STOPPED_COUNT=$((STOPPED_COUNT + 1))
    else
      echo "[!] Failed to terminate PID $pid"
    fi
  fi
}

# 1. Stop processes recorded in PID directory
if [ -d "$PID_DIR" ]; then
  for pidfile in "$PID_DIR"/*.pid; do
    if [ -f "$pidfile" ]; then
      SERVICE_NAME="$(basename "$pidfile" .pid)"
      PID="$(cat "$pidfile" 2>/dev/null || true)"
      if [ -n "$PID" ]; then
        stop_pid "$PID" "$SERVICE_NAME"
      fi
      rm -f "$pidfile"
    fi
  done
fi

# 2. Stop any remaining background processes matching server patterns
MATCH_PATTERNS=(
  "node.*src/server\.js"
  "node.*src/servers/live\.js"
  "node.*src/servers/login\.js"
  "node.*src/servers/main\.js"
  "node.*src/servers/tcp\.js"
  "node.*src/servers/settlement\.js"
  "node.*src/servers/matchmaker\.js"
)

for pattern in "${MATCH_PATTERNS[@]}"; do
  PIDS="$(pgrep -f "$pattern" || true)"
  for pid in $PIDS; do
    # Avoid killing current script or ancestors
    if [ "$pid" != "$$" ] && [ "$pid" != "$PPID" ]; then
      stop_pid "$pid" "process matching '$pattern'"
    fi
  done
done

# 3. Clean up PID files
rm -rf "$PID_DIR"/*

echo "=================================================="
if [ $STOPPED_COUNT -gt 0 ]; then
  echo " [✓] All Free Fire Server processes have been stopped ($STOPPED_COUNT stopped)."
else
  echo " [-] No running server processes were found."
fi
echo "=================================================="
