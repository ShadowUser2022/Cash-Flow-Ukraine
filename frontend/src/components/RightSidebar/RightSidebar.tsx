import React from 'react';
import DealsPanel from '../DealsPanel/DealsPanel';
import { useTouchGestures, useIsMobile } from '../../hooks/useTouchGestures';

// Правий sidebar — ТІЛЬКИ дії гравця:
// Угоди (купити), Активи (продати), Ринок (графіки акцій)
// Статус гри — у TopInfoBar. Фінанси — у лівому sidebar.

interface RightSidebarProps {
  open: boolean;
  playerId: string;
  onToggle?: () => void;
  // game і currentPlayer більше не потрібні тут — DealsPanel читає зі store
}

const RightSidebar: React.FC<RightSidebarProps> = ({ open, playerId, onToggle }) => {
  const isMobile = useIsMobile();

  useTouchGestures({
    onSwipeRight: () => { if (open && onToggle) onToggle(); }
  });

  return (
    <div className={`right-sidebar sidebar-animated${open ? ' open' : ''}`}>
      {isMobile && open && (
        <button className="sidebar-close-btn" onClick={onToggle}>✕</button>
      )}
      <div className="right-sidebar-header">
        <span className="right-sidebar-title">💼 Угоди & Ринок</span>
      </div>
      <DealsPanel playerId={playerId} />
    </div>
  );
};

export default RightSidebar;
