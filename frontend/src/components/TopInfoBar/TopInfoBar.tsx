import React from 'react';
import useGameStore from '../../store/gameStore';
import './TopInfoBar.css';

// TopInfoBar — загальна ігрова шапка для ВСІХ гравців.
// Показує: хід, чий черга, прогрес кожного до свободи.
// НЕ дублює фінансовий звіт (він у лівому sidebar).

interface TopInfoBarProps {
  playerId: string;
}

const TopInfoBar: React.FC<TopInfoBarProps> = ({ playerId }) => {
  const { game } = useGameStore();
  if (!game) return null;

  const players = game.players || [];
  const currentTurnId = game.currentPlayer;
  const turn = game.turn ?? 0;
  const fmt = (n: number) => `$${(n || 0).toLocaleString('en-US')}`;

  return (
    <div className="top-info-bar">
      {/* Статус гри */}
      <div className="tib-status">
        <span className="tib-title">CASHFLOW</span>
        <span className="tib-turn">Хід #{turn}</span>
      </div>

      {/* Карточки гравців */}
      <div className="tib-players">
        {players.map(player => {
          const isActive = player.id === currentTurnId;
          const isMe = player.id === playerId;
          const passive = player.finances?.passiveIncome || 0;
          const expenses = player.finances?.expenses || 0;
          const pct = expenses > 0 ? Math.min(100, Math.round((passive / expenses) * 100)) : 0;
          const cf = passive - expenses;
          const ft = player.isOnFastTrack;

          return (
            <div key={player.id} className={`tib-player${isActive ? ' active' : ''}${isMe ? ' me' : ''}${ft ? ' ft' : ''}`}>
              {isActive && <span className="tib-turn-icon">🎲</span>}
              <div className="tib-pname">
                {ft ? '🚀' : '🐌'} {player.name}
                {isMe && <span className="tib-badge">Ви</span>}
              </div>
              <div className="tib-nums">
                <span className="tib-cash">{fmt(player.finances?.cash || 0)}</span>
                <span className={`tib-cf ${cf >= 0 ? 'pos' : 'neg'}`}>
                  {cf >= 0 ? '+' : ''}{fmt(cf)}/міс
                </span>
              </div>
              {!ft ? (
                <div className="tib-bar">
                  <div className="tib-fill" style={{ width: `${pct}%` }} />
                  <span className="tib-pct">{pct}%</span>
                </div>
              ) : (
                <div className="tib-ft">✅ Свобода!</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopInfoBar;
