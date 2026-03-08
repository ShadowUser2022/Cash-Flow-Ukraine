import React, { useState, useEffect } from 'react';
import { useCommunicationManager } from '../../hooks/useCommunicationManager';
import AudioWidget from './AudioWidget';
import VideoWidget from './VideoWidget';
import ChatWidget from './ChatWidget';
import './CommunicationPanel.css';

interface CommunicationPanelProps {
  gameId: string;
}

export const CommunicationPanel: React.FC<CommunicationPanelProps> = ({ gameId }) => {
  const [showAudioWidget, setShowAudioWidget] = useState(false);
  const [showVideoWidget, setShowVideoWidget] = useState(false);
  const [showChatWidget, setShowChatWidget] = useState(false);

  const {
    isSoundEnabled,
    isAudioVideoEnabled,
    handleToggleSound
  } = useCommunicationManager({ gameId });

  // Закриваємо всі віджети при кліку поза ними
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // Перевіряємо, чи клік був поза віджетами
      const isOutsideWidgets = !target.closest('.audio-widget') && 
                              !target.closest('.video-widget') && 
                              !target.closest('.chat-widget') &&
                              !target.closest('.communication-panel');
      
      if (isOutsideWidgets) {
        setShowAudioWidget(false);
        setShowVideoWidget(false);
        setShowChatWidget(false);
      }
    };

    if (showAudioWidget || showVideoWidget || showChatWidget) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showAudioWidget, showVideoWidget, showChatWidget]);

  const handleSoundClick = () => {
    // Закриваємо інші віджети при відкритті нового
    setShowVideoWidget(false);
    setShowChatWidget(false);
    setShowAudioWidget(!showAudioWidget);
  };

  const handleVideoClick = () => {
    setShowAudioWidget(false);
    setShowChatWidget(false);
    setShowVideoWidget(!showVideoWidget);
  };

  const handleChatClick = () => {
    setShowAudioWidget(false);
    setShowVideoWidget(false);
    setShowChatWidget(!showChatWidget);
  };

  return (
    <>
      <div className="communication-panel">
        <button
          className={`communication-btn ${isSoundEnabled ? 'active' : ''}`}
          onClick={handleSoundClick}
          title="Налаштування звуку"
        >
          <span className="communication-icon">
            {isSoundEnabled ? '🔊' : '🔇'}
          </span>
        </button>
        
        <button
          className={`communication-btn ${isAudioVideoEnabled ? 'active' : ''}`}
          onClick={handleVideoClick}
          title="Відео зв'язок"
        >
          <span className="communication-icon">
            {isAudioVideoEnabled ? '📹' : '📵'}
          </span>
        </button>
        
        <button
          className={`communication-btn ${showChatWidget ? 'active' : ''}`}
          onClick={handleChatClick}
          title="Чат гри"
        >
          <span className="communication-icon">
            💬
          </span>
        </button>
      </div>

      {/* Невеликі віджети внизу екрана */}
      {showAudioWidget && (
        <AudioWidget
          soundEnabled={isSoundEnabled}
          onToggleSound={handleToggleSound}
          onClose={() => setShowAudioWidget(false)}
        />
      )}

      {showVideoWidget && (
        <VideoWidget
          gameId={gameId}
          onClose={() => setShowVideoWidget(false)}
        />
      )}

      {showChatWidget && (
        <ChatWidget
          gameId={gameId}
          onClose={() => setShowChatWidget(false)}
        />
      )}
    </>
  );
};

export default CommunicationPanel;
