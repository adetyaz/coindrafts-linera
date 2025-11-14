#!/bin/bash

# Deploy Traditional Leagues application to local network
echo "🚀 Deploying Traditional Leagues application..."

# Navigate to project root
cd "$(dirname "$0")/../.."

# Stop any running service to avoid database lock
echo "🛑 Stopping any running Linera service..."
pkill -f "linera service" 2>/dev/null || true
sleep 2

# Build first
# ./backend/scripts/build.sh

# if [ $? -ne 0 ]; then
#     echo "❌ Build failed, cannot deploy"
#     exit 1
# fi

# Deploy the application
echo "📤 Publishing Traditional Leagues application..."
linera publish-and-create \
    target/wasm32-unknown-unknown/release/traditional_leagues_contract.wasm \
    target/wasm32-unknown-unknown/release/traditional_leagues_service.wasm \
    --json-argument "null"

if [ $? -eq 0 ]; then
    echo "✅ Traditional Leagues application deployed successfully!"
    echo "🔍 Check the application ID in the output above"
    
    # Start the GraphQL service after successful deployment
    echo "🌐 Starting GraphQL service..."
    linera service --port 8080 &
    sleep 3
    echo "🌐 GraphQL endpoint: http://localhost:8080/"
else
    echo "❌ Deployment failed!"
    exit 1
fi