#![cfg_attr(target_arch = "wasm32", no_main)]

use price_prediction::{
    PricePredictionAbi, PredictionOperation, PredictionMarket, Prediction, MarketStatus,
    state::PricePredictionState,
};
use linera_sdk::{linera_base_types::WithContractAbi, Contract, ContractRuntime, views::{RootView, View}};

pub struct PricePredictionContract {
    state: PricePredictionState,
    runtime: ContractRuntime<Self>,
}

linera_sdk::contract!(PricePredictionContract);

impl WithContractAbi for PricePredictionContract {
    type Abi = PricePredictionAbi;
}

impl Contract for PricePredictionContract {
    type Message = ();
    type Parameters = ();
    type InstantiationArgument = ();
    type EventValue = ();

    async fn load(runtime: ContractRuntime<Self>) -> Self {
        let state = PricePredictionState::load(runtime.root_view_storage_context())
            .await
            .expect("Failed to load state");
        PricePredictionContract { state, runtime }
    }

    async fn instantiate(&mut self, _argument: ()) {}

    async fn execute_operation(&mut self, operation: PredictionOperation) -> () {
        match operation {
            PredictionOperation::CreateMarket { crypto_id, entry_fee, duration_days } => {
                self.create_market(crypto_id, entry_fee, duration_days).await;
            }
            PredictionOperation::SubmitPrediction { market_id, min_price, max_price, confidence, ai_assisted } => {
                self.submit_prediction(market_id, min_price, max_price, confidence, ai_assisted).await;
            }
            PredictionOperation::SettleMarket { market_id, final_price, players } => {
                self.settle_market(market_id, final_price, players).await;
            }
        }
    }

    async fn execute_message(&mut self, _message: ()) {
        panic!("Messages not supported");
    }

    async fn store(mut self) {
        self.state.save().await.expect("Failed to save state");
    }
}

impl PricePredictionContract {
    async fn create_market(&mut self, crypto_id: String, entry_fee: u64, duration_days: u32) {
        let market_id = self.state.next_market_id.get().to_string();
        let next_id = self.state.next_market_id.get() + 1;
        self.state.next_market_id.set(next_id);

        let current_time = self.runtime.system_time().micros();
        let duration_micros = (duration_days as u64) * 24 * 60 * 60 * 1_000_000;
        
        let market = PredictionMarket {
            id: market_id.clone(),
            crypto_id,
            creator: self.runtime.authenticated_signer().unwrap().to_string(),
            entry_fee,
            start_price: 0, // Will be set when first prediction submitted
            start_time: current_time,
            end_time: current_time + duration_micros,
            status: MarketStatus::Active,
            final_price: None,
        };

        self.state.markets.insert(&market_id, market).expect("Failed to insert market");
    }

    async fn submit_prediction(&mut self, market_id: String, min_price: u64, max_price: u64, confidence: u8, ai_assisted: bool) {
        let player = self.runtime.authenticated_signer().unwrap().to_string();
        let current_time = self.runtime.system_time().micros();

        let prediction = Prediction {
            player: player.clone(),
            market_id: market_id.clone(),
            min_price,
            max_price,
            confidence,
            ai_assisted,
            submitted_at: current_time,
            multiplier: None,
            reward: None,
        };

        // Store prediction with composite key
        let prediction_key = format!("{}-{}", market_id, player);
        self.state.predictions.insert(&prediction_key, prediction).expect("Failed to insert prediction");

        // Track player's market participation
        let player_market_key = format!("{}-{}", player, market_id);
        self.state.player_markets.insert(&player_market_key, true).expect("Failed to track player market");
    }

    async fn settle_market(&mut self, market_id: String, final_price: u64, players: Vec<String>) {
        // Get market
        let mut market = match self.state.markets.get(&market_id).await.expect("Failed to read market") {
            Some(m) => m,
            None => panic!("Market not found: {}", market_id),
        };
        
        market.status = MarketStatus::Settling;
        market.final_price = Some(final_price);
        let entry_fee = market.entry_fee;
        
        // Process each player's prediction directly - no iteration needed
        for player in players {
            let prediction_key = format!("{}-{}", market_id, player);
            
            if let Ok(Some(mut pred)) = self.state.predictions.get(&prediction_key).await {
                if final_price >= pred.min_price && final_price <= pred.max_price {
                    let range_width = pred.max_price.saturating_sub(pred.min_price);
                    let range_multiplier = match range_width {
                        0..=1_000_000 => 20.0,
                        1_000_001..=5_000_000 => 10.0,
                        5_000_001..=10_000_000 => 5.0,
                        _ => 2.0,
                    };
                    let multiplier = range_multiplier * (pred.confidence as f64 / 100.0);
                    let reward = (entry_fee as f64 * multiplier) as u64;
                    
                    pred.multiplier = Some(multiplier);
                    pred.reward = Some(reward);
                    
                    let _ = self.state.predictions.insert(&prediction_key, pred);
                }
            }
        }
        
        market.status = MarketStatus::Completed;
        self.state.markets.insert(&market_id, market).expect("Failed to update market");
    }
}
