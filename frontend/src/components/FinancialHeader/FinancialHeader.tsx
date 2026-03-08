import React from 'react';
import type { Player } from '../../types';
import { FinancialCalculator } from '../../services/FinancialCalculator';
import './FinancialHeader.css';

interface FinancialHeaderProps {
	player: Player | null;
}

const FinancialHeader: React.FC<FinancialHeaderProps> = ({ player }) => {
	if (!player) {
		return null;
	}

	// Використовуємо централізований калькулятор
	const cashBalance = FinancialCalculator.getCash(player);
	const monthlyIncome = FinancialCalculator.getMonthlyIncome(player);
	const monthlyExpenses = FinancialCalculator.getMonthlyExpenses(player);
	const netCashFlow = FinancialCalculator.getNetCashFlow(player);
	const cashFlowStatus = FinancialCalculator.getCashFlowStatus(player);

	return (
		<div className="financial-header">
			<div className="financial-stat cash-balance">
				<div className="stat-icon">💰</div>
				<div className="stat-content">
					<div className="stat-label">Готівка</div>
					<div className="stat-value">{FinancialCalculator.formatMoney(cashBalance)}</div>
				</div>
			</div>

			<div className="financial-stat monthly-income">
				<div className="stat-icon">📈</div>
				<div className="stat-content">
					<div className="stat-label">Місячний прихід</div>
					<div className="stat-value positive">{FinancialCalculator.formatMoney(monthlyIncome)}</div>
				</div>
			</div>

			<div className="financial-stat monthly-expenses">
				<div className="stat-icon">📉</div>
				<div className="stat-content">
					<div className="stat-label">Місячні витрати</div>
					<div className="stat-value negative">{FinancialCalculator.formatMoney(monthlyExpenses)}</div>
				</div>
			</div>

			<div className={`financial-stat net-cash-flow ${netCashFlow >= 0 ? 'positive-flow' : 'negative-flow'}`}>
				<div className="stat-icon">{cashFlowStatus.icon}</div>
				<div className="stat-content">
					<div className="stat-label">Cash Flow</div>
					<div className={`stat-value ${netCashFlow >= 0 ? 'positive' : 'negative'}`}>
						{netCashFlow >= 0 ? '+' : ''}{FinancialCalculator.formatMoney(netCashFlow)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default FinancialHeader;
