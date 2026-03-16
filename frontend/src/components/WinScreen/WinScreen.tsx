import React, { useEffect, useState } from 'react';
import './WinScreen.css';

interface WinScreenProps {
  winnerName: string;
  dreamTitle: string;
  dreamCost: number;
  finalCash: number;
  onPlayAgain?: () => void;
  onBackToLobby?: () => void;
}

const WinScreen: React.FC<WinScreenProps> = ({
  winnerName,
  dreamTitle,
  dreamCost,
  finalCash,
  onPlayAgain,
  onBackToLobby
}) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Невелика затримка для ефекту появи
    const t = setTimeout(() => setShowConfetti(true), 200);
    return () => clearTimeout(t);
  }, []);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n);

  const profit = finalCash - dreamCost;

  return (
    <div className="win-screen-overlay">
      <div className={`win-screen-modal ${showConfetti ? 'visible' : ''}`}>
        {/* Конфеті */}
        {showConfetti && (
          <div className="confetti-container" aria-hidden="true">
            {Array.from({ length: 30 }).map((_, i) => (
              <span key={i} className={`confetti-piece confetti-${i % 6}`} style={{ '--i': i } as React.CSSProperties} />
            ))}
          </div>
        )}

        {/* Заголовок */}
        <div className="win-trophy">🏆</div>
        <h1 className="win-title">ПЕРЕМОГА!</h1>
        <p className="win-subtitle">Фінансова свобода досягнута!</p>

        {/* Ім'я переможця */}
        <div className="win-winner-name">{winnerName}</div>

        {/* Мрія */}
        <div className="win-dream-card">
          <div className="win-dream-icon">🌟</div>
          <div className="win-dream-text">
            <div className="win-dream-label">Мрія досягнута</div>
            <div className="win-dream-title">{dreamTitle}</div>
          </div>
        </div>

        {/* Фінансова статистика */}
        <div className="win-stats">
          <div className="win-stat-row">
            <span className="win-stat-label">💰 Готівка:</span>
            <span className="win-stat-value positive">{formatCurrency(finalCash)}</span>
          </div>
          <div className="win-stat-row">
            <span className="win-stat-label">🎯 Вартість мрії:</span>
            <span className="win-stat-value">{formatCurrency(dreamCost)}</span>
          </div>
          {profit > 0 && (
            <div className="win-stat-row highlight">
              <span className="win-stat-label">🚀 Надлишок:</span>
              <span className="win-stat-value positive">+{formatCurrency(profit)}</span>
            </div>
          )}
        </div>

        {/* Кнопки */}
        <div className="win-actions">
          {onPlayAgain && (
            <button className="win-btn primary" onClick={onPlayAgain}>
              🎲 Грати ще раз
            </button>
          )}
          {onBackToLobby && (
            <button className="win-btn secondary" onClick={onBackToLobby}>
              🏠 До лобі
            </button>
          )}
        </div>

        <p className="win-quote">
          "Багатство — це не сума грошей. Це свобода вибору." — Р. Кійосакі
        </p>
      </div>
    </div>
  );
};

export default WinScreen;
