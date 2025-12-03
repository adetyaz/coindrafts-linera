#!/usr/bin/env node
/**
 * Auto-Seed Script - Creates sample tournaments after Docker deployment
 * Runs automatically after GraphQL service starts
 */

const fs = require("fs");
const path = require("path");

// Read deployment IDs from frontend/.env
function loadEnvConfig() {
  const envPath = path.join(__dirname, "frontend", ".env");
  if (!fs.existsSync(envPath)) {
    throw new Error("frontend/.env not found - deployment IDs missing");
  }

  const envContent = fs.readFileSync(envPath, "utf8");
  const config = {};

  envContent.split("\n").forEach((line) => {
    const match = line.match(/^([^=]+)=(.+)$/);
    if (match) {
      config[match[1].trim()] = match[2].trim();
    }
  });

  return {
    chainId: config.PUBLIC_DEFAULT_CHAIN_ID,
    tradLeaguesAppId: config.PUBLIC_TRADITIONAL_LEAGUES_APP_ID,
  };
}

// GraphQL helper
async function graphql(query, variables = {}, endpoint) {
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

// Sample tournaments to create
const TOURNAMENTS = [
  {
    name: "Bitcoin vs Ethereum Championship",
    category: "L1_CHAINS",
    entryFee: 10,
    maxParticipants: 16,
    type: "SINGLE_ELIMINATION",
  },
  {
    name: "Layer 2 Scaling Wars",
    category: "L2_CHAINS",
    entryFee: 5,
    maxParticipants: 8,
    type: "SINGLE_ELIMINATION",
  },
  {
    name: "Meme Madness Tournament",
    category: "MEME_COINS",
    entryFee: 5,
    maxParticipants: 16,
    type: "SINGLE_ELIMINATION",
  },
  {
    name: "DeFi Dominance League",
    category: "DEFI_TOKENS",
    entryFee: 10,
    maxParticipants: 8,
    type: "SINGLE_ELIMINATION",
  },
  {
    name: "Crypto All-Stars",
    category: "ALL_CATEGORIES",
    entryFee: 10,
    maxParticipants: 16,
    type: "SINGLE_ELIMINATION",
  },
];

async function createTournament(endpoint, tournament) {
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
        name: tournament.name,
        entryFeeUsdc: tournament.entryFee.toString(),
        maxParticipants: tournament.maxParticipants,
        tournamentType: tournament.type,
        category: tournament.category,
      },
      endpoint
    );

    console.log(`  ✅ Created: ${tournament.name} [${tournament.category}]`);
    return true;
  } catch (error) {
    console.log(`  ❌ Failed: ${tournament.name} - ${error.message}`);
    return false;
  }
}

async function seedTournaments() {
  console.log("\n🌱 SEEDING TOURNAMENTS...\n");

  try {
    // Load config from .env
    const config = loadEnvConfig();

    if (!config.chainId || !config.tradLeaguesAppId) {
      console.error("❌ Missing deployment IDs in frontend/.env");
      process.exit(1);
    }

    const endpoint = `http://localhost:8081/chains/${config.chainId}/applications/${config.tradLeaguesAppId}`;

    console.log(`📡 GraphQL Endpoint: ${endpoint}\n`);

    // Wait for GraphQL to be ready
    console.log("⏳ Waiting for GraphQL service...");
    let ready = false;
    let lastError = null;
    for (let i = 0; i < 15; i++) {
      try {
        await graphql("{ tournaments { id } }", {}, endpoint);
        ready = true;
        break;
      } catch (e) {
        lastError = e.message;
        process.stdout.write(".");
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
    console.log("");

    if (!ready) {
      console.error("❌ GraphQL service not ready after 30 seconds");
      console.error("   Last error:", lastError);
      console.log("   Tip: Check /tmp/graphql-service.log for details");
      process.exit(1);
    }

    console.log("✅ GraphQL service ready\n");

    // Create tournaments
    let created = 0;
    for (const tournament of TOURNAMENTS) {
      if (await createTournament(endpoint, tournament)) {
        created++;
      }
    }

    console.log(
      `\n✨ Seeding complete: ${created}/${TOURNAMENTS.length} tournaments created\n`
    );
    process.exit(0);
  } catch (error) {
    console.error("💥 Seeding failed:", error.message);
    process.exit(1);
  }
}

// Run seeding
seedTournaments();
