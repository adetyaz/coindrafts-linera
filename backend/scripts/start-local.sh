#!/bin/bash

# Setup local Linera network for development
echo "🚀 Setting up local Linera network..."

# Kill any existing processes
pkill -f linera-storage-service
pkill -f linera-service

# Wait for processes to stop
sleep 2

# Initialize local network configuration first
echo "⚙️ Initializing network configuration..."
linera net up --extra-wallets 9

# Verify wallet was created
if ! linera wallet show > /dev/null 2>&1; then
    echo "❌ Failed to initialize wallet"
    exit 1
fi

# Start storage service in background
echo "📦 Starting storage service..."
linera-storage-service memory --port 19999 &
STORAGE_PID=$!

# Wait for storage service to start
sleep 3

# Start linera service
echo "🌐 Starting Linera service..."
linera service --port 8080 &
SERVICE_PID=$!

# Wait for service to start
sleep 3

# Test if services are running
if curl -s http://localhost:8080/health > /dev/null; then
    echo "✅ Local Linera network is running!"
    echo "📍 GraphQL endpoint: http://localhost:8080/graphql"
    echo "📍 Health check: http://localhost:8080/health"
    echo "📍 Storage PID: $STORAGE_PID"
    echo "📍 Service PID: $SERVICE_PID"
    
    # Save PIDs for easy cleanup
    mkdir -p ~/.config/linera
    echo "$STORAGE_PID" > ~/.config/linera/storage.pid
    echo "$SERVICE_PID" > ~/.config/linera/service.pid
else
    echo "❌ Failed to start Linera services"
    pkill -P $$
    exit 1
fi