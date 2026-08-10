/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import { GameState, Player, ChatMessage, PublicRoomInfo } from './types';
import Lobby from './components/Lobby';
import BoardView from './components/BoardView';
import BalanceSheetView from './components/BalanceSheetView';
import AIAdvisorView from './components/AIAdvisorView';
import ActiveCardView from './components/ActiveCardView';
import GameLogsModal from './components/GameLogsModal';
import PlayersModal from './components/PlayersModal';
import LiveChatWidget from './components/LiveChatWidget';
import { 
  Dice5, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  ArrowRight, 
  Coins, 
  HelpCircle, 
  User, 
  LogOut, 
  RefreshCw,
  Clock,
  Heart,
  CalendarDays,
  UserCheck2,
  FileCheck2,
  ChevronDown,
  ChevronUp,
  FileText,
  X,
  Maximize2,
  History,
  Users,
  Menu,
  Zap,
  Award,
  Handshake
} from 'lucide-react';

export default function App() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [diceCount, setDiceCount] = useState<number>(1);
  const [reconnecting, setReconnecting] = useState(false);
  const [isTurnControlCollapsed, setIsTurnControlCollapsed] = useState(false);
  const [showBalanceSheet, setShowBalanceSheet] = useState(false);
  const [showAIAdvisor, setShowAIAdvisor] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [showPlayersModal, setShowPlayersModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [publicRooms, setPublicRooms] = useState<PublicRoomInfo[]>([]);
  const [initialRoomCode, setInitialRoomCode] = useState<string>('');

  const logContainerRef = useRef<HTMLDivElement>(null);
  const autoStartSoloRef = useRef(false);
  const roomIdRef = useRef<string | null>(null);
  const playerIdRef = useRef<string | null>(null);

  // Read URL query parameter ?room=CODE on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setInitialRoomCode(roomParam.trim().toUpperCase());
    }
  }, []);

  // Fetch active public rooms periodically
  const fetchPublicRooms = () => {
    fetch('/api/rooms/public')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPublicRooms(data);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchPublicRooms();
    const interval = setInterval(() => {
      fetchPublicRooms();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Sync state to refs for non-reactive/event callback access
  useEffect(() => {
    roomIdRef.current = roomId;
  }, [roomId]);

  useEffect(() => {
    playerIdRef.current = playerId;
  }, [playerId]);

  // Auto scroll logs container internally when new logs arrive (without jumping the page window)
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [gameState?.logs?.length]);

  // Establish WebSocket connection
  useEffect(() => {
    let ws: WebSocket;
    
    function connect() {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProtocol}//${window.location.host}`;
      
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setConnected(true);
        setReconnecting(false);
        setError(null);
        // If we already have a room in memory (e.g. from a reconnection), let's re-associate
        if (roomIdRef.current && playerIdRef.current) {
          ws.send(JSON.stringify({
            type: 'READY_PLAYER',
            roomId: roomIdRef.current,
            playerId: playerIdRef.current,
            payload: { ready: false } // Trigger state sync / update
          }));
        }
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        const { type, payload } = message;

        if (type === 'ROOM_CREATED') {
          setRoomId(payload.roomId);
          setPlayerId(payload.playerId);
          
          // Update URL for direct link sharing
          const url = new URL(window.location.href);
          url.searchParams.set('room', payload.roomId);
          window.history.pushState({}, '', url.toString());

          fetchPublicRooms();

          if (autoStartSoloRef.current) {
            // Automatically add 3 bots with immediate association
            setTimeout(() => {
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                  type: 'ADD_BOT',
                  roomId: payload.roomId,
                  playerId: payload.playerId
                }));
              }
            }, 100);
            setTimeout(() => {
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                  type: 'ADD_BOT',
                  roomId: payload.roomId,
                  playerId: payload.playerId
                }));
              }
            }, 250);
            setTimeout(() => {
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                  type: 'ADD_BOT',
                  roomId: payload.roomId,
                  playerId: payload.playerId
                }));
              }
            }, 400);
            
            // Mark ourselves as ready
            setTimeout(() => {
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                  type: 'READY_PLAYER',
                  roomId: payload.roomId,
                  playerId: payload.playerId,
                  payload: { ready: true },
                }));
              }
            }, 550);
            
            // Start the game!
            setTimeout(() => {
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                  type: 'START_GAME',
                  roomId: payload.roomId,
                  playerId: payload.playerId
                }));
                autoStartSoloRef.current = false;
              }
            }, 750);
          }
        } else if (type === 'JOINED_SUCCESS') {
          setRoomId(payload.roomId);
          setPlayerId(payload.playerId);
          
          // Update URL for direct link sharing
          const url = new URL(window.location.href);
          url.searchParams.set('room', payload.roomId);
          window.history.pushState({}, '', url.toString());
        } else if (type === 'ROOM_UPDATE') {
          setGameState(payload);
        } else if (type === 'NEW_CHAT_MESSAGE') {
          setChatMessages((prev) => [...prev, payload]);
        } else if (type === 'ERROR') {
          setError(payload);
        }
      };

      ws.onclose = () => {
        setConnected(false);
        // Attempt reconnect if we were in a room
        if (roomIdRef.current) {
          setReconnecting(true);
          setTimeout(() => connect(), 3000);
        }
      };

      setSocket(ws);
    }

    connect();

    return () => {
      if (ws) ws.close();
    };
  }, []);

  const sendMessage = (type: string, payload?: any) => {
    if (socket && connected) {
      socket.send(JSON.stringify({
        type,
        roomId,
        playerId,
        payload,
      }));
    }
  };

  const handleSendChatMessage = (text: string, mediaType: 'text' | 'audio' = 'text', audioUrl?: string) => {
    const myPlayer = gameState?.players?.find((p) => p.id === playerId);
    if (myPlayer) {
      sendMessage('CHAT_MESSAGE', {
        senderId: myPlayer.id,
        senderName: myPlayer.name,
        senderColor: myPlayer.color,
        isBot: false,
        text,
        mediaType,
        audioUrl,
      });
    }
  };

  const handleSimulateBotMessage = () => {
    const bots = gameState?.players?.filter((p) => p.isBot) || [];
    if (bots.length === 0) return;
    const bot = bots[Math.floor(Math.random() * bots.length)];
    const testPhrases = [
      "Привіт усім! Я ввімкнув мікрофон, мене добре чути? 🎤",
      "Який чудовий день для інвестицій в ОВДП та нерухомість! 💰",
      "Український бізнес швидко розвивається! 📈",
      "Хтось продає нерухомість чи бізнес у цій кімнаті? 🏠",
      "Задонатив на ЗСУ — тепер роблю потужний хід 2 кубиками! 🎲🎲",
      "Перевіряйте свій Пасивний Дохід, перегони тривають! 🚀"
    ];
    const phrase = testPhrases[Math.floor(Math.random() * testPhrases.length)];
    
    sendMessage('CHAT_MESSAGE', {
      senderId: bot.id,
      senderName: bot.name,
      senderColor: bot.color,
      isBot: true,
      text: phrase,
      mediaType: Math.random() > 0.4 ? 'text' : 'audio',
    });
  };

  // Actions
  const handleCreateRoom = (playerName: string) => {
    if (socket && connected) {
      socket.send(JSON.stringify({
        type: 'CREATE_ROOM',
        payload: { playerName },
      }));
    }
  };

  const handleStartSoloGame = (playerName: string) => {
    if (socket && connected) {
      autoStartSoloRef.current = true;
      socket.send(JSON.stringify({
        type: 'CREATE_ROOM',
        payload: { playerName },
      }));
    }
  };

  const handleJoinRoom = (roomIdToJoin: string, playerName: string) => {
    if (socket && connected) {
      socket.send(JSON.stringify({
        type: 'JOIN_ROOM',
        payload: { roomId: roomIdToJoin, playerName },
      }));
    }
  };

  const handleAddBot = () => {
    sendMessage('ADD_BOT');
  };

  const handleToggleReady = (ready: boolean) => {
    sendMessage('READY_PLAYER', { ready });
  };

  const handleStartGame = () => {
    sendMessage('START_GAME');
  };

  const handleRollDice = () => {
    sendMessage('ROLL_DICE', { count: diceCount });
  };

  const handleSelectDeal = (dealType: 'SMALL' | 'BIG') => {
    sendMessage('CHOOSE_DEAL_TYPE', { dealType });
  };

  const handleBuyAsset = () => {
    sendMessage('BUY_ASSET');
  };

  const handleDeclineCard = () => {
    sendMessage('DECLINE_CARD');
  };

  const handleResolveCard = () => {
    sendMessage('RESOLVE_CARD');
  };

  const handleCharityDecision = (accepted: boolean) => {
    sendMessage('CHARITY_DECISION', { accepted });
  };

  const handleBorrow = (amount: number) => {
    sendMessage('BORROW_MONEY', { amount });
  };

  const handlePayDebt = (liabilityId: string) => {
    sendMessage('PAY_DEBT', { liabilityId });
  };

  const handleSellAsset = (assetId: string) => {
    sendMessage('SELL_ASSET_TO_MARKET', { assetId });
  };

  const handleRefreshAdvice = () => {
    sendMessage('GET_AI_ADVICE');
  };

  const handleTriggerMarket = () => {
    sendMessage('TRIGGER_MARKET_CARD');
  };

  const handleQuit = () => {
    setRoomId(null);
    setGameState(null);
    setPlayerId(null);
    setError(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('room');
    window.history.pushState({}, '', url.pathname);
    fetchPublicRooms();
  };

  // Derived state
  const myPlayer = gameState?.players ? gameState.players.find(p => p.id === playerId) : undefined;
  const activePlayer = (gameState?.players && gameState.currentTurnIndex !== undefined) ? gameState.players[gameState.currentTurnIndex] : undefined;
  const isMyTurn = activePlayer?.id === playerId;
  const isLobby = !gameState || gameState.status === 'LOBBY';

  // Get current active player assets and liabilities
  const myAssets = (gameState?.playerAssets && playerId) ? (gameState.playerAssets[playerId] || []) : [];
  const myLiabilities = (gameState?.playerLiabilities && playerId) ? (gameState.playerLiabilities[playerId] || []) : [];
  const activePlayerAssets = (gameState?.playerAssets && activePlayer) ? (gameState.playerAssets[activePlayer.id] || []) : [];
  const activePlayerLiabilities = (gameState?.playerLiabilities && activePlayer) ? (gameState.playerLiabilities[activePlayer.id] || []) : [];

  const myAdvice = (gameState?.aiAdvisorTips && playerId) ? (gameState.aiAdvisorTips[playerId] || null) : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 sm:p-6 md:p-8">
      {/* Network status overlay */}
      {reconnecting && (
        <div className="fixed inset-0 bg-slate-950/90 flex flex-col items-center justify-center z-50 p-4 text-center">
          <div className="w-12 h-12 border-4 border-slate-800 border-t-yellow-500 rounded-full animate-spin mb-4" />
          <h2 className="text-lg font-bold text-white">Втрачено зв'язок із сервером...</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
            Намагаємося відновити підключення до кімнати гри. Зачекайте декілька секунд.
          </p>
        </div>
      )}

      {/* STAGE 1: LOBBY & SETUP */}
      {isLobby ? (
        <div className="py-12 flex flex-col items-center justify-center">
          <Lobby
            players={gameState?.players || []}
            roomId={roomId}
            playerId={playerId}
            onJoinRoom={handleJoinRoom}
            onCreateRoom={handleCreateRoom}
            onAddBot={handleAddBot}
            onToggleReady={handleToggleReady}
            onStartGame={handleStartGame}
            error={error}
            onStartSoloGame={handleStartSoloGame}
            publicRooms={publicRooms}
            onRefreshPublicRooms={fetchPublicRooms}
            initialRoomCode={initialRoomCode}
          />
        </div>
      ) : (
        /* STAGE 2: IN-GAME WORKSPACE */
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Header Dashboard with Burger Menu */}
          <header className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 sm:p-5 flex items-center justify-between gap-3 shadow-xl relative z-40">
            {/* Logo & Room Badge */}
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-slate-800 rounded-xl border border-slate-700 select-none">
                <span className="text-lg font-black text-slate-200 font-sans">₴</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-base font-black text-white font-sans tracking-tight leading-none">
                    CASHFLOW <span className="text-slate-300">УКРАЇНА</span>
                  </h1>
                  <span className="text-[10px] bg-slate-800 border border-slate-700 text-slate-400 font-bold px-2 py-0.5 rounded-full font-mono hidden xs:inline-block">
                    КІМНАТА: {roomId}
                  </span>
                </div>
              </div>
            </div>

            {/* Dynamic Active Player Turn Indicator */}
            <button
              onClick={() => setShowPlayersModal(true)}
              className="px-3 py-1.5 sm:px-3.5 sm:py-2 bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700/80 rounded-xl transition-all text-xs font-bold flex items-center gap-2 shadow-md shadow-slate-950/40 active:scale-95 cursor-pointer min-h-[38px] sm:min-h-[42px]"
              aria-label="Гравці та хід гри"
            >
              <div className="flex items-center gap-1.5">
                <span 
                  className="w-2.5 h-2.5 rounded-full border border-white/20 shadow-sm" 
                  style={{ backgroundColor: activePlayer?.color || '#818cf8' }} 
                />
                <span className="text-slate-400 font-normal hidden md:inline">Зараз ходить:</span>
                <strong className="text-white font-bold">{activePlayer?.name || '---'}</strong>
                <Clock className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
              </div>

              {/* Player count indicator badge */}
              <div className="flex items-center gap-1 pl-1.5 border-l border-slate-700/80">
                <Users className="w-3.5 h-3.5 text-slate-300" />
                <span className="bg-slate-900 text-slate-300 text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold border border-slate-700">
                  {gameState?.players?.length || 0}
                </span>
              </div>
            </button>

            {/* Desktop Action Buttons Bar (Hidden on Mobile) */}
            {myPlayer && (
              <div className="hidden lg:flex items-center gap-2">
                {/* Events History Button */}
                <button
                  onClick={() => setShowLogsModal(true)}
                  className="p-2.5 px-3 bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700/80 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-slate-950/20 active:scale-95 cursor-pointer min-h-[42px]"
                  title="Історія подій"
                >
                  <History className="w-4 h-4 text-slate-300" />
                  <span className="text-xs font-bold">Події</span>
                  <span className="bg-slate-900 text-slate-300 text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold border border-slate-700">
                    {gameState?.logs?.length || 0}
                  </span>
                </button>

                {/* Financial Report Button */}
                <button
                  onClick={() => setShowBalanceSheet(true)}
                  className="p-2.5 px-3 bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700/80 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-slate-950/20 active:scale-95 cursor-pointer min-h-[42px]"
                  title="Фінансовий звіт"
                >
                  <FileText className="w-4 h-4 text-slate-300" />
                  <span className="text-xs font-bold">Звіт</span>
                  <span className="bg-slate-900 text-slate-300 text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold border border-slate-700">
                    {myPlayer.cash.toLocaleString('uk-UA')} ₴
                  </span>
                </button>

                {/* AI Advisor Button */}
                <button
                  onClick={() => setShowAIAdvisor(true)}
                  className="p-2.5 px-3 bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700/80 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-slate-950/20 active:scale-95 cursor-pointer min-h-[42px]"
                  title="AI Ведучий"
                >
                  <Sparkles className="w-4 h-4 text-slate-300" />
                  <span className="text-xs font-bold">AI Поради</span>
                  {myAdvice && (
                    <span className="bg-slate-900 text-slate-300 text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold border border-slate-700">
                      {myAdvice.overallScore}
                    </span>
                  )}
                </button>

                {/* Exit Game Button */}
                <button
                  onClick={handleQuit}
                  className="p-2.5 bg-slate-800/90 hover:bg-slate-700/90 text-slate-300 hover:text-slate-100 border border-slate-700/80 rounded-xl transition-all flex items-center justify-center active:scale-95 cursor-pointer min-w-[42px] min-h-[42px]"
                  title="Вийти з гри"
                >
                  <LogOut className="w-4 h-4 text-slate-300" />
                </button>
              </div>
            )}

            {/* Mobile / Tablet Burger Menu Toggle (Shown on screens < lg) */}
            <div className="relative lg:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-2 sm:p-2.5 rounded-xl border transition-all flex items-center justify-center cursor-pointer min-w-[38px] sm:min-w-[42px] min-h-[38px] sm:min-h-[42px] active:scale-95 ${
                  isMenuOpen
                    ? 'bg-slate-700 text-white border-slate-600 shadow-lg'
                    : 'bg-slate-950 hover:bg-slate-800 text-slate-200 border-slate-800'
                }`}
                aria-label="Головне меню"
              >
                {isMenuOpen ? <X className="w-5 h-5 text-slate-300" /> : <Menu className="w-5 h-5 text-slate-300" />}
              </button>

              {/* BURGER MENU DROPDOWN - Safely constrained for mobile screens */}
              {isMenuOpen && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs" 
                    onClick={() => setIsMenuOpen(false)} 
                  />

                  {/* Slide-down Dropdown (fixed/aligned to screen margin so it never overflows) */}
                  <div className="absolute top-full right-0 mt-2.5 w-[calc(100vw-2rem)] max-w-[280px] sm:w-72 bg-slate-900/98 border border-slate-700/90 rounded-2xl shadow-2xl p-2 z-50 animate-fade-in backdrop-blur-xl">
                    <div className="text-[10px] uppercase font-bold text-slate-400 px-3 py-2 tracking-wider border-b border-slate-800/80 mb-1 flex justify-between items-center">
                      <span>Меню гри</span>
                      <span className="font-mono text-slate-500 text-[9px]">{roomId}</span>
                    </div>

                    {/* Financial Report */}
                    {myPlayer && (
                      <button
                        onClick={() => { setShowBalanceSheet(true); setIsMenuOpen(false); }}
                        className="w-full flex items-center justify-between p-2.5 hover:bg-slate-800/80 text-slate-200 hover:text-white rounded-xl transition-all text-xs font-bold group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 bg-slate-800 text-slate-300 rounded-lg border border-slate-700">
                            <FileText className="w-4 h-4" />
                          </div>
                          <span>Фінансовий звіт</span>
                        </div>
                        <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono text-[10px] border border-slate-700">
                          {myPlayer.cash.toLocaleString('uk-UA')} ₴
                        </span>
                      </button>
                    )}

                    {/* Game Logs History */}
                    <button
                      onClick={() => { setShowLogsModal(true); setIsMenuOpen(false); }}
                      className="w-full flex items-center justify-between p-2.5 hover:bg-slate-800/80 text-slate-200 hover:text-white rounded-xl transition-all text-xs font-bold group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-slate-800 text-slate-300 rounded-lg border border-slate-700">
                          <History className="w-4 h-4" />
                        </div>
                        <span>Історія подій</span>
                      </div>
                      <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono text-[10px] border border-slate-700">
                        {gameState?.logs?.length || 0}
                      </span>
                    </button>

                    {/* AI Advisor */}
                    <button
                      onClick={() => { setShowAIAdvisor(true); setIsMenuOpen(false); }}
                      className="w-full flex items-center justify-between p-2.5 hover:bg-slate-800/80 text-slate-200 hover:text-white rounded-xl transition-all text-xs font-bold group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-slate-800 text-slate-300 rounded-lg border border-slate-700">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <span>AI Ведучий & Поради</span>
                      </div>
                      {myAdvice && (
                        <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono text-[10px] border border-slate-700">
                          {myAdvice.overallScore}/100
                        </span>
                      )}
                    </button>

                    {/* Players List */}
                    <button
                      onClick={() => { setShowPlayersModal(true); setIsMenuOpen(false); }}
                      className="w-full flex items-center justify-between p-2.5 hover:bg-slate-800/80 text-slate-200 hover:text-white rounded-xl transition-all text-xs font-bold group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-slate-800 text-slate-300 rounded-lg border border-slate-700">
                          <Users className="w-4 h-4" />
                        </div>
                        <span>Список усіх гравців</span>
                      </div>
                      <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono text-[10px] border border-slate-700">
                        {gameState?.players?.length || 0}
                      </span>
                    </button>

                    <div className="my-1.5 border-t border-slate-800" />

                    {/* Exit Game */}
                    <button
                      onClick={() => { setIsMenuOpen(false); handleQuit(); }}
                      className="w-full flex items-center justify-between p-2.5 hover:bg-slate-800/80 text-slate-300 hover:text-white rounded-xl transition-all text-xs font-bold group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-slate-800 text-slate-300 rounded-lg border border-slate-700">
                          <LogOut className="w-4 h-4" />
                        </div>
                        <span>Вийти з гри</span>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>
          </header>

          {/* Winner banner overlay */}
          {gameState.winnerId && (
            <div className="bg-gradient-to-r from-slate-800 via-slate-800 to-slate-800 border-2 border-slate-700 rounded-2xl p-6 text-center shadow-xl">
              <Award className="w-10 h-10 text-slate-200 mx-auto" />
              <h2 className="text-2xl font-black text-white mt-2">
                ПЕРЕМОЖЕЦЬ ЗНАЙДЕНИЙ!
              </h2>
              <p className="text-sm text-slate-200 mt-1">
                Гравець <strong className="text-white text-base">{gameState.players.find(p => p.id === gameState.winnerId)?.name}</strong> успішно вийшов з Щурячих перегонів, накопичивши пасивний дохід, що перевищує його щомісячні витрати!
              </p>
              <button 
                onClick={handleQuit}
                className="mt-4 bg-yellow-500 hover:bg-yellow-400 active:scale-95 text-slate-950 font-black text-xs px-6 py-2.5 rounded-xl transition-all shadow-md shadow-yellow-500/20"
              >
                Почати нову гру
              </button>
            </div>
          )}

          {/* MAIN BENTO LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT PANE: BOARD & EVENTS FEED (7 Columns on Large Screens) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Board visualization */}
              <BoardView 
                players={gameState.players} 
                currentPlayerIndex={gameState.currentTurnIndex} 
                latestLog={gameState.logs?.[0]?.message}
              />
            </div>

            {/* RIGHT PANE: ACTIVE CONTROLS & REPORT (5 Columns) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* CURRENT TURN CARD */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl relative transition-all">
                <div 
                  onClick={() => setIsTurnControlCollapsed(!isTurnControlCollapsed)}
                  className="flex justify-between items-center cursor-pointer group select-none border-b border-slate-800 pb-3 mb-4"
                >
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 group-hover:text-white transition-colors">
                    <Zap className="w-4 h-4 text-slate-300" /> Керування Поточним Ходом
                    {isMyTurn ? (
                      <span className="text-[9px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-mono font-bold animate-pulse">
                        ВАШ ХІД
                      </span>
                    ) : (
                      <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
                        Хід: {activePlayer?.name || 'Гравець'}
                      </span>
                    )}
                  </h3>
                  <button 
                    type="button"
                    className="p-1.5 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/50 transition-all text-[11px] flex items-center gap-1"
                  >
                    <span className="text-[10px] text-slate-400">
                      {isTurnControlCollapsed ? 'Розгорнути' : 'Згорнути'}
                    </span>
                    {isTurnControlCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </button>
                </div>

                {!isTurnControlCollapsed && (
                  <>
                    {/* If game is finished */}
                    {gameState.winnerId ? (
                      <div className="text-center py-4">
                        <p className="text-xs text-slate-400">Гра завершена.</p>
                      </div>
                    ) : (
                      <div>
                    {/* User's active turn */}
                    {isMyTurn ? (
                      <div className="space-y-4">
                        {/* Status notification */}
                        <div className="bg-slate-800/90 border border-slate-700 p-3 rounded-xl text-xs flex justify-between items-center text-slate-200">
                          <span className="flex items-center gap-1.5"><ArrowRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" /> <strong>Ваш черговий хід!</strong> Зробіть фінансові дії.</span>
                          <span className="text-[9px] bg-slate-700 text-slate-200 px-2 py-0.5 rounded-md font-bold uppercase font-mono tracking-wider">
                            ACTIVE
                          </span>
                        </div>

                        {/* STEP 1: ROLL DICE */}
                        {!gameState.activeCard ? (
                          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/60 text-center space-y-4">
                            <h4 className="text-xs font-bold text-slate-300 uppercase">Крок 1: Киньте ігрові кубики</h4>
                            
                            {/* If player has charity active */}
                            {myPlayer?.charityTurnsLeft && myPlayer.charityTurnsLeft > 0 ? (
                              <div className="flex flex-col items-center space-y-2 mb-2">
                                <span className="text-[10px] text-blue-400 font-bold bg-blue-950/60 border border-blue-900/40 px-2.5 py-1 rounded-full flex items-center gap-1">
                                  <Heart className="w-3 h-3 fill-blue-400" /> Благодійність активна! (залишилось ходів: {myPlayer.charityTurnsLeft})
                                </span>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setDiceCount(1)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                                      diceCount === 1 
                                        ? 'bg-slate-800 text-white border-slate-600' 
                                        : 'bg-slate-950 text-slate-500 border-slate-900'
                                    }`}
                                  >
                                    1 кубик
                                  </button>
                                  <button
                                    onClick={() => setDiceCount(2)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                                      diceCount === 2 
                                        ? 'bg-slate-800 text-white border-slate-600' 
                                        : 'bg-slate-950 text-slate-500 border-slate-900'
                                    }`}
                                  >
                                    2 кубики
                                  </button>
                                </div>
                              </div>
                            ) : null}

                            <button
                              onClick={handleRollDice}
                              className="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-black text-xs py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
                            >
                              <Dice5 className="w-4 h-4 animate-bounce" />
                              КИДАТИ КУБИК ({diceCount})
                            </button>
                          </div>
                        ) : (
                          /* STEP 2: ACTIVE CARD PANEL (interactive decision required) */
                          <ActiveCardView
                            activeCard={gameState.activeCard}
                            player={myPlayer!}
                            myAssets={myAssets}
                            onSelectDeal={handleSelectDeal}
                            onBuyAsset={handleBuyAsset}
                            onDeclineCard={handleDeclineCard}
                            onResolveCard={handleResolveCard}
                            onCharityDecision={handleCharityDecision}
                            onSellAsset={handleSellAsset}
                            isMyTurn={true}
                          />
                        )}

                        {/* MARKET DUMP TRIGGER (Optional Developer Utility or In-Game trigger) */}
                        <div className="pt-2">
                          <button
                            onClick={handleTriggerMarket}
                            className="w-full bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-850 py-2 rounded-xl transition-all text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1"
                          >
                            <TrendingUp className="w-3.5 h-3.5 text-amber-500" /> Спровокувати оновлення ринку
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Wait state (someone else is rolling) */
                      <div className="space-y-4">
                        <div className="bg-slate-950/60 border border-slate-900 p-4 rounded-xl text-center text-xs">
                          <LoaderMini />
                          <p className="text-slate-400 mt-2 font-medium">
                            Зараз хід гравця <strong className="text-slate-100 font-bold">{activePlayer?.name}</strong>
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Професія: {activePlayer?.career.name} | Клітинка #{activePlayer?.currentPosition}
                          </p>
                        </div>

                        {/* Passive selling opportunities: if a Market card is active, everyone can sell matching properties! */}
                        {gameState.activeCard?.type === 'MARKET' && gameState.activeCard.card?.effectType === 'BUYER' ? (
                          <div className="bg-slate-850 border border-slate-700 p-4 rounded-xl">
                            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 border-b border-slate-700 pb-1.5 mb-2">
                              <Handshake className="w-4 h-4 text-slate-300" /> Спільна Ринкова Пропозиція!
                            </h4>
                            <p className="text-[11px] text-slate-300 mb-3 leading-relaxed">
                              На ринку з'явився покупець на активи: <strong>{gameState.activeCard.card.name}</strong>. Будь-який гравець може продати свій відповідний актив за пропоновану ціну зараз!
                            </p>

                            {/* My matching assets */}
                            {myAssets.length === 0 ? (
                              <p className="text-[10px] text-slate-500 italic">У вас немає відповідних активів для продажу.</p>
                            ) : (
                              <div className="space-y-2">
                                {myAssets.map((asset) => {
                                  const isMatch = (gameState.activeCard?.card?.assetType === asset.type);
                                  if (!isMatch) return null;

                                  const salePrice = gameState.activeCard?.card?.targetPrice || asset.cost;
                                  const payout = salePrice - (asset.mortgage || 0);

                                  return (
                                    <div key={asset.id} className="bg-slate-950 border border-slate-800 rounded-lg p-2 flex justify-between items-center text-xs">
                                      <div>
                                        <h5 className="font-bold text-slate-200">{asset.name}</h5>
                                        <p className="text-[9px] text-slate-500">Виплата: {payout.toLocaleString()} ₴</p>
                                      </div>
                                      <button
                                        onClick={() => handleSellAsset(asset.id)}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[9px] px-2 py-1.5 rounded transition-all"
                                      >
                                        Продати
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                )}
                  </>
                )}
              </div>

              {/* Clean layout - popups accessible via quick actions in top header and event log */}

            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL: BALANCE SHEET / FINANCIAL REPORT */}
      {showBalanceSheet && myPlayer && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in"
          onClick={() => setShowBalanceSheet(false)}
        >
          <div 
            className="max-w-4xl w-full my-auto max-h-[92vh] overflow-y-auto rounded-3xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <BalanceSheetView
              player={myPlayer}
              assets={myAssets}
              liabilities={myLiabilities}
              onBorrow={handleBorrow}
              onPayDebt={handlePayDebt}
              isMyTurn={isMyTurn}
              onClose={() => setShowBalanceSheet(false)}
            />
          </div>
        </div>
      )}

      {/* POPUP MODAL: AI ADVISOR */}
      {showAIAdvisor && myPlayer && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in"
          onClick={() => setShowAIAdvisor(false)}
        >
          <div 
            className="max-w-3xl w-full my-auto max-h-[92vh] overflow-y-auto rounded-3xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <AIAdvisorView
              player={myPlayer}
              advice={myAdvice}
              onRefreshAdvice={handleRefreshAdvice}
              aiThinking={gameState?.aiThinking || false}
              onClose={() => setShowAIAdvisor(false)}
            />
          </div>
        </div>
      )}

      {/* POPUP MODAL: GAME LOGS / EVENTS HISTORY */}
      <GameLogsModal 
        logs={gameState?.logs || []} 
        isOpen={showLogsModal} 
        onClose={() => setShowLogsModal(false)} 
      />

      {/* POPUP MODAL: PLAYERS & GAME STATUS */}
      <PlayersModal 
        players={gameState?.players || []}
        currentTurnIndex={gameState?.currentTurnIndex || 0}
        isOpen={showPlayersModal}
        onClose={() => setShowPlayersModal(false)}
        playerAssets={gameState?.playerAssets}
        playerLiabilities={gameState?.playerLiabilities}
        myPlayerId={playerId || undefined}
      />

      {/* LIVE CHAT & MEDIA WIDGET (AUDIO, VIDEO, TEXT CHAT) */}
      {roomId && (
        <LiveChatWidget
          myPlayer={myPlayer || null}
          players={gameState?.players || []}
          messages={chatMessages}
          onSendMessage={handleSendChatMessage}
          onSimulateBotMessage={handleSimulateBotMessage}
        />
      )}
    </div>
  );
}

function LoaderMini() {
  return (
    <div className="flex justify-center">
      <div className="w-5 h-5 border-2 border-slate-800 border-t-indigo-500 rounded-full animate-spin" />
    </div>
  );
}
