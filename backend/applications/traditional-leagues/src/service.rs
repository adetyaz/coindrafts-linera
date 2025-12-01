/*!
# Traditional Leagues Service

Provides GraphQL interface for traditional league tournament management.
*/

#![cfg_attr(target_arch = "wasm32", no_main)]

mod state;

use std::sync::Arc;

use async_graphql::{Context, EmptySubscription, Object, Request, Response, Schema};
use traditional_leagues::{TraditionalLeaguesAbi, Tournament, TournamentStatus, TournamentType};
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
            category: "ALL_CATEGORIES".to_string(),
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
        // For now, return a success message since schedule_operation returns ()
        format!("Registration scheduled for tournament {}", tournament_id)
    }
}