
// filepath: backend/src/services/GameMechanicsService.ts
import { Game, Player, Deal, Card, GameTurn, TurnAction, GameAction, FinancialTransaction, CellEffect } from '../../../shared/types/game';
import { PROFESSIONS, BOARD_CELLS, GAME_CONFIG } from '../../../shared/types/game';
import { GAME_CONSTANTS } from '../../../shared/constants/game';
import { CardService } from './CardService';

export class GameMechanicsService {
	/**
	 * Кидання кубика та переміщення гравця
	 */
	public static rollDiceAndMove(game: Game, playerId: string): { diceResult: number; newPosition: number; cellEffect?: CellEffect } {
		const player = game.players.find(p => p.id === playerId);
		if (!player) {
			throw new Error('Гравця не знайдено');
		}

		const diceResult = Math.floor(Math.random() * GAME_CONSTANTS.DICE_SIDES) + 1;

		if (player.isOnFastTrack) {
			// Рух по швидкій доріжці
			player.fastTrackPosition = (player.fastTrackPosition + diceResult) % GAME_CONSTANTS.FAST_TRACK_CELLS;
		} else {
			// Рух по щурячих перегонах
			const newPosition = (player.position + diceResult) % GAME_CONSTANTS.RAT_RACE_CELLS;

			// Перевірка чи гравець пройшов повне коло (отримує зарплату)
			if (newPosition < player.position) {
				this.collectSalary(player);
			}

			player.position = newPosition;
		}

		// Визначення ефекту клітинки
		const cellEffect = this.getCellEffect(game, player);

		return {
			diceResult,
			newPosition: player.isOnFastTrack ? player.fastTrackPosition : player.position,
			cellEffect
		};
	}

	/**
	 * Отримання ефекту клітинки
	 */
	private static getCellEffect(game: Game, player: Player): CellEffect | undefined {
		// Для спрощення використовуємо позицію гравця для визначення типу клітинки
		const position = player.isOnFastTrack ? player.fastTrackPosition : player.position;

		// Визначаємо тип клітинки на основі позиції (спрощена логіка)
		const cellTypes = ['opportunity', 'market', 'doodad', 'charity', 'paycheck'];
		const cellTypeIndex = position % cellTypes.length;
		const cellType = cellTypes[cellTypeIndex];

		// Пропускаємо ефект для клітинки зарплати (paycheck)
		if (cellType === 'paycheck') {
			return undefined;
		}

		// Генеруємо ефект через CardService
		return CardService.generateCellEffect(cellType);
	}

	/**
	 * Отримання зарплати
	 */
	private static collectSalary(player: Player): void {
		const totalIncome = player.finances.salary + player.finances.passiveIncome;
		player.finances.cash += totalIncome;
	}

	/**
	 * Сплата витрат
	 */
	public static payExpenses(player: Player): { success: boolean; message: string } {
		const totalExpenses = player.finances.expenses;

		if (player.finances.cash >= totalExpenses) {
			player.finances.cash -= totalExpenses;
			return { success: true, message: `Сплачено витрати: $${totalExpenses}` };
		} else {
			// Якщо не вистачає готівки, гравець берет кредит
			const shortfall = totalExpenses - player.finances.cash;
			player.finances.cash = 0;

			// Додаємо заборгованість (спрощено - додаємо до витрат)
			player.finances.expenses += Math.floor(shortfall * 0.1); // 10% річних щомісяця

			return {
				success: false,
				message: `Недостатньо готівки! Взято кредит на $${shortfall}. Щомісячні витрати збільшились на $${Math.floor(shortfall * 0.1)}`
			};
		}
	}

	/**
	 * Купівля угоди
	 */
	public static buyDeal(game: Game, playerId: string, dealId: string): { success: boolean; message: string; transaction?: FinancialTransaction } {
		const player = game.players.find(p => p.id === playerId);
		const deal = game.deals.find(d => d.id === dealId && d.isAvailable);

		if (!player) return { success: false, message: 'Гравця не знайдено' };
		if (!deal) return { success: false, message: 'Угоду не знайдено або недоступна' };

		// Перевірка вимог угоди
		const canBuy = this.checkDealRequirements(player, deal);
		if (!canBuy.success) {
			return canBuy;
		}

		const requiredCash = deal.downPayment || deal.cost;

		if (player.finances.cash < requiredCash) {
			return { success: false, message: `Недостатньо готівки. Потрібно: $${requiredCash}, є: $${player.finances.cash}` };
		}

		// Виконання покупки
		player.finances.cash -= requiredCash;

		// Додавання активу
		if (deal.type === 'small' || deal.type === 'big') {
			const asset = {
				id: `asset_${Date.now()}`,
				type: deal.category as any,
				name: deal.title,
				cost: deal.cost,
				cashFlow: deal.cashFlow || 0,
				downPayment: deal.downPayment,
				mortgage: deal.mortgage,
				description: deal.description
			};

			player.finances.assets.push(asset);

			// Автоматично перераховуємо пасивний дохід з усіх активів
			this.recalculatePlayerFinances(player);
		}

		// Видалення угоди з доступних
		deal.isAvailable = false;
		deal.playerId = playerId;

		const transaction: FinancialTransaction = {
			id: `trans_${Date.now()}`,
			playerId,
			type: 'asset_purchase',
			amount: requiredCash,
			description: `Покупка: ${deal.title}`,
			recurring: false,
			timestamp: new Date()
		};

		return { success: true, message: `Успішно придбано: ${deal.title}`, transaction };
	}

	/**
	 * Перевірка вимог угоди
	 */
	private static checkDealRequirements(player: Player, deal: Deal): { success: boolean; message: string } {
		if (!deal.requirements) return { success: true, message: '' };

		for (const requirement of deal.requirements) {
			switch (requirement.type) {
				case 'profession':
					if (player.profession.name !== requirement.value) {
						return { success: false, message: `Потрібна професія: ${requirement.value}` };
					}
					break;

				case 'cash':
					if (player.finances.cash < requirement.value) {
						return { success: false, message: `Потрібно готівки: $${requirement.value}` };
					}
					break;

				case 'passive_income':
					if (player.finances.passiveIncome < requirement.value) {
						return { success: false, message: `Потрібен пасивний дохід: $${requirement.value}` };
					}
					break;
			}
		}

		return { success: true, message: '' };
	}

	/**
	 * Перевірка умов переходу на швидку доріжку
	 */
	public static checkFastTrackEligibility(player: Player): boolean {
		return player.finances.passiveIncome >= player.finances.expenses;
	}

	/**
	 * Переведення гравця на швидку доріжку
	 */
	public static moveToFastTrack(player: Player): void {
		if (this.checkFastTrackEligibility(player)) {
			player.isOnFastTrack = true;
			player.fastTrackPosition = 0;
		}
	}

	/**
	 * Генерація нових угод
	 */
	public static generateDeals(game: Game, count: number = 4): Deal[] {
		const dealTemplates = this.getDealTemplates();
		const newDeals: Deal[] = [];

		for (let i = 0; i < count; i++) {
			const template = dealTemplates[Math.floor(Math.random() * dealTemplates.length)];
			const deal: Deal = {
				...template,
				id: `deal_${Date.now()}_${i}`,
				isAvailable: true
			};
			newDeals.push(deal);
		}

		game.deals = [...game.deals.filter(d => !d.isAvailable), ...newDeals];
		return newDeals;
	}

	/**
	 * Шаблони угод
	 */
	private static getDealTemplates(): Omit<Deal, 'id' | 'isAvailable'>[] {
		return [
			// Малі угоди
			{
				type: 'small',
				category: 'real_estate',
				title: 'Дуплекс',
				description: 'Невеличкий житловий будинок на 2 родини',
				cost: 45000,
				downPayment: 5000,
				mortgage: 40000,
				cashFlow: 100
			},
			{
				type: 'small',
				category: 'stocks',
				title: 'Акції IT компанії',
				description: 'Зростаюча технологічна компанія',
				cost: 1000,
				cashFlow: 50
			},
			{
				type: 'small',
				category: 'business',
				title: 'Автомийка',
				description: 'Невеличкий бізнес з автомийки',
				cost: 15000,
				downPayment: 3000,
				cashFlow: 300
			},

			// Великі угоди
			{
				type: 'big',
				category: 'real_estate',
				title: 'Апартмент-комплекс',
				description: 'Житловий комплекс на 20 квартир',
				cost: 750000,
				downPayment: 150000,
				cashFlow: 5000,
				requirements: [
					{ type: 'cash', value: 150000, description: 'Необхідна готівка для першого внеску' }
				]
			},
			{
				type: 'big',
				category: 'business',
				title: 'Мережа ресторанів',
				description: 'Франшиза популярної мережі',
				cost: 500000,
				downPayment: 100000,
				cashFlow: 8000,
				requirements: [
					{ type: 'passive_income', value: 3000, description: 'Необхідний досвід пасивного доходу' }
				]
			},

			// Doodads (витрати)
			{
				type: 'doodad',
				category: 'expense',
				title: 'Новий автомобіль',
				description: 'Престижний автомобіль у кредит',
				cost: 35000,
				cashFlow: -300
			},
			{
				type: 'doodad',
				category: 'expense',
				title: 'Відпустка',
				description: 'Дорога відпустка у кредит',
				cost: 5000,
				cashFlow: -50
			}
		];
	}

	/**
	 * Виконання ходу гравця
	 */
	public static executeTurn(game: Game, playerId: string): GameTurn {
		const player = game.players.find(p => p.id === playerId);
		if (!player) {
			throw new Error('Гравця не знайдено');
		}

		const turn: GameTurn = {
			playerId,
			turnNumber: game.turn,
			actions: [],
			startedAt: new Date(),
			isCompleted: false
		};

		try {
			// 1. Спочатку сплачуємо витрати
			const expenseResult = this.payExpenses(player);
			turn.actions.push({
				id: `action_${Date.now()}_expense`,
				type: 'pay_expense',
				data: { amount: player.finances.expenses },
				result: expenseResult,
				timestamp: new Date()
			});

			// 2. Отримуємо дохід
			const income = player.finances.salary + player.finances.passiveIncome;
			player.finances.cash += income;
			turn.actions.push({
				id: `action_${Date.now()}_income`,
				type: 'collect_income',
				data: { amount: income },
				result: { message: `Отримано доходу: $${income}` },
				timestamp: new Date()
			});

			// 3. Кидаємо кубик і рухаємось
			const moveResult = this.rollDiceAndMove(game, playerId);
			turn.diceRoll = moveResult.diceResult;
			turn.actions.push({
				id: `action_${Date.now()}_move`,
				type: 'move',
				data: { diceRoll: moveResult.diceResult, newPosition: moveResult.newPosition },
				result: moveResult,
				timestamp: new Date()
			});

			// 4. Виконуємо дію клітинки (якщо є)
			if (moveResult.cellEffect) {
				turn.actions.push({
					id: `action_${Date.now()}_cell`,
					type: 'draw_card',
					data: moveResult.cellEffect.data,
					result: { effectType: moveResult.cellEffect.type },
					timestamp: new Date()
				});
			}

			// 5. Перевіряємо можливість переходу на швидку доріжку
			if (!player.isOnFastTrack && this.checkFastTrackEligibility(player)) {
				// Пропонуємо перехід (це буде окрема дія користувача)
				turn.actions.push({
					id: `action_${Date.now()}_fasttrack_check`,
					type: 'move',
					data: { fastTrackEligible: true },
					result: { message: 'Можливий перехід на швидку доріжку!' },
					timestamp: new Date()
				});
			}

			turn.completedAt = new Date();
			turn.isCompleted = true;

		} catch (error) {
			console.error('Помилка під час виконання ходу:', error);
			turn.actions.push({
				id: `action_${Date.now()}_error`,
				type: 'move',
				data: { error: error instanceof Error ? error.message : 'Невідома помилка' },
				result: { success: false },
				timestamp: new Date()
			});
		}

		return turn;
	}

	/**
	 * Перехід до наступного гравця
	 */
	public static nextPlayer(game: Game): string {
		const currentPlayerIndex = game.players.findIndex(p => p.id === game.currentPlayer);
		const nextPlayerIndex = (currentPlayerIndex + 1) % game.players.length;
		game.currentPlayer = game.players[nextPlayerIndex].id;
		game.turn++;
		return game.currentPlayer;
	}

	/**
	 * Перевірка умов перемоги
	 */
	public static checkWinCondition(player: Player): boolean {
		if (!player.isOnFastTrack) return false;

		// Умова перемоги: пасивний дохід >= $50,000 або досягнення фінансової мрії
		return player.finances.passiveIncome >= 50000;
	}

	/**
	 * Перерахунок фінансових показників гравця
	 */
	public static recalculatePlayerFinances(player: Player): void {
		// Перерахунок пасивного доходу з усіх активів
		let passiveIncome = 0;
		player.finances.assets.forEach(asset => {
			passiveIncome += asset.cashFlow || 0;
		});
		player.finances.passiveIncome = passiveIncome;

		// Перерахунок загальних витрат (професійні + зобов'язання)
		let totalExpenses = player.profession?.expenses || 0;
		player.finances.liabilities.forEach(liability => {
			totalExpenses += liability.monthlyPayment || 0;
		});
		player.finances.expenses = totalExpenses;

		console.log(`💰 Recalculated finances for ${player.name}:`, {
			passiveIncome: player.finances.passiveIncome,
			expenses: player.finances.expenses,
			assets: player.finances.assets.length,
			liabilities: player.finances.liabilities.length
		});
	}
}
