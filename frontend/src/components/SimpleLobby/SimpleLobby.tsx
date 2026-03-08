import React, { useState } from "react";
import { ValidatedInput } from "../ValidatedInput/ValidatedInput";
import { ValidationRules } from "../../utils/validation";
import config from "../../config/api";
import "./SimpleLobby.css";

interface SimpleLobbyProps {
  onGameJoined: (gameId: string, playerId: string) => void;
}

const SimpleLobby: React.FC<SimpleLobbyProps> = ({ onGameJoined }) => {
  const [playerName, setPlayerName] = useState("");
  const [gameId, setGameId] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(
    "Перевірка з'єднання...",
  );

  // Перевірка з'єднання з сервером
  React.useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch(config.endpoints.health);
        if (response.ok) {
          setConnectionStatus("Підключено");
        } else {
          setConnectionStatus("Сервер недоступний");
        }
      } catch (error) {
        setConnectionStatus("Сервер недоступний");
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  const createGame = async () => {
    if (!playerName.trim() || isCreating) return;

    setIsCreating(true);
    try {
      const response = await fetch(config.endpoints.createGame, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostId: `player-${Date.now()}` }),
      });

      const data = await response.json();
      if (data.success) {
        onGameJoined(data.game.id, data.game.hostId);
      }
    } catch (error) {
      console.error("Error creating game:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const joinGame = async () => {
    if (!playerName.trim() || !gameId.trim() || isJoining) return;

    setIsJoining(true);
    try {
      const response = await fetch(config.endpoints.joinGame(gameId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: `player-${Date.now()}`,
          playerName: playerName.trim(),
        }),
      });

      const data = await response.json();
      if (data.success) {
        onGameJoined(gameId, data.playerId);
      }
    } catch (error) {
      console.error("Error joining game:", error);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="simple-lobby">
      <div className="lobby-header">
        <h1 className="game-title">🎮 Cash Flow Ukraine</h1>
        <p className="game-subtitle">Навчайте фінансовій свободі через гру</p>
        <div
          className={`connection-status ${connectionStatus === "Підключено" ? "connected" : "disconnected"}`}
        >
          <span className="status-dot"></span>
          {connectionStatus}
        </div>
      </div>

      <div className="lobby-content">
        <div className="player-input">
          <ValidatedInput
            id="playerName"
            type="text"
            placeholder="Введіть ваше ім'я..."
            value={playerName}
            onChange={setPlayerName}
            validationRules={ValidationRules.playerName}
            label="Ваше ім'я"
            maxLength={20}
          />
        </div>

        <div className="game-actions">
          <div className="action-card">
            <h3>🎯 Створити гру</h3>
            <p>Станьте хостом та запрошуйте гравців</p>
            <button
              onClick={createGame}
              disabled={
                !playerName.trim() ||
                connectionStatus !== "Підключено" ||
                isCreating
              }
              className="btn btn-primary"
            >
              {isCreating ? "Створення..." : "Створити гру"}
            </button>
          </div>

          <div className="action-card">
            <h3>🔗 Приєднатися</h3>
            <p>Введіть ID існуючої гри</p>
            <ValidatedInput
              id="gameId"
              type="text"
              placeholder="ID гри..."
              value={gameId}
              onChange={setGameId}
              label="ID гри"
            />
            <button
              onClick={joinGame}
              disabled={
                !playerName.trim() ||
                !gameId.trim() ||
                connectionStatus !== "Підключено" ||
                isJoining
              }
              className="btn btn-secondary"
            >
              {isJoining ? "Приєднання..." : "Приєднатися"}
            </button>
          </div>
        </div>
      </div>

      <div className="game-rules">
        <h3>📋 Правила гри</h3>
        <div className="rules-content">
          <div className="rule">
            <strong>🎯 Мета:</strong> Досягти фінансової свободи (пасивний дохід
            ≥ витрати)
          </div>
          <div className="rule">
            <strong>🎲 Як грати:</strong> Кидайте кубик, рухайтесь, інвестуйте в
            активи
          </div>
          <div className="rule">
            <strong>💰 Шлях до перемоги:</strong> Купуйте нерухомість, бізнес,
            акції
          </div>
          <div className="rule">
            <strong>🏆 Перемога:</strong> Перейдіть на Fast Track та купіть свою
            мрію
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleLobby;
