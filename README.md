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

### Data Flow (Backend → Frontend)

**GraphQL Communication:**

1. **Linera Service** exposes GraphQL endpoints on port 8081
2. **Frontend Apollo Client** connects to chain-specific application endpoints
3. **Admin Chain Usage** - Frontend uses admin chain ID for reliable blob access and GraphQL queries
4. **Dual Application Setup**:
   - `http://localhost:8081/chains/{ADMIN_CHAIN_ID}/applications/{CORE_APP_ID}` - Game data
   - `http://localhost:8081/chains/{ADMIN_CHAIN_ID}/applications/{LEAGUES_APP_ID}` - Tournament data

**Environment Configuration:**

- Backend deployment generates unique application IDs and chain IDs
- `run.bash` script writes these values to `frontend/.env`
- Frontend reads environment variables to construct proper GraphQL endpoints
- Admin chain ensures consistent data access without blob synchronization issues

**Real-time Updates:**

- Linera's reactive architecture automatically updates GraphQL subscriptions
- Frontend polls for game/tournament state changes
- Mutations happen on default chain (where wallet has permissions)
- Queries happen on admin chain (for reliable data access)

## Quick Start (Docker)

```bash
# If you've been running a previous project, clean up first:
docker compose down -v

# Clone and run the complete application
docker compose up --force-recreate

# also try if the the one at the top fails to sync blob:
docker compose up --build --force-recreate

# ⏱️  First run takes 5-10 minutes to:
#    • Build Rust backend applications
#    • Deploy to local Linera network
#    • Generate unique application IDs
#    • Pre-seed tournaments and leaderboard
#    • Start frontend with proper configuration

# Access the application
# Frontend: http://localhost:5173
# GraphQL: http://localhost:8080
```

## Important Notes

- **Wallet Connection Required**: You must connect a wallet (any Ethereum address) before creating or joining games
- **Pre-seeded Data**: Both tournaments and the global leaderboard are pre-populated with sample data for immediate demonstration
  - **Why?** Real games take time to complete due to game durations (5-60 minutes), and stats only update after games finish
  - **Benefit**: You can immediately see leaderboard rankings and tournament brackets without waiting
  - **Note**: Pre-seeded stats will be replaced as real players complete actual games
- **Local Development Only**: Each developer gets unique application IDs - deployments cannot be shared
- **Blob Synchronization**: First-time startup may show blob sync warnings - this is normal. The startup script waits 30 seconds for blob propagation across the Linera network before starting services. If startup fails with blob errors, retry with `docker compose down -v && docker compose up --force-recreate`

## How to Use the App

### Quick Match Flow

**Simple 5-step process:**

1. Connect wallet (any address)
2. Create game → Set name, players, entry fee, duration
3. Join game → Pick exactly 5 cryptos
4. Admin starts game → Captures starting prices
5. Admin ends game → Calculates winners, distributes prizes (50%/30%/20%)

**📹 Video Demo:** [Quick Match Gameplay](https://www.loom.com/share/b0324c9718cf419bae58cc0801e093b3)

**Note:** Quick Match gameplay is very similar to tournaments in how it plays out - users create, join, select portfolios, and compete for prizes.

**Manual Controls:** Games are manually started/ended (MVP demo). Future: automated with Linera time triggers.

### Tournament Flow

**Traditional league format:**

1. Connect wallet
2. Admin creates tournament → Set entry fee, max participants, type
3. Players register → Submit portfolio (up to 10 cryptos)
4. Admin starts tournament → Records baseline prices
5. Admin ends tournament → Calculates returns with 100x amplification (<30min games)
6. Prizes distributed → Top 3 get 50%/30%/20%

**📹 Video Demo:** [Tournament Flow Walkthrough](https://www.loom.com/share/cdb1ecd83eb74240be9aed350aa6af76)

**User Stories:**

- User can create games
- User can join already created games
- User can consult AI for crypto selection suggestions
- User can pick their preferred portfolio
- Game auto-starts once the required number of players is complete
- End game automatically ends when duration expires

**Manual Controls:** Tournaments manually started/ended for demo. Future: automated scheduling.

### Price Prediction Flow

**Prediction-based gameplay:**

Users predict what the price of a specific cryptocurrency will be after a set duration. Players compete to see who can most accurately forecast price movements.

**📹 Video Demo:** [Price Prediction Gameplay](https://www.loom.com/share/2bba21d5ef1b46ea8221819e0812b746)

### Global Leaderboard

- **Pre-populated Rankings**: The leaderboard is pre-seeded with 15 sample players showing diverse stats
- **Real-time Updates**: Stats update automatically as players complete games
- **View Profiles**: Click on any player to see detailed statistics and achievements
- **Filter & Sort**: Use tier filters and sort by earnings, games played, or win rate

**Why Pre-seed?** Games have time-based durations (5-60 minutes), and player stats only update after game completion. Pre-seeding allows immediate demonstration of leaderboard functionality without waiting for games to finish.

### Key Features

- **Real-time Updates**: Game pages refresh automatically when players join
- **Portfolio Tracking**: View all submitted portfolios and player statistics
- **Tournament Brackets**: Pre-seeded tournaments show realistic competition scenarios
- **Dynamic Leaderboard**: Rankings update as players complete games and earn rewards

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

2. **Create `frontend/.env` file** (REQUIRED)

   Create a `frontend/.env` file with the following configuration:

   ```bash
   PUBLIC_COINDRAFTS_CORE_APP_ID=your-core-app-id-here
   PUBLIC_TRADITIONAL_LEAGUES_APP_ID=your-leagues-app-id-here
   PUBLIC_DEFAULT_CHAIN_ID=your-chain-id-here
   ```

   **CRITICAL:** Without this file, the frontend **will not work**. These values are automatically generated during Docker deployment.

   **For fresh installations:**
   - Leave the file empty or skip this step
   - Run `docker compose up --force-recreate` (step 3)
   - The deployment script will automatically generate and populate `frontend/.env` with the correct values

   **For existing deployments:**
   - The file should already exist with your application IDs
   - Do not modify these values unless redeploying the backend

3. **Start with Docker Compose**

   ```bash
   docker compose up --force-recreate
   ```

4. **Wait for backend build and deployment** ⏱️
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
