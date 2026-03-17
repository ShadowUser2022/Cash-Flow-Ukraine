import React from 'react';
import GameInfoPanel from '../GameInfoPanel/GameInfoPanel';
import DealsPanel from '../DealsPanel/DealsPanel';
import type { Game, Player } from '../../types/game';
import { useTouchGestures, useIsMobile } from '../../hooks/useTouchGestures';

interface RightSidebarProps {
  open: boolean;
  game: Game;
  currentPlayer: Player;
  playerId: string;
  onToggle?: () => void;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ open, game, currentPlayer, playerId, onToggle }) => {
  const isMobile = useIsMobile();

  // Swipe gesture to close
  useTouchGestures({
    onSwipeRight: () => {
      if (open && onToggle) onToggle();
    }
  });

  return (
    <div className={`right-sidebar sidebar-animated${open ? ' open' : ''}`}>
      {isMobile && open && (
        <button className="sidebar-close-btn" onClick={onToggle}>✕</button>
      )}
      <GameInfoPanel game={game} currentPlayer={currentPlayer} />
      <DealsPanel playerId={playerId} />
    </div>
  );
};

export default RightSidebar;
