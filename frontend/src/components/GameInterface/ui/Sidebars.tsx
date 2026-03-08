// Sidebars.tsx
// Лівий/правий сайдбари, кнопки відкриття/закриття

import React from 'react';

interface SidebarsProps {
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  handleLeftSidebarToggle: () => void;
  handleRightSidebarToggle: () => void;
  children?: React.ReactNode;
}

const Sidebars: React.FC<SidebarsProps> = ({
  leftSidebarOpen,
  rightSidebarOpen,
  handleLeftSidebarToggle,
  handleRightSidebarToggle,
  children,
}) => {
  return (
    <>
      {/* Лівий сайдбар: Фінанси та гравці */}
      <div className={`sidebar left-sidebar${leftSidebarOpen ? ' open' : ' closed'}`}>
        <button className="sidebar-toggle sidebar-toggle-btn left" onClick={handleLeftSidebarToggle}>
          {leftSidebarOpen ? '⟨' : '⟩'}
        </button>
        <div className="sidebar-header">
          <div className="sidebar-title">Фінанси</div>
        </div>
        <div className="sidebar-content">
          <div className="sidebar-section">
            {/* Тут буде фінансова панель гравця */}
            <div className="section-title">Ваш баланс</div>
            {/* ... */}
          </div>
          <div className="sidebar-section">
            <div className="section-title">Гравці</div>
            {/* Список гравців */}
          </div>
        </div>
      </div>

      {/* Правий сайдбар: Інформація про гру */}
      <div className={`sidebar right-sidebar${rightSidebarOpen ? ' open' : ' closed'}`}>
        <button className="sidebar-toggle sidebar-toggle-btn right" onClick={handleRightSidebarToggle}>
          {rightSidebarOpen ? '⟩' : '⟨'}
        </button>
        <div className="sidebar-header">
          <div className="sidebar-title">Інфо гри</div>
        </div>
        <div className="sidebar-content">
          <div className="sidebar-section">
            <div className="section-title">Поточний хід</div>
            {/* Інформація про поточний хід */}
          </div>
          <div className="sidebar-section">
            <div className="section-title">Події</div>
            {/* Останні події гри */}
          </div>
        </div>
      </div>

      {/* Діти (основний ігровий контент) */}
      {children}
    </>
  );
};

export default Sidebars;
