/*!
# Traditional Leagues State

Manages the persistent state for tournament operations.
Uses Linera views for efficient blockchain-native state management.
*/

use traditional_leagues::{Tournament, TournamentPortfolio};
use linera_sdk::views::{linera_views, MapView, RegisterView, RootView, ViewStorageContext};

/// The application state for Traditional Leagues
#[derive(RootView)]
#[view(context = ViewStorageContext)]
pub struct TraditionalLeaguesState {
    /// All tournaments indexed by tournament_id
    pub tournaments: MapView<String, Tournament>,
    /// Tournament participants indexed by tournament_id
    pub participants: MapView<String, Vec<String>>,
    /// Portfolio submissions indexed by (tournament_id, round, player_account)
    pub portfolios: MapView<String, TournamentPortfolio>,
    /// Tournament results indexed by tournament_id
    pub results: MapView<String, Vec<String>>, // Winners list
    /// Global tournament counter for generating unique IDs
    pub tournament_counter: RegisterView<u64>,
}

impl TraditionalLeaguesState {
    /// Generate a new tournament ID
    #[allow(dead_code)]
    pub async fn generate_tournament_id(&mut self) -> String {
        let counter = self.tournament_counter.get();
        let tournament_id = format!("trad-league-{}", counter);
        self.tournament_counter.set(counter + 1);
        tournament_id
    }

    /// Add participant to tournament
    #[allow(dead_code)]
    pub async fn add_participant(&mut self, tournament_id: &str, player_account: String) -> Result<(), String> {
        let mut participants = self.participants.get(tournament_id).await
            .map_err(|e| format!("Failed to get participants: {}", e))?
            .unwrap_or_default();
        
        if !participants.contains(&player_account) {
            participants.push(player_account);
            self.participants.insert(tournament_id, participants)
                .map_err(|e| format!("Failed to update participants: {}", e))?;
        }
        
        Ok(())
    }

    /// Check if tournament is full
    #[allow(dead_code)]
    pub async fn is_tournament_full(&self, tournament_id: &str) -> Result<bool, String> {
        let tournament = self.tournaments.get(tournament_id).await
            .map_err(|e| format!("Failed to get tournament: {}", e))?
            .ok_or("Tournament not found")?;
        
        let participants = self.participants.get(tournament_id).await
            .map_err(|e| format!("Failed to get participants: {}", e))?
            .unwrap_or_default();
        
        Ok(participants.len() >= tournament.max_participants as usize)
    }
}