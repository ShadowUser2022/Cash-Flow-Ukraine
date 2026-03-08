import React from 'react';
import useGameStore from '../../store/gameStore';
import type { Player, Profession } from '../../types';
import { Tooltip } from '../Tooltip';
import './PlayerPanel.css';

interface PlayerPanelProps {
  onPlayerSelect?: (playerId: string) => void;
}

const PlayerPanel: React.FC<PlayerPanelProps> = ({ onPlayerSelect }) => {
  const {
    game,
    playerId,
    selectedPlayer,
    setSelectedPlayer
  } = useGameStore();

  const handlePlayerClick = (player: Player) => {
    setSelectedPlayer(player.id === selectedPlayer ? null : player.id);
    if (onPlayerSelect) {
      onPlayerSelect(player.id);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getProfessionIcon = (profession: Profession): string => {
    const professionName = profession.name.toLowerCase();
    switch (professionName) {
      case 'інженер':
        return '⚙️';
      case 'вчитель':
        return '📚';
      case 'медсестра':
        return '🏥';
      case 'поліцейський':
        return '👮';
      case 'лікар':
        return '👩‍⚕️';
      case 'юрист':
        return '⚖️';
      default:
        return '💼';
    }
  };

  const calculateCashFlow = (player: Player): number => {
    return player.finances.passiveIncome - player.finances.expenses;
  };

  const calculateFastTrackProgress = (player: Player): { progress: number; canMove: boolean } => {
    const passiveIncome = player.finances.passiveIncome || 0;
    const totalExpenses = player.finances.expenses || 0;
    
    if (totalExpenses === 0) {
      return { progress: 100, canMove: passiveIncome > 0 };
    }
    
    const progress = Math.min(100, (passiveIncome / totalExpenses) * 100);
    const canMove = passiveIncome >= totalExpenses;
    
    return { progress, canMove };
  };

  // Мок-дані для демонстрації історії транзакцій
  const getRecentTransactions = (player: Player) => {
    const transactions = [
      {
        id: '1',
        type: 'income' as const,
        amount: player.finances.salary,
        description: 'Зарплата',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      {
        id: '2', 
        type: 'expense' as const,
        amount: -player.finances.expenses,
        description: 'Щомісячні витрати',
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
      }
    ];

    // Додаємо транзакції з активів
    if (player.finances.assets && player.finances.assets.length > 0) {
      player.finances.assets.forEach((asset, index) => {
        if (asset.cashFlow > 0) {
          transactions.push({
            id: `asset-${index}`,
            type: 'income' as const,
            amount: asset.cashFlow,
            description: `Дохід від ${asset.name}`,
            timestamp: new Date(Date.now() - (index + 1) * 12 * 60 * 60 * 1000),
          });
        }
      });
    }

    return transactions.slice(0, 5).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };

  const formatTransactionType = (type: string) => {
    switch (type) {
      case 'income': return '💰';
      case 'expense': return '💸';
      case 'asset_purchase': return '🏠';
      case 'investment': return '📈';
      default: return '💳';
    }
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Щойно';
    if (diffHours < 24) return `${diffHours}г тому`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Вчора';
    if (diffDays < 7) return `${diffDays}д тому`;
    return date.toLocaleDateString('uk-UA');
  };

  const getPlayerStatus = (player: Player): string => {
    const cashFlow = calculateCashFlow(player);
    if (cashFlow > 0) {
      return 'Позитивний потік';
    } else if (cashFlow === 0) {
      return 'Нульовий потік';
    } else {
      return 'Негативний потік';
    }
  };

  const renderPlayerCard = (player: Player) => {
    const isCurrentPlayer = game?.currentPlayer === player.id;
    const isMyPlayer = player.id === playerId;
    const isSelected = player.id === selectedPlayer;
    const cashFlow = calculateCashFlow(player);
    const fastTrackData = calculateFastTrackProgress(player);
    
    // Generate a color based on player ID for consistency
    const playerColor = `hsl(${(player.id.charCodeAt(0) * 137.5) % 360}, 70%, 50%)`;

    return (
      <div
        key={player.id}
        className={`card player-card ${isCurrentPlayer ? 'active' : ''} ${isMyPlayer ? 'glow' : ''} ${isSelected ? 'pulse' : ''} card-clickable`}
        onClick={() => handlePlayerClick(player)}
        style={{ borderColor: playerColor }}
      >
        <div className="player-header">
          <div className="player-avatar" style={{ backgroundColor: playerColor }}>
            <span className="profession-icon">
              {getProfessionIcon(player.profession)}
            </span>
            <span className="player-initial">
              {player.name.charAt(0).toUpperCase()}
            </span>
          </div>
          
          <div className="player-info">
            <h3 className="player-name">
              {player.name}
              {isMyPlayer && <span className="you-badge">Ви</span>}
            </h3>
            <p className="player-profession">
              {player.profession.name}
            </p>
            {isCurrentPlayer && (
              <div className="current-turn-indicator">
                🎯 Зараз ходить
              </div>
            )}
          </div>
        </div>

        <div className="player-stats">
          <div className="stat-row">
            <Tooltip content="Поточна кількість готівки на руках. Використовується для покупок та інвестицій.">
              <div className="stat">
                <span className="stat-label">Готівка</span>
                <span className="stat-value cash">
                  {formatCurrency(player.finances.cash)}
                </span>
              </div>
            </Tooltip>
            <Tooltip content="Різниця між пасивним доходом та витратами. Позитивний потік означає фінансову стабільність.">
              <div className="stat">
                <span className="stat-label">Грошовий потік</span>
                <span className={`stat-value cash-flow ${cashFlow >= 0 ? 'positive' : 'negative'}`}>
                  {formatCurrency(cashFlow)}
                </span>
              </div>
            </Tooltip>
          </div>

          <div className="stat-row">
            <Tooltip content="Регулярний дохід від роботи. Отримується щомісяця автоматично.">
              <div className="stat">
                <span className="stat-label">Зарплата</span>
                <span className="stat-value income">
                  {formatCurrency(player.finances.salary)}
                </span>
              </div>
            </Tooltip>
            <Tooltip content="Обов'язкові щомісячні витрати (житло, їжа, кредити тощо).">
              <div className="stat">
                <span className="stat-label">Витрати</span>
                <span className="stat-value expenses">
                  {formatCurrency(player.finances.expenses)}
                </span>
              </div>
            </Tooltip>
          </div>

          <div className="player-status">
            <span className={`status-badge ${cashFlow >= 0 ? 'positive' : 'negative'}`}>
              {getPlayerStatus(player)}
            </span>
          </div>

          {/* Fast Track Progress Bar */}
          <Tooltip content="Прогрес до Швидкої доріжки. Коли пасивний дохід покриє всі витрати, ви зможете перейти до фінального раунду де ціль - досягти вашої мрії!">
            <div className="fast-track-progress">
              <div className="fast-track-header">
                <span className="fast-track-title">
                  {fastTrackData.canMove ? '🟢' : '🔴'} Швидка доріжка
                </span>
                <span className="fast-track-percentage">
                  {Math.round(fastTrackData.progress)}%
                </span>
              </div>
              <div className="progress-bar-container">
                <div 
                  className="progress-bar-fill"
                  style={{ width: `${fastTrackData.progress}%` }}
                />
              </div>
              <div className={`progress-indicator ${fastTrackData.canMove ? 'complete' : 'incomplete'}`}>
                {fastTrackData.canMove 
                  ? 'Готовий до переходу!' 
                  : `${formatCurrency(player.finances.expenses - player.finances.passiveIncome)} до цілі`
                }
              </div>
            </div>
          </Tooltip>
        </div>

        {isSelected && (
          <div className="player-details">
            <div className="details-section">
              <h4>Доходи</h4>
              <div className="detail-item">
                <span>Зарплата:</span>
                <span>{formatCurrency(player.finances.salary)}</span>
              </div>
              <div className="detail-item">
                <span>Пасивний дохід:</span>
                <span>{formatCurrency(player.finances.passiveIncome)}</span>
              </div>
            </div>

            <div className="details-section">
              <h4>Витрати</h4>
              <div className="detail-item">
                <span>Загальні витрати:</span>
                <span>{formatCurrency(player.finances.expenses)}</span>
              </div>
            </div>

            {player.finances.assets && player.finances.assets.length > 0 && (
              <div className="details-section">
                <h4>Активи</h4>
                {player.finances.assets.map((asset, index) => (
                  <div key={index} className="detail-item">
                    <span>{asset.name}:</span>
                    <span>{formatCurrency(asset.cashFlow)}/міс</span>
                  </div>
                ))}
              </div>
            )}

            {player.finances.liabilities && player.finances.liabilities.length > 0 && (
              <div className="details-section">
                <h4>Зобов'язання</h4>
                {player.finances.liabilities.map((liability, index) => (
                  <div key={index} className="detail-item">
                    <span>{liability.name}:</span>
                    <span>{formatCurrency(liability.monthlyPayment)}/міс</span>
                  </div>
                ))}
              </div>
            )}

            {/* Історія транзакцій */}
            <div className="details-section">
              <h4>Останні транзакції</h4>
              <div className="transaction-history">
                {getRecentTransactions(player).map((transaction) => (
                  <div key={transaction.id} className="transaction-item">
                    <div className="transaction-icon">
                      {formatTransactionType(transaction.type)}
                    </div>
                    <div className="transaction-details">
                      <div className="transaction-description">
                        {transaction.description}
                      </div>
                      <div className="transaction-time">
                        {formatRelativeTime(transaction.timestamp)}
                      </div>
                    </div>
                    <div className={`transaction-amount ${transaction.amount >= 0 ? 'positive' : 'negative'}`}>
                      {transaction.amount >= 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!game) {
    return (
      <div className="player-panel">
        <div className="card stats-card">
          <h2>Гравці</h2>
        </div>
        <div className="card warning-card">
          <p>Очікування гри...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="player-panel">
      <div className="card stats-card">
        <h2>Гравці ({game.players.length}/6)</h2>
        <div className="game-round">
          Хід {game.turn}
        </div>
      </div>
      
      <div className="players-list">
        {game.players.map(renderPlayerCard)}
      </div>
    </div>
  );
};

export default PlayerPanel;
