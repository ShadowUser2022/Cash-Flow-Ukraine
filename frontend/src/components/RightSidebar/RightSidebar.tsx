import React from 'react';
import GameInfoPanel from '../GameInfoPanel/GameInfoPanel';
import DealsPanel from '../DealsPanel/DealsPanel';
import type { Game, Player } from '../../types/game';

interface RightSidebarProps {
  open: boolean;
  game: Game;
  currentPlayer: Player;
  playerId: string;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ open, game, currentPlayer, playerId }) => (
  <div className={`right-sidebar sidebar-animated${open ? ' open' : ''}`}>
    <GameInfoPanel game={game} currentPlayer={currentPlayer} />
    <DealsPanel playerId={playerId} />
  </div>
);

export default RightSidebar;
