# CoinDrafts - Linera Buildathon Submission

A decentralized cryptocurrency portfolio gaming platform built on Linera Protocol v0.15.3.

## Overview

CoinDrafts allows users to compete in cryptocurrency portfolio contests and tournaments:

- **Quick Games**: Fast-paced portfolio contests with 5 cryptocurrency selections
- **Traditional Leagues**: Multi-round tournaments with up to 10 selections and prize pools

## Architecture

- **Backend**: Two Linera applications
  - `coindrafts-core`: Main game orchestration and portfolio management
  - `traditional-leagues`: Tournament management with advanced scoring
- **Frontend**: SvelteKit application with GraphQL integration
- **Deployment**: Docker-based with Linera local network

## Quick Start (Docker)

```bash
# Clone and run the complete application
docker compose up --force-recreate

# ⏱️  First run takes 5-10 minutes to:
#    • Build Rust backend applications
#    • Deploy to local Linera network
#    • Generate unique application IDs
#    • Start frontend with proper configuration

# Access the application
# Frontend: http://localhost:5173
# GraphQL: http://localhost:8080
```

## ⚠️ Important Notes

- **Wallet Connection Required**: You must connect a wallet (any Ethereum address) before creating or joining games
- **Pre-seeded Tournaments**: Traditional league tournaments are pre-populated with test data for demonstration
- **Local Development Only**: Each developer gets unique application IDs - deployments cannot be shared

## How to Use the App

### Quick Match (Fast Portfolio Contest)

1. **Connect Wallet**: Click "Connect Wallet" and enter any Ethereum address
2. **Create Game**: Navigate to "Quick Match" → Click "CREATE GAME"
3. **Select Cryptos**: Choose at least 1 cryptocurrency (up to 5 recommended)
4. **Join Game**: Click "View & Join Game" → Select exactly 5 cryptocurrencies for your portfolio
5. **Submit**: Click "Join & Submit" to register and submit your portfolio

### Traditional Leagues (Tournament Format)

1. **Connect Wallet**: Ensure wallet is connected
2. **Browse Tournaments**: Navigate to "Traditional Leagues" to see pre-seeded tournaments
3. **View Details**: Click on any tournament to see participants and details
4. **Register**: Click "Register for Tournament" on pending tournaments
5. **Draft Phase**: Select your cryptocurrencies when the tournament enters draft phase

### Key Features

- **Real-time Updates**: Game pages refresh automatically when players join
- **Portfolio Tracking**: View all submitted portfolios and player statistics
- **Tournament Brackets**: Pre-seeded tournaments show realistic competition scenarios

## Development Setup

### Prerequisites

- Docker and Docker Compose
- Git

### Running the Application

1. **Clone the repository**

   ```bash
   git clone https://github.com/adetyaz/coindrafts-linera.git
   cd coindrafts-linera
   ```

2. **Start with Docker Compose**

   ```bash
   docker compose up --force-recreate
   ```

3. **Wait for backend build and deployment** ⏱️

   - **Build phase**: Compiles Rust applications (~3-5 minutes)
   - **Deploy phase**: Deploys to Linera network, generates unique application IDs (~2-3 minutes)
   - **Startup phase**: Configures frontend with application IDs (~1 minute)
   - Frontend will be available at http://localhost:5173
   - Backend GraphQL at http://localhost:8080

   **Note**: Each user gets unique application IDs - deployments cannot be shared between developers.

## Port Configuration

The application uses the following ports (as required by Linera buildathon template):

- `5173`: SvelteKit frontend
- `8080`: Linera faucet and GraphQL service
- `9001`: Localnet validator proxy
- `13001`: Localnet validator

## Application Features

### Available Operations

**Games (CoinDrafts Core)**

- Create games with different modes (QuickMatch, TraditionalLeague, PricePrediction)
- Register players
- Submit cryptocurrency portfolios
- View game results and player statistics

**Tournaments (Traditional Leagues)**

- Create tournaments with entry fees and prize pools
- Multiple tournament formats (SingleElimination, DoubleElimination, RoundRobin, Swiss)
- Register for tournaments
- View tournament brackets and results

### GraphQL Schema

The application exposes comprehensive GraphQL APIs for both applications:

- Query games, tournaments, players, and portfolios
- Mutations for creating games/tournaments and managing participation
- Real-time updates via Linera's reactive architecture

## Project Structure

```
├── backend/
│   ├── applications/
│   │   ├── coindrafts-core/     # Main game logic
│   │   └── traditional-leagues/ # Tournament management
├── frontend/                    # SvelteKit application
├── Dockerfile                   # Container configuration
├── compose.yaml                 # Docker Compose setup
└── run.bash                     # Application startup script
```

## Health Check

The application includes health checks that verify the frontend is accessible at `localhost:5173`.

## Technology Stack

- **Blockchain**: Linera Protocol v0.15.3
- **Backend**: Rust with GraphQL
- **Frontend**: SvelteKit + Apollo GraphQL Client
- **Styling**: TailwindCSS
- **Deployment**: Docker + Docker Compose

## Development Process

This project uses Linera's microchain architecture requiring local deployment:

### Backend Build & Deployment

1. **Rust Compilation**: Backend applications are built from source (~5 minutes)
2. **Linera Network**: Local network initialized with validator and faucet
3. **Application Deployment**: Each application gets a unique ID per developer
4. **Environment Configuration**: Frontend configured with generated application IDs

### Development Workflow

- **First time**: Full build and deployment process (~10 minutes)
- **Subsequent runs**: Applications already deployed, fast startup (~1 minute)
- **Hot reloading**: Frontend supports live development
- **Reset option**: `rm frontend/.env` forces full redeployment

### Alternative Development Setup

For faster native development (no Docker):

```bash
# See DEVELOPMENT.md for detailed setup instructions
./dev-setup.sh with-frontend
```

## License

MIT License - see LICENSE file for details.
