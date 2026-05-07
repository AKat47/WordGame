#!/bin/bash
# Navigate to this script's directory (works from Finder double-click)
cd "$(dirname "$0")"

# Install deps if node_modules is missing or stale
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
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
npm run dev:all
