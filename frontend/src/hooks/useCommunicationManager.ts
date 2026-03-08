import { useState, useCallback, useEffect } from 'react';
import useGameStore from '../store/gameStore';
import useWebRTC from './useWebRTC';
import { socketService } from '../services/socketService';

interface CommunicationManagerProps {
  gameId: string;
}

// Простий хук для сповіщень (тимчасово)
const useNotifications = () => {
  const showNotification = useCallback((type: 'info' | 'success' | 'warning' | 'error', title: string, message: string) => {
    console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
    // Тут можна додати реалізацію toast/sp notifications
  }, []);

  return { showNotification };
};

export const useCommunicationManager = ({ gameId }: CommunicationManagerProps) => {
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isAudioVideoEnabled, setIsAudioVideoEnabled] = useState(false);

  const {
    isVideoEnabled,
    isAudioEnabled
  } = useGameStore();

  const { showNotification } = useNotifications();
  const socket = socketService.getWebRTCSocket();
  
  const {
    initializeMedia,
    joinRoom,
    leaveRoom,
    toggleVideo: webRTCToggleVideo,
    toggleAudio: webRTCToggleAudio
  } = useWebRTC({ socket, roomId: gameId });

  // Управління звуком гри
  const handleToggleSound = useCallback(() => {
    const newSoundState = !isSoundEnabled;
    setIsSoundEnabled(newSoundState);
    
    // Зберігаємо налаштування в localStorage
    localStorage.setItem('soundEnabled', newSoundState.toString());
    
    // Показуємо сповіщення
    showNotification('info', 'Звук', newSoundState ? 'Звук увімкнено' : 'Звук вимкнено');

    // Тут можна додати логіку для управління звуком гри
    // Наприклад: gameAudio.setVolume(newSoundState ? 1 : 0);
  }, [isSoundEnabled, showNotification]);

  // Управління аудіо/відео
  const handleToggleAudioVideo = useCallback(async () => {
    const newAudioVideoState = !isAudioVideoEnabled;
    
    if (newAudioVideoState) {
      try {
        // Ініціалізуємо WebRTC при увімкненні
        if (gameId !== 'DEV-MODE') {
          await initializeMedia();
          await joinRoom();
        }
        
        setIsAudioVideoEnabled(true);
        showNotification('success', 'Аудіо/Відео', 'Аудіо та відео увімкнено');
      } catch (error) {
        console.error('Failed to initialize audio/video:', error);
        showNotification('error', 'Помилка', 'Не вдалося увімкнути аудіо/відео');
      }
    } else {
      // Вимикаємо та очищуємо WebRTC
      leaveRoom();
      setIsAudioVideoEnabled(false);
      
      showNotification('info', 'Аудіо/Відео', 'Аудіо та відео вимкнено');
    }
  }, [isAudioVideoEnabled, gameId, initializeMedia, joinRoom, leaveRoom, showNotification]);

  // Управління чатом (тимчасово відключено)
  const handleToggleChat = useCallback(() => {
    // Чат тимчасово відключено
    showNotification('warning', 'Чат', 'Чат тимчасово відключено');
  }, [showNotification]);

  // Делеговані функції для управління WebRTC
  const toggleVideo = useCallback(() => {
    if (isAudioVideoEnabled) {
      webRTCToggleVideo();
    }
  }, [isAudioVideoEnabled, webRTCToggleVideo]);

  const toggleAudio = useCallback(() => {
    if (isAudioVideoEnabled) {
      webRTCToggleAudio();
    }
  }, [isAudioVideoEnabled, webRTCToggleAudio]);

  // Відновлення налаштувань з localStorage при завантаженні
  useEffect(() => {
    const savedSoundState = localStorage.getItem('soundEnabled');
    if (savedSoundState !== null) {
      setIsSoundEnabled(savedSoundState === 'true');
    }
  }, []);

  // Очищення при розмонтуванні
  useEffect(() => {
    return () => {
      if (isAudioVideoEnabled) {
        leaveRoom();
      }
    };
  }, [isAudioVideoEnabled, leaveRoom]);

  return {
    // Стан
    isSoundEnabled,
    isAudioVideoEnabled,
    isChatEnabled: false, // Чат тимчасово відключено
    isVideoEnabled,
    isAudioEnabled,
    
    // Обробники
    handleToggleSound,
    handleToggleAudioVideo,
    handleToggleChat,
    
    // WebRTC функції
    toggleVideo,
    toggleAudio,
    
    // Додаткові функції
    initializeMedia,
    leaveRoom
  };
};

export default useCommunicationManager;
