import React from 'react';
import Chat from '../Chat/Chat';
import './ChatModal.css';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameId: string;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  gameId
}) => {
  if (!isOpen) return null;

  return (
    <div className="chat-modal-overlay" onClick={onClose}>
      <div className="chat-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="chat-modal-header">
          <h3>💬 Чат гри</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="chat-modal-body">
          <Chat
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

export default ChatModal;
