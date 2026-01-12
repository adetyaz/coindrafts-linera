#!/usr/bin/env node
/**
 * Test settleMarket in isolation
 */

const GRAPHQL_BASE = "http://localhost:8081";
const DEFAULT_CHAIN_ID =
  "f5053c702f3eda3e88c929ceddaa3e0284626f6fcb3ef35d31877de17cc33da6";
const PRICE_PREDICTION_APP_ID =
  "d0a6a2f29b3f8a311cb15f573c516c3c2c69ae77a5a40c1f638e92c848aa16c4";

const PREDICTION_ENDPOINT = `${GRAPHQL_BASE}/chains/${DEFAULT_CHAIN_ID}/applications/${PRICE_PREDICTION_APP_ID}`;

async function graphql(query, variables = {}) {
  const response = await fetch(PREDICTION_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });

  console.log("Response status:", response.status);
  const text = await response.text();
  console.log("Response body:", text);

  if (!response.ok) throw new Error(`HTTP ${response.status}: ${text}`);
  const result = JSON.parse(text);
  if (result.errors) throw new Error(JSON.stringify(result.errors, null, 2));
  return result.data;
}

async function testSettle() {
  console.log("\n🏁 Testing settleMarket mutation...\n");

  // First get active markets
  const marketsData = await graphql(`
    query GetActiveMarkets {
      activeMarkets {
        id
        cryptoId
        status
      }
    }
  `);

  console.log("Active markets:", JSON.stringify(marketsData, null, 2));

  if (!marketsData.activeMarkets || marketsData.activeMarkets.length === 0) {
    console.log("❌ No markets found. Create a market first.");
    return;
  }

  const marketId = marketsData.activeMarkets[0].id;
  console.log(`\nAttempting to settle market: ${marketId}`);

  const finalPrice = 45000000000; // $45,000 in micro-USDC

  await graphql(
    `
      mutation SettleMarket($marketId: String!, $finalPrice: Float!) {
        settleMarket(marketId: $marketId, finalPrice: $finalPrice)
      }
    `,
    { marketId, finalPrice }
  );

  console.log("✅ Settlement successful!");
}

testSettle().catch((error) => {
  console.error("\n❌ Error:", error.message);
  process.exit(1);
});
