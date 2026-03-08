// GameHeader.tsx
// Верхня панель з фінансами, статусом, dev-info

import React from 'react';
import type { Player, Game } from '../../types/game';

interface GameHeaderProps {
  game: Game;
  currentPlayer: Player;
  financialSummary: any;
  isDeveloperMode: boolean;
  isDevInfoMinimized: boolean;
  setIsDevInfoMinimized: (v: boolean) => void;
  playerId: string;
  isMyTurn: boolean;
  addNotification: (n: any) => void;
  setCurrentPlayer: (p: Player) => void;
  setGame: (g: Game) => void;
  setShowDreamSelection: (v: boolean) => void;
}

const GameHeader: React.FC<GameHeaderProps> = (props) => {
  // ...рендер верхньої панелі, фінансів, dev-info, кнопок...
  // ...existing code...
  return null;
};

export default GameHeader;
