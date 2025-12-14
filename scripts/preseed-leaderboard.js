#!/usr/bin/env node
/**
 * Pre-seed Leaderboard Script
 *
 * Creates sample player profiles with realistic stats for immediate leaderboard display.
 * This runs automatically during Docker startup to populate the leaderboard since
 * actual games take time to complete and generate real player statistics.
 *
 * Creates 15 diverse players across different tiers with varied:
 * - Games played (0-50)
 * - Win rates (0-80%)
 * - Earnings ($0-$5000)
 * - Tiers (Rookie to Grandmaster)
 */

const fs = require("fs");
const path = require("path");

const GRAPHQL_BASE = "http://localhost:8081";

// Read from frontend/.env file
const envPath = path.join(__dirname, "../frontend/.env");
const envContent = fs.readFileSync(envPath, "utf8");
const envVars = {};
envContent.split("\n").forEach((line) => {
  const [key, value] = line.split("=");
  if (key && value) envVars[key.trim()] = value.trim();
});

const DEFAULT_CHAIN_ID = envVars.PUBLIC_DEFAULT_CHAIN_ID;
const COINDRAFTS_CORE_APP_ID = envVars.PUBLIC_COINDRAFTS_CORE_APP_ID;

const CORE_ENDPOINT = `${GRAPHQL_BASE}/chains/${DEFAULT_CHAIN_ID}/applications/${COINDRAFTS_CORE_APP_ID}`;

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
};

function log(msg, color = "reset") {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

async function graphql(query, variables = {}) {
  const response = await fetch(CORE_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const result = await response.json();
  if (result.errors) throw new Error(JSON.stringify(result.errors));
  return result.data;
}

// Unique player addresses for 3 games with 5 players each
const UNIQUE_PLAYERS = [
  "0x1111111111111111111111111111111111111111",
  "0x2222222222222222222222222222222222222222",
  "0x3333333333333333333333333333333333333333",
  "0x4444444444444444444444444444444444444444",
  "0x5555555555555555555555555555555555555555",
  "0x6666666666666666666666666666666666666666",
  "0x7777777777777777777777777777777777777777",
  "0x8888888888888888888888888888888888888888",
  "0x9999999999999999999999999999999999999999",
  "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  "0xcccccccccccccccccccccccccccccccccccccccc",
  "0xdddddddddddddddddddddddddddddddddddddddd",
  "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  "0xffffffffffffffffffffffffffffffffffffffff",
];

// 3 games, each with 5 unique players
const GAMES_CONFIG = [
  {
    players: UNIQUE_PLAYERS.slice(0, 5),
  },
  {
    players: UNIQUE_PLAYERS.slice(5, 10),
  },
  {
    players: UNIQUE_PLAYERS.slice(10, 15),
  },
];

const CRYPTOCURRENCIES = [
  "bitcoin",
  "ethereum",
  "solana",
  "cardano",
  "polkadot",
];

function generatePriceSnapshot() {
  return CRYPTOCURRENCIES.map((id) => ({
    cryptoId: id,
    priceUsd: Math.floor(Math.random() * 10000000) + 1000000,
    timestamp: Date.now(),
  }));
}

async function createCompleteGame(gameIndex, playerAddresses) {
  try {
    console.log(`\nCreating completed game ${gameIndex + 1}...`);

    // 1. Create a game
    await graphql(
      `
        mutation CreateGame($mode: String!) {
          createGame(mode: $mode)
        }
      `,
      { mode: "QUICK_MATCH" }
    );

    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 2. Get the latest game
    const gamesData = await graphql(`
      query GetGames {
        games {
          gameId
        }
      }
    `);

    const games = gamesData.games || [];
    const latestGame = games[games.length - 1];
    if (!latestGame) {
      console.log("Failed to create game");
      return false;
    }

    const gameId = latestGame.gameId;
    console.log(`Created game: ${gameId}`);

    // 3. Register all players with unique addresses
    for (let i = 0; i < playerAddresses.length; i++) {
      const playerAddress = playerAddresses[i];
      const playerName = `Player${gameIndex * 5 + i + 1}`;

      console.log(
        `Registering ${playerName} with address ${playerAddress.substring(
          0,
          10
        )}...`
      );

      await graphql(
        `
          mutation RegisterPlayerWithAccount(
            $gameId: String!
            $playerName: String!
            $playerAccount: String!
          ) {
            registerPlayerWithAccount(
              gameId: $gameId
              playerName: $playerName
              playerAccount: $playerAccount
            )
          }
        `,
        { gameId, playerName, playerAccount: playerAddress }
      );

      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // 4. Submit portfolios for all players
    for (let i = 0; i < playerAddresses.length; i++) {
      const playerAddress = playerAddresses[i];
      const playerName = `Player${gameIndex * 5 + i + 1}`;

      // Each player gets a different random portfolio
      const portfolio = CRYPTOCURRENCIES.slice(
        0,
        3 + Math.floor(Math.random() * 3)
      );

      console.log(`Submitting portfolio for ${playerName}...`);

      await graphql(
        `
          mutation SubmitPortfolioForAccount(
            $gameId: String!
            $playerAccount: String!
            $cryptocurrencies: [String!]!
          ) {
            submitPortfolioForAccount(
              gameId: $gameId
              playerAccount: $playerAccount
              cryptocurrencies: $cryptocurrencies
            )
          }
        `,
        { gameId, playerAccount: playerAddress, cryptocurrencies: portfolio }
      );

      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // 5. Start game with price snapshot
    console.log("Starting game with price snapshot...");
    const startSnapshot = generatePriceSnapshot();
    await graphql(
      `
        mutation StartGame(
          $gameId: String!
          $priceSnapshot: [PriceSnapshotInput!]!
        ) {
          startGame(gameId: $gameId, priceSnapshot: $priceSnapshot)
        }
      `,
      { gameId, priceSnapshot: startSnapshot }
    );

    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 6. End game with final price snapshot (different prices to generate winners)
    console.log("Ending game with final price snapshot...");
    const endSnapshot = generatePriceSnapshot();
    await graphql(
      `
        mutation EndGame(
          $gameId: String!
          $priceSnapshot: [PriceSnapshotInput!]!
        ) {
          endGame(gameId: $gameId, priceSnapshot: $priceSnapshot)
        }
      `,
      { gameId, priceSnapshot: endSnapshot }
    );

    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log(
      `✓ Completed game ${gameId} with ${playerAddresses.length} players`
    );
    return true;
  } catch (error) {
    console.log(`✗ Error creating game ${gameIndex + 1}: ${error.message}`);
    return false;
  }
}

async function main() {
  log("\n🎮 Pre-seeding Leaderboard with Completed Games", "cyan");
  log("═".repeat(80), "cyan");
  log(`Endpoint: ${CORE_ENDPOINT}`, "blue");
  log("Creating 3 completed games with 5 unique players each...\n", "yellow");

  try {
    // Check if games already exist
    const existingGames = await graphql(`
      query GetGames {
        games {
          gameId
          status
        }
      }
    `);

    const completedGames =
      existingGames.games?.filter((g) => g.status === "COMPLETED") || [];
    if (completedGames.length >= 3) {
      log(
        "✓ Leaderboard already has completed games, skipping pre-seed",
        "green"
      );
      log(`  Found ${completedGames.length} completed games\n`, "blue");
      return;
    }

    log("Creating completed games for leaderboard...\n", "yellow");

    let created = 0;
    for (let i = 0; i < GAMES_CONFIG.length; i++) {
      const config = GAMES_CONFIG[i];
      const success = await createCompleteGame(i, config.players);
      if (success) {
        created++;
      }

      // Delay between games
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    log("\n✓ Leaderboard pre-seeding complete!", "green");
    log(`  Created ${created}/${GAMES_CONFIG.length} completed games`, "green");
    log(`  Total of ${created * 5} unique players with game stats`, "green");
    log(
      "\n📊 Players will appear in the leaderboard with initial stats",
      "cyan"
    );
    log("   Stats will update as more games are played\n", "yellow");
  } catch (error) {
    log(`\n✗ Error pre-seeding leaderboard: ${error.message}`, "yellow");
    log("  Leaderboard will populate as users play games\n", "yellow");
  }
}

main().catch((error) => {
  log(`\n✗ Fatal error: ${error.message}`, "yellow");
  process.exit(0); // Exit gracefully - don't fail Docker startup
});
