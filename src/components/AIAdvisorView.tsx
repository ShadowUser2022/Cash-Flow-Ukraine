/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Player } from '../types';
import { 
  Sparkles, 
  HelpCircle, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  Loader2, 
  MessageSquareCode,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';

interface AIAdvisorViewProps {
  player: Player;
  advice: {
    blindSpots: string[];
    tips: string[];
    overallScore: number;
    advisorComment: string;
  } | null;
  onRefreshAdvice: () => void;
  aiThinking: boolean;
  onClose?: () => void;
}

export default function AIAdvisorView({ 
  player, 
  advice, 
  onRefreshAdvice, 
  aiThinking,
  onClose
}: AIAdvisorViewProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="bg-gradient-to-br from-slate-900 to-indigo-950/80 border border-indigo-900/60 rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden transition-all">
      {/* Decorative ambient glowing circles */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl -z-10" />

      {/* Clickable Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-3 cursor-pointer group select-none flex-1"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-950/60 border border-indigo-900/50 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform flex-shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white font-sans tracking-tight flex items-center gap-2 group-hover:text-indigo-400 transition-colors">
              AI Ведучий: Фінансовий Експерт
              {advice && (
                <span className="text-[10px] bg-indigo-900/60 text-indigo-300 px-2 py-0.5 rounded-full font-mono font-bold">
                  Score: {advice.overallScore}/100
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">Особисті зауваження та аналіз у реальному часі</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-indigo-900/30 pt-2 sm:pt-0">
          <button
            onClick={onRefreshAdvice}
            disabled={aiThinking}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              aiThinking 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white shadow-lg shadow-indigo-500/20'
            }`}
          >
            {aiThinking ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                Аналізую...
              </>
            ) : (
              <>
                <MessageSquareCode className="w-3.5 h-3.5" />
                Запитати пораду AI
              </>
            )}
          </button>

          {onClose ? (
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-rose-950/80 hover:text-rose-400 rounded-xl border border-slate-700/50 transition-all"
              aria-label="Закрити AI ведучого"
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            <button 
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-xl border border-slate-700/50 transition-all"
              aria-label={isCollapsed ? 'Expand AI Advisor' : 'Collapse AI Advisor'}
            >
              {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {!isCollapsed && (
        <div className="mt-6 pt-6 border-t border-indigo-900/40 space-y-6">

      {aiThinking && (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-950/40 rounded-xl border border-slate-800/30">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
          <h3 className="text-sm font-bold text-slate-200">Зв'язок із фінансовим ментором...</h3>
          <p className="text-xs text-slate-500 max-w-xs mt-1 leading-relaxed">
            AI Host сканує ваші доходи, оцінює ефективність активів та шукає сліпі зони у фінансовому звіті.
          </p>
        </div>
      )}

      {!aiThinking && !advice && (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-950/20 rounded-xl border border-slate-800/20">
          <HelpCircle className="w-10 h-10 text-slate-600 mb-3" />
          <h3 className="text-sm font-bold text-slate-300">Поради ще не сформовані</h3>
          <p className="text-xs text-slate-500 max-w-xs mt-1 leading-relaxed">
            Натисніть кнопку вище, щоб залучити штучний інтелект як фінансового ведучого та оцінити ваші шанси виграти.
          </p>
        </div>
      )}

      {!aiThinking && advice && (
        <div className="space-y-6">
          {/* Health Index and Quotation Block */}
          <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-950/60 p-4 rounded-xl border border-indigo-950/40">
            {/* Circular score gauge */}
            <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
              <svg className="w-full h-full transform -rotate-95" viewBox="0 0 100 100">
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  className="stroke-slate-800" 
                  strokeWidth="8" 
                  fill="none" 
                />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  className="stroke-indigo-500 transition-all duration-1000" 
                  strokeWidth="8" 
                  fill="none" 
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 - (251.2 * advice.overallScore) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-xl font-black text-white font-mono">{advice.overallScore}</span>
                <span className="text-[8px] text-slate-500 font-bold uppercase font-mono tracking-widest">Wellness</span>
              </div>
            </div>

            {/* Quote block */}
            <div className="flex-1">
              <span className="text-[10px] text-indigo-400 uppercase font-mono font-bold tracking-wider block">Коментар Ведучого</span>
              <p className="text-xs text-slate-300 italic leading-relaxed mt-1">
                « {advice.advisorComment} »
              </p>
            </div>
          </div>

          {/* Blind spots & Tips Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Blind spots */}
            <div className="bg-slate-950/40 rounded-xl p-4 border border-rose-950/30">
              <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-3 flex items-center gap-1.5 border-b border-rose-950/20 pb-2">
                <ShieldAlert className="w-4 h-4" />
                Сліпі зони (Blind Spots)
              </h4>
              <ul className="space-y-2.5">
                {advice.blindSpots.map((spot, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
                    <span>{spot}</span>
                  </li>
                ))}
                {advice.blindSpots.length === 0 && (
                  <li className="text-xs text-slate-500 italic">Сліпих зон не знайдено. Ваша фінансова стратегія досконала!</li>
                )}
              </ul>
            </div>

            {/* Tips */}
            <div className="bg-slate-950/40 rounded-xl p-4 border border-emerald-950/30">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-1.5 border-b border-emerald-950/20 pb-2">
                <TrendingUp className="w-4 h-4" />
                Рекомендації та Кроки (Tips)
              </h4>
              <ul className="space-y-2.5">
                {advice.tips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
                {advice.tips.length === 0 && (
                  <li className="text-xs text-slate-500 italic">Порад немає. Ви все робите правильно!</li>
                )}
              </ul>
            </div>
          </div>
          
          <div className="text-[10px] text-center text-indigo-400/70 border-t border-slate-800/40 pt-4">
            AI ведучий враховує останні ігрові логи, ваші інвестиційні рішення та поточний рівень інфляції в Україні!
          </div>
        </div>
      )}
        </div>
      )}
    </div>
  );
}
