import React from 'react';
import { Player, Asset, Liability } from '../types';
import { X, Users, Clock, Award, TrendingUp, DollarSign, Rocket, AlertCircle, Sparkles, User, Bot, Heart } from 'lucide-react';

interface PlayersModalProps {
  players: Player[];
  currentTurnIndex: number;
  isOpen: boolean;
  onClose: () => void;
  playerAssets?: Record<string, Asset[]>;
  playerLiabilities?: Record<string, Liability[]>;
  myPlayerId?: string;
}

export default function PlayersModal({
  players,
  currentTurnIndex,
  isOpen,
  onClose,
  playerAssets = {},
  playerLiabilities = {},
  myPlayerId
}: PlayersModalProps) {
  if (!isOpen) return null;

  const activePlayer = players[currentTurnIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white font-sans tracking-tight">
                Статус гравців ({players.length})
              </h2>
              <p className="text-xs text-slate-400">
                Зараз ходить: <strong className="text-indigo-300">{activePlayer?.name || '---'}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
            aria-label="Закрити"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - List of Players */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
          {players.map((player, idx) => {
            const isCurrentTurn = idx === currentTurnIndex;
            const isMe = player.id === myPlayerId;
            const assets = playerAssets[player.id] || [];
            const liabilities = playerLiabilities[player.id] || [];

            // Calculate total expenses
            const career = player.career;
            const baseExpenses = career 
              ? (career.taxes + career.rentOrMortgage + career.carPayment + (career.childExpensePerChild * player.childrenCount) + career.otherExpenses)
              : 0;
            const liabilityExpenses = liabilities.reduce((sum, l) => sum + l.monthlyPayment, 0);
            const totalExpenses = baseExpenses + liabilityExpenses;
            
            const totalCashFlow = (career?.salary || 0) + player.passiveIncome - totalExpenses;
            const freedomGoal = totalExpenses;
            const freedomProgress = freedomGoal > 0 ? Math.min(100, Math.round((player.passiveIncome / freedomGoal) * 100)) : 0;

            return (
              <div 
                key={player.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  isCurrentTurn
                    ? 'bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 border-indigo-500/80 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/50'
                    : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Player Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-800/60">
                  <div className="flex items-center gap-2.5">
                    <span 
                      className="w-4 h-4 rounded-full border-2 border-white/20 shadow-sm flex-shrink-0"
                      style={{ backgroundColor: player.color }}
                    />
                    <h3 className="text-base font-bold text-white font-sans flex items-center gap-2">
                      {player.name}
                      {isMe && (
                        <span className="px-2 py-0.5 bg-indigo-950 text-indigo-300 border border-indigo-700/60 rounded-full text-[10px] font-bold uppercase">
                          Ви
                        </span>
                      )}
                      {player.isBot && (
                        <span className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded-full text-[10px] font-bold flex items-center gap-1">
                          <Bot className="w-3 h-3" /> Бот
                        </span>
                      )}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {isCurrentTurn && (
                      <span className="px-2.5 py-1 bg-indigo-600/30 text-indigo-300 border border-indigo-500/60 rounded-xl text-xs font-bold flex items-center gap-1.5 animate-pulse">
                        <Clock className="w-3.5 h-3.5" /> Зараз ходить
                      </span>
                    )}

                    {player.isFastTrack ? (
                      <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center gap-1">
                        <Rocket className="w-3.5 h-3.5 text-amber-400" /> Швидкісна доріжка
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-slate-800/80 text-slate-400 border border-slate-700/60 rounded-xl text-xs font-medium">
                        Щурячі перегони (Кл. #{player.currentPosition + 1})
                      </span>
                    )}

                    {player.layoffTurnsLeft > 0 && (
                      <span className="px-2 py-0.5 bg-rose-950/80 text-rose-300 border border-rose-800 rounded-lg text-[10px] font-bold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-rose-300" /> Звільнений ({player.layoffTurnsLeft} х.)
                      </span>
                    )}

                    {player.charityTurnsLeft > 0 && (
                      <span className="px-2 py-0.5 bg-emerald-950/80 text-emerald-300 border border-emerald-800 rounded-lg text-[10px] font-bold flex items-center gap-1">
                        <Heart className="w-3 h-3 text-emerald-300" /> Благодійність x2
                      </span>
                    )}
                  </div>
                </div>

                {/* Player Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3">
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/60">
                    <span className="text-slate-400 block text-[10px] mb-0.5">Професія</span>
                    <strong className="text-slate-200 font-medium truncate block">
                      {player.career?.name || '---'}
                    </strong>
                  </div>

                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/60">
                    <span className="text-slate-400 block text-[10px] mb-0.5">Готівка</span>
                    <strong className="text-emerald-400 font-mono text-sm block">
                      {player.cash.toLocaleString('uk-UA')} ₴
                    </strong>
                  </div>

                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/60">
                    <span className="text-slate-400 block text-[10px] mb-0.5">Пасивний дохід</span>
                    <strong className="text-indigo-300 font-mono text-sm block">
                      +{player.passiveIncome.toLocaleString('uk-UA')} ₴
                    </strong>
                  </div>

                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/60">
                    <span className="text-slate-400 block text-[10px] mb-0.5">Потік готівки</span>
                    <strong className={`font-mono text-sm block ${totalCashFlow >= 0 ? 'text-emerald-300' : 'text-rose-400'}`}>
                      {totalCashFlow >= 0 ? '+' : ''}{totalCashFlow.toLocaleString('uk-UA')} ₴
                    </strong>
                  </div>
                </div>

                {/* Progress to Financial Freedom */}
                {!player.isFastTrack && (
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Вихід з щурячих перегонів (Пасивний дохід vs Витрати):</span>
                      <span className="font-mono font-bold text-indigo-300">
                        {player.passiveIncome.toLocaleString('uk-UA')} / {freedomGoal.toLocaleString('uk-UA')} ₴ ({freedomProgress}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500 rounded-full"
                        style={{ width: `${freedomProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-all cursor-pointer active:scale-95"
          >
            Закрити
          </button>
        </div>
      </div>
    </div>
  );
}
