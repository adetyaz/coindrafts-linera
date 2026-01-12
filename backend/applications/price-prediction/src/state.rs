use linera_sdk::views::{linera_views, MapView, RegisterView, RootView, ViewStorageContext};
use crate::{PredictionMarket, Prediction};

#[derive(RootView)]
#[view(context = ViewStorageContext)]
pub struct PricePredictionState {
    /// All prediction markets by ID
    pub markets: MapView<String, PredictionMarket>,
    
    /// Predictions by composite key "market_id-player" -> Prediction
    pub predictions: MapView<String, Prediction>,
    
    /// Player market participation by composite key "player-market_id" -> bool
    pub player_markets: MapView<String, bool>,
    
    /// Next market ID counter
    pub next_market_id: RegisterView<u64>,
}
