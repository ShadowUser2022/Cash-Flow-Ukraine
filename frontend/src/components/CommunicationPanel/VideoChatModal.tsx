import React from 'react';
import VideoChat from '../VideoChat/VideoChat';
import './VideoChatModal.css';

interface VideoChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameId: string;
}

export const VideoChatModal: React.FC<VideoChatModalProps> = ({
  isOpen,
  onClose,
  gameId
}) => {
  if (!isOpen) return null;

  return (
    <div className="video-chat-modal-overlay" onClick={onClose}>
      <div className="video-chat-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="video-chat-modal-header">
          <h3>📹 Відео зв'язок</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="video-chat-modal-body">
          <VideoChat
            roomId={gameId}
            isMinimized={false}
            onToggleMinimize={onClose}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
};

export default VideoChatModal;
