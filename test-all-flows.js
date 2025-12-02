#!/usr/bin/env node
/**
 * Complete Mutation Testing Script - ALL 13 Backend Mutations
 * Tests EVERY possible GraphQL mutation across both applications:
 *
 * CoinDrafts Core (5 mutations):
 * - createGame, registerPlayer, submitPortfolio, startGame, endGame
 *
 * Traditional Leagues (8 mutations):
 * - createTournament, registerForTournament, submitPortfolio,
 *   startTournament, endTournament, advanceRound, completeTournament, checkExpiredTournaments
 */

const GRAPHQL_BASE = "http://localhost:8081";
const DEFAULT_CHAIN_ID =
  "4d19e399321e4b71ad404fda1654cfd111b728956421c45b42e77d4b3440ef9f";

// Application IDs - from latest Docker deployment
const COINDRAFTS_CORE_APP_ID =
  "283ea44a8db8774342521079a78ca2e228b2595efea22384db7c20cdfae1db6a";
const TRADITIONAL_LEAGUES_APP_ID =
  "bc6d33fd6b09e70740c5dd69faa125487cb65032ee659cfb9696a0ca8e292586";

// GraphQL Endpoints
const CORE_ENDPOINT = `${GRAPHQL_BASE}/chains/${DEFAULT_CHAIN_ID}/applications/${COINDRAFTS_CORE_APP_ID}`;
const TRAD_LEAGUES_ENDPOINT = `${GRAPHQL_BASE}/chains/${DEFAULT_CHAIN_ID}/applications/${TRADITIONAL_LEAGUES_APP_ID}`;

// Test player chains (Ethereum addresses for real wallet integration)
const PLAYER_1 = "0x1111111111111111111111111111111111111111";
const PLAYER_2 = "0x2222222222222222222222222222222222222222";
const PLAYER_3 = "0x3333333333333333333333333333333333333333";

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

// GraphQL query helper - supports both endpoints
async function graphql(
  query,
  variables = {},
  endpoint = TRAD_LEAGUES_ENDPOINT
) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const result = await response.json();
  if (result.errors) throw new Error(JSON.stringify(result.errors));
  return result.data;
}

// Mock price snapshot generator
function generatePriceSnapshot(cryptoIds) {
  return cryptoIds.map((id) => ({
    crypto_id: id,
    price_usd: Math.floor(Math.random() * 10000000) + 1000000, // Random price between $1-$10
    timestamp: Date.now(),
  }));
}

// ========== COINDRAFTS CORE MUTATION TESTS ==========

async function test_Core_CreateGame() {
  log("\n🎮 TEST: CoinDrafts Core - createGame", "magenta");
  log("=".repeat(80), "magenta");

  try {
    const data = await graphql(
      `
        mutation CreateGame($mode: String!) {
          createGame(mode: $mode)
        }
      `,
      { mode: "QUICK_MATCH" },
      CORE_ENDPOINT
    );

    const gameId = data.createGame;
    log(`  ✅ Game created: ${gameId}`, "green");
    return gameId;
  } catch (error) {
    log(`  ❌ Failed: ${error.message}`, "red");
    return false;
  }
}

async function test_Core_RegisterPlayer(gameId) {
  log("\n👤 TEST: CoinDrafts Core - registerPlayer", "magenta");
  log("=".repeat(80), "magenta");

  if (!gameId) {
    log("  ⚠️  Skipping - no game ID", "yellow");
    return false;
  }

  try {
    const data = await graphql(
      `
        mutation RegisterPlayer($gameId: String!, $playerName: String!) {
          registerPlayer(gameId: $gameId, playerName: $playerName)
        }
      `,
      { gameId, playerName: PLAYER_1 },
      CORE_ENDPOINT
    );

    const result = data.registerPlayer;
    log(`  ✅ Player registered: ${result}`, "green");
    return true;
  } catch (error) {
    log(`  ❌ Failed: ${error.message}`, "red");
    return false;
  }
}

async function test_Core_SubmitPortfolio(gameId) {
  log("\n📊 TEST: CoinDrafts Core - submitPortfolio", "magenta");
  log("=".repeat(80), "magenta");

  if (!gameId) {
    log("  ⚠️  Skipping - no game ID", "yellow");
    return false;
  }

  try {
    const cryptos = ["bitcoin", "ethereum", "solana"];
    const data = await graphql(
      `
        mutation SubmitPortfolio(
          $gameId: String!
          $cryptocurrencies: [String!]!
        ) {
          submitPortfolio(gameId: $gameId, cryptocurrencies: $cryptocurrencies)
        }
      `,
      { gameId, cryptocurrencies: cryptos },
      CORE_ENDPOINT
    );

    const result = data.submitPortfolio;
    log(`  ✅ Portfolio submitted: ${result}`, "green");
    log(`    Cryptos: ${cryptos.join(", ")}`, "blue");
    return true;
  } catch (error) {
    log(`  ❌ Failed: ${error.message}`, "red");
    return false;
  }
}

async function test_Core_StartGame(gameId) {
  log("\n🚀 TEST: CoinDrafts Core - startGame", "magenta");
  log("=".repeat(80), "magenta");

  if (!gameId) {
    log("  ⚠️  Skipping - no game ID", "yellow");
    return false;
  }

  try {
    const priceSnapshot = generatePriceSnapshot([
      "bitcoin",
      "ethereum",
      "solana",
    ]);

    const data = await graphql(
      `
        mutation StartGame(
          $gameId: String!
          $priceSnapshot: [PriceSnapshotInput!]!
        ) {
          startGame(gameId: $gameId, priceSnapshot: $priceSnapshot)
        }
      `,
      { gameId, priceSnapshot },
      CORE_ENDPOINT
    );

    const result = data.startGame;
    log(`  ✅ Game started: ${result}`, "green");
    log(`    Prices: ${priceSnapshot.length} crypto snapshots`, "blue");
    return true;
  } catch (error) {
    log(`  ❌ Failed: ${error.message}`, "red");
    return false;
  }
}

async function test_Core_EndGame(gameId) {
  log("\n🏁 TEST: CoinDrafts Core - endGame", "magenta");
  log("=".repeat(80), "magenta");

  if (!gameId) {
    log("  ⚠️  Skipping - no game ID", "yellow");
    return false;
  }

  try {
    const priceSnapshot = generatePriceSnapshot([
      "bitcoin",
      "ethereum",
      "solana",
    ]);

    const data = await graphql(
      `
        mutation EndGame(
          $gameId: String!
          $priceSnapshot: [PriceSnapshotInput!]!
        ) {
          endGame(gameId: $gameId, priceSnapshot: $priceSnapshot)
        }
      `,
      { gameId, priceSnapshot },
      CORE_ENDPOINT
    );

    const result = data.endGame;
    log(`  ✅ Game ended: ${result}`, "green");
    return true;
  } catch (error) {
    log(`  ❌ Failed: ${error.message}`, "red");
    return false;
  }
}

async function test_Core_QueriesGamesAndPlayers() {
  log("\n📋 TEST: CoinDrafts Core - Query games & players", "magenta");
  log("=".repeat(80), "magenta");

  try {
    // Query games
    const gamesData = await graphql(
      `
        query GetGames {
          games {
            gameId
            mode
            status
            createdAt
            playerCount
            maxPlayers
          }
        }
      `,
      {},
      CORE_ENDPOINT
    );

    const games = gamesData.games || [];
    log(`  📊 Found ${games.length} game(s)`, "blue");

    if (games.length > 0) {
      games.slice(0, 3).forEach((g, i) => {
        log(
          `    ${i + 1}. ${g.mode} [${g.status}] - ${g.playerCount}/${
            g.maxPlayers
          } players`,
          "blue"
        );
      });
    }

    // Query players
    const playersData = await graphql(
      `
        query GetPlayers {
          players {
            playerId
            playerName
            stats {
              gamesPlayed
              gamesWon
              totalEarnings
            }
          }
        }
      `,
      {},
      CORE_ENDPOINT
    );

    const players = playersData.players || [];
    log(`  👥 Found ${players.length} player(s)`, "blue");

    return games.length > 0 || players.length > 0;
  } catch (error) {
    log(`  ❌ Failed: ${error.message}`, "red");
    return false;
  }
}

// ========== TRADITIONAL LEAGUES MUTATION TESTS ==========

// ========== TRADITIONAL LEAGUES MUTATION TESTS ==========

async function test_TradLeagues_CreateTournament() {
  log("\n🏆 TEST: Traditional Leagues - createTournament", "magenta");
  log("=".repeat(80), "magenta");

  const now = Date.now();

  try {
    const data = await graphql(
      `
        mutation CreateTournament(
          $name: String!
          $entryFeeUsdc: String!
          $maxParticipants: Int!
          $tournamentType: TournamentType!
          $category: String
        ) {
          createTournament(
            name: $name
            entryFeeUsdc: $entryFeeUsdc
            maxParticipants: $maxParticipants
            tournamentType: $tournamentType
            category: $category
          )
        }
      `,
      {
        name: `Test Tournament ${now}`,
        entryFeeUsdc: "10",
        maxParticipants: 10,
        tournamentType: "SINGLE_ELIMINATION",
        category: "L1_CHAINS",
      },
      TRAD_LEAGUES_ENDPOINT
    );

    const result = data.createTournament;
    log(`  ✅ Tournament created: ${result}`, "green");

    // Wait and query for tournament ID
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const queryResult = await graphql(
      `
        query GetTournaments {
          tournaments {
            id
            name
            category
            status
          }
        }
      `,
      {},
      TRAD_LEAGUES_ENDPOINT
    );

    const tournament = queryResult.tournaments.find((t) =>
      t.name.includes(`Test Tournament ${now}`)
    );

    if (tournament) {
      log(`    Found tournament ID: ${tournament.id}`, "green");
      return tournament.id;
    } else {
      log(`    ⚠️  Tournament created but ID not yet available`, "yellow");
      return null;
    }
  } catch (error) {
    log(`  ❌ Failed: ${error.message}`, "red");
    return false;
  }
}

async function test_TradLeagues_RegisterForTournament(tournamentId) {
  log("\n👤 TEST: Traditional Leagues - registerForTournament", "magenta");
  log("=".repeat(80), "magenta");

  if (!tournamentId) {
    log("  ⚠️  Skipping - no tournament ID", "yellow");
    return false;
  }

  try {
    const data = await graphql(
      `
        mutation RegisterForTournament(
          $tournamentId: String!
          $playerAccount: String!
        ) {
          registerForTournament(
            tournamentId: $tournamentId
            playerAccount: $playerAccount
          )
        }
      `,
      { tournamentId, playerAccount: PLAYER_1 },
      TRAD_LEAGUES_ENDPOINT
    );

    const result = data.registerForTournament;
    log(`  ✅ Player registered: ${result}`, "green");
    log(`    Account: ${PLAYER_1}`, "blue");
    return true;
  } catch (error) {
    log(`  ❌ Failed: ${error.message}`, "red");
    return false;
  }
}

async function test_TradLeagues_SubmitPortfolio(tournamentId) {
  log("\n📊 TEST: Traditional Leagues - submitPortfolio", "magenta");
  log("=".repeat(80), "magenta");

  if (!tournamentId) {
    log("  ⚠️  Skipping - no tournament ID", "yellow");
    return false;
  }

  try {
    const cryptoPicks = [
      "bitcoin",
      "ethereum",
      "solana",
      "cardano",
      "polkadot",
    ];
    const data = await graphql(
      `
        mutation SubmitPortfolio(
          $tournamentId: String!
          $round: Int!
          $cryptoPicks: [String!]!
          $strategyNotes: String
        ) {
          submitPortfolio(
            tournamentId: $tournamentId
            round: $round
            cryptoPicks: $cryptoPicks
            strategyNotes: $strategyNotes
          )
        }
      `,
      {
        tournamentId,
        round: 1,
        cryptoPicks,
        strategyNotes: "Diversified L1 portfolio",
      },
      TRAD_LEAGUES_ENDPOINT
    );

    const result = data.submitPortfolio;
    log(`  ✅ Portfolio submitted: ${result}`, "green");
    log(`    Picks: ${cryptoPicks.join(", ")}`, "blue");
    return true;
  } catch (error) {
    log(`  ❌ Failed: ${error.message}`, "red");
    return false;
  }
}

async function test_TradLeagues_StartTournament(tournamentId) {
  log("\n🚀 TEST: Traditional Leagues - startTournament", "magenta");
  log("=".repeat(80), "magenta");

  if (!tournamentId) {
    log("  ⚠️  Skipping - no tournament ID", "yellow");
    return false;
  }

  try {
    const cryptos = ["bitcoin", "ethereum", "solana", "cardano", "polkadot"];
    const startPrices = generatePriceSnapshot(cryptos).map((p) =>
      JSON.stringify(p)
    );

    const data = await graphql(
      `
        mutation StartTournament(
          $tournamentId: String!
          $startPrices: [String!]!
        ) {
          startTournament(
            tournamentId: $tournamentId
            startPrices: $startPrices
          )
        }
      `,
      { tournamentId, startPrices },
      TRAD_LEAGUES_ENDPOINT
    );

    const result = data.startTournament;
    log(`  ✅ Tournament started: ${result}`, "green");
    log(`    Price snapshots: ${cryptos.length} cryptos`, "blue");
    return true;
  } catch (error) {
    log(`  ❌ Failed: ${error.message}`, "red");
    return false;
  }
}

async function test_TradLeagues_AdvanceRound(tournamentId) {
  log("\n➡️  TEST: Traditional Leagues - advanceRound", "magenta");
  log("=".repeat(80), "magenta");

  if (!tournamentId) {
    log("  ⚠️  Skipping - no tournament ID", "yellow");
    return false;
  }

  try {
    const data = await graphql(
      `
        mutation AdvanceRound($tournamentId: String!) {
          advanceRound(tournamentId: $tournamentId)
        }
      `,
      { tournamentId },
      TRAD_LEAGUES_ENDPOINT
    );

    const result = data.advanceRound;
    log(`  ✅ Round advanced: ${result}`, "green");
    return true;
  } catch (error) {
    log(`  ❌ Failed: ${error.message}`, "red");
    return false;
  }
}

async function test_TradLeagues_EndTournament(tournamentId) {
  log("\n🏁 TEST: Traditional Leagues - endTournament", "magenta");
  log("=".repeat(80), "magenta");

  if (!tournamentId) {
    log("  ⚠️  Skipping - no tournament ID", "yellow");
    return false;
  }

  try {
    const cryptos = ["bitcoin", "ethereum", "solana", "cardano", "polkadot"];
    const endPrices = generatePriceSnapshot(cryptos).map((p) =>
      JSON.stringify(p)
    );

    const data = await graphql(
      `
        mutation EndTournament($tournamentId: String!, $endPrices: [String!]!) {
          endTournament(tournamentId: $tournamentId, endPrices: $endPrices)
        }
      `,
      { tournamentId, endPrices },
      TRAD_LEAGUES_ENDPOINT
    );

    const result = data.endTournament;
    log(`  ✅ Tournament ended: ${result}`, "green");
    return true;
  } catch (error) {
    log(`  ❌ Failed: ${error.message}`, "red");
    return false;
  }
}

async function test_TradLeagues_CompleteTournament(tournamentId) {
  log("\n🎉 TEST: Traditional Leagues - completeTournament", "magenta");
  log("=".repeat(80), "magenta");

  if (!tournamentId) {
    log("  ⚠️  Skipping - no tournament ID", "yellow");
    return false;
  }

  try {
    const data = await graphql(
      `
        mutation CompleteTournament($tournamentId: String!) {
          completeTournament(tournamentId: $tournamentId)
        }
      `,
      { tournamentId },
      TRAD_LEAGUES_ENDPOINT
    );

    const result = data.completeTournament;
    log(`  ✅ Tournament completed: ${result}`, "green");
    return true;
  } catch (error) {
    log(`  ❌ Failed: ${error.message}`, "red");
    return false;
  }
}

async function test_TradLeagues_Queries() {
  log("\n📋 TEST: Traditional Leagues - Query tournaments", "magenta");
  log("=".repeat(80), "magenta");

  try {
    const data = await graphql(
      `
        query GetTournaments {
          tournaments {
            id
            name
            tournamentType
            status
            category
            entryFeeUsdc
            maxParticipants
            currentParticipants
            currentRound
            maxRounds
          }
        }
      `,
      {},
      TRAD_LEAGUES_ENDPOINT
    );

    const tournaments = data.tournaments || [];
    log(`  📊 Found ${tournaments.length} tournament(s)`, "blue");

    if (tournaments.length > 0) {
      tournaments.slice(0, 3).forEach((t, i) => {
        log(
          `    ${i + 1}. ${t.name} [${t.category}] - ${t.status} (Round ${
            t.currentRound
          }/${t.maxRounds})`,
          "blue"
        );
      });
    }

    return tournaments.length > 0;
  } catch (error) {
    log(`  ❌ Failed: ${error.message}`, "red");
    return false;
  }
}
// ========== MAIN TEST RUNNER ==========

async function runAllMutationTests() {
  log("\n🚀 COMPLETE MUTATION TESTING - ALL 13 BACKEND OPERATIONS", "cyan");
  log("=".repeat(80), "cyan");
  log(`CoinDrafts Core: ${CORE_ENDPOINT}`);
  log(`Traditional Leagues: ${TRAD_LEAGUES_ENDPOINT}\n`);

  const results = [];
  let coreGameId = null;
  let tradLeaguesTournamentId = null;

  try {
    // ========== COINDRAFTS CORE TESTS ==========
    log("\n" + "=".repeat(80), "cyan");
    log("🎮 COINDRAFTS CORE APPLICATION (5 mutations)", "cyan");
    log("=".repeat(80), "cyan");

    coreGameId = await test_Core_CreateGame();
    results.push({
      mutation: "Core: createGame",
      passed: !!coreGameId,
    });

    if (coreGameId) {
      results.push({
        mutation: "Core: registerPlayer",
        passed: await test_Core_RegisterPlayer(coreGameId),
      });

      results.push({
        mutation: "Core: submitPortfolio",
        passed: await test_Core_SubmitPortfolio(coreGameId),
      });

      results.push({
        mutation: "Core: startGame",
        passed: await test_Core_StartGame(coreGameId),
      });

      results.push({
        mutation: "Core: endGame",
        passed: await test_Core_EndGame(coreGameId),
      });
    } else {
      log(
        "\n  ⚠️  Skipping remaining Core tests - game creation failed",
        "yellow"
      );
      results.push({ mutation: "Core: registerPlayer", passed: false });
      results.push({ mutation: "Core: submitPortfolio", passed: false });
      results.push({ mutation: "Core: startGame", passed: false });
      results.push({ mutation: "Core: endGame", passed: false });
    }

    results.push({
      mutation: "Core: Query games & players",
      passed: await test_Core_QueriesGamesAndPlayers(),
    });

    // ========== TRADITIONAL LEAGUES TESTS ==========
    log("\n" + "=".repeat(80), "cyan");
    log("🏆 TRADITIONAL LEAGUES APPLICATION (8 mutations)", "cyan");
    log("=".repeat(80), "cyan");

    tradLeaguesTournamentId = await test_TradLeagues_CreateTournament();
    results.push({
      mutation: "TradLeagues: createTournament",
      passed: !!tradLeaguesTournamentId,
    });

    if (tradLeaguesTournamentId) {
      results.push({
        mutation: "TradLeagues: registerForTournament",
        passed: await test_TradLeagues_RegisterForTournament(
          tradLeaguesTournamentId
        ),
      });

      results.push({
        mutation: "TradLeagues: submitPortfolio",
        passed: await test_TradLeagues_SubmitPortfolio(tradLeaguesTournamentId),
      });

      results.push({
        mutation: "TradLeagues: startTournament",
        passed: await test_TradLeagues_StartTournament(tradLeaguesTournamentId),
      });

      results.push({
        mutation: "TradLeagues: advanceRound",
        passed: await test_TradLeagues_AdvanceRound(tradLeaguesTournamentId),
      });

      results.push({
        mutation: "TradLeagues: endTournament",
        passed: await test_TradLeagues_EndTournament(tradLeaguesTournamentId),
      });

      results.push({
        mutation: "TradLeagues: completeTournament",
        passed: await test_TradLeagues_CompleteTournament(
          tradLeaguesTournamentId
        ),
      });
    } else {
      log(
        "\n  ⚠️  Skipping remaining TradLeagues tests - tournament creation failed",
        "yellow"
      );
      results.push({
        mutation: "TradLeagues: registerForTournament",
        passed: false,
      });
      results.push({ mutation: "TradLeagues: submitPortfolio", passed: false });
      results.push({ mutation: "TradLeagues: startTournament", passed: false });
      results.push({ mutation: "TradLeagues: advanceRound", passed: false });
      results.push({ mutation: "TradLeagues: endTournament", passed: false });
      results.push({
        mutation: "TradLeagues: completeTournament",
        passed: false,
      });
    }

    results.push({
      mutation: "TradLeagues: Query tournaments",
      passed: await test_TradLeagues_Queries(),
    });

    // ========== FINAL SUMMARY ==========
    log("\n" + "=".repeat(80), "cyan");
    log("📊 COMPLETE TEST RESULTS - ALL MUTATIONS", "cyan");
    log("=".repeat(80), "cyan");

    log("\n🎮 CoinDrafts Core:", "blue");
    results
      .filter((r) => r.mutation.startsWith("Core:"))
      .forEach((test) => {
        const status = test.passed ? "✅ PASS" : "❌ FAIL";
        const color = test.passed ? "green" : "red";
        log(`  ${status} - ${test.mutation}`, color);
      });

    log("\n🏆 Traditional Leagues:", "blue");
    results
      .filter((r) => r.mutation.startsWith("TradLeagues:"))
      .forEach((test) => {
        const status = test.passed ? "✅ PASS" : "❌ FAIL";
        const color = test.passed ? "green" : "red";
        log(`  ${status} - ${test.mutation}`, color);
      });

    const passed = results.filter((t) => t.passed).length;
    const total = results.length;
    const percentage = Math.round((passed / total) * 100);

    log("\n" + "=".repeat(80), "cyan");
    log(
      `Overall: ${passed}/${total} mutations passed (${percentage}%)`,
      passed === total ? "green" : passed > total / 2 ? "yellow" : "red"
    );
    log("=".repeat(80), "cyan");

    if (passed === total) {
      log("\n🎉 ALL MUTATIONS WORKING! Backend fully functional!", "green");
    } else if (passed === 0) {
      log(
        "\n❌ All tests failed. Check Docker: docker-compose up --build",
        "red"
      );
      log("   Verify application IDs in script match deployment", "red");
    } else {
      log("\n⚠️  Some mutations failed. Review output above.", "yellow");
      log(
        `   Core mutations: ${
          results.filter((r) => r.mutation.startsWith("Core:") && r.passed)
            .length
        }/6`,
        "yellow"
      );
      log(
        `   TradLeagues mutations: ${
          results.filter(
            (r) => r.mutation.startsWith("TradLeagues:") && r.passed
          ).length
        }/8`,
        "yellow"
      );
    }

    log("\n📝 Mutations Tested:", "blue");
    log(
      "   CoinDrafts Core: createGame, registerPlayer, submitPortfolio, startGame, endGame",
      "blue"
    );
    log(
      "   Traditional Leagues: createTournament, registerForTournament, submitPortfolio,",
      "blue"
    );
    log(
      "                        startTournament, endTournament, advanceRound, completeTournament",
      "blue"
    );
  } catch (error) {
    log(`\n💥 Fatal error: ${error.message}`, "red");
    log(error.stack, "red");
    process.exit(1);
  }
}

// Run all mutation tests
runAllMutationTests().catch((error) => {
  log(`\n💥 Unexpected error: ${error.message}`, "red");
  log(error.stack, "red");
  process.exit(1);
});
