/*!
# Player Management

Player profiles, statistics, and account management for CoinDrafts Core.
Integrated directly following Linera application patterns.
*/

use async_graphql::{SimpleObject, Enum};
use serde::{Deserialize, Serialize};

/// Player profile and statistics
#[derive(Debug, Clone, Serialize, Deserialize, SimpleObject)]
pub struct PlayerProfile {
    /// Player's account identifier
    pub account: String,
    /// Display name
    pub name: String,
    /// Registration timestamp
    pub registered_at: u64,
    /// Player statistics
    pub stats: PlayerStats,
    /// Current player tier
    pub tier: PlayerTier,
    /// Total earnings in USDC (micro units)
    pub total_earnings_usdc: u64,
}

/// Player statistics
#[derive(Debug, Clone, Serialize, Deserialize, SimpleObject)]
pub struct PlayerStats {
    /// Total games played
    pub games_played: u32,
    /// Games won (first place)
    pub games_won: u32,
    /// Games finished in top 10%
    pub top_10_finishes: u32,
    /// Average portfolio performance percentage
    pub avg_performance: f64,
    /// Best single game performance percentage
    pub best_performance: f64,
    /// Current win streak
    pub current_streak: u32,
    /// Longest win streak
    pub longest_streak: u32,
    /// Portfolio accuracy score (0-100)
    pub accuracy_score: u8,
}

/// Player tier system
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize, Enum)]
pub enum PlayerTier {
    Rookie,
    Bronze,
    Silver,
    Gold,
    Platinum,
    Diamond,
    Master,
    Grandmaster,
}

impl PlayerProfile {
    /// Create new player profile
    pub fn new(account: String, name: String, timestamp: u64) -> Self {
        Self {
            account,
            name,
            registered_at: timestamp,
            stats: PlayerStats::default(),
            tier: PlayerTier::Rookie,
            total_earnings_usdc: 0,
        }
    }
}

impl Default for PlayerStats {
    fn default() -> Self {
        Self {
            games_played: 0,
            games_won: 0,
            top_10_finishes: 0,
            avg_performance: 0.0,
            best_performance: 0.0,
            current_streak: 0,
            longest_streak: 0,
            accuracy_score: 0,
        }
    }
}

impl PlayerTier {
    /// Get required games for this tier
    pub fn required_games(self) -> u32 {
        match self {
            PlayerTier::Rookie => 0,
            PlayerTier::Bronze => 5,
            PlayerTier::Silver => 15,
            PlayerTier::Gold => 50,
            PlayerTier::Platinum => 100,
            PlayerTier::Diamond => 250,
            PlayerTier::Master => 500,
            PlayerTier::Grandmaster => 1000,
        }
    }

    /// Get required win rate for this tier
    pub fn required_win_rate(self) -> f64 {
        match self {
            PlayerTier::Rookie => 0.0,
            PlayerTier::Bronze => 0.1,
            PlayerTier::Silver => 0.2,
            PlayerTier::Gold => 0.3,
            PlayerTier::Platinum => 0.4,
            PlayerTier::Diamond => 0.5,
            PlayerTier::Master => 0.6,
            PlayerTier::Grandmaster => 0.7,
        }
    }
}