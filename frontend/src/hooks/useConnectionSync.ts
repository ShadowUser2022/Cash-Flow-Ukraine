import { useEffect } from 'react';
import useGameStore from '../store/gameStore';

// Simple hook to track connection status and update state accordingly
export const useConnectionSync = () => {
  const { 
    isConnected, 
    setConnectionStatus,
    playerId,
    game
  } = useGameStore();

  useEffect(() => {
    // Check connection status periodically
    const checkConnection = () => {
      const actuallyConnected = window.navigator.onLine;
      
      if (isConnected !== actuallyConnected) {
        setConnectionStatus(actuallyConnected);
        
        if (!actuallyConnected) {
          console.warn('📡 Internet connection lost');
        } else {
          console.log('📡 Internet connection restored');
        }
      }
    };

    // Check immediately
    checkConnection();

    // Set up periodic checks
    const interval = setInterval(checkConnection, 5000); // Every 5 seconds

    // Listen to online/offline events
    const handleOnline = () => {
      console.log('📡 Back online');
      setConnectionStatus(true);
    };

    const handleOffline = () => {
      console.warn('📡 Gone offline');
      setConnectionStatus(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isConnected, setConnectionStatus]);

  // Auto-save game state to localStorage
  useEffect(() => {
    if (game && playerId) {
      const gameState = {
        gameId: game.id,
        playerId,
        timestamp: Date.now()
      };
      
      localStorage.setItem('cashflow_game_state', JSON.stringify(gameState));
    }
  }, [game, playerId]);

  // Try to restore game state on mount
  useEffect(() => {
    const savedState = localStorage.getItem('cashflow_game_state');
    if (savedState) {
      try {
        const { gameId, playerId: savedPlayerId, timestamp } = JSON.parse(savedState);
        
        // Only restore if saved within last hour
        if (Date.now() - timestamp < 60 * 60 * 1000) {
          console.log('🔄 Found saved game state:', { gameId, savedPlayerId });
          // You could emit a rejoin event here if needed
        } else {
          localStorage.removeItem('cashflow_game_state');
        }
      } catch (error) {
        console.error('Failed to parse saved game state:', error);
        localStorage.removeItem('cashflow_game_state');
      }
    }
  }, []);

  return {
    isConnected,
    hasGameState: !!(game && playerId)
  };
};
