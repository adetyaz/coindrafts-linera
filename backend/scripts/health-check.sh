#!/bin/bash

# Health check script for SimpleTodo deployment
echo "🔍 Checking SimpleTodo deployment health..."

# Check if wallet exists
echo "📋 Checking wallet..."
if linera wallet show > /dev/null 2>&1; then
    echo "✅ Wallet is configured"
else
    echo "❌ Wallet not found - run 'linera net up --extra-wallets 9' first"
    exit 1
fi

# Check if storage service is running
echo "📦 Checking storage service..."
if pgrep -f "linera-storage-service" > /dev/null; then
    echo "✅ Storage service is running"
else
    echo "❌ Storage service not running"
fi

# Check if GraphQL service is running
echo "🌐 Checking GraphQL service..."
if curl -s http://localhost:8080/health > /dev/null; then
    echo "✅ GraphQL service is running on port 8080"
else
    echo "❌ GraphQL service not responding on port 8080"
fi

# Check if WASM binaries exist
echo "📦 Checking WASM binaries..."
CONTRACT_WASM="target/wasm32-unknown-unknown/release/simple_todo_contract.wasm"
SERVICE_WASM="target/wasm32-unknown-unknown/release/simple_todo_service.wasm"

if [ -f "$CONTRACT_WASM" ]; then
    echo "✅ Contract WASM exists at $CONTRACT_WASM"
else
    echo "❌ Contract WASM not found - run build script first"
fi

if [ -f "$SERVICE_WASM" ]; then
    echo "✅ Service WASM exists at $SERVICE_WASM"
else
    echo "❌ Service WASM not found - run build script first"
fi

# Test GraphQL endpoint
echo "🔌 Testing GraphQL endpoint..."
RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{"query":"query { __schema { types { name } } }"}' \
    http://localhost:8080/graphql)

if echo "$RESPONSE" | grep -q "types"; then
    echo "✅ GraphQL endpoint is responding"
else
    echo "❌ GraphQL endpoint not working properly"
    echo "Response: $RESPONSE"
fi

echo "🏁 Health check complete!"