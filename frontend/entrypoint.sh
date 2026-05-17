#!/bin/sh
set -e

cd /app

LOCK_FILE="package-lock.json"
MARKER="node_modules/.install-hash"

if [ ! -f "$LOCK_FILE" ]; then
  echo "ERROR: package-lock.json not found in /app"
  exit 1
fi

if command -v md5sum >/dev/null 2>&1; then
  HASH=$(md5sum "$LOCK_FILE" | awk '{print $1}')
else
  HASH=$(md5 -q "$LOCK_FILE")
fi

if [ ! -f "$MARKER" ] || [ "$(cat "$MARKER" 2>/dev/null)" != "$HASH" ]; then
  echo "Installing npm dependencies (npm ci)..."
  npm ci --include=dev
  echo "$HASH" > "$MARKER"
  echo "npm dependencies installed."
else
  echo "npm dependencies up to date."
fi

echo "Starting Next.js..."
exec npm run dev -- -H 0.0.0.0 -p 3000
