#!/bin/bash
cd "$(dirname "$0")"

# Create .env from example if missing
if [ ! -f ".env" ]; then
  cp .env.example .env
fi

echo ""
echo "Starting Word Garden API server..."
echo "API  → http://localhost:3001"
echo "Open http://localhost:5173 in your browser for the app."
echo ""
npm run server
