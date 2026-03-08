import React from 'react';
import type { Game, Player } from '../../types/game';
import { formatMoney } from '../../utils/formatters';
import './GameInfoPanel.css';

interface GameInfoPanelProps {
  game: Game;
  currentPlayer: Player;
  isCompact?: boolean;
}

export const GameInfoPanel: React.FC<GameInfoPanelProps> = ({
  game,
  currentPlayer,
  isCompact = false
}) => {
  // Розрахунок статистики гри
  const totalPlayers = game.players.length;
  const activePlayers = game.players.filter(p => p.isConnected).length;
  const fastTrackPlayers = game.players.filter(p => p.isOnFastTrack).length;
  const currentPlayerObj = game.players.find(p => p.id === game.currentPlayer);
  
  // Фінансові показники поточного гравця
  const passiveIncome = currentPlayer.finances?.passiveIncome || 0;
  const expenses = currentPlayer.finances?.expenses || 0;
  const cashFlow = passiveIncome - expenses;
  const cash = currentPlayer.finances?.cash || 0;
  
  // Прогрес до швидкої доріжки (коли пасивний дохід покриє витрати)
  const fastTrackProgress = expenses > 0 ? Math.min(100, (passiveIncome / expenses) * 100) : 0;
  
  // Прогрес до мрії (якщо є)
  const dream = (currentPlayer as any).dream;
  const dreamProgress = dream && dream.estimatedCost > 0 
    ? Math.min(100, (cash / dream.estimatedCost) * 100) 
    : 0;

  return (
    <div className={`game-info-panel ${isCompact ? 'compact' : ''}`}>
      
      {/* Статус гри */}
      <div className="info-section">
        <h4 className="section-title">🎯 Статус гри</h4>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Хід</span>
            <span className="info-value">#{game.turn}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Поточний гравець</span>
            <span className="info-value current-turn">
              {currentPlayerObj?.name || 'N/A'}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Фаза гри</span>
            <span className="info-value">
              {currentPlayer.isOnFastTrack ? '🚀 Швидка доріжка' : '🐌 Крисяча гонка'}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Онлайн</span>
            <span className="info-value">{activePlayers}/{totalPlayers}</span>
          </div>
        </div>
      </div>

      {/* Фінансові метрики */}
      <div className="info-section">
        <h4 className="section-title">💰 Ваші метрики</h4>
        <div className="financial-metrics">
          <div className="metric-row">
            <span className="metric-label">Cash Flow</span>
            <span className={`metric-value ${cashFlow >= 0 ? 'positive' : 'negative'}`}>
              {formatMoney(cashFlow)}
            </span>
          </div>
          <div className="metric-row">
            <span className="metric-label">Готівка</span>
            <span className="metric-value">{formatMoney(cash)}</span>
          </div>
          <div className="metric-row">
            <span className="metric-label">Пасивний дохід</span>
            <span className="metric-value positive">{formatMoney(passiveIncome)}</span>
          </div>
          <div className="metric-row">
            <span className="metric-label">Витрати</span>
            <span className="metric-value negative">{formatMoney(expenses)}</span>
          </div>
        </div>
      </div>

      {/* Прогрес до швидкої доріжки */}
      {!currentPlayer.isOnFastTrack && (
        <div className="info-section">
          <h4 className="section-title">🚀 Прогрес до швидкої доріжки</h4>
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ 
                  width: `${fastTrackProgress}%`,
                  backgroundColor: fastTrackProgress >= 100 ? '#10b981' : '#3b82f6'
                }}
              ></div>
            </div>
            <div className="progress-text">
              {fastTrackProgress >= 100 
                ? '✅ Готово до переходу!' 
                : `${fastTrackProgress.toFixed(0)}% - потрібно ${formatMoney(expenses - passiveIncome)}`
              }
            </div>
          </div>
        </div>
      )}

      {/* Прогрес до мрії */}
      {dream && (
        <div className="info-section">
          <h4 className="section-title">🌟 Прогрес до мрії</h4>
          <div className="dream-progress">
            <div className="dream-title">{dream.title}</div>
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill dream-progress-fill"
                  style={{ width: `${dreamProgress}%` }}
                ></div>
              </div>
              <div className="progress-text">
                {dreamProgress >= 100 
                  ? '🎉 Мрія досягнута!' 
                  : `${dreamProgress.toFixed(1)}% - ще ${formatMoney(dream.estimatedCost - cash)}`
                }
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Статистика гравців */}
      <div className="info-section">
        <h4 className="section-title">👥 Гравці в грі</h4>
        <div className="players-stats">
          <div className="stat-item">
            <span className="stat-icon">🐌</span>
            <span className="stat-text">Крисяча гонка: {totalPlayers - fastTrackPlayers}</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">🚀</span>
            <span className="stat-text">Швидка доріжка: {fastTrackPlayers}</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">🟢</span>
            <span className="stat-text">Онлайн: {activePlayers}</span>
          </div>
        </div>
      </div>

      {/* Поради стратегії */}
      <div className="info-section">
        <h4 className="section-title">💡 Стратегічні поради</h4>
        <div className="strategy-tips">
          {cashFlow <= 0 && (
            <div className="tip warning">
              ⚠️ Негативний cash flow - купуйте активи, що генерують дохід!
            </div>
          )}
          {cash < 1000 && (
            <div className="tip info">
              💰 Мало готівки - розгляньте продаж активів або взяття позики.
            </div>
          )}
          {cashFlow > 0 && cash > 5000 && (
            <div className="tip success">
              🎉 Відмінні фінанси - час для великих інвестицій!
            </div>
          )}
          {fastTrackProgress >= 100 && !currentPlayer.isOnFastTrack && (
            <div className="tip special">
              🚀 Ви готові до швидкої доріжки - переходьте зараз!
            </div>
          )}
          {dreamProgress >= 50 && (
            <div className="tip dream">
              🌟 Ви на половині шляху до мрії - тримайте темп!
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default GameInfoPanel;
