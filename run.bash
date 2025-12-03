#!/usr/bin/env bash
set -eu

echo "Starting CoinDrafts Linera Application..."

# Set up Linera network
eval "$(linera net helper)"
linera_spawn linera net up --with-faucet

export LINERA_FAUCET_URL=http://localhost:8080
linera wallet init --faucet="$LINERA_FAUCET_URL"
linera wallet request-chain --faucet="$LINERA_FAUCET_URL"

# Build both applications in parallel
echo "Building applications..."
cd /build
cargo build --release --target wasm32-unknown-unknown --package coindrafts-core --package traditional-leagues

# Deploy CoinDrafts Core
echo "Deploying CoinDrafts Core..."
CORE_OUTPUT=$(linera publish-and-create target/wasm32-unknown-unknown/release/coindrafts_core_{contract,service}.wasm --json-argument "null" 2>&1)
COINDRAFTS_CORE_APP_ID=$(echo "$CORE_OUTPUT" | grep -o '[a-f0-9]\{64\}' | tail -1)
echo "Core App ID: $COINDRAFTS_CORE_APP_ID"

# Deploy Traditional Leagues
echo "Deploying Traditional Leagues..."
LEAGUES_OUTPUT=$(linera publish-and-create target/wasm32-unknown-unknown/release/traditional_leagues_{contract,service}.wasm --json-argument "null" 2>&1)
TRADITIONAL_LEAGUES_APP_ID=$(echo "$LEAGUES_OUTPUT" | grep -o '[a-f0-9]\{64\}' | tail -1)
echo "Leagues App ID: $TRADITIONAL_LEAGUES_APP_ID"

# Get default chain ID
DEFAULT_CHAIN_ID=$(linera wallet show 2>&1 | grep -o '[a-f0-9]\{64,66\}' | sed -n '2p')
echo "Chain ID: $DEFAULT_CHAIN_ID"

# Wait for blob synchronization
sleep 20

# Start GraphQL service
echo "Starting GraphQL service..."
linera service --port 8081 > /tmp/graphql-service.log 2>&1 &
sleep 2

# Setup frontend
cd /build/frontend
. ~/.nvm/nvm.sh
nvm use lts/krypton

# Write .env file
cat > .env << EOF
PUBLIC_COINDRAFTS_CORE_APP_ID=$COINDRAFTS_CORE_APP_ID
PUBLIC_TRADITIONAL_LEAGUES_APP_ID=$TRADITIONAL_LEAGUES_APP_ID
PUBLIC_DEFAULT_CHAIN_ID=$DEFAULT_CHAIN_ID
EOF

# Install dependencies
echo "Installing dependencies..."
npm install

# Run auto-seed script
echo ""
echo "🌱 Running auto-seed script..."
cd /build
node seed-data.js

echo ""
echo "===== DEPLOYMENT COMPLETE ====="
echo "Core: $COINDRAFTS_CORE_APP_ID"
echo "Leagues: $TRADITIONAL_LEAGUES_APP_ID"
echo "Chain: $DEFAULT_CHAIN_ID"
echo "GraphQL: http://localhost:8081"
echo "Frontend: http://localhost:5173"
echo "==============================="
echo ""

# Start frontend
cd /build/frontend
exec npm run dev -- --host 0.0.0.0 --port 5173