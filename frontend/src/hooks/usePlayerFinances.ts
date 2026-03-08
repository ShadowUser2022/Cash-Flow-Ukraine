import useGameStore from '../store/gameStore';
import { FinancialCalculator } from '../services/FinancialCalculator';

export const usePlayerFinances = () => {
	const { currentPlayer } = useGameStore();

	if (!currentPlayer) {
		return null;
	}

	const { name } = currentPlayer;
	
	// Використовуємо централізований калькулятор
	const cash = FinancialCalculator.getCash(currentPlayer);
	const monthlyIncome = FinancialCalculator.getMonthlyIncome(currentPlayer);
	const monthlyExpenses = FinancialCalculator.getMonthlyExpenses(currentPlayer);
	const cashFlow = FinancialCalculator.getNetCashFlow(currentPlayer);
	const totalAssetsValue = FinancialCalculator.getTotalAssets(currentPlayer);
	const totalLiabilitiesValue = FinancialCalculator.getTotalLiabilities(currentPlayer);
	const netWorth = FinancialCalculator.getNetWorth(currentPlayer);
	
	// Розрахунок фінансових показників
	const totalAssetsCashFlow = FinancialCalculator.getPassiveIncomeFromAssets(currentPlayer);
	const financialFreedomNumber = Math.abs(monthlyExpenses) * 12; // Скільки потрібно щоб покрити річні витрати
	const monthsOfRunway = cash > 0 && monthlyExpenses > 0 ? Math.floor(cash / Math.abs(monthlyExpenses)) : 0;

	const getFinancialAdvice = () => {
		return FinancialCalculator.getFinancialAdvice(currentPlayer);
	};

	const getFinancialStatus = (): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' => {
		if (cash < 500 || cashFlow < -1000) return 'critical';
		if (cash < 1000 || cashFlow < 0) return 'poor';
		if (cashFlow === 0 || cash < 3000) return 'fair';
		if (cashFlow > 0 && cash > 5000) return 'good';
		if (cashFlow > 2000 && cash > 10000) return 'excellent';
		return 'fair';
	};

	return {
		playerName: name,
		cash,
		monthlyIncome,
		monthlyExpenses,
		cashFlow,
		passiveIncome: currentPlayer.finances.passiveIncome || 0,
		expenses: monthlyExpenses,
		advice: getFinancialAdvice(),
		isHealthy: cashFlow >= 0,
		// Додаткові показники
		totalAssetsValue,
		totalLiabilitiesValue,
		netWorth,
		totalAssetsCashFlow,
		financialFreedomNumber,
		monthsOfRunway,
		financialStatus: getFinancialStatus(),
		// Трендові індикатори
		trends: {
			cashTrend: cash > 5000 ? 'up' : cash < 1000 ? 'down' : 'stable',
			cashFlowTrend: cashFlow > 500 ? 'up' : cashFlow < 0 ? 'down' : 'stable'
		}
	};
};
