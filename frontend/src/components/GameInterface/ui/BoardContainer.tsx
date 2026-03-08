// BoardContainer.tsx

import React from 'react';
import GameBoard from '../../GameBoard/GameBoard';
import DiceRoller from '../../DiceRoller/DiceRoller';
import useGameStore from '../../../store/gameStore';
import './BoardContainer.css';

interface BoardContainerProps {
  playerMovement: any;
  onCellClick: (cellIndex: number) => void;
  onExecuteTurn: () => void;
}

const BoardContainer: React.FC<BoardContainerProps> = ({ playerMovement, onCellClick, onExecuteTurn }) => {
  const { game, currentPlayer, playerId } = useGameStore();
  
  // Перевіряємо чи зараз хід гравця
  const isMyTurn = game && currentPlayer && playerId && game.currentPlayer === playerId;

  const handleDiceRoll = (result: number) => {
    console.log('🎲 Кубик кинутий в BoardContainer:', result);
    // TODO: реалізувати рух гравця
  };

  return (
    <div className="board-container">
      {/* Кубик для кидка */}
      {game && currentPlayer && isMyTurn && (
        <div className="dice-section">
          <DiceRoller 
            onRollComplete={handleDiceRoll}
            disabled={false}
          />
        </div>
      )}
      
      {/* Ігрова дошка */}
      <GameBoard
        playerMovement={playerMovement}
        onCellClick={onCellClick}
        onExecuteTurn={onExecuteTurn}
      />
    </div>
  );
};

export default BoardContainer;
