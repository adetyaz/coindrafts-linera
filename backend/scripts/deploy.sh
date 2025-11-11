#!/bin/bash

# Deploy SimpleTodo application to local network
echo "🚀 Deploying SimpleTodo application..."

# Navigate to project root
cd "$(dirname "$0")/../.."

# Build first
./backend/scripts/build.sh

if [ $? -ne 0 ]; then
    echo "❌ Build failed, cannot deploy"
    exit 1
fi

# Deploy the application
echo "📤 Publishing application..."
linera publish-and-create \
    backend/applications/simple-todo/target/wasm32-unknown-unknown/release/simple_todo.wasm \
    --json-argument "{}"

if [ $? -eq 0 ]; then
    echo "✅ SimpleTodo application deployed successfully!"
    echo "🔍 Check the application ID in the output above"
    echo "🌐 GraphQL endpoint: http://localhost:8080/graphql"
else
    echo "❌ Deployment failed!"
    exit 1
fi