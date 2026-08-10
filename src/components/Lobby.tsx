/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Player, PublicRoomInfo } from '../types';
import { 
  PlusCircle, 
  UserPlus, 
  Users, 
  Sparkles, 
  Bot, 
  Check, 
  Copy, 
  Play,
  Briefcase,
  AlertCircle,
  Share2,
  RefreshCw,
  Radio,
  ExternalLink,
  Link as LinkIcon
} from 'lucide-react';

interface LobbyProps {
  players: Player[];
  roomId: string | null;
  playerId: string | null;
  onJoinRoom: (roomId: string, name: string) => void;
  onCreateRoom: (name: string) => void;
  onAddBot: () => void;
  onToggleReady: (ready: boolean) => void;
  onStartGame: () => void;
  error: string | null;
  onStartSoloGame?: (name: string) => void;
  publicRooms?: PublicRoomInfo[];
  onRefreshPublicRooms?: () => void;
  initialRoomCode?: string;
}

export default function Lobby({
  players,
  roomId,
  playerId,
  onJoinRoom,
  onCreateRoom,
  onAddBot,
  onToggleReady,
  onStartGame,
  error,
  onStartSoloGame,
  publicRooms = [],
  onRefreshPublicRooms,
  initialRoomCode = ''
}: LobbyProps) {
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState(initialRoomCode || '');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Sync initialRoomCode if set via URL deep link
  useEffect(() => {
    if (initialRoomCode) {
      setRoomCode(initialRoomCode.toUpperCase());
    }
  }, [initialRoomCode]);

  const me = players.find(p => p.id === playerId);
  const isHost = players[0]?.id === playerId;

  const getDirectRoomUrl = () => {
    if (!roomId) return '';
    const url = new URL(window.location.href);
    url.searchParams.set('room', roomId);
    return url.toString();
  };

  const handleCopyCode = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCopyLink = () => {
    const directUrl = getDirectRoomUrl();
    if (directUrl) {
      navigator.clipboard.writeText(directUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleShare = async () => {
    const directUrl = getDirectRoomUrl();
    if (navigator.share && directUrl) {
      try {
        setIsSharing(true);
        await navigator.share({
          title: 'CashFlow Україна — Фінансова Гра',
          text: `Приєднуйся до моєї гри в CashFlow (Кімната ${roomId})!`,
          url: directUrl,
        });
      } catch (err) {
        // User cancelled or share failed, fallback to copy link
        handleCopyLink();
      } finally {
        setIsSharing(false);
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreateRoom(name.trim());
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && roomCode.trim()) {
      onJoinRoom(roomCode.trim(), name.trim());
    }
  };

  const handleQuickJoin = (targetRoomId: string) => {
    setRoomCode(targetRoomId.toUpperCase());
    if (name.trim()) {
      onJoinRoom(targetRoomId.toUpperCase(), name.trim());
    }
  };

  return (
    <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      {/* Visual top accent */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 via-indigo-500 to-amber-500" />
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl" />
      
      {/* Title */}
      <div className="text-center mb-8 select-none">
        <h1 className="text-3xl font-black text-white font-sans tracking-tight">
          CASH<span className="text-emerald-400">FLOW</span>
        </h1>
        <div className="text-[10px] font-bold tracking-widest text-yellow-500 font-mono uppercase bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-full inline-block mt-1">
          Українські перегони
        </div>
        <p className="text-xs text-slate-400 mt-3 leading-relaxed">
          Мультиплеєрна фінансова гра за мотивами Роберта Кіосакі. Сплачуйте борги, купуйте активи та виходьте у Велике Коло!
        </p>
      </div>

      {error && (
        <div className="bg-rose-950/80 border border-rose-900 text-rose-300 text-xs p-3.5 rounded-xl mb-6 font-medium leading-relaxed flex items-center gap-1.5 animate-shake">
          <AlertCircle className="w-4 h-4 text-rose-300 flex-shrink-0" /> {error}
        </div>
      )}

      {/* STAGE 1: ENTER NICKNAME & CREATE/JOIN */}
      {!roomId ? (
        <div className="space-y-6">
          {/* Direct link badge if prefilled from URL */}
          {initialRoomCode && (
            <div className="bg-indigo-950/70 border border-indigo-800/80 rounded-xl p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-indigo-200">
                <LinkIcon className="w-4 h-4 text-indigo-400 flex-shrink-0 animate-bounce" />
                <span>Запрошення в кімнату: <strong className="font-mono text-white text-sm">{initialRoomCode}</strong></span>
              </div>
            </div>
          )}

          {/* Nickname input */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ваше ім'я (Нікнейм)</label>
            <input
              type="text"
              placeholder="Козак Олександр"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-indigo-500 transition-all font-sans"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 pt-4 border-t border-slate-800/60">
            {/* Create Room Form */}
            <form onSubmit={handleCreate} className="space-y-3">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-emerald-400" /> Створити нову гру
              </h3>
              <button
                type="submit"
                disabled={!name.trim()}
                className={`w-full font-bold text-xs py-3 px-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${
                  name.trim() 
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/10 active:scale-95' 
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                Створити віртуальну кімнату
              </button>
            </form>

            {/* Solo Game vs AI Option */}
            {onStartSoloGame && (
              <div className="space-y-3 border-t border-slate-800/40 pt-4">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-amber-500" /> Тестовий соло-режим з AI
                </h3>
                <button
                  type="button"
                  onClick={() => onStartSoloGame(name.trim() || 'Козак Олександр')}
                  className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 active:scale-95 text-slate-950 font-black text-xs py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 animate-pulse text-slate-950" />
                  Грати соло проти 3-х AI Ботов
                </button>
                <p className="text-[10px] text-slate-500 text-center leading-normal">
                  Миттєвий запуск: автоматично створить гру, додасть 3-х опонентів-роботів та почне хід!
                </p>
              </div>
            )}

            {/* Join Room Form */}
            <form onSubmit={handleJoin} className="space-y-3 border-t border-slate-800/40 pt-4">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-indigo-400" /> Приєднатися за кодом кімнати
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="КОД КІМНАТИ"
                  maxLength={4}
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="w-1/2 bg-slate-950 border border-slate-800 text-white rounded-xl py-3 px-4 text-center font-mono text-sm tracking-widest focus:outline-none focus:border-indigo-500 uppercase"
                />
                <button
                  type="submit"
                  disabled={!name.trim() || roomCode.length < 4}
                  className={`w-1/2 font-bold text-xs py-3 px-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-1.5 ${
                    name.trim() && roomCode.length === 4
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/10 active:scale-95'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Увійти в гру
                </button>
              </div>
            </form>

            {/* ACTIVE ROOMS LIST SECTION */}
            <div className="space-y-3 border-t border-slate-800/40 pt-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> Активні кімнати у мережі ({publicRooms.length})
                </h3>
                {onRefreshPublicRooms && (
                  <button
                    onClick={onRefreshPublicRooms}
                    className="p-1 text-slate-400 hover:text-white transition-colors"
                    title="Оновити список кімнат"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {publicRooms.length === 0 ? (
                <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-4 text-center">
                  <p className="text-xs text-slate-500">Немає доступних відкритих кімнат.</p>
                  <p className="text-[10px] text-slate-600 mt-1">Створіть першу кімнату або зачекайте інших гравців!</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {publicRooms.map((r) => (
                    <div
                      key={r.roomId}
                      className="bg-slate-950 border border-slate-800/80 hover:border-indigo-500/50 p-2.5 rounded-xl flex items-center justify-between text-xs transition-all"
                    >
                      <div className="truncate max-w-[60%]">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-indigo-300 text-xs">{r.roomId}</span>
                          <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-mono">
                            {r.playerCount}/{r.maxPlayers}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          Хост: <strong className="text-slate-200">{r.hostName}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {r.status === 'LOBBY' ? (
                          <span className="text-[9px] bg-emerald-950/80 text-emerald-400 border border-emerald-900 px-1.5 py-0.5 rounded font-semibold uppercase">
                            Набір
                          </span>
                        ) : (
                          <span className="text-[9px] bg-indigo-950/80 text-indigo-300 border border-indigo-900 px-1.5 py-0.5 rounded font-semibold uppercase">
                            В грі
                          </span>
                        )}

                        <button
                          onClick={() => handleQuickJoin(r.roomId)}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg active:scale-95 transition-all"
                        >
                          Увійти
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* STAGE 2: INSIDE ROOM LOBBY */
        <div className="space-y-6">
          {/* Room code & link sharing banner */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-mono font-bold">Код кімнати</span>
                <span className="text-2xl font-black text-white font-mono tracking-widest uppercase">{roomId}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyCode}
                  className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl active:scale-95 transition-all flex items-center gap-1 text-xs font-semibold"
                  title="Скопіювати лише код"
                >
                  {copiedCode ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-slate-400" />
                  )}
                  <span className="hidden sm:inline">Код</span>
                </button>

                <button
                  onClick={handleShare}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl active:scale-95 transition-all flex items-center gap-1.5 text-xs font-bold shadow-lg shadow-indigo-500/20"
                  title="Поділитися посиланням на кімнату"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Поділитися</span>
                </button>
              </div>
            </div>

            {/* Direct Link input box */}
            <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800/80 rounded-xl p-2">
              <span className="text-[10px] text-slate-500 font-mono truncate flex-1 px-1 select-all">
                {getDirectRoomUrl()}
              </span>
              <button
                onClick={handleCopyLink}
                className="text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-lg transition-colors flex items-center gap-1 flex-shrink-0"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" /> Скопійовано!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-slate-400" /> Скопіювати лінк
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Connected players list */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-slate-500" /> Гравці в мережі ({players.length})
              </h3>
              {isHost && (
                <button
                  onClick={onAddBot}
                  className="bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-900 font-bold text-[10px] px-2 py-1 rounded flex items-center gap-1 transition-all"
                >
                  <Bot className="w-3.5 h-3.5" /> Додати бота
                </button>
              )}
            </div>
            
            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
              {players.map((p, idx) => (
                <div 
                  key={p.id} 
                  className="bg-slate-950 border border-slate-800/60 p-2.5 rounded-xl flex justify-between items-center text-xs"
                >
                  <div className="flex items-center gap-2.5 truncate max-w-[70%]">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                    <div className="truncate">
                      <span className="font-bold text-slate-100 flex items-center gap-1 truncate">
                        {p.name} {p.isBot && <Bot className="w-3.5 h-3.5 text-slate-400 inline" />}
                      </span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-slate-600" />
                        {p.career.name}
                      </span>
                    </div>
                  </div>
                  <div>
                    {p.ready ? (
                      <span className="bg-emerald-950 text-emerald-400 border border-emerald-900 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                        Готовий
                      </span>
                    ) : (
                      <span className="bg-slate-900 text-slate-500 border border-slate-800 text-[10px] px-2 py-0.5 rounded font-semibold uppercase">
                        В очікуванні
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="border-t border-slate-800 pt-6 mt-6 space-y-3">
            {/* Ready status checkbox for normal users */}
            {me && !me.isBot && (
              <label className="flex items-center gap-3 cursor-pointer select-none bg-slate-950/60 hover:bg-slate-950 p-3 rounded-xl border border-slate-800/60 transition-all">
                <input
                  type="checkbox"
                  checked={me.ready}
                  onChange={(e) => onToggleReady(e.target.checked)}
                  className="w-4.5 h-4.5 bg-slate-950 border-slate-800 text-indigo-600 rounded focus:ring-0 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-slate-200 block">Я готовий до гри</span>
                  <span className="text-[10px] text-slate-500">Позначте готовність для запуску</span>
                </div>
              </label>
            )}

            {/* Launch button for host */}
            {isHost && (
              <button
                onClick={onStartGame}
                disabled={players.some(p => !p.ready)}
                className={`w-full font-black text-xs py-3.5 px-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${
                  players.some(p => !p.ready)
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20 active:scale-95 animate-pulse'
                }`}
              >
                <Play className="w-4 h-4 fill-white" /> РОЗПОЧАТИ УКРАЇНСЬКІ ПЕРЕГОНИ
              </button>
            )}

            {!isHost && (
              <p className="text-[11px] text-slate-500 text-center italic">
                Очікування запуску гри хостом ({players[0]?.name || 'Ніхто'}) після готовності всіх гравців.
              </p>
            )}
          </div>

          {/* ACTIVE ROOMS DIRECTORY IN STAGE 2 */}
          <div className="border-t border-slate-800/60 pt-4 mt-6 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> Публічний список кімнат ({publicRooms.length})
              </h3>
              {onRefreshPublicRooms && (
                <button
                  onClick={onRefreshPublicRooms}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                  title="Оновити список кімнат"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
              {publicRooms.map((r) => {
                const isCurrentRoom = r.roomId === roomId;
                return (
                  <div
                    key={r.roomId}
                    className={`p-2.5 rounded-xl flex items-center justify-between text-xs transition-all border ${
                      isCurrentRoom
                        ? 'bg-indigo-950/40 border-indigo-500/80'
                        : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="truncate max-w-[65%]">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-indigo-300 text-xs">{r.roomId}</span>
                        {isCurrentRoom && (
                          <span className="text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-1.5 py-0.2 rounded font-bold">
                            Ваша кімната ⭐️
                          </span>
                        )}
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-mono">
                          {r.playerCount}/{r.maxPlayers}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        Хост: <strong className="text-slate-200">{r.hostName}</strong>
                      </p>
                    </div>

                    <div>
                      {isCurrentRoom ? (
                        <span className="text-[9px] bg-emerald-950/80 text-emerald-400 border border-emerald-900 px-2 py-1 rounded font-bold uppercase">
                          Активна
                        </span>
                      ) : (
                        <button
                          onClick={() => handleQuickJoin(r.roomId)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[10px] px-2.5 py-1 rounded-lg active:scale-95 transition-all"
                        >
                          Перейти
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

