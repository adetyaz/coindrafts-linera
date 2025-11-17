/*!
# Scoring System

Scoring algorithms and performance calculations for CoinDrafts Core.
*/

use serde::{Deserialize, Serialize};
use async_graphql::SimpleObject;

/// Performance score for a portfolio (using integer representations with 4 decimal precision)
#[derive(Debug, Clone, Serialize, Deserialize, SimpleObject)]
pub struct PerformanceScore {
    /// Base performance percentage (scaled by 10000, e.g., 12.34% = 123400)
    pub base_performance: u32,
    /// Risk-adjusted multiplier (scaled by 10000, e.g., 1.05 = 10500)
    pub risk_multiplier: u32,
    /// AI confidence bonus (scaled by 10000, e.g., 0.03 = 300)
    pub ai_bonus: u32,
    /// Portfolio synergy bonus (scaled by 10000, e.g., 0.02 = 200)
    pub synergy_bonus: u32,
    /// Diversity bonus (scaled by 10000, e.g., 0.01 = 100)
    pub diversity_bonus: u32,
    /// Final score (scaled by 10000, e.g., 15.50% = 155000)
    pub final_score: u32,
}

/// Scoring calculator
pub struct ScoreCalculator;

impl ScoreCalculator {
    /// Calculate portfolio performance score (input: base_performance as percentage * 10000)
    pub fn calculate_score(base_performance: u32) -> PerformanceScore {
        PerformanceScore {
            base_performance,
            risk_multiplier: 10000, // 1.0 * 10000
            ai_bonus: 0,
            synergy_bonus: 0,
            diversity_bonus: 0,
            final_score: base_performance,
        }
    }
    
    /// Convert percentage to scaled integer (e.g., 12.34% -> 123400)
    pub fn percentage_to_scaled(percentage: f64) -> u32 {
        (percentage * 10000.0) as u32
    }
    
    /// Convert scaled integer back to percentage (e.g., 123400 -> 12.34%)
    pub fn scaled_to_percentage(scaled: u32) -> f64 {
        scaled as f64 / 10000.0
    }
}