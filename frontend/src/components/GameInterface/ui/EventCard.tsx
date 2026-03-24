// EventCard.tsx
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
    sellMultiplier?: number;
    affectedAssetType?: string;
    dividendMonths?: number;
    isWin?: boolean;
  } | null;
  show: boolean;
  onAction: (accept: boolean) => void;
}

// Типи карток де гравець зобов'язаний прийняти (без вибору)
const MANDATORY_TYPES = new Set(['doodad', 'expense', 'baby', 'downsize', 'lawsuit', 'tax_audit', 'divorce', 'market', 'dream_check']);

// Типи де є вибір (купити / пропустити)
const OPTIONAL_TYPES = new Set(['opportunity', 'business', 'charity']);

const getCardColor = (type: string): string => {
  switch (type) {
    case 'opportunity':  return '#4CAF50';
    case 'business':     return '#2196F3';
    case 'market':       return '#FF9800';
    case 'doodad':
    case 'expense':      return '#F44336';
    case 'lawsuit':      return '#E91E63';
    case 'divorce':      return '#E91E63';
    case 'tax_audit':    return '#795548';
    case 'baby':         return '#9C27B0';
    case 'downsize':     return '#607D8B';
    case 'charity':      return '#00BCD4';
    case 'dream_check':  return '#FFD700';
    default:             return '#607D8B';
  }
};

const getCardIcon = (type: string): string => {
  switch (type) {
    case 'opportunity':  return '🏠';
    case 'business':     return '🏢';
    case 'market':       return '📈';
    case 'doodad':
    case 'expense':      return '🛍️';
    case 'lawsuit':      return '⚖️';
    case 'divorce':      return '💔';
    case 'tax_audit':    return '📄';
    case 'baby':         return '👶';
    case 'downsize':     return '📉';
    case 'charity':      return '❤️';
    case 'dream_check':  return '🏆';
    default:             return '📋';
  }
};

const getCardLabel = (type: string): string => {
  switch (type) {
    case 'opportunity':  return 'МАЛА УГОДА';
    case 'business':     return 'ВЕЛИКИЙ БІЗНЕС';
    case 'market':       return 'РИНОК';
    case 'doodad':       return 'ВИТРАТИ';
    case 'expense':      return 'ВИТРАТИ';
    case 'lawsuit':      return 'СУДОВИЙ ПОЗОВ';
    case 'divorce':      return 'РОЗЛУЧЕННЯ';
    case 'tax_audit':    return 'ПОДАТКОВА';
    case 'baby':         return 'ПОПОВНЕННЯ';
    case 'downsize':     return 'ЗВІЛЬНЕННЯ';
    case 'charity':      return 'БЛАГОДІЙНІСТЬ';
    case 'dream_check':  return 'ПЕРЕВІРКА МРІЇ';
    default:             return 'ПОДІЯ';
  }
};

const EventCard: React.FC<EventCardProps> = ({ card, show, onAction }) => {
  if (!show || !card) return null;

  const isMandatory = MANDATORY_TYPES.has(card.type);
  const isOptional = OPTIONAL_TYPES.has(card.type);
  const accentColor = getCardColor(card.type);

  const renderButtons = () => {
    if (card.type === 'dream_check') {
      return (
        <div className="event-card-buttons">
          <button className="event-card-btn accept" style={{ background: accentColor }} onClick={() => onAction(true)}>
            {card.isWin ? '🏆 Перемогти!' : 'Продовжити'}
          </button>
        </div>
      );
    }

    if (isMandatory) {
      // Обов'язкова подія — тільки одна кнопка
      return (
        <div className="event-card-buttons">
          <button className="event-card-btn accept full-width" style={{ background: accentColor }} onClick={() => onAction(true)}>
            {card.action === 'Сплатити' ? `Сплатити $${card.value.toLocaleString()}` : 'Зрозуміло'}
          </button>
        </div>
      );
    }

    if (isOptional) {
      // Вибір: купити або пропустити
      const buyLabel = card.type === 'charity' ? 'Пожертвувати' : 'Купити';
      const skipLabel = card.type === 'charity' ? 'Пропустити' : 'Пропустити';
      return (
        <div className="event-card-buttons">
          <button className="event-card-btn accept" style={{ background: accentColor }} onClick={() => onAction(true)}>
            {buyLabel}
          </button>
          <button className="event-card-btn decline" onClick={() => onAction(false)}>
            {skipLabel}
          </button>
        </div>
      );
    }

    // Fallback
    return (
      <div className="event-card-buttons">
        <button className="event-card-btn accept" onClick={() => onAction(true)}>Прийняти</button>
        <button className="event-card-btn decline" onClick={() => onAction(false)}>Відхилити</button>
      </div>
    );
  };

  const renderMarketInfo = () => {
    if (card.type !== 'market') return null;
    if (card.sellMultiplier) {
      const isBoom = card.sellMultiplier > 1;
      return (
        <div className="event-card-market-info" style={{ borderColor: isBoom ? '#4CAF50' : '#F44336' }}>
          <div className="market-multiplier" style={{ color: isBoom ? '#4CAF50' : '#F44336' }}>
            {isBoom ? '📈 БУМ' : '📉 ОБВАЛ'} × {card.sellMultiplier}
          </div>
          <div className="market-asset">
            Актив: <strong>{card.affectedAssetType || 'всі'}</strong>
          </div>
          <div className="market-hint">Відкрийте "Активи" → продайте зараз!</div>
        </div>
      );
    }
    if (card.dividendMonths) {
      return (
        <div className="event-card-market-info" style={{ borderColor: '#4CAF50' }}>
          <div className="market-multiplier" style={{ color: '#4CAF50' }}>
            💰 ДИВІДЕНДИ × {card.dividendMonths} міс.
          </div>
          <div className="market-hint">Пасивний дохід за {card.dividendMonths} місяці!</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="event-card-overlay">
      <div className="event-card" style={{ borderTopColor: accentColor, borderColor: `${accentColor}50` }}>

        {/* Мітка типу картки */}
        <div className="event-card-type-label" style={{ background: accentColor }}>
          {getCardLabel(card.type)}
        </div>

        <div className="event-card-header">
          <div className="event-card-icon" style={{ background: `${accentColor}30`, borderColor: `${accentColor}60` }}>
            {getCardIcon(card.type)}
          </div>
          <h3 className="event-card-title">{card.title}</h3>
        </div>

        <div className="event-card-content">
          <p className="event-card-description">{card.description}</p>

          {/* Ринкова інформація (тільки для market) */}
          {renderMarketInfo()}

          {/* Деталі (тільки для угод) */}
          {card.details && card.type !== 'market' && (
            <div className="event-card-details">
              <small>{card.details}</small>
            </div>
          )}

          {/* Фінансовий рядок */}
          {card.value !== 0 && (
            <div className="event-card-action">
              <span className="action-text">
                {card.type === 'opportunity' || card.type === 'business' ? 'Перший внесок' : 'Сума'}
              </span>
              <div className="action-value" style={{ color: (card.type === 'opportunity' || card.type === 'business') ? '#4CAF50' : '#F44336' }}>
                {(card.type === 'opportunity' || card.type === 'business') ? '-' : '-'}${Math.abs(card.value).toLocaleString()}
              </div>
            </div>
          )}
        </div>

        {renderButtons()}
      </div>
    </div>
  );
};

export default EventCard;
