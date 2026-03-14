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

  const startSinglePlayerMode = async () => {
    console.log("🎮 Запуск одиночної гри через backend...");

    if (!playerName.trim()) {
      addNotification(
        "warning",
        "Введіть ім'я",
        "Будь ласка, введіть ваше ім'я для початку гри",
      );
      return;
    }

    setIsCreatingGame(true);
    try {
      // 1. Створюємо гру на сервері
      const response = await fetch(config.endpoints.createGame, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hostId: currentPlayerId,
          settings: {
            maxPlayers: 1,
            difficulty: "normal"
          }
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        const newGameId = data.game.id;
        console.log("✅ Гру створено на сервері:", newGameId);
        
        // 2. Приєднуємося до гри
        const joined = await joinExistingGame(newGameId);
        
        if (joined) {
          // 3. Відправляємо сигнал про старт гри (оскільки це одиночний режим)
          console.log("🚀 Стартуємо гру негайно...");
          socketService.getGameSocket()?.emit("game-started", { gameId: newGameId });
          
          addNotification(
            "success",
            "Гру розпочато!",
            "Ви граєте у режимі одного гравця (на базі реальних механік)",
          );
        }
      } else {
        throw new Error(data.error || "Не вдалося створити гру");
      }
    } catch (err) {
      console.error("💥 Помилка запуску одиночної гри:", err);
      // Fallback до mock режиму якщо сервер недоступний
      addNotification("warning", "Сервер недоступний", "Запуск у офлайн-режимі (обмежений функціонал)");
      
      const singlePlayerId = currentPlayerId || "OFFLINE-001";
      const singlePlayerGame = {
        id: "OFFLINE-MODE",
        hostId: singlePlayerId,
        state: "in_progress" as const,
        currentPlayer: singlePlayerId,
        turn: 1,
        players: [{
          id: singlePlayerId,
          name: playerName || "Гравець",
          position: 0,
          fastTrackPosition: 0,
          profession: { name: "Вчитель", salary: 3300, expenses: 2500 },
          finances: { salary: 3300, passiveIncome: 0, expenses: 2500, cash: 10000, assets: [], liabilities: [] },
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
            type: ['opportunity', 'market', 'doodad', 'charity', 'payday'][i % 5] as any,
            title: ['МОЖЛИВІСТЬ', 'РИНОК', 'ВИТРАТИ', 'БЛАГОДІЙНІСТЬ', 'ЗАРПЛАТА'][i % 5],
            description: 'Offline mode cell'
          })),
          fastTrackCells: Array(16).fill(null).map((_, i) => ({
            id: i,
            type: 'business' as any,
            title: 'БІЗНЕС',
            description: 'Offline mode FT cell'
          }))
        },
        deals: [], marketEvents: [], negotiations: [], createdAt: new Date(), updatedAt: new Date(),
      };
      setGame(singlePlayerGame);
      setCurrentPlayer(singlePlayerGame.players[0]);
      setStorePlayerId(singlePlayerId);
      setGameId("OFFLINE-MODE");
      setCurrentScreen("game");
    } finally {
      setIsCreatingGame(false);
    }
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
            {/* Header */}
            <header className="lobby-header">
              <div className="card board-card">
                {/* Centered Title */}
                <div className="title-section">
                  <h1 className="game-title">
                    <span className="title-icon">💎</span>
                    Cash Flow Ukraine
                  </h1>
                </div>

                {/* Connection Status - Top Right Corner */}
                <div className="connection-status">
                  <div
                    className={`status-indicator ${isConnected ? "connected" : "disconnected"}`}
                  >
                    <span className="status-dot"></span>
                    {isConnected ? "Підключено" : "Відключено"}
                  </div>
                  <div className="debug-info">
                    <small>
                      Player ID: {currentPlayerId?.substring(0, 12)}...
                    </small>
                    <small>
                      Socket: {socketService.isGameConnected ? "✅" : "❌"}
                    </small>
                    {hasGameState && <small>💾 Збережено</small>}
                  </div>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="lobby-main">
              <div className="lobby-content">
                {/* Welcome Section */}
                <div className="card stats-card">
                  <h2>Вітаємо у грі!</h2>
                  <p className="subtitle">Введіть ваше ім'я щоб почати</p>
                </div>

                {/* Player Name Input */}
                <div className="card action-card">
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

                {/* Separate Action Blocks - Distinct Design */}
                <div className="separated-actions">
                  {/* Create Game Section */}
                  <div className="action-section create-section">
                    <div className="section-header">
                      <div className="section-icon create-icon">🎯</div>
                      <div className="section-title">
                        <h3>Створити нову гру</h3>
                        <p>Станьте хостом власної кімнати</p>
                      </div>
                    </div>
                    <div className="section-content">
                      <div className="action-card create-card">
                        <div className="card-body">
                          <div className="feature-list">
                            <span className="feature">
                              ⚡ Миттєве створення
                            </span>
                            <span className="feature">🎮 Контроль гри</span>
                            <span className="feature">👥 До 6 гравців</span>
                          </div>
                          <button
                            onClick={() => {
                              console.log("🖱️ Create Game button clicked");
                              console.log(
                                "- connectionStatus:",
                                connectionStatus,
                              );
                              console.log(
                                "- playerName.trim():",
                                playerName.trim(),
                              );
                              console.log("- isCreatingGame:", isCreatingGame);
                              const isDisabled =
                                connectionStatus !== "Підключено" ||
                                !playerName.trim() ||
                                isCreatingGame;
                              console.log("- button disabled:", isDisabled);

                              if (!isDisabled) {
                                createGame();
                              } else {
                                console.log(
                                  "❌ Button is disabled, cannot create game",
                                );
                              }
                            }}
                            disabled={
                              connectionStatus !== "Підключено" ||
                              !playerName.trim() ||
                              isCreatingGame
                            }
                            className="section-btn create-btn"
                          >
                            {isCreatingGame ? (
                              <>
                                <span className="loading-spinner small"></span>
                                Створюється...
                              </>
                            ) : (
                              <>
                                <span className="btn-icon">🎯</span>
                                Створити гру
                              </>
                            )}
                          </button>

                          {/* Single Player Mode Button */}
                          <button
                            onClick={() => {
                              console.log("🎮 Single player mode requested");
                              if (!playerName.trim()) {
                                addNotification(
                                  "warning",
                                  "Введіть ім'я",
                                  "Будь ласка, введіть ваше ім'я",
                                );
                                return;
                              }
                              startSinglePlayerMode();
                            }}
                            disabled={!playerName.trim()}
                            className="section-btn create-btn"
                            style={{
                              background:
                                "linear-gradient(45deg, #4CAF50, #45a049)",
                              marginTop: "8px",
                              border: "2px solid #4CAF50",
                            }}
                            title="Грати в одного - фінальна версія гри без панелі тестування"
                          >
                            <span className="btn-icon">🎮</span>
                            Грати в одного
                          </button>

                          {/* Debug button for testing */}
                          {connectionStatus !== "Підключено" && (
                            <button
                              onClick={async () => {
                                if (!playerName.trim()) {
                                  addNotification(
                                    "warning",
                                    "Введіть ім'я",
                                    "Будь ласка, введіть ваше ім'я",
                                  );
                                  return;
                                }
                                console.log(
                                  "🧪 TESTING: Forcing game creation without Socket.IO",
                                );
                                await createGame();
                              }}
                              disabled={!playerName.trim() || isCreatingGame}
                              className="section-btn create-btn"
                              style={{
                                background: "#ff6b6b",
                                marginTop: "8px",
                              }}
                              title="Debug: створити гру без перевірки Socket.IO"
                            >
                              🧪 Форсувати створення
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Join Game Section */}
                  <div className="action-section join-section">
                    <div className="section-header">
                      <div className="section-icon join-icon">🔗</div>
                      <div className="section-title">
                        <h3>Приєднатися до гри</h3>
                        <p>Введіть код кімнати для входу</p>
                      </div>
                    </div>
                    <div className="section-content">
                      <div className="action-card join-card">
                        <div className="card-body">
                          <div className="join-form">
                            <ValidatedInput
                              type="gameId"
                              placeholder="Введіть код (ABC123)"
                              value={joinGameId}
                              onChange={setJoinGameId}
                              validationRules={ValidationRules.gameId}
                              label="Код кімнати"
                              className="join-input"
                              maxLength={6}
                              validateOnChange={true}
                            />
                            <div className="feature-list">
                              <span className="feature">🚀 Швидкий вхід</span>
                              <span className="feature">🎲 Почніть грати</span>
                            </div>
                          </div>
                          <button
                            onClick={joinGame}
                            disabled={
                              connectionStatus !== "Підключено" ||
                              !playerName.trim() ||
                              !joinGameId.trim() ||
                              isJoiningGame
                            }
                            className="section-btn join-btn"
                          >
                            {isJoiningGame ? (
                              <>
                                <span className="loading-spinner small"></span>
                                Підключення...
                              </>
                            ) : (
                              <>
                                <span className="btn-icon">🔗</span>
                                Приєднатися
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info Section */}
                <div className="info-section">
                  <div className="info-card">
                    <h4>Про гру</h4>
                    <p>
                      Cash Flow Ukraine - це онлайн версія популярної настільної
                      гри, де гравці вчаться управляти фінансами та інвестувати
                      кошти.
                    </p>
                  </div>

                  {/* Game Rules - NEW SECTION */}
                  <div className="info-card rules-card">
                    <h4>📋 Правила гри</h4>
                    <div className="rules-content">
                      <div className="rules-section">
                        <h5>🎯 Мета гри:</h5>
                        <p>
                          Вийти з "пастки для щурів" та досягти фінансової
                          свободи через пасивний дохід
                        </p>
                      </div>

                      <div className="rules-section">
                        <h5>🎲 Хід гри:</h5>
                        <ul>
                          <li>Кидайте кубики та рухайтеся по полю</li>
                          <li>Отримуйте зарплату та сплачуйте витрати</li>
                          <li>Купуйте активи для генерації пасивного доходу</li>
                          <li>Уникайте пасток та поганих боргів</li>
                        </ul>
                      </div>

                      <div className="rules-section">
                        <h5>💰 Фінанси:</h5>
                        <ul>
                          <li>
                            Пасивний дохід {">"} Витрати = Фінансова свобода
                          </li>
                          <li>Інвестуйте в нерухомість, акції, бізнес</li>
                          <li>Стежте за грошовим потоком</li>
                        </ul>
                      </div>

                      <div className="rules-section">
                        <h5>🏆 Перемога:</h5>
                        <p>
                          Перший гравець, який досягне фінансової свободи,
                          перемагає!
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="info-card">
                    <h4>Як грати</h4>
                    <ul>
                      <li>
                        <strong>🎮 Грати в одного:</strong> Фінальна версія гри
                        без панелей розробника - як у реальному випуску
                      </li>
                      <li>
                        <strong>👥 Мультиплеєр:</strong> Створіть гру або
                        приєднайтеся за ID для гри з друзями
                      </li>
                      <li>
                        <strong>🧪 Тестування:</strong> Режим розробника з
                        додатковими панелями для налагодження
                      </li>
                      <li>Керуйте фінансами та досягайте фінансової свободи</li>
                    </ul>
                  </div>
                </div>
              </div>
            </main>

            {/* Footer */}
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
