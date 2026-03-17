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
// MobileNavigation (Sidebars.tsx) removed — LeftSidebar/RightSidebar handle mobile
import WinScreen from '../WinScreen/WinScreen';
import AuctionModal from './ui/AuctionModal';
import MechanicsDebugOverlay from '../DebugPanel/MechanicsDebugOverlay';


interface GameInterfaceProps {
  gameId: string;
  playerId: string;
  onBackToLobby?: () => void;
  isDeveloperMode?: boolean;
}



const GameInterface: React.FC<GameInterfaceProps> = ({ gameId, playerId }) => {
  // === STATE & HOOKS ===
  const { game, currentPlayer: storeCurrentPlayer, setCurrentPlayer } = useGameStore();

  // ✅ Деривуємо currentPlayer прямо з game.players — уникаємо stale closure
  const currentPlayer = game?.players?.find((p) => p.id === playerId) ?? storeCurrentPlayer;

  // Синхронізуємо store якщо знайдено з game
  useEffect(() => {
    const derived = game?.players?.find((p) => p.id === playerId);
    if (derived) setCurrentPlayer(derived);
  }, [game, playerId, setCurrentPlayer]);
  // Stub/mock дані для пропсів
  const [playerMovement, setPlayerMovement] = useState<{
    playerId: string;
    fromPosition: number;
    toPosition: number;
    isAnimating: boolean;
  } | null>(null); // для BoardContainer
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const { toasts, removeToast, addToast, success, info, error, transactionToast } = useToast();
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
    handleEventCardAction,
    currentAuction,
    showAuctionModal,
    handleBid,
    handlePassBid,
    charityTurnsLeft,
  } = usePlayerTurnLogic({
    game,
    playerId,
    currentPlayer,
    toasts: { success, info, error, transactionToast },
    setPlayerMovement,
    onWin: () => setIsWon(true)
  });

  // === Stub-функції для пропсів ===
  const handleCellClick = () => {};
  const handleLeftSidebarToggle = () => setLeftSidebarOpen((v) => !v);
  const handleRightSidebarToggle = () => setRightSidebarOpen((v) => !v);

  return (
    <div className="game-interface">
      {/* Top Info Bar — статус гри для всіх гравців */}
      {game && <TopInfoBar playerId={playerId} />}
      {/* Головна ігрова дошка */}
      {game && currentPlayer ? (
        <GameBoard
          playerMovement={playerMovement}
          onCellClick={handleCellClick}
          onExecuteTurn={handleExecuteTurn}
          onDiceRollComplete={handleDiceRollComplete}
        />
      ) : (
        <div style={{color: '#FFD700', textAlign: 'center', marginTop: 40}}>Завантаження ігрового поля...</div>
      )}
      {/* Ліва бічна панель — окремий компонент */}
      <button
        className={`sidebar-toggle left ${leftSidebarOpen ? 'active' : ''}`}
        onClick={handleLeftSidebarToggle}
        title={leftSidebarOpen ? 'Сховати панель' : 'Відкрити: Ваші дії + Фінанси'}
      >
        <span className="toggle-arrow">{leftSidebarOpen ? '◀' : '▶'}</span>
        <span className="toggle-label">{leftSidebarOpen ? 'Закрити' : '📊 Дії'}</span>
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
          onToggle={handleLeftSidebarToggle}
        />
      )}
      {/* Права бічна панель — окремий компонент */}
      <button
        className={`sidebar-toggle right ${rightSidebarOpen ? 'active' : ''}`}
        onClick={handleRightSidebarToggle}
        title={rightSidebarOpen ? 'Сховати Game Hub' : 'Відкрити: Угоди + Інфо'}
      >
        <span className="toggle-arrow">{rightSidebarOpen ? '▶' : '◀'}</span>
        <span className="toggle-label">{rightSidebarOpen ? 'Закрити' : '🎲 Угоди'}</span>
      </button>
      {game && (
        <RightSidebar
          open={rightSidebarOpen}
          playerId={playerId}
          onToggle={handleRightSidebarToggle}
        />
      )}
      
      {/* Картка події */}
      <EventCard
        card={currentEventCard}
        show={showEventCard}
        onAction={handleEventCardAction}
      />

      {/* ❤️ Charity bonus indicator — кубики x2 */}
      {charityTurnsLeft > 0 && (
        <div style={{
          position: 'fixed', top: 70, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(233,30,99,0.9)', color: '#fff', borderRadius: 20,
          padding: '6px 16px', fontSize: 13, fontWeight: 700, zIndex: 900,
          pointerEvents: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
        }}>
          ❤️ Кубики ×2 ще {charityTurnsLeft} {charityTurnsLeft === 1 ? 'хід' : 'ходи'}
        </div>
      )}

      {/* 🏗️ Аукціон великих угод — показується всім гравцям */}
      <AuctionModal
        show={showAuctionModal}
        auction={currentAuction}
        playerId={playerId}
        playerCash={currentPlayer?.finances?.cash || 0}
        players={game?.players?.map(p => ({ id: p.id, name: p.name })) || []}
        onBid={handleBid}
        onPass={handlePassBid}
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
      {/* MobileNavigation removed — LeftSidebar/RightSidebar handle all platforms */}

      {/* 🔧 Debug overlay — завжди доступний (Ctrl+Shift+D або кнопка 🔧) */}
      <MechanicsDebugOverlay />

      {/* Екран перемоги */}
      {isWon && currentPlayer && (
        <WinScreen
          winnerName={currentPlayer.name}
          dreamTitle={(currentPlayer as any).dream?.title || 'Фінансова свобода'}
          dreamCost={(currentPlayer as any).dream?.estimatedCost || 0}
          finalCash={currentPlayer.finances.cash}
          onBackToLobby={() => window.location.reload()}
        />
      )}
    </div>
  );
};

export default GameInterface;
