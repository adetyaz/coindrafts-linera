/*!
# Error Types

Error types for the CoinDrafts Core application.
Integrated directly following Linera application patterns.
*/

use thiserror::Error;

/// Common result type for CoinDrafts operations
pub type Result<T> = std::result::Result<T, CoinDraftsError>;

/// CoinDrafts error types
#[derive(Error, Debug, Clone)]
pub enum CoinDraftsError {
    #[error("Validation error: {message}")]
    Validation { message: String },

    #[error("Game error: {message}")]
    Game { message: String },

    #[error("Portfolio error: {message}")]
    Portfolio { message: String },

    #[error("Player error: {message}")]
    Player { message: String },

    #[error("Insufficient funds: required {required}, available {available}")]
    InsufficientFunds { required: u64, available: u64 },

    #[error("Game not found: {game_id}")]
    GameNotFound { game_id: String },

    #[error("Player not found: {player_account}")]
    PlayerNotFound { player_account: String },

    #[error("Game already started: {game_id}")]
    GameAlreadyStarted { game_id: String },

    #[error("Game registration full: {game_id}")]
    GameRegistrationFull { game_id: String },

    #[error("Portfolio already submitted for game: {game_id}")]
    PortfolioAlreadySubmitted { game_id: String },

    #[error("Invalid portfolio: {errors:?}")]
    InvalidPortfolio { errors: Vec<String> },

    #[error("Unauthorized operation")]
    Unauthorized,

    #[error("Rate limit exceeded")]
    RateLimit,

    #[error("External API error: {message}")]
    ExternalApi { message: String },

    #[error("Internal error: {message}")]
    Internal { message: String },
}

impl CoinDraftsError {
    /// Create a validation error
    pub fn validation(message: impl Into<String>) -> Self {
        Self::Validation {
            message: message.into(),
        }
    }

    /// Create a game error
    pub fn game(message: impl Into<String>) -> Self {
        Self::Game {
            message: message.into(),
        }
    }

    /// Create a portfolio error
    pub fn portfolio(message: impl Into<String>) -> Self {
        Self::Portfolio {
            message: message.into(),
        }
    }

    /// Create a player error
    pub fn player(message: impl Into<String>) -> Self {
        Self::Player {
            message: message.into(),
        }
    }

    /// Create an internal error
    pub fn internal(message: impl Into<String>) -> Self {
        Self::Internal {
            message: message.into(),
        }
    }

    /// Check if error is retryable
    pub fn is_retryable(&self) -> bool {
        matches!(self, 
            CoinDraftsError::RateLimit |
            CoinDraftsError::ExternalApi { .. } |
            CoinDraftsError::Internal { .. }
        )
    }

    /// Get error code for frontend
    pub fn code(&self) -> &'static str {
        match self {
            CoinDraftsError::Validation { .. } => "VALIDATION_ERROR",
            CoinDraftsError::Game { .. } => "GAME_ERROR",
            CoinDraftsError::Portfolio { .. } => "PORTFOLIO_ERROR",
            CoinDraftsError::Player { .. } => "PLAYER_ERROR",
            CoinDraftsError::InsufficientFunds { .. } => "INSUFFICIENT_FUNDS",
            CoinDraftsError::GameNotFound { .. } => "GAME_NOT_FOUND",
            CoinDraftsError::PlayerNotFound { .. } => "PLAYER_NOT_FOUND",
            CoinDraftsError::GameAlreadyStarted { .. } => "GAME_ALREADY_STARTED",
            CoinDraftsError::GameRegistrationFull { .. } => "GAME_REGISTRATION_FULL",
            CoinDraftsError::PortfolioAlreadySubmitted { .. } => "PORTFOLIO_ALREADY_SUBMITTED",
            CoinDraftsError::InvalidPortfolio { .. } => "INVALID_PORTFOLIO",
            CoinDraftsError::Unauthorized => "UNAUTHORIZED",
            CoinDraftsError::RateLimit => "RATE_LIMIT",
            CoinDraftsError::ExternalApi { .. } => "EXTERNAL_API_ERROR",
            CoinDraftsError::Internal { .. } => "INTERNAL_ERROR",
        }
    }
}