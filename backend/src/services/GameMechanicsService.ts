// filepath: backend/src/services/GameMechanicsService.ts
import { Game, Player, Deal, Card, GameTurn, TurnAction, GameAction, FinancialTransaction, CellEffect } from '../../../shared/types/game';
import { PROFESSIONS, BOARD_CELLS, GAME_CONFIG } from '../../../shared/types/game';
import { GAME_CONSTANTS } from '../../../shared/constants/game';
import { CardService } from './CardService';
import TransactionService from './transactionService';

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

			// НЕ обробляємо зарплату тут - вона обробляється в executeTurn()

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
	private static async collectSalary(player: Player, gameId: string): Promise<void> {
		const totalIncome = player.finances.salary + player.finances.passiveIncome;
		player.finances.cash += totalIncome;
		
		// Створюємо транзакцію в БД
		try {
			await TransactionService.getInstance().processSalary(player.id, gameId, totalIncome);
		} catch (error) {
			console.error('Error processing salary transaction:', error);
		}
	}

	/**
	 * Сплата витрат
	 */
	public static async payExpenses(player: Player, gameId: string): Promise<{ success: boolean; message: string }> {
		const totalExpenses = player.finances.expenses;
		const transactionService = TransactionService.getInstance();

		if (player.finances.cash >= totalExpenses) {
			player.finances.cash -= totalExpenses;
			
			// Створюємо транзакцію в БД
			try {
				await transactionService.processExpense(player.id, gameId, totalExpenses, 'Monthly expenses payment');
			} catch (error) {
				console.error('Error processing expense transaction:', error);
			}
			
			return { success: true, message: `Сплачено витрати: $${totalExpenses}` };
		} else {
			// Якщо не вистачає готівки, гравець берет кредит
			const shortfall = totalExpenses - player.finances.cash;
			player.finances.cash = 0;

			// Додаємо заборгованість (спрощено - додаємо до витрат)
			const interestAmount = Math.floor(shortfall * 0.1); // 10% річних щомісяця
			player.finances.expenses += interestAmount;

			// Створюємо транзакцію в БД
			try {
				await transactionService.processExpense(player.id, gameId, player.finances.cash, 'Monthly expenses with loan');
			} catch (error) {
				console.error('Error processing expense transaction:', error);
			}

			return {
				success: false,
				message: `Недостатньо готівки! Взято кредит на $${shortfall}. Щомісячні витрати збільшились на $${interestAmount}`
			};
		}
	}

	/**
	 * Купівля угоди
	 */
	public static async buyDeal(game: Game, playerId: string, dealId: string): Promise<{ success: boolean; message: string; transaction?: FinancialTransaction }> {
		const player = game.players.find(p => p.id === playerId);
		const deal = game.deals.find(d => d.id === dealId && d.isAvailable);
		const transactionService = TransactionService.getInstance();

		if (!player || !deal) {
			return { success: false, message: 'Гравця або угоду не знайдено' };
		}

		// Перевіряємо вимоги
		const requirementCheck = this.checkDealRequirements(player, deal);
		if (!requirementCheck.success) {
			return { success: false, message: requirementCheck.message };
		}

		const requiredCash = deal.downPayment || deal.cost || 0;
		if (player.finances.cash < requiredCash) {
			return { success: false, message: `Недостатньо готівки. Потрібно: $${requiredCash}` };
		}

		try {
			// Створюємо транзакцію в БД
			await transactionService.processAssetPurchase(player.id, game.id, requiredCash, deal.id, `Покупка: ${deal.title}`);

			// Оновлюємо фінанси гравця
			player.finances.cash -= requiredCash;
			
			// Додаємо актив до пасивного доходу
			if (deal.cashFlow && deal.cashFlow > 0) {
				player.finances.passiveIncome += deal.cashFlow;
			}

			// Додаємо актив
			player.finances.assets.push({
				id: deal.id,
				name: deal.title,
				type: deal.category,
				cost: deal.cost,
				cashFlow: deal.cashFlow,
				acquiredAt: new Date()
			});

			// Помічаємо угоду як продану
			deal.isAvailable = false;
			deal.playerId = playerId;

			const transaction: FinancialTransaction = {
				id: `txn_${Date.now()}`,
				amount: requiredCash,
				description: `Покупка: ${deal.title}`,
				recurring: false,
				timestamp: new Date()
			};

			return { success: true, message: `Успішно придбано: ${deal.title}`, transaction };
		} catch (error) {
			console.error('Error processing deal purchase:', error);
			return { success: false, message: 'Помилка при покупці угоди' };
		}
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
	 * Обробка фінансових ефектів клітинки
	 */
	private static async processCellEffect(player: Player, gameId: string, cellEffect: CellEffect): Promise<void> {
		const transactionService = TransactionService.getInstance();
		
		try {
			switch (cellEffect.type) {
				case 'draw_card':
					const cardData = cellEffect.data as any;
					if (cardData.cardType === 'doodad' && cardData.card) {
						// Обробляємо витрати на doodad
						await transactionService.processExpense(
							player.id,
							gameId,
							cardData.card.cost || 0,
							cardData.card.title || 'Doodad expense'
						);
						player.finances.cash -= cardData.card.cost || 0;
					}
					break;
					
				case 'choose_charity':
					// Благодійність обробляється окремо
					break;
					
				case 'market_event':
					// Ринкові події
					if (cellEffect.data?.amount) {
						if (cellEffect.data.amount > 0) {
							await transactionService.processDeal(
								player.id,
								gameId,
								cellEffect.data.amount,
								'market_event',
								cellEffect.data.description || 'Market gain'
							);
						} else {
							await transactionService.processExpense(
								player.id,
								gameId,
								Math.abs(cellEffect.data.amount),
								cellEffect.data.description || 'Market loss'
							);
						}
						player.finances.cash += cellEffect.data.amount;
					}
					break;
			}
		} catch (error) {
			console.error('Error processing cell effect:', error);
		}
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
	 * Перехід до наступного гравця
	 */
	public static nextPlayer(game: Game): string {
		const currentPlayerIndex = game.players.findIndex(p => p.id === game.currentPlayer);
		const nextPlayerIndex = (currentPlayerIndex + 1) % game.players.length;
		return game.players[nextPlayerIndex].id;
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
		let passiveIncome = 0;
		let totalExpenses = player.profession?.expenses || 0;

		player.finances.assets.forEach(asset => {
			if (asset.cashFlow && asset.cashFlow > 0) {
				passiveIncome += asset.cashFlow;
			}
		});

		player.finances.liabilities.forEach(liability => {
			if (liability.monthlyPayment) {
				totalExpenses += liability.monthlyPayment;
			}
		});

		player.finances.passiveIncome = passiveIncome;
		player.finances.expenses = totalExpenses;

		console.log(`💰 Recalculated finances for ${player.name}:`, {
			passiveIncome,
			expenses: totalExpenses,
			cashFlow: passiveIncome - totalExpenses
		});
	}

	/**
	 * Виконання повного ходу гравця
	 */
	public static async executeTurn(game: Game, playerId: string): Promise<GameTurn> {
		const player = game.players.find(p => p.id === playerId);
		if (!player) {
			throw new Error('Гравця не знайдено');
		}

		const turn: GameTurn = {
			id: `turn_${game.id}_${playerId}_${Date.now()}`,
			gameId: game.id,
			playerId,
			turnNumber: game.turn,
			actions: [],
			startedAt: new Date(),
			isCompleted: false
		};

		try {
			// 1. Спочатку сплачуємо щомісячні витрати
			const expenseResult = await this.payExpenses(player, game.id);
			turn.actions.push({
				id: `action_${Date.now()}_expense`,
				type: 'pay_expense',
				data: { amount: player.finances.expenses },
				result: { message: expenseResult.message },
				timestamp: new Date()
			});

			// 2. Кидання кубика та переміщення
			const moveResult = this.rollDiceAndMove(game, playerId);

			// 3. Додаємо дію переміщення
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

				// Обробляємо фінансові ефекти клітинки
				await this.processCellEffect(player, game.id, moveResult.cellEffect);
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
	 * Генерація нових угод
	 */
	public static generateDeals(game: Game, count: number): Deal[] {
		const templates = this.getDealTemplates();
		const newDeals: Deal[] = [];

		for (let i = 0; i < count; i++) {
			const template = templates[Math.floor(Math.random() * templates.length)];
			const deal: Deal = {
				id: `deal_${Date.now()}_${i}`,
				...template,
				isAvailable: true
			};
			newDeals.push(deal);
		}

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
				cost: 50000,
				downPayment: 10000,
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
				title: 'Дорогий відпочинок',
				description: 'Тиждень на Мальдівах коштував більше, ніж планували. Витрати на подорожі зросли.',
				cost: 3500,
				cashFlow: -200
			}
		];
	}
}
