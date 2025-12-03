/*!
# Traditional Leagues Contract

Handles tournament creation, registration, and progression for traditional league games.
*/

#![cfg_attr(target_arch = "wasm32", no_main)]

mod state;

use traditional_leagues::{
    TraditionalLeaguesAbi, TraditionalLeaguesOperation, TraditionalLeaguesResponse,
    Tournament, TournamentStatus, TournamentType,
    PriceData, ScoringEngine,
    CoinDraftsMessage, TournamentPortfolio,
};
use linera_sdk::{

    linera_base_types::WithContractAbi,
    views::{RootView, View},
    Contract, ContractRuntime,
};
use state::TraditionalLeaguesState;

pub struct TraditionalLeaguesContract {
    state: TraditionalLeaguesState,
    runtime: ContractRuntime<Self>,
}

linera_sdk::contract!(TraditionalLeaguesContract);

impl WithContractAbi for TraditionalLeaguesContract {
    type Abi = TraditionalLeaguesAbi;
}

impl Contract for TraditionalLeaguesContract {
    type InstantiationArgument = ();
    type Parameters = ();
    type EventValue = ();
    type Message = CoinDraftsMessage;

    async fn load(runtime: ContractRuntime<Self>) -> Self {
        let state = TraditionalLeaguesState::load(runtime.root_view_storage_context())
            .await
            .expect("Failed to load state");
        Self { state, runtime }
    }

    async fn instantiate(&mut self, _argument: ()) {
        // Initialize the tournament counter
        self.state.tournament_counter.set(1);
    }

    async fn execute_operation(&mut self, operation: TraditionalLeaguesOperation) -> TraditionalLeaguesResponse {
        // Linera applications are reactive only - no background timers!
        // Tournament completion must be triggered by explicit operations or messages
        
        match operation {
            TraditionalLeaguesOperation::CreateTournament {
                name,
                entry_fee_usdc,
                max_participants,
                tournament_type,
                category,
            } => self.create_tournament(name, entry_fee_usdc, max_participants, tournament_type, category).await,

            TraditionalLeaguesOperation::RegisterForTournament {
                tournament_id,
                player_account,
            } => self.register_for_tournament(tournament_id, player_account).await,

            TraditionalLeaguesOperation::SubmitPortfolio {
                tournament_id,
                round,
                portfolio,
            } => self.submit_portfolio(tournament_id, round, portfolio).await,

            TraditionalLeaguesOperation::StartTournament {
                tournament_id,
                start_prices,
            } => self.start_tournament(tournament_id, start_prices).await,

            TraditionalLeaguesOperation::EndTournament {
                tournament_id,
                end_prices,
            } => self.end_tournament(tournament_id, end_prices).await,

            TraditionalLeaguesOperation::AdvanceRound { tournament_id } => {
                self.advance_round(tournament_id).await
            }

            TraditionalLeaguesOperation::CompleteTournament { tournament_id } => {
                self.complete_tournament(tournament_id).await
            }

            TraditionalLeaguesOperation::CheckExpiredTournaments => {
                self.check_expired_tournaments_reactive().await
            }
        }
    }

    async fn execute_message(&mut self, message: CoinDraftsMessage) {
        match message {
            CoinDraftsMessage::CreateTournament { game_id, tournament_name, entry_fee_usdc, max_participants } => {
                // Handle tournament creation request from CoinDrafts Core
                log::info!("Creating tournament: {} for game {}", tournament_name, game_id);
                
                // Create tournament using existing method
                let response = self.create_tournament(
                    tournament_name.clone(),
                    entry_fee_usdc,
                    max_participants,
                    TournamentType::SingleElimination, // Default for now
                    "ALL_CATEGORIES".to_string(), // Default category
                ).await;
                
                // Extract tournament_id from response
                if let TraditionalLeaguesResponse::TournamentCreated { tournament_id } = response {
                    // Get tournament details to send back
                    if let Ok(Some(_tournament)) = self.state.tournaments.get(&tournament_id).await {
                        // Send confirmation back to CoinDrafts Core
                        let origin_chain_id = self.runtime.message_origin_chain_id()
                            .expect("Message origin should be available when executing a message");
                            
                        let confirmation_message = CoinDraftsMessage::CreateTournament {
                            game_id: game_id.clone(),
                            tournament_name: format!("Tournament {} created", tournament_id),
                            entry_fee_usdc: entry_fee_usdc,
                            max_participants: max_participants,
                        };
                        
                        self.runtime
                            .prepare_message(confirmation_message)
                            .with_authentication()
                            .send_to(origin_chain_id);
                    }
                }
            }
            
            CoinDraftsMessage::RegisterPlayerForTournament { game_id, tournament_id, player_profile } => {
                // Handle player registration request from CoinDrafts Core
                log::info!("Registering player {} for tournament {} in game {}", 
                          player_profile, tournament_id, game_id);
                
                // Register player using existing method
                let response = self.register_for_tournament(
                    tournament_id.clone(),
                    player_profile,
                ).await;
                
                // Could send back confirmation if needed
                log::info!("Player registration result: {:?}", response);
            }
            
            CoinDraftsMessage::SyncPortfolio { game_id, tournament_id, portfolio } => {
                // Handle portfolio sync from CoinDrafts Core
                log::info!("Syncing portfolio for tournament {} in game {} with portfolio: {}", tournament_id, game_id, portfolio);
                
                // Create a default tournament portfolio since portfolio is a JSON string
                // TODO: Parse JSON portfolio string for real implementation
                let tournament_portfolio = TournamentPortfolio {
                    crypto_picks: vec![
                        "BTC".to_string(),
                        "ETH".to_string(),
                        "SOL".to_string(),
                        "ADA".to_string(),
                        "DOT".to_string(),
                    ],
                    strategy_notes: Some(format!("Portfolio synced from game {}", game_id)),
                };
                
                // Submit portfolio using existing method
                let response = self.submit_portfolio(
                    tournament_id,
                    1, // Default to round 1 for now
                    tournament_portfolio,
                ).await;
                
                log::info!("Portfolio submission result: {:?}", response);
            }
            
            CoinDraftsMessage::GetTournamentStatus { tournament_id } => {
                // Handle tournament status request
                log::info!("Getting status for tournament {}", tournament_id);
                
                // Could send back status update if needed
                // For now, just log the request
            }
            
            CoinDraftsMessage::VerifyPlayer { game_id: _, player_account: _, tournament_id: _, verified: _ } => {
                // This message type seems wrong - Traditional Leagues should be sending verification requests, not receiving them
                log::warn!("Received unexpected VerifyPlayer message - this should be sent BY Traditional Leagues");
            }
        }
    }

    async fn store(mut self) {
        self.state.save().await.expect("Failed to save state");
    }
}

impl TraditionalLeaguesContract {
    async fn create_tournament(
        &mut self,
        name: String,
        entry_fee_usdc: u64,
        max_participants: u32,
        tournament_type: TournamentType,
        category: String,
    ) -> TraditionalLeaguesResponse {
        let tournament_id = self.state.generate_tournament_id().await;
        let timestamp = self.runtime.system_time();
        
        let max_rounds = match tournament_type {
            TournamentType::SingleElimination => (max_participants as f64).log2().ceil() as u32,
            TournamentType::DoubleElimination => ((max_participants as f64).log2().ceil() as u32) * 2,
            TournamentType::RoundRobin => max_participants - 1,
            TournamentType::Swiss => (max_participants as f64).log2().ceil() as u32,
        };

        let tournament = Tournament {
            id: tournament_id.clone(),
            name: name.clone(),
            tournament_type,
            status: TournamentStatus::Registration,
            entry_fee_usdc,
            max_participants,
            current_participants: 0,
            current_round: 0,
            max_rounds,
            created_at: timestamp.micros(),
            started_at: None,
            completed_at: None,
            category: category.clone(),
            start_prices: None,
            end_prices: None,
        };

        // Store tournament
        if let Err(_e) = self.state.tournaments.insert(&tournament_id, tournament.clone()) {
            return TraditionalLeaguesResponse::TournamentCreated {
                tournament_id: "error".to_string(),
            };
        }

        // Tournament created successfully

        TraditionalLeaguesResponse::TournamentCreated { tournament_id }
    }

    async fn register_for_tournament(
        &mut self,
        tournament_id: String,
        player_account: String,
    ) -> TraditionalLeaguesResponse {
        // Check if tournament exists and is accepting registrations
        match self.state.tournaments.get(&tournament_id).await {
            Ok(Some(mut tournament)) if tournament.status == TournamentStatus::Registration => {
                // Check if tournament is full
                match self.state.is_tournament_full(&tournament_id).await {
                    Ok(false) => {
                        // Add participant
                        if let Err(_e) = self.state.add_participant(&tournament_id, player_account).await {
                            return TraditionalLeaguesResponse::PlayerRegistered { success: false };
                        }
                        
                        // Update tournament current_participants count
                        tournament.current_participants += 1;
                        if let Err(_e) = self.state.tournaments.insert(&tournament_id, tournament.clone()) {
                            return TraditionalLeaguesResponse::PlayerRegistered { success: false };
                        }
                        
                        // Check if we now have minimum players to start (2 players minimum)
                        if let Ok(Some(participants)) = self.state.participants.get(&tournament_id).await {
                            if participants.len() >= 2 {
                                // Auto-start tournament with first round
                                let _ = self.advance_round(tournament_id.clone()).await;
                            }
                        }
                        
                        TraditionalLeaguesResponse::PlayerRegistered { success: true }
                    }
                    Ok(true) => {
                        TraditionalLeaguesResponse::PlayerRegistered { success: false }
                    }
                    Err(_e) => {
                        TraditionalLeaguesResponse::PlayerRegistered { success: false }
                    }
                }
            }
            Ok(Some(_)) => {
                TraditionalLeaguesResponse::PlayerRegistered { success: false }
            }
            Ok(None) => {
                TraditionalLeaguesResponse::PlayerRegistered { success: false }
            }
            Err(_e) => {
                TraditionalLeaguesResponse::PlayerRegistered { success: false }
            }
        }
    }

    async fn submit_portfolio(
        &mut self,
        tournament_id: String,
        round: u32,
        portfolio: traditional_leagues::TournamentPortfolio,
    ) -> TraditionalLeaguesResponse {
        let portfolio_key = format!("{}-{}-{}", tournament_id, round, self.runtime.authenticated_signer().unwrap());
        
        if let Err(_e) = self.state.portfolios.insert(&portfolio_key, portfolio) {
            return TraditionalLeaguesResponse::PortfolioSubmitted { success: false };
        }

        TraditionalLeaguesResponse::PortfolioSubmitted { success: true }
    }

    async fn advance_round(&mut self, tournament_id: String) -> TraditionalLeaguesResponse {
        match self.state.tournaments.get(&tournament_id).await {
            Ok(Some(mut tournament)) => {
                tournament.current_round += 1;
                
                if tournament.current_round == 1 {
                    // Update status to InProgress
                    tournament.status = TournamentStatus::InProgress;
                    tournament.started_at = Some(self.runtime.system_time().micros());
                }

                if let Err(_e) = self.state.tournaments.insert(&tournament_id, tournament.clone()) {
                    return TraditionalLeaguesResponse::RoundAdvanced { new_round: 0 };
                }

                TraditionalLeaguesResponse::RoundAdvanced {
                    new_round: tournament.current_round,
                }
            }
            _ => TraditionalLeaguesResponse::RoundAdvanced { new_round: 0 },
        }
    }

    async fn complete_tournament(&mut self, tournament_id: String) -> TraditionalLeaguesResponse {
        match self.state.tournaments.get(&tournament_id).await {
            Ok(Some(mut tournament)) => {
                // Check if tournament should be completed (10 minutes elapsed since start)
                let current_time = self.runtime.system_time().micros();
                let tournament_duration_micros = 10 * 60 * 1_000_000; // 10 minutes in microseconds
                
                let should_complete = match tournament.started_at {
                    Some(start_time) => {
                        // Auto-complete if 10 minutes have passed since start
                        current_time >= start_time + tournament_duration_micros
                    }
                    None => {
                        // Tournament hasn't started yet, can't complete
                        false
                    }
                };

                // Only complete if tournament is in progress and time has elapsed
                if tournament.status != TournamentStatus::InProgress || !should_complete {
                    return TraditionalLeaguesResponse::TournamentCompleted { winners: vec![] };
                }

                // Update status to Completed
                tournament.status = TournamentStatus::Completed;
                tournament.completed_at = Some(current_time);

                // Calculate tournament winners using scoring engine
                let winners = self.calculate_tournament_winners(&tournament_id).await;

                // Store updated tournament
                if let Err(_e) = self.state.tournaments.insert(&tournament_id, tournament) {
                    return TraditionalLeaguesResponse::TournamentCompleted { winners: vec![] };
                }

                // Store results
                if let Err(_e) = self.state.results.insert(&tournament_id, winners.clone()) {
                    // Continue even if results storage fails  
                }

                // Tournament completed successfully
                TraditionalLeaguesResponse::TournamentCompleted { winners }
            }
            _ => TraditionalLeaguesResponse::TournamentCompleted { winners: vec![] },
        }
    }

    /// Reactive alternative to background timers - check for expired tournaments
    /// Must be triggered explicitly by users/frontend or scheduled operations
    async fn check_expired_tournaments_reactive(&mut self) -> TraditionalLeaguesResponse {
        let mut completed_tournaments = Vec::new();
        let current_time = self.runtime.system_time().micros();
        let tournament_duration_micros = 10 * 60 * 1_000_000; // 10 minutes in microseconds

        // Check all tournaments for expiration using proper Linera MapView iteration
        let mut tournaments_to_complete = Vec::new();
        
        if let Err(_) = self.state.tournaments.for_each_index_value(|tournament_id, tournament| {
            // Check if tournament is in progress and has expired
            if tournament.status == TournamentStatus::InProgress {
                if let Some(start_time) = tournament.started_at {
                    if current_time >= start_time + tournament_duration_micros {
                        // Tournament has expired, mark for completion
                        tournaments_to_complete.push(tournament_id.clone());
                    }
                }
            }
            Ok(())
        }).await {
            return TraditionalLeaguesResponse::ExpiredTournamentsChecked { 
                completed_tournaments: vec![] 
            };
        }

        // Complete expired tournaments
        for tournament_id in tournaments_to_complete {
            let response = self.complete_tournament(tournament_id.clone()).await;
            if let TraditionalLeaguesResponse::TournamentCompleted { winners } = response {
                if !winners.is_empty() {
                    completed_tournaments.push(tournament_id);
                }
            }
        }

        TraditionalLeaguesResponse::ExpiredTournamentsChecked { completed_tournaments }
    }

    /// Calculate tournament winners using portfolio performance scoring
    async fn calculate_tournament_winners(&mut self, tournament_id: &str) -> Vec<String> {
        // Get tournament participants to collect their portfolios
        let participants = match self.state.participants.get(tournament_id).await {
            Ok(Some(participants)) => participants,
            _ => return vec![], // No participants
        };

        // Get the tournament to know which round to check
        let tournament = match self.state.tournaments.get(tournament_id).await {
            Ok(Some(tournament)) => tournament,
            _ => return vec![], // Tournament not found
        };

        // Collect portfolios from all participants for the current round
        let mut portfolio_vec: Vec<(String, traditional_leagues::TournamentPortfolio)> = Vec::new();
        
        for participant in participants {
            let portfolio_key = format!("{}-{}-{}", tournament_id, tournament.current_round, participant);
            if let Ok(Some(portfolio)) = self.state.portfolios.get(&portfolio_key).await {
                portfolio_vec.push((participant, portfolio));
            }
        }

        if portfolio_vec.is_empty() {
            return vec![];
        }

        // Get tournament info for prize pool calculation and price snapshots
        let tournament = match self.state.tournaments.get(tournament_id).await {
            Ok(Some(tournament)) => tournament,
            _ => return vec![],
        };

        // Build price data from tournament snapshots instead of mock prices
        let price_data = match (&tournament.start_prices, &tournament.end_prices) {
            (Some(start_prices), Some(end_prices)) => {
                // Create PriceData from real snapshots
                let mut prices = Vec::new();
                for start_snap in start_prices {
                    if let Some(end_snap) = end_prices.iter().find(|e| e.crypto_id == start_snap.crypto_id) {
                        // Calculate percentage change: ((end - start) / start) * 10000
                        let percentage_change = if start_snap.price_usd > 0 {
                            let change = (end_snap.price_usd as i64) - (start_snap.price_usd as i64);
                            ((change * 10000) / (start_snap.price_usd as i64)) as i32
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
            _ => {
                // Fallback to mock prices if snapshots not available (shouldn't happen in production)
                log::warn!("Tournament {} missing price snapshots, using mock data", tournament_id);
                PriceData::get_mock_prices()
            }
        };

        let total_prize_pool = tournament.entry_fee_usdc * tournament.current_participants as u64;

        // Calculate leaderboard using scoring engine
        let leaderboard = ScoringEngine::calculate_leaderboard(
            portfolio_vec,
            &price_data,
            total_prize_pool,
        );

        // Return top 3 winners (or all players if less than 3)
        leaderboard
            .into_iter()
            .take(3)
            .map(|entry| entry.player_account)
            .collect()
    }

    /// Start tournament with price snapshot
    async fn start_tournament(
        &mut self,
        tournament_id: String,
        start_prices: Vec<traditional_leagues::PriceSnapshot>,
    ) -> TraditionalLeaguesResponse {
        // Get tournament
        let mut tournament = match self.state.tournaments.get(&tournament_id).await {
            Ok(Some(tournament)) => tournament,
            _ => {
                log::error!("Tournament {} not found", tournament_id);
                return TraditionalLeaguesResponse::TournamentStarted {
                    success: false,
                    timestamp: 0,
                };
            }
        };

        // Update tournament status
        let timestamp = self.runtime.system_time().micros();
        tournament.status = TournamentStatus::InProgress;
        tournament.started_at = Some(timestamp);
        tournament.start_prices = Some(start_prices);

        // Save tournament
        self.state
            .tournaments
            .insert(&tournament_id, tournament)
            .expect("Failed to update tournament");

        log::info!("Tournament {} started at {}", tournament_id, timestamp);

        TraditionalLeaguesResponse::TournamentStarted {
            success: true,
            timestamp,
        }
    }

    /// End tournament with final price snapshot and calculate winners
    async fn end_tournament(
        &mut self,
        tournament_id: String,
        end_prices: Vec<traditional_leagues::PriceSnapshot>,
    ) -> TraditionalLeaguesResponse {
        // Get tournament
        let mut tournament = match self.state.tournaments.get(&tournament_id).await {
            Ok(Some(tournament)) => tournament,
            _ => {
                log::error!("Tournament {} not found", tournament_id);
                return TraditionalLeaguesResponse::TournamentEnded {
                    success: false,
                    winners: vec![],
                };
            }
        };

        // Update tournament status
        let timestamp = self.runtime.system_time().micros();
        tournament.status = TournamentStatus::Completed;
        tournament.completed_at = Some(timestamp);
        tournament.end_prices = Some(end_prices);

        // Save tournament
        self.state
            .tournaments
            .insert(&tournament_id, tournament)
            .expect("Failed to update tournament");

        // Calculate winners
        let winners = self.calculate_tournament_winners(&tournament_id).await;

        log::info!(
            "Tournament {} ended at {} with {} winners",
            tournament_id,
            timestamp,
            winners.len()
        );

        TraditionalLeaguesResponse::TournamentEnded { success: true, winners }
    }
}