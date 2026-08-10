/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Player, Asset, OpportunityCard, ExpenseCard, MarketCard } from '../types';
import { 
  Briefcase, 
  CreditCard, 
  Baby, 
  AlertTriangle, 
  HeartHandshake,
  TrendingUp, 
  Building, 
  ShoppingCart, 
  BadgeAlert,
  Coins,
  DollarSign,
  Megaphone
} from 'lucide-react';

interface ActiveCardViewProps {
  activeCard: {
    type: 'OPPORTUNITY' | 'EXPENSE' | 'MARKET' | 'PAYDAY' | 'BABY' | 'LAYOFF' | 'CHARITY';
    card?: OpportunityCard | ExpenseCard | MarketCard | any;
    playerId: string;
    resolved: boolean;
  };
  player: Player;
  myAssets: Asset[];
  onSelectDeal: (dealType: 'SMALL' | 'BIG') => void;
  onBuyAsset: () => void;
  onDeclineCard: () => void;
  onResolveCard: () => void;
  onCharityDecision: (accepted: boolean) => void;
  onSellAsset: (assetId: string) => void;
  isMyTurn: boolean;
}

export default function ActiveCardView({
  activeCard,
  player,
  myAssets,
  onSelectDeal,
  onBuyAsset,
  onDeclineCard,
  onResolveCard,
  onCharityDecision,
  onSellAsset,
  isMyTurn
}: ActiveCardViewProps) {
  const { type, card, playerId } = activeCard;

  if (!isMyTurn) {
    return (
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 text-center">
        <LoaderMini />
        <h3 className="text-sm font-bold text-slate-300 mt-3">Очікування дій іншого гравця...</h3>
        <p className="text-xs text-slate-500 mt-1">Гравець зараз приймає фінансове рішення на своїй клітинці.</p>
      </div>
    );
  }

  // Helper for Card Icon
  const getCardHeader = () => {
    switch (type) {
      case 'OPPORTUNITY':
        return { title: 'Нова Інвестиційна Можливість', color: 'bg-emerald-600', icon: Briefcase };
      case 'EXPENSE':
        return { title: 'Позачергові Життєві Витрати', color: 'bg-rose-600', icon: CreditCard };
      case 'CHARITY':
        return { title: 'Благодійна Пропозиція (Донат на ЗСУ)', color: 'bg-blue-600', icon: HeartHandshake };
      case 'MARKET':
        return { title: 'Ринок Нерухомості та Акцій', color: 'bg-amber-600', icon: TrendingUp };
      default:
        return { title: 'Ігрова Карта', color: 'bg-slate-600', icon: Briefcase };
    }
  };

  const header = getCardHeader();
  const HeaderIcon = header.icon;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl transition-all border-l-4" style={{ borderColor: type === 'OPPORTUNITY' ? '#10B981' : type === 'EXPENSE' ? '#EF4444' : type === 'CHARITY' ? '#3B82F6' : '#F59E0B' }}>
      
      {/* Card Header banner */}
      <div className={`p-4 ${header.color} text-white flex items-center gap-3`}>
        <div className="p-2 bg-white/15 rounded-lg">
          <HeaderIcon className="w-5 h-5" />
        </div>
        <h3 className="font-bold text-sm tracking-tight font-sans uppercase">{header.title}</h3>
      </div>

      <div className="p-6">
        {/* CASE 1: OPPORTUNITY INITIAL CHOICE */}
        {type === 'OPPORTUNITY' && !card && (
          <div className="text-center py-4">
            <h4 className="text-base font-bold text-slate-100 mb-2">Оберіть категорію інвестиції:</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
              Малі угоди дають високий дохід при низькому порозі входу. Великі угоди потребують великого капіталу (першого внеску), але приносять великий пасивний дохід.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
              <button
                onClick={() => onSelectDeal('SMALL')}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs py-3 px-4 rounded-xl transition-all shadow-lg shadow-emerald-500/10"
              >
                Мала угода (до 100k ₴)
              </button>
              <button
                onClick={() => onSelectDeal('BIG')}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs py-3 px-4 rounded-xl transition-all shadow-lg shadow-indigo-500/10"
              >
                Велика угода (від 150k ₴)
              </button>
            </div>
          </div>
        )}

        {/* CASE 2: OPPORTUNITY SPECIFIC CARD */}
        {type === 'OPPORTUNITY' && card && (
          <div>
            <div className="border-b border-slate-800 pb-4 mb-4">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 uppercase font-mono tracking-wider">
                    {card.assetType}
                  </span>
                  <h4 className="text-lg font-bold text-white mt-1">{card.name}</h4>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-[10px] text-slate-500 block uppercase font-mono">Грошовий потік</span>
                  <span className="text-lg font-black text-emerald-400 font-mono">
                    +{card.cashFlow.toLocaleString()} ₴ <span className="text-[10px] text-slate-400">/міс</span>
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">{card.description}</p>
            </div>

            {/* Financial Terms list */}
            <div className="grid grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800/40 mb-6 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-mono">Повна вартість</span>
                <span className="font-bold font-mono text-slate-200 text-sm">
                  {card.cost.toLocaleString()} ₴
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-mono">Перший внесок (Down Payment)</span>
                <span className="font-bold font-mono text-emerald-400 text-sm">
                  {card.downPayment.toLocaleString()} ₴
                </span>
              </div>
              {card.mortgage > 0 && (
                <div className="col-span-2 border-t border-slate-900 pt-2 mt-1">
                  <span className="text-[10px] text-slate-500 block uppercase font-mono">Банківський борг (Іпотека)</span>
                  <span className="font-bold font-mono text-rose-400 text-xs">
                    {card.mortgage.toLocaleString()} ₴ (платіж входить у звіт автоматично)
                  </span>
                </div>
              )}
            </div>

            {/* Actions for Opportunity Card */}
            <div className="flex flex-col sm:flex-row gap-3 justify-end items-center">
              {player.cash < card.downPayment && (
                <p className="text-[11px] text-rose-400 font-medium italic sm:mr-auto mb-2 sm:mb-0 text-center sm:text-left flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 inline flex-shrink-0" /> Не вистачає готівки ({card.downPayment - player.cash} ₴)! Візьміть кредит у банку нижче, або відмовтеся.
                </p>
              )}
              <button
                onClick={onDeclineCard}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 font-bold text-xs rounded-xl transition-all"
              >
                Відмовитись від угоди
              </button>
              {player.cash >= card.downPayment && (
                <button
                  onClick={onBuyAsset}
                  className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-emerald-500/10"
                >
                  Придбати актив
                </button>
              )}
            </div>
          </div>
        )}

        {/* CASE 3: EXPENSE RESOLUTION */}
        {type === 'EXPENSE' && card && (
          <div>
            <div className="border-b border-slate-800 pb-4 mb-4 text-center sm:text-left">
              <h4 className="text-base font-bold text-white">{card.name}</h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">{card.description}</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/40 mb-6 flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">Сума до сплати:</span>
              <span className="text-sm font-black text-rose-400">
                -{card.cost.toLocaleString()} ₴
              </span>
            </div>

            <div className="flex justify-end">
              <button
                onClick={onResolveCard}
                className="w-full sm:w-auto px-6 py-2.5 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold text-xs rounded-xl transition-all"
              >
                Сплатити та завершити хід
              </button>
            </div>
          </div>
        )}

        {/* CASE 4: CHARITY DECISION */}
        {type === 'CHARITY' && (
          <div className="text-center py-4">
            <h4 className="text-base font-bold text-slate-100 mb-2">Підтримайте збір для ЗСУ!</h4>
            <p className="text-xs text-slate-300 max-w-md mx-auto mb-6 leading-relaxed">
              Ціна Перемоги — наш спільний вклад. Задонатьте <strong>10% вашого загального доходу</strong> на потреби бригади. 
              Це звільнить ваші внутрішні резерви, і ви зможете використовувати <strong>2 кубики замість 1</strong> наступні 3 ходи!
            </p>
            
            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 border-dashed text-xs max-w-xs mx-auto mb-6">
              <span className="text-slate-500 uppercase font-bold block text-[10px]">Сума донату</span>
              <span className="font-mono font-black text-blue-400 text-lg">
                {Math.round((player.career.salary + player.passiveIncome) * 0.1).toLocaleString()} ₴
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
              <button
                onClick={() => onCharityDecision(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 font-bold text-xs py-3 px-4 rounded-xl transition-all"
              >
                Пропустити збір
              </button>
              <button
                onClick={() => onCharityDecision(true)}
                className="flex-1 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs py-3 px-4 rounded-xl transition-all shadow-lg shadow-blue-500/10"
              >
                Задонатити на ЗСУ!
              </button>
            </div>
          </div>
        )}

        {/* CASE 5: MARKET CARD EVENT */}
        {type === 'MARKET' && card && (
          <div>
            <div className="border-b border-slate-800 pb-4 mb-4">
              <h4 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
                <Megaphone className="w-4 h-4 text-slate-300" /> {card.name}
              </h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">{card.description}</p>
            </div>

            {/* If there is an option to sell matching assets, show active player's assets */}
            {card.effectType === 'BUYER' && (
              <div className="mb-6">
                <span className="text-[10px] text-slate-500 uppercase font-bold font-mono block mb-2">Ваші відповідні активи під продаж</span>
                
                {/* Find assets that player can sell. For simplicity, we filter real_estate or assets whose cost can be traded */}
                {myAssets.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">У вас немає відповідних активів для продажу цьому покупцю.</p>
                ) : (
                  <div className="space-y-2">
                    {myAssets.map((asset) => {
                      // Simple match: if asset name contains parts of card description or if the asset ID matches specific card types
                      // For simplicity, let's allow selling the matching properties
                      const isMatch = (card.assetType === asset.type);
                      
                      if (!isMatch) return null;

                      const salePrice = card.targetPrice || asset.cost;
                      const payout = salePrice - (asset.mortgage || 0);

                      return (
                        <div key={asset.id} className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs flex justify-between items-center">
                          <div>
                            <h5 className="font-bold text-slate-200">{asset.name}</h5>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              Купівля: {asset.cost.toLocaleString()} ₴ | Залишок іпотеки: {(asset.mortgage || 0).toLocaleString()} ₴
                            </p>
                          </div>
                          <div className="text-right flex items-center gap-3">
                            <div>
                              <span className="text-[10px] text-slate-500 block uppercase font-mono">Чиста виплата</span>
                              <span className="font-bold font-mono text-emerald-400">+{payout.toLocaleString()} ₴</span>
                            </div>
                            <button
                              onClick={() => onSellAsset(asset.id)}
                              className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-[10px] px-3 py-2 rounded-lg transition-all"
                            >
                              Продати актив
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Resolve button to dismiss market proposal and advance */}
            <div className="flex justify-end">
              <button
                onClick={onResolveCard}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xs rounded-xl transition-all"
              >
                Закрити пропозицію ринку
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LoaderMini() {
  return (
    <div className="flex justify-center py-2">
      <div className="w-5 h-5 border-2 border-slate-700 border-t-indigo-500 rounded-full animate-spin" />
    </div>
  );
}
