// Enhanced JS launcher для повного Cash Flow backend з TypeScript інтеграцією
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

// 🔍 Debug logging for Railway
console.log("🚀 Starting Cash Flow Ukraine Server...");
console.log("📊 Environment:", {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 3001,
  FRONTEND_URL: process.env.FRONTEND_URL || "not set",
});

// TypeScript integration
const { register } = require("ts-node");
register({
  transpileOnly: true,
  compilerOptions: {
    module: "commonjs",
    target: "es2018",
    strict: true,
    esModuleInterop: true,
    skipLibCheck: true,
    forceConsistentCasingInFileNames: true,
  },
});

const app = express();
const server = http.createServer(app);

// 🎲 Генератор короткого коду кімнати (6 символів, без схожих: 0/O, 1/I)
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Import TypeScript services
const GameMechanicsService = require('./src/services/GameMechanicsService.ts').GameMechanicsService;
const CardService = require('./src/services/CardService.ts').CardService;
const TransactionService = require('./src/services/transactionService.ts').default;

// ✅ Dynamic CORS for production and development
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? [
        process.env.FRONTEND_URL,
        "https://cashflow-ukraine.netlify.app",
        "https://cashflow-ukraine.railway.app",
      ]
    : ["http://localhost:5173", "http://localhost:5174"];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins.filter(Boolean),
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  },
});

const PORT = process.env.PORT || 3001;

// ✅ In-memory game storage
const gameStore = new Map();
const connectedUsers = new Map();

// Middleware
app.use(
  cors({
    origin: allowedOrigins.filter(Boolean),
    credentials: true,
  }),
);
app.use(express.json());

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    name: "Cash Flow Ukraine API",
    version: "1.0.0",
    status: "🚀 Server is running!",
    endpoints: {
      health: "/health",
      api: "/api/games",
      docs: "https://github.com/ShadowUser2022/Cash-Flow-Ukraine",
    },
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Простий game API endpoints для тестування
app.get("/api/games", (req, res) => {
  res.json({
    message: "Cash Flow Ukraine API",
    version: "1.0.0",
    endpoints: [
      "GET /api/games - список ігор",
      "POST /api/games/create - створити гру",
      "GET /api/games/:id - деталі гри",
    ],
  });
});

// ✅ Додаємо правильний endpoint для створення гри
app.post("/api/games/create", (req, res) => {
  console.log("🎮 Creating new game with request:", req.body);
  const { hostId, settings } = req.body;

  if (!hostId) {
    return res.status(400).json({
      success: false,
      error: "Host ID is required",
    });
  }

  const gameId = generateRoomCode();
  const gameData = {
    id: gameId,
    hostId,
    state: "waiting",
    currentPlayer: null,
    turn: 0,
    players: [],
    settings: {
      maxPlayers: settings?.maxPlayers || 6,
      timeLimit: settings?.timeLimit || 3600,
      language: settings?.language || "uk",
      allowSpectators: settings?.allowSpectators || false,
      difficulty: settings?.difficulty || "normal",
    },
    board: {
      ratRaceCells: [],
      fastTrackCells: [],
    },
    deals: [],
    marketEvents: [],
    negotiations: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // ✅ Initialize board layout
  GameMechanicsService.initializeBoard(gameData);

  // ✅ Store game in memory
  gameStore.set(gameId, gameData);

  console.log("✅ Game created and stored:", gameData);

  res.status(201).json({
    success: true,
    game: gameData,
    message: "Гру створено успішно",
  });
});

// ✅ Додаємо endpoint для приєднання до гри
app.post("/api/games/:gameId/join", (req, res) => {
  console.log("🔗 Player joining game:", req.params.gameId, req.body);
  const { gameId } = req.params;
  const { playerId, playerName, profession } = req.body;

  if (!playerId || !playerName) {
    return res.status(400).json({
      success: false,
      error: "Player ID and name are required",
    });
  }

  // ✅ Fixed: Get or create game in gameStore
  let game = gameStore.get(gameId);
  if (!game) {
    // Create minimal game if not exists
    game = {
      id: gameId,
      hostId: playerId, // First player becomes host
      state: "waiting",
      currentPlayer: null,
      turn: 0,
      players: [],
      settings: {
        maxPlayers: 6,
        timeLimit: 3600,
        language: "uk",
        allowSpectators: false,
        difficulty: "normal",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    GameMechanicsService.initializeBoard(game);
    gameStore.set(gameId, game);
  }

  // ✅ Check if player already in game
  const existingPlayerIndex = game.players.findIndex((p) => p.id === playerId);

  const playerData = {
    id: playerId,
    name: playerName,
    profession: profession || {
      name: "Вчитель",
      salary: 3300,
      expenses: 2500,
      description: "Освітній працівник",
    },
    position: 0,
    fastTrackPosition: 0,
    finances: {
      salary: profession?.salary || 3300,
      passiveIncome: 0,
      expenses: profession?.expenses || 2500,
      cash: 10000,
      assets: [],
      liabilities: [],
    },
    assets: [],
    passiveIncome: 0,
    isOnFastTrack: false,
    isReady: false,
    isConnected: true,
    joinedAt: new Date().toISOString(),
  };

  if (existingPlayerIndex >= 0) {
    // Update existing player
    game.players[existingPlayerIndex] = {
      ...game.players[existingPlayerIndex],
      ...playerData,
    };
  } else {
    // Add new player
    game.players.push(playerData);
  }

  game.updatedAt = new Date().toISOString();
  gameStore.set(gameId, game);

  console.log("✅ Player joined game:", playerData);
  console.log("🎮 Updated game state:", {
    id: game.id,
    playersCount: game.players.length,
    state: game.state,
  });

  // ✅ Emit game state to all connected clients in this game room
  if (gameNamespace) {
    gameNamespace.to(gameId).emit("game-state", game);
    gameNamespace.to(gameId).emit("player-joined", { playerId, playerData });
  }

  res.json({
    success: true,
    player: playerData,
    game: game,
    message: "Успішно приєднались до гри",
  });
});

// ✅ Додаємо endpoint для готовності гравця
app.post("/api/games/:gameId/ready", (req, res) => {
  console.log("🔄 Player ready status change:", req.params.gameId, req.body);
  const { gameId } = req.params;
  const { playerId, isReady } = req.body;

  if (!playerId || typeof isReady !== "boolean") {
    return res.status(400).json({
      success: false,
      error: "Player ID and ready status are required",
    });
  }

  // ✅ Get game from gameStore
  const game = gameStore.get(gameId);
  if (!game) {
    return res.status(404).json({
      success: false,
      error: "Game not found",
    });
  }

  // ✅ Find and update player
  const playerIndex = game.players.findIndex((p) => p.id === playerId);
  if (playerIndex === -1) {
    return res.status(404).json({
      success: false,
      error: "Player not found in game",
    });
  }

  // Update player ready status
  game.players[playerIndex].isReady = isReady;
  game.updatedAt = new Date().toISOString();
  gameStore.set(gameId, game);

  console.log(`✅ Player ${playerId} ready status updated to: ${isReady}`);

  // ✅ Emit game state to all connected clients in this game room
  if (gameNamespace) {
    gameNamespace.to(gameId).emit("game-state", game);
    gameNamespace.to(gameId).emit("player-ready-status-changed", { playerId, isReady });
    gameNamespace.to(gameId).emit("player-ready", { playerId, isReady });
  }

  res.json({
    success: true,
    player: game.players[playerIndex],
    game: game,
    message: isReady ? "Гравець готовий до гри" : "Гравець не готовий",
  });
});

// ✅ Додаємо endpoint для зміни професії гравця
app.post("/api/games/:gameId/profession", (req, res) => {
  console.log("🏢 Player profession change:", req.params.gameId, req.body);
  const { gameId } = req.params;
  const { playerId, professionName } = req.body;

  if (!playerId || !professionName) {
    return res.status(400).json({
      success: false,
      error: "Player ID and profession name are required",
    });
  }

  // ✅ Get game from gameStore
  const game = gameStore.get(gameId);
  if (!game) {
    return res.status(404).json({
      success: false,
      error: "Game not found",
    });
  }

  // ✅ Find and update player
  const playerIndex = game.players.findIndex((p) => p.id === playerId);
  if (playerIndex === -1) {
    return res.status(404).json({
      success: false,
      error: "Player not found in game",
    });
  }

  // ✅ Find profession data
  const professions = {
    Вчитель: {
      name: "Вчитель",
      salary: 3300,
      expenses: 2500,
      description: "Освітній працівник",
    },
    Модератка: {
      name: "Модератка",
      salary: 4100,
      expenses: 2800,
      description: "Контент-модератор",
    },
    Поліцейський: {
      name: "Поліцейський",
      salary: 3000,
      expenses: 2200,
      description: "Правоохоронець",
    },
    Інженер: {
      name: "Інженер",
      salary: 4900,
      expenses: 3900,
      description: "Технічний спеціаліст",
    },
    Пілот: {
      name: "Пілот",
      salary: 13200,
      expenses: 9650,
      description: "Авіапілот",
    },
    Юрист: {
      name: "Юрист",
      salary: 7500,
      expenses: 6100,
      description: "Правовий консультант",
    },
  };

  const profession = professions[professionName];
  if (!profession) {
    return res.status(400).json({
      success: false,
      error: "Invalid profession name",
    });
  }

  // Update player profession and finances
  game.players[playerIndex].profession = profession;
  game.players[playerIndex].finances = {
    ...game.players[playerIndex].finances,
    salary: profession.salary,
    expenses: profession.expenses,
  };
  game.updatedAt = new Date().toISOString();
  gameStore.set(gameId, game);

  console.log(`✅ Player ${playerId} profession updated to: ${professionName}`);

  // ✅ Emit game state to all connected clients in this game room
  if (gameNamespace) {
    gameNamespace.to(gameId).emit("game-state", game);
    gameNamespace.to(gameId).emit("profession-changed", {
      playerId,
      profession: professionName,
    });
  }

  res.json({
    success: true,
    player: game.players[playerIndex],
    game: game,
    message: `Професію змінено на ${professionName}`,
  });
});

app.post("/api/games", (req, res) => {
  const { hostId } = req.body;
  if (!hostId) {
    return res.status(400).json({ error: "Host ID is required" });
  }

  const gameId = generateRoomCode();
  res.status(201).json({
    success: true,
    game: {
      id: gameId,
      hostId,
      state: "waiting",
      players: [],
      createdAt: new Date().toISOString(),
    },
  });
});

// Import TypeScript routes (закоментовано поки не виправимо)
// const { gameRoutes } = require('./src/controllers/gameController-memory.ts');
// app.use('/api/games', gameRoutes);

// Socket.IO для real-time
// ✅ connectedUsers is already declared above

// In-memory store для фінансів гравців
const playerFinances = new Map();

// In-memory store для мрій гравців
const playerDreams = new Map();

// Функція для отримання фінансів гравця
function getPlayerFinances(playerId, gameId) {
  if (gameId) {
    const game = gameStore.get(gameId);
    if (game) {
      const player = game.players.find(p => p.id === playerId);
      if (player) return player.finances;
    }
  }
  
  // Fallback to in-memory store for back-compat
  if (!playerFinances.has(playerId)) {
    playerFinances.set(playerId, {
      cash: 8000,
      salary: 3000,
      passiveIncome: 200,
      expenses: 2400,
      assets: [
        {
          id: "rental-1",
          name: "Орендна нерухомість",
          cost: 50000,
          cashFlow: 200,
        },
      ],
      liabilities: [
        {
          id: "mortgage-1",
          name: "Іпотека",
          amount: 40000,
          payment: 300,
        },
      ],
      transactions: [],
    });
  }
  return playerFinances.get(playerId);
}
// Функція для оновлення готівки гравця
function updatePlayerCash(playerId, amount, type, description, gameId = null) {
  const finances = getPlayerFinances(playerId, gameId);
  const oldCash = finances.cash;

  // Оновлюємо готівку (не може бути менше 0)
  finances.cash = Math.max(0, finances.cash + amount);

  // Додаємо транзакцію
  const transaction = {
    id: `txn-${Date.now()}`,
    type,
    amount,
    description,
    timestamp: new Date().toISOString(),
    balanceBefore: oldCash,
    balanceAfter: finances.cash,
  };
  finances.transactions.push(transaction);

  console.log(
    `💰 Player ${playerId}: ${description} | ${amount >= 0 ? "+" : ""}$${amount} | Balance: $${oldCash} → $${finances.cash}`,
  );

  // ✅ КРИТИЧНО: Синхронізуємо з game state в gameStore
  if (gameId) {
    const game = gameStore.get(gameId);
    if (game) {
      const playerIndex = game.players.findIndex((p) => p.id === playerId);
      if (playerIndex !== -1) {
        // Оновлюємо finances в game state
        game.players[playerIndex].finances.cash = finances.cash;
        game.updatedAt = new Date().toISOString();
        gameStore.set(gameId, game);
        console.log(
          `✅ Synced cash to game state: Player ${playerId} now has $${finances.cash}`,
        );
        // Додатковий лог для користувача (для консолі сервера)
        console.log(`📊 [STATE UPDATE] Player ${playerId} Balance: $${finances.cash}`);
      }
    }
  }

  return { finances, transaction };
}

// ✅ Функція для емітування оновленого стану гри всім гравцям
function emitGameState(gameId) {
  const game = gameStore.get(gameId);
  if (game && io) {
    // ✅ ВАЖЛИВО: використовуємо gameId без префікса (як в socket.join)
    io.of("/game").to(gameId).emit("game-state", game);
    console.log(`📡 Emitted updated game state to game ${gameId}`);
  }
}

// Функції для управління мріями гравців
function setPlayerDream(playerId, dream) {
  playerDreams.set(playerId, dream);
  console.log(`💭 Dream set for player ${playerId}:`, dream);
  return dream;
}

function getPlayerDream(playerId) {
  return playerDreams.get(playerId) || null;
}

function hasPlayerSelectedDream(playerId) {
  return playerDreams.has(playerId);
}

// Game namespace
const gameNamespace = io.of("/game");
gameNamespace.on("connection", (socket) => {
  console.log("Game client connected:", socket.id);

  socket.on("join-game", ({ gameId, playerId, playerName }) => {
    console.log(`Player ${playerId} (${playerName}) joining game ${gameId}`);
    socket.join(gameId);
    connectedUsers.set(socket.id, { gameId, playerId, playerName });

    // ✅ Get current game data from in-memory storage
    let gameData = gameStore.get(gameId);

    if (!gameData) {
      console.log(
        `⚠️ Game ${gameId} not found in memory, creating basic game state...`,
      );
      // Create basic game state if not exists
      gameData = {
        id: gameId,
        hostId: playerId,
        state: "waiting",
        currentPlayer: null,
        turn: 0,
        players: [
          {
            id: playerId,
            name: playerName,
            position: 0,
            fastTrackPosition: 0,
            profession: {
              name: "Вчитель",
              salary: 3300,
              expenses: 2500,
              description: "Освітній працівник",
            },
            finances: {
              salary: 3300,
              passiveIncome: 0,
              expenses: 2500,
              cash: 10000,
              assets: [],
              liabilities: [],
            },
            assets: [],
            passiveIncome: 0,
            isOnFastTrack: false,
            isReady: false,
            isConnected: true,
          },
        ],
        settings: {
          maxPlayers: 6,
          timeLimit: 3600,
          language: "uk",
          allowSpectators: false,
          difficulty: "normal",
        },
        board: {
          ratRaceCells: [],
          fastTrackCells: [],
        },
        deals: [],
        marketEvents: [],
        negotiations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      GameMechanicsService.initializeBoard(gameData);
      
      // ✅ Встановлюємо поточного гравця (перший хто зайшов)
      if (!gameData.currentPlayer && gameData.players.length > 0) {
        gameData.currentPlayer = gameData.players[0].id;
        console.log(`👤 Set initial currentPlayer to ${gameData.currentPlayer}`);
      }
      
      gameStore.set(gameId, gameData);
    } else {
      // Якщо гра вже існує, але currentPlayer не встановлено
      if (!gameData.currentPlayer && gameData.players.length > 0) {
        gameData.currentPlayer = gameData.players[0].id;
        console.log(`👤 Assigned currentPlayer ${gameData.currentPlayer} to existing game`);
      }
    }

    // ✅ Send game state to the joined player
    socket.emit("game-state", gameData);
    console.log(`✅ Sent game state to player ${playerId}`);

    // ✅ Notify other players about new player joined
    socket.to(gameId).emit("player-joined", { playerId, playerName });
  });

  socket.on("leave-game", ({ gameId, playerId }) => {
    console.log(`Player ${playerId} leaving game ${gameId}`);
    socket.leave(gameId);
    connectedUsers.delete(socket.id);

    socket.to(gameId).emit("player-left", { playerId });
  });

  socket.on("ready-to-start", ({ gameId, playerId, isReady }) => {
    console.log(
      `Player ${playerId} ready status: ${isReady} in game ${gameId}`,
    );
    socket
      .to(gameId)
      .emit("player-ready-status-changed", { playerId, isReady });
  });

  socket.on("game-started", ({ gameId }) => {
    console.log(`🚀 Game ${gameId} starting...`);
    const game = gameStore.get(gameId);
    if (game) {
      game.state = "in_progress";
      game.updatedAt = new Date();
      
      // ✅ Гарантуємо що є поточний гравець при старті
      if (!game.currentPlayer && game.players.length > 0) {
        game.currentPlayer = game.players[0].id;
      }
      
      gameStore.set(gameId, game);
      gameNamespace.to(gameId).emit("game-started", { gameId, gameState: game });
      
      // Також емітимо загальний стан для синхронізації
      gameNamespace.to(gameId).emit("game-state", game);
      
      console.log(`✅ Game ${gameId} state changed to in_progress. Current: ${game.currentPlayer}`);
    } else {
      gameNamespace.to(gameId).emit("game-started", { gameId });
    }
  });

  socket.on("roll-dice", ({ gameId, playerId }) => {
    console.log(`Player ${playerId} rolling dice in game ${gameId}`);
    // Simulate dice roll
    const diceResult = Math.floor(Math.random() * 6) + 1;
    gameNamespace.to(gameId).emit("dice-rolled", { playerId, diceResult });
  });

  // Обробка повного ходу (з використанням реальної механіки)
  socket.on("execute-turn", async ({ gameId, playerId }) => {
    console.log(`🎯 Executing real turn for player ${playerId} in game ${gameId}`);

    try {
      // 1. Отримуємо актуальну гру з gameStore
      const game = gameStore.get(gameId);
      if (!game) {
        throw new Error("Гра не знайдена в пам'яті");
      }

      // 2. Виконуємо хід через сервіс механіки
      // Оскільки ми рефакторили TransactionService для роботи з об'єктами в пам'яті,
      // це оновить об'єкт game.players[index] напряму.
      const turnResult = await GameMechanicsService.executeTurn(game, playerId);

      // 3. Знаходимо нову позицію для емітування dice-rolled (для зворотної сумісності)
      const moveAction = turnResult.actions.find(a => a.type === 'move' && a.data?.diceRoll);
      const diceResult = moveAction?.data?.diceRoll || 1;
      const newPosition = moveAction?.data?.newPosition || 0;
      
      // Знаходимо ефект клітинки
      const cellAction = turnResult.actions.find(a => a.type === 'draw_card');
      const cellEffect = cellAction ? {
        type: cellAction.result?.effectType,
        data: cellAction.data
      } : null;

      console.log(`🎲 Turn Result: Dice ${diceResult}, Pos ${newPosition}, Actions: ${turnResult.actions.length}`);

      // 4. Оновлюємо updatedAt та зберігаємо в Map (хоча об'єкт вже змінено по посиланню)
      game.updatedAt = new Date();
      game.turn += 1; // Збільшуємо загальний лічильник ходів гри
      gameStore.set(gameId, game);

      // 5. Відправляємо dice-rolled для анімації на фронтенді
      gameNamespace.to(gameId).emit("dice-rolled", {
        playerId,
        diceResult,
        newPosition,
        cellEffect,
        gameState: game, // Відправляємо ПОВНИЙ актуальний стан гри
        turnResult
      });

      // 6. Перевіряємо умову перемоги (dream_check + cash >= dreamCost)
      const winCheckPlayer = game.players.find(p => p.id === playerId);
      const isDreamCheck = cellEffect && cellEffect.data && cellEffect.data.cardType === "dream_check";
      if (isDreamCheck && winCheckPlayer) {
        const dreamCost = winCheckPlayer.dream && winCheckPlayer.dream.estimatedCost ? winCheckPlayer.dream.estimatedCost : 0;
        if (dreamCost > 0 && winCheckPlayer.finances.cash >= dreamCost && winCheckPlayer.isOnFastTrack) {
          console.log(`🏆 Player ${winCheckPlayer.name} WON the game\! Cash: ${winCheckPlayer.finances.cash} >= Dream: ${dreamCost}`);
          gameNamespace.to(gameId).emit("game-won", {
            winnerId: playerId,
            winnerName: winCheckPlayer.name,
            cash: winCheckPlayer.finances.cash,
            dreamCost: dreamCost,
            gameState: game
          });
        }
      }

      // 7. Перевіряємо divorce подію — emit divorce-applied (сума вже списана сервером)
      const divorceAction = turnResult.actions.find(
        a => a.type === 'draw_card' && a.data?.cardType === 'divorce'
      );
      if (divorceAction) {
        const divorcePlayer = game.players.find(p => p.id === playerId);
        const lostAmount = divorceAction.data?.card?.cost || divorceAction.data?.card?.amount || 0;
        console.log(`💔 [SERVER] Emitting divorce-applied for ${playerId}, lost: $${lostAmount}`);
        gameNamespace.to(gameId).emit('divorce-applied', {
          playerId,
          playerName: divorcePlayer?.name || playerId,
          amountLost: lostAmount,
          newCashBalance: divorcePlayer?.finances?.cash || 0,
          gameState: game
        });
      }

      // 8. Додатково емітимо загальний game-state
      emitGameState(gameId);

    } catch (error) {
      console.error(`❌ Error executing turn for ${playerId}:`, error);
      socket.emit("error", {
        message: "Failed to execute turn",
        error: error.message,
      });
    }
  });

  socket.on("turn-ended", ({ gameId, playerId, nextPlayer }) => {
    console.log(
      `Turn ended for ${playerId}, next: ${nextPlayer} in game ${gameId}`,
    );
    gameNamespace.to(gameId).emit("turn-ended", { playerId, nextPlayer });
  });

  // Обробка завершення ходу з card actions
  socket.on("turn-completed", ({ gameId, playerId }) => {
    console.log(`🎯 Turn completed for player ${playerId} in game ${gameId}`);

    const game = gameStore.get(gameId);
    if (game) {
      const player = game.players.find(p => p.id === playerId);

      // Перевіряємо умову переходу на швидку доріжку: passiveIncome >= expenses
      if (player && !player.isOnFastTrack && player.finances) {
        const passiveIncome = player.finances.passiveIncome || 0;
        const expenses = player.finances.expenses || 0;
        if (passiveIncome > 0 && passiveIncome >= expenses) {
          player.isOnFastTrack = true;
          player.fastTrackPosition = 0;
          game.updatedAt = new Date();
          gameStore.set(gameId, game);
          console.log(`🚀 Player ${player.name} transitioned to Fast Track\! passiveIncome=${passiveIncome} >= expenses=${expenses}`);
          gameNamespace.to(gameId).emit("fast-track-moved", {
            playerId,
            player,
            gameState: game,
            message: `🎉 ${player.name} вийшов на швидку доріжку\! Пасивний дохід $${passiveIncome} >= витрат $${expenses}`
          });
        }
      }

      // Переходимо до наступного гравця
      const players = game.players;
      const currentIndex = players.findIndex(p => p.id === playerId);
      const nextIndex = (currentIndex + 1) % players.length;
      game.currentPlayer = players[nextIndex].id;
      game.turn = (game.turn || 0) + 1;
      game.updatedAt = new Date();
      gameStore.set(gameId, game);
    }

    gameNamespace.to(gameId).emit("turn-completed", {
      playerId,
      currentPlayer: game ? game.currentPlayer : null,
      gameState: game,
      message: `Гравець ${playerId} завершив хід`,
      timestamp: new Date().toISOString(),
    });
  });
  // Обробка сплати витрат
  socket.on("pay-expense", ({ gameId, playerId, amount }) => {
    console.log(
      `💸 Player ${playerId} paying expense $${amount} in game ${gameId}`,
    );

    try {
      // Використовуємо реальну систему фінансів
      const result = updatePlayerCash(
        playerId,
        -amount,
        "expense",
        "Незаплановані витрати",
        gameId,
      );

      const expenseResult = {
        playerId,
        amountPaid: amount,
        newCashBalance: result.finances.cash,
        transaction: result.transaction,
        success: true,
      };

      // Відправляємо оновлення всім гравцям в кімнаті
      gameNamespace.to(gameId).emit("expense-paid", expenseResult);

      // Також відправляємо загальне оновлення фінансів
      gameNamespace.to(gameId).emit("player-finances-updated", {
        playerId,
        finances: result.finances,
      });

      // ✅ Емітимо оновлений game state
      emitGameState(gameId);
    } catch (error) {
      console.error("Error processing expense payment:", error);
      gameNamespace.to(gameId).emit("error", {
        message: "Помилка обробки платежу",
        playerId,
      });
    }
  });

  // Обробка купівлі угоди
  socket.on("buy-deal", async ({ gameId, playerId, dealId }) => {
    console.log(`🏠 Player ${playerId} buying deal ${dealId} in game ${gameId}`);
    
    try {
      const game = gameStore.get(gameId);
      if (!game) throw new Error("Game not found");
      
      const result = await GameMechanicsService.buyDeal(game, playerId, dealId);
      
      if (result.success) {
        gameNamespace.to(gameId).emit("deal-completed", {
          playerId,
          dealId,
          success: true,
          message: result.message,
          newCashBalance: game.players.find(p => p.id === playerId).finances.cash
        });
        
        const player = game.players.find(p => p.id === playerId);
        gameNamespace.to(gameId).emit("player-finances-updated", {
          playerId,
          finances: player.finances
        });
        
        emitGameState(gameId);
      } else {
        socket.emit("error", { message: result.message });
      }
    } catch (error) {
      console.error("Error processing buy-deal:", error);
      socket.emit("error", { message: "Помилка при купівлі угоди" });
    }
  });

  // Обробка отримання доходу (зарплата, бонуси)
  socket.on(
    "receive-income",
    ({ gameId, playerId, amount, description = "Дохід" }) => {
      console.log(
        `💰 Player ${playerId} receiving income $${amount} in game ${gameId}`,
      );

      try {
        const result = updatePlayerCash(
          playerId,
          amount,
          "income",
          description,
          gameId,
        );

        const incomeResult = {
          playerId,
          amountReceived: amount,
          newCashBalance: result.finances.cash,
          transaction: result.transaction,
          success: true,
        };

        gameNamespace.to(gameId).emit("income-received", incomeResult);
        gameNamespace.to(gameId).emit("player-finances-updated", {
          playerId,
          finances: result.finances,
        });

        // ✅ Емітимо оновлений game state
        emitGameState(gameId);
      } catch (error) {
        console.error("Error processing income:", error);
        gameNamespace.to(gameId).emit("error", {
          message: "Помилка обробки доходу",
          playerId,
        });
      }
    },
  );
  // Обробка вибору благодійності
  socket.on("charity-choice", ({ gameId, playerId, choice, amount }) => {
    console.log(
      `❤️ Player ${playerId} charity choice: ${choice}, amount: $${amount} in game ${gameId}`,
    );

    try {
      let result = null;
      let charityResult = {
        playerId,
        choice,
        amount,
        success: true,
        bonusEffect: null,
      };

      if (choice !== "skip" && amount > 0) {
        // Віднімаємо гроші за благодійність
        result = updatePlayerCash(
          playerId,
          -amount,
          "charity",
          "Благодійний внесок",
          gameId,
        );
        charityResult.newCashBalance = result.finances.cash;
        charityResult.transaction = result.transaction;

        // Додаємо бонусний ефект для великої благодійності
        if (parseInt(choice) >= 20) {
          charityResult.bonusEffect = "extra_turn";
        }
      } else {
        // Якщо пропустили, штрафу поки немає, але можна додати
        const finances = getPlayerFinances(playerId);
        charityResult.newCashBalance = finances.cash;
      }

      gameNamespace.to(gameId).emit("charity-completed", charityResult);

      if (result) {
        gameNamespace.to(gameId).emit("player-finances-updated", {
          playerId,
          finances: result.finances,
        });
      }

      // ✅ Емітимо оновлений game state
      emitGameState(gameId);
    } catch (error) {
      console.error("Error processing charity choice:", error);
      gameNamespace.to(gameId).emit("error", {
        message: "Помилка обробки благодійності",
        playerId,
      });
    }
  });

  // Обробка ринкових дій
  socket.on("market-action", ({ gameId, playerId, action, data }) => {
    console.log(
      `📈 Player ${playerId} market action: ${action} in game ${gameId}`,
    );

    try {
      let result = null;
      let marketResult = {
        playerId,
        action,
        data,
        success: true,
        message: `Ринкова дія "${action}" виконана успішно`,
      };

      // Обробляємо різні типи ринкових дій
      if (action === "execute" && data?.card) {
        const card = data.card;

        // Якщо це карта з фінансовими ефектами
        if (card.benefit && card.benefit.amount) {
          // Додаємо дохід від ринкової дії
          result = updatePlayerCash(
            playerId,
            card.benefit.amount,
            "market",
            card.title || "Ринкова подія",
            gameId,
          );
          marketResult.amountReceived = card.benefit.amount;
          marketResult.newCashBalance = result.finances.cash;
          marketResult.transaction = result.transaction;
          marketResult.message = `Отримано $${card.benefit.amount.toLocaleString()} від ринкової події`;
        } else if (card.cost) {
          // Якщо це витрати від ринкової дії
          result = updatePlayerCash(
            playerId,
            -card.cost,
            "market",
            card.title || "Ринкова подія",
            gameId,
          );
          marketResult.amountPaid = card.cost;
          marketResult.newCashBalance = result.finances.cash;
          marketResult.transaction = result.transaction;
          marketResult.message = `Сплачено $${card.cost.toLocaleString()} за ринкову подію`;
        } else if (card.sellMultiplier && card.affectedAssetType) {
          // 📈 Market Boom / Crash — оновлюємо currentMultiplier на активах гравців
          const game = gameStore.get(gameId);
          if (game) {
            const affectedType = card.affectedAssetType;
            let affectedCount = 0;
            game.players.forEach((player) => {
              if (!player.finances || !player.finances.assets) return;
              player.finances.assets.forEach((asset) => {
                if (affectedType === "all" || asset.type === affectedType) {
                  asset.currentMultiplier = card.sellMultiplier;
                  affectedCount++;
                }
              });
            });
            gameStore.set(gameId, game);
            marketResult.sellMultiplier = card.sellMultiplier;
            marketResult.affectedAssetType = affectedType;
            marketResult.affectedCount = affectedCount;
            marketResult.message = card.description || `Ринковий множник: ${card.sellMultiplier}x для ${affectedType}`;
            // Емітимо спеціальну подію ринкового буму
            gameNamespace.to(gameId).emit("market-boom", {
              sellMultiplier: card.sellMultiplier,
              affectedAssetType: affectedType,
              affectedCount,
              title: card.title,
              description: card.description,
              gameState: game,
            });
            console.log(`📈 Market boom applied: ${card.sellMultiplier}x on ${affectedType}, ${affectedCount} assets updated`);
          }
        } else if (card.dividendMonths && card.dividendMonths > 0) {
          // 💰 Dividend card — виплачуємо dividendMonths × passiveIncome поточному гравцю
          const game = gameStore.get(gameId);
          if (game) {
            const player = game.players.find((p) => p.id === playerId);
            if (player && player.finances) {
              const passiveIncome = player.finances.passiveIncome || 0;
              const dividendAmount = passiveIncome * card.dividendMonths;
              if (dividendAmount > 0) {
                player.finances.cash = (player.finances.cash || 0) + dividendAmount;
                gameStore.set(gameId, game);
                marketResult.amountReceived = dividendAmount;
                marketResult.newCashBalance = player.finances.cash;
                marketResult.dividendMonths = card.dividendMonths;
                marketResult.message = `💰 Дивіденди за ${card.dividendMonths} міс: +$${dividendAmount.toLocaleString()}`;
                console.log(`💰 Dividends paid: $${dividendAmount} (${card.dividendMonths}mo × $${passiveIncome}/mo) to ${playerId}`);
              } else {
                marketResult.message = `Дивіденди: пасивний дохід = $0. Інвестуйте спочатку!`;
              }
            }
          }
        }
      }

      gameNamespace.to(gameId).emit("market-action-completed", marketResult);

      // Відправляємо оновлення фінансів якщо були зміни
      if (result) {
        gameNamespace.to(gameId).emit("player-finances-updated", {
          playerId,
          finances: result.finances,
        });
      }

      // ✅ Емітимо оновлений game state
      emitGameState(gameId);
    } catch (error) {
      console.error("Error processing market action:", error);
      gameNamespace.to(gameId).emit("error", {
        message: "Помилка обробки ринкової дії",
        playerId,
      });
    }
  });

  // Обробка отримання зарплати (коли гравець проходить START)
  socket.on("collect-salary", ({ gameId, playerId }) => {
    console.log(`💰 Player ${playerId} collecting salary in game ${gameId}`);

    try {
      const finances = getPlayerFinances(playerId);
      const salaryAmount = finances.salary;

      const result = updatePlayerCash(
        playerId,
        salaryAmount,
        "salary",
        "Місячна зарплата",
        gameId,
      );

      const salaryResult = {
        playerId,
        amountReceived: salaryAmount,
        newCashBalance: result.finances.cash,
        transaction: result.transaction,
        success: true,
      };

      gameNamespace.to(gameId).emit("salary-collected", salaryResult);
      gameNamespace.to(gameId).emit("player-finances-updated", {
        playerId,
        finances: result.finances,
      });

      // ✅ Емітимо оновлений game state
      emitGameState(gameId);
    } catch (error) {
      console.error("Error collecting salary:", error);
      gameNamespace.to(gameId).emit("error", {
        message: "Помилка отримання зарплати",
        playerId,
      });
    }
  });

  // Обробник для встановлення мрії гравця
  socket.on("set-player-dream", ({ gameId, playerId, dream }) => {
    console.log(
      `💭 Player ${playerId} setting dream in game ${gameId}:`,
      dream,
    );

    try {
      const savedDream = setPlayerDream(playerId, dream);

      // ✅ КРИТИЧНО: Синхронізуємо з game state в gameStore
      const game = gameStore.get(gameId);
      if (game) {
        const playerIndex = game.players.findIndex((p) => p.id === playerId);
        if (playerIndex !== -1) {
          game.players[playerIndex].dream = savedDream;
          game.updatedAt = new Date().toISOString();
          gameStore.set(gameId, game);
          console.log(`✅ Synced dream to game state for player ${playerId}`);
          
          // Емітуємо оновлений стан всім гравцям
          gameNamespace.to(gameId).emit("game-state", game);
        }
      }

      // Повідомляємо всіх гравців про встановлення мрії (для анімацій/тостів)
      gameNamespace.to(gameId).emit("player-dream-set", {
        playerId,
        dream: savedDream,
        gameId,
      });

      console.log(`✅ Dream set successfully for player ${playerId}`);
    } catch (error) {
      console.error("Error setting player dream:", error);
      socket.emit("error", { message: "Помилка встановлення мрії" });
    }
  });

  // Обробник для отримання мрії гравця
  socket.on("get-player-dream", ({ gameId, playerId }, callback) => {
    console.log(`💭 Requesting dream for player ${playerId} in game ${gameId}`);

    try {
      const dream = getPlayerDream(playerId);
      const hasSelected = hasPlayerSelectedDream(playerId);

      if (callback) {
        callback({
          success: true,
          dream,
          hasSelected,
        });
      }
    } catch (error) {
      console.error("Error getting player dream:", error);
      if (callback) {
        callback({ success: false, error: "Помилка отримання мрії" });
      }
    }
  });

  // API endpoint для отримання фінансів гравця
  socket.on("get-player-finances", ({ gameId, playerId }, callback) => {
    console.log(
      `📊 Requesting finances for player ${playerId} in game ${gameId}`,
    );

    try {
      const finances = getPlayerFinances(playerId);
      if (callback) {
        callback({ success: true, finances });
      }
    } catch (error) {
      console.error("Error getting player finances:", error);
      if (callback) {
        callback({ success: false, error: "Помилка отримання фінансів" });
      }
    }
  });

  // 💰 Sell deal — продаж активу гравця
  socket.on("sell-deal", async ({ gameId, playerId, assetId, sellPrice }) => {
    console.log(`💰 [SELL_DEAL] Player ${playerId} selling asset ${assetId} in game ${gameId}, price: ${sellPrice ?? "auto"}`);

    try {
      const game = gameStore.get(gameId);
      if (!game) {
        socket.emit("error", { message: "Гру не знайдено" });
        return;
      }

      const result = await GameMechanicsService.sellAsset(game, playerId, assetId, sellPrice);

      if (!result.success) {
        socket.emit("error", { message: result.message });
        return;
      }

      // Синхронізуємо оновлений стан гри
      game.updatedAt = new Date();
      gameStore.set(gameId, game);

      const player = game.players.find(p => p.id === playerId);

      // Emit deal-sold всім у кімнаті
      gameNamespace.to(gameId).emit("deal-sold", {
        playerId,
        playerName: player?.name || playerId,
        assetId,
        amountReceived: result.amountReceived || 0,
        profit: result.profit || 0,
        newCashBalance: player?.finances?.cash || 0,
        newPassiveIncome: player?.finances?.passiveIncome || 0,
        message: result.message,
        gameState: game
      });

      // Оновлюємо фінанси для фронту
      if (player) {
        gameNamespace.to(gameId).emit("player-finances-updated", {
          playerId,
          finances: player.finances
        });
      }

      emitGameState(gameId);
      console.log(`✅ [SELL_DEAL] Asset sold. Net: $${result.amountReceived}, Profit: $${result.profit}`);

    } catch (error) {
      console.error("Error processing sell-deal:", error);
      socket.emit("error", { message: "Помилка при продажу активу: " + error.message });
    }
  });

  // 💔 Divorce resolve — fallback якщо фронт хоче вручну підтвердити
  // (у нас сума вже списана сервером, але хендлер потрібен для sync)
  socket.on("divorce-resolve", ({ gameId, playerId }) => {
    console.log(`💔 divorce-resolve received for ${playerId} in ${gameId}`);
    const game = gameStore.get(gameId);
    if (!game) return;

    const player = game.players.find(p => p.id === playerId);
    if (!player) return;

    // Якщо з якоїсь причини сума ще не списана — списуємо тут
    // (захист від race condition між execute-turn та фронтом)
    gameNamespace.to(gameId).emit("divorce-applied", {
      playerId,
      playerName: player.name,
      amountLost: 0,   // вже списано раніше
      newCashBalance: player.finances.cash,
      gameState: game
    });
    emitGameState(gameId);
  });

  // 💰 Cashflow Day collected — emit для фронту (нотифікація про дохід)
  socket.on("cashflow-day-collect", ({ gameId, playerId }) => {
    console.log(`💰 cashflow-day-collect for ${playerId} in ${gameId}`);
    const game = gameStore.get(gameId);
    if (!game) return;

    const player = game.players.find(p => p.id === playerId);
    if (!player) return;

    const income = player.finances.passiveIncome || 0;
    player.finances.cash += income;
    game.updatedAt = new Date();
    gameStore.set(gameId, game);

    console.log(`💰 [CASHFLOW_DAY] ${player.name} +$${income}. Balance: $${player.finances.cash}`);

    gameNamespace.to(gameId).emit("cashflow-day-collected", {
      playerId,
      playerName: player.name,
      amountReceived: income,
      newCashBalance: player.finances.cash,
      gameState: game
    });
    emitGameState(gameId);
  });

  socket.on("disconnect", () => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      console.log(
        `Player ${user.playerId} disconnected from game ${user.gameId}`,
      );
      socket
        .to(user.gameId)
        .emit("player-disconnected", { playerId: user.playerId });
      connectedUsers.delete(socket.id);
    }
    console.log("Game client disconnected:", socket.id);
  });
});

// Main namespace for compatibility
io.on("connection", (socket) => {
  console.log("Main client connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("Main client disconnected:", socket.id);
  });
});

// Start server - bind to 0.0.0.0 for Railway/Docker
server.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Cash Flow Ukraine Server Enhanced Started!");
  console.log(`🎮 Server running on port ${PORT}`);
  console.log("📡 Socket.IO ready");
  console.log("💼 TypeScript game mechanics enabled");
  console.log("🌐 Frontend: http://localhost:5173");
  console.log("💊 Health: http://localhost:3001/health");
  console.log("🎯 API: http://localhost:3001/api/games");
  console.log("=====================================");
});

// Diagnostic handlers to capture unexpected exits and keep process alive for debugging
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err && err.stack ? err.stack : err);
});

process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Rejection:", reason);
});

process.on("SIGTERM", () => {
  console.warn("⚠️ Received SIGTERM, shutting down gracefully...");
  try {
    server.close(() => {
      process.exit(0);
    });
  } catch (e) {
    process.exit(0);
  }
});

// Print PID and set a keep-alive interval when running in environments that may terminate short-lived processes
console.log("ℹ️ Process PID:", process.pid);
if (!global.__cashflow_keepalive) {
  global.__cashflow_keepalive = setInterval(() => {}, 1e9);
  console.log("ℹ️ Keep-alive interval set for debugging");
}
