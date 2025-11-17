#!/bin/bash

# Deploy Traditional Leagues application to local network
echo "🏆 Deploying Traditional Leagues application..."

# Navigate to project root
cd "$(dirname "$0")/../.."

# Set environment variables
echo "🔧 Setting up environment..."
export LINERA_WALLET="/tmp/.tmpnTPXIS/wallet_0.json"
export LINERA_KEYSTORE="/tmp/.tmpnTPXIS/keystore_0.json"
export LINERA_STORAGE="rocksdb:/tmp/.tmpnTPXIS/client_0.db"

# Stop any running service to avoid database lock
echo "🛑 Stopping GraphQL service temporarily..."
pkill -f "linera service" 2>/dev/null || true
sleep 3

# Build Traditional Leagues
echo "🔨 Building Traditional Leagues..."
cd backend/applications/traditional-leagues
cargo build --target wasm32-unknown-unknown --release

if [ $? -ne 0 ]; then
    echo "❌ Build failed, cannot deploy"
    exit 1
fi

# Navigate back to project root
cd ../../..

# Deploy the application
echo "📤 Publishing Traditional Leagues application..."
linera publish-and-create \
    target/wasm32-unknown-unknown/release/traditional_leagues_contract.wasm \
    target/wasm32-unknown-unknown/release/traditional_leagues_service.wasm \
    --json-argument "null"

if [ $? -eq 0 ]; then
    echo "✅ Traditional Leagues application deployed successfully!"
    echo "🔍 Check the application ID in the output above"
    
    # Restart GraphQL service with both applications
    echo "🌐 Restarting GraphQL service..."
    linera service --port 8080 &
    sleep 3
    echo "🌐 GraphQL endpoint: http://localhost:8080"
else
    echo "❌ Deployment failed!"
    exit 1
fi