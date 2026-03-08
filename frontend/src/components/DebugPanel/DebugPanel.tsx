import React from 'react';
import useGameStore from '../../store/gameStore';

interface DebugPanelProps {
  gameId?: string;
  playerId?: string;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ gameId, playerId }) => {
  const {
    game,
    currentPlayer,
    diceAnimation,
    connectionStatus,
    addNotification
  } = useGameStore();

  const handleTestNotification = () => {
    addNotification({
      type: 'info',
      title: 'Тестове повідомлення',
      message: 'Це тест системи повідомлень',
      duration: 3000
    });
  };

  const handleTestError = () => {
    addNotification({
      type: 'error',
      title: 'Тестова помилка',
      message: 'Це тест помилки для налагодження',
      duration: 5000
    });
  };

  const handleTestSuccess = () => {
    addNotification({
      type: 'success',
      title: 'Тестовий успіх',
      message: 'Це тест успішного повідомлення',
      duration: 3000
    });
  };

  const handleTestWarning = () => {
    addNotification({
      type: 'warning',
      title: 'Тестове попередження',
      message: 'Це тест попереджувального повідомлення',
      duration: 4000
    });
  };

  return (
    <div className="card developer-notice">
      <h3>🔧 Панель налагодження</h3>
      
      <div className="card stats-card">
        <h4>Стан системи</h4>
        <div className="debug-info">
          <div className="debug-row">
            <span>Game ID:</span>
            <span>{gameId || 'Невизначено'}</span>
          </div>
          <div className="debug-row">
            <span>Player ID:</span>
            <span>{playerId || 'Невизначено'}</span>
          </div>
          <div className="debug-row">
            <span>Connection:</span>
            <span className={connectionStatus ? 'success' : 'error'}>
              {connectionStatus ? 'Підключено' : 'Відключено'}
            </span>
          </div>
          <div className="debug-row">
            <span>Game State:</span>
            <span>{game ? 'Активна' : 'Відсутня'}</span>
          </div>
          <div className="debug-row">
            <span>Current Player:</span>
            <span>{currentPlayer?.name || 'Невизначено'}</span>
          </div>
          <div className="debug-row">
            <span>Dice Animation:</span>
            <span>{diceAnimation.isRolling ? 'Активна' : 'Неактивна'}</span>
          </div>
        </div>
      </div>

      <div className="card action-card">
        <h4>Тести повідомлень</h4>
        <div className="debug-buttons">
          <button className="debug-btn info" onClick={handleTestNotification}>
            📢 Інформація
          </button>
          <button className="debug-btn success" onClick={handleTestSuccess}>
            ✅ Успіх
          </button>
          <button className="debug-btn warning" onClick={handleTestWarning}>
            ⚠️ Попередження
          </button>
          <button className="debug-btn error" onClick={handleTestError}>
            ❌ Помилка
          </button>
        </div>
      </div>

      {game && (
        <div className="card info-card">
          <h4>Дані гри</h4>
          <pre className="debug-json">
            {JSON.stringify({
              id: game.id,
              state: game.state,
              turn: game.turn,
              currentPlayer: game.currentPlayer,
              playersCount: game.players.length
            }, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default DebugPanel;