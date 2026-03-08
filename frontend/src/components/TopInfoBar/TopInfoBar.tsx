import React from 'react';
import './TopInfoBar.css';

interface Dream {
  name: string;
  amount: number;
}

interface TopInfoBarProps {
  playerName: string;
  avatarUrl?: string;
  profession: string;
  cash: number;
  passiveIncome: number;
  expenses: number;
  assetsCount: number;
  liabilitiesTotal: number;
  dream: Dream;
}

const TopInfoBar: React.FC<TopInfoBarProps> = ({
  playerName,
  avatarUrl,
  profession,
  cash,
  passiveIncome,
  expenses,
  assetsCount,
  liabilitiesTotal,
  dream,
}) => {
  const progress = Math.min(100, Math.round((passiveIncome / (expenses || 1)) * 100));
  return (
    <div className="top-info-bar">
      <div className="player-info">
        {avatarUrl && <img src={avatarUrl} alt="avatar" className="avatar" />}
        <span className="player-name">{playerName}</span>
        <span className="profession">({profession})</span>
      </div>
      <div className="metrics">
        <span title="Готівка">💵 {cash.toLocaleString()}₴</span>
        <span title="Пасивний дохід">📈 {passiveIncome.toLocaleString()}₴/міс</span>
        <span title="Витрати">📉 {expenses.toLocaleString()}₴/міс</span>
        <span title="Активи">🏠 {assetsCount}</span>
        <span title="Пасиви">💳 {liabilitiesTotal.toLocaleString()}₴</span>
        <span title="Мрія">🌟 {dream.name} ({dream.amount.toLocaleString()}₴)</span>
      </div>
      <div className="progress">
        <progress value={passiveIncome} max={expenses || 1} />
        <span className="progress-label">{progress}% до свободи</span>
      </div>
    </div>
  );
};

export default TopInfoBar;
