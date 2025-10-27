---
sidebar_position: 1
---

# Linera Architecture Overview

Understanding Linera's revolutionary microchain architecture is essential for building CoinDrafts applications. This section explains how Linera's unique features enable unprecedented capabilities in crypto gaming.

## Complete CoinDrafts-Linera Ecosystem

```mermaid
graph TB
    subgraph "Linera Protocol Foundation"
        subgraph "Personal Sovereignty Layer"
            PC1[Player Chain #1<br/>💎 Personal Portfolio<br/>📊 Performance History<br/>🤖 AI Preferences]
            PC2[Player Chain #2<br/>💎 Social Connections<br/>🏅 Achievement Collection<br/>🌐 Cross-Chain Reputation]
            PCN[Player Chain #N<br/>💎 Complete Data Ownership<br/>⚡ Zero-Cost Reads<br/>🔄 Real-Time Updates]
        end

        subgraph "Game Mode Microchains"
            TL[Traditional League Chain<br/>⏰ 7-Day Competition<br/>🏆 5 Cryptocurrency Portfolio<br/>💰 $1 POL Entry Fee<br/>📈 Real-Time Rankings]
            QM[Quick Match Chain<br/>⚡ 24-Hour Lightning Round<br/>🎯 3 Cryptocurrency Portfolio<br/>💸 $0.50 POL Entry Fee<br/>🏃 Speed Bonuses]
            PM[Prediction Market Chain<br/>🎲 Price Range Betting<br/>🔮 Multi-Oracle Validation<br/>📊 Exponential Rewards<br/>🎯 Skill-Based Gaming]
        end

        subgraph "Oracle Infrastructure"
            PO[Price Oracle Chain<br/>📈 Multi-Source Price Feeds<br/>🔄 30-Second Updates<br/>📊 CoinGecko + Binance + Coinbase<br/>⚖️ Consensus Algorithm]
            AI[AI Analysis Chain<br/>🧠 Professional ML Models<br/>🔮 Strategy Recommendations<br/>📈 Technical Analysis<br/>💡 Market Insights]
            SE[Sentiment Engine Chain<br/>📰 News Analysis<br/>💬 Social Media Sentiment<br/>😱 Fear & Greed Index<br/>🎭 Market Psychology]
        end

        subgraph "Commerce & Social Infrastructure"
            MC[Merchant Chain<br/>🛒 Shopify Integration<br/>🎁 Customer Reward Programs<br/>🏪 Branded League Hosting<br/>📊 Sales Analytics]
            ES[Event Stream Network<br/>📡 Global Social Feed<br/>🎉 Achievement Broadcasts<br/>🏆 Victory Announcements<br/>💬 Community Interactions]
            AC[Achievement System Chain<br/>🏅 Dynamic NFT Badges<br/>⭐ Cross-Application Reputation<br/>🎖️ Social Verification<br/>🔓 Feature Unlocks]
        end
    end

    subgraph "Cross-Chain Communication Hub"
        CCM[Asynchronous Message Passing<br/>⚡ Sub-500ms Latency<br/>🔄 Real-Time Synchronization<br/>📨 Event Broadcasting<br/>🌐 Global State Consistency]
    end

    subgraph "External Data Sources"
        API1[CoinGecko API<br/>💰 Cryptocurrency Prices<br/>📊 Market Cap Data<br/>📈 Historical Charts]
        API2[News Data APIs<br/>📰 Market News Analysis<br/>🔥 Breaking News Alerts<br/>📝 Sentiment Classification]
        API3[Social Media APIs<br/>💬 Twitter Sentiment<br/>📱 Reddit Discussions<br/>🌐 Community Signals]
        SHOP[Shopify Platform<br/>🛍️ E-commerce Integration<br/>💳 Payment Processing<br/>📦 Order Management]
        DEFI[DeFi Protocols<br/>💱 DEX Price Feeds<br/>📊 Liquidity Data<br/>⚡ Flash Loan Integration]
    end

    %% Personal Chain to Game Mode Connections
    PC1 -.->|Portfolio Submission<br/>💼 Strategy Selection| TL
    PC2 -.->|Quick Participation<br/>⚡ Rapid Decisions| QM
    PCN -.->|Price Predictions<br/>🎯 Market Analysis| PM

    %% Oracle Data Distribution
    PO -->|Real-Time Price Updates<br/>📈 Market Movements| TL
    PO -->|Lightning Price Feeds<br/>⚡ 30-Second Updates| QM
    PO -->|Multi-Source Validation<br/>⚖️ Consensus Pricing| PM

    AI -->|Personalized Suggestions<br/>🎯 Custom Strategies| PC1
    AI -->|Quick Match Insights<br/>⚡ Rapid Analysis| PC2
    AI -->|Prediction Models<br/>🔮 ML Forecasting| PCN

    SE -->|Market Sentiment<br/>📊 Emotional Analysis| AI
    SE -->|Prediction Context<br/>🎭 Market Psychology| PM
    SE -->|Social Signals<br/>💬 Community Mood| ES

    %% Cross-Chain Message Flow
    TL -.->|Performance Updates<br/>📊 Portfolio Changes| CCM
    QM -.->|Ranking Changes<br/>🏆 Leaderboard Shifts| CCM
    PM -.->|Settlement Results<br/>💰 Prize Distribution| CCM

    CCM -.->|Personal Analytics<br/>📈 Individual Metrics| PC1
    CCM -.->|Achievement Triggers<br/>🏅 Badge Unlocks| AC
    CCM -.->|Social Events<br/>🎉 Community Updates| ES

    %% External API Integration (Linera Native HTTP)
    API1 -->|HTTP Oracle Queries<br/>🌐 Direct API Access| PO
    API2 -->|Sentiment Data Feeds<br/>📰 Real-Time News| SE
    API3 -->|Social Media Streams<br/>💬 Community Data| SE
    SHOP <-->|Commerce Integration<br/>🛒 Bidirectional Sync| MC
    DEFI -->|DeFi Price Feeds<br/>💱 Decentralized Data| PO

    %% Social & Achievement Ecosystem
    AC -->|Badge Distribution<br/>🏅 Achievement Rewards| PC1
    AC -->|Reputation Updates<br/>⭐ Cross-Chain Score| PC2
    AC -->|Feature Unlocks<br/>🔓 Premium Access| PCN

    ES -->|Community Feed<br/>📡 Social Streams| PC1
    ES -->|Victory Celebrations<br/>🎉 Win Announcements| PC2
    ES -->|Achievement Shares<br/>🏆 Success Stories| PCN

    MC -->|Customer Rewards<br/>🎁 Purchase Incentives| AC
    MC -->|Branded Leagues<br/>🏪 Merchant Competitions| TL
    MC -->|Commerce Analytics<br/>📊 Sales Intelligence| ES

    %% Styling for Visual Hierarchy
    style PC1 fill:#ff6b6b,stroke:#c0392b,stroke-width:3px,color:#fff
    style PC2 fill:#ff6b6b,stroke:#c0392b,stroke-width:3px,color:#fff
    style PCN fill:#ff6b6b,stroke:#c0392b,stroke-width:3px,color:#fff

    style TL fill:#4ecdc4,stroke:#16a085,stroke-width:2px,color:#fff
    style QM fill:#45b7d1,stroke:#2980b9,stroke-width:2px,color:#fff
    style PM fill:#96ceb4,stroke:#27ae60,stroke-width:2px,color:#fff

    style PO fill:#ffeaa7,stroke:#f39c12,stroke-width:2px,color:#000
    style AI fill:#dda0dd,stroke:#8e44ad,stroke-width:2px,color:#fff
    style SE fill:#fab1a0,stroke:#e17055,stroke-width:2px,color:#fff

    style MC fill:#fdcb6e,stroke:#e17055,stroke-width:2px,color:#000
    style ES fill:#a8e6cf,stroke:#00b894,stroke-width:2px,color:#000
    style AC fill:#fd79a8,stroke:#e84393,stroke-width:2px,color:#fff

    style CCM fill:#00cec9,stroke:#00b894,stroke-width:4px,color:#fff
```

## Core Concepts

### Microchains: Individual Player Blockchains

In traditional blockchains, all users share a single chain. Linera introduces **microchains** - individual blockchains for specific purposes:

```mermaid
graph TD
    A[Traditional Blockchain] --> B[Single Chain for All Users]
    B --> C[Shared State & Congestion]

    D[Linera Protocol] --> E[Multiple Microchains]
    E --> F[Player Chain 1]
    E --> G[Player Chain 2]
    E --> H[League Chain]
    E --> I[Oracle Chain]
    F --> J[Personal Portfolio Data]
    G --> K[Personal Achievement History]
    H --> L[League-Specific State]
    I --> M[Price & Market Data]
```

### Chain Ownership Models

Linera supports three ownership models perfectly suited for CoinDrafts:

#### Single-Owner Chains (Player Chains)

```rust
// Each player owns their personal microchain
struct PlayerChain {
    owner: AccountOwner,
    portfolio_history: LogView<Portfolio>,
    achievements: MapView<BadgeType, Achievement>,
    ai_preferences: RegisterView<AISettings>,
    social_connections: MapView<Address, FriendStatus>,
}
```

**Benefits for CoinDrafts:**

- **Complete data sovereignty** - players own their game history
- **Zero gas fees** for reading portfolio performance
- **Real-time updates** without network congestion
- **Privacy** - personal data never leaves player's control

#### Multi-Owner Chains (Team Leagues)

```rust
// Shared chains for collaborative gameplay
struct TeamLeagueChain {
    team_members: Vec<AccountOwner>,
    shared_strategy: RegisterView<TeamStrategy>,
    collective_portfolio: RegisterView<Portfolio>,
    team_achievements: LogView<TeamAchievement>,
}
```

**Use Cases:**

- Family leagues with shared management
- Corporate team competitions
- Community-driven investment clubs

#### Public Chains (Global Infrastructure)

```rust
// Public infrastructure chains
struct GlobalOracleChain {
    price_feeds: MapView<String, PriceData>,
    market_analysis: RegisterView<MarketReport>,
    ai_models: MapView<ModelId, AIModel>,
    public_leaderboards: RegisterView<GlobalRankings>,
}
```

**Functions:**

- Price oracle aggregation
- AI model hosting and updates
- Global leaderboards and statistics
- Cross-platform reputation system

## Cross-Chain Messaging

Linera's cross-chain messaging enables seamless communication between different microchains:

### Message Flow in CoinDrafts

```mermaid
sequenceDiagram
    participant PC as Player Chain
    participant LC as League Chain
    participant OC as Oracle Chain
    participant MC as Merchant Chain

    PC->>LC: Submit Portfolio
    LC->>OC: Request Price Updates
    OC->>LC: Price Data Update
    LC->>PC: Ranking Change Notification
    PC->>MC: Achievement Unlocked
    MC->>PC: Reward Available
```

### Implementation Example

```rust
// Cross-chain message types
#[derive(Debug, Serialize, Deserialize)]
pub enum CrossChainMessage {
    PortfolioSubmission {
        portfolio: Portfolio,
        league_id: LeagueId,
    },
    PriceUpdate {
        cryptocurrency: String,
        price: Amount,
        timestamp: Timestamp,
    },
    AchievementUnlocked {
        player: AccountOwner,
        achievement: Achievement,
    },
    RewardAvailable {
        recipient: AccountOwner,
        reward: Reward,
    },
}

// Sending messages between chains
async fn submit_portfolio_to_league(&mut self, portfolio: Portfolio, league_chain: ChainId) {
    let message = CrossChainMessage::PortfolioSubmission {
        portfolio,
        league_id: self.current_league_id(),
    };

    self.runtime.send_message(league_chain, message).await?;
}

// Receiving and processing messages
async fn execute_message(&mut self, message: CrossChainMessage) {
    match message {
        CrossChainMessage::PortfolioSubmission { portfolio, league_id } => {
            self.add_participant(portfolio.owner, portfolio).await?;
            self.update_leaderboard().await?;
        }
        CrossChainMessage::PriceUpdate { cryptocurrency, price, timestamp } => {
            self.update_crypto_price(cryptocurrency, price, timestamp).await?;
            self.recalculate_all_performances().await?;
        }
        // Handle other message types...
    }
}
```

## Native Oracle Integration

Linera's native HTTP support enables professional-grade oracles directly in smart contracts:

### Multi-Source Price Aggregation

```rust
// Oracle with native HTTP queries
impl OracleContract {
    async fn aggregate_prices(&mut self, crypto_id: String) -> Result<PriceData, OracleError> {
        // Query multiple price sources simultaneously
        let coingecko_future = self.runtime.http_query(&format!(
            "https://api.coingecko.com/api/v3/simple/price?ids={}&vs_currencies=usd",
            crypto_id
        ));

        let binance_future = self.runtime.http_query(&format!(
            "https://api.binance.com/api/v3/ticker/price?symbol={}USDT",
            crypto_id.to_uppercase()
        ));

        let coinbase_future = self.runtime.http_query(&format!(
            "https://api.coinbase.com/v2/exchange-rates?currency={}",
            crypto_id.to_uppercase()
        ));

        // Await all queries in parallel
        let (coingecko, binance, coinbase) = futures::try_join!(
            coingecko_future,
            binance_future,
            coinbase_future
        )?;

        // Aggregate with confidence scoring
        let aggregated_price = self.weighted_average_with_outlier_detection(
            vec![coingecko, binance, coinbase]
        )?;

        Ok(PriceData {
            price: aggregated_price,
            confidence: self.calculate_confidence_score(&sources),
            timestamp: self.runtime.current_timestamp(),
            sources: vec!["coingecko", "binance", "coinbase"],
        })
    }
}
```

### AI Market Analysis Oracle

```rust
// AI-powered market analysis with external data
impl AIStrategyOracle {
    async fn generate_market_insights(&mut self) -> Result<MarketInsights, AIError> {
        // Gather comprehensive market data
        let news_sentiment = self.runtime.http_query(
            "https://newsapi.org/v2/everything?q=cryptocurrency&sortBy=publishedAt&apiKey=XXX"
        ).await?;

        let social_sentiment = self.runtime.http_query(
            "https://api.lunarcrush.com/v2?data=market&type=fast&key=XXX"
        ).await?;

        let fear_greed_index = self.runtime.http_query(
            "https://api.alternative.me/fng/"
        ).await?;

        let options_data = self.runtime.http_query(
            "https://api.deribit.com/api/v2/public/get_book_summary_by_currency?currency=BTC"
        ).await?;

        // Run advanced ML analysis
        let insights = self.analyze_market_conditions(
            news_sentiment,
            social_sentiment,
            fear_greed_index,
            options_data
        ).await?;

        Ok(insights)
    }
}
```

## Event Streams for Real-Time Features

Linera's event streams enable reactive programming for live social features:

### Global Activity Stream

```rust
// Define event types for CoinDrafts
#[derive(Debug, Serialize, Deserialize)]
pub enum CoinDraftsEvent {
    PortfolioCreated {
        player: AccountOwner,
        portfolio: Portfolio,
        league: LeagueId,
    },
    LeaderboardUpdate {
        league: LeagueId,
        new_rankings: Vec<RankingEntry>,
    },
    AchievementUnlocked {
        player: AccountOwner,
        achievement: Achievement,
        rarity: AchievementRarity,
    },
    PriceAlert {
        cryptocurrency: String,
        price_change: f64,
        direction: PriceDirection,
    },
}

// Stream publisher (e.g., in league contract)
impl LeagueContract {
    async fn update_leaderboard(&mut self, new_rankings: Vec<RankingEntry>) {
        self.leaderboard.set(new_rankings.clone());

        // Publish event to global stream
        self.runtime.publish_event(CoinDraftsEvent::LeaderboardUpdate {
            league: self.league_id(),
            new_rankings,
        }).await?;
    }
}

// Stream subscriber (e.g., in player contract)
impl PlayerContract {
    async fn process_streams(&mut self, updates: Vec<StreamUpdate>) {
        for update in updates {
            match update.event {
                CoinDraftsEvent::LeaderboardUpdate { league, new_rankings } => {
                    if self.is_participating_in_league(league) {
                        self.update_personal_ranking(new_rankings).await?;
                        self.maybe_send_notification().await?;
                    }
                }
                CoinDraftsEvent::AchievementUnlocked { player, achievement, rarity } => {
                    if self.is_friend(player) {
                        self.celebrate_friend_achievement(player, achievement).await?;
                    }
                }
                // Handle other events...
            }
        }
    }
}
```

## Geographic Sharding (Future)

Linera's planned geographic sharding will optimize CoinDrafts for global users:

### Regional Tournament Architecture

```rust
// Regional chains for optimized latency
struct RegionalTournament {
    region: GeographicRegion, // US_WEST, EU_CENTRAL, ASIA_PACIFIC
    local_players: MapView<AccountOwner, PlayerProfile>,
    regional_leaderboard: RegisterView<RegionalRankings>,
    cross_region_qualifiers: LogView<QualificationEvent>,
}

// Global championship coordination
impl GlobalChampionship {
    async fn coordinate_world_championship(&mut self) {
        // Collect winners from each region
        let regions = vec![
            GeographicRegion::NorthAmerica,
            GeographicRegion::Europe,
            GeographicRegion::AsiaPacific,
            GeographicRegion::LatinAmerica,
        ];

        let mut global_participants = Vec::new();

        for region in regions {
            let regional_winners = self.get_regional_champions(region).await?;
            global_participants.extend(regional_winners);
        }

        // Create global championship chain
        let championship_chain = self.runtime.open_chain().await?;

        // Invite all regional winners
        for participant in global_participants {
            self.runtime.send_message(
                participant.home_chain,
                ChampionshipInvitation {
                    participant: participant.address,
                    championship_chain: championship_chain.id(),
                    prize_pool: self.calculate_global_prize_pool(),
                }
            ).await?;
        }
    }
}
```

## Performance Characteristics

### Comparison with Traditional Blockchains

| Feature                     | Traditional Blockchain | Linera Microchains          |
| --------------------------- | ---------------------- | --------------------------- |
| **Transaction Finality**    | 10+ seconds            | <0.5 seconds                |
| **Concurrent Users**        | Limited by gas limit   | Unlimited (parallel chains) |
| **Data Reads**              | Gas fees required      | Free for chain owners       |
| **Real-time Updates**       | Not possible           | Native support              |
| **Cross-App Communication** | External oracles       | Native messaging            |
| **Scalability**             | Vertical only          | Horizontal + vertical       |

### CoinDrafts-Specific Benefits

**Portfolio Tracking:**

- **Current**: Expensive on-chain queries, limited update frequency
- **Linera**: Free real-time tracking on personal chains

**League Management:**

- **Current**: Single contract bottleneck, gas competition
- **Linera**: Parallel leagues with dedicated resources

**Price Oracles:**

- **Current**: Centralized, update delays, manipulation risk
- **Linera**: Multi-source aggregation, real-time updates, consensus-based

**Social Features:**

- **Current**: Centralized servers, privacy concerns
- **Linera**: Decentralized event streams, user-controlled data

## Application Development Model

### Contract + Service Architecture

Every Linera application consists of two components:

```rust
// Contract: Gas-metered, state-modifying logic
#[linera_sdk::contract]
pub struct CoinDraftsContract {
    state: CoinDraftsState,
    runtime: ContractRuntime<Self>,
}

// Service: Non-metered, read-only GraphQL interface
#[linera_sdk::service]
pub struct CoinDraftsService {
    state: CoinDraftsState,
    runtime: Arc<ServiceRuntime<Self>>,
}
```

**Contract Responsibilities:**

- Process operations (portfolio submissions, prize distributions)
- Handle cross-chain messages
- Modify application state
- Validate business logic

**Service Responsibilities:**

- Provide GraphQL API for frontends
- Query application state
- Generate reports and analytics
- Serve real-time data to clients

### State Management with Views

Linera's view system provides efficient, flexible state management:

```rust
// Hierarchical state organization
#[derive(RootView, async_graphql::SimpleObject)]
#[view(context = ViewStorageContext)]
pub struct CoinDraftsState {
    // Player data
    pub players: MapView<AccountOwner, PlayerProfile>,
    pub portfolios: MapView<PortfolioId, Portfolio>,

    // League data
    pub active_leagues: MapView<LeagueId, League>,
    pub league_history: LogView<CompletedLeague>,

    // Market data
    pub price_feeds: MapView<String, PriceHistory>,
    pub market_analysis: RegisterView<MarketReport>,

    // Social features
    pub friend_connections: MapView<AccountOwner, Vec<AccountOwner>>,
    pub global_chat: LogView<ChatMessage>,
}
```

## Security Model

### Chain-Level Security

Each microchain inherits Linera's security properties:

- **Byzantine Fault Tolerance**: Same security as main Linera network
- **Validator Consensus**: All chains validated by same validator set
- **Cryptographic Signatures**: Ed25519 signatures for all operations
- **State Verification**: Merkle tree proofs for state integrity

### Application-Level Security

CoinDrafts implements additional security measures:

```rust
// Access control and validation
impl CoinDraftsContract {
    async fn execute_operation(&mut self, operation: Operation) -> Response {
        // Verify operation signature and permissions
        let signer = self.runtime.authenticated_signer();

        match operation {
            Operation::SubmitPortfolio { portfolio } => {
                // Validate portfolio constraints
                self.validate_portfolio(&portfolio)?;

                // Check league participation eligibility
                self.verify_league_eligibility(signer, portfolio.league_id)?;

                // Ensure no duplicate submissions
                self.check_no_duplicate_submission(signer, portfolio.league_id)?;

                self.process_portfolio_submission(signer, portfolio).await
            }
            // Handle other operations with appropriate validation...
        }
    }
}
```

This architecture provides the foundation for building unprecedented crypto gaming experiences on Linera. The next sections will dive into specific implementations for each CoinDrafts feature.

---

_Understanding Linera's architecture unlocks the full potential of next-generation Web3 applications_ 🏗️⚡
