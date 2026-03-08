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
  isChatMinimized: boolean;
  isVideoChatMinimized: boolean;
  onExecuteTurn: () => void;
  onMoveToFastTrack: () => void;
  onDiceRollComplete: (result: number) => void;
  onToggleChat: () => void;
  onToggleVideoChat: () => void;
  onBackToLobby?: () => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({
  open,
  currentPlayer,
  gameId,
  isMyTurn,
  canMoveToFastTrack,
  diceAnimation,
  isChatMinimized,
  isVideoChatMinimized,
  onExecuteTurn,
  onMoveToFastTrack,
  onDiceRollComplete,
  onToggleChat,
  onToggleVideoChat,
  onBackToLobby
}) => (
  <div className={`left-sidebar sidebar-animated${open ? ' open' : ''}`}>
    <GameInteractionPanel
      currentPlayer={currentPlayer}
      gameId={gameId}
      isMyTurn={isMyTurn}
      canMoveToFastTrack={canMoveToFastTrack}
      diceAnimation={diceAnimation}
      isChatMinimized={isChatMinimized}
      isVideoChatMinimized={isVideoChatMinimized}
      onExecuteTurn={onExecuteTurn}
      onMoveToFastTrack={onMoveToFastTrack}
      onDiceRollComplete={onDiceRollComplete}
      onToggleChat={onToggleChat}
      onToggleVideoChat={onToggleVideoChat}
      onBackToLobby={onBackToLobby}
    />
  </div>
);

export default LeftSidebar;
