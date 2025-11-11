#!/bin/bash

# Build script for SimpleTodo Linera application
echo "🔨 Building SimpleTodo application..."

# Navigate to the application directory
cd "$(dirname "$0")/../applications/simple-todo"

# Build the application
cargo build --release --target wasm32-unknown-unknown

if [ $? -eq 0 ]; then
    echo "✅ SimpleTodo application built successfully!"
    echo "📦 WASM binary: target/wasm32-unknown-unknown/release/simple_todo.wasm"
else
    echo "❌ Build failed!"
    exit 1
fi