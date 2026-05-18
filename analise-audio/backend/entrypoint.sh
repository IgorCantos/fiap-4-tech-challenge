#!/bin/sh
set -e

cd /app

if ! python -c "import flask, torch, faster_whisper, transformers" 2>/dev/null; then
  echo "Installing Python dependencies (pip install)..."
  pip install --no-cache-dir -r requirements.txt
  echo "Python dependencies installed."
else
  echo "Python dependencies OK."
fi

OLLAMA_HOST="${OLLAMA_HOST:-http://ollama:11434}"
export OLLAMA_HOST

echo "Waiting for Ollama at ${OLLAMA_HOST}..."
until curl -sf "${OLLAMA_HOST}/api/tags" > /dev/null 2>&1; do
  sleep 2
done

echo "Ensuring Ollama model gemma3:1b is available..."
curl -sf "${OLLAMA_HOST}/api/pull" \
  -H "Content-Type: application/json" \
  -d '{"name":"gemma3:1b"}' \
  > /dev/null || true

echo "Loading ML models and starting Flask..."
exec python app.py
