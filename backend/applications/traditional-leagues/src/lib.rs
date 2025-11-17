/*!
# Traditional Leagues Application

Complex tournament management system for CoinDrafts Traditional League games.
Handles multi-round tournaments, bracket management, and advanced scoring.
*/

use async_graphql::{Request, Response, SimpleObject, InputObject, Enum};
use linera_sdk::{
    graphql::GraphQLMutationRoot,
    linera_base_types::{ContractAbi, ServiceAbi},
};
use serde::{Deserialize, Serialize};

pub struct TraditionalLeaguesAbi;

impl ContractAbi for TraditionalLeaguesAbi {
    type Operation = TraditionalLeaguesOperation;
    type Response = TraditionalLeaguesResponse;
}

impl ServiceAbi for TraditionalLeaguesAbi {
    type Query = Request;
    type QueryResponse = Response;
}

/// Operations supported by the Traditional Leagues application
#[derive(Debug, Serialize, Deserialize, GraphQLMutationRoot)]
pub enum TraditionalLeaguesOperation {
    /// Create a new traditional league tournament
    CreateTournament {
        name: String,
        entry_fee_usdc: u64,
        max_participants: u32,
        tournament_type: TournamentType,
    },
    /// Register for a tournament
    RegisterForTournament {
        tournament_id: String,
        player_account: String,
    },
    /// Submit portfolio for tournament round
    SubmitPortfolio {
        tournament_id: String,
        round: u32,
        portfolio: TournamentPortfolio,
    },
    /// Advance tournament to next round
    AdvanceRound {
        tournament_id: String,
    },
    /// Complete tournament and distribute rewards
    CompleteTournament {
        tournament_id: String,
    },
    /// Check for expired tournaments and complete them (reactive alternative to timers)
    CheckExpiredTournaments,
}

/// Response types from Traditional Leagues operations
#[derive(Debug, Serialize, Deserialize)]
pub enum TraditionalLeaguesResponse {
    TournamentCreated { tournament_id: String },
    PlayerRegistered { success: bool },
    PortfolioSubmitted { success: bool },
    RoundAdvanced { new_round: u32 },
    TournamentCompleted { winners: Vec<String> },
    ExpiredTournamentsChecked { completed_tournaments: Vec<String> },
}



/// Tournament types supported
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize, Enum)]
pub enum TournamentType {
    /// Single elimination bracket
    SingleElimination,
    /// Double elimination bracket
    DoubleElimination,
    /// Round robin format
    RoundRobin,
    /// Swiss system tournament
    Swiss,
}

/// Tournament status
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize, Enum)]
pub enum TournamentStatus {
    Registration,
    InProgress,
    Completed,
    Cancelled,
}

/// Portfolio submission for tournament
#[derive(Debug, Clone, Serialize, Deserialize, SimpleObject, InputObject)]
#[graphql(input_name = "TournamentPortfolioInput")]
pub struct TournamentPortfolio {
    pub cryptocurrencies: Vec<CryptoAllocation>,
    pub risk_level: RiskLevel,
    pub strategy_notes: Option<String>,
}

/// Cryptocurrency allocation in tournament portfolio
#[derive(Debug, Clone, Serialize, Deserialize, SimpleObject, InputObject)]
#[graphql(input_name = "CryptoAllocationInput")]
pub struct CryptoAllocation {
    pub symbol: String,
    pub allocation_percent: u8,
    pub confidence_score: Option<u8>,
}

/// Risk level for portfolio
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize, Enum)]
pub enum RiskLevel {
    Conservative,
    Moderate,
    Aggressive,
    HighRisk,
}

/// Tournament structure
#[derive(Debug, Clone, Serialize, Deserialize, SimpleObject)]
pub struct Tournament {
    pub id: String,
    pub name: String,
    pub tournament_type: TournamentType,
    pub status: TournamentStatus,
    pub entry_fee_usdc: u64,
    pub max_participants: u32,
    pub current_participants: u32,
    pub current_round: u32,
    pub max_rounds: u32,
    pub created_at: u64,
    pub started_at: Option<u64>,
    pub completed_at: Option<u64>,
}

/// Price data for cryptocurrency scoring (using integer representations)
#[derive(Debug, Clone, Serialize, Deserialize, SimpleObject)]
pub struct PriceData {
    pub symbol: String,
    /// Start price in micro-units (price * 1_000_000 for 6 decimal precision)
    pub start_price: u64,
    /// End price in micro-units (price * 1_000_000 for 6 decimal precision)
    pub end_price: u64,
    /// Percentage change scaled by 10000 (e.g., 5.25% = 52500)
    pub percentage_change: i32,
}

/// Portfolio performance result
#[derive(Debug, Clone, Serialize, Deserialize, SimpleObject)]
pub struct PortfolioPerformance {
    pub player_account: String,
    /// Total return percentage scaled by 10000 (e.g., 12.50% = 125000)
    pub total_return: i32,
    pub rank: u32,
    pub portfolio: TournamentPortfolio,
}

/// Tournament leaderboard entry
#[derive(Debug, Clone, Serialize, Deserialize, SimpleObject)]
pub struct LeaderboardEntry {
    pub rank: u32,
    pub player_account: String,
    /// Total return percentage scaled by 10000 (e.g., 12.50% = 125000)
    pub total_return: i32,
    pub winning_amount: u64, // USDC winnings
}

/// Mock price data for testing (10-minute tournaments)
impl PriceData {
    pub fn get_mock_prices() -> Vec<PriceData> {
        vec![
            PriceData {
                symbol: "BTC".to_string(),
                start_price: 45_000_000_000, // $45,000.00 * 1_000_000
                end_price: 46_800_000_000,   // $46,800.00 * 1_000_000 (+4% return)
                percentage_change: 40000,     // 4.0% * 10000
            },
            PriceData {
                symbol: "ETH".to_string(),
                start_price: 3_200_000_000,  // $3,200.00 * 1_000_000
                end_price: 3_360_000_000,    // $3,360.00 * 1_000_000 (+5% return)
                percentage_change: 50000,     // 5.0% * 10000
            },
            PriceData {
                symbol: "ADA".to_string(),
                start_price: 450_000,        // $0.45 * 1_000_000
                end_price: 470_000,          // $0.47 * 1_000_000 (+4.4% return)
                percentage_change: 44000,     // 4.4% * 10000
            },
            PriceData {
                symbol: "SOL".to_string(),
                start_price: 180_000_000,    // $180.00 * 1_000_000
                end_price: 171_000_000,      // $171.00 * 1_000_000 (-5% return)
                percentage_change: -50000,    // -5.0% * 10000
            },
            PriceData {
                symbol: "DOT".to_string(),
                start_price: 8_500_000,      // $8.50 * 1_000_000
                end_price: 9_000_000,        // $9.00 * 1_000_000 (+5.9% return)
                percentage_change: 59000,     // 5.9% * 10000
            },
        ]
    }
}

/// Portfolio scoring engine
pub struct ScoringEngine;

impl ScoringEngine {
    /// Calculate portfolio performance based on crypto allocations and price changes
    pub fn calculate_portfolio_performance(
        portfolio: &TournamentPortfolio,
        price_data: &[PriceData],
    ) -> i32 {
        let mut total_return = 0i32;
        
        for allocation in &portfolio.cryptocurrencies {
            if let Some(price_info) = price_data.iter().find(|p| p.symbol == allocation.symbol) {
                let weight = allocation.allocation_percent as i32;
                // percentage_change is already scaled by 10000, weight is 0-100
                // So: (percentage_change * weight) / 100 gives us the contribution scaled by 10000
                let contribution = (price_info.percentage_change * weight) / 100;
                total_return += contribution;
            }
        }
        
        // Apply risk adjustment bonus/penalty (scaled by 10000)
        let risk_multiplier = match portfolio.risk_level {
            RiskLevel::Conservative => 8000,  // 0.8 * 10000 (lower returns but safer)
            RiskLevel::Moderate => 10000,     // 1.0 * 10000 (no adjustment)
            RiskLevel::Aggressive => 11000,   // 1.1 * 10000 (slight bonus for risk)
            RiskLevel::HighRisk => 12000,     // 1.2 * 10000 (higher bonus but higher risk)
        };
        
        // Apply risk multiplier: (total_return * risk_multiplier) / 10000
        (total_return * risk_multiplier) / 10000
    }
    
    /// Calculate tournament winners and rankings
    pub fn calculate_leaderboard(
        portfolios: Vec<(String, TournamentPortfolio)>,
        price_data: &[PriceData],
        total_prize_pool: u64,
    ) -> Vec<LeaderboardEntry> {
        let mut performance: Vec<(String, i32)> = portfolios
            .iter()
            .map(|(player, portfolio)| {
                let score = Self::calculate_portfolio_performance(portfolio, price_data);
                (player.clone(), score)
            })
            .collect();
        
        // Sort by performance (highest first)
        performance.sort_by(|a, b| b.1.cmp(&a.1));
        
        // Calculate prize distribution (60% winner, 30% second, 10% third)
        performance
            .into_iter()
            .enumerate()
            .map(|(index, (player, score))| {
                let rank = (index + 1) as u32;
                let winning_amount = match rank {
                    1 => (total_prize_pool * 60) / 100,  // 60%
                    2 => (total_prize_pool * 30) / 100,  // 30%
                    3 => (total_prize_pool * 10) / 100,  // 10%
                    _ => 0,
                };
                
                LeaderboardEntry {
                    rank,
                    player_account: player,
                    total_return: score,
                    winning_amount,
                }
            })
            .collect()
    }
}

/// Message types for cross-chain communication

/// Messages sent TO CoinDrafts Core
#[derive(Debug, Serialize, Deserialize)]
pub enum TraditionalLeaguesMessage {
    /// Notify CoinDrafts Core of tournament creation
    TournamentCreated {
        game_id: String,
        tournament_id: String,
        tournament_info: Tournament,
    },
    /// Notify CoinDrafts Core of tournament completion
    TournamentCompleted {
        game_id: String,
        tournament_id: String,
        winners: Vec<String>,
        total_prize_pool: u64,
    },
    /// Request player verification from CoinDrafts Core
    VerifyPlayer {
        game_id: String,
        player_account: String,
        tournament_id: String,
    },
}

/// Messages received FROM CoinDrafts Core
#[derive(Debug, Serialize, Deserialize)]
pub enum CoinDraftsMessage {
    /// Request to create a tournament for a Traditional League game
    CreateTournament {
        game_id: String,
        tournament_name: String,
        entry_fee_usdc: u64,
        max_participants: u32,
    },
    /// Register a player for a specific tournament
    RegisterPlayerForTournament {
        game_id: String,
        tournament_id: String,
        player_profile: String, // JSON serialized PlayerProfile
    },
    /// Sync portfolio submission to tournament
    SyncPortfolio {
        game_id: String,
        tournament_id: String,
        portfolio: String, // JSON serialized Portfolio
    },
    /// Request tournament status update
    GetTournamentStatus {
        tournament_id: String,
    },
    /// Response to player verification request
    VerifyPlayer {
        game_id: String,
        player_account: String,
        tournament_id: String,
        verified: bool,
    },
}