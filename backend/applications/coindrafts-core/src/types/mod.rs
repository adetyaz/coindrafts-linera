/*!
# CoinDrafts Core Types

Core types for the CoinDrafts gaming platform, following Linera application patterns.
These types are integrated directly into the CoinDrafts Core application.
*/

pub mod constants;
pub mod error;
pub mod game;
pub mod player;
pub mod portfolio;
pub mod scoring;
pub mod validation;

// Re-export commonly used types
pub use constants::*;
pub use error::*;
pub use game::*;
pub use player::*;
pub use portfolio::*;
pub use scoring::*;
pub use validation::*;