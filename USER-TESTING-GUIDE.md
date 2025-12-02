# CoinDrafts User Testing Guide

**Complete User Flows Based on Actual Implementation**

---

## 🚀 **Quick Start**

1. **Start Docker**: `docker compose up --build --force-recreate`
2. **Wait for deployment** (~10 minutes first time)
3. **Access App**: http://localhost:5173
4. **GraphQL Endpoint**: http://localhost:8081

---

## 📋 **USER FLOW 1: Browse and Explore (No Wallet Required)**

### **Homepage Tour**

1. Visit http://localhost:5173
2. **See**:
   - Hero section with "CoinDrafts" gradient logo
   - Stats: $2.5M+ volume, 15K+ players, 500+ tournaments
   - Featured tournaments (up to 4 displayed)
   - Three game modes: Quick Match, Traditional Leagues, Price Prediction (coming soon)

### **Navigate to Tournaments**

1. Click "Browse Tournaments" button OR "View All Tournaments →" link
2. **On Tournaments Page** (`/tournaments`):
   - Filter by category: ALL, L1_CHAINS, L2_CHAINS, MEME_COINS, DEFI_TOKENS
   - See tournament cards with:
     - Entry fee (USDC)
     - Players (current/max)
     - Status (Registration/InProgress/Completed)
     - Category badge
     - Fill rate progress bar
   - Search tournaments by name

### **View Tournament Details**

1. Click any tournament card
2. **On Tournament Detail Page** (`/tournaments/[tournamentId]`):
   - Tournament name, status icon
   - Type (Single Elimination, etc.)
   - Entry fee, max participants, current round
   - Participants list (player accounts)
   - Results (if completed - shows top 3 winners)
   - "Join Tournament" button

### **Check Quick Match**

1. Click "Quick Match" in nav OR homepage "Quick Match" button
2. **On Quick Match Page** (`/quick-match`):
   - 24-hour fast games
   - Lower entry fees
   - Simplified 5-crypto portfolios
   - Active games list
   - "Create Game" button

**✅ EXPECTED: All pages load, data displays, navigation works**

---

## 📋 **USER FLOW 2: Create a Tournament (Backend Testing)**

### **Manual Tournament Creation**

1. Go to `/tournaments`
2. Click "Create Tournament" button
3. **Fill form**:
   - Name: "My Test Tournament"
   - Entry Fee: 10 USDC
   - Max Players: 16
   - Type: SINGLE_ELIMINATION
   - Category: L1_CHAINS
4. Click "Create Tournament"

### **What Happens**

- GraphQL mutation sent to backend
- Backend schedules `CreateTournament` operation
- Returns: "Tournament creation scheduled"
- Wait 2-3 seconds
- Refresh page
- **See**: New tournament appears in list with auto-generated ID like `trad-league-5`

**✅ EXPECTED: Tournament created successfully, appears in list with Registration status**

---

## 📋 **USER FLOW 3: Join a Tournament**

### **Prerequisites**

- Tournament must be in "Registration" status
- Have a player account (any string works for testing)

### **Steps**

1. Go to tournament detail page
2. Click "Join Tournament" button
3. **What Happens**:
   - GraphQL `registerForTournament` mutation sent
   - Uses tournamentId and playerAccount
   - Backend adds player to participants list
   - Returns: "Registration scheduled for tournament {id}"
4. Refresh page after 2 seconds
5. **See**: Player appears in Participants list

**✅ EXPECTED: Player successfully registered, shows in participants**

---

## 📋 **USER FLOW 4: Submit Portfolio (Draft Picks)**

### **Prerequisites**

- Must be registered for tournament
- Tournament has category set (determines available cryptos)

### **Steps**

1. From tournament detail, click "Draft Portfolio" button
2. **On Draft Page** (`/tournaments/[tournamentId]/draft`):

   - See 5 position slots (Position 1 = 5x weight → Position 5 = 1x weight)
   - Available cryptos based on category:
     - **L1_CHAINS**: Bitcoin, Ethereum, Solana, Cardano, Polkadot, etc.
     - **L2_CHAINS**: Arbitrum, Optimism, Polygon, Base, zkSync, etc.
     - **MEME_COINS**: Dogecoin, Shiba Inu, Pepe, Bonk, Floki, etc.
     - **DEFI_TOKENS**: Uniswap, Aave, Maker, Compound, Curve, etc.
     - **ALL**: All available cryptos
   - Live prices fetched from **CoinCap API** (real data!)
   - 24hr price change percentages

3. **Draft Your Portfolio**:

   - **Position 1** (5x weight): Select your HIGHEST confidence pick (e.g., Bitcoin)
   - **Position 2** (4x weight): Second choice (e.g., Ethereum)
   - **Position 3** (3x weight): Third choice (e.g., Solana)
   - **Position 4** (2x weight): Fourth choice (e.g., Cardano)
   - **Position 5** (1x weight): Fifth choice (e.g., Polkadot)

4. **Submit Portfolio**:
   - All 5 positions must be filled
   - Optional: Add strategy notes
   - Click "Submit Portfolio"
   - GraphQL mutation: `submitPortfolio(tournamentId, round: 1, cryptoPicks: [array])`

**✅ EXPECTED: Portfolio submitted successfully, redirected to tournament page**

---

## 📋 **USER FLOW 5: View Real-Time Prices**

### **Live Price Data (CoinCap Integration)**

1. On draft page, observe:

   - Current USD prices (fetched live)
   - 24hr change % (green = up, red = down)
   - Market cap, volume
   - Price updates every 30 seconds

2. **Test Price Service**:
   ```bash
   node test-coincap-api.js
   ```
   - Tests all CoinCap endpoints
   - Verifies API key works
   - Shows historical data
   - Simulates 24-hour game scenario

**✅ EXPECTED: Real prices from CoinCap API displayed, updates work**

---

## 📋 **USER FLOW 6: Quick Match Game**

### **Create Quick Match**

1. Go to `/quick-match`
2. Click "Create New Game"
3. **Configure**:
   - Select up to 5 cryptos
   - Entry fee: $1-$100
   - Max players: 5-20
4. Click "Create Game"
5. **Backend** creates game with mode: QUICK_MATCH

### **Join Quick Match**

1. See active games list
2. Click "Join Game" on any Active game
3. System registers player
4. Game starts when full or time expires

**✅ EXPECTED: Quick match created, players can join**

---

## 📋 **USER FLOW 7: Filter and Search**

### **Category Filtering**

1. On `/tournaments` page
2. Click category tabs:
   - **ALL_CATEGORIES**: Shows everything
   - **L1_CHAINS**: Only L1 blockchain tournaments
   - **L2_CHAINS**: Only Layer 2 tournaments
   - **MEME_COINS**: Only meme coin tournaments
   - **DEFI_TOKENS**: Only DeFi token tournaments

### **Status Filtering**

1. Click status filter dropdown
2. Select:
   - Registration
   - InProgress
   - Completed
   - Cancelled

### **Search**

1. Type tournament name in search box
2. Results filter in real-time

**✅ EXPECTED: Filters work instantly, tournaments filtered correctly**

---

## 📋 **USER FLOW 8: View Tournament Participants**

1. Open any tournament detail page
2. Scroll to "Participants" section
3. **See**:
   - List of player accounts (e.g., chain IDs)
   - Number of participants vs max
   - Empty state if no participants yet

**✅ EXPECTED: Participants list shows registered players**

---

## 📋 **USER FLOW 9: View Tournament Results**

### **Prerequisites**

- Tournament must be in "Completed" status
- Winners must be calculated (backend operation)

### **Steps**

1. Go to completed tournament detail
2. **See Results Section**:
   - 🥇 1st Place: Gold medal
   - 🥈 2nd Place: Silver medal
   - 🥉 3rd Place: Bronze medal
   - Player account IDs
   - Final scores/rankings

**✅ EXPECTED: Winners displayed with medals and positions**

---

## 📋 **USER FLOW 10: Check Profile**

1. Click user icon in navigation
2. Go to `/profile`
3. **See**:
   - Active tournaments you're in
   - Active games you're playing
   - Tournament history
   - Game statistics
   - Wallet connection status

**✅ EXPECTED: Profile shows your activity**

---

## 🧪 **TESTING SCENARIOS**

### **Scenario A: End-to-End Tournament**

1. Create tournament (L1_CHAINS, 10 USDC, 16 players)
2. Register 3 players with different accounts
3. Each player submits portfolio (different crypto picks)
4. Admin starts tournament (requires backend mutation)
5. Simulate price changes
6. Admin ends tournament with price snapshots
7. Backend calculates winners using scoring engine
8. View results showing top 3

### **Scenario B: Quick Match Flow**

1. Create quick match ($5 entry, 10 players max)
2. Register 5 players
3. Each submits 5-crypto portfolio
4. Game auto-starts after 24 hours
5. Winners determined by % gains
6. Results displayed

### **Scenario C: Category Testing**

1. Create tournaments in each category:
   - L1: Bitcoin, Ethereum, Solana, Cardano, Polkadot
   - L2: Arbitrum, Optimism, Polygon, Base, zkSync
   - MEME: Dogecoin, Shiba Inu, Pepe, Bonk, Floki
   - DEFI: Uniswap, Aave, Maker, Compound, Curve
2. Verify available cryptos match category
3. Submit portfolios in each
4. Confirm filtering works

### **Scenario D: Price Data Validation**

1. Open draft page
2. Note BTC price
3. Check against CoinCap.io manually
4. Verify prices match
5. Wait 30 seconds
6. Confirm prices update
7. Check 24hr change % accuracy

---

## 🐛 **KNOWN ISSUES TO TEST**

### **Backend Timing Issues**

- ⚠️ Operations are scheduled (async), not immediate
- **Test**: Create tournament → wait 2-3 seconds → refresh to see it
- **Test**: Submit portfolio → wait 2 seconds → check if stored

### **GraphQL Mutation Responses**

- Backend returns strings like "Tournament creation scheduled"
- Not returning actual IDs immediately
- **Test**: Check if operations complete successfully even with delayed IDs

### **Price Updates**

- First load might be slower (API rate limits)
- **Test**: Refresh draft page multiple times, verify prices load

---

## 📊 **DATA TO VERIFY**

### **Tournament Data**

- ID format: `trad-league-{number}`
- Status transitions: Registration → InProgress → Completed
- Category matches created value
- Entry fee stored as u64
- Participants array updates correctly

### **Portfolio Data**

- 5 crypto picks stored in order
- Position weights: [5.0, 4.0, 3.0, 2.0, 1.0]
- Strategy notes (optional)
- Stored per player per round

### **Price Data**

- Real USD prices from CoinCap
- 24hr change percentages
- Market cap values
- Volume data

---

## 🔧 **DEVELOPER TESTING TOOLS**

### **GraphQL Playground**

1. Visit http://localhost:8081/
2. Use GraphiQL interface
3. **Test Queries**:

   ```graphql
   query {
     tournaments {
       id
       name
       category
       status
       entryFeeUsdc
       currentParticipants
       maxParticipants
     }
   }
   ```

4. **Test Mutations**:
   ```graphql
   mutation {
     createTournament(
       name: "Test Tournament"
       entryFeeUsdc: "10"
       maxParticipants: 16
       tournamentType: SINGLE_ELIMINATION
       category: "L1_CHAINS"
     )
   }
   ```

### **Test Script**

```bash
cd /d/dev-projects/coindrafts-lin
node test-all-flows.js
```

- Runs 10 automated test flows
- Verifies GraphQL endpoints
- Tests CRUD operations
- Validates filtering

### **CoinCap API Test**

```bash
node test-coincap-api.js
```

- Tests price fetching
- Verifies API key
- Shows historical data
- Simulates game scenarios

---

## ✅ **SUCCESS CRITERIA**

### **Phase 1: Foundation**

- ✅ All pages load without errors
- ✅ Navigation works between pages
- ✅ Tournaments display with correct data
- ✅ Filtering by category works
- ✅ Search functionality works
- ✅ Real prices from CoinCap display

### **Phase 2: Core Gameplay**

- ✅ Can create tournaments
- ✅ Can join tournaments
- ✅ Can submit portfolios with 5 picks
- ✅ Position weights apply correctly
- ✅ Participants list updates
- ✅ Results show winners

### **Phase 3: Data Accuracy**

- ✅ Prices match CoinCap.io
- ✅ 24hr changes accurate
- ✅ Category cryptos correct
- ✅ Tournament status updates
- ✅ Player registration persists

---

## 🎯 **TESTING PRIORITY ORDER**

1. **HIGH PRIORITY** (Must Work):

   - Homepage loads
   - Tournament list displays
   - Category filtering
   - Tournament creation
   - Player registration
   - Portfolio submission

2. **MEDIUM PRIORITY** (Should Work):

   - Real-time prices
   - Search functionality
   - Tournament details
   - Participants display
   - Quick match creation

3. **LOW PRIORITY** (Nice to Have):
   - Results display
   - Profile page
   - Game history
   - Leaderboards

---

## 📝 **REPORTING BUGS**

When you find issues, note:

1. **Page**: Which route (`/tournaments`, `/quick-match`, etc.)
2. **Action**: What you clicked/did
3. **Expected**: What should happen
4. **Actual**: What actually happened
5. **Console**: Check browser console for errors (F12)
6. **Network**: Check GraphQL requests in Network tab

**Example Bug Report**:

```
Page: /tournaments/trad-league-1/draft
Action: Clicked "Submit Portfolio" with 5 cryptos selected
Expected: Success message and redirect to tournament page
Actual: HTTP 500 error
Console: "GraphQL error: submitPortfolio mutation failed"
Network: POST to http://localhost:8081 returned 500
```

---

**START TESTING HERE**: Go to http://localhost:5173 and follow Flow 1! 🚀
