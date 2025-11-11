#!/bin/bash

# Setup local Linera network for development
echo "🚀 Setting up local Linera network..."

# Kill any existing processes
pkill -f linera-storage-service
pkill -f linera-service

# Start storage service in background
echo "📦 Starting storage service..."
linera-storage-service memory --storage-config-path ~/.config/linera/storage.toml &
STORAGE_PID=$!

# Wait a moment for storage to start
sleep 2

# Initialize local network configuration
echo "⚙️ Initializing network configuration..."
linera net up --extra-wallets 9

# Start linera service
echo "🌐 Starting Linera service..."
linera service --port 8080 &
SERVICE_PID=$!

echo "✅ Local Linera network is running!"
echo "📍 Service endpoint: http://localhost:8080"
echo "📍 Storage PID: $STORAGE_PID"
echo "📍 Service PID: $SERVICE_PID"

# Save PIDs for easy cleanup
echo "$STORAGE_PID" > ~/.config/linera/storage.pid
echo "$SERVICE_PID" > ~/.config/linera/service.pid