// FinancialIntegration.ts - Сервіс для інтеграції фінансових змін при ефектах клітинок
import type { Player, CellEffect } from '../types';

export interface FinancialTransaction {
	type: 'income' | 'expense' | 'asset_change' | 'liability_change';
	amount: number;
	reason: string;
	category?: string;
	isAutomatic: boolean;
}

export interface FinancialUpdateResult {
	success: boolean;
	transactions: FinancialTransaction[];
	newFinances: Player['finances'];
	message: string;
	shouldNotify: boolean;
}

export class FinancialIntegration {

	// Обробка фінансових ефектів клітинки
	static applyFinancialEffect(player: Player, cellEffect: CellEffect): FinancialUpdateResult {
		const currentFinances = player.finances || {
			cash: 5000,
			salary: 3000,
			passiveIncome: 0,
			expenses: 2000,
			assets: [],
			liabilities: []
		};

		const transactions: FinancialTransaction[] = [];
		let newFinances = { ...currentFinances };
		let message = '';
		let shouldNotify = true;

		switch (cellEffect.type) {
			case 'receive_money':
				const receiveAmount = cellEffect.data.amount || 0;
				newFinances.cash += receiveAmount;
				transactions.push({
					type: 'income',
					amount: receiveAmount,
					reason: cellEffect.data.reason || 'Отримання грошей',
					isAutomatic: cellEffect.data.automatic || false
				});
				message = `+$${receiveAmount.toLocaleString()} - ${cellEffect.data.reason}`;
				break;

			case 'pay_money':
				const payAmount = cellEffect.data.amount || 0;
				if (newFinances.cash >= payAmount) {
					newFinances.cash -= payAmount;
					transactions.push({
						type: 'expense',
						amount: payAmount,
						reason: cellEffect.data.reason || 'Витрата',
						isAutomatic: cellEffect.data.automatic || false
					});
					message = `-$${payAmount.toLocaleString()} - ${cellEffect.data.reason}`;
				} else {
					// Недостатньо грошей - взяти в борг
					const debt = payAmount - newFinances.cash;
					newFinances.cash = 0;

					// Додати борг до зобов'язань
					const creditCardDebt = newFinances.liabilities.find(l => l.name === 'Кредитні карти');
					if (creditCardDebt) {
						creditCardDebt.amount += debt;
						creditCardDebt.monthlyPayment += Math.floor(debt * 0.1); // 10% мінімальний платіж
					} else {
						newFinances.liabilities.push({
							id: `credit-${Date.now()}`,
							type: 'credit_card',
							name: 'Кредитні карти',
							amount: debt,
							monthlyPayment: Math.floor(debt * 0.1) // 10% мінімальний платіж
						});
					}

					transactions.push({
						type: 'expense',
						amount: payAmount,
						reason: cellEffect.data.reason || 'Витрата (в борг)',
						isAutomatic: cellEffect.data.automatic || false
					});
					message = `-$${payAmount.toLocaleString()} - ${cellEffect.data.reason} (взято в борг $${debt.toLocaleString()})`;
				}
				break;

			case 'choose_charity':
				// Благодійність - це вибір гравця, тому тільки показуємо опції
				message = `Благодійність: пожертвувати $${cellEffect.data.amount?.toLocaleString() || '0'} або пройти повз`;
				shouldNotify = false;
				break;

			case 'market_event':
				// Ринкові події впливають на активи
				message = FinancialIntegration.applyMarketEvent(newFinances, transactions);
				break;

			case 'dream_check':
				// Перевірка мрії або переходу на швидку доріжку
				if (cellEffect.data.isVictory) {
					message = '🏆 Ви досягли своєї мрії і перемогли в грі!';
				} else {
					const passiveIncome = newFinances.passiveIncome || 0;
					const expenses = newFinances.expenses || 0;
					const requiredIncome = cellEffect.data.requiredIncome || expenses * 1.2;

					if (passiveIncome >= requiredIncome) {
						message = `✅ Ви можете перейти на швидку доріжку! Пасивний дохід $${passiveIncome.toLocaleString()} > витрат $${expenses.toLocaleString()}`;
					} else {
						message = `❌ Поки не можете на швидку доріжку. Потрібно $${requiredIncome.toLocaleString()} пасивного доходу, у вас $${passiveIncome.toLocaleString()}`;
					}
				}
				break;

			default:
				message = 'Невідомий ефект клітинки';
				shouldNotify = false;
		}

		// Оновлюємо розраховані поля
		newFinances = FinancialIntegration.recalculateFinances(newFinances);

		return {
			success: true,
			transactions,
			newFinances,
			message,
			shouldNotify
		};
	}

	// Обробка ринкових подій
	private static applyMarketEvent(finances: Player['finances'], transactions: FinancialTransaction[]): string {
		const marketEvents = [
			{
				name: 'Зростання нерухомості',
				effect: () => {
					let totalChange = 0;
					finances.assets.forEach(asset => {
						if (asset.name.includes('будинок') || asset.name.includes('квартира')) {
							const change = Math.floor(asset.cost * 0.1); // 10% зростання
							asset.cost += change;
							totalChange += change;
						}
					});
					return totalChange > 0 ? `Вартість нерухомості зросла на $${totalChange.toLocaleString()}` : 'Ринок нерухомості стабільний';
				}
			},
			{
				name: 'Падіння акцій',
				effect: () => {
					let totalChange = 0;
					finances.assets.forEach(asset => {
						if (asset.name.includes('акції') || asset.name.includes('інвестиції')) {
							const change = Math.floor(asset.cost * 0.15); // 15% падіння
							asset.cost = Math.max(0, asset.cost - change);
							totalChange += change;
						}
					});
					return totalChange > 0 ? `Акції впали, втрата $${totalChange.toLocaleString()}` : 'Фондовий ринок стабільний';
				}
			},
			{
				name: 'Бонус від інвестицій',
				effect: () => {
					const bonusAmount = Math.floor(Math.random() * 500) + 200;
					finances.cash += bonusAmount;
					transactions.push({
						type: 'income',
						amount: bonusAmount,
						reason: 'Дивіденди від інвестицій',
						isAutomatic: true
					});
					return `Отримано дивіденди $${bonusAmount.toLocaleString()}`;
				}
			}
		];

		const randomEvent = marketEvents[Math.floor(Math.random() * marketEvents.length)];
		return randomEvent.effect();
	}

	// Перерахунок фінансових показників
	private static recalculateFinances(finances: Player['finances']): Player['finances'] {
		// Розрахунок пасивного доходу з активів
		let passiveIncome = 0;
		finances.assets.forEach(asset => {
			passiveIncome += asset.cashFlow || 0;
		});

		// Розрахунок витрат (включаючи зобов'язання)
		let totalExpenses = finances.expenses || 0;
		finances.liabilities.forEach(liability => {
			totalExpenses += liability.monthlyPayment || 0;
		});

		const result = {
			...finances,
			passiveIncome,
			expenses: totalExpenses
		};

		console.log('🔄 Frontend: Recalculated finances:', {
			assetsCount: finances.assets.length,
			liabilitiesCount: finances.liabilities.length,
			passiveIncome,
			totalExpenses,
			canMoveToFastTrack: passiveIncome > totalExpenses
		});

		return result;
	}

	// Обробка вибору благодійності
	static applyCharityChoice(player: Player, donate: boolean, amount: number): FinancialUpdateResult {
		const currentFinances = player.finances || {
			cash: 5000,
			salary: 3000,
			passiveIncome: 0,
			expenses: 2000,
			assets: [],
			liabilities: []
		};

		const transactions: FinancialTransaction[] = [];
		let newFinances = { ...currentFinances };
		let message = '';

		if (donate) {
			if (newFinances.cash >= amount) {
				newFinances.cash -= amount;
				transactions.push({
					type: 'expense',
					amount,
					reason: 'Благодійний внесок',
					category: 'charity',
					isAutomatic: false
				});
				message = `Ви пожертвували $${amount.toLocaleString()} на благодійність ❤️`;
			} else {
				message = 'Недостатньо грошей для пожертви';
				return {
					success: false,
					transactions: [],
					newFinances: currentFinances,
					message,
					shouldNotify: true
				};
			}
		} else {
			message = 'Ви вирішили не робити пожертву цього разу';
		}

		newFinances = FinancialIntegration.recalculateFinances(newFinances);

		return {
			success: true,
			transactions,
			newFinances,
			message,
			shouldNotify: true
		};
	}

	// Форматування повідомлення про зміни фінансів
	static formatFinancialMessage(result: FinancialUpdateResult): string {
		let message = result.message;

		if (result.transactions.length > 1) {
			message += '\n\nДеталі:';
			result.transactions.forEach(transaction => {
				const sign = transaction.type === 'income' ? '+' : '-';
				message += `\n${sign}$${transaction.amount.toLocaleString()} - ${transaction.reason}`;
			});
		}

		return message;
	}
}
