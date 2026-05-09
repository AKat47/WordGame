#!/bin/bash
# Navigate to this script's directory (works from Finder double-click)
cd "$(dirname "$0")"

# Install deps — also reinstall if vite cli is missing (handles corrupted installs)
if [ ! -d "node_modules" ] || [ ! -f "node_modules/vite/dist/node/cli.js" ]; then
  echo "Installing dependencies (clean install)..."
  rm -rf node_modules
  npm install
fi

# Create .env from example if it doesn't exist yet
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo ""
  echo "⚠️  Created .env from .env.example"
  echo "    Edit MONGODB_URI if you're using a remote MongoDB (e.g. Atlas)."
  echo "    Default is local: mongodb://localhost:27017/word-garden"
fi

echo ""
echo "Starting Word Garden (UI + API)..."
echo "App  → http://localhost:5173"
echo "API  → http://localhost:3001"
echo ""

# Start API server in background, capture PID for clean shutdown
node server/index.js &
API_PID=$!
trap "kill $API_PID 2>/dev/null" EXIT

# Run Vite directly (bypasses broken .bin/vite shim on Node v25)
node node_modules/vite/dist/node/cli.js
