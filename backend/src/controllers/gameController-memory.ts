import express, { Request, Response, RequestHandler } from 'express';
import { GameService } from '../services/GameService-memory';
import { Player } from '../../../shared/types/game';
// import { GameMechanicsService } from '../services/GameMechanicsService';

const router = express.Router();
const gameService = new GameService();
// const gameMechanicsService = new GameMechanicsService();

// Створити нову гру
const createGame: RequestHandler = async (req: Request, res: Response): Promise<void> => {
	try {
		const { hostId } = req.body;

		if (!hostId) {
			res.status(400).json({ error: 'Host ID is required' });
			return;
		}

		const game = await gameService.createGame(hostId);

		res.status(201).json({
			success: true,
			game: {
				id: game.id,
				hostId: game.hostId,
				state: game.state,
				playerCount: game.players.length,
				maxPlayers: game.settings.maxPlayers,
				createdAt: game.createdAt
			}
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
		console.error('Error creating game:', error);
		res.status(500).json({
			error: 'Failed to create game',
			message: errorMessage
		});
	}
};

// Отримати інформацію про гру
const getGame: RequestHandler = async (req: Request, res: Response): Promise<void> => {
	try {
		const { gameId } = req.params;

		const game = await gameService.getGame(gameId);

		if (!game) {
			res.status(404).json({ error: 'Game not found' });
			return;
		}

		res.json({
			success: true,
			game: {
				id: game.id,
				hostId: game.hostId,
				players: game.players.map(p => ({
					id: p.id,
					name: p.name,
					profession: p.profession,
					isReady: p.isReady,
					isConnected: p.isConnected
				})),
				state: game.state,
				currentPlayer: game.currentPlayer,
				turn: game.turn,
				settings: game.settings,
				createdAt: game.createdAt,
				updatedAt: game.updatedAt
			}
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
		console.error('Error getting game:', error);
		res.status(500).json({
			error: 'Failed to get game',
			message: errorMessage
		});
	}
};

// Приєднатися до гри
const joinGame: RequestHandler = async (req: Request, res: Response): Promise<void> => {
	try {
		const { gameId } = req.params;
		const { playerId, name, profession } = req.body;

		console.log('joinGame called with:', { gameId, playerId, name, profession });

		if (!name || !profession) {
			res.status(400).json({ error: 'Player name and profession are required' });
			return;
		}

		// Спроба додати гравця з переданим playerId
		const playerData = {
			id: playerId, // Передаємо playerId, якщо є
			name,
			profession,
			position: 0,
			fastTrackPosition: -1,
			finances: {
				salary: profession.salary,
				passiveIncome: 0,
				expenses: profession.expenses,
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

		console.log('Player data before calling service:', playerData);

		const game = await gameService.addPlayerWithId(gameId, playerData as Player);

		if (!game) {
			res.status(404).json({ error: 'Game not found' });
			return;
		}

		res.json({
			success: true,
			message: 'Successfully joined game',
			game: {
				id: game.id,
				playerCount: game.players.length,
				players: game.players.map((p: any) => ({
					id: p.id,
					name: p.name,
					profession: p.profession,
					isReady: p.isReady
				}))
			}
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
		console.error('Error joining game:', error);
		res.status(500).json({
			error: 'Failed to join game',
			message: errorMessage
		});
	}
};

// Покинути гру
const leaveGame: RequestHandler = async (req: Request, res: Response): Promise<void> => {
	try {
		const { gameId, playerId } = req.params;

		const game = await gameService.removePlayer(gameId, playerId);

		if (!game) {
			res.status(404).json({ error: 'Game not found' });
			return;
		}

		res.json({
			success: true,
			message: 'Successfully left game'
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
		console.error('Error leaving game:', error);
		res.status(500).json({
			error: 'Failed to leave game',
			message: errorMessage
		});
	}
};

// Змінити статус готовності
const setPlayerReady: RequestHandler = async (req: Request, res: Response): Promise<void> => {
	try {
		const { gameId, playerId } = req.params;
		const { isReady } = req.body;

		const game = await gameService.updatePlayerReadyStatus(gameId, playerId, isReady);

		if (!game) {
			res.status(404).json({ error: 'Game not found' });
			return;
		}

		res.json({
			success: true,
			message: `Player ready status updated to ${isReady}`
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
		console.error('Error updating player ready status:', error);
		res.status(500).json({
			error: 'Failed to update ready status',
			message: errorMessage
		});
	}
};

// Почати гру
const startGame: RequestHandler = async (req: Request, res: Response): Promise<void> => {
	try {
		const { gameId } = req.params;

		const game = await gameService.startGame(gameId);

		if (!game) {
			res.status(404).json({ error: 'Game not found' });
			return;
		}

		res.json({
			success: true,
			message: 'Game started successfully',
			game: {
				id: game.id,
				state: game.state,
				currentPlayer: game.currentPlayer,
				turn: game.turn
			}
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
		console.error('Error starting game:', error);
		res.status(500).json({
			error: 'Failed to start game',
			message: errorMessage
		});
	}
};

// Отримати список доступних ігор
const getGamesList: RequestHandler = async (req: Request, res: Response): Promise<void> => {
	try {
		const games = await gameService.getGamesList();

		res.json({
			success: true,
			games: games.map(game => ({
				id: game.id,
				hostId: game.hostId,
				playerCount: game.players.length,
				maxPlayers: game.settings.maxPlayers,
				state: game.state,
				createdAt: game.createdAt
			}))
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
		console.error('Error getting games list:', error);
		res.status(500).json({
			error: 'Failed to get games list',
			message: errorMessage
		});
	}
};

// Кидання кубика
const rollDice: RequestHandler = async (req: Request, res: Response): Promise<void> => {
	try {
		const { gameId } = req.params;
		const { playerId } = req.body;

		if (!playerId) {
			res.status(400).json({ error: 'Player ID is required' });
			return;
		}

		const result = await gameService.rollDice(gameId, playerId);

		if (!result) {
			res.status(404).json({ error: 'Game not found' });
			return;
		}

		res.json({
			success: true,
			result
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
		console.error('Error rolling dice:', error);
		res.status(500).json({
			error: 'Failed to roll dice',
			message: errorMessage
		});
	}
};

// Завершення ходу
const endTurn: RequestHandler = async (req: Request, res: Response): Promise<void> => {
	try {
		const { gameId } = req.params;
		const { playerId } = req.body;

		if (!playerId) {
			res.status(400).json({ error: 'Player ID is required' });
			return;
		}

		const game = await gameService.endTurn(gameId, playerId);

		if (!game) {
			res.status(404).json({ error: 'Game not found' });
			return;
		}

		res.json({
			success: true,
			message: 'Turn ended successfully',
			currentPlayer: game.currentPlayer,
			turn: game.turn
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
		console.error('Error ending turn:', error);
		res.status(500).json({
			error: 'Failed to end turn',
			message: errorMessage
		});
	}
};

// Взяття карти угоди
const drawDeal: RequestHandler = async (req: Request, res: Response): Promise<void> => {
	try {
		const { gameId } = req.params;
		const { type } = req.body; // 'small' | 'big' | 'market' | 'doodad'

		if (!type || !['small', 'big', 'market', 'doodad'].includes(type)) {
			res.status(400).json({ error: 'Valid deal type is required' });
			return;
		}

		const deal = await gameService.drawDeal(gameId, type);

		if (!deal) {
			res.status(404).json({ error: 'Game not found or no deals available' });
			return;
		}

		res.json({
			success: true,
			deal
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
		console.error('Error drawing deal:', error);
		res.status(500).json({
			error: 'Failed to draw deal',
			message: errorMessage
		});
	}
};

// Виконання угоди
const executeDeal: RequestHandler = async (req: Request, res: Response): Promise<void> => {
	try {
		const { gameId } = req.params;
		const { playerId, dealId, action } = req.body; // action: 'buy' | 'pass'

		if (!playerId || !dealId || !action || !['buy', 'pass'].includes(action)) {
			res.status(400).json({ error: 'Valid player ID, deal ID, and action are required' });
			return;
		}

		const game = await gameService.executeDeal(gameId, playerId, dealId, action);

		if (!game) {
			res.status(404).json({ error: 'Game not found' });
			return;
		}

		res.json({
			success: true,
			message: `Deal ${action}ed successfully`
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
		console.error('Error executing deal:', error);
		res.status(500).json({
			error: 'Failed to execute deal',
			message: errorMessage
		});
	}
};

// Отримання стану гри
const getGameState: RequestHandler = async (req: Request, res: Response): Promise<void> => {
	try {
		const { gameId } = req.params;

		const gameState = await gameService.getGameState(gameId);

		if (!gameState) {
			res.status(404).json({ error: 'Game not found' });
			return;
		}

		res.json({
			success: true,
			gameState
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
		console.error('Error getting game state:', error);
		res.status(500).json({
			error: 'Failed to get game state',
			message: errorMessage
		});
	}
};

// Змінити професію гравця
const changeProfession: RequestHandler = async (req: Request, res: Response): Promise<void> => {
	try {
		const { gameId } = req.params;
		const { playerId, professionName } = req.body;

		if (!playerId || !professionName) {
			res.status(400).json({ error: 'Player ID and profession name are required' });
			return;
		}

		const game = await gameService.updatePlayerProfession(gameId, playerId, professionName);

		if (!game) {
			res.status(404).json({ error: 'Game not found' });
			return;
		}

		res.json({
			success: true,
			message: `Player profession updated to ${professionName}`
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
		console.error('Error updating player profession:', error);
		res.status(500).json({
			error: 'Failed to update profession',
			message: errorMessage
		});
	}
};

// Видалити гравця з гри
const removePlayer: RequestHandler = async (req: Request, res: Response): Promise<void> => {
	try {
		const { gameId } = req.params;
		const { hostId, playerIdToRemove } = req.body;

		if (!hostId || !playerIdToRemove) {
			res.status(400).json({ error: 'Host ID and player ID to remove are required' });
			return;
		}

		// Check if the requester is actually the host
		const game = await gameService.getGame(gameId);
		if (!game) {
			res.status(404).json({ error: 'Game not found' });
			return;
		}

		if (game.hostId !== hostId) {
			res.status(403).json({ error: 'Only the host can remove players' });
			return;
		}

		const updatedGame = await gameService.removePlayer(gameId, playerIdToRemove);

		res.json({
			success: true,
			message: 'Player removed successfully'
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
		console.error('Error removing player:', error);
		res.status(500).json({
			error: 'Failed to remove player',
			message: errorMessage
		});
	}
};

// Alternative endpoint for ready status matching frontend expectations
const setPlayerReadySimple: RequestHandler = async (req: Request, res: Response): Promise<void> => {
	try {
		const { gameId } = req.params;
		const { playerId, isReady } = req.body;

		if (!playerId || typeof isReady !== 'boolean') {
			res.status(400).json({ error: 'Player ID and isReady boolean are required' });
			return;
		}

		const game = await gameService.updatePlayerReadyStatus(gameId, playerId, isReady);

		if (!game) {
			res.status(404).json({ error: 'Game not found' });
			return;
		}

		res.json({
			success: true,
			message: `Player ready status updated to ${isReady}`
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
		console.error('Error updating player ready status:', error);
		res.status(500).json({
			error: 'Failed to update ready status',
			message: errorMessage
		});
	}
};

// Маршрути
router.post('/create', createGame);
router.get('/list', getGamesList);
router.get('/:gameId', getGame);
router.get('/:gameId/state', getGameState);
router.post('/:gameId/join', joinGame);
router.delete('/:gameId/players/:playerId', leaveGame);
router.patch('/:gameId/players/:playerId/ready', setPlayerReady);
router.post('/:gameId/profession', changeProfession);
router.post('/:gameId/ready', setPlayerReadySimple);
router.post('/:gameId/remove-player', removePlayer);
router.post('/:gameId/start', startGame);
router.post('/:gameId/roll-dice', rollDice);
router.post('/:gameId/end-turn', endTurn);
router.post('/:gameId/draw-deal', drawDeal);
router.post('/:gameId/execute-deal', executeDeal);
router.patch('/:gameId/players/:playerId/profession', changeProfession);
router.delete('/:gameId/players/remove', removePlayer);
router.patch('/:gameId/players/:playerId/ready-simple', setPlayerReadySimple);

// CommonJS export для сумісності з server.js
module.exports = { gameRoutes: router };

// ES6 export залишаємо для TypeScript
export { router as gameRoutes };
