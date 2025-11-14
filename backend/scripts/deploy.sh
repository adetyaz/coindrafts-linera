#!/bin/bash

# Deploy CoinDrafts Core application to local network
echo "🚀 Deploying CoinDrafts Core application..."

# Navigate to project root
cd "$(dirname "$0")/../.."

# Set environment variables
echo "🔧 Setting up environment..."
export LINERA_WALLET="/tmp/.tmptEVJHF/wallet_0.json"
export LINERA_KEYSTORE="/tmp/.tmptEVJHF/keystore_0.json"
export LINERA_STORAGE="rocksdb:/tmp/.tmptEVJHF/client_0.db"

# Stop any running service to avoid database lock
echo "🛑 Stopping any running Linera service..."
pkill -f "linera service" 2>/dev/null || true
sleep 3

# Build first
./backend/scripts/build.sh

if [ $? -ne 0 ]; then
    echo "❌ Build failed, cannot deploy"
    exit 1
fi

# Deploy the application
echo "📤 Publishing application..."
linera publish-and-create \
    target/wasm32-unknown-unknown/release/coindrafts_core_contract.wasm \
    target/wasm32-unknown-unknown/release/coindrafts_core_service.wasm \
    --json-argument "null"

if [ $? -eq 0 ]; then
    echo "✅ CoinDrafts Core application deployed successfully!"
    echo "🔍 Check the application ID in the output above"
    
    # Start the GraphQL service after successful deployment
    echo "🌐 Starting GraphQL service..."
    linera service --port 8080 &
    sleep 3
    echo "🌐 GraphQL endpoint: http://localhost:8080/graphql"
else
    echo "❌ Deployment failed!"
    exit 1
fi