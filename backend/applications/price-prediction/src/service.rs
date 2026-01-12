#![cfg_attr(target_arch = "wasm32", no_main)]

use async_graphql::{Object, Request, Response, Schema, EmptySubscription, Context};
use linera_sdk::{linera_base_types::WithServiceAbi, Service, ServiceRuntime, views::View};
use std::sync::Arc;
use price_prediction::{PricePredictionAbi, PredictionMarket, Prediction, PredictionOperation, state::PricePredictionState};

pub struct PricePredictionService {
    state: Arc<PricePredictionState>,
    runtime: Arc<ServiceRuntime<Self>>,
}

linera_sdk::service!(PricePredictionService);

impl WithServiceAbi for PricePredictionService {
    type Abi = PricePredictionAbi;
}

impl Service for PricePredictionService {
    type Parameters = ();

    async fn new(runtime: ServiceRuntime<Self>) -> Self {
        let state = PricePredictionState::load(runtime.root_view_storage_context())
            .await
            .expect("Failed to load state");
        PricePredictionService {
            state: Arc::new(state),
            runtime: Arc::new(runtime),
        }
    }

    async fn handle_query(&self, request: Request) -> Response {
        let schema = Schema::build(
            QueryRoot,
            MutationRoot {
                runtime: self.runtime.clone(),
            },
            EmptySubscription,
        )
        .data(self.state.clone())
        .finish();

        schema.execute(request).await
    }
}

struct QueryRoot;

#[Object]
impl QueryRoot {
    async fn active_markets(&self, ctx: &async_graphql::Context<'_>) -> Vec<PredictionMarket> {
        let state = ctx.data::<Arc<PricePredictionState>>().unwrap();
        let mut markets = Vec::new();
        
        for market_id in state.markets.indices().await.unwrap() {
            if let Some(m) = state.markets.get(&market_id).await.unwrap() {
                markets.push(m);
            }
        }
        
        markets
    }

    async fn prediction_market(&self, ctx: &async_graphql::Context<'_>, id: String) -> Option<PredictionMarket> {
        let state = ctx.data::<Arc<PricePredictionState>>().unwrap();
        state.markets.get(&id).await.unwrap()
    }

    async fn market_predictions(&self, ctx: &async_graphql::Context<'_>, market_id: String) -> Vec<Prediction> {
        let state = ctx.data::<Arc<PricePredictionState>>().unwrap();
        let mut predictions = Vec::new();
        
        let prefix = format!("{}-", market_id);
        match state.predictions.indices().await {
            Ok(indices) => {
                for key in indices {
                    if key.starts_with(&prefix) {
                        if let Ok(Some(pred)) = state.predictions.get(&key).await {
                            predictions.push(pred);
                        }
                    }
                }
            }
            Err(_) => {
                // Failed to get indices, return empty predictions
            }
        }
        
        predictions
    }

    async fn my_predictions(&self, ctx: &async_graphql::Context<'_>, player: String) -> Vec<Prediction> {
        let state = ctx.data::<Arc<PricePredictionState>>().unwrap();
        let mut all_predictions = Vec::new();

        let prefix = format!("{}-", player);
        match state.player_markets.indices().await {
            Ok(indices) => {
                for key in indices {
                    if key.starts_with(&prefix) {
                        let parts: Vec<&str> = key.splitn(2, '-').collect();
                        if parts.len() == 2 {
                            let market_id = parts[1];
                            let prediction_key = format!("{}-{}", market_id, player);
                            if let Ok(Some(prediction)) = state.predictions.get(&prediction_key).await {
                                all_predictions.push(prediction);
                            }
                        }
                    }
                }
            }
            Err(_) => {
                // Failed to get indices, return empty predictions
            }
        }

        all_predictions
    }
}

struct MutationRoot {
    runtime: Arc<ServiceRuntime<PricePredictionService>>,
}

#[Object]
impl MutationRoot {
    /// Create a new prediction market
    async fn create_market(
        &self,
        _context: &Context<'_>,
        crypto_id: String,
        entry_fee: i32, // micro-USDC
        duration_days: i32,
    ) -> String {
        let operation = PredictionOperation::CreateMarket {
            crypto_id: crypto_id.clone(),
            entry_fee: entry_fee as u64,
            duration_days: duration_days as u32,
        };

        self.runtime.schedule_operation(&operation);
        format!("Market creation scheduled for {}", crypto_id)
    }

    /// Submit a price prediction
    async fn submit_prediction(
        &self,
        _context: &Context<'_>,
        market_id: String,
        min_price: f64, // micro-USDC
        max_price: f64, // micro-USDC
        confidence: i32, // 0-100
        ai_assisted: bool,
    ) -> String {
        let operation = PredictionOperation::SubmitPrediction {
            market_id: market_id.clone(),
            min_price: min_price as u64,
            max_price: max_price as u64,
            confidence: confidence as u8,
            ai_assisted,
        };

        self.runtime.schedule_operation(&operation);
        format!("Prediction submitted for market {}", market_id)
    }

    /// Settle a market with final price
    async fn settle_market(
        &self,
        _context: &Context<'_>,
        market_id: String,
        final_price: f64, // micro-USDC
        players: Vec<String>,
    ) -> String {
        let operation = PredictionOperation::SettleMarket {
            market_id: market_id.clone(),
            final_price: final_price as u64,
            players,
        };

        self.runtime.schedule_operation(&operation);
        format!("Market {} settlement scheduled", market_id)
    }
}
