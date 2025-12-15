/*!
# Traditional Leagues Service

Provides GraphQL interface for traditional league tournament management.
*/

#![cfg_attr(target_arch = "wasm32", no_main)]

mod state;

use std::sync::Arc;

use async_graphql::{Context, EmptySubscription, Object, Request, Response, Schema};
use traditional_leagues::{
    TraditionalLeaguesAbi, Tournament, TournamentStatus, TournamentType,
    TournamentPortfolio, LeaderboardEntry, ScoringEngine, PriceData,
};
use linera_sdk::{
    linera_base_types::WithServiceAbi,
    views::View,
    Service, ServiceRuntime,
};
use state::TraditionalLeaguesState;

pub struct TraditionalLeaguesService {
    state: Arc<TraditionalLeaguesState>,
    runtime: Arc<ServiceRuntime<Self>>,
}

linera_sdk::service!(TraditionalLeaguesService);

impl WithServiceAbi for TraditionalLeaguesService {
    type Abi = TraditionalLeaguesAbi;
}

impl Service for TraditionalLeaguesService {
    type Parameters = ();

    async fn new(runtime: ServiceRuntime<Self>) -> Self {
        let state = TraditionalLeaguesState::load(runtime.root_view_storage_context())
            .await
            .expect("Failed to load state");
        Self {
            state: Arc::new(state),
            runtime: Arc::new(runtime),
        }
    }

    async fn handle_query(&self, request: Request) -> Response {
        let schema = Schema::build(
            QueryRoot {
                state: self.state.clone(),
            },
            MutationRoot {
                runtime: self.runtime.clone(),
            },
            EmptySubscription,
        )
        .finish();
        schema.execute(request).await
    }
}

struct QueryRoot {
    state: Arc<TraditionalLeaguesState>,
}

#[Object]
impl QueryRoot {
    /// Get all tournaments
    async fn tournaments(&self) -> Vec<Tournament> {
        let mut tournaments = Vec::new();
        
        match self.state.tournaments.indices().await {
            Ok(indices) => {
                for tournament_id in indices {
                    if let Ok(Some(tournament)) = self.state.tournaments.get(&tournament_id).await {
                        tournaments.push(tournament);
                    }
                }
            }
            Err(e) => {
                log::error!("Failed to get tournament indices: {}", e);
            }
        }
        
        tournaments
    }

    /// Get tournament by ID
    async fn tournament(&self, id: String) -> Option<Tournament> {
        match self.state.tournaments.get(&id).await {
            Ok(tournament) => tournament,
            Err(e) => {
                log::error!("Failed to get tournament {}: {}", id, e);
                None
            }
        }
    }

    /// Get tournaments by status
    async fn tournaments_by_status(&self, status: TournamentStatus) -> Vec<Tournament> {
        let mut tournaments = Vec::new();
        
        match self.state.tournaments.indices().await {
            Ok(indices) => {
                for tournament_id in indices {
                    if let Ok(Some(tournament)) = self.state.tournaments.get(&tournament_id).await {
                        if tournament.status == status {
                            tournaments.push(tournament);
                        }
                    }
                }
            }
            Err(e) => {
                log::error!("Failed to get tournament indices: {}", e);
            }
        }
        
        tournaments
    }

    /// Get active tournaments (registration or in progress)
    async fn active_tournaments(&self) -> Vec<Tournament> {
        let mut tournaments = Vec::new();
        
        match self.state.tournaments.indices().await {
            Ok(indices) => {
                for tournament_id in indices {
                    if let Ok(Some(tournament)) = self.state.tournaments.get(&tournament_id).await {
                        if tournament.status == TournamentStatus::Registration 
                            || tournament.status == TournamentStatus::InProgress {
                            tournaments.push(tournament);
                        }
                    }
                }
            }
            Err(e) => {
                log::error!("Failed to get tournament indices: {}", e);
            }
        }
        
        tournaments
    }

    /// Get tournament participants
    async fn tournament_participants(&self, tournament_id: String) -> Vec<String> {
        match self.state.participants.get(&tournament_id).await {
            Ok(Some(participants)) => participants,
            Ok(None) => vec![],
            Err(e) => {
                log::error!("Failed to get participants for {}: {}", tournament_id, e);
                vec![]
            }
        }
    }

    /// Get tournament results/winners
    async fn tournament_results(&self, tournament_id: String) -> Vec<String> {
        match self.state.results.get(&tournament_id).await {
            Ok(Some(results)) => results,
            Ok(None) => vec![],
            Err(e) => {
                log::error!("Failed to get results for {}: {}", tournament_id, e);
                vec![]
            }
        }
    }

    /// Get player's portfolio for a tournament
    async fn player_portfolio(&self, tournament_id: String, player_account: String) -> Option<TournamentPortfolio> {
        let portfolio_key = format!("{}-{}", tournament_id, player_account);
        match self.state.portfolios.get(&portfolio_key).await {
            Ok(portfolio) => portfolio,
            Err(e) => {
                log::error!("Failed to get portfolio for key {}: {}", portfolio_key, e);
                None
            }
        }
    }

    /// Get tournament leaderboard (calculates live rankings)
    async fn tournament_leaderboard(&self, tournament_id: String) -> Vec<LeaderboardEntry> {
        // Get tournament
        let tournament = match self.state.tournaments.get(&tournament_id).await {
            Ok(Some(t)) => t,
            _ => return vec![],
        };

        // Get participants
        let participants = match self.state.participants.get(&tournament_id).await {
            Ok(Some(p)) => p,
            _ => return vec![],
        };

        // Collect portfolios
        let mut portfolios = Vec::new();
        for participant in participants {
            let portfolio_key = format!("{}-{}", tournament_id, participant);
            if let Ok(Some(portfolio)) = self.state.portfolios.get(&portfolio_key).await {
                portfolios.push((participant, portfolio));
            }
        }

        if portfolios.is_empty() {
            return vec![];
        }

        // Get price data
        let price_data = match (&tournament.start_prices, &tournament.end_prices) {
            (Some(start), Some(end)) => {
                // Calculate tournament duration in minutes
                let duration_minutes = if let (Some(started), Some(completed)) = (tournament.started_at, tournament.completed_at) {
                    ((completed - started) / 1_000_000) / 60 // Convert microseconds to minutes
                } else {
                    u64::MAX // Unknown duration, don't amplify
                };
                
                // Amplify returns 100x for short tournaments (< 30 minutes) for demo purposes
                let amplification_factor = if duration_minutes < 30 { 100 } else { 1 };
                
                let mut prices = Vec::new();
                for start_snap in start {
                    if let Some(end_snap) = end.iter().find(|e| e.crypto_id == start_snap.crypto_id) {
                        let percentage_change = if start_snap.price_usd > 0 {
                            let change = (end_snap.price_usd as i64) - (start_snap.price_usd as i64);
                            let base_change = ((change * 10000) / (start_snap.price_usd as i64)) as i32;
                            base_change * amplification_factor
                        } else {
                            0
                        };
                        
                        prices.push(PriceData {
                            symbol: start_snap.crypto_id.clone(),
                            start_price: start_snap.price_usd,
                            end_price: end_snap.price_usd,
                            percentage_change,
                        });
                    }
                }
                prices
            },
            _ => PriceData::get_mock_prices(),
        };

        let total_prize_pool = tournament.entry_fee_usdc * tournament.current_participants as u64;
        
        ScoringEngine::calculate_leaderboard(portfolios, &price_data, total_prize_pool)
    }
}

struct MutationRoot {
    runtime: Arc<ServiceRuntime<TraditionalLeaguesService>>,
}

#[Object]
impl MutationRoot {
    /// Create a new tournament (requires authentication)
    async fn create_tournament(
        &self,
        _context: &Context<'_>,
        name: String,
        entry_fee_usdc: String, // String to handle large numbers in GraphQL
        max_participants: i32,
        tournament_type: TournamentType,
        category: Option<String>,
    ) -> String {
        // Parse entry fee
        let entry_fee = match entry_fee_usdc.parse::<u64>() {
            Ok(fee) => fee,
            Err(_) => return "Invalid entry fee format".to_string(),
        };

        let operation = traditional_leagues::TraditionalLeaguesOperation::CreateTournament {
            name,
            entry_fee_usdc: entry_fee,
            max_participants: max_participants as u32,
            tournament_type,
            category: category.unwrap_or_else(|| "ALL_CATEGORIES".to_string()),
        };

        self.runtime.schedule_operation(&operation);
        // For now, return a success message since schedule_operation returns ()
        format!("Tournament creation scheduled")
    }

    /// Register for a tournament
    async fn register_for_tournament(
        &self,
        _context: &Context<'_>,
        tournament_id: String,
        player_account: String,
    ) -> String {
        let operation = traditional_leagues::TraditionalLeaguesOperation::RegisterForTournament {
            tournament_id: tournament_id.clone(),
            player_account,
        };

        self.runtime.schedule_operation(&operation);
        format!("Registration scheduled for tournament {}", tournament_id)
    }

    /// Submit portfolio for a tournament
    async fn submit_portfolio(
        &self,
        _context: &Context<'_>,
        tournament_id: String,
        crypto_picks: Vec<String>,
        strategy_notes: Option<String>,
    ) -> String {
        let portfolio = traditional_leagues::TournamentPortfolio {
            crypto_picks,
            strategy_notes,
        };

        let operation = traditional_leagues::TraditionalLeaguesOperation::SubmitPortfolio {
            tournament_id: tournament_id.clone(),
            portfolio,
        };

        self.runtime.schedule_operation(&operation);
        format!("Portfolio submission scheduled for tournament {}", tournament_id)
    }

    /// Submit portfolio for a specific player account (for seeding/testing)
    async fn submit_portfolio_for_account(
        &self,
        _context: &Context<'_>,
        tournament_id: String,
        player_account: String,
        crypto_picks: Vec<String>,
        strategy_notes: Option<String>,
    ) -> String {
        let portfolio = traditional_leagues::TournamentPortfolio {
            crypto_picks,
            strategy_notes,
        };

        let operation = traditional_leagues::TraditionalLeaguesOperation::SubmitPortfolioForAccount {
            tournament_id: tournament_id.clone(),
            player_account: player_account.clone(),
            portfolio,
        };

        self.runtime.schedule_operation(&operation);
        format!("Portfolio submission scheduled for {} in tournament {}", player_account, tournament_id)
    }

    /// Start tournament with initial price snapshot
    async fn start_tournament(
        &self,
        _context: &Context<'_>,
        tournament_id: String,
        start_prices: Vec<String>, // JSON array of {crypto_id, price_usd}
    ) -> String {
        // Parse price snapshots from string array
        let mut snapshots = Vec::new();
        for price_str in start_prices {
            if let Ok(parts) = serde_json::from_str::<serde_json::Value>(&price_str) {
                if let (Some(crypto_id), Some(price)) = (
                    parts.get("crypto_id").and_then(|v| v.as_str()),
                    parts.get("price_usd").and_then(|v| v.as_u64()),
                ) {
                    snapshots.push(traditional_leagues::PriceSnapshot {
                        crypto_id: crypto_id.to_string(),
                        price_usd: price,
                        timestamp: 0, // Will be set by contract
                    });
                }
            }
        }

        let operation = traditional_leagues::TraditionalLeaguesOperation::StartTournament {
            tournament_id: tournament_id.clone(),
            start_prices: snapshots,
        };

        self.runtime.schedule_operation(&operation);
        format!("Tournament {} start scheduled", tournament_id)
    }

    /// End tournament with final price snapshot
    async fn end_tournament(
        &self,
        _context: &Context<'_>,
        tournament_id: String,
        end_prices: Vec<String>, // JSON array of {crypto_id, price_usd}
    ) -> String {
        // Parse price snapshots
        let mut snapshots = Vec::new();
        for price_str in end_prices {
            if let Ok(parts) = serde_json::from_str::<serde_json::Value>(&price_str) {
                if let (Some(crypto_id), Some(price)) = (
                    parts.get("crypto_id").and_then(|v| v.as_str()),
                    parts.get("price_usd").and_then(|v| v.as_u64()),
                ) {
                    snapshots.push(traditional_leagues::PriceSnapshot {
                        crypto_id: crypto_id.to_string(),
                        price_usd: price,
                        timestamp: 0,
                    });
                }
            }
        }

        let operation = traditional_leagues::TraditionalLeaguesOperation::EndTournament {
            tournament_id: tournament_id.clone(),
            end_prices: snapshots,
        };

        self.runtime.schedule_operation(&operation);
        format!("Tournament {} end scheduled", tournament_id)
    }

    /// Complete tournament and calculate winners
    async fn complete_tournament(
        &self,
        _context: &Context<'_>,
        tournament_id: String,
    ) -> String {
        let operation = traditional_leagues::TraditionalLeaguesOperation::CompleteTournament {
            tournament_id: tournament_id.clone(),
        };

        self.runtime.schedule_operation(&operation);
        format!("Tournament {} completion scheduled", tournament_id)
    }
}