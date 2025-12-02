#!/usr/bin/env node
/**
 * Complete User Flow Testing Script
 * Tests ALL possible user journeys end-to-end
 */

const GRAPHQL_BASE = "http://localhost:8081";
const DEFAULT_CHAIN_ID =
  "5a07c2f9581f4810e4b4a7bb31272415ee0625de746fd2e6cdadbf05d534fd1a";
const TRADITIONAL_LEAGUES_APP_ID =
  "50e9c59f8dde20fc9d0427a053210157375be7078cf56b1cf2a7ca2bf0c9e745";
const ENDPOINT = `${GRAPHQL_BASE}/chains/${DEFAULT_CHAIN_ID}/applications/${TRADITIONAL_LEAGUES_APP_ID}`;

// Test player chains
const PLAYER_1 =
  "1111111111111111111111111111111111111111111111111111111111111111";
const PLAYER_2 =
  "2222222222222222222222222222222222222222222222222222222222222222";
const PLAYER_3 =
  "3333333333333333333333333333333333333333333333333333333333333333";

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
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const result = await response.json();
  if (result.errors) throw new Error(JSON.stringify(result.errors));
  return result.data;
}

// ========== USER FLOW TESTS ==========

async function flow1_ViewSchema() {
  log("\n📋 FLOW 1: Verify GraphQL Schema", "magenta");
  log("=".repeat(80), "magenta");

  try {
    const data = await graphql(`
      query {
        __type(name: "Tournament") {
          name
          fields {
            name
            type {
              name
              kind
            }
          }
        }
      }
    `);

    const fields = data.__type.fields.map((f) => f.name);
    log(`  Found ${fields.length} fields: ${fields.join(", ")}`, "blue");

    const hasCategory = fields.includes("category");
    log(
      hasCategory
        ? "  ✅ category field exists"
        : "  ❌ category field MISSING",
      hasCategory ? "green" : "red"
    );

    return hasCategory;
  } catch (error) {
    log(`  ❌ Schema introspection failed: ${error.message}`, "red");
    return false;
  }
}

async function flow2_ViewTournaments() {
  log("\n📋 FLOW 2: User Views Tournament List", "magenta");
  log("=".repeat(80), "magenta");

  try {
    const data = await graphql(`
      query {
        tournaments {
          id
          name
          category
          status
          entryFee
          maxParticipants
          currentParticipants
        }
      }
    `);

    const tournaments = data.tournaments || [];
    log(`  📊 Found ${tournaments.length} tournament(s)`, "blue");

    if (tournaments.length > 0) {
      tournaments.forEach((t, i) => {
        log(
          `    ${i + 1}. ${t.name} [${t.category || "NO CATEGORY"}] - ${
            t.status
          }`,
          "blue"
        );
      });
    } else {
      log("    No tournaments yet - database is empty", "yellow");
    }

    return true;
  } catch (error) {
    log(`  ❌ Query failed: ${error.message}`, "red");
    return false;
  }
}

async function flow3_CreateL1Tournament() {
  log("\n📋 FLOW 3: User Creates L1 Chains Tournament", "magenta");
  log("=".repeat(80), "magenta");

  const l1Cryptos = [
    "bitcoin",
    "ethereum",
    "solana",
    "cardano",
    "polkadot",
    "avalanche",
    "algorand",
    "cosmos",
    "near",
    "aptos",
  ];
  const now = Date.now();

  try {
    const data = await graphql(
      `
        mutation CreateTournament(
          $name: String!
          $category: String!
          $entryFee: String!
          $maxPortfolioSize: Int!
          $startTime: String!
          $endTime: String!
          $cryptos: [String!]!
        ) {
          createTournament(
            name: $name
            category: $category
            entryFee: $entryFee
            maxPortfolioSize: $maxPortfolioSize
            startTime: $startTime
            endTime: $endTime
            cryptos: $cryptos
          )
        }
      `,
      {
        name: `L1 Championship ${now}`,
        category: "L1_CHAINS",
        entryFee: "10",
        maxPortfolioSize: 5,
        startTime: (now + 60000).toString(),
        endTime: (now + 3600000).toString(),
        cryptos: l1Cryptos,
      }
    );

    const tournamentId = data.createTournament;
    log(`  ✅ Tournament created: ${tournamentId}`, "green");
    log(`    Category: L1_CHAINS`, "blue");
    log(`    Cryptos: ${l1Cryptos.slice(0, 3).join(", ")}...`, "blue");

    return tournamentId;
  } catch (error) {
    log(`  ❌ Creation failed: ${error.message}`, "red");
    return null;
  }
}

async function flow4_CreateMultipleCategories() {
  log(
    "\n📋 FLOW 4: User Creates Tournaments in Different Categories",
    "magenta"
  );
  log("=".repeat(80), "magenta");

  const categories = [
    {
      name: "L2_CHAINS",
      cryptos: ["arbitrum", "optimism", "polygon", "base", "zksync"],
    },
    {
      name: "MEME_COINS",
      cryptos: ["dogecoin", "shiba-inu", "pepe", "bonk", "floki"],
    },
    {
      name: "DEFI_TOKENS",
      cryptos: ["uniswap", "aave", "maker", "compound", "curve-dao-token"],
    },
  ];

  const results = [];
  const now = Date.now();

  for (const cat of categories) {
    try {
      const data = await graphql(
        `
          mutation (
            $name: String!
            $category: String!
            $entryFee: String!
            $maxPortfolioSize: Int!
            $startTime: String!
            $endTime: String!
            $cryptos: [String!]!
          ) {
            createTournament(
              name: $name
              category: $category
              entryFee: $entryFee
              maxPortfolioSize: $maxPortfolioSize
              startTime: $startTime
              endTime: $endTime
              cryptos: $cryptos
            )
          }
        `,
        {
          name: `${cat.name} Tournament ${now}`,
          category: cat.name,
          entryFee: "5",
          maxPortfolioSize: 5,
          startTime: (now + 120000).toString(),
          endTime: (now + 7200000).toString(),
          cryptos: cat.cryptos,
        }
      );

      log(`  ✅ ${cat.name}: ${data.createTournament}`, "green");
      results.push({
        category: cat.name,
        id: data.createTournament,
        success: true,
      });
    } catch (error) {
      log(`  ❌ ${cat.name}: ${error.message}`, "red");
      results.push({ category: cat.name, success: false });
    }

    await new Promise((r) => setTimeout(r, 300)); // Small delay
  }

  const successCount = results.filter((r) => r.success).length;
  log(
    `\n  📊 Created ${successCount}/${categories.length} tournaments`,
    successCount === categories.length ? "green" : "yellow"
  );

  return results;
}

async function flow5_FilterByCategory() {
  log("\n📋 FLOW 5: User Filters Tournaments by Category", "magenta");
  log("=".repeat(80), "magenta");

  try {
    const data = await graphql(`
      query {
        tournaments {
          id
          name
          category
        }
      }
    `);

    const tournaments = data.tournaments || [];
    const byCategory = {};

    tournaments.forEach((t) => {
      const cat = t.category || "UNKNOWN";
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(t.name);
    });

    Object.entries(byCategory).forEach(([cat, names]) => {
      log(`  📁 ${cat}: ${names.length} tournament(s)`, "blue");
      names.forEach((name) => log(`     - ${name}`, "blue"));
    });

    return Object.keys(byCategory).length > 0;
  } catch (error) {
    log(`  ❌ Filter failed: ${error.message}`, "red");
    return false;
  }
}

async function flow6_PlayerJoinsTournament(
  tournamentId,
  playerChain,
  playerName
) {
  log(`\n📋 FLOW 6: ${playerName} Joins Tournament`, "magenta");
  log("=".repeat(80), "magenta");

  try {
    const data = await graphql(
      `
        mutation RegisterPlayer(
          $tournamentId: String!
          $playerChainId: String!
        ) {
          registerForTournament(
            tournamentId: $tournamentId
            playerChainId: $playerChainId
          )
        }
      `,
      {
        tournamentId,
        playerChainId: playerChain,
      }
    );

    log(`  ✅ ${playerName} successfully joined!`, "green");
    log(`    Chain ID: ${playerChain.slice(0, 8)}...`, "blue");

    return true;
  } catch (error) {
    log(`  ❌ Join failed: ${error.message}`, "red");
    return false;
  }
}

async function flow7_SubmitPortfolio(tournamentId, playerChain) {
  log("\n📋 FLOW 7: Player Submits Portfolio Draft", "magenta");
  log("=".repeat(80), "magenta");

  const portfolio = ["BTC", "ETH", "SOL", "ADA", "DOT"]; // Top 5 picks

  try {
    const data = await graphql(
      `
        mutation SubmitPortfolio(
          $tournamentId: String!
          $round: Int!
          $portfolio: PortfolioInput!
        ) {
          submitTournamentPortfolio(
            tournamentId: $tournamentId
            round: $round
            portfolio: $portfolio
          )
        }
      `,
      {
        tournamentId,
        round: 1,
        portfolio: {
          crypto_picks: portfolio,
          strategy_notes: "Going with top L1 chains",
        },
      }
    );

    log(`  ✅ Portfolio submitted!`, "green");
    log(`    Picks: ${portfolio.join(", ")}`, "blue");

    return true;
  } catch (error) {
    log(`  ❌ Portfolio submission failed: ${error.message}`, "red");
    return false;
  }
}

async function flow8_MultiplePlayersJoin(tournamentId) {
  log("\n📋 FLOW 8: Multiple Players Join Same Tournament", "magenta");
  log("=".repeat(80), "magenta");

  const players = [
    { chain: PLAYER_2, name: "Player2" },
    { chain: PLAYER_3, name: "Player3" },
  ];

  const results = [];

  for (const player of players) {
    try {
      await graphql(
        `
          mutation ($tournamentId: String!, $playerChainId: String!) {
            registerForTournament(
              tournamentId: $tournamentId
              playerChainId: $playerChainId
            )
          }
        `,
        {
          tournamentId,
          playerChainId: player.chain,
        }
      );

      log(`  ✅ ${player.name} joined`, "green");
      results.push(true);
    } catch (error) {
      log(`  ❌ ${player.name} failed: ${error.message}`, "red");
      results.push(false);
    }

    await new Promise((r) => setTimeout(r, 200));
  }

  return results.every((r) => r);
}

async function flow9_ViewParticipants(tournamentId) {
  log("\n📋 FLOW 9: User Views Tournament Participants", "magenta");
  log("=".repeat(80), "magenta");

  try {
    const data = await graphql(
      `
        query GetParticipants($tournamentId: String!) {
          tournamentParticipants(tournamentId: $tournamentId)
        }
      `,
      { tournamentId }
    );

    const participants = data.tournamentParticipants || [];
    log(`  📊 ${participants.length} participant(s) registered`, "blue");

    participants.forEach((p, i) => {
      log(`    ${i + 1}. Chain: ${p.slice(0, 12)}...`, "blue");
    });

    return true;
  } catch (error) {
    log(`  ❌ Query failed: ${error.message}`, "red");
    return false;
  }
}

async function flow10_ErrorHandling() {
  log("\n📋 FLOW 10: Error Handling - Invalid Data", "magenta");
  log("=".repeat(80), "magenta");

  let errorsHandled = 0;

  // Test 1: Invalid category
  try {
    await graphql(
      `
        mutation (
          $name: String!
          $category: String!
          $entryFee: String!
          $maxPortfolioSize: Int!
          $startTime: String!
          $endTime: String!
          $cryptos: [String!]!
        ) {
          createTournament(
            name: $name
            category: $category
            entryFee: $entryFee
            maxPortfolioSize: $maxPortfolioSize
            startTime: $startTime
            endTime: $endTime
            cryptos: $cryptos
          )
        }
      `,
      {
        name: "Bad Tournament",
        category: "INVALID_CATEGORY_XYZ",
        entryFee: "10",
        maxPortfolioSize: 5,
        startTime: Date.now().toString(),
        endTime: (Date.now() + 3600000).toString(),
        cryptos: ["bitcoin"],
      }
    );
    log("  ⚠️  Invalid category accepted (should reject)", "yellow");
  } catch (error) {
    log("  ✅ Invalid category rejected correctly", "green");
    errorsHandled++;
  }

  // Test 2: Empty crypto list
  try {
    await graphql(
      `
        mutation (
          $name: String!
          $category: String!
          $entryFee: String!
          $maxPortfolioSize: Int!
          $startTime: String!
          $endTime: String!
          $cryptos: [String!]!
        ) {
          createTournament(
            name: $name
            category: $category
            entryFee: $entryFee
            maxPortfolioSize: $maxPortfolioSize
            startTime: $startTime
            endTime: $endTime
            cryptos: $cryptos
          )
        }
      `,
      {
        name: "Empty Cryptos",
        category: "L1_CHAINS",
        entryFee: "10",
        maxPortfolioSize: 5,
        startTime: Date.now().toString(),
        endTime: (Date.now() + 3600000).toString(),
        cryptos: [],
      }
    );
    log("  ⚠️  Empty crypto list accepted (should reject)", "yellow");
  } catch (error) {
    log("  ✅ Empty crypto list rejected correctly", "green");
    errorsHandled++;
  }

  log(
    `\n  📊 ${errorsHandled}/2 error cases handled correctly`,
    errorsHandled === 2 ? "green" : "yellow"
  );
  return errorsHandled === 2;
}

// ========== MAIN TEST RUNNER ==========

async function runAllFlows() {
  log("\n🚀 COMPLETE USER FLOW TESTING", "cyan");
  log("=".repeat(80), "cyan");
  log(`Endpoint: ${ENDPOINT}\n`);

  const results = [];
  let l1TournamentId = null;

  try {
    results.push({
      flow: "Schema Validation",
      passed: await flow1_ViewSchema(),
    });
    results.push({
      flow: "View Tournaments",
      passed: await flow2_ViewTournaments(),
    });

    l1TournamentId = await flow3_CreateL1Tournament();
    results.push({ flow: "Create L1 Tournament", passed: !!l1TournamentId });

    const multiResults = await flow4_CreateMultipleCategories();
    results.push({
      flow: "Create Multiple Categories",
      passed: multiResults.every((r) => r.success),
    });

    results.push({
      flow: "Filter by Category",
      passed: await flow5_FilterByCategory(),
    });

    if (l1TournamentId) {
      results.push({
        flow: "Player Joins Tournament",
        passed: await flow6_PlayerJoinsTournament(
          l1TournamentId,
          PLAYER_1,
          "Player1"
        ),
      });
      results.push({
        flow: "Submit Portfolio",
        passed: await flow7_SubmitPortfolio(l1TournamentId, PLAYER_1),
      });
      results.push({
        flow: "Multiple Players Join",
        passed: await flow8_MultiplePlayersJoin(l1TournamentId),
      });
      results.push({
        flow: "View Participants",
        passed: await flow9_ViewParticipants(l1TournamentId),
      });
    }

    results.push({
      flow: "Error Handling",
      passed: await flow10_ErrorHandling(),
    });

    // FINAL SUMMARY
    log("\n" + "=".repeat(80), "cyan");
    log("📊 COMPLETE TEST RESULTS", "cyan");
    log("=".repeat(80), "cyan");

    results.forEach((test) => {
      const status = test.passed ? "✅ PASS" : "❌ FAIL";
      const color = test.passed ? "green" : "red";
      log(`${status} - ${test.flow}`, color);
    });

    const passed = results.filter((t) => t.passed).length;
    const total = results.length;
    const percentage = Math.round((passed / total) * 100);

    log("\n" + "=".repeat(80), "cyan");
    log(
      `Overall: ${passed}/${total} flows passed (${percentage}%)`,
      passed === total ? "green" : "yellow"
    );
    log("=".repeat(80), "cyan");

    if (passed === total) {
      log("\n🎉 ALL USER FLOWS WORKING! Ready for production!", "green");
    } else if (passed === 0) {
      log(
        "\n❌ All flows failed. Check Docker: docker-compose up --build",
        "red"
      );
    } else {
      log("\n⚠️  Some flows failed. Review output above.", "yellow");
    }
  } catch (error) {
    log(`\n💥 Fatal error: ${error.message}`, "red");
    process.exit(1);
  }
}

// Run all flows
runAllFlows().catch((error) => {
  log(`\n💥 Unexpected error: ${error.message}`, "red");
  process.exit(1);
});
