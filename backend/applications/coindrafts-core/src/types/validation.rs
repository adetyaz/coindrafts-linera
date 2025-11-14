/*!
# Validation Utilities

Input validation functions for CoinDrafts Core.
*/

use crate::types::{constants::*, error::*};

/// Validate player name
pub fn validate_player_name(name: &str) -> Result<()> {
    if name.len() < MIN_PLAYER_NAME_LENGTH {
        return Err(CoinDraftsError::validation(format!(
            "Player name must be at least {} characters", 
            MIN_PLAYER_NAME_LENGTH
        )));
    }
    
    if name.len() > MAX_PLAYER_NAME_LENGTH {
        return Err(CoinDraftsError::validation(format!(
            "Player name must be at most {} characters", 
            MAX_PLAYER_NAME_LENGTH
        )));
    }
    
    Ok(())
}

/// Validate entry fee
pub fn validate_entry_fee(fee: u64) -> Result<()> {
    if fee < MIN_ENTRY_FEE_USDC {
        return Err(CoinDraftsError::validation(format!(
            "Entry fee must be at least {} USDC", 
            usdc_micro_to_human(MIN_ENTRY_FEE_USDC)
        )));
    }
    
    if fee > MAX_ENTRY_FEE_USDC {
        return Err(CoinDraftsError::validation(format!(
            "Entry fee must be at most {} USDC", 
            usdc_micro_to_human(MAX_ENTRY_FEE_USDC)
        )));
    }
    
    Ok(())
}

/// Validate game duration
pub fn validate_game_duration(hours: u64) -> Result<()> {
    if hours < MIN_GAME_DURATION_HOURS {
        return Err(CoinDraftsError::validation(format!(
            "Game duration must be at least {} hours", 
            MIN_GAME_DURATION_HOURS
        )));
    }
    
    if hours > MAX_GAME_DURATION_HOURS {
        return Err(CoinDraftsError::validation(format!(
            "Game duration must be at most {} hours", 
            MAX_GAME_DURATION_HOURS
        )));
    }
    
    Ok(())
}