/*!
# Constants and Configuration

Global constants used in the CoinDrafts Core application.
Integrated directly following Linera application patterns.
*/

// Player validation constants
pub const MIN_PLAYER_NAME_LENGTH: usize = 3;
pub const MAX_PLAYER_NAME_LENGTH: usize = 50;

// Game constants
pub const MIN_ENTRY_FEE_USDC: u64 = 100_000; // $0.10 USDC
pub const MAX_ENTRY_FEE_USDC: u64 = 100_000_000; // $100 USDC
pub const MIN_GAME_DURATION_HOURS: u64 = 1;
pub const MAX_GAME_DURATION_HOURS: u64 = 168; // 7 days

// Portfolio constants
pub const MIN_PORTFOLIO_SIZE: u8 = 1;
pub const MAX_PORTFOLIO_SIZE: u8 = 10;
pub const MIN_ALLOCATION_PERCENT: u8 = 1;
pub const MAX_ALLOCATION_PERCENT: u8 = 100;

// Scoring and bonus constants
pub const MAX_RISK_MULTIPLIER: f64 = 1.05; // 5% max bonus
pub const MAX_AI_CONFIDENCE_BONUS: f64 = 1.05; // 5% max bonus
pub const MAX_SYNERGY_BONUS: f64 = 1.03; // 3% max bonus
pub const MAX_DIVERSITY_BONUS: f64 = 1.02; // 2% max bonus
pub const MIN_SYNERGY_ALLOCATION: u8 = 40; // 40% minimum for synergy bonus

// Fee and economic constants
pub const PLATFORM_FEE_PERCENT: f64 = 0.05; // 5% platform fee
pub const GAS_RESERVE_USDC: u64 = 10_000; // $0.01 USDC for gas

// Time constants (in microseconds)
pub const HOUR_MICROS: u64 = 60 * 60 * 1_000_000;
pub const DAY_MICROS: u64 = 24 * HOUR_MICROS;
pub const WEEK_MICROS: u64 = 7 * DAY_MICROS;

// API and rate limiting
pub const MAX_REQUESTS_PER_MINUTE: u32 = 60;
pub const MAX_PORTFOLIOS_PER_PLAYER: u32 = 100; // Historical limit

// Cryptocurrency data
pub const SUPPORTED_CRYPTOCURRENCIES: &[&str] = &[
    "BTC", "ETH", "ADA", "SOL", "DOT", "AVAX", "MATIC", "LINK",
    "UNI", "AAVE", "COMP", "MKR", "SNX", "YFI", "SUSHI", "CRV",
    "DOGE", "SHIB", "PEPE", "FLOKI", "WIF", "BONK",
    "ATOM", "OSMO", "JUNO", "SCRT", "LUNA", "UST",
    "FIL", "AR", "SC", "STORJ",
    "BAND", "API3", "TRB",
    "SAND", "MANA", "AXS", "GALA", "ENJ", "FLOW",
    "XTZ", "ALGO", "NEAR", "ICP", "HBAR"
];

// Default game configurations
pub const DEFAULT_TRADITIONAL_LEAGUE_CONFIG: GameConfigConstants = GameConfigConstants {
    entry_fee_usdc: 1_000_000, // $1 USDC
    duration_hours: 168, // 7 days
    max_players: 100,
    portfolio_size: 5,
    min_diversity: 20,
};

pub const DEFAULT_QUICK_MATCH_CONFIG: GameConfigConstants = GameConfigConstants {
    entry_fee_usdc: 500_000, // $0.50 USDC
    duration_hours: 24, // 1 day
    max_players: 50,
    portfolio_size: 3,
    min_diversity: 30,
};

pub const DEFAULT_PRICE_PREDICTION_CONFIG: GameConfigConstants = GameConfigConstants {
    entry_fee_usdc: 1_000_000, // $1 USDC
    duration_hours: 168, // 7 days
    max_players: 200,
    portfolio_size: 5,
    min_diversity: 15,
};

/// Game configuration constants struct
#[derive(Debug, Clone, Copy)]
pub struct GameConfigConstants {
    pub entry_fee_usdc: u64,
    pub duration_hours: u64,
    pub max_players: u32,
    pub portfolio_size: u8,
    pub min_diversity: u8,
}

// Error messages
pub const ERROR_GAME_NOT_FOUND: &str = "Game not found";
pub const ERROR_PLAYER_NOT_FOUND: &str = "Player not found";
pub const ERROR_PORTFOLIO_ALREADY_SUBMITTED: &str = "Portfolio already submitted";
pub const ERROR_GAME_REGISTRATION_FULL: &str = "Game registration is full";
pub const ERROR_INSUFFICIENT_FUNDS: &str = "Insufficient funds";
pub const ERROR_UNAUTHORIZED: &str = "Unauthorized operation";

// Success messages
pub const SUCCESS_GAME_CREATED: &str = "Game created successfully";
pub const SUCCESS_PLAYER_REGISTERED: &str = "Player registered successfully";
pub const SUCCESS_PORTFOLIO_SUBMITTED: &str = "Portfolio submitted successfully";

/// Convert USDC amount from micro units to human readable
pub fn usdc_micro_to_human(micro_usdc: u64) -> f64 {
    micro_usdc as f64 / 1_000_000.0
}

/// Convert USDC amount from human readable to micro units
pub fn usdc_human_to_micro(usdc: f64) -> u64 {
    (usdc * 1_000_000.0) as u64
}

/// Check if a cryptocurrency is supported
pub fn is_supported_cryptocurrency(symbol: &str) -> bool {
    SUPPORTED_CRYPTOCURRENCIES.contains(&symbol)
}

/// Get default configuration for game mode
pub fn get_default_config(mode: &str) -> Option<GameConfigConstants> {
    match mode.to_lowercase().as_str() {
        "traditional" | "traditional_league" => Some(DEFAULT_TRADITIONAL_LEAGUE_CONFIG),
        "quick" | "quick_match" => Some(DEFAULT_QUICK_MATCH_CONFIG),
        "prediction" | "price_prediction" => Some(DEFAULT_PRICE_PREDICTION_CONFIG),
        _ => None,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_usdc_conversions() {
        assert_eq!(usdc_micro_to_human(1_000_000), 1.0);
        assert_eq!(usdc_micro_to_human(500_000), 0.5);
        assert_eq!(usdc_human_to_micro(1.0), 1_000_000);
        assert_eq!(usdc_human_to_micro(0.5), 500_000);
    }

    #[test]
    fn test_supported_cryptocurrencies() {
        assert!(is_supported_cryptocurrency("BTC"));
        assert!(is_supported_cryptocurrency("ETH"));
        assert!(!is_supported_cryptocurrency("INVALID"));
    }

    #[test]
    fn test_default_configs() {
        let traditional = get_default_config("traditional").unwrap();
        assert_eq!(traditional.entry_fee_usdc, 1_000_000);
        assert_eq!(traditional.duration_hours, 168);
        
        let quick = get_default_config("quick").unwrap();
        assert_eq!(quick.entry_fee_usdc, 500_000);
        assert_eq!(quick.duration_hours, 24);
        
        assert!(get_default_config("invalid").is_none());
    }
}