import React, { useState } from 'react';
import { usePlayerFinances } from '../../hooks/usePlayerFinances';
import useGameStore from '../../store/gameStore';
import { socketService } from '../../services/socketService';
import './FinancialStatement.css';

interface FinancialStatementProps {
  compact?: boolean;
  showAdvice?: boolean;
  className?: string;
}

const FinancialStatement: React.FC<FinancialStatementProps> = ({
  compact = false,
  showAdvice = false,
  className = ''
}) => {
  const finances = usePlayerFinances();
  const { currentPlayer, game } = useGameStore();

  // 💸 Sell confirmation state
  const [sellConfirm, setSellConfirm] = useState<{ assetId: string; assetName: string; price: number; multiplier: number } | null>(null);

  if (!finances || !currentPlayer) return null;

  const handleSellClick = (asset: any) => {
    const multiplier = asset.currentMultiplier ?? 1.0;
    const price = Math.floor((asset.cost || 0) * multiplier);
    setSellConfirm({ assetId: asset.id, assetName: asset.name, price, multiplier });
  };

  const confirmSell = () => {
    if (!sellConfirm || !game) return;
    socketService.sellAsset(game.id, currentPlayer.id, sellConfirm.assetId, sellConfirm.price);
    setSellConfirm(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Реальний розрахунок витрат на основі даних гравця
  const getExpenseBreakdown = () => {
    const liabilities = currentPlayer.finances.liabilities || [];
    const profExpenses = currentPlayer.profession?.expenses || 0;
    const liabilityTotal = liabilities.reduce((sum, l) => sum + (l.monthlyPayment || 0), 0);
    // Базові витрати профессії (без liabilities)
    const baseExpenses = Math.max(0, profExpenses - liabilityTotal);
    // Діти: childrenCount * 500
    const childrenCount = (currentPlayer as any).childrenCount || 0;
    const babyExpenses = childrenCount * 500;
    return { baseExpenses, liabilities, babyExpenses, childrenCount };
  };

  const expenseBreakdown = getExpenseBreakdown();
  const totalIncome = currentPlayer.profession.salary + finances.passiveIncome;

  return (
    <div className={`financial-statement ${compact ? 'compact' : ''} ${className}`}>
      
      {/* Заголовок */}
      <div className="statement-header">
        <h4>📊 ФІНАНСОВИЙ ЗВІТ</h4>
        <span className="player-name">{finances.playerName}</span>
        <span className="profession">{currentPlayer.profession.name}</span>
      </div>

      {/* ДОХОДИ */}
      <div className="statement-section income-section">
        <h5 className="section-title">💰 ДОХОДИ</h5>
        
        <div className="finance-row">
          <span className="label">💼 Зарплата:</span>
          <span className="value positive">{formatCurrency(currentPlayer.profession.salary)}</span>
        </div>
        
        {currentPlayer.finances.assets && currentPlayer.finances.assets.length > 0 && (
          <div className="assets-list">
            <h6 className="subsection-title">🏠 АКТИВИ (пасивний дохід):</h6>
            {currentPlayer.finances.assets.map((asset: any, index) => {
              const multiplier = asset.currentMultiplier ?? 1.0;
              const sellPrice = Math.floor((asset.cost || 0) * multiplier);
              return (
                <div key={asset.id || index} className="finance-row asset-row" style={{ alignItems: 'center' }}>
                  <span className="label" style={{ flex: 1 }}>
                    {asset.name}
                    {multiplier !== 1.0 && (
                      <span style={{ marginLeft: 4, fontSize: 11, color: multiplier > 1 ? '#4CAF50' : '#f44336' }}>
                        {multiplier > 1 ? `🚀×${multiplier}` : `📉×${multiplier}`}
                      </span>
                    )}
                    :
                  </span>
                  <span className="value positive" style={{ marginRight: 8 }}>{formatCurrency(asset.cashFlow)}</span>
                  <button
                    onClick={() => handleSellClick(asset)}
                    style={{
                      fontSize: 11, padding: '2px 7px', borderRadius: 6,
                      background: 'rgba(244,67,54,0.15)', color: '#f44336',
                      border: '1px solid rgba(244,67,54,0.4)', cursor: 'pointer',
                      whiteSpace: 'nowrap', flexShrink: 0
                    }}
                    title={`Продати за $${sellPrice.toLocaleString()}`}
                  >
                    💸 Продати
                  </button>
                </div>
              );
            })}
          </div>
        )}
        
        <div className="total-row">
          <span className="label"><strong>Загальний дохід:</strong></span>
          <span className="value positive total">{formatCurrency(totalIncome)}</span>
        </div>
      </div>

      {/* ВИТРАТИ */}
      <div className="statement-section expense-section">
        <h5 className="section-title">💸 ВИТРАТИ</h5>

        {expenseBreakdown.baseExpenses > 0 && (
          <div className="finance-row">
            <span className="label">🏠 Базові витрати ({currentPlayer.profession.name}):</span>
            <span className="value negative">{formatCurrency(expenseBreakdown.baseExpenses)}</span>
          </div>
        )}

        {expenseBreakdown.liabilities.map((liability, index) => (
          <div key={liability.id || index} className="finance-row liability-row">
            <span className="label">
              {liability.type === 'mortgage' ? '🏡' : liability.type === 'loan' ? '💳' : '📋'} {liability.name}:
            </span>
            <span className="value negative">{formatCurrency(liability.monthlyPayment)}</span>
          </div>
        ))}

        {expenseBreakdown.babyExpenses > 0 && (
          <div className="finance-row">
            <span className="label">👶 Діти ({expenseBreakdown.childrenCount} × $500):</span>
            <span className="value negative">{formatCurrency(expenseBreakdown.babyExpenses)}</span>
          </div>
        )}

        <div className="total-row">
          <span className="label"><strong>Загальні витрати:</strong></span>
          <span className="value negative total">{formatCurrency(currentPlayer.finances.expenses)}</span>
        </div>
      </div>

      {/* ЩОМІСЯЧНИЙ CASH FLOW */}
      <div className="statement-section cashflow-section">
        <div className="cashflow-calculation">
          <div className="calculation-row">
            <span className="label">💰 Доходи:</span>
            <span className="value positive">{formatCurrency(totalIncome)}</span>
          </div>
          <div className="calculation-row">
            <span className="label">💸 Витрати:</span>
            <span className="value negative">-{formatCurrency(currentPlayer.finances.expenses)}</span>
          </div>
          <div className="calculation-divider"></div>
          <div className="calculation-row total-cashflow">
            <span className="label"><strong>Щомісячний Cash Flow:</strong></span>
            <span className={`value ${finances.cashFlow >= 0 ? 'positive' : 'negative'} total`}>
              {formatCurrency(finances.cashFlow)}
            </span>
          </div>
        </div>
      </div>

      {/* ГОТІВКА */}
      <div className="statement-section cash-section">
        <div className="finance-row cash-row">
          <span className="label">💵 <strong>Готівка:</strong></span>
          <span className="value cash">{formatCurrency(finances.cash)}</span>
        </div>
      </div>

      {/* ПРОГРЕС ДО ШВИДКОЇ ДОРІЖКИ */}
      {!compact && (
        <div className="statement-section fasttrack-section">
          <h5 className="section-title">🚀 ШВИДКА ДОРІЖКА</h5>
          <div className="fasttrack-condition">
            <p className="condition-text">
              Умова: Пасивний дохід ≥ Загальні витрати
            </p>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ 
                  width: `${Math.min(100, (finances.passiveIncome / currentPlayer.finances.expenses) * 100)}%` 
                }}
              ></div>
            </div>
            <div className="progress-numbers">
              <span className="current">{formatCurrency(finances.passiveIncome)}</span>
              <span className="target">/ {formatCurrency(currentPlayer.finances.expenses)}</span>
            </div>
          </div>
        </div>
      )}

      {/* ПОРАДИ */}
      {showAdvice && finances.advice && (
        <div className="statement-section advice-section">
          <h5 className="section-title">💡 ПОРАДИ</h5>
          <p className="advice-text">{finances.advice}</p>
        </div>
      )}
      {/* 💸 Sell Confirmation */}
      {sellConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200
        }}>
          <div style={{
            background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 12, padding: 24, maxWidth: 320, width: '90%',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
          }}>
            <h4 style={{ color: '#FFD700', margin: '0 0 12px' }}>💸 Продати актив</h4>
            <p style={{ color: '#ddd', margin: '0 0 8px' }}><strong>{sellConfirm.assetName}</strong></p>
            <p style={{ color: '#aaa', fontSize: 13, margin: '0 0 4px' }}>
              Ціна продажу: <strong style={{ color: '#4CAF50' }}>${sellConfirm.price.toLocaleString()}</strong>
            </p>
            {sellConfirm.multiplier !== 1.0 && (
              <p style={{ color: sellConfirm.multiplier > 1 ? '#4CAF50' : '#f44336', fontSize: 12, margin: '0 0 12px' }}>
                {sellConfirm.multiplier > 1 ? `🚀 Ринковий бум ×${sellConfirm.multiplier}!` : `📉 Ринковий обвал ×${sellConfirm.multiplier}`}
              </p>
            )}
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={() => setSellConfirm(null)} style={{
                flex: 1, padding: '9px 0', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)',
                background: 'transparent', color: '#aaa', cursor: 'pointer', fontSize: 14
              }}>Скасувати</button>
              <button onClick={confirmSell} style={{
                flex: 1, padding: '9px 0', borderRadius: 8, border: 'none',
                background: 'linear-gradient(135deg,#f44336,#c62828)', color: '#fff',
                cursor: 'pointer', fontSize: 14, fontWeight: 700
              }}>✅ Продати</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialStatement;
