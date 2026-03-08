import React from 'react';
import Chat from '../Chat/Chat';
import './ChatWidget.css';

interface ChatWidgetProps {
  gameId: string;
  onClose: () => void;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  gameId,
  onClose
}) => {
  return (
    <div className="chat-widget">
      <div className="widget-header">
        <h4>💬 Чат</h4>
        <button className="widget-close" onClick={onClose}>✕</button>
      </div>
      
      <div className="widget-content">
        <Chat
          roomId={gameId}
          isMinimized={false}
          onToggleMinimize={onClose}
          onClose={onClose}
        />
      </div>
    </div>
  );
};

export default ChatWidget;
