#!/usr/bin/env node
/**
 * Populate Leaderboard Test Script
 * Simulates complete game flows to generate realistic player stats for testing
 * This matches the actual test flow: create game → register players → submit portfolios → complete game
 */

const GRAPHQL_BASE = "http://localhost:8081";
const DEFAULT_CHAIN_ID =
  "6eba044340e1fba8d553a764e8c3333a99d05877ef549291fc79f0ac4ef5644a";
const COINDRAFTS_CORE_APP_ID =
  "2b6ddbef11ad62fadc1370c1c341c89e7da1d6d9d7a5777bc76df759c1d418f5";

const CORE_ENDPOINT = `${GRAPHQL_BASE}/chains/${DEFAULT_CHAIN_ID}/applications/${COINDRAFTS_CORE_APP_ID}`;

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
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

log("\n🎮 CoinDrafts Leaderboard Population Script", "cyan");
log("=".repeat(80), "cyan");
log(`Endpoint: ${CORE_ENDPOINT}`, "blue");
log(
  "This script simulates multiple complete game flows to generate realistic stats\n",
  "yellow"
);

log("\n🎮 CoinDrafts Leaderboard Population Script", "cyan");
log("=".repeat(80), "cyan");
log(`Endpoint: ${CORE_ENDPOINT}`, "blue");
log(
  "This script simulates multiple complete game flows to generate realistic stats\n",
  "yellow"
);

// Array of diverse players
const PLAYERS = [
  "CryptoNinja",
  "MoonLambo",
  "DiamondHands",
  "SatoshiFan",
  "WhaleWatch",
  "DeFiKing",
  "ChartWizard",
  "HODLmaster",
  "BullRunner",
  "BearHunter",
  "AltcoinAce",
  "TokenTrader",
  "NFTCollector",
  "GasOptimizer",
  "YieldFarmer",
];

async function createGame() {
  log("  🎮 Creating new Quick Match game...", "blue");

  await graphql(
    `
      mutation CreateGame($mode: String!) {
        createGame(mode: $mode)
      }
    `,
    { mode: "QUICK_MATCH" }
  );

  // Wait for game to be created
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const gamesData = await graphql(`
    query GetGames {
      games {
        gameId
        mode
        status
      }
    }
  `);

  const games = gamesData.games || [];
  const latestGame = games[games.length - 1];
  return latestGame?.gameId;
}

async function registerPlayer(gameId, playerName) {
  log(`    → Registering ${playerName}...`, "yellow");

  await graphql(
    `
      mutation RegisterPlayer($gameId: String!, $playerName: String!) {
        registerPlayer(gameId: $gameId, playerName: $playerName)
      }
    `,
    { gameId, playerName }
  );
}

async function submitPortfolio(gameId, playerAccount) {
  log(`    → Submitting portfolio for ${playerAccount}...`, "yellow");

  const cryptocurrencies = [
    "bitcoin",
    "ethereum",
    "solana",
    "cardano",
    "polkadot",
  ];

  await graphql(
    `
      mutation SubmitPortfolio(
        $gameId: String!
        $cryptocurrencies: [String!]!
      ) {
        submitPortfolio(gameId: $gameId, cryptocurrencies: $cryptocurrencies)
      }
    `,
    { gameId, cryptocurrencies }
  );
}

function generatePriceSnapshot(cryptoIds) {
  return cryptoIds.map((id) => ({
    cryptoId: id,
    priceUsd: Math.floor(Math.random() * 10000000) + 1000000,
    timestamp: Date.now(),
  }));
}

async function startGame(gameId) {
  log(`    → Starting game...`, "yellow");

  const priceSnapshot = generatePriceSnapshot([
    "bitcoin",
    "ethereum",
    "solana",
    "cardano",
    "polkadot",
  ]);

  await graphql(
    `
      mutation StartGame(
        $gameId: String!
        $priceSnapshot: [PriceSnapshotInput!]!
      ) {
        startGame(gameId: $gameId, priceSnapshot: $priceSnapshot)
      }
    `,
    { gameId, priceSnapshot }
  );
}

async function endGame(gameId) {
  log(`    → Ending game and calculating winners...`, "yellow");

  const priceSnapshot = generatePriceSnapshot([
    "bitcoin",
    "ethereum",
    "solana",
    "cardano",
    "polkadot",
  ]);

  await graphql(
    `
      mutation EndGame(
        $gameId: String!
        $priceSnapshot: [PriceSnapshotInput!]!
      ) {
        endGame(gameId: $gameId, priceSnapshot: $priceSnapshot)
      }
    `,
    { gameId, priceSnapshot }
  );
}

async function runGameCycle(cycleNumber) {
  log(`\n${"━".repeat(80)}`, "green");
  log(`🎲 Game Cycle ${cycleNumber}/5`, "green");
  log("━".repeat(80), "green");

  try {
    const gameId = await createGame();

    if (!gameId) {
      log("  ❌ Failed to create game", "red");
      return false;
    }

    log(`  ✅ Game created: ${gameId}`, "green");

    // Randomly select 3-5 players for this game
    const numPlayers = 3 + Math.floor(Math.random() * 3);
    log(`  📊 Registering ${numPlayers} players...`, "blue");

    // Shuffle and take first N players
    const shuffled = [...PLAYERS].sort(() => Math.random() - 0.5);
    const selectedPlayers = shuffled.slice(0, numPlayers);

    for (const playerName of selectedPlayers) {
      await registerPlayer(gameId, playerName);
      await new Promise((resolve) => setTimeout(resolve, 500));

      await submitPortfolio(gameId, playerName);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    log(
      `  ✅ ${numPlayers} players registered and submitted portfolios`,
      "green"
    );

    // Start the game
    await startGame(gameId);
    log("  ⏳ Waiting for game to process...", "yellow");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // End the game (this calculates winners and updates player stats)
    await endGame(gameId);
    log("  ⏳ Waiting for game completion...", "yellow");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    log(
      `  ✅ Game cycle ${cycleNumber} complete - winners calculated!`,
      "green"
    );
    return true;
  } catch (error) {
    log(`  ❌ Error in cycle ${cycleNumber}: ${error.message}`, "red");
    return false;
  }
}

async function main() {
  try {
    log("\n🚀 Starting game simulation cycles...", "cyan");
    log("Note: Each game cycle takes ~10 seconds to complete\n", "yellow");

    const results = [];
    for (let i = 1; i <= 5; i++) {
      const success = await runGameCycle(i);
      results.push(success);
    }

    // Query final leaderboard stats
    log("\n" + "=".repeat(80), "cyan");
    log("📊 Fetching final leaderboard stats...", "cyan");
    log("=".repeat(80), "cyan");

    const playersData = await graphql(`
      query GetPlayers {
        players {
          account
          name
          tier
          stats {
            gamesPlayed
            gamesWon
          }
          totalEarningsUsdc
        }
      }
    `);

    const players = playersData.players || [];
    const playerCount = players.length;

    if (playerCount > 0) {
      log(`\n✅ Found ${playerCount} players in the leaderboard`, "green");

      // Sort by total earnings
      const sorted = players.sort(
        (a, b) => (b.totalEarningsUsdc || 0) - (a.totalEarningsUsdc || 0)
      );

      log("\n🏆 Top 10 Players (sorted by total earnings):", "blue");
      sorted.slice(0, 10).forEach((p, i) => {
        const wins = p.stats?.gamesWon || 0;
        const games = p.stats?.gamesPlayed || 0;
        const earnings = p.totalEarningsUsdc || 0;
        log(
          `  ${i + 1}. ${p.name} (${
            p.tier
          }) - ${wins}W / ${games}G - $${earnings}`,
          "blue"
        );
      });

      log("\n✅ Leaderboard populated with realistic game data!", "green");
    } else {
      log("\n⚠️  Limited player data found", "yellow");
      log("  Player stats are only created when games complete", "yellow");
      log("  The backend updates stats when winners are calculated", "yellow");
    }

    const passed = results.filter((r) => r).length;
    log("\n" + "=".repeat(80), "cyan");
    log(
      `📈 Summary: ${passed}/5 game cycles completed successfully`,
      passed === 5 ? "green" : "yellow"
    );
    log("=".repeat(80), "cyan");

    log("\n🎯 Next Steps:", "blue");
    log("  1. Open the frontend: http://localhost:5173/leaderboard", "blue");
    log(
      "  2. You should see players with varied stats from completed games",
      "blue"
    );
    log("  3. Try filtering by tier and sorting by different metrics", "blue");

    log(
      "\n📝 Note: Stats reflect actual game completions simulated by this script",
      "yellow"
    );
    log(
      "         Player tiers are calculated based on games played and win rates\n",
      "yellow"
    );
  } catch (error) {
    log(`\n💥 Fatal error: ${error.message}`, "red");
    log(error.stack, "red");
    process.exit(1);
  }
}

main().catch((error) => {
  log(`\n💥 Unexpected error: ${error.message}`, "red");
  log(error.stack, "red");
  process.exit(1);
});
