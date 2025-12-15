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
    coreAppId: config.PUBLIC_COINDRAFTS_CORE_APP_ID,
    ownerAccount: config.PUBLIC_DEFAULT_OWNER,
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

// Unique player addresses
const UNIQUE_PLAYERS = [
  "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  "0xcccccccccccccccccccccccccccccccccccccccc",
  "0xdddddddddddddddddddddddddddddddddddddddd",
  "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
];

// Sample cryptocurrencies for portfolios
const CRYPTOS = ["bitcoin", "ethereum", "solana", "cardano", "polkadot"];

// All available cryptos for random selection
const ALL_CRYPTOS = [
  "bitcoin",
  "ethereum",
  "solana",
  "cardano",
  "polkadot",
  "chainlink",
  "polygon",
  "avalanche",
  "cosmos",
  "near",
  "algorand",
  "fantom",
  "hedera",
  "internet-computer",
  "vechain",
];

// Helper function to get random 5 cryptos
function getRandomCryptos() {
  const shuffled = [...ALL_CRYPTOS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5);
}

// Sample tournaments to create
const TOURNAMENTS = [
  {
    name: "Bitcoin vs Ethereum Championship",
    category: "L1_CHAINS",
    entryFee: 10,
    maxParticipants: 16,
    type: "SINGLE_ELIMINATION",
    players: UNIQUE_PLAYERS.slice(0, 4), // 4 players
  },
  {
    name: "Layer 2 Scaling Wars",
    category: "L2_CHAINS",
    entryFee: 5,
    maxParticipants: 8,
    type: "SINGLE_ELIMINATION",
    players: UNIQUE_PLAYERS.slice(0, 3), // 3 players
  },
  {
    name: "Meme Madness Tournament",
    category: "MEME_COINS",
    entryFee: 5,
    maxParticipants: 16,
    type: "SINGLE_ELIMINATION",
    players: UNIQUE_PLAYERS, // all 5 players
  },
  {
    name: "DeFi Dominance League",
    category: "DEFI_TOKENS",
    entryFee: 10,
    maxParticipants: 8,
    type: "SINGLE_ELIMINATION",
    players: UNIQUE_PLAYERS.slice(0, 2), // 2 players
  },
  {
    name: "Crypto All-Stars",
    category: "ALL_CATEGORIES",
    entryFee: 10,
    maxParticipants: 16,
    type: "SINGLE_ELIMINATION",
    players: UNIQUE_PLAYERS.slice(0, 4), // 4 players
  },
];

// Sample Quick Match games to create
const QUICK_MATCH_GAMES = [
  {
    mode: "QUICK_MATCH",
    name: "Lightning Round",
    maxPlayers: 10,
    entryFee: 5,
    duration: 24,
    players: UNIQUE_PLAYERS.slice(0, 3),
  },
  {
    mode: "QUICK_MATCH",
    name: "Starter Tournament",
    maxPlayers: 5,
    entryFee: 1,
    duration: 24,
    players: UNIQUE_PLAYERS.slice(0, 2),
  },
  {
    mode: "QUICK_MATCH",
    name: "All-Stars Championship",
    maxPlayers: 20,
    entryFee: 10,
    duration: 24,
    players: UNIQUE_PLAYERS,
  },
];

async function createTournament(endpoint, tournament) {
  try {
    // Create tournament
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

    // Query to get the tournament ID (like test-all-flows.js does)
    const tournamentsData = await graphql(
      `
        query GetTournaments {
          tournaments {
            id
            name
          }
        }
      `,
      {},
      endpoint
    );

    const tournaments = tournamentsData.tournaments || [];
    const latestTournament = tournaments[tournaments.length - 1];
    const tournamentId = latestTournament?.id;

    if (!tournamentId) {
      console.log(`  ❌ Failed to get tournament ID for ${tournament.name}`);
      return false;
    }

    console.log(
      `  ✅ Created: ${tournament.name} [${tournament.category}] - ID: ${tournamentId}`
    );

    // Register players and submit portfolios
    if (tournament.players && tournament.players.length > 0) {
      for (const playerAccount of tournament.players) {
        try {
          // Register player
          await graphql(
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
            { tournamentId, playerAccount },
            endpoint
          );
          console.log(`    ✅ Registered: ${playerAccount}`);

          // Submit portfolio (5 random crypto picks for tournaments)
          const randomCryptos = getRandomCryptos();
          await graphql(
            `
              mutation SubmitPortfolioForAccount(
                $tournamentId: String!
                $playerAccount: String!
                $cryptoPicks: [String!]!
                $strategyNotes: String
              ) {
                submitPortfolioForAccount(
                  tournamentId: $tournamentId
                  playerAccount: $playerAccount
                  cryptoPicks: $cryptoPicks
                  strategyNotes: $strategyNotes
                )
              }
            `,
            {
              tournamentId,
              playerAccount,
              cryptoPicks: randomCryptos,
              strategyNotes: `Auto-seeded portfolio for ${playerAccount}`,
            },
            endpoint
          );
          console.log(
            `    ✅ Submitted portfolio for: ${playerAccount} [${randomCryptos.join(
              ", "
            )}]`
          );
        } catch (err) {
          console.log(
            `    ⚠️  Failed to register/submit for ${playerAccount}: ${err.message}`
          );
        }
      }
    }

    return true;
  } catch (error) {
    console.log(`  ❌ Failed: ${tournament.name} - ${error.message}`);
    return false;
  }
}

async function createQuickMatchGame(endpoint, gameData) {
  try {
    // Create game with all required parameters
    await graphql(
      `
        mutation CreateGame(
          $mode: String!
          $name: String!
          $maxPlayers: Int!
          $entryFeeUsdc: Int!
          $durationHours: Int!
        ) {
          createGame(
            mode: $mode
            name: $name
            maxPlayers: $maxPlayers
            entryFeeUsdc: $entryFeeUsdc
            durationHours: $durationHours
          )
        }
      `,
      {
        mode: gameData.mode,
        name: gameData.name,
        maxPlayers: gameData.maxPlayers,
        entryFeeUsdc: gameData.entryFee * 1_000_000,
        durationHours: gameData.duration,
      },
      endpoint
    );

    // Query to get the game ID (like test-all-flows.js does)
    const gamesData = await graphql(
      `
        query GetGames {
          games {
            gameId
            mode
            status
          }
        }
      `,
      {},
      endpoint
    );

    const games = gamesData.games || [];
    const latestGame = games[games.length - 1];
    const gameId = latestGame?.gameId;

    if (!gameId) {
      console.log(`  ❌ Failed to get game ID`);
      return false;
    }

    console.log(`  ✅ Created Quick Match game: ${gameId}`);

    // Register players and submit portfolios
    if (gameData.players && gameData.players.length > 0) {
      for (const playerAccount of gameData.players) {
        try {
          // Register player with account
          await graphql(
            `
              mutation RegisterPlayerWithAccount(
                $gameId: String!
                $playerName: String!
                $playerAccount: String!
              ) {
                registerPlayerWithAccount(
                  gameId: $gameId
                  playerName: $playerAccount
                  playerAccount: $playerAccount
                )
              }
            `,
            { gameId, playerName: playerAccount, playerAccount },
            endpoint
          );
          console.log(`    ✅ Registered: ${playerAccount}`);

          // Submit portfolio for player
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
            { gameId, playerAccount, cryptocurrencies: CRYPTOS },
            endpoint
          );
          console.log(`    ✅ Submitted portfolio for: ${playerAccount}`);
        } catch (error) {
          console.log(`    ⚠️  Failed to register/submit for ${playerAccount}`);
        }
      }
    }

    return true;
  } catch (error) {
    console.log(`  ❌ Failed to create Quick Match: ${error.message}`);
    return false;
  }
}

async function seedData() {
  console.log("\n🌱 SEEDING DATA...\n");

  try {
    // Load config from .env
    const config = loadEnvConfig();

    if (!config.chainId || !config.tradLeaguesAppId || !config.coreAppId) {
      console.error("❌ Missing deployment IDs in frontend/.env");
      process.exit(1);
    }

    const tradLeaguesEndpoint = `http://localhost:8081/chains/${config.chainId}/applications/${config.tradLeaguesAppId}`;
    const coreEndpoint = `http://localhost:8081/chains/${config.chainId}/applications/${config.coreAppId}`;

    console.log(`📡 Traditional Leagues Endpoint: ${tradLeaguesEndpoint}`);
    console.log(`📡 Quick Match Endpoint: ${coreEndpoint}\n`);

    // Wait for GraphQL to be ready
    console.log("⏳ Waiting for GraphQL services...");
    let ready = false;
    let lastError = null;
    for (let i = 0; i < 15; i++) {
      try {
        await graphql("{ tournaments { id } }", {}, tradLeaguesEndpoint);
        await graphql("{ games { gameId } }", {}, coreEndpoint);
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
      console.error("❌ GraphQL services not ready after 30 seconds");
      console.error("   Last error:", lastError);
      console.log("   Tip: Check /tmp/graphql-service.log for details");
      process.exit(1);
    }

    console.log("✅ GraphQL services ready\n");

    // Create tournaments
    console.log("🏆 Creating tournaments...");
    let tournamentsCreated = 0;
    for (const tournament of TOURNAMENTS) {
      if (await createTournament(tradLeaguesEndpoint, tournament)) {
        tournamentsCreated++;
      }
    }

    // Create Quick Match games
    console.log("\n⚡ Creating Quick Match games...");
    let gamesCreated = 0;
    for (const game of QUICK_MATCH_GAMES) {
      if (await createQuickMatchGame(coreEndpoint, game)) {
        gamesCreated++;
      }
    }

    console.log(
      `\n✨ Seeding complete: ${tournamentsCreated}/${TOURNAMENTS.length} tournaments, ${gamesCreated}/${QUICK_MATCH_GAMES.length} games\n`
    );
    process.exit(0);
  } catch (error) {
    console.error("💥 Seeding failed:", error.message);
    process.exit(1);
  }
}

// Run seeding
seedData();
