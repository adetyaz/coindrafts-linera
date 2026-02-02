/*!
# CoinDrafts Core Service

Provides GraphQL interface for frontend integration.
This handles all queries and mutations that the frontend needs to interact with games.
*/

#![cfg_attr(target_arch = "wasm32", no_main)]

mod state;

use std::sync::Arc;

use async_graphql::{Request, Response, Schema, Object, EmptySubscription, SimpleObject};
use coindrafts_core::{Achievement, CoinDraftsAbi, CoinDraftsOperation, Game, GameResult, PlayerProfile, PlayerTier, Portfolio};
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

    /// Get complete player profile with stats and achievements
    async fn player_profile(&self, account: String) -> Option<PlayerStats> {
        let player = self.state.players.get(&account).await.ok()??;
        
        // Get achievements
        let mut achievements = Vec::new();
        self.state.achievements.for_each_index_value(|(player_acc, _ach_id), achievement| {
            if player_acc == account {
                achievements.push(achievement.into_owned());
            }
            Ok(())
        }).await.unwrap_or_default();
        
        // Get recent games (last 10)
        let mut recent_games = Vec::new();
        self.state.game_history.for_each_index_value(|(player_acc, _game_id), game_result| {
            if player_acc == account {
                recent_games.push(game_result.into_owned());
            }
            Ok(())
        }).await.unwrap_or_default();
        recent_games.sort_by(|a, b| b.played_at.cmp(&a.played_at));
        recent_games.truncate(10);
        
        Some(PlayerStats {
            account: player.account,
            name: player.name,
            total_games_played: player.stats.games_played,
            total_wins: player.stats.games_won,
            total_earnings_usdc: player.total_earnings_usdc,
            current_tier: player.tier,
            achievements_unlocked: achievements,
            recent_games,
        })
    }

    /// Get all achievements for a player
    async fn player_achievements(&self, account: String) -> Vec<Achievement> {
        let mut achievements = Vec::new();
        self.state.achievements.for_each_index_value(|(player_acc, _ach_id), achievement| {
            if player_acc == account {
                achievements.push(achievement.into_owned());
            }
            Ok(())
        }).await.unwrap_or_default();
        achievements
    }

    /// Get game history for a player
    async fn player_game_history(&self, account: String, limit: Option<i32>, offset: Option<i32>) -> Vec<GameResult> {
        let limit = limit.unwrap_or(20) as usize;
        let offset = offset.unwrap_or(0) as usize;
        
        let mut games = Vec::new();
        self.state.game_history.for_each_index_value(|(player_acc, _game_id), game_result| {
            if player_acc == account {
                games.push(game_result.into_owned());
            }
            Ok(())
        }).await.unwrap_or_default();
        
        games.sort_by(|a, b| b.played_at.cmp(&a.played_at));
        games.into_iter().skip(offset).take(limit).collect()
    }

    /// Get global leaderboard
    async fn leaderboard(&self, tier_filter: Option<PlayerTier>, limit: Option<i32>) -> Vec<LeaderboardEntry> {
        let limit = limit.unwrap_or(100) as usize;
        
        let mut players = Vec::new();
        self.state.players.for_each_index_value(|_key, player| {
            players.push(player.into_owned());
            Ok(())
        }).await.unwrap_or_default();
        
        // Filter by tier
        if let Some(tier) = tier_filter {
            players.retain(|p| p.tier == tier);
        }
        
        // Sort by earnings (primary) and win rate (secondary)
        players.sort_by(|a, b| {
            let cmp = b.total_earnings_usdc.cmp(&a.total_earnings_usdc);
            if cmp == std::cmp::Ordering::Equal {
                let a_win_rate = if a.stats.games_played > 0 {
                    a.stats.games_won as f64 / a.stats.games_played as f64
                } else {
                    0.0
                };
                let b_win_rate = if b.stats.games_played > 0 {
                    b.stats.games_won as f64 / b.stats.games_played as f64
                } else {
                    0.0
                };
                b_win_rate.partial_cmp(&a_win_rate).unwrap_or(std::cmp::Ordering::Equal)
            } else {
                cmp
            }
        });
        
        // Convert to leaderboard entries
        players.into_iter().take(limit).enumerate().map(|(idx, player)| {
            let win_rate = if player.stats.games_played > 0 {
                ((player.stats.games_won as f64 / player.stats.games_played as f64) * 100.0) as i32
            } else {
                0
            };
            LeaderboardEntry {
                rank: (idx + 1) as i32,
                player_account: player.account,
                player_name: player.name,
                total_games_played: player.stats.games_played as i32,
                total_wins: player.stats.games_won as i32,
                win_rate,
                total_earnings_usdc: player.total_earnings_usdc,
                current_tier: player.tier,
            }
        }).collect()
    }
}

#[derive(SimpleObject)]
struct PlayerStats {
    account: String,
    name: String,
    total_games_played: u32,
    total_wins: u32,
    total_earnings_usdc: u64,
    current_tier: PlayerTier,
    achievements_unlocked: Vec<Achievement>,
    recent_games: Vec<GameResult>,
}

#[derive(SimpleObject)]
struct LeaderboardEntry {
    rank: i32,
    player_account: String,
    player_name: String,
    total_games_played: i32,
    total_wins: i32,
    win_rate: i32,
    total_earnings_usdc: u64,
    current_tier: PlayerTier,
}
