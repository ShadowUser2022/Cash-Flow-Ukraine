import TopInfoBar from '../TopInfoBar/TopInfoBar';
import React, { useState, useEffect } from 'react';
import './GameInterface.css';
import useGameStore from '../../store/gameStore';
import { useToast } from '../../hooks/useToast';
import { useIsMobile } from '../../hooks/useTouchGestures';
import { usePlayerTurnLogic } from './hooks/usePlayerTurnLogic';
import GameBoard from './ui/BoardContainer';
import EventCard from './ui/EventCard';
// import DreamSelection from './ui/Modals';
// import CellEffects from './ui/Overlays';
import ToastNotifications from './ui/Overlays';
import LeftSidebar from '../LeftSidebar/LeftSidebar';
import RightSidebar from '../RightSidebar/RightSidebar';
import MobileNavigation from './ui/Sidebars';


interface GameInterfaceProps {
  gameId: string;
  playerId: string;
  onBackToLobby?: () => void;
  isDeveloperMode?: boolean;
}



const GameInterface: React.FC<GameInterfaceProps> = ({ gameId, playerId }) => {
  // === STATE & HOOKS ===
  const { game, currentPlayer } = useGameStore();
  // Stub/mock дані для пропсів
  const [playerMovement] = useState<any>(null); // для BoardContainer
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const { toasts, removeToast, addToast } = useToast();
  // Стартове toast-повідомлення при запуску гри
  useEffect(() => {
    if (game && currentPlayer) {
      // Welcome маркетинговий toast
      addToast({
        type: 'start',
        title: 'Ласкаво просимо до CASHFLOW!',
        message: 'Ви на шляху до фінансової свободи. Грайте як інвестор, мисліть як підприємець, перемагайте як лідер! 💸🚀\n\nПамʼятайте: справжній успіх — це стратегія, а не випадковість. Бажаємо натхнення та перемог!',
        duration: 6000
      });
    }
    // eslint-disable-next-line
  }, [game, currentPlayer]);
  const isMobile = useIsMobile();

  // === Логіка ходу ===
  const { 
    isMyTurn, 
    canMoveToFastTrack, 
    handleExecuteTurn, 
    handleDiceRollComplete,
    currentEventCard,
    showEventCard,
    handleEventCardAction
  } = usePlayerTurnLogic({ game, playerId, currentPlayer });

  // === Stub-функції для пропсів ===
  const handleCellClick = () => {};
  const handleLeftSidebarToggle = () => setLeftSidebarOpen((v) => !v);
  const handleRightSidebarToggle = () => setRightSidebarOpen((v) => !v);

  return (
    <div className="game-interface">
      {/* Top Info Bar — фінансовий огляд */}
      {game && currentPlayer && (
        <TopInfoBar
          playerName={currentPlayer.name}
          avatarUrl={currentPlayer.avatar}
          profession={currentPlayer.profession.name}
          cash={currentPlayer.finances.cash}
          passiveIncome={currentPlayer.finances.passiveIncome}
          expenses={currentPlayer.finances.expenses}
          assetsCount={currentPlayer.finances.assets?.length || 0}
          liabilitiesTotal={currentPlayer.finances.liabilities?.reduce((sum, l) => sum + (l.amount || 0), 0) || 0}
          dream={{ name: 'Мрія', amount: 0 }}
        />
      )}
      {/* Головна ігрова дошка */}
      {game && currentPlayer ? (
        <GameBoard
          playerMovement={playerMovement}
          onCellClick={handleCellClick}
          onExecuteTurn={handleExecuteTurn}
        />
      ) : (
        <div style={{color: '#FFD700', textAlign: 'center', marginTop: 40}}>Завантаження ігрового поля...</div>
      )}
      {/* Ліва бічна панель — окремий компонент */}
      <button
        className={`sidebar-toggle left ${leftSidebarOpen ? 'active' : ''}`}
        onClick={handleLeftSidebarToggle}
        title={leftSidebarOpen ? 'Сховати панель' : 'Показати панель взаємодії'}
      >
        {leftSidebarOpen ? '◀' : '▶'}
      </button>
      {game && currentPlayer && (
        <LeftSidebar
          open={leftSidebarOpen}
          currentPlayer={currentPlayer}
          gameId={gameId}
          isMyTurn={isMyTurn}
          canMoveToFastTrack={false} // TODO: додати реальну перевірку
          diceAnimation={{ isRolling: false }} // stub
          onExecuteTurn={handleExecuteTurn}
          onMoveToFastTrack={() => {}}
          onDiceRollComplete={handleDiceRollComplete}
        />
      )}
      {/* Права бічна панель — окремий компонент */}
      <button
        className={`sidebar-toggle right ${rightSidebarOpen ? 'active' : ''}`}
        onClick={handleRightSidebarToggle}
        title={rightSidebarOpen ? 'Сховати Game Hub' : 'Показати Game Hub'}
      >
        {rightSidebarOpen ? '▶' : '◀'}
      </button>
      {game && currentPlayer && (
        <RightSidebar
          open={rightSidebarOpen}
          game={game}
          currentPlayer={currentPlayer}
          playerId={playerId}
        />
      )}
      
      {/* Картка події */}
      <EventCard
        card={currentEventCard}
        show={showEventCard}
        onAction={handleEventCardAction}
      />
      
      {/* Модальні вікна */}
  {/* <DreamSelection ... /> видалено, бо всі пропси видалені */}
      {/* Toast, Chat, VideoChat, MobileNavigation через Overlays */}
      <ToastNotifications
        toasts={toasts}
        removeToast={removeToast}
        gameId={gameId}
        isMobile={isMobile}
        leftSidebarOpen={leftSidebarOpen}
        rightSidebarOpen={rightSidebarOpen}
        handleLeftSidebarToggle={handleLeftSidebarToggle}
        handleRightSidebarToggle={handleRightSidebarToggle}
      />
      {/* Мобільна навігація */}
      {isMobile && (
        <MobileNavigation
          leftSidebarOpen={leftSidebarOpen}
          rightSidebarOpen={rightSidebarOpen}
          handleLeftSidebarToggle={handleLeftSidebarToggle}
          handleRightSidebarToggle={handleRightSidebarToggle}
        />
      )}
    </div>
  );
};

export default GameInterface;
