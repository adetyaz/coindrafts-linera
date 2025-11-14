#!/bin/bash

# Build script for ALL CoinDrafts Linera applications
echo "🔨 Building ALL CoinDrafts applications..."

# Navigate to the project root (workspace root)
cd "$(dirname "$0")/../.."

# Build all applications from workspace root
cargo build --release --target wasm32-unknown-unknown

if [ $? -eq 0 ]; then
    echo "✅ All applications built successfully!"
    echo "📦 CoinDrafts Core Contract: target/wasm32-unknown-unknown/release/coindrafts_core_contract.wasm"
    echo "📦 CoinDrafts Core Service: target/wasm32-unknown-unknown/release/coindrafts_core_service.wasm"
    echo "📦 Traditional Leagues Contract: target/wasm32-unknown-unknown/release/traditional_leagues_contract.wasm"
    echo "📦 Traditional Leagues Service: target/wasm32-unknown-unknown/release/traditional_leagues_service.wasm"
else
    echo "❌ Build failed!"
    exit 1
fi