// BoardContainer.tsx

import React from 'react';
import GameBoard from '../../GameBoard/GameBoard';
import './BoardContainer.css';

interface BoardContainerProps {
  playerMovement: any;
  onCellClick: (cellIndex: number) => void;
  onExecuteTurn: () => void;
  onDiceRollComplete?: (result: number) => void;
}

const BoardContainer: React.FC<BoardContainerProps> = ({ 
  playerMovement, 
  onCellClick, 
  onExecuteTurn,
  onDiceRollComplete 
}) => {
  
  return (
    <div className="board-container">
      {/* Ігрова дошка */}
      <GameBoard
        playerMovement={playerMovement}
        onCellClick={onCellClick}
        onExecuteTurn={onExecuteTurn}
        onDiceRollComplete={onDiceRollComplete}
      />
    </div>
  );
};

export default BoardContainer;
