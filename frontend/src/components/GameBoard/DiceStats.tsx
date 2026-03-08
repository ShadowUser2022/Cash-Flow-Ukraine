// DiceStats.tsx
// Компонент для відстеження статистики кубика

import React, { useState, useEffect } from 'react';
import './DiceStats.css';

interface DiceStatsProps {
  onRoll: (result: number) => void;
}

const DiceStats: React.FC<DiceStatsProps> = ({ onRoll }) => {
  const [stats, setStats] = useState<number[]>([]);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    const handleRoll = (e: any) => {
      const result = e.detail;
      setStats(prev => [...prev, result]);
      onRoll(result);
    };

    // Підписуємось на кастомну подію
    window.addEventListener('diceRolled', handleRoll);
    
    return () => {
      window.removeEventListener('diceRolled', handleRoll);
    };
  }, [onRoll]);

  const getStatsData = () => {
    const counts = [0, 0, 0, 0, 0, 0, 0]; // індекси 1-6
    stats.forEach(result => {
      if (result >= 1 && result <= 6) {
        counts[result]++;
      }
    });

    const total = stats.length;
    return {
      total,
      distribution: counts.slice(1).map((count, index) => ({
        value: index + 1,
        count,
        percentage: total > 0 ? ((count / total) * 100).toFixed(1) : '0.0'
      })),
      average: total > 0 ? (stats.reduce((sum, val) => sum + val, 0) / total).toFixed(2) : '0.00'
    };
  };

  const statsData = getStatsData();

  const resetStats = () => {
    setStats([]);
  };

  if (!showStats) {
    return (
      <button 
        className="dice-stats-toggle"
        onClick={() => setShowStats(true)}
      >
        📊 Статистика кубика
      </button>
    );
  }

  return (
    <div className="dice-stats">
      <div className="dice-stats-header">
        <h3>📊 Статистика кубика</h3>
        <button onClick={() => setShowStats(false)}>×</button>
      </div>
      
      <div className="dice-stats-content">
        <div className="stats-summary">
          <div className="stat-item">
            <span className="stat-label">Всього кидків:</span>
            <span className="stat-value">{statsData.total}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Середнє:</span>
            <span className="stat-value">{statsData.average}</span>
          </div>
        </div>

        {statsData.total > 0 && (
          <div className="stats-distribution">
            <h4>Розподіл:</h4>
            {statsData.distribution.map(stat => (
              <div key={stat.value} className="stat-bar">
                <div className="stat-bar-label">
                  <span className="dice-face">{'⚀⚁⚂⚃⚄⚅'[stat.value - 1]}</span>
                  <span className="stat-count">{stat.count}</span>
                </div>
                <div className="stat-bar-track">
                  <div 
                    className="stat-bar-fill" 
                    style={{ width: `${stat.percentage}%` }}
                  />
                </div>
                <span className="stat-percentage">{stat.percentage}%</span>
              </div>
            ))}
          </div>
        )}

        <button className="reset-stats-btn" onClick={resetStats}>
          🔄 Скинути статистику
        </button>
      </div>
    </div>
  );
};

export default DiceStats;
