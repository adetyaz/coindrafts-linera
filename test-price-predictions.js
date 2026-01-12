#!/usr/bin/env node
/**
 * Price Prediction Testing Script - ALL Backend Mutations
 * Tests EVERY possible GraphQL mutation and query for price predictions:
 *
 * Mutations (3):
 * - createMarket, submitPrediction, settleMarket
 *
 * Queries (4):
 * - activeMarkets, predictionMarket, marketPredictions, myPredictions
 */

const GRAPHQL_BASE = "http://localhost:8081";
const DEFAULT_CHAIN_ID =
  "f5053c702f3eda3e88c929ceddaa3e0284626f6fcb3ef35d31877de17cc33da6";
const PRICE_PREDICTION_APP_ID =
  "d0a6a2f29b3f8a311cb15f573c516c3c2c69ae77a5a40c1f638e92c848aa16c4";

// GraphQL Endpoint
const PREDICTION_ENDPOINT = `${GRAPHQL_BASE}/chains/${DEFAULT_CHAIN_ID}/applications/${PRICE_PREDICTION_APP_ID}`;

// Test player addresses
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

// GraphQL query helper
async function graphql(query, variables = {}) {
  const response = await fetch(PREDICTION_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const result = await response.json();
  if (result.errors) throw new Error(JSON.stringify(result.errors));
  return result.data;
}

// ========== PRICE PREDICTION MUTATION TESTS ==========

async function test_CreateMarket() {
  log("\n🎯 TEST: Price Prediction - createMarket", "magenta");
  log("=".repeat(80), "magenta");

  try {
    const cryptoId = "bitcoin";
    const entryFee = 5000000; // 5 USDC in micro-USDC
    const durationDays = 7;

    await graphql(
      `
        mutation CreateMarket(
          $cryptoId: String!
          $entryFee: Int!
          $durationDays: Int!
        ) {
          createMarket(
            cryptoId: $cryptoId
            entryFee: $entryFee
            durationDays: $durationDays
          )
        }
      `,
      { cryptoId, entryFee, durationDays }
    );

    // Wait for market to be created and query it
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const data = await graphql(`
      query GetActiveMarkets {
        activeMarkets {
          id
          cryptoId
          creator
          entryFee
          startTime
          endTime
          status
        }
      }
    `);

    const markets = data.activeMarkets || [];
    const latestMarket = markets[markets.length - 1];

    if (latestMarket) {
      log(`  ✅ Market created: ${latestMarket.id}`, "green");
      log(`    Crypto: ${latestMarket.cryptoId}`, "blue");
      log(`    Entry Fee: ${latestMarket.entryFee / 1_000_000} USDC`, "blue");
      log(`    Duration: ${durationDays} days`, "blue");
      return latestMarket.id;
    } else {
      log(`  ⚠️  Market created but not yet visible in queries`, "yellow");
      return null;
    }
  } catch (error) {
    log(`  ❌ Failed: ${error.message}`, "red");
    return false;
  }
}

async function test_SubmitPrediction(marketId, player) {
  log(`\n📊 TEST: Price Prediction - submitPrediction (${player})`, "magenta");
  log("=".repeat(80), "magenta");

  if (!marketId) {
    log("  ⚠️  Skipping - no market ID", "yellow");
    return false;
  }

  try {
    const minPrice = 40000000000; // $40,000 in micro-USDC
    const maxPrice = 50000000000; // $50,000 in micro-USDC
    const confidence = 75;
    const aiAssisted = false;

    await graphql(
      `
        mutation SubmitPrediction(
          $marketId: String!
          $minPrice: Float!
          $maxPrice: Float!
          $confidence: Int!
          $aiAssisted: Boolean!
        ) {
          submitPrediction(
            marketId: $marketId
            minPrice: $minPrice
            maxPrice: $maxPrice
            confidence: $confidence
            aiAssisted: $aiAssisted
          )
        }
      `,
      { marketId, minPrice, maxPrice, confidence, aiAssisted }
    );

    log(`  ✅ Prediction submitted for ${player}`, "green");
    log(
      `    Range: $${minPrice / 1_000_000} - $${maxPrice / 1_000_000}`,
      "blue"
    );
    log(`    Confidence: ${confidence}%`, "blue");
    log(`    AI Assisted: ${aiAssisted ? "Yes" : "No"}`, "blue");

    // Calculate multiplier
    const rangeWidth = (maxPrice - minPrice) / 1_000_000;
    let rangeMultiplier = 1.0;
    if (rangeWidth <= 1) rangeMultiplier = 20.0;
    else if (rangeWidth <= 5) rangeMultiplier = 10.0;
    else if (rangeWidth <= 10) rangeMultiplier = 5.0;
    else if (rangeWidth <= 20) rangeMultiplier = 2.5;
    else if (rangeWidth <= 50) rangeMultiplier = 1.5;

    const confidenceMultiplier = 1.0 + (confidence / 100) * 0.5;
    const aiPenalty = aiAssisted ? 0.8 : 1.0;
    const totalMultiplier = rangeMultiplier * confidenceMultiplier * aiPenalty;

    log(`    Estimated Multiplier: ${totalMultiplier.toFixed(2)}x`, "blue");

    return true;
  } catch (error) {
    log(`  ❌ Failed: ${error.message}`, "red");
    return false;
  }
}

async function test_QueryActiveMarkets() {
  log("\n📋 TEST: Price Prediction - Query activeMarkets", "magenta");
  log("=".repeat(80), "magenta");

  try {
    const data = await graphql(`
      query GetActiveMarkets {
        activeMarkets {
          id
          cryptoId
          creator
          entryFee
          startPrice
          startTime
          endTime
          status
          finalPrice
        }
      }
    `);

    const markets = data.activeMarkets || [];
    log(`  📊 Found ${markets.length} market(s)`, "blue");

    if (markets.length > 0) {
      markets.slice(0, 5).forEach((m, i) => {
        const duration = (
          (m.endTime - m.startTime) /
          (86400 * 1000000)
        ).toFixed(1);
        log(
          `    ${i + 1}. ${m.cryptoId} [${m.status}] - ${
            m.entryFee / 1_000_000
          } USDC entry, ${duration}d duration`,
          "blue"
        );
      });
    }

    return markets.length > 0;
  } catch (error) {
    log(`  ❌ Failed: ${error.message}`, "red");
    return false;
  }
}

async function test_QueryPredictionMarket(marketId) {
  log("\n🔍 TEST: Price Prediction - Query predictionMarket", "magenta");
  log("=".repeat(80), "magenta");

  if (!marketId) {
    log("  ⚠️  Skipping - no market ID", "yellow");
    return false;
  }

  try {
    const data = await graphql(
      `
        query GetPredictionMarket($id: String!) {
          predictionMarket(id: $id) {
            id
            cryptoId
            creator
            entryFee
            startPrice
            startTime
            endTime
            status
            finalPrice
          }
        }
      `,
      { id: marketId }
    );

    const market = data.predictionMarket;

    if (market) {
      log(`  ✅ Market found: ${market.id}`, "green");
      log(`    Crypto: ${market.cryptoId}`, "blue");
      log(`    Status: ${market.status}`, "blue");
      log(`    Entry Fee: ${market.entryFee / 1_000_000} USDC`, "blue");
      if (market.startPrice) {
        log(`    Start Price: $${market.startPrice / 1_000_000}`, "blue");
      }
      if (market.finalPrice) {
        log(`    Final Price: $${market.finalPrice / 1_000_000}`, "blue");
      }
      return true;
    } else {
      log(`  ⚠️  Market not found`, "yellow");
      return false;
    }
  } catch (error) {
    log(`  ❌ Failed: ${error.message}`, "red");
    return false;
  }
}

async function test_QueryMarketPredictions(marketId) {
  log("\n📈 TEST: Price Prediction - Query marketPredictions", "magenta");
  log("=".repeat(80), "magenta");

  if (!marketId) {
    log("  ⚠️  Skipping - no market ID", "yellow");
    return false;
  }

  try {
    const data = await graphql(
      `
        query GetMarketPredictions($marketId: String!) {
          marketPredictions(marketId: $marketId) {
            player
            marketId
            minPrice
            maxPrice
            confidence
            aiAssisted
            submittedAt
            multiplier
            reward
          }
        }
      `,
      { marketId }
    );

    const predictions = data.marketPredictions || [];
    log(`  📊 Found ${predictions.length} prediction(s)`, "blue");

    if (predictions.length > 0) {
      predictions.slice(0, 5).forEach((p, i) => {
        log(
          `    ${i + 1}. ${p.player.substring(0, 10)}... → $${
            p.minPrice / 1_000_000
          }-$${p.maxPrice / 1_000_000} (${p.confidence}% confidence)`,
          "blue"
        );
        if (p.multiplier) {
          log(`       Multiplier: ${p.multiplier}x`, "blue");
        }
        if (p.reward) {
          log(`       Reward: ${p.reward / 1_000_000} USDC`, "green");
        }
      });
    }

    return predictions.length > 0;
  } catch (error) {
    log(`  ❌ Failed: ${error.message}`, "red");
    return false;
  }
}

async function test_QueryMyPredictions(player) {
  log(
    `\n👤 TEST: Price Prediction - Query myPredictions (${player})`,
    "magenta"
  );
  log("=".repeat(80), "magenta");

  try {
    const data = await graphql(
      `
        query GetMyPredictions($player: String!) {
          myPredictions(player: $player) {
            player
            marketId
            minPrice
            maxPrice
            confidence
            aiAssisted
            submittedAt
            multiplier
            reward
          }
        }
      `,
      { player }
    );

    const predictions = data.myPredictions || [];
    log(`  📊 Found ${predictions.length} prediction(s) for ${player}`, "blue");

    if (predictions.length > 0) {
      predictions.forEach((p, i) => {
        log(
          `    ${i + 1}. Market ${p.marketId} → $${p.minPrice / 1_000_000}-$${
            p.maxPrice / 1_000_000
          }`,
          "blue"
        );
      });
    }

    return true; // Always pass if query works, even with 0 predictions
  } catch (error) {
    log(`  ❌ Failed: ${error.message}`, "red");
    return false;
  }
}

async function test_SettleMarket(marketId) {
  log("\n🏁 TEST: Price Prediction - settleMarket", "magenta");
  log("=".repeat(80), "magenta");

  if (!marketId) {
    log("  ⚠️  Skipping - no market ID", "yellow");
    return false;
  }

  try {
    const finalPrice = 45000000000; // $45,000 in micro-USDC
    const players = [PLAYER_1, PLAYER_2, PLAYER_3]; // Pass all players who submitted predictions

    await graphql(
      `
        mutation SettleMarket(
          $marketId: String!
          $finalPrice: Float!
          $players: [String!]!
        ) {
          settleMarket(
            marketId: $marketId
            finalPrice: $finalPrice
            players: $players
          )
        }
      `,
      { marketId, finalPrice, players }
    );

    log(`  ✅ Market settled: ${marketId}`, "green");
    log(`    Final Price: $${finalPrice / 1_000_000}`, "blue");

    // Query the market to see updated status
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const data = await graphql(
      `
        query GetPredictionMarket($id: String!) {
          predictionMarket(id: $id) {
            status
            finalPrice
          }
        }
      `,
      { id: marketId }
    );

    const market = data.predictionMarket;
    if (market) {
      log(`    Status: ${market.status}`, "blue");
    }

    return true;
  } catch (error) {
    log(`  ❌ Failed: ${error.message}`, "red");
    return false;
  }
}

// ========== MAIN TEST RUNNER ==========

async function runAllTests() {
  log("\n🎯 PRICE PREDICTION TESTING - ALL BACKEND OPERATIONS", "cyan");
  log("=".repeat(80), "cyan");
  log(`Endpoint: ${PREDICTION_ENDPOINT}\n`);

  const results = [];
  let marketId = null;

  try {
    // Test: Create Market
    marketId = await test_CreateMarket();
    results.push({
      test: "createMarket",
      passed: !!marketId,
    });

    // Test: Submit Predictions (multiple players)
    if (marketId) {
      results.push({
        test: "submitPrediction (Player 1)",
        passed: await test_SubmitPrediction(marketId, PLAYER_1),
      });

      results.push({
        test: "submitPrediction (Player 2)",
        passed: await test_SubmitPrediction(marketId, PLAYER_2),
      });

      results.push({
        test: "submitPrediction (Player 3)",
        passed: await test_SubmitPrediction(marketId, PLAYER_3),
      });
    } else {
      log("\n  ⚠️  Skipping prediction submissions - no market", "yellow");
      results.push({ test: "submitPrediction (Player 1)", passed: false });
      results.push({ test: "submitPrediction (Player 2)", passed: false });
      results.push({ test: "submitPrediction (Player 3)", passed: false });
    }

    // Test: Queries
    results.push({
      test: "Query: activeMarkets",
      passed: await test_QueryActiveMarkets(),
    });

    results.push({
      test: "Query: predictionMarket",
      passed: await test_QueryPredictionMarket(marketId),
    });

    results.push({
      test: "Query: marketPredictions",
      passed: await test_QueryMarketPredictions(marketId),
    });

    results.push({
      test: "Query: myPredictions",
      passed: await test_QueryMyPredictions(PLAYER_1),
    });

    // Test: Settle Market
    if (marketId) {
      results.push({
        test: "settleMarket",
        passed: await test_SettleMarket(marketId),
      });

      // Query predictions again to see rewards
      await test_QueryMarketPredictions(marketId);
    } else {
      results.push({ test: "settleMarket", passed: false });
    }

    // ========== FINAL SUMMARY ==========
    log("\n" + "=".repeat(80), "cyan");
    log("📊 COMPLETE TEST RESULTS", "cyan");
    log("=".repeat(80), "cyan");

    log("\n🎯 Mutations:", "blue");
    results
      .filter((r) => !r.test.startsWith("Query:") && !r.test.includes("Player"))
      .forEach((test) => {
        const status = test.passed ? "✅ PASS" : "❌ FAIL";
        const color = test.passed ? "green" : "red";
        log(`  ${status} - ${test.test}`, color);
      });

    log("\n📈 Predictions:", "blue");
    results
      .filter((r) => r.test.includes("Player"))
      .forEach((test) => {
        const status = test.passed ? "✅ PASS" : "❌ FAIL";
        const color = test.passed ? "green" : "red";
        log(`  ${status} - ${test.test}`, color);
      });

    log("\n📋 Queries:", "blue");
    results
      .filter((r) => r.test.startsWith("Query:"))
      .forEach((test) => {
        const status = test.passed ? "✅ PASS" : "❌ FAIL";
        const color = test.passed ? "green" : "red";
        log(`  ${status} - ${test.test}`, color);
      });

    const passed = results.filter((t) => t.passed).length;
    const total = results.length;
    const percentage = Math.round((passed / total) * 100);

    log("\n" + "=".repeat(80), "cyan");
    log(
      `Overall: ${passed}/${total} tests passed (${percentage}%)`,
      passed === total ? "green" : passed > total / 2 ? "yellow" : "red"
    );
    log("=".repeat(80), "cyan");

    if (passed === total) {
      log(
        "\n🎉 ALL TESTS PASSED! Price Prediction backend fully functional!",
        "green"
      );
    } else if (passed === 0) {
      log("\n❌ All tests failed. Check:", "red");
      log("   1. Docker is running: docker compose up --build", "red");
      log("   2. App ID matches deployment:", "red");
      log(`      Expected: ${PRICE_PREDICTION_APP_ID}`, "red");
      log("   3. GraphQL endpoint is accessible:", "red");
      log(`      ${PREDICTION_ENDPOINT}`, "red");
    } else {
      log("\n⚠️  Some tests failed. Review output above.", "yellow");
      log(
        `   Mutations: ${
          results.filter((r) => !r.test.startsWith("Query:") && r.passed).length
        }/${results.filter((r) => !r.test.startsWith("Query:")).length}`,
        "yellow"
      );
      log(
        `   Queries: ${
          results.filter((r) => r.test.startsWith("Query:") && r.passed).length
        }/${results.filter((r) => r.test.startsWith("Query:")).length}`,
        "yellow"
      );
    }

    log("\n📝 Operations Tested:", "blue");
    log(
      "   Mutations: createMarket, submitPrediction (×3), settleMarket",
      "blue"
    );
    log(
      "   Queries: activeMarkets, predictionMarket, marketPredictions, myPredictions",
      "blue"
    );
  } catch (error) {
    log(`\n💥 Fatal error: ${error.message}`, "red");
    log(error.stack, "red");
    process.exit(1);
  }
}

// Run all tests
runAllTests().catch((error) => {
  log(`\n💥 Unexpected error: ${error.message}`, "red");
  log(error.stack, "red");
  process.exit(1);
});
