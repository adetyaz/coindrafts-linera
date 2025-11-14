# CoinDrafts Linera - Development Structure & Progress

## 🎯 Project Vision

CoinDrafts on Linera: The world's first **real-time cryptocurrency fantasy gaming platform** built on Linera's revolutionary microchain architecture. Enables sub-second portfolio updates, unlimited scalability, and professional-grade AI integration impossible on traditional blockchains.

## 📊 Current Development Status

### ✅ Completed Foundation

- [x] **SimpleTodo Application**: Successfully deployed and tested
  - Application ID: `cb15f2be1bb53075b79257d79ac7e4e5cfef76b3e2db6f73ee48ede2cd192311`
  - Chain ID: `5458ff78b91cf0522b84f76a49baffaf69656be042eafc19365c3f7157a7b5d0`
  - GraphQL endpoint: Working with real-time data persistence
  - Frontend integration: Apollo Client configured with proper cache handling

### 🔄 In Progress

- [x] **Project Structure Setup**: Initialize CoinDrafts architecture
- [ ] **CoinDrafts Core Development**: Build orchestration hub application

### 📋 Next Development Phase

- [ ] **Core Application Development**: Begin CoinDrafts-specific implementations
- [ ] **Oracle Integration**: Multi-source price aggregation
- [ ] **Game Mode Implementation**: Traditional Leagues, Quick Match, Price Prediction

## 🏗️ Technical Architecture

### **Core Linera Applications (Backend)**

```
backend/applications/
├── coindrafts-core/           # Main game orchestration
├── league-manager/            # Traditional 7-day leagues
├── quick-match/              # 24-hour rapid games
├── price-prediction/         # Range prediction markets
├── price-oracle/             # Multi-source price aggregation
├── player-state/             # Personal microchains
└── reward-system/            # USDC distribution
```

### **Shared Components**

```
backend/shared/
├── types/                    # Common data structures
│   ├── portfolio.rs         # Portfolio definitions
│   ├── player.rs           # Player profiles
│   └── game.rs             # Game mechanics
└── utils/                   # Helper functions
```

### **Frontend (SvelteKit)**

```
frontend/src/
├── lib/
│   ├── components/
│   │   ├── PortfolioDrafter/    # Portfolio creation UI
│   │   ├── LeagueBoard/         # Leaderboards & rankings
│   │   ├── QuickMatch/          # 24-hour game interface
│   │   └── PricePrediction/     # Prediction markets UI
│   ├── services/
│   │   ├── lineraClient.ts      # GraphQL client (✅ Working)
│   │   ├── gameService.ts       # Game logic integration
│   │   └── graphql.ts           # GraphQL queries/mutations
│   └── stores/                  # Svelte 5 runes for state
└── routes/
    ├── leagues/                 # Traditional league pages
    ├── quick-match/             # Quick match interface
    └── predictions/             # Prediction market pages
```

## 🎮 Game Modes Architecture

### **1. Traditional Leagues (7-Day)**

- **Duration**: Monday to Monday
- **Portfolio**: 5 cryptocurrencies
- **Entry Fee**: $1 USDC
- **Features**: Full strategy depth, AI assistance, all multipliers
- **Chain Type**: Temporary league microchains with auto-expiry

### **2. Quick Match (24-Hour)**

- **Duration**: 24 hours
- **Portfolio**: 3 cryptocurrencies (simplified)
- **Entry Fee**: $0.50 USDC
- **Features**: Simplified strategies, boost cards, spectator mode
- **Chain Type**: Ultra-fast temporary chains

### **3. Price Range Prediction**

- **Duration**: 7-day prediction windows
- **Challenge**: Predict exact price ranges
- **Entry Fee**: $1 USDC + dynamic multipliers
- **Features**: Multi-source validation, AI-powered suggestions
- **Chain Type**: Sophisticated prediction market chains

## 🧠 Strategy Systems

### **Phase 1 MVP Features**

1. **Risk Multipliers** (Max 5% boost)
   - Volatility-based scoring
   - Real-time calculations on Oracle chains
2. **AI Confidence Score** (TensorFlow.js)
   - Client-side ML processing
   - Bonus point system: High confidence = +5% max
3. **Team Synergy** (Sector bonuses)
   - DeFi, Gaming, Infrastructure, Meme, Privacy, Layer 1
   - 2+ same sector: +1-3% portfolio bonus
4. **Diversification Rules**
   - Portfolio health scoring
   - 90-100% health: +2% total bonus

### **Phase 2 Advanced Features**

1. **Conviction Picks**: 3x multipliers across 3 leagues
2. **Double-Down**: USDC staking for 2x weight
3. **Trade-Off Cards**: Pivot/Shield/Boost mid-game

## 🔗 Cross-Chain Architecture

### **Personal Player Chains**

- **Unlimited**: Each player owns their microchain
- **Zero-cost reads**: Free portfolio tracking
- **AI Learning**: Personal preference adaptation
- **Achievement System**: Dynamic badge progression
- **Social Features**: Friend connections, reputation

### **Oracle Network**

- **Multi-Source Aggregation**: CoinGecko, Binance, Coinbase, Kraken, Chainlink
- **Sentiment Analysis**: News, social media, Fear & Greed index
- **AI Models**: Technical indicators, fundamental analysis
- **Real-time Updates**: 30-second price broadcasts

### **Merchant Integration**

- **E-commerce**: Shopify integration
- **Customer Rewards**: NFT incentives, loyalty programs
- **Branded Leagues**: Merchant-sponsored tournaments
- **Analytics**: ROI tracking, customer acquisition

## 📈 Development Roadmap

### **Phase 1: Foundation** (Current)

- [x] Linera environment setup
- [x] SimpleTodo deployment & testing
- [x] Frontend GraphQL integration
- [x] Project structure initialization
- [ ] **CoinDrafts Core - The Orchestration Hub**: Minimal MVP
  - [ ] Basic game state management
  - [ ] Player registration system
  - [ ] Simple portfolio submission
  - [ ] GraphQL service interface
  - [ ] Frontend integration testing

### **Phase 2: Core Features**

- [ ] Cross-chain messaging implementation
- [ ] Basic oracle integration (CoinGecko)
- [ ] Player registration system
- [ ] Simple portfolio management
- [ ] USDC integration setup

### **Phase 3: Game Modes**

- [ ] Traditional Leagues implementation
- [ ] Quick Match development
- [ ] Price Range Prediction markets
- [ ] Real-time scoring system

### **Phase 4: Advanced Features**

- [ ] Strategy systems (Risk, AI, Synergy, Diversification)
- [ ] Social features & achievements
- [ ] Advanced AI integration
- [ ] Merchant platform

### **Phase 5: Scaling & Polish**

- [ ] Performance optimization
- [ ] Advanced strategy features
- [ ] UI/UX refinements
- [ ] Community features

## 🔧 Technical Implementation Notes

### **CoinDrafts Core - The Orchestration Hub**

> **Core Principle**: This is the central coordination layer that manages all game instances, player interactions, and cross-chain messaging. Nothing is pulled out of thin air - every feature serves the core orchestration purpose.

**Minimal MVP Scope**:

1. **Game Management**: Create and track Traditional League games
2. **Player System**: Registration, profiles, entry fee handling
3. **Portfolio Handling**: Accept 5-crypto portfolio submissions
4. **GraphQL Interface**: Frontend communication layer
5. **State Tracking**: Basic game status and participant management

### **Current Working Setup**

- **Linera Version**: v0.15.3
- **Network**: Local development chain
- **GraphQL**: Apollo Client with proper error handling
- **Database**: Blockchain-native state management
- **Frontend**: SvelteKit with TypeScript

### **Key Learnings from SimpleTodo**

1. **Instantiation Arguments**: Use `"null"` not `"{}"` for unit types
2. **GraphQL Endpoints**: Application-specific URLs, not `/graphql`
3. **Schema Naming**: camelCase in GraphQL (addTodo, createdAt)
4. **Apollo Cache**: Non-standard mutation responses need special handling
5. **Error Handling**: `errorPolicy: 'all'` for Linera's response format

### **Critical Architecture Decisions**

1. **Microchain Strategy**: Personal chains for sovereignty, temporary for games
2. **Real-time Updates**: 30-second oracle broadcasts via cross-chain messaging
3. **Economic Model**: USDC-based for stability, max 5% strategy boosts
4. **AI Integration**: Client-side TensorFlow.js + server-side analysis
5. **Scalability**: Unlimited parallel leagues through microchain architecture

## 📚 Documentation & Resources

### **Project Documentation**

- **Main Docs**: [CoinDrafts Linera Docs](https://coindrafts-linera.netlify.app)
- **Repository**: [GitHub - coindrafts-linera](https://github.com/adetyaz/coindrafts-linera)

### **Linera Resources**

- **Protocol Docs**: [Linera Developer Guide](https://linera.dev/developers/getting_started.html)
- **Examples**: [Official Examples](https://github.com/linera-io/linera-protocol/tree/testnet_conway/examples)
- **SDK Reference**: Rust SDK documentation

### **Technical References**

- **GraphQL**: Apollo Client documentation
- **AI Integration**: TensorFlow.js guides
- **Cryptocurrency APIs**: CoinGecko, Binance API docs

## 🎯 Success Metrics

### **Technical Milestones**

- [ ] **Sub-second Updates**: Personal chain portfolio tracking
- [ ] **Unlimited Scalability**: Parallel league deployment
- [ ] **Real-time Leaderboards**: 30-second refresh cycles
- [ ] **Professional AI**: Market analysis integration
- [ ] **Cross-chain Messaging**: Seamless chain coordination

### **Business Objectives**

- [ ] **User Experience**: Intuitive gameplay despite complexity
- [ ] **Fair Competition**: Skill-based rewards, balanced strategies
- [ ] **Market Adoption**: First-mover advantage in real-time crypto gaming
- [ ] **Ecosystem Growth**: Merchant integration, community features
- [ ] **Technical Showcase**: Demonstrate Linera's revolutionary capabilities

## 🚀 Vision Statement

> "CoinDrafts on Linera will be the flagship application demonstrating why microchain architecture represents the future of Web3 gaming. By combining personal data sovereignty, real-time performance, unlimited scalability, and professional-grade AI, we're not just building a game - we're creating a new category of blockchain applications."

---

**Last Updated**: November 13, 2025  
**Current Focus**: Foundation phase completion and core architecture setup  
**Next Milestone**: Initialize full project structure and begin core application development
