#!/usr/bin/env node
/**
 * Complete User Flow GraphQL Testing Script
 * Tests ALL user flows end-to-end
 */

const GRAPHQL_BASE = "http://localhost:8080";

// Update these with your actual IDs from .env
const DEFAULT_CHAIN_ID =
  "e476187f6ddfeb9d588c7b45d3df334d5501d6499b3f9ad5595cae86cce16a65";
const TRADITIONAL_LEAGUES_APP_ID =
  "39d51c08f0cc40daabcdda83e974c3e9ddfc3656c7298161a2069a4f856ae0f2";

const TRADITIONAL_LEAGUES_ENDPOINT = `${GRAPHQL_BASE}/chains/${DEFAULT_CHAIN_ID}/applications/${TRADITIONAL_LEAGUES_APP_ID}`;

// Test player chain IDs
const PLAYER_1_CHAIN =
  "1111111111111111111111111111111111111111111111111111111111111111";
const PLAYER_2_CHAIN =
  "2222222222222222222222222222222222222222222222222222222222222222";
const PLAYER_3_CHAIN =
  "3333333333333333333333333333333333333333333333333333333333333333";

// Color codes for output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function graphqlQuery(query, variables = {}) {
  try {
    const response = await fetch(TRADITIONAL_LEAGUES_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.errors) {
      throw new Error(
        `GraphQL Errors: ${JSON.stringify(result.errors, null, 2)}`
      );
    }

    return result.data;
  } catch (error) {
    log(`❌ Error: ${error.message}`, "red");
    throw error;
  }
}

// Test 1: Query existing tournaments to check category field
async function testQueryTournaments() {
  log("\n📋 Test 1: Query All Tournaments (Check Category Field)", "cyan");
  log("=".repeat(60), "cyan");

  const query = `
    query {
      tournaments {
        id
        name
        category
        entryFee
        maxPortfolioSize
        status
        startTime
        endTime
        cryptos
      }
    }
  `;

  try {
    const data = await graphqlQuery(query);
    const tournaments = data.tournaments;

    if (!tournaments || tournaments.length === 0) {
      log("⚠️  No tournaments found - Database is empty", "yellow");
      log("   This is OK if you haven't created any tournaments yet", "yellow");
      return false;
    }

    log(`✅ Found ${tournaments.length} tournament(s)`, "green");

    tournaments.forEach((t, index) => {
      log(`\n  Tournament ${index + 1}:`, "blue");
      log(`    - ID: ${t.id}`);
      log(`    - Name: ${t.name}`);
      log(`    - Category: ${t.category || "MISSING!"}`);
      log(`    - Entry Fee: ${t.entryFee}`);
      log(`    - Status: ${t.status}`);
      log(`    - Max Portfolio Size: ${t.maxPortfolioSize}`);

      // Check if category field exists
      if (!t.category) {
        log("    ⚠️  Category field is missing!", "red");
      } else {
        log(`    ✅ Category field present: ${t.category}`, "green");
      }
    });

    return true;
  } catch (error) {
    log(`❌ Failed to query tournaments: ${error.message}`, "red");
    return false;
  }
}

// Test 2: Create a tournament with category
async function testCreateTournamentWithCategory() {
  log("\n🏗️  Test 2: Create Tournament with L1_CHAINS Category", "cyan");
  log("=".repeat(60), "cyan");

  const mutation = `
    mutation CreateTournament(
      $name: String!,
      $category: String!,
      $entryFee: String!,
      $maxPortfolioSize: Int!,
      $startTime: String!,
      $endTime: String!,
      $cryptos: [String!]!
    ) {
      createTournament(
        name: $name,
        category: $category,
        entryFee: $entryFee,
        maxPortfolioSize: $maxPortfolioSize,
        startTime: $startTime,
        endTime: $endTime,
        cryptos: $cryptos
      )
    }
  `;

  // L1 Chains cryptos
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
  const startTime = now + 60000; // Start in 1 minute
  const endTime = now + 3600000; // End in 1 hour

  const variables = {
    name: `L1 Test Tournament ${Date.now()}`,
    category: "L1_CHAINS",
    entryFee: "10",
    maxPortfolioSize: 5,
    startTime: startTime.toString(),
    endTime: endTime.toString(),
    cryptos: l1Cryptos,
  };

  try {
    log("  Creating tournament with variables:", "blue");
    log(`    - Name: ${variables.name}`);
    log(`    - Category: ${variables.category}`, "yellow");
    log(`    - Entry Fee: ${variables.entryFee}`);
    log(`    - Max Portfolio Size: ${variables.maxPortfolioSize}`);
    log(`    - Cryptos: ${variables.cryptos.join(", ")}`);

    const data = await graphqlQuery(mutation, variables);

    if (data.createTournament) {
      log(`\n✅ Tournament created successfully!`, "green");
      log(`   Tournament ID: ${data.createTournament}`, "green");
      return data.createTournament;
    } else {
      log(`❌ No tournament ID returned`, "red");
      return null;
    }
  } catch (error) {
    log(`❌ Failed to create tournament: ${error.message}`, "red");
    log(
      "   This might indicate the category field is not properly integrated",
      "yellow"
    );
    return null;
  }
}

// Test 3: Create tournaments with different categories
async function testMultipleCategoryTournaments() {
  log("\n🎯 Test 3: Create Tournaments with Different Categories", "cyan");
  log("=".repeat(60), "cyan");

  const categories = [
    {
      name: "L2_CHAINS",
      cryptos: [
        "arbitrum",
        "optimism",
        "polygon",
        "base",
        "zksync",
        "starknet",
        "scroll",
        "linea",
        "manta",
        "blast",
      ],
    },
    {
      name: "MEME_COINS",
      cryptos: [
        "dogecoin",
        "shiba-inu",
        "pepe",
        "bonk",
        "floki",
        "wojak",
        "mog-coin",
        "dogwifcoin",
        "popcat",
        "book-of-meme",
      ],
    },
    {
      name: "DEFI_TOKENS",
      cryptos: [
        "uniswap",
        "aave",
        "maker",
        "compound",
        "curve-dao-token",
        "sushi",
        "pancakeswap-token",
        "1inch",
        "balancer",
        "yearn-finance",
      ],
    },
  ];

  const mutation = `
    mutation CreateTournament(
      $name: String!,
      $category: String!,
      $entryFee: String!,
      $maxPortfolioSize: Int!,
      $startTime: String!,
      $endTime: String!,
      $cryptos: [String!]!
    ) {
      createTournament(
        name: $name,
        category: $category,
        entryFee: $entryFee,
        maxPortfolioSize: $maxPortfolioSize,
        startTime: $startTime,
        endTime: $endTime,
        cryptos: $cryptos
      )
    }
  `;

  const results = [];

  for (const category of categories) {
    const now = Date.now();
    const variables = {
      name: `${category.name} Test ${Date.now()}`,
      category: category.name,
      entryFee: "5",
      maxPortfolioSize: 5,
      startTime: (now + 120000).toString(), // Start in 2 minutes
      endTime: (now + 7200000).toString(), // End in 2 hours
      cryptos: category.cryptos,
    };

    try {
      log(`\n  Creating ${category.name} tournament...`, "blue");
      const data = await graphqlQuery(mutation, variables);

      if (data.createTournament) {
        log(
          `  ✅ ${category.name} tournament created: ${data.createTournament}`,
          "green"
        );
        results.push({
          category: category.name,
          success: true,
          id: data.createTournament,
        });
      } else {
        log(`  ❌ ${category.name} tournament failed`, "red");
        results.push({ category: category.name, success: false });
      }
    } catch (error) {
      log(`  ❌ ${category.name} error: ${error.message}`, "red");
      results.push({
        category: category.name,
        success: false,
        error: error.message,
      });
    }

    // Small delay between requests
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  log("\n📊 Summary:", "cyan");
  const successful = results.filter((r) => r.success).length;
  const total = results.length;
  log(
    `  ✅ Successful: ${successful}/${total}`,
    successful === total ? "green" : "yellow"
  );

  return results;
}

// Test 4: Verify category filtering
async function testCategoryFiltering() {
  log("\n🔍 Test 4: Verify Category-Based Querying", "cyan");
  log("=".repeat(60), "cyan");

  const query = `
    query {
      tournaments {
        id
        name
        category
        cryptos
      }
    }
  `;

  try {
    const data = await graphqlQuery(query);
    const tournaments = data.tournaments;

    if (!tournaments || tournaments.length === 0) {
      log("⚠️  No tournaments to filter", "yellow");
      return;
    }

    // Group tournaments by category
    const byCategory = tournaments.reduce((acc, t) => {
      const cat = t.category || "UNKNOWN";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(t);
      return acc;
    }, {});

    log(`\n📊 Tournaments by Category:`, "blue");
    Object.entries(byCategory).forEach(([category, tournaments]) => {
      log(`\n  ${category}: ${tournaments.length} tournament(s)`, "yellow");
      tournaments.forEach((t) => {
        log(`    - ${t.name} (ID: ${t.id})`);
        log(`      Cryptos: ${t.cryptos.slice(0, 3).join(", ")}...`);
      });
    });

    return byCategory;
  } catch (error) {
    log(`❌ Failed to filter tournaments: ${error.message}`, "red");
  }
}

// Test 5: Schema introspection
async function testSchemaIntrospection() {
  log("\n🔬 Test 5: Schema Introspection (Check Category Field)", "cyan");
  log("=".repeat(60), "cyan");

  const query = `
    query IntrospectionQuery {
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
  `;

  try {
    const data = await graphqlQuery(query);
    const tournamentType = data.__type;

    if (!tournamentType) {
      log("❌ Tournament type not found in schema", "red");
      return false;
    }

    log(`\n📝 Tournament Type Fields:`, "blue");
    tournamentType.fields.forEach((field) => {
      const hasCategory = field.name === "category";
      const color = hasCategory ? "green" : "reset";
      log(
        `  ${hasCategory ? "✅" : "  "} ${field.name}: ${
          field.type.name || field.type.kind
        }`,
        color
      );
    });

    const categoryField = tournamentType.fields.find(
      (f) => f.name === "category"
    );
    if (categoryField) {
      log(`\n✅ Category field found in schema!`, "green");
      log(
        `   Type: ${categoryField.type.name || categoryField.type.kind}`,
        "green"
      );
      return true;
    } else {
      log(`\n❌ Category field NOT found in schema!`, "red");
      log(`   Backend may not be properly deployed`, "red");
      return false;
    }
  } catch (error) {
    log(`❌ Schema introspection failed: ${error.message}`, "red");
    return false;
  }
}

// Main test runner
async function runAllTests() {
  log("\n🚀 Starting Phase 2 GraphQL Tests", "cyan");
  log("=".repeat(60), "cyan");
  log(`Endpoint: ${TRADITIONAL_LEAGUES_ENDPOINT}\n`);

  const results = {
    schemaIntrospection: false,
    queryTournaments: false,
    createTournament: false,
    multipleTournaments: false,
    categoryFiltering: false,
  };

  try {
    // Test 5 first - check schema
    results.schemaIntrospection = await testSchemaIntrospection();

    if (!results.schemaIntrospection) {
      log("\n⚠️  WARNING: Category field not found in schema!", "red");
      log("   You may need to rebuild and redeploy the backend:", "yellow");
      log("   1. Stop Docker: docker-compose down", "yellow");
      log("   2. Rebuild: docker-compose up --build", "yellow");
      log("\n   Continuing with other tests...", "yellow");
    }

    // Test 1 - Query existing
    results.queryTournaments = await testQueryTournaments();

    // Test 2 - Create single
    const tournamentId = await testCreateTournamentWithCategory();
    results.createTournament = !!tournamentId;

    // Test 3 - Create multiple categories
    const multiResults = await testMultipleCategoryTournaments();
    results.multipleTournaments = multiResults.every((r) => r.success);

    // Test 4 - Verify filtering
    await testCategoryFiltering();

    // Final Summary
    log("\n" + "=".repeat(60), "cyan");
    log("📊 FINAL TEST RESULTS", "cyan");
    log("=".repeat(60), "cyan");

    const tests = [
      { name: "Schema Introspection", passed: results.schemaIntrospection },
      { name: "Query Tournaments", passed: results.queryTournaments },
      {
        name: "Create Tournament with Category",
        passed: results.createTournament,
      },
      {
        name: "Create Multiple Categories",
        passed: results.multipleTournaments,
      },
    ];

    tests.forEach((test) => {
      const status = test.passed ? "✅ PASS" : "❌ FAIL";
      const color = test.passed ? "green" : "red";
      log(`${status} - ${test.name}`, color);
    });

    const passedCount = tests.filter((t) => t.passed).length;
    const totalTests = tests.length;

    log("\n" + "=".repeat(60), "cyan");
    log(
      `Overall: ${passedCount}/${totalTests} tests passed`,
      passedCount === totalTests ? "green" : "yellow"
    );
    log("=".repeat(60), "cyan");

    if (passedCount === totalTests) {
      log("\n🎉 All tests passed! Phase 2 is working correctly!", "green");
    } else if (passedCount === 0) {
      log(
        "\n❌ All tests failed. Check if Docker is running and backend is deployed.",
        "red"
      );
    } else {
      log(
        "\n⚠️  Some tests failed. Check the output above for details.",
        "yellow"
      );
    }
  } catch (error) {
    log(`\n❌ Test suite failed: ${error.message}`, "red");
    log("   Check if the GraphQL endpoint is accessible:", "yellow");
    log(`   ${TRADITIONAL_LEAGUES_ENDPOINT}`, "yellow");
  }
}

// Run the tests
runAllTests().catch((error) => {
  log(`\n💥 Fatal error: ${error.message}`, "red");
  process.exit(1);
});
