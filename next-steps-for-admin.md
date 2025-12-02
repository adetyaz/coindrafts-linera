# Next Steps: Admin Auto-Seed Feature

## Overview

Create an automatic seeding script that runs after Docker deployment to pre-populate tournaments for testing/demo purposes.

## Requirements

### 1. Seed Script (`seed-data.js`)

- **Location**: Root directory alongside `test-all-flows.js`
- **Purpose**: Act as admin to create sample tournaments automatically

### 2. Dynamic Configuration

- Read deployment IDs from `frontend/.env` file:
  - `PUBLIC_TRADITIONAL_LEAGUES_APP_ID`
  - `PUBLIC_DEFAULT_CHAIN_ID`
- Construct GraphQL endpoint dynamically: `http://localhost:8081/chains/{CHAIN_ID}/applications/{APP_ID}`

### 3. Integration with run.bash

- **Timing**: Run after GraphQL service starts and 15-second blob sync completes
- **Sequence**:
  1. Deploy apps → write IDs to `.env`
  2. Wait 15 seconds for blob sync
  3. Start GraphQL service
  4. **NEW: Run seed script** `node seed-data.js`
  5. Start frontend

### 4. Seed Data to Create

Create tournaments across all categories:

- **L1_CHAINS** - "Bitcoin vs Ethereum Championship"
- **L2_CHAINS** - "Layer 2 Scaling Wars"
- **MEME_COINS** - "Meme Madness Tournament"
- **DEFI_TOKENS** - "DeFi Dominance League"
- **ALL_CATEGORIES** - "Crypto All-Stars"

Each tournament should have:

- Realistic names
- Entry fee: 5-10 USDC
- Max participants: 8-16
- Tournament type: SINGLE_ELIMINATION
- Category assigned

### 5. Error Handling

- Wait/retry if GraphQL not ready yet
- Log success/failure for each tournament created
- Continue even if some tournaments fail
- Non-blocking - don't prevent frontend from starting

## Benefits

- **Better UX**: Users see populated app immediately
- **Testing**: QA can test join/play flows without setup
- **Demo-ready**: Always has content to show

## Implementation Notes

- Script must be idempotent (safe to run multiple times)
- Use same GraphQL helper functions as test-all-flows.js
- Keep it simple - just tournament creation, no complex logic
