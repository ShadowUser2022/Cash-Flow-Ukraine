/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Player, Asset, Liability } from '../types';
import { calculatePlayerTotals } from '../careers';
import { 
  DollarSign, 
  ArrowUpRight, 
  TrendingUp, 
  MinusCircle, 
  PlusCircle, 
  Plus, 
  Check, 
  HelpCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';

interface BalanceSheetViewProps {
  player: Player;
  assets: Asset[];
  liabilities: Liability[];
  onBorrow: (amount: number) => void;
  onPayDebt: (liabilityId: string) => void;
  isMyTurn: boolean;
  onClose?: () => void;
}

export default function BalanceSheetView({ 
  player, 
  assets, 
  liabilities, 
  onBorrow, 
  onPayDebt,
  isMyTurn,
  onClose
}: BalanceSheetViewProps) {
  const [borrowAmount, setBorrowAmount] = useState<number>(10000);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const totals = calculatePlayerTotals(player, assets, liabilities);

  // Calculate percentages towards escape
  const escapePercent = totals.totalExpenses > 0 
    ? Math.min(100, Math.round((totals.passiveIncome / totals.totalExpenses) * 100)) 
    : 0;

  const childExpense = player.childrenCount * player.career.childExpensePerChild;

  const handleBorrowSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (borrowAmount > 0 && borrowAmount % 10000 === 0) {
      onBorrow(borrowAmount);
      setBorrowAmount(10000);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl transition-all">
      {/* Header - Clickable to toggle collapse */}
      <div 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 cursor-pointer group select-none"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-900/50 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform flex-shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white font-sans tracking-tight flex items-center gap-2 group-hover:text-emerald-400 transition-colors">
              Фінансовий звіт: {player.career.name}
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-normal">
                {isCollapsed ? 'Натисніть щоб розгорнути' : 'Згорнути'}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Доходи, витрати, активи та зобов'язання</p>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-slate-800/60 pt-2 sm:pt-0">
          <div className="text-left sm:text-right">
            <span className="text-[10px] text-slate-500 block uppercase font-mono font-bold">Готівка</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
              {player.cash.toLocaleString('uk-UA')} ₴
            </span>
          </div>

          {onClose ? (
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-rose-950/80 hover:text-rose-400 rounded-xl border border-slate-700/50 transition-all"
              aria-label="Закрити звіт"
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            <button 
              type="button"
              className="p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-xl border border-slate-700/50 transition-all"
              aria-label={isCollapsed ? 'Expand balance sheet' : 'Collapse balance sheet'}
            >
              {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Summary Pill when Collapsed */}
      {isCollapsed && (
        <div className="mt-4 pt-4 border-t border-slate-800/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-850">
            <span className="text-[10px] text-slate-500 block">Чистий потік:</span>
            <span className={`font-mono font-bold ${totals.monthlyCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {totals.monthlyCashFlow >= 0 ? '+' : ''}{totals.monthlyCashFlow.toLocaleString('uk-UA')} ₴/міс
            </span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-850">
            <span className="text-[10px] text-slate-500 block">Пасивний дохід:</span>
            <span className="font-mono font-bold text-emerald-400">
              +{totals.passiveIncome.toLocaleString('uk-UA')} ₴
            </span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-850">
            <span className="text-[10px] text-slate-500 block">Витрати:</span>
            <span className="font-mono font-bold text-rose-400">
              {totals.totalExpenses.toLocaleString('uk-UA')} ₴
            </span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-850">
            <span className="text-[10px] text-slate-500 block">Прогрес фінішу:</span>
            <span className="font-mono font-bold text-amber-400">
              {escapePercent}%
            </span>
          </div>
        </div>
      )}

      {!isCollapsed && (
        <div className="mt-6 pt-6 border-t border-slate-800/60">

      {/* Progress towards escaping the Rat Race */}
      <div className="bg-slate-950/80 rounded-xl p-4 mb-6 border border-slate-800/60">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-semibold text-slate-300">Прогрес виходу з Щурячих перегонів:</span>
          <span className="text-xs font-bold font-mono text-yellow-400">{escapePercent}%</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              escapePercent >= 100 ? 'bg-gradient-to-r from-emerald-500 to-teal-500 animate-pulse' : 'bg-yellow-500'
            }`}
            style={{ width: `${escapePercent}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-2 text-[10px] text-slate-400">
          <span>Пасивний дохід: <strong className="text-emerald-400 font-mono">{totals.passiveIncome.toLocaleString()} ₴</strong></span>
          <span>Цільові витрати: <strong className="text-rose-400 font-mono">{totals.totalExpenses.toLocaleString()} ₴</strong></span>
        </div>
      </div>

      {/* Main Grid for Income / Expenses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* 1. INCOME STATEMENT */}
        <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/40">
          <h3 className="text-sm font-bold text-emerald-400 border-b border-slate-800 pb-2 mb-3 flex items-center justify-between">
            <span>📈 ДОХОДИ (Income)</span>
            <span className="text-xs text-slate-500 font-normal">Щомісячно</span>
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 text-slate-300">
              <span>Заробітна плата ({player.career.nameEn}):</span>
              <span className="font-mono font-bold text-slate-100">{player.career.salary.toLocaleString()} ₴</span>
            </div>
            
            {/* Passive income list */}
            <div className="border-t border-slate-900 pt-2">
              <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Пасивний дохід від активів</span>
              {assets.filter(a => a.cashFlow > 0).length === 0 ? (
                <span className="text-slate-500 italic block text-[11px] py-1">Немає пасивного доходу. Купуйте активи!</span>
              ) : (
                assets.filter(a => a.cashFlow > 0).map((asset) => (
                  <div key={asset.id} className="flex justify-between py-1 text-slate-400">
                    <span className="truncate max-w-[70%]">• {asset.name}</span>
                    <span className="font-mono font-bold text-emerald-400">+{asset.cashFlow.toLocaleString()} ₴</span>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-slate-800 pt-2 mt-2 flex justify-between text-sm font-black text-slate-200">
              <span>ЗАГАЛЬНИЙ ДОХІД:</span>
              <span className="font-mono text-emerald-400">{totals.totalIncome.toLocaleString()} ₴</span>
            </div>
          </div>
        </div>

        {/* 2. EXPENSES */}
        <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/40">
          <h3 className="text-sm font-bold text-rose-400 border-b border-slate-800 pb-2 mb-3 flex items-center justify-between">
            <span>📉 ВИТРАТИ (Expenses)</span>
            <span className="text-xs text-slate-500 font-normal">Щомісячно</span>
          </h3>
          <div className="space-y-2 text-xs max-h-[220px] overflow-y-auto pr-1">
            <div className="flex justify-between py-1 text-slate-300">
              <span>Податки (ПДФО, ФОП тощо):</span>
              <span className="font-mono text-slate-100">{player.career.taxes.toLocaleString()} ₴</span>
            </div>
            <div className="flex justify-between py-1 text-slate-300">
              <span>Витрати на житло (Оренда/Комуналка):</span>
              <span className="font-mono text-slate-100">{player.career.rentOrMortgage.toLocaleString()} ₴</span>
            </div>
            {player.career.carPayment > 0 && (
              <div className="flex justify-between py-1 text-slate-300">
                <span>Витрати на автомобіль:</span>
                <span className="font-mono text-slate-100">{player.career.carPayment.toLocaleString()} ₴</span>
              </div>
            )}
            <div className="flex justify-between py-1 text-slate-300">
              <span>Утримання дітей ({player.childrenCount} чол):</span>
              <span className="font-mono text-slate-100">{childExpense.toLocaleString()} ₴</span>
            </div>
            <div className="flex justify-between py-1 text-slate-300">
              <span>Інші витрати (Продукти, Зв'язок):</span>
              <span className="font-mono text-slate-100">{player.career.otherExpenses.toLocaleString()} ₴</span>
            </div>

            {/* Liability payments list */}
            {liabilities.length > 0 && (
              <div className="border-t border-slate-900 pt-2">
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Платежі за боргами</span>
                {liabilities.map((l) => (
                  <div key={l.id} className="flex justify-between py-1 text-slate-400">
                    <span className="truncate max-w-[70%]">• {l.name}</span>
                    <span className="font-mono text-rose-400">+{l.monthlyPayment.toLocaleString()} ₴</span>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-slate-800 pt-2 mt-2 flex justify-between text-sm font-black text-slate-200">
              <span>ЗАГАЛЬНІ ВИТРАТИ:</span>
              <span className="font-mono text-rose-400">{totals.totalExpenses.toLocaleString()} ₴</span>
            </div>
          </div>
        </div>
      </div>

      {/* NET CASH FLOW SECTION */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">💰 ЧИСТИЙ ГРОШОВИЙ ПОТІК (Monthly Cash Flow)</span>
          <p className="text-[11px] text-slate-500 mt-0.5">Ці гроші ви отримуєте щоразу, коли переходите клітинку "День зарплати"</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-emerald-400 font-mono">
            +{totals.monthlyCashFlow.toLocaleString()} ₴ <span className="text-xs text-slate-400">/міс</span>
          </span>
        </div>
      </div>

      {/* Main Grid for Assets / Liabilities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* 3. ASSETS LIST */}
        <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/40">
          <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2 mb-3">
            💼 АКТИВИ (Assets)
          </h3>
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {assets.length === 0 ? (
              <span className="text-slate-500 italic text-xs block py-4 text-center">Активи відсутні. У вас немає пасивних джерел доходу.</span>
            ) : (
              assets.map((asset) => (
                <div key={asset.id} className="bg-slate-950/80 border border-slate-900 rounded-lg p-2.5 text-xs flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-200 truncate max-w-[160px]">{asset.name}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Вартість: {asset.cost.toLocaleString()} ₴ | Внесок: {asset.downPayment.toLocaleString()} ₴
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block font-mono">Потік</span>
                    <span className="font-mono font-black text-emerald-400">+{asset.cashFlow.toLocaleString()} ₴</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 4. LIABILITIES LIST */}
        <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/40">
          <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2 mb-3">
            🧾 ЗОБОВ'ЯЗАННЯ / БОРГИ (Liabilities)
          </h3>
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {liabilities.length === 0 ? (
              <span className="text-slate-500 italic text-xs block py-4 text-center">Боргів немає. Чудова фінансова чистота!</span>
            ) : (
              liabilities.map((liab) => (
                <div key={liab.id} className="bg-slate-950/80 border border-slate-900 rounded-lg p-2.5 text-xs flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-200 truncate max-w-[140px]">{liab.name}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Сума боргу: {liab.amount.toLocaleString()} ₴ | Платіж: {liab.monthlyPayment.toLocaleString()} ₴/міс
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {player.cash >= liab.amount ? (
                      <button
                        onClick={() => onPayDebt(liab.id)}
                        className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-[10px] px-2.5 py-1.5 rounded-md font-bold transition-all"
                      >
                        Сплатити
                      </button>
                    ) : (
                      <button
                        disabled
                        className="bg-slate-800 text-slate-500 text-[10px] px-2.5 py-1.5 rounded-md font-bold cursor-not-allowed"
                      >
                        {Math.round((player.cash / liab.amount) * 100)}%
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* QUICK BANK ACTIONS */}
      <div className="border-t border-slate-800 pt-6 mt-6">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">🏦 Взаємодія з Банком (Кредитування)</h3>
        <form onSubmit={handleBorrowSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <label className="block text-[10px] text-slate-500 uppercase font-mono font-bold mb-1">Сума кредиту (кратна 10,000 ₴)</label>
            <div className="flex items-center bg-slate-950 rounded-lg border border-slate-800 px-3 py-1">
              <span className="text-slate-500 font-mono text-xs mr-2">₴</span>
              <input 
                type="number" 
                step="10000"
                min="10000"
                value={borrowAmount} 
                onChange={(e) => setBorrowAmount(Math.max(10000, Math.floor(Number(e.target.value) / 10000) * 10000))}
                className="w-full bg-transparent text-white font-mono text-sm focus:outline-none py-1.5"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-6 py-3 rounded-lg transition-all active:scale-95 self-end"
          >
            Взяти Банківський Кредит
          </button>
        </form>
        <p className="text-[10px] text-slate-500 mt-2">
          💡 Банк видає кредит під 10% на місяць. Тобто кожні 10,000 ₴ кредиту додадуть 1,000 ₴ щомісячних витрат. Борг можна сплатити в будь-який момент.
        </p>
      </div>
        </div>
      )}
    </div>
  );
}
