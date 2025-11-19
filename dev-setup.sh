#!/bin/bash

# CoinDrafts Development Environment Setup
# Handles both first-time deployment and subsequent runs

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 CoinDrafts Development Environment"

# Check if applications are already deployed (frontend .env exists with app IDs)
if [ -f "$PROJECT_ROOT/frontend/.env" ]; then
    source "$PROJECT_ROOT/frontend/.env"
    if [ ! -z "$PUBLIC_COINDRAFTS_CORE_APP_ID" ] && [ ! -z "$PUBLIC_TRADITIONAL_LEAGUES_APP_ID" ]; then
        echo "✅ Applications already deployed!"
        echo "   CoinDrafts Core: $PUBLIC_COINDRAFTS_CORE_APP_ID"
        echo "   Traditional Leagues: $PUBLIC_TRADITIONAL_LEAGUES_APP_ID"
        SKIP_DEPLOYMENT=true
    fi
fi

if [ "$SKIP_DEPLOYMENT" != "true" ]; then
    echo "🔧 First-time setup: Deploying applications..."
    
    # Initialize Linera network
    echo "📋 Initializing Linera network..."
    linera net up --extra-wallets 9
    
    # Start services first
    echo "🌐 Starting Linera services..."
    pkill -f linera-service || true
    sleep 1
    linera service --port 8080 &
    SERVICE_PID=$!
    
    # Wait for service
    echo "⏳ Waiting for GraphQL service..."
    for i in {1..15}; do
        if curl -s http://localhost:8080/health > /dev/null 2>&1; then
            break
        fi
        sleep 1
    done
    
    # Deploy CoinDrafts Core
    echo "📦 Building and deploying CoinDrafts Core..."
    cd "$PROJECT_ROOT/backend/applications/coindrafts-core"
    linera build
    CORE_BYTECODE_ID=$(linera publish target/wasm32-unknown-unknown/release/coindrafts-core_{contract,service}.wasm)
    CORE_APP_ID=$(linera create-application $CORE_BYTECODE_ID --json-argument "{}")
    
    # Deploy Traditional Leagues  
    echo "📦 Building and deploying Traditional Leagues..."
    cd "$PROJECT_ROOT/backend/applications/traditional-leagues"
    linera build
    LEAGUES_BYTECODE_ID=$(linera publish target/wasm32-unknown-unknown/release/traditional-leagues_{contract,service}.wasm)
    LEAGUES_APP_ID=$(linera create-application $LEAGUES_BYTECODE_ID --json-argument "{}")
    
    # Save to frontend .env
    cd "$PROJECT_ROOT/frontend"
    cat > .env << EOF
PUBLIC_COINDRAFTS_CORE_APP_ID=$CORE_APP_ID
PUBLIC_TRADITIONAL_LEAGUES_APP_ID=$LEAGUES_APP_ID
EOF
    
    echo "✅ Deployment complete!"
    echo "   CoinDrafts Core: $CORE_APP_ID"
    echo "   Traditional Leagues: $LEAGUES_APP_ID"
    
else
    # Just start services
    if curl -s http://localhost:8080/health > /dev/null 2>&1; then
        echo "✅ Linera service already running"
    else
        echo "🌐 Starting Linera service..."
        pkill -f linera-service || true
        sleep 1
        linera service --port 8080 &
        SERVICE_PID=$!
        
        echo "⏳ Waiting for service..."
        for i in {1..15}; do
            if curl -s http://localhost:8080/health > /dev/null 2>&1; then
                echo "✅ Service started (PID: $SERVICE_PID)"
                break
            fi
            sleep 1
        done
    fi
fi

# Start frontend if in Docker or if requested
if [ "$1" = "with-frontend" ] || [ ! -z "$DOCKER_MODE" ]; then
    echo "🎨 Starting frontend..."
    cd "$PROJECT_ROOT/frontend"
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing frontend dependencies..."
        npm install
    fi
    
    # Start frontend (background in Docker, foreground otherwise)
    if [ ! -z "$DOCKER_MODE" ]; then
        echo "🚀 Starting SvelteKit dev server..."
        npm run dev -- --host 0.0.0.0 --port 5173 &
        FRONTEND_PID=$!
        
        echo ""
        echo "🎉 Full development environment ready!"
        echo "📍 GraphQL endpoint: http://localhost:8080"
        echo "📍 Frontend: http://localhost:5173"
        echo ""
        echo "🐳 Running in Docker mode - keeping processes alive..."
        
        # Keep container running
        wait $FRONTEND_PID
    else
        echo "🚀 Starting SvelteKit dev server..."
        npm run dev
    fi
else
    echo ""
    echo "🎉 Backend ready!"
    echo "📍 GraphQL endpoint: http://localhost:8080"
    echo ""
    echo "To start the frontend:"
    echo "   cd frontend && npm run dev"
    echo ""
    echo "To start everything at once:"
    echo "   ./dev-setup.sh with-frontend"
    echo ""
    echo "To reset and redeploy:"
    echo "   rm frontend/.env && ./dev-setup.sh"
fi