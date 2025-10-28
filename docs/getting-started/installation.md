---
sidebar_position: 1
---

# Getting Started with CoinDrafts on Linera

Welcome to CoinDrafts on Linera! This guide will help you set up the development environment and understand how to build and deploy fantasy crypto gaming applications on the Linera protocol.

## Prerequisites

Before you begin, ensure you have the following installed:

### System Requirements

**Operating System Support:**

- ✅ **Linux** (Ubuntu 20.04+, recommended)
- ✅ **macOS** (Intel and Apple Silicon)
- ✅ **Windows** (via WSL2 - Windows Subsystem for Linux)

### Development Dependencies

**Core Requirements:**

```bash
# Rust toolchain (version 1.86.0 for Linera compatibility)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup target add wasm32-unknown-unknown

# Protocol Buffers (version 21.11)
curl -LO https://github.com/protocolbuffers/protobuf/releases/download/v21.11/protoc-21.11-linux-x86_64.zip
unzip protoc-21.11-linux-x86_64.zip -d $HOME/.local
export PATH="$HOME/.local/bin:$PATH"

# Additional Linux dependencies
sudo apt update
sudo apt install -y build-essential clang libssl-dev pkg-config
```

## Linera Toolchain Installation

### Installing from crates.io (Recommended)

Install the latest compatible Linera binaries:

```bash
cargo install --locked linera-storage-service@0.15.3
cargo install --locked linera-service@0.15.3
```

Add the Linera SDK to your projects:

```bash
cargo add linera-sdk@0.15.3
```

### Verifying Installation

Check that Linera tools are properly installed:

```bash
linera --version
# Should output: linera 0.15.3

linera-storage-service --version
# Should output: linera-storage-service 0.15.3
```

## Setting Up CoinDrafts Development Environment

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/coindrafts-linera.git
cd coindrafts-linera
```

### 2. Install Project Dependencies

```bash
# Install Rust dependencies
cargo build

# Install frontend dependencies (if applicable)
cd frontend && npm install
```

### 3. Initialize Local Test Network

Start a local Linera test network for development:

```bash
# Start local network with faucet
linera net up --with-faucet --faucet-port 8080

# In a separate terminal, initialize wallet
linera wallet init --faucet http://localhost:8080
linera wallet request-chain --faucet http://localhost:8080
```

### 4. Deploy CoinDrafts Applications

Build and deploy the core CoinDrafts applications:

```bash
# Build all applications
cd applications
cargo build --release --target wasm32-unknown-unknown

# Deploy core applications
./scripts/deploy-coindrafts.sh
```

## Development Workflow

### Project Structure

```
coindrafts-linera/
├── applications/           # Linera applications
│   ├── player-chain/      # Personal player microchains
│   ├── league-manager/    # League creation and management
│   ├── price-oracle/      # Multi-source price aggregation
│   ├── ai-strategy/       # AI recommendation engine
│   └── merchant-platform/ # E-commerce integration
├── shared/                # Shared types and utilities
├── frontend/              # Web interface
├── scripts/               # Deployment and utility scripts
└── docs/                  # Documentation
```

### Creating a New Application

Use the Linera project generator for CoinDrafts applications:

```bash
# Create new application
linera project new my-feature

# Update Cargo.toml with CoinDrafts dependencies
[dependencies]
linera-sdk = "0.15.3"
coindrafts-shared = { path = "../shared" }
serde = { version = "1.0", features = ["derive"] }
async-graphql = "7.0"
```

### Testing Applications

Run tests on your local network:

```bash
# Unit tests
cargo test

# Integration tests with local network
cargo test --test integration_tests

# End-to-end tests
./scripts/e2e-tests.sh
```

## Network Configuration

### Local Development

For development, use the local test network:

```bash
export LINERA_WALLET="$HOME/.config/linera/wallet.json"
export LINERA_KEYSTORE="$HOME/.config/linera/keystore.json"
export LINERA_STORAGE="rocksdb:$HOME/.config/linera/wallet.db"
```

### Testnet Deployment

To deploy on Linera Testnet Conway:

```bash
# Initialize wallet for testnet
linera wallet init --faucet https://faucet.testnet-conway.linera.net
linera wallet request-chain --faucet https://faucet.testnet-conway.linera.net

# Deploy to testnet
./scripts/deploy-testnet.sh
```

## Quick Start: Your First CoinDrafts Feature

Let's create a simple portfolio tracker to understand the development flow:

### 1. Create Application Structure

```bash
cd applications
linera project new portfolio-tracker
cd portfolio-tracker
```

### 2. Define Application State

```rust
// src/state.rs
use linera_sdk::base::{AccountOwner, Amount, ChainId, Timestamp};
use linera_views::{
    linera_views,
    views::{MapView, RegisterView, RootView, ViewStorageContext},
};
use serde::{Deserialize, Serialize};

#[derive(RootView, async_graphql::SimpleObject)]
#[view(context = ViewStorageContext)]
pub struct PortfolioState {
    pub portfolios: MapView<AccountOwner, Portfolio>,
    pub price_feeds: MapView<String, PriceData>,
    pub leaderboard: RegisterView<Vec<LeaderboardEntry>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Portfolio {
    pub owner: AccountOwner,
    pub cryptocurrencies: Vec<CryptoSelection>,
    pub created_at: Timestamp,
    pub performance: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CryptoSelection {
    pub symbol: String,
    pub entry_price: Amount,
    pub current_price: Amount,
    pub performance: f64,
}
```

### 3. Implement Contract Logic

```rust
// src/contract.rs
use crate::state::PortfolioState;
use linera_sdk::{
    base::{Amount, ChannelName, Destination, SessionId},
    ApplicationCallResult, Contract, ExecutionResult, MessageContext,
    OperationContext, SessionCallResult,
};

pub struct PortfolioContract {
    state: PortfolioState,
    runtime: ContractRuntime<Self>,
}

#[async_trait]
impl Contract for PortfolioContract {
    type Message = PortfolioMessage;
    type Parameters = ();
    type InstantiationArgument = ();

    async fn load(runtime: ContractRuntime<Self>) -> Self {
        let state = PortfolioState::load(runtime.root_view_storage_context())
            .await
            .expect("Failed to load state");
        PortfolioContract { state, runtime }
    }

    async fn instantiate(&mut self, _argument: ()) {
        // Initialize application
    }

    async fn execute_operation(&mut self, operation: PortfolioOperation) -> PortfolioResponse {
        match operation {
            PortfolioOperation::CreatePortfolio { cryptocurrencies } => {
                let owner = self.runtime.authenticated_signer();
                let portfolio = Portfolio {
                    owner,
                    cryptocurrencies,
                    created_at: self.runtime.current_timestamp(),
                    performance: 0.0,
                };

                self.state.portfolios.insert(&owner, portfolio).await;
                PortfolioResponse::PortfolioCreated
            }

            PortfolioOperation::UpdatePrices { price_data } => {
                for (symbol, price) in price_data {
                    self.state.price_feeds.insert(&symbol, price).await;
                }

                // Update all portfolio performances
                self.recalculate_performances().await;
                PortfolioResponse::PricesUpdated
            }
        }
    }

    async fn store(mut self) {
        self.state.save().await.expect("Failed to save state");
    }
}
```

### 4. Build and Deploy

```bash
# Build the application
cargo build --release --target wasm32-unknown-unknown

# Deploy to local network
linera publish-and-create \
  target/wasm32-unknown-unknown/release/portfolio_tracker_{contract,service}.wasm \
  --json-argument "{}"
```

## Next Steps

Now that you have the basic setup, explore these guides:

- **[Linera Architecture](/docs/linera-architecture/overview)** - Deep dive into microchains and cross-chain messaging
- **[Game Modes Implementation](/docs/game-modes/traditional-leagues)** - Build the core gaming features
- **[Price Range Prediction](/docs/game-modes/price-range-prediction)** - Implement advanced market analysis with AI oracles
- **[Architecture Diagrams](/docs/architecture/complete-overview)** - Complete system overview and deployment architecture

## Getting Help

- 📚 **Linera Documentation**: [https://linera.dev](https://linera.dev)
- 💬 **Linera Discord**: [https://discord.gg/linera](https://discord.gg/linera)
- 🐛 **Issues**: [GitHub Issues](https://github.com/your-org/coindrafts-linera/issues)
- 📧 **Support**: developers@coindrafts.io

---

_Ready to build the future of crypto gaming? Let's get started!_ 🚀
