use async_graphql::SimpleObject;
use serde::{Deserialize, Serialize};

pub mod state;

// Types
#[derive(Debug, Clone, Serialize, Deserialize, SimpleObject)]
pub struct PredictionMarket {
    pub id: String,
    pub crypto_id: String,
    pub creator: String,
    pub entry_fee: u64, // Micro-USDC
    pub start_price: u64, // Micro-USDC
    pub start_time: u64, // Microseconds
    pub end_time: u64, // Microseconds
    pub status: MarketStatus,
    pub final_price: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, SimpleObject)]
pub struct Prediction {
    pub player: String,
    pub market_id: String,
    pub min_price: u64, // Micro-USDC
    pub max_price: u64, // Micro-USDC
    pub confidence: u8, // 0-100
    pub ai_assisted: bool,
    pub submitted_at: u64,
    pub multiplier: Option<f64>,
    pub reward: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, async_graphql::Enum, Copy, PartialEq, Eq)]
pub enum MarketStatus {
    Active,
    Settling,
    Completed,
}

// Operations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PredictionOperation {
    CreateMarket {
        crypto_id: String,
        entry_fee: u64,
        duration_days: u32,
    },
    SubmitPrediction {
        market_id: String,
        min_price: u64,
        max_price: u64,
        confidence: u8,
        ai_assisted: bool,
    },
    SettleMarket {
        market_id: String,
        final_price: u64,
        players: Vec<String>,
    },
}

// ABI
use linera_sdk::linera_base_types::{ContractAbi, ServiceAbi};

pub struct PricePredictionAbi;

impl ContractAbi for PricePredictionAbi {
    type Operation = PredictionOperation;
    type Response = ();
}

impl ServiceAbi for PricePredictionAbi {
    type Query = async_graphql::Request;
    type QueryResponse = async_graphql::Response;
}
