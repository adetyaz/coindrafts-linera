/*!
# CoinDrafts Core Application

The orchestration hub for the CoinDrafts gaming platform.
This application manages game creation, player registration, and portfolio submissions
across the entire Linera microchain ecosystem.
*/

#![cfg_attr(target_arch = "wasm32", no_main)]

mod types;

use async_graphql::{Request, Response, SimpleObject, Enum, InputObject};
use linera_sdk::{
    graphql::GraphQLMutationRoot,
    linera_base_types::{ContractAbi, ServiceAbi},
};
use serde::{Deserialize, Serialize};

// Re-export types for external use
pub use types::*;

/// Price snapshot at a specific timestamp
#[derive(Debug, Clone, Serialize, Deserialize, SimpleObject, InputObject)]
#[graphql(input_name = "PriceSnapshotInput")]
pub struct PriceSnapshot {
    pub crypto_id: String,
    /// Price in micro-units (price * 1_000_000 for 6 decimal precision)
    pub price_usd: u64,
    pub timestamp: u64,
}

pub struct CoinDraftsAbi;

impl ContractAbi for CoinDraftsAbi {
    type Operation = CoinDraftsOperation;
    type Response = ();
}

impl ServiceAbi for CoinDraftsAbi {
    type Query = Request;
    type QueryResponse = Response;
}

#[derive(Debug, Serialize, Deserialize, GraphQLMutationRoot)]
pub enum CoinDraftsOperation {
    CreateGame { 
        mode: GameMode,
        name: String,
        max_players: u32,
        entry_fee_usdc: u64,
        duration_hours: u64
    },
    RegisterPlayer { game_id: String, player_name: String },
    RegisterPlayerWithAccount { game_id: String, player_name: String, player_account: String },
    SubmitPortfolio { game_id: String, cryptocurrencies: Vec<String> },
    SubmitPortfolioForAccount { game_id: String, player_account: String, cryptocurrencies: Vec<String> },
    StartGame { game_id: String, price_snapshot: Vec<PriceSnapshot> },
    EndGame { game_id: String, price_snapshot: Vec<PriceSnapshot> },
}

// Game status enum
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize, Enum)]
pub enum GameStatus {
    WaitingForPlayers,
    Active,
    Completed,
}

// Core game structure for GraphQL
#[derive(Debug, Clone, Serialize, Deserialize, SimpleObject)]
pub struct Game {
    pub game_id: String,
    pub name: String,
    pub mode: GameMode,
    pub status: GameStatus,
    pub created_at: u64,
    pub player_count: u32,
    pub max_players: u32,
    pub entry_fee_usdc: u64,
    pub duration_hours: u64,
    pub start_prices: Option<Vec<PriceSnapshot>>,
    pub winners: Vec<String>,
}

/// Cross-chain messages for coordinating with game mode applications
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
        player_profile: PlayerProfile,
    },
    /// Sync portfolio submission to tournament application
    SyncPortfolio {
        game_id: String,
        tournament_id: String,
        portfolio: Portfolio,
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

/// Messages received from Traditional Leagues application
#[derive(Debug, Serialize, Deserialize)]
pub enum TraditionalLeaguesMessage {
    /// Tournament created confirmation from Traditional Leagues
    TournamentCreated {
        game_id: String,
        tournament_id: String,
        tournament_info: String, // JSON serialized tournament info
    },
    /// Tournament completed notification
    TournamentCompleted {
        game_id: String,
        tournament_id: String,
        winners: Vec<String>,
        total_prize_pool: u64,
    },
    /// Player verification response
    PlayerVerified {
        game_id: String,
        player_account: String,
        verified: bool,
    },
    /// Tournament status update
    TournamentStatusUpdate {
        tournament_id: String,
        status: String, // Serialized tournament status
        current_round: u32,
    },
}