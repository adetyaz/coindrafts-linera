# CoinDrafts - Linera Buildathon Submission

A decentralized cryptocurrency portfolio gaming platform built on Linera Protocol v0.15.5.

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

# Access the application
# Frontend: http://localhost:5173
# GraphQL: http://localhost:8080
```

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

3. **Wait for deployment**
   - The container will build and deploy both Linera applications
   - Frontend will be available at http://localhost:5173
   - Backend GraphQL at http://localhost:8080

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

- **Blockchain**: Linera Protocol v0.15.5
- **Backend**: Rust with GraphQL
- **Frontend**: SvelteKit + Apollo GraphQL Client
- **Styling**: TailwindCSS
- **Deployment**: Docker + Docker Compose

## Contributing

This is a buildathon submission. For development:

1. Applications are automatically deployed on container start
2. Frontend supports hot reloading during development
3. GraphQL endpoints are dynamically configured based on deployed application IDs

## License

MIT License - see LICENSE file for details.
