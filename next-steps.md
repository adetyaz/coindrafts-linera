# Next Steps (Priority Order)

## **1. Fix Scoring System** - CRITICAL

- **File**: `backend/applications/coindrafts-core/src/contract.rs`
- **What**:
  - Store start prices when `StartGame` is called (currently ignored)
  - Calculate portfolio returns in `EndGame` using start/end prices
  - Sort players by performance (not just first player wins)
  - Distribute prize pool: 50% / 30% / 20% to top 3
  - Update stats for all players correctly
- **Test**: Create game → submit portfolios → end game → verify winner has best returns

## **2. Store Price Snapshots** - CRITICAL

- **File**: `backend/applications/coindrafts-core/src/state.rs`
- **What**: Add `MapView<String, Vec<PriceSnapshot>>` for start_prices
- **Why**: Currently start prices aren't saved, can't calculate returns without them

## **3. Connect Frontend Prices to Backend** - HIGH

- **Current**: Frontend fetches real CoinCap prices but backend uses mock data
- **What**:
  - Update `startGame` mutations to send real prices from `priceService.getPriceSnapshot()`
  - Update `endGame` mutations to send real prices
  - Remove mock price generation from seed scripts
- **Test**: Verify backend receives real prices, not random values

## **4. Price Oracle Service** - HIGH

- **New File**: `scripts/price-oracle.js`
- **What**:
  - Fetch prices from CoinGecko API every 30 seconds
  - Update active games with current prices
  - Store price history for charts
- **Alternative**: Start with manual price updates, add automation later

## **5. Live Performance Display** - MEDIUM

- **File**: `frontend/src/routes/games/[gameId]/+page.svelte`
- **What**:
  - Show portfolio value change during active games
  - Real-time leaderboard rankings
  - Color-coded performance (green/red)

## **6. Tournament Brackets** - MEDIUM

- **New Component**: `frontend/src/lib/components/TournamentBracket.svelte`
- **What**:
  - Visual bracket for elimination tournaments
  - Show current round and matchups
  - Player advancement visualization

## **7. Pre-seed with Real Data** - LOW

- **File**: `scripts/preseed-leaderboard.js`
- **What**: Use real CoinGecko prices instead of `Math.random()`

---

## Quick Start

If you want to start immediately:

```bash
# 1. Fix the most critical bug first
# Edit: backend/applications/coindrafts-core/src/contract.rs
# - Lines 162-172: Store price_snapshot in StartGame
# - Lines 175-206: Replace EndGame with proper scoring logic

# 2. Test the fix
docker compose down -v
docker compose up --build --force-recreate

# 3. Verify winners are calculated correctly
node test-all-flows.js
```

---

## Success Metrics

After completion:

- ✅ 90%+ games complete successfully with correct winners
- ✅ Player stats update after every game (not just tournaments)
- ✅ Leaderboard shows 20+ players with real data
- ✅ Prize pools distributed based on actual entry fees
- ✅ Portfolio returns calculated with real price data
- ✅ Frontend shows live performance during games
