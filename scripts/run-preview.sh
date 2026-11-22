#!/usr/bin/env bash
# Stable local preview: one clean Next process on :3000 (production mode).
# Avoids Turbopack .next corruption that causes recurring Internal Server Error.
set -euo pipefail
cd "$(dirname "$0")/.."

PORT="${PORT:-3000}"

kill_port() {
  local pids
  pids="$(lsof -ti ":$PORT" 2>/dev/null || true)"
  if [[ -n "${pids}" ]]; then
    echo "Stopping processes on :$PORT ($pids)"
    kill -9 $pids 2>/dev/null || true
    sleep 1
  fi
  pkill -9 -f "next (dev|start)|next-server" 2>/dev/null || true
  sleep 1
}

kill_port
rm -rf .next

echo "Building…"
npm run build

echo "Starting production server on :$PORT"
exec npx next start -p "$PORT"
