import { useState, useEffect } from "react";
import { useToast } from "./hooks/useToast";
// Build trigger: mobile UI and event logic fixes
import ToastNotifications from "./components/ToastNotifications/ToastNotifications";
import { socketService } from "./services/socketService";
import { SOCKET_EVENTS } from "./constants/socketEvents";
import GameInterface from "./components/GameInterface/GameInterface";
import GameLobby from "./components/GameLobby/GameLobby";
import { ValidatedInput } from "./components/ValidatedInput";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ValidationRules } from "./utils/validation";
import { useConnectionSync } from "./hooks/useConnectionSync";
import useGameStore from "./store/gameStore";
import config from "./config/api";
import "./App.css";

// Notification type централізовано через useToast

type AppScreen = "lobby" | "game";

function App() {
  // Local UI state
  const [currentScreen, setCurrentScreen] = useState<AppScreen>("lobby");
  const [gameId, setGameId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [joinGameId, setJoinGameId] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("Відключено");
  // notifications централізовано через useToast
  const [isCreatingGame, setIsCreatingGame] = useState(false);
  const [isJoiningGame, setIsJoiningGame] = useState(false);
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);

  // Connection synchronization
  const { isConnected, hasGameState } = useConnectionSync();

  // Game store integration
  const {
    game: storeGameData,
    playerId: storePlayerId,
    setGame,
    setCurrentPlayer,
    setPlayerId: setStorePlayerId,
    setConnectionStatus: setStoreConnectionStatus,
  } = useGameStore();

  // Use store playerId as the primary source
  const currentPlayerId = storePlayerId || playerId;

  // Debug logging for gameStore
  useEffect(() => {
    console.log("🔍 GameStore state changed:");
    console.log("- storeGameData:", storeGameData);
    console.log("- storePlayerId:", storePlayerId);
    console.log("- currentScreen:", currentScreen);
    console.log("- isDeveloperMode:", isDeveloperMode);
  }, [storeGameData, storePlayerId, currentScreen, isDeveloperMode]);

  // Ініціалізація Socket.IO підключення
  useEffect(() => {
    const socket = socketService.connectToGame();
    setConnectionStatus("Підключається...");
    setStoreConnectionStatus(false);

    socket.on("connect", () => {
      setConnectionStatus("Підключено");
      setStoreConnectionStatus(true);
      console.log("Connected to game server");
    });

    socket.on("disconnect", () => {
      setConnectionStatus("Відключено");
      setStoreConnectionStatus(false);
      console.log("Disconnected from game server");
    });

    // Слухаємо події гри
    socket.on(SOCKET_EVENTS.GAME_STATE, (game) => {
      console.log("🎮 Game state updated from Socket.IO:", game);
      console.log("🎮 Players in game:", game?.players?.length || 0);
      console.log(
        "🎮 Current player data:",
        game?.players?.find((p) => p.id === currentPlayerId),
      );
      setGame(game);

      // ✅ Update current player data if found
      const currentPlayerData = game?.players?.find(
        (p) => p.id === currentPlayerId,
      );
      if (currentPlayerData) {
        console.log(
          "✅ Updating current player from game state:",
          currentPlayerData,
        );
        setCurrentPlayer(currentPlayerData);
      }
    });

    socket.on(
      SOCKET_EVENTS.PLAYER_JOINED,
      (data: { playerId: string; playerData: any }) => {
        console.log("👥 Player joined:", data);
        addNotification(
          "success",
          "Гравець приєднався",
          `${data.playerData?.name || "Гравець"} приєднався до гри.`,
        );
      },
    );

    socket.on(SOCKET_EVENTS.PLAYER_LEFT, (data: { playerId: string }) => {
      console.log("👋 Player left:", data);
      addNotification("warning", "Гравець вийшов", `Гравець вийшов з гри.`);
    });

    // ✅ Listen for ready status changes
    socket.on(
      "player-ready-status-changed" as any,
      (data: { playerId: string; isReady: boolean }) => {
        console.log("🔄 Player ready status changed:", data);
        addNotification(
          "info",
          "Статус змінено",
          `Гравець ${data.isReady ? "готовий" : "не готовий"} до гри.`,
        );
      },
    );

    socket.on("game-started", (data: { gameId: string; gameState?: any }) => {
      console.log("🚀 Game started event received:", data);
      if (data.gameState) {
        setGame(data.gameState);
        
        // Знаходимо поточного гравця
        const currentPlayerData = data.gameState.players?.find(
          (p: any) => p.id === currentPlayerId,
        );
        if (currentPlayerData) {
          setCurrentPlayer(currentPlayerData);
        }
      }
    });

    return () => {
      socketService.disconnectGame();
    };
  }, [setGame, setStoreConnectionStatus]);

  // 🔗 Auto-fill join code from URL ?join=CODE
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeFromUrl = params.get("join");
    if (codeFromUrl && codeFromUrl.trim()) {
      setJoinGameId(codeFromUrl.trim().toUpperCase());
      // Прибираємо параметр з URL без перезавантаження сторінки
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, "", cleanUrl);
    }
  }, []);

  // Генерація унікального ID гравця
  useEffect(() => {
    console.log("🆔 Player ID generation check:");
    console.log("- currentPlayerId:", currentPlayerId);
    console.log("- storePlayerId:", storePlayerId);
    console.log("- local playerId:", playerId);

    if (!currentPlayerId) {
      const newPlayerId =
        "player-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
      console.log("🆔 Generated new playerId:", newPlayerId);
      setPlayerId(newPlayerId);
      setStorePlayerId(newPlayerId);
    } else {
      console.log("✅ Player ID already exists:", currentPlayerId);
    }
  }, [currentPlayerId, setStorePlayerId]);

  const { success, error, warning, info, toasts, removeToast } = useToast();
  const addNotification = (
    type: "info" | "success" | "warning" | "error",
    title: string,
    message: string,
    duration?: number,
  ) => {
    switch (type) {
      case "success":
        success(title, message, duration);
        break;
      case "error":
        error(title, message, duration);
        break;
      case "warning":
        warning(title, message, duration);
        break;
      case "info":
      default:
        info(title, message, duration);
        break;
    }
  };

  const createGame = async () => {
    console.log("🎯 createGame called");
    console.log("- playerName:", playerName);
    console.log("- currentPlayerId:", currentPlayerId);
    console.log("- connectionStatus:", connectionStatus);

    if (!playerName.trim()) {
      console.log("❌ Player name is empty");
      addNotification(
        "warning",
        "Введіть ім'я",
        "Будь ласка, введіть ваше ім'я",
      );
      return;
    }

    if (!currentPlayerId) {
      console.log("❌ Player ID is missing");
      addNotification(
        "error",
        "Помилка ідентифікації",
        "Відсутній ідентифікатор гравця",
      );
      return;
    }

    setIsCreatingGame(true);
    console.log("🚀 Creating game with playerId:", currentPlayerId);
    try {
      // ✅ Fixed: Use correct backend API format
      const requestData = {
        hostId: currentPlayerId,
      };

      console.log("📡 Sending request:", requestData);

      const response = await fetch(config.endpoints.createGame, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      console.log("📥 Response status:", response.status);
      const data = await response.json();
      console.log("📥 Response data:", data);

      if (data.success) {
        const createdGameId = data.game.id;
        console.log("✅ Game created, now joining...", createdGameId);

        // ✅ Fixed: Auto-join the created game via API first
        await joinExistingGame(createdGameId);

        addNotification(
          "success",
          "Гру створено",
          `Гра створена успішно! ID: ${createdGameId}`,
        );
      } else {
        console.log("❌ Game creation failed:", data);
        addNotification(
          "error",
          "Помилка створення гри",
          data.error || "Невідома помилка",
        );
      }
    } catch (error) {
      console.error("💥 Error creating game:", error);
      addNotification(
        "error",
        "Помилка мережі",
        "Не вдалося створити гру. Спробуйте ще раз.",
      );
    } finally {
      setIsCreatingGame(false);
      console.log("🏁 createGame finished");
    }
  };

  const joinExistingGame = async (gameIdToJoin: string) => {
    try {
      console.log("🔗 Joining existing game via API:", gameIdToJoin);
      console.log("🔗 Join data:", {
        playerId: currentPlayerId,
        playerName: playerName.trim(),
        gameId: gameIdToJoin,
      });

      // ✅ Fixed: Join via API first with proper backend format
      const response = await fetch(config.endpoints.joinGame(gameIdToJoin), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerId: currentPlayerId,
          playerName: playerName.trim(), // ✅ Fixed: backend expects 'playerName', not 'name'
          profession: {
            name: "Вчитель", // Default profession for MVP
            salary: 3300,
            expenses: 2500,
            description: "Освітній працівник",
          },
        }),
      });

      console.log("🔗 Join response status:", response.status);
      const data = await response.json();
      console.log("🔗 Join response data:", data);

      if (data.success) {
        console.log(
          "✅ Successfully joined via API, now connecting Socket.IO...",
        );
        setGameId(gameIdToJoin);

        // ✅ Then connect via Socket.IO
        joinGameSocket(gameIdToJoin);

        // ✅ Fixed: Show lobby first, then game will start when ready
        setCurrentScreen("game"); // This will show GameLobby component for 'waiting' state

        return true;
      } else {
        console.log("❌ Join failed:", data);
        addNotification(
          "error",
          "Помилка приєднання",
          data.error || "Не вдалося приєднатися до гри",
        );
        return false;
      }
    } catch (error) {
      console.error("Error joining game:", error);
      addNotification(
        "error",
        "Помилка мережі",
        "Не вдалося з'єднатися з сервером",
      );
      return false;
    }
  };

  const joinGame = async () => {
    if (!joinGameId.trim()) {
      addNotification(
        "warning",
        "ID гри не введено",
        "Введіть ID гри для приєднання",
      );
      return;
    }

    if (!playerName.trim()) {
      addNotification(
        "warning",
        "Введіть ім'я",
        "Будь ласка, введіть ваше ім'я",
      );
      return;
    }

    setIsJoiningGame(true);
    const success = await joinExistingGame(joinGameId.trim());
    setIsJoiningGame(false);

    if (success) {
      addNotification(
        "success",
        "Приєднання успішне",
        `Ви приєдналися до гри ${joinGameId.trim()}`,
      );
    }
  };

  const joinGameSocket = (gameIdToJoin: string) => {
    console.log("🔌 Attempting to join game socket:", gameIdToJoin);
    console.log("🔌 Socket connected status:", socketService.isGameConnected);
    console.log("🔌 Player details:", {
      playerId: currentPlayerId,
      playerName: playerName.trim(),
    });

    if (socketService.isGameConnected) {
      // ✅ Fixed: Use proper socket event format matching backend
      console.log("🔌 Emitting join-game event...");
      socketService.joinGame(
        gameIdToJoin,
        currentPlayerId,
        playerName.trim() || "Player",
      );
      setGameId(gameIdToJoin);
      console.log("✅ Successfully sent join-game socket event");
    } else {
      console.warn("⚠️ Socket not connected, attempting to connect...");
      socketService.connectToGame();
      // Retry after connection
      setTimeout(() => {
        console.log("🔄 Retrying socket connection...");
        if (socketService.isGameConnected) {
          console.log("🔌 Connection established, emitting join-game event...");
          socketService.joinGame(
            gameIdToJoin,
            currentPlayerId,
            playerName.trim() || "Player",
          );
          setGameId(gameIdToJoin);
          console.log("✅ Successfully sent join-game socket event (retry)");
        } else {
          console.error("❌ Socket still not connected after retry");
          addNotification(
            "error",
            "Не підключено до сервера",
            "Не вдалося приєднатися до гри, спробуйте ще раз.",
          );
        }
      }, 1000);
    }
  };

  const handleBackToLobby = () => {
    setCurrentScreen("lobby");
    setGameId("");
    setGame(null);
    setIsDeveloperMode(false);
    socketService.disconnectGame();
    // Reconnect to server but not to any specific game
    socketService.connectToGame();
  };

  const startSinglePlayerMode = () => {
    if (!playerName.trim()) {
      addNotification("warning", "Введіть ім'я", "Будь ласка, введіть ваше ім'я для початку гри");
      return;
    }

    // Набір реальних професій (як у справжній грі Cashflow)
    const professions = [
      { name: "Вчитель",      salary: 3300, expenses: 2500, description: "Освітній працівник" },
      { name: "Лікар",        salary: 5200, expenses: 3800, description: "Медичний спеціаліст" },
      { name: "Програміст",   salary: 5000, expenses: 3000, description: "Розробник ПЗ" },
      { name: "Менеджер",     salary: 4500, expenses: 3500, description: "Керівник проєктів" },
      { name: "Архітектор",   salary: 4800, expenses: 3400, description: "Проєктувальник" },
      { name: "Підприємець",  salary: 4000, expenses: 3200, description: "Малий бізнес" },
      { name: "Юрист",        salary: 6000, expenses: 4500, description: "Правовий консультант" },
      { name: "Медсестра",    salary: 3500, expenses: 2800, description: "Медичний персонал" },
    ];
    const profession = professions[Math.floor(Math.random() * professions.length)];

    const singlePlayerId = currentPlayerId || "OFFLINE-" + Date.now();
    const singlePlayerGame = {
      id: "OFFLINE-MODE",
      hostId: singlePlayerId,
      state: "in_progress" as const,
      currentPlayer: singlePlayerId,
      turn: 1,
      players: [{
        id: singlePlayerId,
        name: playerName.trim(),
        position: 0,
        fastTrackPosition: 0,
        profession,
        finances: {
          salary: profession.salary,
          passiveIncome: 0,
          expenses: profession.expenses,
          cash: 10000,
          assets: [],
          liabilities: [],
        },
        assets: [],
        passiveIncome: 0,
        isOnFastTrack: false,
        isReady: true,
        isConnected: true,
      }],
      settings: { maxPlayers: 1, timeLimit: 3600, language: "uk" as const, allowSpectators: false, difficulty: "normal" as const },
      board: {
        ratRaceCells: Array(24).fill(null).map((_, i) => ({
          id: i,
          type: ["opportunity","market","doodad","charity","payday","opportunity","market","doodad","opportunity","baby","payday","opportunity","market","doodad","opportunity","downsize","payday","opportunity","market","doodad","opportunity","charity","payday","opportunity"][i % 24] as any,
          title: ["МОЖЛИВІСТЬ","РИНОК","ВИТРАТИ","БЛАГОДІЙНІСТЬ","ЗАРПЛАТА","МОЖЛИВІСТЬ","РИНОК","ВИТРАТИ","МОЖЛИВІСТЬ","ДИТИНА","ЗАРПЛАТА","МОЖЛИВІСТЬ","РИНОК","ВИТРАТИ","МОЖЛИВІСТЬ","ЗВІЛЬНЕННЯ","ЗАРПЛАТА","МОЖЛИВІСТЬ","РИНОК","ВИТРАТИ","МОЖЛИВІСТЬ","БЛАГОДІЙНІСТЬ","ЗАРПЛАТА","МОЖЛИВІСТЬ"][i % 24],
          description: "Клітинка одиночної гри",
        })),
        fastTrackCells: Array(16).fill(null).map((_, i) => ({
          id: i,
          type: "business" as any,
          title: "БІЗНЕС",
          description: "Fast Track клітинка",
        })),
      },
      deals: [
        // Small Deals
        { id: 'deal_apt_1', title: '2-кімн. квартира (здача)', category: 'real_estate', cost: 45000, downPayment: 9000, cashFlow: 400, mortgage: 36000, isAvailable: true, description: 'Здача квартири в оренду. Стабільний дохід.' },
        { id: 'deal_stocks_1', title: 'Акції MYX Corp (1000 шт.)', category: 'stocks', cost: 5000, downPayment: 5000, cashFlow: 0, isAvailable: true, description: 'Акції ростуть при ринковому бумі.' },
        { id: 'deal_biz_1', title: 'Пральня самообслуговування', category: 'business', cost: 12000, downPayment: 6000, cashFlow: 500, mortgage: 6000, isAvailable: true, description: 'Малий бізнес. Постійний пасивний дохід.' },
        { id: 'deal_apt_2', title: '3-кімн. квартира (здача)', category: 'real_estate', cost: 65000, downPayment: 13000, cashFlow: 600, mortgage: 52000, isAvailable: true, description: 'Більша квартира — більший дохід.' },
        // Big Deals
        { id: 'deal_house_1', title: 'Будинок на 8 квартир', category: 'real_estate', cost: 120000, downPayment: 30000, cashFlow: 1500, mortgage: 90000, isAvailable: true, description: 'Прибутковий будинок. Значний пасивний дохід.' },
        { id: 'deal_biz_2', title: 'Франшиза фастфуду', category: 'business', cost: 80000, downPayment: 20000, cashFlow: 2000, mortgage: 60000, isAvailable: true, description: 'Відомий бренд — швидкий старт.' },
        { id: 'deal_land_1', title: 'Земельна ділянка (комерція)', category: 'real_estate', cost: 30000, downPayment: 30000, cashFlow: 0, isAvailable: true, description: 'Перепродаж при зростанні ринку.' },
        { id: 'deal_stocks_2', title: 'Акції GRO Industries (500 шт.)', category: 'stocks', cost: 8000, downPayment: 8000, cashFlow: 0, isAvailable: true, description: 'Висока потенційна дохідність.' },
      ], marketEvents: [], negotiations: [],
      createdAt: new Date(), updatedAt: new Date(),
    };

    setGame(singlePlayerGame);
    setCurrentPlayer(singlePlayerGame.players[0]);
    setStorePlayerId(singlePlayerId);
    setPlayerId(singlePlayerId);
    setGameId("OFFLINE-MODE");
    setCurrentScreen("game");
    addNotification("success", "🎮 Гру розпочато!", `Ваша професія: ${profession.name} | Зарплата: $${profession.salary.toLocaleString()}/міс`);
  };

  const startDeveloperMode = () => {
    console.log("🧪 Активуємо тестовий режим з панеллю...");

    const devPlayerId = currentPlayerId || "DEV-001";
    const devPlayerName = playerName || "Developer";

    const mockPlayer = {
      id: devPlayerId,
      name: devPlayerName,
      position: 0,
      fastTrackPosition: 0,
      profession: {
        name: "Програміст",
        salary: 5000,
        expenses: 3000,
        description: "Розробник програмного забезпечення",
      },
      finances: {
        salary: 5000,
        passiveIncome: 0,
        expenses: 3000,
        cash: 10000,
        assets: [],
        liabilities: [],
      },
      assets: [],
      passiveIncome: 0,
      isOnFastTrack: false,
      isReady: true,
      isConnected: true,
    };

    const mockGameData = {
      id: "DEV-MODE",
      hostId: devPlayerId,
      state: "in_progress" as const,
      currentPlayer: devPlayerId,
      turn: 1,
      players: [mockPlayer],
      settings: {
        maxPlayers: 4,
        timeLimit: 3600,
        language: "uk" as const,
        allowSpectators: false,
        difficulty: "normal" as const,
      },
      board: {
        ratRaceCells: Array(24).fill(null).map((_, i) => ({
          id: i,
          type: ['opportunity', 'market', 'doodad', 'charity', 'payday', 'opportunity', 'market', 'doodad', 'opportunity', 'baby', 'payday', 'opportunity', 'market', 'doodad', 'opportunity', 'downsize', 'payday', 'opportunity', 'market', 'doodad', 'opportunity', 'charity', 'payday', 'opportunity'][i % 24] as any,
          title: ['МОЖЛИВІСТЬ', 'РИНОК', 'ВИТРАТИ', 'МОЖЛИВІСТЬ', 'БЛАГОДІЙНІСТЬ', 'ЗАРПЛАТА', 'МОЖЛИВІСТЬ', 'РИНОК', 'ВИТРАТИ', 'МОЖЛИВІСТЬ', 'ДИТИНА', 'ЗАРПЛАТА', 'МОЖЛИВІСТЬ', 'РИНОК', 'ВИТРАТИ', 'ГРОШІ', 'ЗВІЛЬНЕННЯ', 'ЗАРПЛАТА', 'МОЖЛИВІСТЬ', 'РИНОК', 'ВИТРАТИ', 'БІЗНЕС', 'БЛАГОДІЙНІСТЬ', 'ЗАРПЛАТА'][i % 24],
          description: 'Dev mode cell'
        })),
        fastTrackCells: Array(16).fill(null).map((_, i) => ({
          id: i,
          type: 'business' as any,
          title: 'БІЗНЕС',
          description: 'Dev mode FT cell'
        })),
      },
      deals: [],
      marketEvents: [],
      negotiations: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log("🧪 Mock game data created:", mockGameData);

    // Встановлюємо в gameStore
    setGame(mockGameData);
    setCurrentPlayer(mockPlayer);
    setStorePlayerId(devPlayerId);

    // Встановлюємо локальні стани (З developer mode = true)
    setGameId("DEV-MODE");
    setPlayerId(devPlayerId);
    setIsDeveloperMode(true); // ✅ Включаємо developer mode для панелі тестування
    setCurrentScreen("game");

    addNotification(
      "info",
      "Тестовий режим",
      "Запущено тестовий режим з панеллю для розробників",
    );

    console.log("✅ Тестовий режим з панеллю активовано!");
  };

  return (
    <ErrorBoundary>
      <div className="app">
        {currentScreen === "lobby" ? (
          <div className="lobby-container">
            {/* === Connection status bar at top === */}
            <div className="lobby-conn-bar">
              <div className={`conn-status-dot ${isConnected ? 'connected' : 'disconnected'}`}></div>
              <span className="conn-status-text">{isConnected ? 'Підключено' : 'Відключено'}</span>
              {currentPlayerId && (
                <span className="conn-player-id">
                  Player ID: {currentPlayerId.substring(0, 14)}...
                </span>
              )}
              <span className="conn-socket">
                Socket: {isConnected ? '✅' : '❌'}
              </span>
              <button
                className="dev-mode-badge"
                onClick={startDeveloperMode}
                title="Тестовий режим розробника"
              >
                🧪
              </button>
            </div>

            {/* === Brand === */}
            <div className="lobby-brand-line">Cash Flow Ukraine</div>

            {/* === Welcome card === */}
            <div className="lobby-welcome-card">
              <h1 className="lobby-welcome-title">Вітаємо у грі!</h1>
              <p className="lobby-welcome-sub">Введіть ваше ім'я щоб почати</p>
            </div>

            <main className="lobby-main">
              {/* Name input */}
              <div className="name-input-block">
                <ValidatedInput
                  id="playerName"
                  type="text"
                  placeholder="Введіть ваше ім'я..."
                  value={playerName}
                  onChange={setPlayerName}
                  validationRules={ValidationRules.playerName}
                  label="Ваше ім'я"
                  className="player-name-input"
                  maxLength={20}
                  validateOnChange={true}
                />
              </div>

              {/* ★ PRIMARY ACTION: Play Solo */}
              <button
                onClick={startSinglePlayerMode}
                disabled={!playerName.trim()}
                className="hero-play-btn"
              >
                <span className="hero-btn-icon">🎯</span>
                <span className="hero-btn-text">
                  <strong>Станьте творцем фінансової свободи</strong>
                  <small>Грати в одного — починай одразу</small>
                </span>
              </button>

              {/* SECONDARY: Multiplayer */}
              <div className="multiplayer-block">
                <p className="block-label">Грати з друзями</p>
                <div className="multiplayer-row">
                  {/* Create game */}
                  <button
                    onClick={createGame}
                    disabled={!playerName.trim() || !isConnected || isCreatingGame}
                    className="mp-btn create-mp-btn"
                  >
                    {isCreatingGame ? (
                      <><span className="loading-spinner small"></span> Створення...</>
                    ) : (
                      <><span>🎮</span> Створити кімнату</>
                    )}
                  </button>

                  {/* Join game */}
                  <div className="join-group">
                    <ValidatedInput
                      type="gameId"
                      placeholder="Код кімнати"
                      value={joinGameId}
                      onChange={setJoinGameId}
                      validationRules={ValidationRules.gameId}
                      label=""
                      className="join-code-input"
                      maxLength={6}
                      validateOnChange={true}
                    />
                    <button
                      onClick={joinGame}
                      disabled={!playerName.trim() || !joinGameId.trim() || !isConnected || isJoiningGame}
                      className="mp-btn join-mp-btn"
                    >
                      {isJoiningGame ? (
                        <><span className="loading-spinner small"></span> Вхід...</>
                      ) : (
                        <><span>🔗</span> Приєднатися</>
                      )}
                    </button>
                  </div>
                </div>

                {!isConnected && (
                  <p className="offline-note">
                    ⚠️ Немає з'єднання з сервером — мультиплеєр недоступний
                  </p>
                )}
              </div>

              {/* Rules — collapsible, minimal */}
              <details className="rules-hint">
                <summary>📋 Як грати</summary>
                <div className="rules-mini">
                  <p>🎲 Кидай кубик → рухайся по дошці</p>
                  <p>💰 Купуй активи → збільшуй пасивний дохід</p>
                  <p>🚀 Пасивний дохід {">"} витрат → виходиш на Fast Track</p>
                  <p>🏆 На Fast Track купи мрію і перемагай!</p>
                </div>
              </details>
            </main>

            <footer className="lobby-footer">
              <p>© 2025 Cash Flow Ukraine</p>
            </footer>
          </div>
        ) : (
          <div className="game-container-">
            {/* Game Header - переміщуємо зверху як окремий елемент */}
            <header className="game-header-main">
              <button onClick={handleBackToLobby} className="back-button">
                ← До лобі
              </button>
            </header>

            {storeGameData ? (
              <main className="game-content">
                {/* Show GameLobby for waiting/starting states */}
                {storeGameData.state === "waiting" ||
                storeGameData.state === "starting" ? (
                  <GameLobby
                    game={storeGameData}
                    gameId={gameId}
                    playerId={currentPlayerId} // ✅ Fixed: Use consistent playerId
                    onNotification={(notification) => {
                      addNotification(
                        notification.type,
                        notification.title,
                        notification.message,
                        notification.duration,
                      );
                    }}
                    onStartDeveloperMode={startDeveloperMode}
                  />
                ) : storeGameData.state === "in_progress" ? (
                  <>
                    {/* Game Interface Component */}
                    <GameInterface
                      gameId={gameId}
                      playerId={currentPlayerId} // ✅ Fixed: Use consistent playerId
                      onBackToLobby={handleBackToLobby}
                      isDeveloperMode={isDeveloperMode} // ✅ Передаємо флаг developer mode
                    />
                  </>
                ) : (
                  <div className="game-loading">
                    <span className="loading-spinner large"></span>
                    <p>Підготовка гри...</p>
                  </div>
                )}
              </main>
            ) : (
              <main className="loading-game">
                <span className="loading-spinner large"></span>
                <p>Завантаження гри...</p>
              </main>
            )}
          </div>
        )}

        {/* Toast Notifications (централізовано) */}
        <ToastNotifications toasts={toasts} onRemove={removeToast} />
      </div>
    </ErrorBoundary>
  );
}

export default App;
