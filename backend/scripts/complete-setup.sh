#!/bin/bash

# Complete SimpleTodo setup and deployment script
echo "🚀 Complete SimpleTodo Setup Started..."

# Navigate to project root
cd "$(dirname "$0")/../.."

# Set environment variables
echo "🔧 Setting up environment..."
export LINERA_WALLET="/tmp/.tmptEVJHF/wallet_0.json"
export LINERA_KEYSTORE="/tmp/.tmptEVJHF/keystore_0.json"
export LINERA_STORAGE="rocksdb:/tmp/.tmptEVJHF/client_0.db"

# Verify wallet
echo "📋 Verifying wallet..."
if ! linera wallet show > /dev/null 2>&1; then
    echo "❌ Wallet not accessible. Make sure you ran 'linera net up --other-initial-chains 9' first"
    exit 1
fi
echo "✅ Wallet verified"

# Build application
echo "🔨 Building SimpleTodo..."
./backend/scripts/build.sh
if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

# Start GraphQL service if not running
echo "🌐 Starting GraphQL service..."
if ! curl -s http://localhost:8080/health > /dev/null 2>&1; then
    linera service --port 8080 &
    echo "⏳ Waiting for service to start..."
    sleep 5
else
    echo "✅ GraphQL service already running"
fi

# Deploy application
echo "📤 Deploying SimpleTodo..."
linera publish-and-create \
    target/wasm32-unknown-unknown/release/simple_todo_contract.wasm \
    target/wasm32-unknown-unknown/release/simple_todo_service.wasm \
    --json-argument "{}"

if [ $? -eq 0 ]; then
    echo "🎉 SimpleTodo deployed successfully!"
    echo "📍 GraphQL endpoint: http://localhost:8080/graphql"
    echo "🌐 You can now start the frontend with: cd frontend && npm run dev"
else
    echo "❌ Deployment failed!"
    exit 1
fi