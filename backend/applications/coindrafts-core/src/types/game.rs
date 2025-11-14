/*!
# Game Configuration and Rules

Defines the core game mechanics, rules, and configuration for CoinDrafts Core application.
Integrated directly following Linera application patterns.
*/

use async_graphql::{SimpleObject, Enum};
use serde::{Deserialize, Serialize};

/// Game configuration for different modes
#[derive(Debug, Clone, Serialize, Deserialize, SimpleObject)]
pub struct GameConfig {
    /// Game mode type
    pub mode: GameMode,
    /// Entry fee in USDC (in micro units, 1 USDC = 1,000,000)
    pub entry_fee_usdc: u64,
    /// Duration in hours
    pub duration_hours: u64,
    /// Maximum number of players
    pub max_players: u32,
    /// Number of cryptocurrencies required in portfolio
    pub portfolio_size: u8,
    /// Minimum portfolio diversity required (percentage)
    pub min_diversity: u8,
}

/// Game mode enumeration
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize, Enum)]
pub enum GameMode {
    TraditionalLeague,
    QuickMatch,
    PricePrediction,
}

/// Game rules and constraints
#[derive(Debug, Clone, Serialize, Deserialize, SimpleObject)]
pub struct GameRules {
    /// Can players change portfolio after submission
    pub allow_portfolio_changes: bool,
    /// Maximum portfolio value change per hour (percentage)
    pub max_hourly_change: f64,
    /// Risk multiplier settings
    pub risk_multiplier_enabled: bool,
    /// AI confidence scoring enabled
    pub ai_scoring_enabled: bool,
    /// Team synergy bonuses enabled
    pub synergy_bonuses_enabled: bool,
}

/// Game phase tracking
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize, Enum)]
pub enum GamePhase {
    Registration,
    PortfolioSubmission,
    Active,
    Scoring,
    Completed,
}

impl GameConfig {
    /// Create configuration for Traditional League
    pub fn traditional_league() -> Self {
        Self {
            mode: GameMode::TraditionalLeague,
            entry_fee_usdc: 1_000_000, // $1 USDC
            duration_hours: 168, // 7 days
            max_players: 100,
            portfolio_size: 5,
            min_diversity: 20, // 20% minimum
        }
    }

    /// Create configuration for Quick Match
    pub fn quick_match() -> Self {
        Self {
            mode: GameMode::QuickMatch,
            entry_fee_usdc: 500_000, // $0.50 USDC
            duration_hours: 24, // 1 day
            max_players: 50,
            portfolio_size: 3,
            min_diversity: 30, // 30% minimum for smaller portfolios
        }
    }

    /// Create configuration for Price Prediction
    pub fn price_prediction() -> Self {
        Self {
            mode: GameMode::PricePrediction,
            entry_fee_usdc: 1_000_000, // $1 USDC
            duration_hours: 168, // 7 days
            max_players: 200,
            portfolio_size: 5,
            min_diversity: 15, // 15% minimum for prediction games
        }
    }
}

impl GameRules {
    /// Standard rules for Traditional League
    pub fn traditional_league() -> Self {
        Self {
            allow_portfolio_changes: false,
            max_hourly_change: 50.0, // 50% max hourly change
            risk_multiplier_enabled: true,
            ai_scoring_enabled: true,
            synergy_bonuses_enabled: true,
        }
    }

    /// Standard rules for Quick Match
    pub fn quick_match() -> Self {
        Self {
            allow_portfolio_changes: true, // Allow changes in quick matches
            max_hourly_change: 100.0, // 100% max hourly change
            risk_multiplier_enabled: true,
            ai_scoring_enabled: false, // Simplified scoring
            synergy_bonuses_enabled: false,
        }
    }

    /// Standard rules for Price Prediction
    pub fn price_prediction() -> Self {
        Self {
            allow_portfolio_changes: false,
            max_hourly_change: 25.0, // 25% max hourly change
            risk_multiplier_enabled: false, // Focus on prediction accuracy
            ai_scoring_enabled: true,
            synergy_bonuses_enabled: true,
        }
    }
}