/**
 * Утиліти для форматування чисел та грошових сум
 */

export const formatMoney = (amount: number): string => {
  // Форматування для України (з роздільниками тисяч)
  if (amount >= 0) {
    return `$${amount.toLocaleString('en-US')}`;
  } else {
    return `-$${Math.abs(amount).toLocaleString('en-US')}`;
  }
};

export const formatPercent = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

export const formatNumber = (value: number, decimals: number = 0): string => {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

export const formatCompactMoney = (amount: number): string => {
  if (Math.abs(amount) >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (Math.abs(amount) >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  } else {
    return formatMoney(amount);
  }
};

export const formatCashFlow = (income: number, expenses: number): string => {
  const flow = income - expenses;
  return formatMoney(flow);
};

export const getCashFlowColor = (income: number, expenses: number): string => {
  const flow = income - expenses;
  if (flow > 0) return '#10b981'; // green
  if (flow < 0) return '#ef4444'; // red
  return '#64748b'; // gray
};
