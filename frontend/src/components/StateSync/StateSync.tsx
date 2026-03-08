import { useEffect, useRef } from 'react';
import useGameStore from '../../store/gameStore';
import { socketService } from '../../services/socketService';
import { createError, ErrorCodes, logError } from '../../utils/errorHandling';
import './StateSync.css';

interface StateSyncProps {
  autoReconnect?: boolean;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
}

export const StateSync: React.FC<StateSyncProps> = ({
  autoReconnect = true,
  reconnectDelay = 3000,
  maxReconnectAttempts = 5,
}) => {
  const { 
    isConnected, 
    playerId, 
    setConnectionStatus, 
    setError, 
    clearError,
    setLoading,
    game
  } = useGameStore();
  
  const reconnectAttempts = useRef(0);
  const reconnectTimer = useRef<number | null>(null);
  const heartbeatTimer = useRef<number | null>(null);
  const lastPingTime = useRef<number>(Date.now());

  // Heartbeat to check connection health
  const startHeartbeat = () => {
    if (heartbeatTimer.current) {
      clearInterval(heartbeatTimer.current);
    }

    heartbeatTimer.current = window.setInterval(() => {
      if (isConnected && socketService.gameSocket?.connected) {
        const now = Date.now();
        
        // Send ping and track response time
        socketService.gameSocket.emit('ping', { timestamp: now });
        
        // Check if we haven't received a pong in too long
        if (now - lastPingTime.current > 30000) { // 30 seconds timeout
          console.warn('Connection seems unhealthy, triggering reconnect');
          handleConnectionLost();
        }
      }
    }, 10000); // Check every 10 seconds
  };

  const stopHeartbeat = () => {
    if (heartbeatTimer.current) {
      clearInterval(heartbeatTimer.current);
      heartbeatTimer.current = null;
    }
  };

  const handleConnectionLost = () => {
    setConnectionStatus(false);
    setError(createError(
      'CONNECTION_LOST',
      'З\'єднання з сервером втрачено',
      { playerId, gameId: game?.id },
      true
    ));
    
    if (autoReconnect && reconnectAttempts.current < maxReconnectAttempts) {
      scheduleReconnect();
    }
  };

  const scheduleReconnect = () => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
    }

    reconnectAttempts.current += 1;
    const delay = reconnectDelay * reconnectAttempts.current; // Exponential backoff

    console.log(`Спроба відновлення з'єднання ${reconnectAttempts.current}/${maxReconnectAttempts} через ${delay}ms`);
    
    setLoading(true);
    reconnectTimer.current = window.setTimeout(() => {
      attemptReconnect();
    }, delay);
  };

  const attemptReconnect = async () => {
    try {
      setLoading(true);
      
      // Try to reconnect
      await socketService.connect();
      
      // If we have a player ID and game, try to rejoin
      if (playerId && game?.id) {
        socketService.emit('rejoin_game', { 
          gameId: game.id, 
          playerId,
          timestamp: Date.now()
        });
      }
      
      // Reset attempts on successful reconnection
      reconnectAttempts.current = 0;
      setConnectionStatus(true);
      clearError();
      startHeartbeat();
      
      console.log('✅ З\'єднання відновлено');
      
    } catch (error) {
      logError(error as Error, 'Reconnection attempt failed');
      
      if (reconnectAttempts.current < maxReconnectAttempts) {
        scheduleReconnect();
      } else {
        setError(createError(
          'CONNECTION_FAILED',
          'Не вдалося відновити з\'єднання з сервером',
          { attempts: reconnectAttempts.current },
          false
        ));
      }
    } finally {
      setLoading(false);
    }
  };

  // Manual reconnect function
  const manualReconnect = () => {
    reconnectAttempts.current = 0;
    clearError();
    attemptReconnect();
  };

  // Set up event listeners
  useEffect(() => {
    const handleConnect = () => {
      setConnectionStatus(true);
      reconnectAttempts.current = 0;
      clearError();
      lastPingTime.current = Date.now();
      startHeartbeat();
    };

    const handleDisconnect = () => {
      handleConnectionLost();
      stopHeartbeat();
    };

    const handlePong = (data: { timestamp: number }) => {
      lastPingTime.current = Date.now();
      const latency = lastPingTime.current - data.timestamp;
      
      // Log high latency as a warning
      if (latency > 5000) {
        console.warn(`High latency detected: ${latency}ms`);
      }
    };

    const handleError = (error: any) => {
      logError(error, 'Socket error');
      setError(createError(
        'SOCKET_ERROR',
        'Помилка з\'єднання з сервером',
        error,
        true
      ));
    };

    // Subscribe to socket events
    socketService.on('connect', handleConnect);
    socketService.on('disconnect', handleDisconnect);
    socketService.on('pong', handlePong);
    socketService.on('connect_error', handleError);
    socketService.on('error', handleError);

    // Start heartbeat if already connected
    if (isConnected) {
      startHeartbeat();
    }

    return () => {
      // Cleanup
      socketService.off('connect', handleConnect);
      socketService.off('disconnect', handleDisconnect);
      socketService.off('pong', handlePong);
      socketService.off('connect_error', handleError);
      socketService.off('error', handleError);
      
      stopHeartbeat();
      
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
    };
  }, [isConnected, playerId, game?.id]);

  // Component cleanup
  useEffect(() => {
    return () => {
      stopHeartbeat();
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
    };
  }, []);

  // Render connection status indicator
  return (
    <div className="state-sync">
      {!isConnected && (
        <div className="connection-status disconnected">
          <span className="status-icon">⚠️</span>
          <span className="status-text">
            {reconnectAttempts.current > 0 
              ? `Відновлення з'єднання... (${reconnectAttempts.current}/${maxReconnectAttempts})`
              : 'З\'єднання втрачено'
            }
          </span>
          {reconnectAttempts.current >= maxReconnectAttempts && (
            <button 
              className="reconnect-button"
              onClick={manualReconnect}
            >
              🔄 Спробувати знову
            </button>
          )}
        </div>
      )}
    </div>
  );
};
