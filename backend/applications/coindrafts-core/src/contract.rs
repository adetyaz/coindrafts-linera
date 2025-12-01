/*!
# CoinDrafts Core Contract

Main contract logic for the CoinDrafts orchestration hub.
Handles game creation, player registration, and portfolio submissions.
*/

#![cfg_attr(target_arch = "wasm32", no_main)]

mod state;

use coindrafts_core::{CoinDraftsAbi, CoinDraftsOperation, Game, PlayerProfile, PlayerStats, PlayerTier, Portfolio, PortfolioStatus, CryptoHolding, GameMode, GameStatus, TraditionalLeaguesMessage, PriceSnapshot};
use self::state::CoinDraftsState;
use linera_sdk::{
    linera_base_types::WithContractAbi,
    views::View,
    Contract, ContractRuntime,
};
use log;

pub struct CoinDraftsContract {
    state: CoinDraftsState,
    runtime: ContractRuntime<Self>,
}

linera_sdk::contract!(CoinDraftsContract);

impl WithContractAbi for CoinDraftsContract {
    type Abi = CoinDraftsAbi;
}

impl Contract for CoinDraftsContract {
    type Message = TraditionalLeaguesMessage;
    type InstantiationArgument = ();
    type Parameters = ();
    type EventValue = ();

    async fn load(runtime: ContractRuntime<Self>) -> Self {
        let state = CoinDraftsState::load(runtime.root_view_storage_context())
            .await
            .expect("Failed to load state");
        CoinDraftsContract { state, runtime }
    }

    async fn instantiate(&mut self, _argument: ()) {
        self.state.game_counter.set(1);
    }

    async fn execute_operation(&mut self, operation: CoinDraftsOperation) -> () {
        match operation {
            CoinDraftsOperation::CreateGame { mode } => {
                let game_id = format!("game_{}", *self.state.game_counter.get());
                let timestamp = self.runtime.system_time().micros();
                
                let max_players = match mode {
                    GameMode::TraditionalLeague => 100,
                    GameMode::QuickMatch => 50,
                    GameMode::PricePrediction => 200,
                };

                let game = Game {
                    game_id: game_id.clone(),
                    mode,
                    status: GameStatus::WaitingForPlayers,
                    created_at: timestamp,
                    player_count: 0,
                    max_players,
                };

                self.state.games.insert(&game_id, game).expect("Failed to create game");
                self.state.game_counter.set(*self.state.game_counter.get() + 1);

                // If it's a Traditional League game, send message to create tournament using official Linera pattern
                if mode == GameMode::TraditionalLeague {
                    let tournament_message = TraditionalLeaguesMessage::TournamentCreated {
                        game_id: game_id.clone(),
                        tournament_id: format!("tournament_{}", game_id),
                        tournament_info: format!("Tournament for Game {}", game_id),
                    };
                    
                    // Get the chain ID where Traditional Leagues is deployed (using creator chain for now)
                    let traditional_leagues_chain_id = self.runtime.application_creator_chain_id();
                    
                    // Send message using the official Linera pattern
                    self.runtime
                        .prepare_message(tournament_message)
                        .with_authentication()
                        .send_to(traditional_leagues_chain_id);
                    
                    // Tournament creation message sent
                }
            },

            CoinDraftsOperation::RegisterPlayer { game_id, player_name } => {
                let account_str = self.runtime.authenticated_signer()
                    .map(|a| a.to_string())
                    .unwrap_or_else(|| "unknown".to_string());
                let timestamp = self.runtime.system_time().micros();

                let player = PlayerProfile {
                    name: player_name,
                    account: account_str.clone(),
                    registered_at: timestamp,
                    stats: PlayerStats {
                        games_played: 0,
                        games_won: 0,
                        top_10_finishes: 0,
                        avg_performance: 0,
                        best_performance: 0,
                        current_streak: 0,
                        longest_streak: 0,
                        accuracy_score: 0,
                    },
                    tier: PlayerTier::Rookie,
                    total_earnings_usdc: 0,
                };

                self.state.players.insert(&account_str, player).expect("Failed to register player");

                // Update game player count
                if let Ok(Some(mut game)) = self.state.games.get(&game_id).await {
                    game.player_count += 1;
                    self.state.games.insert(&game_id, game).expect("Failed to update game");
                }
            },

            CoinDraftsOperation::SubmitPortfolio { game_id, cryptocurrencies } => {
                let account_str = self.runtime.authenticated_signer()
                    .map(|a| a.to_string())
                    .unwrap_or_else(|| "unknown".to_string());
                let timestamp = self.runtime.system_time().micros();

                // Convert cryptocurrencies to CryptoHolding with equal allocation
                let equal_allocation = 100u8 / cryptocurrencies.len() as u8;
                let holdings: Vec<CryptoHolding> = cryptocurrencies.into_iter().map(|symbol| {
                    CryptoHolding {
                        symbol,
                        allocation_percent: equal_allocation,
                    }
                }).collect();

                let portfolio = Portfolio {
                    game_id: game_id.clone(),
                    player_account: account_str,
                    holdings,
                    submitted_at: timestamp,
                    status: PortfolioStatus::Valid,
                };

                // Get existing portfolios for this game or create new vec
                let mut portfolios = self.state.portfolios.get(&game_id)
                    .await
                    .unwrap_or_default()
                    .unwrap_or_default();
                
                portfolios.push(portfolio);
                
                self.state.portfolios.insert(&game_id, portfolios)
                    .expect("Failed to submit portfolio");
            },

            CoinDraftsOperation::StartGame { game_id, price_snapshot } => {
                // Record starting prices for the game
                if let Ok(Some(mut game)) = self.state.games.get(&game_id).await {
                    // Store price snapshot in a separate collection or game field
                    // For now, update game status to Active
                    game.status = GameStatus::Active;
                    self.state.games.insert(&game_id, game).expect("Failed to update game");
                    
                    // TODO: Store price_snapshot in state for later scoring
                    log::info!("Game {} started with {} price snapshots", game_id, price_snapshot.len());
                }
            },

            CoinDraftsOperation::EndGame { game_id, price_snapshot } => {
                // Record ending prices and calculate winners
                if let Ok(Some(mut game)) = self.state.games.get(&game_id).await {
                    // Store ending price snapshot
                    // For now, update game status to Completed
                    game.status = GameStatus::Completed;
                    self.state.games.insert(&game_id, game).expect("Failed to update game");
                    
                    // TODO: Calculate winners based on start and end price snapshots
                    // TODO: Distribute prizes to winners
                    log::info!("Game {} ended with {} price snapshots", game_id, price_snapshot.len());
                }
            },
        }
    }

    async fn store(mut self) {
        use linera_sdk::views::RootView;
        self.state.save().await.expect("Failed to save state");
    }

    async fn execute_message(&mut self, message: TraditionalLeaguesMessage) {
        // Handle incoming messages FROM Traditional Leagues application
        // Following proper Linera message flow patterns
        match message {
            TraditionalLeaguesMessage::TournamentCreated { game_id, tournament_id, tournament_info } => {
                // Handle tournament creation confirmation from Traditional Leagues
                log::info!("Tournament {} created for game {}: {}", tournament_id, game_id, tournament_info);
                
                // Update game status to reflect tournament is ready
                if let Ok(Some(mut game)) = self.state.games.get(&game_id).await {
                    game.status = GameStatus::Active;
                    let _ = self.state.games.insert(&game_id, game);
                }
            }
            
            TraditionalLeaguesMessage::TournamentCompleted { game_id, tournament_id, winners, total_prize_pool } => {
                // Handle tournament completion notification
                log::info!("Tournament {} completed for game {} with {} winners, prize pool: {}", 
                          tournament_id, game_id, winners.len(), total_prize_pool);
                
                // Update game status to completed
                if let Ok(Some(mut game)) = self.state.games.get(&game_id).await {
                    game.status = GameStatus::Completed;
                    let _ = self.state.games.insert(&game_id, game);
                }
                
                // Update player stats for winners (simple distribution)
                let prize_per_winner = if !winners.is_empty() { total_prize_pool / winners.len() as u64 } else { 0 };
                for winner in winners {
                    if let Ok(Some(mut player)) = self.state.players.get(&winner).await {
                        player.stats.games_won += 1;
                        player.stats.games_played += 1;
                        player.total_earnings_usdc += prize_per_winner;
                        let _ = self.state.players.insert(&winner, player);
                    }
                }
            }
            
            TraditionalLeaguesMessage::PlayerVerified { game_id, player_account, verified } => {
                // Handle player verification response from Traditional Leagues
                log::info!("Player {} verification for game {}: {}", player_account, game_id, verified);
                
                // Update player status based on verification
                if verified {
                    if let Ok(Some(player)) = self.state.players.get(&player_account).await {
                        // Could add verification status to player profile
                        let _ = self.state.players.insert(&player_account, player);
                    }
                }
            }
            
            TraditionalLeaguesMessage::TournamentStatusUpdate { tournament_id, status, current_round } => {
                // Handle tournament status updates from Traditional Leagues
                log::info!("Tournament {} status update: {} (round {})", tournament_id, status, current_round);
                
                // Could update local game state based on tournament progress
                // For now, just acknowledge the status update
            }
        }
    }
}