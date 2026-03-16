import React from 'react';
import { usePlayerFinances } from '../../hooks/usePlayerFinances';
import useGameStore from '../../store/gameStore';
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
  const { currentPlayer } = useGameStore();

  if (!finances || !currentPlayer) return null;

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
            {currentPlayer.finances.assets.map((asset, index) => (
              <div key={asset.id || index} className="finance-row asset-row">
                <span className="label">{asset.name}:</span>
                <span className="value positive">{formatCurrency(asset.cashFlow)}</span>
              </div>
            ))}
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
    </div>
  );
};

export default FinancialStatement;
