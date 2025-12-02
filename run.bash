#!/usr/bin/env bash

set -eu

echo "Starting CoinDrafts Linera Application..."

# Set up Linera network
eval "$(linera net helper)"
linera_spawn linera net up --with-faucet

export LINERA_FAUCET_URL=http://localhost:8080
linera wallet init --faucet="$LINERA_FAUCET_URL"
linera wallet request-chain --faucet="$LINERA_FAUCET_URL"

echo "Building and publishing CoinDrafts Core backend..."
cd /build
cargo build --release --target wasm32-unknown-unknown --package coindrafts-core

echo "Deploying CoinDrafts Core..."
COINDRAFTS_CORE_APP_ID=$(linera publish-and-create target/wasm32-unknown-unknown/release/coindrafts_core_{contract,service}.wasm --json-argument "null" 2>&1 | grep -o '[a-f0-9]\{64\}' | tail -1)
echo "CoinDrafts Core App ID: $COINDRAFTS_CORE_APP_ID"

echo "Building and publishing Traditional Leagues backend..."
cd /build
cargo build --release --target wasm32-unknown-unknown --package traditional-leagues

echo "Deploying Traditional Leagues..."
TRADITIONAL_LEAGUES_APP_ID=$(linera publish-and-create target/wasm32-unknown-unknown/release/traditional_leagues_{contract,service}.wasm --json-argument "null" 2>&1 | grep -o '[a-f0-9]\{64\}' | tail -1)
echo "Traditional Leagues App ID: $TRADITIONAL_LEAGUES_APP_ID"

# Get the default chain ID (the second chain ID from wallet show - the one with blocks)
DEFAULT_CHAIN_ID=$(linera wallet show 2>&1 | grep -o '[a-f0-9]\{64,66\}' | sed -n '2p')
echo "Default Chain ID: $DEFAULT_CHAIN_ID"

echo "Starting GraphQL service on port 8081..."
linera_spawn linera service --port 8081

echo "Building and running SvelteKit frontend..."
cd /build/frontend

# Install dependencies
. ~/.nvm/nvm.sh
nvm use lts/krypton
npm install

# Update SvelteKit environment variables with deployed application IDs
export PUBLIC_COINDRAFTS_CORE_APP_ID=$COINDRAFTS_CORE_APP_ID
export PUBLIC_TRADITIONAL_LEAGUES_APP_ID=$TRADITIONAL_LEAGUES_APP_ID
export PUBLIC_DEFAULT_CHAIN_ID=$DEFAULT_CHAIN_ID

# Update .env file for SvelteKit
echo "PUBLIC_COINDRAFTS_CORE_APP_ID=$COINDRAFTS_CORE_APP_ID" > .env
echo "PUBLIC_TRADITIONAL_LEAGUES_APP_ID=$TRADITIONAL_LEAGUES_APP_ID" >> .env
echo "PUBLIC_DEFAULT_CHAIN_ID=$DEFAULT_CHAIN_ID" >> .env

echo ""
echo "===== DEPLOYMENT COMPLETE ====="
echo "CoinDrafts Core App ID: $COINDRAFTS_CORE_APP_ID"
echo "Traditional Leagues App ID: $TRADITIONAL_LEAGUES_APP_ID"
echo "Default Chain ID: $DEFAULT_CHAIN_ID"
echo "==============================="
echo ""

# Start SvelteKit development server
npm run dev -- --host 0.0.0.0 --port 5173

echo "CoinDrafts is running!"
echo "Frontend: http://localhost:5173"
echo "GraphQL: http://localhost:8080"
echo "CoinDrafts Core: $COINDRAFTS_CORE_APP_ID"
echo "Traditional Leagues: $TRADITIONAL_LEAGUES_APP_ID"

# Keep the container running
wait