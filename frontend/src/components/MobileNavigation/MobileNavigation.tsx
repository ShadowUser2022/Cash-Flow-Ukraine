import React from 'react';
import './MobileNavigation.css';

interface MobileNavigationProps {
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  onToggleLeft: () => void;
  onToggleRight: () => void;
  isMobile: boolean;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  leftSidebarOpen,
  rightSidebarOpen,
  onToggleLeft,
  onToggleRight,
  isMobile
}) => {
  if (!isMobile) return null;

  return (
    <div className="mobile-navigation">
      <div className="mobile-nav-hint">
        <span className="swipe-hint">
          👆 Swipe right for controls, left for info
        </span>
      </div>
      
      <div className="mobile-nav-buttons">
        <button
          className={`mobile-nav-btn left ${leftSidebarOpen ? 'active' : ''}`}
          onClick={onToggleLeft}
        >
          <span className="nav-icon">🎮</span>
          <span className="nav-label">Controls</span>
        </button>
        
        <button
          className={`mobile-nav-btn right ${rightSidebarOpen ? 'active' : ''}`}
          onClick={onToggleRight}
        >
          <span className="nav-icon">📊</span>
          <span className="nav-label">Info</span>
        </button>
      </div>
    </div>
  );
};

export default MobileNavigation;
