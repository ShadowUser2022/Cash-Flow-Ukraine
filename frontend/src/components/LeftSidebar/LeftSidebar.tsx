import React from 'react';
import GameInteractionPanel from '../GameInteractionPanel/GameInteractionPanel';
import type { Player } from '../../types/game';

interface LeftSidebarProps {
  open: boolean;
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

const LeftSidebar: React.FC<LeftSidebarProps> = ({
  open,
  currentPlayer,
  gameId,
  isMyTurn,
  canMoveToFastTrack,
  diceAnimation,
  onExecuteTurn,
  onMoveToFastTrack,
  onDiceRollComplete,
  onBackToLobby
}) => (
  <div className={`left-sidebar sidebar-animated${open ? ' open' : ''}`}>
    <GameInteractionPanel
      currentPlayer={currentPlayer}
      gameId={gameId}
      isMyTurn={isMyTurn}
      canMoveToFastTrack={canMoveToFastTrack}
      diceAnimation={diceAnimation}
      onExecuteTurn={onExecuteTurn}
      onMoveToFastTrack={onMoveToFastTrack}
      onDiceRollComplete={onDiceRollComplete}
      onBackToLobby={onBackToLobby}
    />
  </div>
);

export default LeftSidebar;
