import { Game, Player, GameState, Deal, Card, GameTurn, TurnAction, CellEffect } from '../../../shared/types/game';
import { PROFESSIONS, BOARD_CELLS, GAME_CONFIG } from '../../../shared/types/game';
// import { GameModel } from '../models/Game'; // Тимчасово вимкнено
import { DealService } from './DealService';
import { GameMechanicsService } from './GameMechanicsService';
import { CardService } from './CardService';
import { v4 as uuidv4 } from 'uuid';

// Тимчасове зберігання в пам'яті замість MongoDB
const gamesStorage = new Map<string, Game>();

export class GameService {
	private dealService: DealService;

	constructor() {
		this.dealService = new DealService();
	}

	async createGame(hostId: string): Promise<Game> {
		const gameId = this.generateGameId();

		const game: Game = {
			id: gameId,
			hostId,
			players: [],
			state: GameState.WAITING,
			currentPlayer: '',
			turn: 0,
			settings: {
				maxPlayers: 6,
				timeLimit: 3600,
				language: 'uk',
				allowSpectators: false,
				difficulty: 'normal'
			},
			board: {
				ratRaceCells: [],
				fastTrackCells: []
			},
			createdAt: new Date(),
			updatedAt: new Date(),
			deals: [],
			marketEvents: [],
			negotiations: []
		};

		// Зберігаємо в пам'яті замість MongoDB
		gamesStorage.set(gameId, game);

		console.log(`Game created: ${gameId} by host: ${hostId}`);
		return game;
	}

	async getGame(gameId: string): Promise<Game | null> {
		// Отримуємо з пам'яті замість MongoDB
		return gamesStorage.get(gameId) || null;
	}

	async updateGame(gameId: string, updates: Partial<Game>): Promise<Game | null> {
		const game = gamesStorage.get(gameId);
		if (!game) return null;

		const updatedGame = { ...game, ...updates, updatedAt: new Date() };
		gamesStorage.set(gameId, updatedGame);

		return updatedGame;
	}

	async deleteGame(gameId: string): Promise<boolean> {
		return gamesStorage.delete(gameId);
	}

	async addPlayer(gameId: string, player: Omit<Player, 'id'>): Promise<Game | null> {
		const game = gamesStorage.get(gameId);
		if (!game) return null;

		if (game.players.length >= game.settings.maxPlayers) {
			throw new Error('Game is full');
		}

		const newPlayer: Player = {
			id: uuidv4(),
			...player,
			position: 0,
			fastTrackPosition: -1,
			finances: {
				salary: player.profession.salary,
				passiveIncome: 0,
				expenses: player.profession.expenses,
				cash: 0,
				assets: [],
				liabilities: []
			},
			assets: [],
			passiveIncome: 0,
			isOnFastTrack: false,
			isReady: false,
			isConnected: true
		};

		game.players.push(newPlayer);
		game.updatedAt = new Date();

		gamesStorage.set(gameId, game);

		console.log(`Player ${newPlayer.name} joined game ${gameId}`);
		return game;
	}

	async addPlayerWithId(gameId: string, player: Player): Promise<Game | null> {
		console.log('addPlayerWithId called with player:', player);

		const game = gamesStorage.get(gameId);
		if (!game) return null;

		if (game.players.length >= game.settings.maxPlayers) {
			throw new Error('Game is full');
		}

		// Перевіряємо, чи playerId вже існує
		if (player.id) {
			const existingPlayer = game.players.find(p => p.id === player.id);
			if (existingPlayer) {
				throw new Error('Player with this ID already exists in the game');
			}
		}

		// Використовуємо переданий playerId або генеруємо новий
		const finalId = player.id || uuidv4();

		const newPlayer: Player = {
			...player,
			id: finalId,
		};

		console.log('Created newPlayer with id:', newPlayer.id, 'original player.id was:', player.id);

		game.players.push(newPlayer);
		game.updatedAt = new Date();

		gamesStorage.set(gameId, game);

		console.log(`Player ${newPlayer.name} (${newPlayer.id}) joined game ${gameId}`);
		return game;
	}

	async removePlayer(gameId: string, playerId: string): Promise<Game | null> {
		const game = gamesStorage.get(gameId);
		if (!game) return null;

		game.players = game.players.filter(p => p.id !== playerId);
		game.updatedAt = new Date();

		gamesStorage.set(gameId, game);

		console.log(`Player ${playerId} left game ${gameId}`);
		return game;
	}

	async updatePlayerReadyStatus(gameId: string, playerId: string, isReady: boolean): Promise<Game | null> {
		const game = gamesStorage.get(gameId);
		if (!game) return null;

		const player = game.players.find(p => p.id === playerId);
		if (!player) return null;

		player.isReady = isReady;
		game.updatedAt = new Date();

		gamesStorage.set(gameId, game);

		console.log(`Player ${playerId} ready status: ${isReady} in game ${gameId}`);
		return game;
	}

	async startGame(gameId: string): Promise<Game | null> {
		const game = gamesStorage.get(gameId);
		if (!game) return null;

		if (game.players.length < 2) {
			throw new Error('Need at least 2 players to start');
		}

		if (!game.players.every(p => p.isReady)) {
			throw new Error('All players must be ready');
		}

		// Ініціалізуємо початкові фінанси для кожного гравця
		game.players.forEach(player => {
			player.finances.cash = player.profession.salary * 12; // Річна зарплата як стартові гроші
		});

		game.state = GameState.IN_PROGRESS;
		game.currentPlayer = game.players[0].id;
		game.turn = 1;
		game.updatedAt = new Date();

		gamesStorage.set(gameId, game);

		console.log(`Game ${gameId} started with ${game.players.length} players`);
		return game;
	}

	private generateGameId(): string {
		// Генеруємо короткий код для гри (наприклад: A1B2C3)
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
		let result = '';
		for (let i = 0; i < 6; i++) {
			result += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return result;
	}

	async getGamesList(): Promise<Game[]> {
		return Array.from(gamesStorage.values())
			.filter(game => game.state === GameState.WAITING)
			.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
	}

	// Очищення старих ігор (викликається періодично)
	async cleanupOldGames(): Promise<void> {
		const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 години

		for (const [gameId, game] of gamesStorage.entries()) {
			if (game.updatedAt < cutoffTime && game.state !== GameState.IN_PROGRESS) {
				gamesStorage.delete(gameId);
				console.log(`Cleaned up old game: ${gameId}`);
			}
		}
	}

	// ================== GAME MECHANICS METHODS ==================

	/**
	 * Кидання кубика та переміщення гравця з автоматичною генерацією карток подій
	 */
	async rollDice(gameId: string, playerId: string): Promise<{ diceResult: number; newPosition: number; cellEffect?: CellEffect; eventCard?: any } | null> {
		const game = gamesStorage.get(gameId);
		if (!game) return null;

		if (game.state !== GameState.IN_PROGRESS) {
			throw new Error('Game is not in progress');
		}

		if (game.currentPlayer !== playerId) {
			throw new Error('Not your turn');
		}

		const result = GameMechanicsService.rollDiceAndMove(game, playerId);

		// Генеруємо карту події після переміщення
		const eventCard = await this.generateRandomEventCard(gameId, playerId);

		// Зберігаємо оновлену гру
		game.updatedAt = new Date();
		gamesStorage.set(gameId, game);

		console.log(`Player ${playerId} rolled ${result.diceResult} and drew event card in game ${gameId}`);
		return { ...result, eventCard };
	}

	/**
	 * Завершення ходу гравця з обробкою щомісячних фінансів
	 */
	async endTurn(gameId: string, playerId: string): Promise<{ game: Game; monthlyFinances?: any } | null> {
		const game = gamesStorage.get(gameId);
		if (!game) return null;

		if (game.currentPlayer !== playerId) {
			throw new Error('Not your turn');
		}

		// Обробляємо щомісячні фінанси для поточного гравця
		const monthlyFinances = await this.processMonthlyFinances(gameId, playerId);

		// Перевіряємо можливість переходу на швидку доріжку
		const fastTrackCheck = await this.checkFastTrackConditionUpdated(gameId, playerId);

		// Переходимо до наступного гравця
		const currentPlayerIndex = game.players.findIndex(p => p.id === playerId);
		const nextPlayerIndex = (currentPlayerIndex + 1) % game.players.length;

		game.currentPlayer = game.players[nextPlayerIndex].id;
		game.turn += 1;
		game.updatedAt = new Date();

		gamesStorage.set(gameId, game);

		console.log(`Turn ended for player ${playerId}, next player: ${game.currentPlayer} in game ${gameId}`);
		console.log(`Monthly finances processed:`, monthlyFinances);
		console.log(`Fast track check:`, fastTrackCheck);

		return { 
			game, 
			monthlyFinances: {
				...monthlyFinances,
				fastTrackCheck
			}
		};
	}

	/**
	 * Отримання карти угоди
	 */
	async drawDeal(gameId: string, type: 'small' | 'big' | 'market' | 'doodad'): Promise<Deal | null> {
		const game = gamesStorage.get(gameId);
		if (!game) return null;

		try {
			const deal = await this.dealService.getRandomDeal(type);
			console.log(`Drew ${type} deal: ${deal.title} in game ${gameId}`);
			return deal;
		} catch (error) {
			console.error('Error drawing deal:', error);
			return null;
		}
	}

	/**
	 * Виконання угоди гравцем (застарілий метод, використовуйте executeDealWithFinancialUpdate)
	 */
	async executeDeal(gameId: string, playerId: string, dealId: string, action: 'buy' | 'pass'): Promise<Game | null> {
		return this.executeDealWithFinancialUpdate(gameId, playerId, dealId, action);
	}

	/**
	 * Перевірка умови переходу на швидку доріжку (застарілий метод)
	 */
	async checkFastTrackCondition(gameId: string, playerId: string): Promise<boolean> {
		const result = await this.checkFastTrackConditionUpdated(gameId, playerId);
		return result.canMove;
	}

	/**
	 * Отримання стану гри для клієнта
	 */
	async getGameState(gameId: string): Promise<any> {
		const game = gamesStorage.get(gameId);
		if (!game) return null;

		return {
			id: game.id,
			state: game.state,
			currentPlayer: game.currentPlayer,
			turn: game.turn,
			players: game.players.map(player => ({
				id: player.id,
				name: player.name,
				profession: player.profession,
				position: player.position,
				fastTrackPosition: player.fastTrackPosition,
				isOnFastTrack: player.isOnFastTrack,
				isReady: player.isReady,
				isConnected: player.isConnected,
				finances: player.finances
			})),
			settings: game.settings
		};
	}

	async updatePlayerProfession(gameId: string, playerId: string, professionName: string): Promise<Game | null> {
		const game = gamesStorage.get(gameId);
		if (!game) return null;

		const player = game.players.find(p => p.id === playerId);
		if (!player) return null;

		// Find the profession data
		const profession = PROFESSIONS.find(p => p.name === professionName);
		if (!profession) {
			throw new Error(`Invalid profession: ${professionName}`);
		}

		player.profession = profession;
		game.updatedAt = new Date();

		gamesStorage.set(gameId, game);

		console.log(`Player ${playerId} profession updated to ${professionName} in game ${gameId}`);
		return game;
	}

	// ================== EVENT CARD GENERATION ==================

	/**
	 * Генерація випадкової карти події після ходу гравця
	 */
	async generateRandomEventCard(gameId: string, playerId: string): Promise<any> {
		const cardTypes = ['opportunity', 'market', 'doodad', 'charity'];
		const randomType = cardTypes[Math.floor(Math.random() * cardTypes.length)];

		let eventCard = null;

		switch (randomType) {
			case 'opportunity':
				eventCard = CardService.generateOpportunityCard();
				break;
			case 'market':
				eventCard = CardService.generateMarketCard();
				break;
			case 'doodad':
				eventCard = CardService.generateDoodadCard();
				break;
			case 'charity':
				eventCard = this.generateCharityCard();
				break;
		}

		console.log(`Generated ${randomType} card for player ${playerId} in game ${gameId}`);
		return {
			type: 'event_card',
			cardType: randomType,
			card: eventCard
		};
	}

	/**
	 * Генерація карти благодійності
	 */
	private generateCharityCard(): any {
		const charityOptions = [
			{
				title: 'Допомога дитячому будинку',
				description: 'Місцевий дитячий будинок потребує допомоги на ремонт. Ваша пожертва може змінити життя дітей.',
				suggestedAmount: 500
			},
			{
				title: 'Підтримка притулку для тварин',
				description: 'Притулок для безпритульних тварин збирає кошти на корм і медичну допомогу.',
				suggestedAmount: 300
			},
			{
				title: 'Екологічний проект',
				description: 'Місцева організація садить дерева в парках міста. Ваша підтримка допоможе зеленому майбутньому.',
				suggestedAmount: 200
			},
			{
				title: 'Освітня програма',
				description: 'Благодійний фонд надає стипендії талановитим студентам з малозабезпечених сімей.',
				suggestedAmount: 1000
			}
		];

		const randomCharity = charityOptions[Math.floor(Math.random() * charityOptions.length)];

		return {
			id: `charity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
			type: 'charity',
			category: 'charity',
			title: randomCharity.title,
			description: randomCharity.description,
			amount: randomCharity.suggestedAmount,
			options: [
				{ label: 'Пожертвувати 10%', value: 10, amount: Math.floor(randomCharity.suggestedAmount * 0.1) },
				{ label: 'Пожертвувати 20%', value: 20, amount: Math.floor(randomCharity.suggestedAmount * 0.2) },
				{ label: 'Пожертвувати повну суму', value: 100, amount: randomCharity.suggestedAmount },
				{ label: 'Пропустити', value: 0, amount: 0 }
			],
			isActive: true
		};
	}

	// ================== FINANCIAL CALCULATIONS ==================

	/**
	 * Виконання угоди та оновлення фінансів гравця
	 */
	async executeDealWithFinancialUpdate(gameId: string, playerId: string, dealId: string, action: 'buy' | 'pass'): Promise<Game | null> {
		const game = gamesStorage.get(gameId);
		if (!game) return null;

		const player = game.players.find(p => p.id === playerId);
		if (!player) return null;

		if (action === 'buy') {
			// Знаходимо угоду
			const deal = await this.dealService.getRandomDeal('small'); // Тимчасово, потім треба знайти по ID
			if (!deal) return null;

			// Виконуємо покупку з перевіркою фінансів
			const result = GameMechanicsService.buyDeal(game, playerId, dealId);
			
			if (result.success) {
				// Оновлюємо розраховані фінансові показники
				this.recalculatePlayerFinances(player);
				
				// Логуємо транзакцію
				console.log(`Player ${playerId} bought deal ${dealId}: ${result.message}`);
			}
		}

		game.updatedAt = new Date();
		gamesStorage.set(gameId, game);
		return game;
	}

	/**
	 * Перерахунок фінансових показників гравця
	 */
	private recalculatePlayerFinances(player: Player): void {
		// Розрахунок пасивного доходу з усіх активів
		let totalPassiveIncome = 0;
		player.finances.assets.forEach(asset => {
			totalPassiveIncome += asset.cashFlow || 0;
		});
		player.finances.passiveIncome = totalPassiveIncome;

		// Розрахунок загальних витрат (включаючи платежі по зобов'язаннях)
		let totalExpenses = player.profession.expenses;
		player.finances.liabilities.forEach(liability => {
			totalExpenses += liability.monthlyPayment || 0;
		});
		player.finances.expenses = totalExpenses;

		// Оновлюємо дублювані поля для зворотної сумісності
		player.passiveIncome = player.finances.passiveIncome;

		console.log(`Recalculated finances for ${player.name}: Passive Income: $${totalPassiveIncome}, Total Expenses: $${totalExpenses}`);
	}

	/**
	 * Обробка щомісячного грошового потоку
	 */
	async processMonthlyFinances(gameId: string, playerId: string): Promise<{ 
		salary: number; 
		passiveIncome: number; 
		totalExpenses: number; 
		netCashFlow: number; 
		newCashBalance: number; 
	} | null> {
		const game = gamesStorage.get(gameId);
		if (!game) return null;

		const player = game.players.find(p => p.id === playerId);
		if (!player) return null;

		// Перерахунок перед обробкою
		this.recalculatePlayerFinances(player);

		const salary = player.finances.salary;
		const passiveIncome = player.finances.passiveIncome;
		const totalExpenses = player.finances.expenses;
		const netCashFlow = salary + passiveIncome - totalExpenses;

		// Оновлюємо готівку
		player.finances.cash += netCashFlow;

		// Перевіряємо чи готівка не стала від'ємною
		if (player.finances.cash < 0) {
			// Автоматично беремо кредит для покриття від'ємного балансу
			const debtAmount = Math.abs(player.finances.cash);
			player.finances.cash = 0;

			// Додаємо кредитне зобов'язання
			const existingDebt = player.finances.liabilities.find(l => l.type === 'credit_card');
			if (existingDebt) {
				existingDebt.amount += debtAmount;
				existingDebt.monthlyPayment += Math.floor(debtAmount * 0.1); // 10% мінімальний платіж
			} else {
				player.finances.liabilities.push({
					id: `credit_${Date.now()}`,
					type: 'credit_card',
					name: 'Кредитні карти',
					amount: debtAmount,
					monthlyPayment: Math.floor(debtAmount * 0.1)
				});
			}

			console.log(`Player ${playerId} went into debt: $${debtAmount}`);
		}

		game.updatedAt = new Date();
		gamesStorage.set(gameId, game);

		const result = {
			salary,
			passiveIncome,
			totalExpenses,
			netCashFlow,
			newCashBalance: player.finances.cash
		};

		console.log(`Monthly finances processed for ${player.name}:`, result);
		return result;
	}

	/**
	 * Перевірка умови переходу на швидку доріжку з поновленими розрахунками
	 */
	async checkFastTrackConditionUpdated(gameId: string, playerId: string): Promise<{ canMove: boolean; passiveIncome: number; expenses: number; message: string }> {
		const game = gamesStorage.get(gameId);
		if (!game) return { canMove: false, passiveIncome: 0, expenses: 0, message: 'Гра не знайдена' };

		const player = game.players.find(p => p.id === playerId);
		if (!player) return { canMove: false, passiveIncome: 0, expenses: 0, message: 'Гравець не знайдений' };

		// Перерахунок фінансових показників
		this.recalculatePlayerFinances(player);

		const passiveIncome = player.finances.passiveIncome;
		const expenses = player.finances.expenses;
		const canMove = passiveIncome > expenses && !player.isOnFastTrack;

		let message = '';
		if (canMove) {
			player.isOnFastTrack = true;
			player.fastTrackPosition = 0;
			message = `🎉 Вітаємо! Ви перейшли на швидку доріжку! Пасивний дохід $${passiveIncome.toLocaleString()} > витрат $${expenses.toLocaleString()}`;
			
			game.updatedAt = new Date();
			gamesStorage.set(gameId, game);
		} else if (player.isOnFastTrack) {
			message = `Ви вже на швидкій доріжці`;
		} else {
			const required = expenses + 1;
			message = `Ще не готові до швидкої доріжки. Потрібно $${required.toLocaleString()} пасивного доходу, у вас $${passiveIncome.toLocaleString()}`;
		}

		console.log(`Fast track check for ${player.name}: ${message}`);
		return { canMove, passiveIncome, expenses, message };
	}

	/**
	 * Обробка вибору благодійності
	 */
	async processCharityChoice(gameId: string, playerId: string, donate: boolean, amount: number): Promise<{
		success: boolean;
		newCashBalance: number;
		message: string;
		transaction?: any;
	} | null> {
		const game = gamesStorage.get(gameId);
		if (!game) return null;

		const player = game.players.find(p => p.id === playerId);
		if (!player) return null;

		let success = false;
		let message = '';
		let transaction = null;

		if (donate && amount > 0) {
			if (player.finances.cash >= amount) {
				player.finances.cash -= amount;
				success = true;
				message = `Ви пожертвували $${amount.toLocaleString()} на благодійність ❤️`;
				
				transaction = {
					id: `charity_${Date.now()}`,
					playerId,
					type: 'expense',
					amount,
					description: 'Благодійний внесок',
					recurring: false,
					timestamp: new Date()
				};

				// Можна додати бонус за велику благодійність
				if (amount >= 1000) {
					message += ' Ваша щедрість буде винагороджена!';
				}
			} else {
				message = `Недостатньо коштів для пожертви $${amount.toLocaleString()}. У вас є $${player.finances.cash.toLocaleString()}`;
			}
		} else {
			success = true;
			message = 'Ви вирішили не робити пожертву цього разу';
		}

		game.updatedAt = new Date();
		gamesStorage.set(gameId, game);

		console.log(`Charity choice processed for ${player.name}: ${message}`);
		return {
			success,
			newCashBalance: player.finances.cash,
			message,
			transaction
		};
	}

	/**
	 * Обробка сплати витрат
	 */
	async processExpensePayment(gameId: string, playerId: string, amount: number, reason: string = 'Незаплановані витрати'): Promise<{
		success: boolean;
		newCashBalance: number;
		message: string;
		transaction?: any;
		debtAdded?: number;
	} | null> {
		const game = gamesStorage.get(gameId);
		if (!game) return null;

		const player = game.players.find(p => p.id === playerId);
		if (!player) return null;

		let success = true;
		let message = '';
		let transaction = null;
		let debtAdded = 0;

		if (player.finances.cash >= amount) {
			// Достатньо готівки для сплати
			player.finances.cash -= amount;
			message = `Сплачено $${amount.toLocaleString()} - ${reason}`;
		} else {
			// Недостатньо готівки - беремо в борг
			const debt = amount - player.finances.cash;
			player.finances.cash = 0;
			debtAdded = debt;

			// Додаємо зобов'язання
			const existingDebt = player.finances.liabilities.find(l => l.type === 'credit_card');
			if (existingDebt) {
				existingDebt.amount += debt;
				existingDebt.monthlyPayment += Math.floor(debt * 0.1);
			} else {
				player.finances.liabilities.push({
					id: `credit_${Date.now()}`,
					type: 'credit_card',
					name: 'Кредитні карти',
					amount: debt,
					monthlyPayment: Math.floor(debt * 0.1)
				});
			}

			message = `Сплачено $${amount.toLocaleString()} - ${reason} (взято в борг $${debt.toLocaleString()})`;
		}

		transaction = {
			id: `expense_${Date.now()}`,
			playerId,
			type: 'expense',
			amount,
			description: reason,
			recurring: false,
			timestamp: new Date()
		};

		// Перерахунок фінансів після змін
		this.recalculatePlayerFinances(player);

		game.updatedAt = new Date();
		gamesStorage.set(gameId, game);

		console.log(`Expense payment processed for ${player.name}: ${message}`);
		return {
			success,
			newCashBalance: player.finances.cash,
			message,
			transaction,
			debtAdded
		};
	}
}
