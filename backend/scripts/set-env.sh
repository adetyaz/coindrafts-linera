#!/bin/bash

# Environment setup for SimpleTodo Linera deployment
echo "🔧 Setting up Linera environment variables..."

# Set the environment variables from the network output
export LINERA_WALLET="/tmp/.tmpY2e2QM/wallet_0.json"
export LINERA_KEYSTORE="/tmp/.tmpY2e2QM/keystore_0.json"
export LINERA_STORAGE="rocksdb:/tmp/.tmpY2e2QM/client_0.db"

echo "✅ Environment variables set:"
echo "📁 LINERA_WALLET=$LINERA_WALLET"
echo "🔑 LINERA_KEYSTORE=$LINERA_KEYSTORE"
echo "💾 LINERA_STORAGE=$LINERA_STORAGE"

# Verify wallet is accessible
if linera wallet show > /dev/null 2>&1; then
    echo "✅ Wallet is accessible"
else
    echo "❌ Wallet not accessible - check if network is running"
    exit 1
fi

echo "🎉 Environment setup complete!"
echo "💡 You can now run: ./backend/scripts/deploy.sh"