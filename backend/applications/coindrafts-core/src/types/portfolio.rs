/*!
# Portfolio Management

Portfolio types and validation for CoinDrafts Core.
*/

use async_graphql::{SimpleObject, Enum};
use serde::{Deserialize, Serialize};

/// Cryptocurrency holding in a portfolio
#[derive(Debug, Clone, Serialize, Deserialize, SimpleObject)]
pub struct CryptoHolding {
    /// Cryptocurrency symbol (e.g., "BTC", "ETH")
    pub symbol: String,
    /// Allocation percentage (1-100)
    pub allocation_percent: u8,
}

/// Portfolio submission
#[derive(Debug, Clone, Serialize, Deserialize, SimpleObject)]
pub struct Portfolio {
    /// Game ID this portfolio belongs to
    pub game_id: String,
    /// Player account
    pub player_account: String,
    /// List of cryptocurrency holdings
    pub holdings: Vec<CryptoHolding>,
    /// Submission timestamp
    pub submitted_at: u64,
    /// Portfolio status
    pub status: PortfolioStatus,
}

/// Portfolio validation status
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize, Enum)]
pub enum PortfolioStatus {
    Valid,
    Invalid,
    Pending,
}

impl Portfolio {
    /// Create new portfolio
    pub fn new(game_id: String, player_account: String, holdings: Vec<CryptoHolding>, timestamp: u64) -> Self {
        Self {
            game_id,
            player_account,
            holdings,
            submitted_at: timestamp,
            status: PortfolioStatus::Pending,
        }
    }

    /// Validate portfolio
    pub fn validate(&self) -> Result<(), Vec<String>> {
        let mut errors = Vec::new();

        // Check total allocation
        let total_allocation: u32 = self.holdings.iter().map(|h| h.allocation_percent as u32).sum();
        if total_allocation != 100 {
            errors.push(format!("Total allocation must equal 100%, got {}%", total_allocation));
        }

        // Check holdings count
        if self.holdings.is_empty() {
            errors.push("Portfolio must contain at least one holding".to_string());
        }

        if self.holdings.len() > 10 {
            errors.push("Portfolio cannot contain more than 10 holdings".to_string());
        }

        if errors.is_empty() {
            Ok(())
        } else {
            Err(errors)
        }
    }
}