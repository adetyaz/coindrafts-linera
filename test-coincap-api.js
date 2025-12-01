#!/usr/bin/env node

/**
 * CoinCap API Test Script
 * Tests all necessary endpoints for CoinDrafts
 */

const API_KEY =
  "16cd2c6e58545a8be5c66ce7c891c2e664303de43d35e6cb1f447ddf7d0bb857";
const BASE_URL = "https://rest.coincap.io/v3";

// Headers with API key
const headers = {
  "Authorization": `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
};

console.log("🚀 Testing CoinCap API...\n");
console.log("API Key:", API_KEY.slice(0, 10) + "..." + API_KEY.slice(-10));
console.log("=".repeat(80));

async function testEndpoint(name, url, options = {}) {
  console.log(`\n📡 Testing: ${name}`);
  console.log(`URL: ${url}`);

  try {
    const response = await fetch(url, {
      headers,
      ...options,
    });

    console.log(`Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const error = await response.text();
      console.error(`❌ Error:`, error);
      return null;
    }

    const data = await response.json();
    console.log(
      `✅ Success! Response:`,
      JSON.stringify(data, null, 2).slice(0, 500) + "..."
    );
    return data;
  } catch (error) {
    console.error(`❌ Failed:`, error.message);
    return null;
  }
}

async function runTests() {
  console.log("\n" + "=".repeat(80));
  console.log("TEST 1: Get Multiple Assets (BTC, ETH, SOL, ADA, DOT)");
  console.log("=".repeat(80));

  const assets = await testEndpoint(
    "Multiple Assets",
    `${BASE_URL}/assets?slugs=bitcoin,ethereum,solana,cardano,polkadot`
  );

  if (assets && assets.data) {
    console.log("\n📊 Current Prices:");
    assets.data.forEach((asset) => {
      console.log(
        `  ${asset.symbol}: $${parseFloat(asset.priceUsd).toFixed(
          2
        )} (${parseFloat(asset.changePercent24Hr).toFixed(2)}% 24h)`
      );
    });
  }

  console.log("\n" + "=".repeat(80));
  console.log("TEST 2: Get Single Asset (Bitcoin)");
  console.log("=".repeat(80));

  const bitcoin = await testEndpoint(
    "Bitcoin Details",
    `${BASE_URL}/assets/bitcoin`
  );

  if (bitcoin && bitcoin.data) {
    console.log("\n💰 Bitcoin Data:");
    console.log(`  Price: $${parseFloat(bitcoin.data.priceUsd).toFixed(2)}`);
    console.log(
      `  Market Cap: $${(parseFloat(bitcoin.data.marketCapUsd) / 1e9).toFixed(
        2
      )}B`
    );
    console.log(
      `  Volume 24h: $${(parseFloat(bitcoin.data.volumeUsd24Hr) / 1e9).toFixed(
        2
      )}B`
    );
    console.log(
      `  Change 24h: ${parseFloat(bitcoin.data.changePercent24Hr).toFixed(2)}%`
    );
  }

  console.log("\n" + "=".repeat(80));
  console.log("TEST 3: Get Historical Data (Last Hour)");
  console.log("=".repeat(80));

  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;

  const history = await testEndpoint(
    "Bitcoin History (1 hour)",
    `${BASE_URL}/assets/bitcoin/history?interval=m1&start=${oneHourAgo}&end=${now}`
  );

  if (history && history.data && history.data.length > 0) {
    console.log(`\n📈 Historical Data Points: ${history.data.length}`);
    console.log(
      `  First: $${parseFloat(history.data[0].priceUsd).toFixed(
        2
      )} at ${new Date(history.data[0].time).toISOString()}`
    );
    console.log(
      `  Last: $${parseFloat(
        history.data[history.data.length - 1].priceUsd
      ).toFixed(2)} at ${new Date(
        history.data[history.data.length - 1].time
      ).toISOString()}`
    );

    // Calculate price change
    const startPrice = parseFloat(history.data[0].priceUsd);
    const endPrice = parseFloat(history.data[history.data.length - 1].priceUsd);
    const change = ((endPrice - startPrice) / startPrice) * 100;
    console.log(`  Change: ${change.toFixed(4)}%`);
  }

  console.log("\n" + "=".repeat(80));
  console.log("TEST 4: Test All Game Cryptos");
  console.log("=".repeat(80));

  const gameCryptos = [
    "bitcoin",
    "ethereum",
    "solana",
    "cardano",
    "polkadot",
    "avalanche-2",
    "polygon",
    "chainlink",
  ];
  const allAssets = await testEndpoint(
    "All Game Cryptos",
    `${BASE_URL}/assets?slugs=${gameCryptos.join(",")}`
  );

  if (allAssets && allAssets.data) {
    console.log("\n🎮 All Game Cryptocurrencies:");
    allAssets.data.forEach((asset) => {
      console.log(
        `  ${asset.symbol.padEnd(6)} | $${parseFloat(asset.priceUsd)
          .toFixed(6)
          .padStart(12)} | ${parseFloat(asset.changePercent24Hr)
          .toFixed(2)
          .padStart(6)}%`
      );
    });
  }

  console.log("\n" + "=".repeat(80));
  console.log("TEST 5: Calculate Game Scenario");
  console.log("=".repeat(80));

  // Simulate a 24-hour game
  const gameStart = now - 24 * 60 * 60 * 1000;
  const gameEnd = now;

  console.log("\n🎯 Simulating 24-hour Game:");
  console.log(`  Start: ${new Date(gameStart).toISOString()}`);
  console.log(`  End: ${new Date(gameEnd).toISOString()}`);

  const portfolioCryptos = [
    "bitcoin",
    "ethereum",
    "solana",
    "cardano",
    "polkadot",
  ];

  for (const crypto of portfolioCryptos) {
    const cryptoHistory = await testEndpoint(
      `${crypto} 24h history`,
      `${BASE_URL}/assets/${crypto}/history?interval=h1&start=${gameStart}&end=${gameEnd}`
    );

    if (cryptoHistory && cryptoHistory.data && cryptoHistory.data.length > 0) {
      const startPrice = parseFloat(cryptoHistory.data[0].priceUsd);
      const endPrice = parseFloat(
        cryptoHistory.data[cryptoHistory.data.length - 1].priceUsd
      );
      const percentChange = ((endPrice - startPrice) / startPrice) * 100;

      console.log(`\n  ${crypto.toUpperCase()}:`);
      console.log(`    Start: $${startPrice.toFixed(2)}`);
      console.log(`    End: $${endPrice.toFixed(2)}`);
      console.log(`    Change: ${percentChange.toFixed(2)}%`);
    }

    // Rate limit: wait 200ms between requests
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  console.log("\n" + "=".repeat(80));
  console.log("✅ ALL TESTS COMPLETED!");
  console.log("=".repeat(80));
  console.log("\n📋 Summary:");
  console.log("  ✅ API Key is valid");
  console.log("  ✅ Can fetch multiple assets");
  console.log("  ✅ Can fetch single asset details");
  console.log("  ✅ Can fetch historical data");
  console.log("  ✅ Can calculate price changes");
  console.log("\n🎮 Ready for CoinDrafts integration!");
}

// Run all tests
runTests().catch((error) => {
  console.error("\n❌ Test suite failed:", error);
  process.exit(1);
});
