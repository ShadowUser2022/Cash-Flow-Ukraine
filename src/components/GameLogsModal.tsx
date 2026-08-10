/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { GameLog } from '../types';
import { 
  History, 
  X, 
  Search, 
  Filter, 
  Dices, 
  Briefcase, 
  AlertTriangle, 
  Flame, 
  Sparkles,
  ArrowDownCircle
} from 'lucide-react';

interface GameLogsModalProps {
  logs: GameLog[];
  isOpen: boolean;
  onClose: () => void;
}

export default function GameLogsModal({ logs, isOpen, onClose }: GameLogsModalProps) {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Type filter
      if (selectedType !== 'ALL' && log.type !== selectedType) {
        return false;
      }
      // Search filter
      if (search.trim()) {
        const query = search.toLowerCase();
        const msgMatches = log.message.toLowerCase().includes(query);
        const nameMatches = log.playerName ? log.playerName.toLowerCase().includes(query) : false;
        return msgMatches || nameMatches;
      }
      return true;
    });
  }, [logs, selectedType, search]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-slate-900 border-b border-slate-800 flex justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-800/80 flex items-center justify-center text-blue-400 flex-shrink-0">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-sans tracking-tight flex items-center gap-2">
                Історія ігрових подій
                <span className="text-[11px] bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full font-mono font-normal">
                  Всього: {logs.length}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Повний лог ходів, угоди, виплати та події гри</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-rose-950/80 hover:text-rose-400 rounded-xl border border-slate-700/50 transition-all cursor-pointer"
            aria-label="Закрити модальне вікно"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800/80 space-y-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Шукати гравця чи подію..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            <button
              onClick={() => setSelectedType('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                selectedType === 'ALL'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Filter className="w-3.5 h-3.5" /> Всі ({logs.length})
            </button>

            <button
              onClick={() => setSelectedType('dice')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                selectedType === 'dice'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Dices className="w-3.5 h-3.5 text-blue-400" /> Ходи
            </button>

            <button
              onClick={() => setSelectedType('success')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                selectedType === 'success'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-emerald-400" /> Угоди
            </button>

            <button
              onClick={() => setSelectedType('warning')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                selectedType === 'warning'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20'
                  : 'bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Події
            </button>

            <button
              onClick={() => setSelectedType('danger')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                selectedType === 'danger'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-500/20'
                  : 'bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-400" /> Витрати
            </button>

            <button
              onClick={() => setSelectedType('ai')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                selectedType === 'ai'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> AI Поради
            </button>
          </div>
        </div>

        {/* Logs List Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-2 flex-1 scrollbar-thin">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 bg-slate-950/40 rounded-2xl border border-slate-800/40">
              <History className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-400 font-medium">Подій не знайдено</p>
              <p className="text-xs text-slate-500 mt-1">Спробуйте змінити фільтр або пошуковий запит</p>
            </div>
          ) : (
            filteredLogs.map((log) => {
              let textClass = 'text-slate-300';
              let bgBadge = 'bg-slate-950 text-slate-500 border-slate-800';
              let badgeLabel = 'Лог';

              if (log.type === 'success') {
                textClass = 'text-emerald-300 font-medium';
                bgBadge = 'bg-emerald-950/80 text-emerald-400 border-emerald-900/80';
                badgeLabel = 'Угода';
              } else if (log.type === 'warning') {
                textClass = 'text-amber-300';
                bgBadge = 'bg-amber-950/80 text-amber-400 border-amber-900/80';
                badgeLabel = 'Подія';
              } else if (log.type === 'danger') {
                textClass = 'text-rose-300';
                bgBadge = 'bg-rose-950/80 text-rose-400 border-rose-900/80';
                badgeLabel = 'Витрата';
              } else if (log.type === 'dice') {
                textClass = 'text-blue-300 font-bold';
                bgBadge = 'bg-blue-950/80 text-blue-400 border-blue-900/80';
                badgeLabel = 'Кубик';
              } else if (log.type === 'ai') {
                textClass = 'text-indigo-200';
                bgBadge = 'bg-indigo-950 text-indigo-400 border-indigo-900/80';
                badgeLabel = 'AI';
              }

              return (
                <div 
                  key={log.id} 
                  className="p-3 bg-slate-950/40 hover:bg-slate-950/70 border border-slate-800/60 rounded-xl flex items-start gap-3 text-xs transition-colors"
                >
                  <span className={`px-2.5 py-1 rounded-md font-mono text-[10px] font-bold uppercase border flex-shrink-0 ${bgBadge}`}>
                    {badgeLabel}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`${textClass} leading-relaxed`}>{log.message}</p>
                    <span className="text-[10px] text-slate-500 block mt-1 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString('uk-UA')}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800/80 flex justify-between items-center text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <ArrowDownCircle className="w-3.5 h-3.5 text-blue-400" />
            Нові події з'являються автоматично
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-all cursor-pointer"
          >
            Закрити
          </button>
        </div>
      </div>
    </div>
  );
}
