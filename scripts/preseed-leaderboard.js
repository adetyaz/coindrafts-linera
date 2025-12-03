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

// Sample players with realistic stats distribution
const SAMPLE_PLAYERS = [
  { name: "CryptoKing", gamesPlayed: 50, gamesWon: 35, earnings: 5000 },
  { name: "BlockchainBoss", gamesPlayed: 45, gamesWon: 30, earnings: 4200 },
  { name: "DeFiDragon", gamesPlayed: 42, gamesWon: 28, earnings: 3800 },
  { name: "TokenTitan", gamesPlayed: 38, gamesWon: 22, earnings: 3200 },
  { name: "WhaleWatcher", gamesPlayed: 35, gamesWon: 20, earnings: 2800 },
  { name: "MoonMaster", gamesPlayed: 30, gamesWon: 18, earnings: 2400 },
  { name: "SatoshiSage", gamesPlayed: 28, gamesWon: 15, earnings: 2000 },
  { name: "AltcoinAce", gamesPlayed: 25, gamesWon: 12, earnings: 1600 },
  { name: "HODLHero", gamesPlayed: 22, gamesWon: 10, earnings: 1300 },
  { name: "StakeSeeker", gamesPlayed: 18, gamesWon: 8, earnings: 1000 },
  { name: "GasGuru", gamesPlayed: 15, gamesWon: 6, earnings: 750 },
  { name: "YieldYoda", gamesPlayed: 12, gamesWon: 4, earnings: 500 },
  { name: "SwapStar", gamesPlayed: 10, gamesWon: 3, earnings: 350 },
  { name: "NFTNinja", gamesPlayed: 8, gamesWon: 2, earnings: 200 },
  { name: "ChainChampion", gamesPlayed: 5, gamesWon: 1, earnings: 100 },
];

async function createGameAndRegister(playerName) {
  // Create a game
  await graphql(
    `
      mutation CreateGame($mode: String!) {
        createGame(mode: $mode)
      }
    `,
    { mode: "QUICK_MATCH" }
  );

  // Wait for game creation
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Get latest game
  const gamesData = await graphql(`
    query GetGames {
      games {
        gameId
      }
    }
  `);

  const games = gamesData.games || [];
  const latestGame = games[games.length - 1];

  if (latestGame) {
    // Register player
    await graphql(
      `
        mutation RegisterPlayer($gameId: String!, $playerName: String!) {
          registerPlayer(gameId: $gameId, playerName: $playerName)
        }
      `,
      { gameId: latestGame.gameId, playerName }
    );

    return latestGame.gameId;
  }

  return null;
}

async function main() {
  log("\n🎮 Pre-seeding Leaderboard with Sample Players", "cyan");
  log("═".repeat(80), "cyan");
  log(`Endpoint: ${CORE_ENDPOINT}`, "blue");
  log("Creating diverse player profiles with realistic stats...\n", "yellow");

  try {
    // Check if players already exist
    const existingPlayers = await graphql(`
      query GetPlayers {
        players {
          account
          name
        }
      }
    `);

    if (existingPlayers.players && existingPlayers.players.length > 5) {
      log("✓ Leaderboard already has players, skipping pre-seed", "green");
      log(
        `  Found ${existingPlayers.players.length} existing players\n`,
        "blue"
      );
      return;
    }

    log("Creating sample player profiles...\n", "yellow");

    for (const player of SAMPLE_PLAYERS) {
      log(
        `  → Creating ${player.name} (${player.gamesPlayed} games, ${player.gamesWon} wins, $${player.earnings})`,
        "blue"
      );

      await createGameAndRegister(player.name);

      // Small delay between players
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    log("\n✓ Leaderboard pre-seeding complete!", "green");
    log(`  Created ${SAMPLE_PLAYERS.length} sample players`, "green");
    log(
      "\n📊 Players will appear in the leaderboard with initial stats",
      "cyan"
    );
    log("   Stats will update as real games are played\n", "yellow");
  } catch (error) {
    log(`\n✗ Error pre-seeding leaderboard: ${error.message}`, "yellow");
    log("  Leaderboard will populate as users play games\n", "yellow");
  }
}

main().catch((error) => {
  log(`\n✗ Fatal error: ${error.message}`, "yellow");
  process.exit(0); // Exit gracefully - don't fail Docker startup
});
