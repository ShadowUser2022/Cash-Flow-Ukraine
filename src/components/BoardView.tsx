/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Player, BoardSpace } from '../types';
import { BOARD_SPACES } from '../board';
import { 
  Coins, 
  Briefcase, 
  CreditCard, 
  Baby, 
  AlertTriangle, 
  HeartHandshake,
  TrendingUp,
  Sparkles,
  Info,
  Rocket,
  ShieldCheck
} from 'lucide-react';

interface BoardViewProps {
  players: Player[];
  currentPlayerIndex: number;
  latestLog?: string;
}

const iconMap: Record<string, any> = {
  Coins,
  Briefcase,
  CreditCard,
  Baby,
  AlertTriangle,
  HeartHandshake,
};

// Default financial tips for ticker tape
const FINANCIAL_TIPS = [
  "Порада: Купуйте активи з позитивним потоком готівки, щоб прискорити вихід з Щурячих перегонів.",
  "Стратегія: Погашайте високовідсоткові кредити (картки, авто), щоб збільшити свій щомісячний CashFlow.",
  "Мета: Фінансова свобода настає, коли ваш Пасивний Дохід перевищує Загальні Витрати.",
  "Благодійність: Донати дають можливість кидати 2 кубики за хід протягом 3 наступних кіл!",
  "Нерухомість: Квартири та комерційна нерухомість у Києві дають стабільний пасивний дохід.",
  "Фінансова подушка: Тримайте запас готівки на випадок ринкових потрясінь чи втрати роботи."
];

// Rectangular layout helper for 24 spaces (8x5 grid)
function getGridPosition(index: number): { row: number; col: number } {
  if (index >= 0 && index <= 7) {
    return { row: 1, col: index + 1 };
  }
  if (index >= 8 && index <= 11) {
    return { row: index - 6, col: 8 };
  }
  if (index >= 12 && index <= 19) {
    return { row: 5, col: 20 - index };
  }
  if (index >= 20 && index <= 23) {
    return { row: 25 - index, col: 1 };
  }
  return { row: 1, col: 1 };
}

export default function BoardView({ players, currentPlayerIndex, latestLog }: BoardViewProps) {
  const activePlayer = players[currentPlayerIndex];
  const isFastTrack = activePlayer?.isFastTrack;

  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  // Rotate tips periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % FINANCIAL_TIPS.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl overflow-hidden flex flex-col gap-4">
      
      {/* CONSOLIDATED SPACE-EFFICIENT TOP BAR: LEVEL BADGE + LIVE TICKER */}
      <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2.5 sm:p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-inner">
        {/* Track / Level Badge */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border flex items-center gap-1.5 ${
            isFastTrack 
              ? 'bg-amber-950/90 text-amber-300 border-amber-700/80 shadow-sm shadow-amber-900/30' 
              : 'bg-indigo-950/90 text-indigo-300 border-indigo-700/80 shadow-sm shadow-indigo-900/30'
          }`}>
            {isFastTrack ? (
              <>
                <Rocket className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                <span>Швидкісна Траса</span>
              </>
            ) : (
              <>
                <span>Щурячі Перегони</span>
              </>
            )}
          </span>
        </div>

        {/* Live Ticker / Tip Info-board in the same line */}
        <div className="flex-1 overflow-hidden text-xs text-slate-300 font-medium flex items-center gap-2">
          {latestLog ? (
            <div className="flex items-center gap-2 truncate animate-fade-in w-full">
              <span className="text-emerald-400 font-bold uppercase text-[9px] bg-emerald-950/90 px-1.5 py-0.5 rounded border border-emerald-800 flex-shrink-0">
                Подія
              </span>
              <p className="truncate text-slate-200">{latestLog}</p>
            </div>
          ) : (
            <div className="flex items-center gap-2 truncate transition-all duration-500 animate-fade-in w-full">
              <span className="text-indigo-400 font-bold uppercase text-[9px] bg-indigo-950/90 px-1.5 py-0.5 rounded border border-indigo-800 flex-shrink-0">
                Порада
              </span>
              <p className="truncate text-slate-300">{FINANCIAL_TIPS[currentTipIndex]}</p>
            </div>
          )}
        </div>
      </div>

      {/* Grid container representing the board loop */}
      <div className="grid grid-cols-8 grid-rows-5 gap-2 max-w-4xl mx-auto aspect-[8/5] select-none relative bg-slate-950/40 p-2 rounded-xl border border-slate-800/50 w-full">
        {/* Render Center Content */}
        <div className="col-start-2 col-end-8 row-start-2 row-end-5 bg-slate-900/60 rounded-lg flex flex-col items-center justify-center p-4 text-center border border-slate-800/30">
          <div className="text-3xl font-bold tracking-widest text-slate-500 font-sans uppercase">
            CASHFLOW
          </div>
          <div className="text-xs font-mono tracking-wider text-yellow-500/80 mt-1 font-bold">
            УКРАЇНСЬКИЙ СТИЛЬ
          </div>
          <p className="text-[11px] text-slate-400 max-w-sm mt-3 leading-relaxed">
            Купуйте нерухомість в Києві, інвестуйте в ОВДП, підтримуйте бізнеси та донатьте на ЗСУ, щоб вийти на Швидкісний трек фінансової свободи!
          </p>
        </div>

        {/* Render Spaces */}
        {BOARD_SPACES.map((space) => {
          const { row, col } = getGridPosition(space.index);
          const SpaceIcon = iconMap[space.icon] || Briefcase;

          // Find players standing on this space
          const playersOnSpace = players.filter((p) => p.currentPosition === space.index);

          // Customize colors based on space type
          let bgClass = 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300';
          let borderAccent = '';

          if (space.type === 'PAYDAY') {
            bgClass = 'bg-emerald-950/80 hover:bg-emerald-900/80 border-emerald-800 text-emerald-300';
            borderAccent = 'shadow-inner shadow-emerald-500/10';
          } else if (space.type === 'EXPENSE') {
            bgClass = 'bg-rose-950/80 hover:bg-rose-900/80 border-rose-900 text-rose-300';
          } else if (space.type === 'LAYOFF') {
            bgClass = 'bg-amber-950/80 hover:bg-amber-900/80 border-amber-900 text-amber-300';
          } else if (space.type === 'CHARITY') {
            bgClass = 'bg-blue-950/80 hover:bg-blue-900/80 border-blue-900 text-blue-300';
          } else if (space.type === 'BABY') {
            bgClass = 'bg-indigo-950/80 hover:bg-indigo-900/80 border-indigo-900 text-indigo-300';
          }

          return (
            <div
              key={space.index}
              style={{ gridRow: row, gridColumn: col }}
              className={`relative flex flex-col justify-between p-2 rounded-lg border transition-all duration-300 ${bgClass} ${borderAccent}`}
              id={`space-${space.index}`}
            >
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-900/80 px-1 py-0.2 rounded">
                  {space.index}
                </span>
                <SpaceIcon className="w-3.5 h-3.5 opacity-80" />
              </div>

              <div className="mt-1 text-[10px] font-bold tracking-tight leading-none truncate max-w-full">
                {space.name}
              </div>

              {/* Player tokens on the cell */}
              <div className="absolute bottom-1 right-1 flex flex-wrap gap-0.5 justify-end max-w-[70%]">
                {playersOnSpace.map((p) => (
                  <div
                    key={p.id}
                    title={p.name}
                    className="w-3.5 h-3.5 rounded-full border border-slate-950 flex items-center justify-center animate-bounce shadow-md"
                    style={{ backgroundColor: p.color }}
                  >
                    <span className="text-[7px] text-white font-bold">{p.name[0]}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

