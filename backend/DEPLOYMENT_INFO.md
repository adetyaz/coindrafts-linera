# CoinDrafts Linera Deployment Information

## Deployment History

### CoinDrafts Core Application

- **Deployment Date:** November 14, 2025 (Updated)
- **Application ID:** `291a8797a591dee08a8cad1420a740520577f88d611548ff697df2eb14ed73e8`
- **Chain ID:** `3b7dc35ad9989e5a049084fe4b0a995905ab65bd98a60e89f9b3576fb2ce125e`
- **Status:** ✅ Successfully Deployed
- **WASM Files:**
  - Contract: `target/wasm32-unknown-unknown/release/coindrafts_core_contract.wasm`
  - Service: `target/wasm32-unknown-unknown/release/coindrafts_core_service.wasm`
- **GraphQL Endpoint:** `http://localhost:8080`

### Traditional Leagues Application

- **Deployment Date:** November 14, 2025 (Updated)
- **Application ID:** `39d51c08f0cc40daabcdda83e974c3e9ddfc3656c7298161a2069a4f856ae0f2`
- **Chain ID:** `3b7dc35ad9989e5a049084fe4b0a995905ab65bd98a60e89f9b3576fb2ce125e`
- **Status:** ✅ Successfully Deployed
- **WASM Files:**
  - Contract: `target/wasm32-unknown-unknown/release/traditional_leagues_contract.wasm`
  - Service: `target/wasm32-unknown-unknown/release/traditional_leagues_service.wasm`
- **Cross-Chain Messaging:** ✅ Ready for implementation
- **GraphQL Endpoint:** `http://localhost:8080`

## Network Configuration

- **Local Linera Network:** Active
- **GraphQL Port:** 8080 (default)
- **RPC Endpoints:** localhost:13001

## Next Steps

1. Deploy Traditional Leagues application
2. Implement cross-chain messaging between applications
3. Deploy remaining game mode applications

## Important Notes

- CoinDrafts Core serves as the central orchestration hub
- All game mode applications will communicate through CoinDrafts Core
- Cross-chain messaging is required for the complete system functionality
