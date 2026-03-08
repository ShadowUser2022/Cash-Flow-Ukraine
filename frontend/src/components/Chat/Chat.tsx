import React, { useState, useRef, useEffect } from 'react';
import useGameStore from '../../store/gameStore';
import { socketService } from '../../services/socketService';
import type { ChatMessage } from '../../types';
import { SOCKET_EVENTS } from '../../constants/socketEvents';
import './Chat.css';

interface ChatProps {
  roomId: string;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
  onClose?: () => void;
}

const Chat: React.FC<ChatProps> = ({ 
  roomId, 
  isMinimized = false, 
  onToggleMinimize,
  onClose
}) => {
  const [message, setMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    chatMessages,
    game
  } = useGameStore();

  // --- Функція для підрахунку непрочитаних повідомлень (заглушка)
  const getUnreadCount = () => 0;

  // --- Функція для рендеру повідомлення (заглушка)
  const renderMessage = (msg: any, idx: number) => (
    <div key={idx} className="chat-message">
      <span className="chat-author">{msg.author}:</span> {msg.text}
    </div>
  );

  // Auto scroll to bottom when new messages arrive
  if (isMinimized) {
    const unreadCount = getUnreadCount();
    return (
      <div className="card chat-card card-sm card-clickable" onClick={onToggleMinimize}>
        <div className="minimized-content">
          <span className="chat-icon">💬</span>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount}</span>
          )}
          <span className="minimized-text">Чат</span>
        </div>
      </div>
    );
  }

  // Модальне вікно поверх гри
  return (
    <div className="modal-overlay chat-modal">
      <div className="card chat-card card-lg">
        <div className="chat-header">
          <h3>💬 Чат гри</h3>
          <div className="header-controls">
            {game && (
              <span className="participants-info">
                {game.players.length} учасників
              </span>
            )}
            <button 
              className="minimize-btn"
              onClick={onToggleMinimize}
              title="Згорнути чат"
            >
              ➖
            </button>
            <button 
              className="close-btn"
              onClick={onClose}
              title="Закрити чат"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="chat-messages">
          {chatMessages.length === 0 ? (
            <div className="card warning-card">
              <p>Поки що повідомлень немає</p>
              <p>Напишіть перше повідомлення!</p>
            </div>
          ) : (
            chatMessages.map(renderMessage)
          )}
          {typingUsers.length > 0 && (
            <div className="card info-card typing-indicator">
              <div className="typing-content">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="typing-text">
                  {typingUsers.length === 1 
                    ? `${typingUsers[0]} друкує...`
                    : `${typingUsers.length} гравців друкують...`
                  }
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        {/* Інпут і кнопка надсилання */}
        {/* ...input rendering code... */}
      </div>
    </div>
  );

};

export default Chat;
