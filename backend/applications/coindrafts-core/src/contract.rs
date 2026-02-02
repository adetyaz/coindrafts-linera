/*!
# CoinDrafts Core Contract

Main contract logic for the CoinDrafts orchestration hub.
Handles game creation, player registration, and portfolio submissions.
*/

#![cfg_attr(target_arch = "wasm32", no_main)]

mod state;

use coindrafts_core::{Achievement, AchievementType, CoinDraftsAbi, CoinDraftsOperation, Game, GameResult, PlayerProfile, PlayerStats, PlayerTier, Portfolio, PortfolioStatus, CryptoHolding, GameMode, GameStatus, TraditionalLeaguesMessage, PriceSnapshot};
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
            CoinDraftsOperation::CreateGame { mode, name, max_players, entry_fee_usdc, duration_hours } => {
                let game_id = format!("game_{}", *self.state.game_counter.get());
                let timestamp = self.runtime.system_time().micros();

                let game = Game {
                    game_id: game_id.clone(),
                    name,
                    mode,
                    status: GameStatus::WaitingForPlayers,
                    created_at: timestamp,
                    player_count: 0,
                    max_players,
                    entry_fee_usdc,
                    duration_hours,
                    start_prices: None,
                    winners: Vec::new(),
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

            CoinDraftsOperation::RegisterPlayerWithAccount { game_id, player_name, player_account } => {
                let timestamp = self.runtime.system_time().micros();

                let player = PlayerProfile {
                    name: player_name,
                    account: player_account.clone(),
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

                self.state.players.insert(&player_account, player).expect("Failed to register player");

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

                // Convert cryptocurrencies (IDs like "bitcoin") to CryptoHolding with equal allocation
                let equal_allocation = 100u8 / cryptocurrencies.len() as u8;
                let holdings: Vec<CryptoHolding> = cryptocurrencies.into_iter().map(|crypto_id| {
                    CryptoHolding {
                        symbol: crypto_id,  // Store crypto ID (e.g., "bitcoin") to match price snapshots
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
                
                // Remove any existing portfolio from this player (prevent duplicates)
                portfolios.retain(|p| p.player_account != portfolio.player_account);
                
                portfolios.push(portfolio);
                
                self.state.portfolios.insert(&game_id, portfolios)
                    .expect("Failed to submit portfolio");
            },

            CoinDraftsOperation::SubmitPortfolioForAccount { game_id, player_account, cryptocurrencies } => {
                let timestamp = self.runtime.system_time().micros();

                // Convert cryptocurrencies (IDs like "bitcoin") to CryptoHolding with equal allocation
                let equal_allocation = 100u8 / cryptocurrencies.len() as u8;
                let holdings: Vec<CryptoHolding> = cryptocurrencies.into_iter().map(|crypto_id| {
                    CryptoHolding {
                        symbol: crypto_id,  // Store crypto ID (e.g., "bitcoin") to match price snapshots
                        allocation_percent: equal_allocation,
                    }
                }).collect();

                let portfolio = Portfolio {
                    game_id: game_id.clone(),
                    player_account,
                    holdings,
                    submitted_at: timestamp,
                    status: PortfolioStatus::Valid,
                };

                // Get existing portfolios for this game or create new vec
                let mut portfolios = self.state.portfolios.get(&game_id)
                    .await
                    .unwrap_or_default()
                    .unwrap_or_default();
                
                // Remove any existing portfolio from this player (prevent duplicates)
                portfolios.retain(|p| p.player_account != portfolio.player_account);
                
                portfolios.push(portfolio);
                
                self.state.portfolios.insert(&game_id, portfolios)
                    .expect("Failed to submit portfolio");
            },

            CoinDraftsOperation::StartGame { game_id, price_snapshot } => {
                // Record starting prices for the game
                if let Ok(Some(mut game)) = self.state.games.get(&game_id).await {
                    game.status = GameStatus::Active;
                    game.start_prices = Some(price_snapshot.clone());
                    self.state.games.insert(&game_id, game).expect("Failed to update game");
                    log::info!("Game {} started with {} price snapshots stored", game_id, price_snapshot.len());
                }
            },

            CoinDraftsOperation::EndGame { game_id, price_snapshot } => {
                // Record ending prices and calculate winners
                if let Ok(Some(mut game)) = self.state.games.get(&game_id).await {
                    // Can only end an active game that has been started
                    if game.status != GameStatus::Active {
                        log::warn!("Cannot end game {} - status is {:?}, not Active", game_id, game.status);
                        return;
                    }
                    
                    // Must have start prices to calculate returns
                    if game.start_prices.is_none() {
                        log::warn!("Cannot end game {} - no start prices recorded", game_id);
                        return;
                    }
                    
                    let portfolios = self.state.portfolios.get(&game_id)
                        .await
                        .unwrap_or_default()
                        .unwrap_or_default();
                    
                    if portfolios.is_empty() {
                        log::warn!("Cannot end game {} - no portfolios submitted", game_id);
                        return;
                    }

                    game.status = GameStatus::Completed;

                    // Calculate returns for each portfolio
                    let mut leaderboard: Vec<(String, i64)> = Vec::new();
                    
                    if let Some(start_prices) = &game.start_prices {
                        for portfolio in &portfolios {
                            let crypto_ids: Vec<String> = portfolio.holdings.iter()
                                .map(|h| h.symbol.clone())
                                .collect();
                            let total_return = Self::calculate_portfolio_return(
                                &crypto_ids,
                                start_prices,
                                &price_snapshot
                            );
                            leaderboard.push((portfolio.player_account.clone(), total_return));
                        }
                        
                        // Sort by returns (descending)
                        leaderboard.sort_by(|a, b| b.1.cmp(&a.1));
                    } else {
                        // No start prices, just list players
                        for portfolio in &portfolios {
                            leaderboard.push((portfolio.player_account.clone(), 0));
                        }
                    }
                    
                    // Calculate prize pool using stored entry fee
                    let total_pool = game.entry_fee_usdc * portfolios.len() as u64;
                    let prizes = vec![
                        total_pool * 50 / 100,
                        total_pool * 30 / 100,
                        total_pool * 20 / 100,
                    ];
                    
                    // Update all player stats and distribute prizes
                    let timestamp = self.runtime.system_time().micros();
                    
                    for (rank, (player_account, portfolio_return)) in leaderboard.iter().enumerate() {
                        let rank_num = (rank + 1) as u32;
                        let prize = if rank < prizes.len() { prizes[rank] } else { 0 };
                        
                        // Store game result
                        let game_result = GameResult {
                            game_id: game_id.clone(),
                            rank: rank_num,
                            portfolio_return: *portfolio_return,
                            prize_won: prize,
                            played_at: timestamp,
                        };
                        let _ = self.state.game_history.insert(&(player_account.clone(), game_id.clone()), game_result);
                        
                        // Update player stats
                        if let Ok(Some(mut player)) = self.state.players.get(player_account).await {
                            player.stats.games_played += 1;
                            
                            if rank == 0 {
                                player.stats.games_won += 1;
                            }
                            
                            // Distribute prizes to top 3
                            if rank < prizes.len() {
                                player.total_earnings_usdc += prizes[rank];
                            }
                            
                            // Check and unlock achievements
                            let _ = self.check_and_unlock_achievements(
                                player_account,
                                &game_id,
                                rank_num,
                                *portfolio_return,
                                &player
                            ).await;
                            
                            let _ = self.state.players.insert(player_account, player);
                        }
                    }
                    
                    // Store top 3 winners
                    game.winners = leaderboard.iter().take(3).map(|(acc, _)| acc.clone()).collect();
                    log::info!("Game {} completed. Winners: {:?}", game_id, game.winners);
                    
                    // Mark game as completed
                    game.status = GameStatus::Completed;
                    
                    self.state.games.insert(&game_id, game).expect("Failed to update game");
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

// Helper functions for CoinDraftsContract
impl CoinDraftsContract {
    /// Check and unlock achievements for a player after a game
    async fn check_and_unlock_achievements(
        &mut self,
        player_account: &str,
        game_id: &str,
        rank: u32,
        portfolio_return: i64,
        player_profile: &PlayerProfile,
    ) -> Result<Vec<Achievement>, ()> {
        let timestamp = self.runtime.system_time().micros();
        let mut newly_unlocked = Vec::new();

        // Achievement: First Win
        if rank == 1 && player_profile.stats.games_won == 1 {
            let achievement = Achievement {
                id: "first_win".to_string(),
                achievement_type: AchievementType::FirstWin,
                unlocked_at: timestamp,
                game_id: Some(game_id.to_string()),
            };
            let _ = self.state.achievements.insert(&(player_account.to_string(), "first_win".to_string()), achievement.clone());
            newly_unlocked.push(achievement);
        }

        // Achievement: Play 10 Games
        if player_profile.stats.games_played == 10 {
            let achievement = Achievement {
                id: "play_10_games".to_string(),
                achievement_type: AchievementType::Play10Games,
                unlocked_at: timestamp,
                game_id: Some(game_id.to_string()),
            };
            let _ = self.state.achievements.insert(&(player_account.to_string(), "play_10_games".to_string()), achievement.clone());
            newly_unlocked.push(achievement);
        }

        // Achievement: Play 50 Games
        if player_profile.stats.games_played == 50 {
            let achievement = Achievement {
                id: "play_50_games".to_string(),
                achievement_type: AchievementType::Play50Games,
                unlocked_at: timestamp,
                game_id: Some(game_id.to_string()),
            };
            let _ = self.state.achievements.insert(&(player_account.to_string(), "play_50_games".to_string()), achievement.clone());
            newly_unlocked.push(achievement);
        }

        // Achievement: Perfect Portfolio (>50% return = 5000 basis points)
        if rank == 1 && portfolio_return > 5000 {
            let achievement = Achievement {
                id: "perfect_portfolio".to_string(),
                achievement_type: AchievementType::PerfectPortfolio,
                unlocked_at: timestamp,
                game_id: Some(game_id.to_string()),
            };
            let _ = self.state.achievements.insert(&(player_account.to_string(), "perfect_portfolio".to_string()), achievement.clone());
            newly_unlocked.push(achievement);
        }

        // Achievement: Tier Progression
        let new_tier = Self::calculate_tier(player_profile.stats.games_played, player_profile.stats.games_won);
        if matches!(new_tier, PlayerTier::Diamond | PlayerTier::Master | PlayerTier::Grandmaster) 
            && !matches!(player_profile.tier, PlayerTier::Diamond | PlayerTier::Master | PlayerTier::Grandmaster) {
            let achievement = Achievement {
                id: "rising_star".to_string(),
                achievement_type: AchievementType::RisingStar,
                unlocked_at: timestamp,
                game_id: Some(game_id.to_string()),
            };
            let _ = self.state.achievements.insert(&(player_account.to_string(), "rising_star".to_string()), achievement.clone());
            newly_unlocked.push(achievement);
        }

        if !newly_unlocked.is_empty() {
            log::info!("Player {} unlocked {} achievements", player_account, newly_unlocked.len());
        }

        Ok(newly_unlocked)
    }

    /// Calculate player tier based on games and wins
    fn calculate_tier(games_played: u32, wins: u32) -> PlayerTier {
        let win_rate = if games_played > 0 {
            (wins as f64 / games_played as f64) * 100.0
        } else {
            0.0
        };

        match (games_played, win_rate) {
            (0..=4, _) => PlayerTier::Rookie,
            (5..=14, _) => PlayerTier::Bronze,
            (15..=49, wr) if wr >= 30.0 => PlayerTier::Silver,
            (50..=99, wr) if wr >= 40.0 => PlayerTier::Gold,
            (100..=249, wr) if wr >= 45.0 => PlayerTier::Platinum,
            (250..=499, wr) if wr >= 50.0 => PlayerTier::Diamond,
            (500.., wr) if wr >= 55.0 => PlayerTier::Master,
            _ => PlayerTier::Bronze,
        }
    }

    /// Calculate portfolio return from start to end prices
    fn calculate_portfolio_return(
        cryptocurrencies: &[String],
        start_prices: &[PriceSnapshot],
        end_prices: &[PriceSnapshot]
    ) -> i64 {
        let mut total_return: i64 = 0;

        for crypto_id in cryptocurrencies {
            let start_price = start_prices.iter()
                .find(|p| p.crypto_id == *crypto_id)
                .map(|p| p.price_usd)
                .unwrap_or(0);

            let end_price = end_prices.iter()
                .find(|p| p.crypto_id == *crypto_id)
                .map(|p| p.price_usd)
                .unwrap_or(0);

            if start_price > 0 {
                // Calculate percentage return (* 10000 for basis points precision)
                let return_pct = ((end_price as i128 - start_price as i128) * 10000) / start_price as i128;
                total_return += return_pct as i64;
            }
        }

        total_return
    }
}