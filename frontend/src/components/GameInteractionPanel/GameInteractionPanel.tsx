import React from 'react';
import type { Player } from '../../types/game';
import FinancialStatement from '../FinancialStatement/FinancialStatement';
import './GameInteractionPanel.css';

interface GameInteractionPanelProps {
  currentPlayer: Player;
  gameId: string;
  isMyTurn: boolean;
  canMoveToFastTrack: boolean;
  diceAnimation: any;
  onExecuteTurn: () => void;
  onMoveToFastTrack: () => void;
  onDiceRollComplete: (result: number) => void;
  onBackToLobby?: () => void;
}

export const GameInteractionPanel: React.FC<GameInteractionPanelProps> = ({
  currentPlayer,
  isMyTurn,
  canMoveToFastTrack,
  diceAnimation,
  onExecuteTurn,
  onMoveToFastTrack,
  onDiceRollComplete,
  onBackToLobby
}) => {
  const handleTurnAction = () => {
    // Об'єднана логіка: кубик + хід
    const diceResult = Math.floor(Math.random() * 6) + 1;
    onDiceRollComplete(diceResult);
    onExecuteTurn();
  };

  return (
    <div className="game-interaction-panel">
      
      {/* Ігрові дії */}
      <div className="interaction-section primary">
        <h4 className="section-title">
          {isMyTurn ? '🎯 Ваші дії' : '⏳ Очікування ходу'}
        </h4>
        
        {isMyTurn ? (
          <div className="turn-controls">
            <div className="primary-actions">
              {/* Головна дія: кубик + хід */}
              <button
                className="action-btn primary large"
                onClick={handleTurnAction}
                disabled={diceAnimation.isRolling}
              >
                <span>🎲</span>
                <span>Кинути кубик та зробити хід</span>
              </button>
              
              {canMoveToFastTrack && !currentPlayer?.isOnFastTrack && (
                <button
                  className="action-btn special large"
                  onClick={onMoveToFastTrack}
                >
                  🚀 Перейти на швидку доріжку
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="waiting-turn">
            <div className="waiting-message">
              <span className="waiting-icon">⏳</span>
              <span>Зачекайте свого ходу</span>
            </div>
            <div className="turn-info">
              Зараз ходить інший гравець
            </div>
          </div>
        )}
      </div>

      {/* Фінансовий звіт */}
      <div className="interaction-section">
        <FinancialStatement compact={true} showAdvice={true} />
      </div>



      {/* Вихід */}
      <div className="interaction-section">
        {onBackToLobby && (
          <button className="exit-btn" onClick={onBackToLobby}>
            ↩️ Повернутися до лобі
          </button>
        )}
      </div>
    </div>
  );
};

export default GameInteractionPanel;