# CoinDrafts Development Guide

## Quick Start Options

### Option 1: Docker (Recommended for first-time setup)

```bash
# Start everything with Docker Compose
docker-compose up --build

# Access the application
# Frontend: http://localhost:5173
# GraphQL: http://localhost:8080
```

### Option 2: Native Development

```bash
# Backend + Frontend together
./dev-setup.sh with-frontend

# Or backend only, then frontend separately
./dev-setup.sh
cd frontend && npm run dev
```

## How It Works

### First Time Setup

1. **Automatic Detection**: The script checks if `frontend/.env` exists with application IDs
2. **If missing**: Full deployment happens automatically
   - Initializes Linera network (`linera net up`)
   - Builds and deploys CoinDrafts Core application
   - Builds and deploys Traditional Leagues application
   - Creates `frontend/.env` with your unique application IDs
3. **Starts services**: Linera GraphQL service on port 8080

### Subsequent Runs

1. **Uses existing deployment**: Reads application IDs from `frontend/.env`
2. **Just starts services**: No redeployment needed
3. **Fast startup**: Only starts what's needed

## Environment Variables

The `frontend/.env` file is auto-generated and contains:

```env
PUBLIC_COINDRAFTS_CORE_APP_ID=your_unique_app_id_here
PUBLIC_TRADITIONAL_LEAGUES_APP_ID=your_unique_app_id_here
```

**Important**:

- Each developer gets unique application IDs
- Never commit the actual `.env` file
- Use `.env.example` as reference

## Development Commands

```bash
# Full setup (backend + frontend)
./dev-setup.sh with-frontend

# Backend only
./dev-setup.sh

# Reset everything (forces redeployment)
rm frontend/.env && ./dev-setup.sh

# Docker development
docker-compose up --build

# Docker cleanup
docker-compose down -v
```

## Troubleshooting

### "Application IDs not found" Error

- **Cause**: Frontend started before backend deployment
- **Fix**: Run `./dev-setup.sh` first to deploy applications

### Port Already in Use

```bash
# Kill existing Linera services
pkill -f linera-service
pkill -f linera-storage-service

# Then restart
./dev-setup.sh
```

### "Wallet not found" Error

```bash
# Reset Linera network
rm -rf ~/.config/linera
./dev-setup.sh
```

### Docker Issues

```bash
# Rebuild everything
docker-compose down -v
docker-compose up --build --force-recreate
```

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Linera GraphQL     │    │   Blockchain    │
│   (SvelteKit)   │───▶│   Service            │───▶│   Applications  │
│   Port 5173     │    │   Port 8080          │    │                 │
└─────────────────┘    └──────────────────────┘    └─────────────────┘
                                                    │ CoinDrafts Core │
                                                    │ Trad. Leagues   │
                                                    └─────────────────┘
```

## File Structure

```
coindrafts-linera/
├── dev-setup.sh              # Main development script
├── docker-compose.yml        # Docker development setup
├── Dockerfile               # Container definition
├── backend/                 # Linera applications
│   └── applications/
│       ├── coindrafts-core/
│       └── traditional-leagues/
└── frontend/                # SvelteKit web app
    ├── .env.example         # Environment template
    ├── .env                 # Auto-generated (gitignored)
    └── src/lib/coinDraftsService.ts
```

## Development Workflow

1. **Clone repo**: `git clone ...`
2. **Start development**: `./dev-setup.sh with-frontend`
3. **Make changes**: Edit frontend/backend code
4. **Test**: Both hot-reload automatically
5. **Reset if needed**: `rm frontend/.env && ./dev-setup.sh`

The system handles deployment complexity automatically while keeping development fast and simple!
