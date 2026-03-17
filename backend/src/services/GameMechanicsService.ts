// filepath: backend/src/services/GameMechanicsService.ts
import { Game, Player, Deal, Card, GameTurn, TurnAction, GameAction, FinancialTransaction, CellEffect } from '../../../shared/types/game';
import { PROFESSIONS, BOARD_CELLS, GAME_CONFIG } from '../../../shared/types/game';
import { GAME_CONSTANTS } from '../../../shared/constants/game';
import { CardService } from './CardService';
import TransactionService from './transactionService';

export class GameMechanicsService {
	/**
	 * Ініціалізація ігрової дошки
	 */
	public static initializeBoard(game: Game): void {
		// 1. Rat Race Layout (24 клітинки)
		const ratRaceLayout = [
			{ type: 'opportunity', title: 'МОЖЛИВІСТЬ', description: 'Мала або велика угода' },
			{ type: 'market', title: 'РИНОК', description: 'Ринкові події' },
			{ type: 'doodad', title: 'ВИТРАТИ', description: 'Незаплановані витрати' },
			{ type: 'opportunity', title: 'МОЖЛИВІСТЬ', description: 'Інвестиційний шанс' },
			{ type: 'charity', title: 'БЛАГОДІЙНІСТЬ', description: 'Зробіть внесок у добро' },
			{ type: 'payday', title: 'ЗАРПЛАТА', description: 'Отримайте свої гроші' },
			{ type: 'opportunity', title: 'МОЖЛИВІСТЬ', description: 'Нерухомість або акції' },
			{ type: 'market', title: 'РИНОК', description: 'Економічні новини' },
			{ type: 'doodad', title: 'ВИТРАТИ', description: 'Покупка дрібничок' },
			{ type: 'opportunity', title: 'МОЖЛИВІСТЬ', description: 'Орендний бізнес' },
			{ type: 'baby', title: 'ДИТИНА', description: 'Поповнення в родині! (+витрати)' },
			{ type: 'payday', title: 'ЗАРПЛАТА', description: 'День виплати' },
			{ type: 'opportunity', title: 'МОЖЛИВІСТЬ', description: 'Малий бізнес' },
			{ type: 'market', title: 'РИНОК', description: 'Зміна цін на активи' },
			{ type: 'doodad', title: 'ВИТРАТИ', description: 'Рахунки та чеки' },
			{ type: 'opportunity', title: 'МОЖЛИВІСТЬ', description: 'Золоті монети' },
			{ type: 'downsize', title: 'ЗВІЛЬНЕННЯ', description: 'Ви втратили роботу! (пропуск 2 ходів)' },
			{ type: 'payday', title: 'ЗАРПЛАТА', description: 'Отримання доходів' },
			{ type: 'opportunity', title: 'МОЖЛИВІСТЬ', description: 'Земельна ділянка' },
			{ type: 'market', title: 'РИНОК', description: 'Торгівля акціями' },
			{ type: 'doodad', title: 'ВИТРАТИ', description: 'Ремонт авто' },
			{ type: 'opportunity', title: 'МОЖЛИВІСТЬ', description: 'Бізнес на автомийці' },
			{ type: 'charity', title: 'БЛАГОДІЙНІСТЬ', description: 'Допомога іншим' },
			{ type: 'payday', title: 'ЗАРПЛАТА', description: 'Персональний дохід' }
		];

		game.board.ratRaceCells = ratRaceLayout.map((cell, id) => ({
			id,
			type: cell.type as any,
			title: cell.title,
			description: cell.description
		}));

		// 2. Fast Track Layout (16 клітинок)
		const fastTrackLayout = [
			{ type: 'cashflow_day', title: 'CASHFLOW DAY', description: 'Отримання пасивного доходу' },
			{ type: 'business', title: 'БІЗНЕС', description: 'Велике підприємство' },
			{ type: 'business', title: 'БІЗНЕС', description: 'Мережа готелів' },
			{ type: 'lawsuit', title: 'СУД', description: 'Юридичні проблеми' },
			{ type: 'business', title: 'БІЗНЕС', description: 'Агрохолдинг' },
			{ type: 'cashflow_day', title: 'CASHFLOW DAY', description: 'День виплат' },
			{ type: 'business', title: 'БІЗНЕС', description: 'Технологічний гігант' },
			{ type: 'dream_check', title: 'МРІЯ', description: 'Ваш шанс на перемогу!' },
			{ type: 'business', title: 'БІЗНЕС', description: 'Виробнича лінія' },
			{ type: 'tax_audit', title: 'ПЕРЕВІРКА', description: 'Податковий аудит' },
			{ type: 'business', title: 'БІЗНЕС', description: 'Торговельний центр' },
			{ type: 'cashflow_day', title: 'CASHFLOW DAY', description: 'Збір дивідендів' },
			{ type: 'business', title: 'БІЗНЕС', description: 'Логістична компанія' },
			{ type: 'divorce', title: 'РОЗЛУЧЕННЯ', description: 'Втрата 50% активів' },
			{ type: 'business', title: 'БІЗНЕС', description: 'Енергетичний сектор' },
			{ type: 'dream_check', title: 'МРІЯ', description: 'Перевірка мети' }
		];

		game.board.fastTrackCells = fastTrackLayout.map((cell, id) => ({
			id,
			type: cell.type as any,
			title: cell.title,
			description: cell.description
		}));

		console.log(`✅ Game board initialized for game ${game.id}`);
	}
	public static rollDiceAndMove(game: Game, playerId: string): { diceResult: number; newPosition: number; cellEffect?: CellEffect; passedPayday?: boolean; skipped?: boolean } {
		const player = game.players.find(p => p.id === playerId);
		if (!player) {
			throw new Error('Гравця не знайдено');
		}

		// Перевірка пропуску ходу (downsize)
		if ((player as any).skipTurns && (player as any).skipTurns > 0) {
			(player as any).skipTurns -= 1;
			const remaining = (player as any).skipTurns;
			console.log(`⏭️ [SKIP] ${player.name} skipped turn. Remaining skips: ${remaining}`);
			return {
				diceResult: 0,
				newPosition: player.isOnFastTrack ? player.fastTrackPosition : player.position,
				skipped: true
			};
		}

		const diceResult = Math.floor(Math.random() * GAME_CONSTANTS.DICE_SIDES) + 1;
		let passedPayday = false;

		if (player.isOnFastTrack) {
			// Рух по швидкій доріжці
			const previousPosition = player.fastTrackPosition;
			const newPosition = (previousPosition + diceResult) % GAME_CONSTANTS.FAST_TRACK_CELLS;
			
			// Перевірка проходження через Cashflow Day (клітинки 0, 5, 11)
			// Якщо ми перестрибнули або наступили на ці клітинки
			const cashflowDayCells = [0, 5, 11];
			passedPayday = cashflowDayCells.some(cell => {
				if (previousPosition < cell && newPosition >= cell) return true;
				if (newPosition < previousPosition && cell > previousPosition) return true;
				if (newPosition < previousPosition && cell <= newPosition) return true;
				return false;
			});

			player.fastTrackPosition = newPosition;
		} else {
			// Рух по щурячих перегонах
			const previousPosition = player.position;
			const newPosition = (previousPosition + diceResult) % GAME_CONSTANTS.RAT_RACE_CELLS;

			// Перевірка проходження через клітинку Payday (0)
		if (newPosition < previousPosition || newPosition === 0) {
				passedPayday = true;
			}

			player.position = newPosition;
		}

		// Визначення ефекту клітинки
		const cellEffect = this.getCellEffect(game, player);

		return {
			diceResult,
			newPosition: player.isOnFastTrack ? player.fastTrackPosition : player.position,
			cellEffect,
			passedPayday
		};
	}

	/**
	 * Отримання ефекту клітинки
	 */
	private static getCellEffect(game: Game, player: Player): CellEffect | undefined {
		const position = player.isOnFastTrack ? player.fastTrackPosition : player.position;
		// Контекст гравця для динамічних розрахунків (divorce, tax_audit)
		const playerContext = {
			playerCash: player.finances.cash,
			passiveIncome: player.finances.passiveIncome
		};

		if (player.isOnFastTrack) {
			const cell = game.board.fastTrackCells[position];
			if (!cell) return undefined;
			// cashflow_day: повертаємо спеціальний ефект 'receive_money' щоб фронт показав нотифікацію
			if (cell.type === 'cashflow_day') {
				return {
					type: 'receive_money' as any,
					data: {
						cardType: 'cashflow_day',
						amount: player.finances.passiveIncome,
						description: `💰 Cashflow Day: +$${player.finances.passiveIncome.toLocaleString('uk-UA')}`
					}
				};
			}
			return CardService.generateCellEffect(cell.type, playerContext);
		} else {
			const cell = game.board.ratRaceCells[position];
			if (!cell || cell.type === 'payday' || (cell.type as string) === 'paycheck') return undefined;
			return CardService.generateCellEffect(cell.type, playerContext);
		}
	}

	/**
	 * Отримання доходів на швидкій доріжці (Cashflow Day)
	 */
	private static async collectFastTrackIncome(player: Player, gameId: string): Promise<void> {
		// Дохід на швидкій доріжці = пасивний дохід
		const income = player.finances.passiveIncome;
		player.finances.cash += income;
		
		try {
			await TransactionService.getInstance().processSalary(player.id, gameId, income, player);
		} catch (error) {
			console.error('Error processing fast track income:', error);
		}
	}

	/**
	 * Отримання зарплати
	 */
	private static async collectSalary(player: Player, gameId: string): Promise<void> {
		// Cash Flow (Місячний грошовий потік) = (Зарплата + Пасивний дохід) - Витрати
		const cashFlow = (player.finances.salary || 0) + (player.finances.passiveIncome || 0) - (player.finances.expenses || 0);
		
		if (cashFlow > 0) {
			player.finances.cash += cashFlow;
			try {
				await TransactionService.getInstance().processSalary(player.id, gameId, cashFlow, player);
				console.log(`💰 [SALARY] Added cashflow $${cashFlow} to player ${player.name}. New balance: $${player.finances.cash}`);
			} catch (error) {
				console.error('Error processing salary transaction:', error);
			}
		} else if (cashFlow < 0) {
			// Якщо витрати перевищують доходи - списуємо різницю
			const shortfall = Math.abs(cashFlow);
			if (player.finances.cash >= shortfall) {
				player.finances.cash -= shortfall;
				console.log(`💸 [SALARY] Deducted negative cashflow $${shortfall} from player ${player.name}`);
			} else {
				// Якщо не вистачає покрити негативний потік - викликаємо payExpenses для оформлення кредиту
				await this.payExpenses(player, gameId);
			}
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
				await transactionService.processExpense(player.id, gameId, totalExpenses, 'Monthly expenses payment', undefined, player);
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
				await transactionService.processExpense(player.id, gameId, player.finances.cash, 'Monthly expenses with loan', undefined, player);
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
			// ✅ processAssetPurchase — no-op (in-memory mode), не кидає помилок
			await transactionService.processAssetPurchase(player.id, game.id, requiredCash, deal.id, `Покупка: ${deal.title}`, player);

			// Оновлюємо фінанси гравця
			player.finances.cash -= requiredCash;

			// Додаємо актив до пасивного доходу
			if (deal.cashFlow && deal.cashFlow > 0) {
				player.finances.passiveIncome += deal.cashFlow;
			}

			// Додаємо актив до балансу
			if (!player.finances.assets) player.finances.assets = [];
			player.finances.assets.push({
				id: deal.id,
				name: deal.title,
				type: deal.category as any,
				cost: deal.cost,
				cashFlow: deal.cashFlow || 0,
				downPayment: requiredCash,
				mortgage: deal.mortgage || 0,
				acquiredAt: new Date(),
				currentMultiplier: 1.0,
				purchasePrice: deal.cost,
			} as any);

			// Додаємо liability якщо є іпотека
			if (deal.mortgage && deal.mortgage > 0) {
				if (!player.finances.liabilities) player.finances.liabilities = [];
				const monthlyPayment = Math.round(deal.mortgage * 0.007);
				player.finances.liabilities.push({
					id: `liab_${deal.id}`,
					type: 'mortgage',
					name: `Іпотека: ${deal.title}`,
					amount: deal.mortgage,
					monthlyPayment,
				});
			}

			// 🆕 Перераховуємо passiveIncome з усіх активів (sync)
			this.recalculatePlayerFinances(player);

			// Помічаємо угоду як продану
			deal.isAvailable = false;
			deal.playerId = playerId;

			console.log(
				`✅ [BUY DEAL] ${player.name} bought "${deal.title}" | -$${requiredCash} | passiveIncome=$${player.finances.passiveIncome} | cash=$${player.finances.cash}`
			);

			const transaction: FinancialTransaction = {
				id: `txn_${Date.now()}`,
				playerId: player.id,
				type: 'asset_purchase',
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
					if (!cardData.card) break;

					if (cardData.cardType === 'doodad' || cardData.cardType === 'lawsuit' || cardData.cardType === 'tax_audit') {
						const cost = cardData.card.cost || 0;
						// Ми не знімаємо кошти автоматично тут, щоб гравець сам натиснув "Сплатити" на фронтенді.
						// Це запобігає подвійному списанню.
						/*
						await transactionService.processExpense(
							player.id,
							gameId,
							cost,
							cardData.card.title || 'Fast Track expense',
							undefined,
							player
						);
						player.finances.cash -= cost;
						*/
						console.log(`ℹ️ [CELL_EFFECT] Card ${cardData.cardType} drawn. Waiting for player to pay $${cost}`);
					} else if (cardData.cardType === 'baby') {
						// Baby: постійне збільшення витрат на $500/місяць
						const babyCost = 500;
						player.finances.expenses += babyCost;
						const babyCount = ((player as any).childrenCount || 0) + 1;
						(player as any).childrenCount = babyCount;
						console.log(`👶 [BABY] ${player.name} had a baby! Expenses +$${babyCost}/mo. Total children: ${babyCount}. New expenses: $${player.finances.expenses}`);
					} else if (cardData.cardType === 'downsize') {
						// Downsize: пропустити 2 ходи, якщо на Fast Track — повернутись до Rat Race
						(player as any).skipTurns = 2;
						if (player.isOnFastTrack) {
							player.isOnFastTrack = false;
							player.position = 0;
							console.log(`😱 [DOWNSIZE] ${player.name} removed from Fast Track, returned to Rat Race.`);
						}
						console.log(`😱 [DOWNSIZE] ${player.name} downsized. Will skip 2 turns.`);
					} else if (cardData.cardType === 'divorce') {
						// Divorce: автоматичне списання 50% готівки (server-side, одразу)
						const cashBefore = player.finances.cash;
						const lostAmount = Math.floor(cashBefore * 0.5);
						player.finances.cash = cashBefore - lostAmount;

						// Оновлюємо картку з реальною сумою (для emit на фронт)
						if (cardData.card) {
							cardData.card.cost = lostAmount;
							cardData.card.amount = lostAmount;
						}

						try {
							await transactionService.processExpense(
								player.id,
								gameId,
								lostAmount,
								'💔 Розлучення: втрата 50% готівки',
								undefined,
								player
							);
						} catch (error) {
							console.error('Error processing divorce transaction:', error);
						}
						console.log(`💔 [DIVORCE] ${player.name} lost $${lostAmount} (50% of $${cashBefore}). Remaining: $${player.finances.cash}`);
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
								cellEffect.data.description || 'Market gain',
								player
							);
						} else {
							await transactionService.processExpense(
								player.id,
								gameId,
								Math.abs(cellEffect.data.amount),
								cellEffect.data.description || 'Market loss',
								undefined,
								player
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
	 * Продаж активу гравця
	 * @param sellPrice — опціональна ціна; якщо не вказана, використовується cost * currentMultiplier
	 */
	public static async sellAsset(
		game: Game,
		playerId: string,
		assetId: string,
		sellPrice?: number
	): Promise<{ success: boolean; message: string; amountReceived?: number; profit?: number }> {
		const player = game.players.find(p => p.id === playerId);
		if (!player) return { success: false, message: 'Гравця не знайдено' };

		// Знаходимо актив у finances.assets
		const assetIndex = player.finances.assets.findIndex(a => a.id === assetId);
		if (assetIndex === -1) return { success: false, message: 'Актив не знайдено' };

		const asset = player.finances.assets[assetIndex];
		const multiplier = (asset as any).currentMultiplier ?? 1.0;
		const rawSellPrice = sellPrice ?? Math.floor(asset.cost * multiplier);

		// Якщо є іпотека — вираховуємо залишок боргу з виручки
		const mortgageBalance = asset.mortgage ?? 0;
		const netProceeds = rawSellPrice - mortgageBalance;

		if (netProceeds < 0) {
			return {
				success: false,
				message: `Ціна продажу $${rawSellPrice.toLocaleString()} менша за залишок іпотеки $${mortgageBalance.toLocaleString()}`
			};
		}

		// 1. Додаємо чисті кошти гравцю
		player.finances.cash += netProceeds;

		// 2. Знімаємо cashFlow з пасивного доходу
		if (asset.cashFlow > 0) {
			player.finances.passiveIncome = Math.max(0, player.finances.passiveIncome - asset.cashFlow);
		}

		// 3. Видаляємо пов'язану liability (іпотека / кредит)
		if (mortgageBalance > 0) {
			const liabilityIndex = player.finances.liabilities.findIndex(
				l => l.id === assetId || l.name.toLowerCase().includes(asset.name.toLowerCase())
			);
			if (liabilityIndex !== -1) {
				const liability = player.finances.liabilities[liabilityIndex];
				player.finances.expenses = Math.max(0, player.finances.expenses - liability.monthlyPayment);
				player.finances.liabilities.splice(liabilityIndex, 1);
			}
		}

		// 4. Видаляємо актив
		player.finances.assets.splice(assetIndex, 1);

		// 5. Розраховуємо прибуток
		const purchasePrice = (asset as any).purchasePrice ?? asset.downPayment ?? asset.cost;
		const profit = netProceeds - purchasePrice;

		// 6. Записуємо транзакцію
		const transactionService = TransactionService.getInstance();
		try {
			await transactionService.processDeal(
				player.id,
				game.id,
				netProceeds,
				'asset_sale',
				`💰 Продаж: ${asset.name} — $${netProceeds.toLocaleString('uk-UA')} (прибуток: ${profit >= 0 ? '+' : ''}$${profit.toLocaleString('uk-UA')})`,
				player
			);
		} catch (error) {
			console.error('Error processing asset sale transaction:', error);
		}

		console.log(
			`💰 [SELL_ASSET] ${player.name} sold "${asset.name}" for $${rawSellPrice.toLocaleString()} ` +
			`(net: $${netProceeds.toLocaleString()}, profit: ${profit >= 0 ? '+' : ''}$${profit.toLocaleString()}). ` +
			`New cash: $${player.finances.cash.toLocaleString()}, passiveIncome: $${player.finances.passiveIncome.toLocaleString()}`
		);

		return {
			success: true,
			message: `Продано "${asset.name}" за $${rawSellPrice.toLocaleString()}. Чиста виручка: $${netProceeds.toLocaleString()}`,
			amountReceived: netProceeds,
			profit
		};
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

		// Умова перемоги: готівка >= вартість мрії (за правилами Cashflow Kiyosaki)
		const dreamCost = player.dream?.estimatedCost || 0;
		return dreamCost > 0 && player.finances.cash >= dreamCost;
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
			playerId,
			turnNumber: game.turn,
			actions: [],
			startedAt: new Date(),
			isCompleted: false
		};

		try {
			// 1. Спочатку сплачуємо щомісячні витрати
			// 1. Щомісячні витрати अब не сплачуються щоходу окремо,
			// вони враховуються тільки під час проходження Payday або спеціальних подій.


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

			// 3.5 Отримання зарплати або доходу FT при проходженні Payday
			if (moveResult.passedPayday) {
				if (player.isOnFastTrack) {
					await this.collectFastTrackIncome(player, game.id);
				} else {
					await this.collectSalary(player, game.id);
				}
				turn.actions.push({
					id: `action_${Date.now()}_income`,
					type: 'collect_income',
					data: { amount: player.isOnFastTrack ? player.finances.passiveIncome : (player.finances.salary + player.finances.passiveIncome - player.finances.expenses) },
					timestamp: new Date()
				});
			}

			// 4. Виконуємо дію клітинки (якщо є)
			if (moveResult.cellEffect) {
				const cardData = moveResult.cellEffect.data as any;

				// 🆕 Зберігаємо opportunity/business картку в game.deals щоб buyDeal міг її знайти
				if (
					cardData?.card &&
					(cardData.cardType === 'opportunity' || cardData.cardType === 'business')
				) {
					// Видаляємо попередні незакриті deals цього гравця
					game.deals = game.deals.filter((d: Deal) => !d.isAvailable || d.playerId !== playerId);

					const newDeal: Deal = {
						id: cardData.card.id,
						type: (cardData.card.type === 'big' ? 'big' : 'small') as Deal['type'],
						category: cardData.card.category || 'real_estate',
						title: cardData.card.title,
						description: cardData.card.description || '',
						cost: cardData.card.cost || 0,
						downPayment: cardData.card.cost || cardData.card.amount || 0,
						cashFlow: cardData.card.cashFlow || 0,
						requirements: cardData.card.requirements || [],
						isAvailable: true,
						playerId, // тільки цей гравець може купити
					};
					game.deals.push(newDeal);
					console.log(`📋 [DEAL STORED] ${newDeal.title} (id: ${newDeal.id}) for player ${playerId}`);
				}

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
