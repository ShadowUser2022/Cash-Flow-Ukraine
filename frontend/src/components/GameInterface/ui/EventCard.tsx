// EventCard.tsx
// Компонент для показу карток подій в грі

import React from 'react';
import './EventCard.css';

interface EventCardProps {
  card: {
    type: string;
    title: string;
    description: string;
    action: string;
    value: number;
    details?: string;
  } | null;
  show: boolean;
  onAction: (accept: boolean) => void;
}

const EventCard: React.FC<EventCardProps> = ({ card, show, onAction }) => {
  if (!show || !card) return null;

  const getCardColor = (type: string) => {
    switch (type) {
      case 'opportunity': return '#4CAF50';  // зелений
      case 'expense': return '#F44336';      // червоний
      case 'income': return '#2196F3';      // синій
      case 'market': return '#FF9800';      // помаранчевий
      case 'deal': return '#9C27B0';        // фіолетовий
      case 'loan': return '#795548';         // коричневий
      case 'emergency': return '#E91E63';    // рожевий
      case 'investment': return '#00BCD4';   // блакитний
      default: return '#607D8B';           // сірий
    }
  };

  const getCardIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return '🏠';
      case 'expense': return '🚗';
      case 'income': return '💼';
      case 'market': return '📈';
      case 'deal': return '🤝';
      case 'loan': return '💰';
      case 'emergency': return '🏥';
      case 'investment': return '📊';
      default: return '📄';
    }
  };

  return (
    <div className="event-card-overlay">
      <div className="event-card" style={{ borderTopColor: getCardColor(card.type) }}>
        <div className="event-card-header">
          <div className="event-card-icon">
            {getCardIcon(card.type)}
          </div>
          <h3 className="event-card-title">{card.title}</h3>
        </div>
        
        <div className="event-card-content">
          <p className="event-card-description">{card.description}</p>
          
          {card.details && (
            <div className="event-card-details">
              <small>{card.details}</small>
            </div>
          )}
          
          <div className="event-card-action">
            <span className="action-text">{card.action}</span>
            <div className="action-value" style={{ color: card.value > 0 ? '#4CAF50' : '#F44336' }}>
              {card.value > 0 ? '+' : ''}${Math.abs(card.value).toLocaleString()}
            </div>
          </div>
        </div>
        
        <div className="event-card-buttons">
          <button 
            className="event-card-btn accept"
            onClick={() => onAction(true)}
          >
            Прийняти
          </button>
          <button 
            className="event-card-btn decline"
            onClick={() => onAction(false)}
          >
            Відхилити
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
