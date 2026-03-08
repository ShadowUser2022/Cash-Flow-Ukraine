// useGameSocketHandlers.ts
// Всі socket-обробники, підписки, cleanup для GameInterface

import { useEffect } from 'react';
import { socketService } from '../../services/socketService';
import { SOCKET_EVENTS } from '../../constants/socketEvents';
import type { Player, Game, CellEffect, Deal, GameTurn } from '../../types/game';

interface UseGameSocketHandlersProps {
  game: Game | null;
  playerId: string;
  setGame: (game: Game) => void;
  setCurrentPlayer: (player: Player) => void;
  addNotification: (n: any) => void;
  setDiceAnimation: (a: any) => void;
  setCurrentCellEffect: (e: CellEffect | null) => void;
  currentPlayer: Player | null;
  transactionToast: (type: string, amount: number, desc: string) => void;
  gameEventToast: (title: string, msg: string) => void;
  success: (title: string, msg: string) => void;
  warning: (title: string, msg: string) => void;
}

export function useGameSocketHandlers({
  game,
  playerId,
  setGame,
  setCurrentPlayer,
  addNotification,
  setDiceAnimation,
  setCurrentCellEffect,
  currentPlayer,
  transactionToast,
  gameEventToast,
  success,
  warning
}: UseGameSocketHandlersProps) {
  useEffect(() => {
    if (!game || !playerId) return;
    const socket = socketService.getGameSocket();
    if (!socket) return;
    // ...тут підключення всіх socket.on/off як у GameInterface...
    // Для кожного події — окремий handler (див. оригінал)
    // ...existing code...
    return () => {
      // ...existing code...
    };
  }, [game, playerId, setGame, setCurrentPlayer]);
}
