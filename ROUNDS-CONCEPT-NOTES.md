# Rounds Concept - For Future Implementation

## Original Design

Tournaments originally had a multi-round system where:

- Each tournament had `currentRound` and `maxRounds` fields
- Players could submit different portfolios for each round
- Portfolio storage key: `{tournamentId}-{round}-{playerAccount}`
- Tournaments would advance through rounds using `advance_round()` mutation

## Removed From Traditional Tournaments

**Date Removed:** December 14, 2025

**Reason:**
Traditional weekly tournaments need simple flow:

- Create tournament → Register players → Submit ONE portfolio → End → Winners
- No need for multiple rounds in weekly crypto competitions
- Portfolio = your picks for the entire tournament duration

## Potential Future Use Cases

This rounds concept could be valuable for:

1. **Quick Match Multi-Round Games**

   - Best of 3, Best of 5 formats
   - Different crypto picks each round
   - Advance winner to next round

2. **Tournament Formats with Elimination Rounds**

   - Bracket-style tournaments
   - Quarter-finals, Semi-finals, Finals
   - Winners advance, losers eliminated

3. **League Seasons**
   - Weekly rounds over a season
   - Points accumulate across rounds
   - End-of-season champions

## Technical Implementation Notes

- Portfolio key pattern: `{tournamentId}-{round}-{playerAccount}`
- `advance_round()` mutation increments `currentRound`
- Need to handle portfolio resubmission for new rounds
- Leaderboard calculation per round vs cumulative

## Related Files (Before Removal)

- `backend/applications/traditional-leagues/src/contract.rs` - `advance_round()` mutation
- `backend/applications/traditional-leagues/src/lib.rs` - Tournament struct with round fields
- `backend/applications/traditional-leagues/src/service.rs` - Portfolio queries with round parameter
- `frontend/src/routes/tournaments/[tournamentId]/draft/+page.svelte` - Portfolio submission with round
