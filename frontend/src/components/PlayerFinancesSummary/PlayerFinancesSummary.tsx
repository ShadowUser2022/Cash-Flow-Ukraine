import React from 'react';
import { usePlayerFinances } from '../../hooks/usePlayerFinances';
import './PlayerFinancesSummary.css';

interface PlayerFinancesSummaryProps {
	showAdvice?: boolean;
	compact?: boolean;
	className?: string;
	showTrends?: boolean;
	animated?: boolean;
}

const PlayerFinancesSummary: React.FC<PlayerFinancesSummaryProps> = ({
	showAdvice = false,
	compact = false,
	className = '',
	showTrends = false,
	animated = true
}) => {
	const finances = usePlayerFinances();

	if (!finances) return null;

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('uk-UA', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	};

	const getCashFlowStatus = () => {
		if (finances.cashFlow > 0) return { icon: '📈', status: 'positive', text: 'Прибутковий' };
		if (finances.cashFlow < 0) return { icon: '📉', status: 'negative', text: 'Збитковий' };
		return { icon: '➖', status: 'neutral', text: 'Нульовий' };
	};

	const cashFlowStatus = getCashFlowStatus();

	return (
		<div className={`player-finances-summary ${compact ? 'compact' : ''} ${animated ? 'animated' : ''} ${className}`}>
			<div className="finances-header">
				<h4>💰 Ваші фінанси</h4>
				<span className="player-name">{finances.playerName}</span>
			</div>

			<div className="finances-grid">
				<div className="finance-item cash">
					<span className="label">💵 Готівка:</span>
					<span className="value positive">{formatCurrency(finances.cash)}</span>
					{showTrends && (
						<span className="trend-indicator">
							{finances.cash > 5000 ? '📊' : '⚠️'}
						</span>
					)}
				</div>

				<div className="finance-item cashflow">
					<span className="label">{cashFlowStatus.icon} Грошовий потік:</span>
					<span className={`value ${finances.isHealthy ? 'positive' : 'negative'}`}>
						{formatCurrency(finances.cashFlow)}/міс
					</span>
					{showTrends && (
						<span className={`status-badge ${cashFlowStatus.status}`}>
							{cashFlowStatus.text}
						</span>
					)}
				</div>
			</div>

			{showAdvice && (
				<div className="financial-advice">
					<p className="advice-hint">
						💡 <strong>Рішення:</strong> {finances.advice}
					</p>
				</div>
			)}
		</div>
	);
};

export default PlayerFinancesSummary;
