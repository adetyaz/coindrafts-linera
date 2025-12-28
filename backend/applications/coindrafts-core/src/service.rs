/*!
# CoinDrafts Core Service

Provides GraphQL interface for frontend integration.
This handles all queries and mutations that the frontend needs to interact with games.
*/

#![cfg_attr(target_arch = "wasm32", no_main)]

mod state;

use std::sync::Arc;

use async_graphql::{Request, Response, Schema, Object, EmptySubscription};
use coindrafts_core::{CoinDraftsAbi, CoinDraftsOperation, Game, PlayerProfile, Portfolio};
use self::state::CoinDraftsState;
use linera_sdk::{
    graphql::GraphQLMutationRoot,
    linera_base_types::WithServiceAbi,
    views::View,
    Service, ServiceRuntime,
};

pub struct CoinDraftsService {
    state: Arc<CoinDraftsState>,
    runtime: Arc<ServiceRuntime<Self>>,
}

linera_sdk::service!(CoinDraftsService);

impl WithServiceAbi for CoinDraftsService {
    type Abi = CoinDraftsAbi;
}

impl Service for CoinDraftsService {
    type Parameters = ();

    async fn new(runtime: ServiceRuntime<Self>) -> Self {
        let state = CoinDraftsState::load(runtime.root_view_storage_context())
            .await
            .expect("Failed to load state");
        CoinDraftsService {
            state: Arc::new(state),
            runtime: Arc::new(runtime),
        }
    }

    async fn handle_query(&self, request: Request) -> Response {
        let query_root = QueryRoot {
            state: self.state.clone(),
        };
        let schema = Schema::build(
            query_root,
            CoinDraftsOperation::mutation_root(self.runtime.clone()),
            EmptySubscription,
        )
        .finish();
        
        schema.execute(request).await
    }
}

struct QueryRoot {
    state: Arc<CoinDraftsState>,
}

#[Object]
impl QueryRoot {
    /// Get all active games
    async fn games(&self) -> Vec<Game> {
        let mut games = Vec::new();
        self.state.games.for_each_index_value(|_key, game| {
            games.push(game.into_owned());
            Ok(())
        }).await.unwrap_or_default();
        games
    }

    /// Get a specific game by ID
    async fn game(&self, game_id: String) -> Option<Game> {
        self.state.games.get(&game_id).await.unwrap_or_default()
    }

    /// Get all registered players
    async fn players(&self) -> Vec<PlayerProfile> {
        let mut players = Vec::new();
        self.state.players.for_each_index_value(|_key, player| {
            players.push(player.into_owned());
            Ok(())
        }).await.unwrap_or_default();
        players
    }

    /// Get portfolios for a specific game
    async fn portfolios(&self, game_id: String) -> Vec<Portfolio> {
        self.state.portfolios.get(&game_id)
            .await
            .unwrap_or_default()
            .unwrap_or_default()
    }

    /// Get total statistics
    async fn total_games(&self) -> i32 {
        // Simple count - in production would use a more efficient counter
        let mut count = 0;
        self.state.games.for_each_index_value(|_key, _game| {
            count += 1;
            Ok(())
        }).await.unwrap_or_default();
        count
    }
}
