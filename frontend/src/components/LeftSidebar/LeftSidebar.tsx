import React from 'react';
import GameInteractionPanel from '../GameInteractionPanel/GameInteractionPanel';
import type { Player } from '../../types/game';
import { useTouchGestures, useIsMobile } from '../../hooks/useTouchGestures';

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
  onToggle?: () => void;
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
  onBackToLobby,
  onToggle
}) => {
  const isMobile = useIsMobile();

  // Swipe gesture to close
  useTouchGestures({
    onSwipeLeft: () => {
      if (open && onToggle) onToggle();
    }
  });

  return (
    <div className={`left-sidebar sidebar-animated${open ? ' open' : ''}`}>
      {isMobile && open && (
        <button className="sidebar-close-btn" onClick={onToggle}>✕</button>
      )}
      <div className="left-sidebar-header">
        <span className="left-sidebar-title">📊 Мої фінанси</span>
      </div>
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
};

export default LeftSidebar;
