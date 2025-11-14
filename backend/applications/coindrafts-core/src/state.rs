/*!
# CoinDrafts Core State

Manages the persistent state for the CoinDrafts orchestration hub.
Uses Linera views for efficient blockchain-native state management.
*/

use coindrafts_core::{Game, PlayerProfile, Portfolio};
use linera_sdk::views::{linera_views, MapView, RegisterView, RootView, ViewStorageContext};

/// The application state
#[derive(RootView)]
#[view(context = ViewStorageContext)]
pub struct CoinDraftsState {
    /// All created games indexed by game_id
    pub games: MapView<String, Game>,
    /// All registered players indexed by account string
    pub players: MapView<String, PlayerProfile>,
    /// Portfolio submissions indexed by game_id
    pub portfolios: MapView<String, Vec<Portfolio>>,
    /// Global game counter for generating unique IDs
    pub game_counter: RegisterView<u64>,
}