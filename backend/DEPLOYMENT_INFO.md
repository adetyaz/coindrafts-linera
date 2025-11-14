# CoinDrafts Linera Deployment Information

## Deployment History

### CoinDrafts Core Application

- **Deployment Date:** November 14, 2025 (Updated)
- **Application ID:** `c59acaa0b0fb2cb0adc02ecb77767d368cf36c33fb1f1ffa74bb8755735a349f`
- **Chain ID:** `5458ff78b91cf0522b84f76a49baffaf69656be042eafc19365c3f7157a7b5d0`
- **Status:** ✅ Successfully Deployed
- **WASM Files:**
  - Contract: `target/wasm32-unknown-unknown/release/coindrafts_core_contract.wasm`
  - Service: `target/wasm32-unknown-unknown/release/coindrafts_core_service.wasm`
- **GraphQL Endpoint:** `http://localhost:8080`

### Traditional Leagues Application

- **Deployment Date:** November 14, 2025 (Updated)
- **Application ID:** `2cdcd8ada23c84bad4d71145ed855e33931be4f81d16c27d764ceee54bd23fd4`
- **Chain ID:** `5458ff78b91cf0522b84f76a49baffaf69656be042eafc19365c3f7157a7b5d0`
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
