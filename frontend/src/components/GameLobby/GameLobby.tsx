import React, { useState, useEffect } from "react";
import type { Game, Dream } from "../../types/game";
import { PROFESSIONS } from "../../types/game";
import { socketService } from "../../services/socketService";
import { SOCKET_EVENTS } from "../../constants/socketEvents";
import DreamSelectionLobby from "../DreamSelectionLobby/DreamSelectionLobby";
import config from "../../config/api";
import "./GameLobby.css";

interface Notification {
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  duration?: number;
}

interface GameLobbyProps {
  game: Game;
  gameId: string;
  playerId: string;
  onNotification: (notification: Notification) => void;
  onStartDeveloperMode?: () => void;
}

const GameLobby: React.FC<GameLobbyProps> = ({
  game,
  gameId,
  playerId,
  onNotification,
  onStartDeveloperMode,
}) => {
  const [selectedProfession, setSelectedProfession] = useState<string>("");
  const [isReady, setIsReady] = useState(false);
  const [showProfessionModal, setShowProfessionModal] = useState(false);
  const [selectedDream, setSelectedDream] = useState<Dream | undefined>(
    undefined,
  );
  const [showDreamModal, setShowDreamModal] = useState(false);

  const currentPlayer = game?.players.find((p) => p.id === playerId);
  const isHost = game?.hostId === playerId;
  const allPlayersReady =
    game?.players.length >= 1 && game?.players.every((p) => p.isReady);

  useEffect(() => {
    if (currentPlayer) {
      setSelectedProfession(currentPlayer.profession.name);
      setIsReady(currentPlayer.isReady);
      setSelectedDream(currentPlayer.dream);
    }
  }, [currentPlayer]);

  // Socket.IO event listeners for real-time updates
  useEffect(() => {
    const socket = socketService.connectToGame();

    // Listen for lobby events
    socket.on(
      SOCKET_EVENTS.PLAYER_READY,
      (data: { playerId: string; isReady: boolean }) => {
        const playerName = game.players.find(
          (p) => p.id === data.playerId,
        )?.name;
        onNotification({
          type: "info",
          title: data.isReady ? "Гравець готовий" : "Гравець не готовий",
          message: `${playerName} ${data.isReady ? "готовий" : "не готовий"} до гри`,
          duration: 3000,
        });
      },
    );

    socket.on(
      SOCKET_EVENTS.PROFESSION_SELECTED,
      (data: { playerId: string; profession: string; playerName: string }) => {
        if (data.playerId !== playerId) {
          onNotification({
            type: "info",
            title: "Професію змінено",
            message: `${data.playerName} обрав професію: ${data.profession}`,
            duration: 3000,
          });
        }
      },
    );

    socket.on(
      SOCKET_EVENTS.PLAYER_REMOVED,
      (data: { playerId: string; playerName: string }) => {
        onNotification({
          type: "warning",
          title: "Гравця видалено",
          message: `${data.playerName} був видалений з гри`,
          duration: 3000,
        });
      },
    );

    socket.on(SOCKET_EVENTS.GAME_STARTING, () => {
      onNotification({
        type: "success",
        title: "Гра починається!",
        message: "Хост розпочинає гру...",
        duration: 3000,
      });
    });

    return () => {
      socket.off(SOCKET_EVENTS.PLAYER_READY);
      socket.off(SOCKET_EVENTS.PROFESSION_SELECTED);
      socket.off(SOCKET_EVENTS.PLAYER_REMOVED);
      socket.off(SOCKET_EVENTS.GAME_STARTING);
    };
  }, [game.players, playerId, onNotification]);

  const handleProfessionChange = async (professionName: string) => {
    console.log("🏢 Profession change requested:", professionName);
    console.log("🏢 GameId:", gameId);
    console.log("🏢 PlayerId:", playerId);

    try {
      const response = await fetch(config.endpoints.profession(gameId), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerId,
          professionName,
        }),
      });

      console.log("🏢 Profession change response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("🏢 Profession change success:", data);

        setSelectedProfession(professionName);
        setShowProfessionModal(false);

        // Also emit socket event for real-time updates
        const socket = socketService.connectToGame();
        socket.emit(SOCKET_EVENTS.PROFESSION_SELECTED, {
          gameId,
          playerId,
          profession: professionName,
        });

        onNotification({
          type: "success",
          title: "Професію змінено",
          message: `Ви вибрали професію: ${professionName}`,
          duration: 3000,
        });
      } else {
        const error = await response.json();
        console.log("🏢 Profession change error:", error);
        onNotification({
          type: "error",
          title: "Помилка",
          message: error.message || "Не вдалося змінити професію",
          duration: 5000,
        });
      }
    } catch (error) {
      onNotification({
        type: "error",
        title: "Помилка мережі",
        message: "Не вдалося підключитися до сервера",
        duration: 5000,
      });
    }
  };

  const handleReadyToggle = async () => {
    console.log("🔄 Ready toggle requested, current state:", isReady);
    console.log("🔄 GameId:", gameId);
    console.log("🔄 PlayerId:", playerId);

    try {
      const newReadyState = !isReady;

      const response = await fetch(config.endpoints.readyStatus(gameId), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerId,
          isReady: newReadyState,
        }),
      });

      console.log("🔄 Ready toggle response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("🔄 Ready toggle success:", data);

        setIsReady(newReadyState);

        // Also emit socket event for real-time updates
        const socket = socketService.connectToGame();
        socket.emit(SOCKET_EVENTS.PLAYER_READY, {
          gameId,
          playerId,
          isReady: newReadyState,
        });

        onNotification({
          type: "success",
          title: newReadyState ? "Готові до гри" : "Скасовано готовність",
          message: newReadyState
            ? "Ви готові розпочати гру"
            : "Ви скасували готовність",
          duration: 3000,
        });
      } else {
        const error = await response.json();
        onNotification({
          type: "error",
          title: "Помилка",
          message: error.message || "Не вдалося змінити статус готовності",
          duration: 5000,
        });
      }
    } catch (error) {
      onNotification({
        type: "error",
        title: "Помилка мережі",
        message: "Не вдалося підключитися до сервера",
        duration: 5000,
      });
    }
  };

  const handleRemovePlayer = async (playerIdToRemove: string) => {
    if (!isHost) return;

    try {
      const response = await fetch(config.endpoints.removePlayer(gameId), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hostId: playerId,
          playerIdToRemove,
        }),
      });

      if (response.ok) {
        onNotification({
          type: "success",
          title: "Гравця видалено",
          message: "Гравця було успішно видалено з гри",
          duration: 3000,
        });
      } else {
        const error = await response.json();
        onNotification({
          type: "error",
          title: "Помилка",
          message: error.message || "Не вдалося видалити гравця",
          duration: 5000,
        });
      }
    } catch (error) {
      onNotification({
        type: "error",
        title: "Помилка мережі",
        message: "Не вдалося підключитися до сервера",
        duration: 5000,
      });
    }
  };

  const handleStartGame = async () => {
    if (!isHost || !allPlayersReady) return;

    try {
      const response = await fetch(config.endpoints.startGame(gameId), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hostId: playerId,
        }),
      });

      if (response.ok) {
        onNotification({
          type: "success",
          title: "Гру розпочато!",
          message: "Усі гравці готові. Гра починається!",
          duration: 3000,
        });
      } else {
        const error = await response.json();
        onNotification({
          type: "error",
          title: "Помилка",
          message: error.message || "Не вдалося розпочати гру",
          duration: 5000,
        });
      }
    } catch (error) {
      onNotification({
        type: "error",
        title: "Помилка мережі",
        message: "Не вдалося підключитися до сервера",
        duration: 5000,
      });
    }
  };

  const getProfessionInfo = (professionName: string) => {
    return PROFESSIONS.find((p) => p.name === professionName);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("uk-UA", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Обробка вибору мрії
  const handleDreamSelected = async (dream: Dream) => {
    try {
      if (gameId !== "DEV-MODE") {
        // Відправляємо мрію на backend для збереження
        socketService.setPlayerDream(gameId, playerId, dream);
      }

      setSelectedDream(dream);
      setShowDreamModal(false);

      onNotification({
        type: "success",
        title: "🌟 Мрію обрано!",
        message: `Ваша мрія: ${dream.title}. Ціль: $${dream.estimatedCost.toLocaleString()}`,
        duration: 4000,
      });
    } catch (error) {
      onNotification({
        type: "error",
        title: "Помилка",
        message: "Не вдалося зберегти мрію. Спробуйте ще раз.",
        duration: 4000,
      });
    }
  };

  const handleDreamSkipped = () => {
    setShowDreamModal(false);
    onNotification({
      type: "info",
      title: "Мрію пропущено",
      message: "Ви можете обрати мрію під час гри",
      duration: 3000,
    });
  };

  if (!game) {
    return (
      <div className="lobby-loading">
        <div className="card loading-card">
          <div className="loading-spinner"></div>
          <p>Завантаження лобі...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="game-lobby">
      <div className="lobby-header">
        <div className="card board-card">
          <h1>🎯 CASHFLOW Online</h1>
          <div className="game-info">
            <div className="game-id">
              <span className="label">Код гри:</span>
              <span className="id">{gameId}</span>
            </div>
            <div className="players-count">
              <span>
                {game.players.length}/{game.settings.maxPlayers} гравців
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="lobby-content">
        <div className="players-section">
          <div className="card stats-card">
            <h2>👥 Гравці в лобі</h2>
          </div>

          <div className="players-list">
            {game.players.map((player) => {
              const profession = getProfessionInfo(player.profession.name);
              const isCurrentPlayer = player.id === playerId;

              return (
                <div
                  key={player.id}
                  className={`card lobby-card ${isCurrentPlayer ? "glow" : ""} ${player.isReady ? "success-card" : "warning-card"}`}
                >
                  <div className="player-info">
                    <div className="player-name">
                      {player.name}
                      {isCurrentPlayer && (
                        <span className="you-label">(Ви)</span>
                      )}
                      {game.hostId === player.id && (
                        <span className="host-label">👑 Хост</span>
                      )}
                    </div>

                    <div className="player-profession">
                      <span className="profession-name">
                        {player.profession.name}
                      </span>
                      {profession && (
                        <div className="profession-details">
                          <span>
                            Зарплата: {formatCurrency(profession.salary)}
                          </span>
                          <span>
                            Витрати: {formatCurrency(profession.expenses)}
                          </span>
                        </div>
                      )}
                    </div>

                    {(player as any).dream && (
                      <div className="player-dream">
                        <span className="dream-indicator">
                          {(player as any).dream.icon}{" "}
                          {(player as any).dream.title}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="player-status">
                    <div
                      className={`ready-indicator ${player.isReady ? "ready" : "not-ready"}`}
                    >
                      {player.isReady ? "✅ Готовий" : "⏳ Не готовий"}
                    </div>

                    {isHost && player.id !== playerId && (
                      <button
                        className="remove-player-btn"
                        onClick={() => handleRemovePlayer(player.id)}
                        title="Видалити гравця"
                      >
                        ❌
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="controls-section">
          <div className="card action-card">
            <h3>⚙️ Ваші налаштування</h3>

            <div className="profession-control">
              <label>Професія:</label>
              <button
                className="change-profession-btn"
                onClick={() => setShowProfessionModal(true)}
                disabled={isReady}
              >
                {selectedProfession || "Обрати професію"}
              </button>
              {isReady && (
                <span className="disabled-hint">
                  Для зміни професії спочатку скасуйте готовність
                </span>
              )}
            </div>

            <div className="dream-control">
              <label>Ваша мрія:</label>
              <button
                className="change-dream-btn"
                onClick={() => setShowDreamModal(true)}
                disabled={isReady}
              >
                {selectedDream
                  ? `${selectedDream.icon} ${selectedDream.title}`
                  : "🌟 Обрати мрію"}
              </button>
              {selectedDream && typeof selectedDream === 'object' && 'estimatedCost' in selectedDream && (
                <div className="dream-details">
                  <span className="dream-goal">
                    Ціль: ${Number(selectedDream.estimatedCost).toLocaleString()}
                  </span>
                </div>
              )}
              {isReady && (
                <span className="disabled-hint">
                  Для зміни мрії спочатку скасуйте готовність
                </span>
              )}
            </div>

            <div className="ready-control">
              <button
                className={`ready-btn ${isReady ? "ready" : "not-ready"}`}
                onClick={handleReadyToggle}
              >
                {isReady ? "✅ Готовий до гри" : "⏳ Позначити як готовий"}
              </button>
            </div>

            {onStartDeveloperMode && (
              <div className="developer-control">
                <h4>🧪 Режими тестування</h4>
                <button
                  className="developer-mode-btn"
                  onClick={onStartDeveloperMode}
                  title="Тестування механіки гри без підключення до сервера"
                >
                  🎮 Тестовий режим (з мрією)
                </button>
                <p className="test-hint">
                  💡 В тестовому режимі ви можете:
                  <br />• Обирати мрію або пропускати вибір
                  <br />• Тестувати ігрову механіку без інших гравців
                  <br />• Швидко перевіряти функціональність
                </p>
              </div>
            )}
          </div>

          {isHost && (
            <div className="card success-card">
              <h3>👑 Контролі хоста</h3>

              <button
                className={`start-game-btn ${allPlayersReady ? "enabled" : "disabled"}`}
                onClick={handleStartGame}
                disabled={!allPlayersReady}
              >
                {allPlayersReady ? "🚀 Розпочати гру" : "⏳ Очікування гравців"}
              </button>

              {!allPlayersReady && (
                <p className="start-hint">
                  Усі гравці повинні бути готові для початку гри
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Profession Selection Modal */}
      {showProfessionModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowProfessionModal(false)}
        >
          <div
            className="card modal-card profession-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>🏢 Оберіть професію</h3>
              <button
                className="close-btn"
                onClick={() => setShowProfessionModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="professions-list">
              {PROFESSIONS.map((profession) => (
                <div
                  key={profession.name}
                  className={`card profession-card card-clickable ${selectedProfession === profession.name ? "active" : ""}`}
                  onClick={(e) => {
                    console.log("🖱️ Profession card clicked:", profession.name);
                    e.preventDefault();
                    e.stopPropagation();
                    handleProfessionChange(profession.name);
                  }}
                >
                  <div className="profession-info">
                    <h4>{profession.name}</h4>
                    <div className="profession-stats">
                      <span>
                        💰 Зарплата: {formatCurrency(profession.salary)}
                      </span>
                      <span>
                        💸 Витрати: {formatCurrency(profession.expenses)}
                      </span>
                      <span>
                        💵 Залишок:{" "}
                        {formatCurrency(
                          profession.salary - profession.expenses,
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Dream Selection Modal */}
      {showDreamModal && (
        <DreamSelectionLobby
          selectedDream={selectedDream}
          onDreamSelected={handleDreamSelected}
          onSkip={handleDreamSkipped}
          isVisible={showDreamModal}
        />
      )}
    </div>
  );
};

export { GameLobby };
export default GameLobby;
