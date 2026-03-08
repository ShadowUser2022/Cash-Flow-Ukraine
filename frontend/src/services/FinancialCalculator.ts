import type { Player } from '../types/game';

/**
 * Централізований сервіс для всіх фінансових розрахунків
 * Забезпечує єдине джерело правди для фінансових даних
 */
export class FinancialCalculator {
	/**
	 * Отримати актуальні фінанси гравця
	 */
	static getPlayerFinances(player: Player): Player['finances'] | null {
		if (!player?.finances) return null;
		
		// Повертаємо копію щоб уникнути мутацій
		return {
			...player.finances,
			assets: player.finances.assets || [],
			liabilities: player.finances.liabilities || []
		};
	}

	/**
	 * Розрахувати готівку
	 */
	static getCash(player: Player): number {
		return player?.finances?.cash || 0;
	}

	/**
	 * Розрахувати щомісячний дохід (зарплата + пасивний дохід)
	 */
	static getMonthlyIncome(player: Player): number {
		if (!player?.finances) return 0;
		const salary = player.finances.salary || 0;
		const passiveIncome = player.finances.passiveIncome || 0;
		return salary + passiveIncome;
	}

	/**
	 * Розрахувати щомісячні витрати
	 */
	static getMonthlyExpenses(player: Player): number {
		return player?.finances?.expenses || 0;
	}

	/**
	 * Розрахувати чистий грошовий потік (дохід - витрати)
	 */
	static getNetCashFlow(player: Player): number {
		const income = this.getMonthlyIncome(player);
		const expenses = this.getMonthlyExpenses(player);
		return income - expenses;
	}

	/**
	 * Розрахувати загальну вартість активів
	 */
	static getTotalAssets(player: Player): number {
		if (!player?.finances?.assets) return 0;
		
		return player.finances.assets.reduce((sum, asset) => {
			// Пріоритет: value > purchasePrice > cost
			const value = asset.value || asset.purchasePrice || asset.cost || 0;
			return sum + value;
		}, 0);
	}

	/**
	 * Розрахувати загальну суму зобов'язань
	 */
	static getTotalLiabilities(player: Player): number {
		if (!player?.finances?.liabilities) return 0;
		
		return player.finances.liabilities.reduce((sum, liability) => {
			// Пріоритет: amount > value
			const amount = liability.amount || liability.value || 0;
			return sum + amount;
		}, 0);
	}

	/**
	 * Розрахувати чисту вартість (активи - зобов'язання + готівка)
	 */
	static getNetWorth(player: Player): number {
		const cash = this.getCash(player);
		const assets = this.getTotalAssets(player);
		const liabilities = this.getTotalLiabilities(player);
		return cash + assets - liabilities;
	}

	/**
	 * Розрахувати пасивний дохід від активів
	 */
	static getPassiveIncomeFromAssets(player: Player): number {
		if (!player?.finances?.assets) return 0;
		
		return player.finances.assets.reduce((sum, asset) => {
			return sum + (asset.cashFlow || 0);
		}, 0);
	}

	/**
	 * Перевірити чи може гравець зробити хід (пасивний дохід >= витрати)
	 */
	static canMakeMove(player: Player): boolean {
		if (!player?.finances) return false;
		const passiveIncome = player.finances.passiveIncome || 0;
		const expenses = player.finances.expenses || 0;
		return passiveIncome >= expenses;
	}

	/**
	 * Перевірити чи достатньо готівки для покупки
	 */
	static canAfford(player: Player, amount: number): boolean {
		const cash = this.getCash(player);
		return cash >= amount;
	}

	/**
	 * Форматувати суму в гривнях
	 */
	static formatMoney(amount: number): string {
		if (!amount && amount !== 0) return '0₴';
		const formatted = new Intl.NumberFormat('uk-UA').format(Math.round(amount));
		return `${formatted}₴`;
	}

	/**
	 * Форматувати суму в доларах США
	 */
	static formatMoneyUSD(amount: number): string {
		if (!amount && amount !== 0) return '$0';
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	}

	/**
	 * Отримати статус грошового потоку з кольором та іконкою
	 */
	static getCashFlowStatus(player: Player): {
		value: number;
		status: 'positive' | 'negative' | 'neutral';
		icon: string;
		color: string;
		text: string;
	} {
		const cashFlow = this.getNetCashFlow(player);
		
		if (cashFlow > 0) {
			return {
				value: cashFlow,
				status: 'positive',
				icon: '📈',
				color: '#28a745',
				text: 'Прибутковий'
			};
		}
		
		if (cashFlow < 0) {
			return {
				value: cashFlow,
				status: 'negative',
				icon: '📉',
				color: '#dc3545',
				text: 'Збитковий'
			};
		}
		
		return {
			value: cashFlow,
			status: 'neutral',
			icon: '➖',
			color: '#6c757d',
			text: 'Нульовий'
		};
	}

	/**
	 * Отримати кольори для відображення сум
	 */
	static getAmountColor(amount: number): string {
		if (amount > 0) return '#28a745'; // Зелений для позитивних
		if (amount < 0) return '#dc3545'; // Червоний для негативних
		return '#6c757d'; // Сірий для нуля
	}

	/**
	 * Отримати фінансову пораду
	 */
	static getFinancialAdvice(player: Player): string {
		const cash = this.getCash(player);
		const cashFlow = this.getNetCashFlow(player);
		
		// Критична ситуація
		if (cash < 500) {
			return "🚨 КРИТИЧНО! Негайно знайдіть джерело доходу!";
		}

		// Мало готівки
		if (cash < 1000) {
			return "⚠️ Обережно - мало готівки! Зменшіть витрати.";
		}

		// Негативний грошовий потік
		if (cashFlow < 0) {
			return "📉 Негативний потік! Збільшуйте пасивний дохід або зменшуйте витрати.";
		}

		// Хороша ситуація
		if (cashFlow > 0 && cash > 5000) {
			return "💡 Чудово! Час інвестувати в активи, що генерують дохід.";
		}

		// Помірна ситуація
		if (cashFlow > 0) {
			return "📈 Позитивний потік! Можна ризикувати, але обережно.";
		}

		// Нейтральна ситуація
		return "⚖️ Стабільна ситуація. Подумайте про інвестиції.";
	}
}
