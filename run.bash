#!/usr/bin/env bash

set -eu

echo "🚀 Starting CoinDrafts Linera Application..."

# Set up Linera network
eval "$(linera net helper)"
linera_spawn linera net up --with-faucet

export LINERA_FAUCET_URL=http://localhost:8080
linera wallet init --faucet="$LINERA_FAUCET_URL"
linera wallet request-chain --faucet="$LINERA_FAUCET_URL"

echo "📦 Building and publishing CoinDrafts Core backend..."
cd /build/backend/applications/coindrafts-core
linera build
COINDRAFTS_CORE_BYTECODE_ID=$(linera publish target/wasm32-unknown-unknown/release/coindrafts-core_{contract,service}.wasm)
COINDRAFTS_CORE_APP_ID=$(linera create-application $COINDRAFTS_CORE_BYTECODE_ID)

echo "📦 Building and publishing Traditional Leagues backend..."
cd /build/backend/applications/traditional-leagues  
linera build
TRADITIONAL_LEAGUES_BYTECODE_ID=$(linera publish target/wasm32-unknown-unknown/release/traditional-leagues_{contract,service}.wasm)
TRADITIONAL_LEAGUES_APP_ID=$(linera create-application $TRADITIONAL_LEAGUES_BYTECODE_ID)

echo "🌐 Starting GraphQL service..."
linera_spawn linera service --listen 0.0.0.0:8080

echo "🎨 Building and running SvelteKit frontend..."
cd /build/frontend

# Install dependencies
. ~/.nvm/nvm.sh
nvm use lts/krypton
npm install

# Update SvelteKit environment variables with deployed application IDs
export PUBLIC_COINDRAFTS_CORE_APP_ID=$COINDRAFTS_CORE_APP_ID
export PUBLIC_TRADITIONAL_LEAGUES_APP_ID=$TRADITIONAL_LEAGUES_APP_ID

# Update .env file for SvelteKit
echo "PUBLIC_COINDRAFTS_CORE_APP_ID=$COINDRAFTS_CORE_APP_ID" > .env
echo "PUBLIC_TRADITIONAL_LEAGUES_APP_ID=$TRADITIONAL_LEAGUES_APP_ID" >> .env

# Start SvelteKit development server
npm run dev -- --host 0.0.0.0 --port 5173

echo "✅ CoinDrafts is running!"
echo "🌐 Frontend: http://localhost:5173"
echo "🔗 GraphQL: http://localhost:8080"
echo "📊 CoinDrafts Core: $COINDRAFTS_CORE_APP_ID"
echo "🏆 Traditional Leagues: $TRADITIONAL_LEAGUES_APP_ID"

# Keep the container running
wait