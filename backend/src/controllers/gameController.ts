import express, { Request, Response, RequestHandler } from 'express';
import { GameService } from '../services/GameService';
import { GameMechanicsService } from '../services/GameMechanicsService';

const router = express.Router();
const gameService = new GameService();
const gameMechanicsService = new GameMechanicsService();

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

router.post('/create', createGame);

// Отримати інформацію про гру
const getGame: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { gameId } = req.params;
    
    const game = await gameService.getGame(gameId);
    
    res.json({
      success: true,
      game: {
        id: game.id,
        hostId: game.hostId,
        state: game.state,
        playerCount: game.players.length,
        maxPlayers: game.settings.maxPlayers,
        players: game.players.map(p => ({
          id: p.id,
          name: p.name,
          profession: p.profession.name,
          isReady: p.isReady,
          isOnFastTrack: p.isOnFastTrack
        })),
        settings: game.settings,
        createdAt: game.createdAt,
        updatedAt: game.updatedAt
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    if (error instanceof Error && error.message === 'Game not found') {
      res.status(404).json({ 
        error: 'Game not found',
        message: `Game with ID ${req.params.gameId} does not exist`
      });
      return;
    }
    
    console.error('Error getting game:', error);
    res.status(500).json({ 
      error: 'Failed to get game',
      message: errorMessage 
    });
  }
};

router.get('/:gameId', getGame);

// Приєднатися до гри
const joinGame: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { gameId } = req.params;
    const { playerId, playerName } = req.body;
    
    if (!playerId) {
      res.status(400).json({ error: 'Player ID is required' });
      return;
    }

    if (!playerName || playerName.trim().length < 2 || playerName.trim().length > 20) {
      res.status(400).json({ error: 'Player name must be between 2 and 20 characters' });
      return;
    }

    if (gameId.length !== 6) {
      res.status(400).json({ error: 'Game ID must be 6 characters' });
      return;
    }
    
    const game = await gameService.addPlayerToGame(gameId, playerId, playerName.trim());
    
    res.status(200).json({
      success: true,
      message: 'Successfully joined the game',
      game: {
        id: game.id,
        hostId: game.hostId,
        state: game.state,
        playerCount: game.players.length,
        maxPlayers: game.settings.maxPlayers,
        players: game.players.map(p => ({
          id: p.id,
          name: p.name,
          profession: p.profession.name,
          isReady: p.isReady,
          isOnFastTrack: p.isOnFastTrack
        })),
        settings: game.settings
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    
    if (error instanceof Error) {
      if (error.message === 'Game not found') {
        res.status(404).json({ 
          error: 'Game not found',
          message: `Game with ID ${req.params.gameId} does not exist`
        });
        return;
      }
      
      if (error.message === 'Game is full') {
        res.status(400).json({ 
          error: 'Game is full',
          message: 'This game has reached the maximum number of players'
        });
        return;
      }
      
      if (error.message === 'Player already in game') {
        res.status(400).json({ 
          error: 'Already joined',
          message: 'You are already a member of this game'
        });
        return;
      }
    }
    
    console.error('Error joining game:', error);
    res.status(500).json({ 
      error: 'Failed to join game',
      message: errorMessage 
    });
  }
};

router.post('/:gameId/join', joinGame);

// Встановити готовність гравця
const setPlayerReady: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { gameId } = req.params;
    const { playerId, isReady } = req.body;
    
    if (!playerId) {
      res.status(400).json({ error: 'Player ID is required' });
      return;
    }

    if (typeof isReady !== 'boolean') {
      res.status(400).json({ error: 'isReady must be a boolean value' });
      return;
    }
    
    const game = await gameService.setPlayerReady(gameId, playerId, isReady);
    
    res.status(200).json({
      success: true,
      message: `Player marked as ${isReady ? 'ready' : 'not ready'}`,
      game: {
        id: game.id,
        state: game.state,
        players: game.players.map(p => ({
          id: p.id,
          name: p.name,
          profession: p.profession.name,
          isReady: p.isReady
        })),
        allPlayersReady: game.players.length > 1 && game.players.every(p => p.isReady)
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error setting player ready:', error);
    res.status(500).json({ 
      error: 'Failed to set player ready status',
      message: errorMessage 
    });
  }
};

// Видалити гравця з гри (тільки хост)
const removePlayer: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { gameId } = req.params;
    const { hostId, playerIdToRemove } = req.body;
    
    if (!hostId || !playerIdToRemove) {
      res.status(400).json({ error: 'Host ID and Player ID to remove are required' });
      return;
    }
    
    const game = await gameService.getGame(gameId);
    
    if (game.hostId !== hostId) {
      res.status(403).json({ error: 'Only the host can remove players' });
      return;
    }

    if (playerIdToRemove === hostId) {
      res.status(400).json({ error: 'Host cannot remove themselves' });
      return;
    }
    
    const updatedGame = await gameService.removePlayerFromGame(gameId, playerIdToRemove);
    
    res.status(200).json({
      success: true,
      message: 'Player removed successfully',
      game: {
        id: updatedGame.id,
        players: updatedGame.players.map(p => ({
          id: p.id,
          name: p.name,
          profession: p.profession.name,
          isReady: p.isReady
        }))
      }
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

// Почати гру (тільки хост)
const startGame: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { gameId } = req.params;
    const { hostId } = req.body;
    
    if (!hostId) {
      res.status(400).json({ error: 'Host ID is required' });
      return;
    }
    
    const game = await gameService.getGame(gameId);
    
    if (game.hostId !== hostId) {
      res.status(403).json({ error: 'Only the host can start the game' });
      return;
    }

    if (game.players.length < 2) {
      res.status(400).json({ error: 'At least 2 players are required to start the game' });
      return;
    }

    if (!game.players.every(p => p.isReady)) {
      res.status(400).json({ error: 'All players must be ready before starting the game' });
      return;
    }
    
    const startedGame = await gameService.startGame(gameId);
    
    // Emit GAME_STARTED socket event to all players in the game
    const gameSocketHandler = req.app.get('gameSocketHandler');
    if (gameSocketHandler) {
      gameSocketHandler.emitGameStarted(gameId, startedGame);
    }
    
    res.status(200).json({
      success: true,
      message: 'Game started successfully',
      game: {
        id: startedGame.id,
        state: startedGame.state,
        currentPlayer: startedGame.currentPlayer,
        players: startedGame.players.map((p: any) => ({
          id: p.id,
          name: p.name,
          profession: p.profession.name,
          position: p.position,
          finances: {
            cash: p.finances.cash,
            salary: p.finances.salary,
            expenses: p.finances.expenses
          }
        }))
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

router.post('/:gameId/ready', setPlayerReady);
router.post('/:gameId/remove-player', removePlayer);
router.post('/:gameId/start', startGame);

// Здоров'я сервісу гри
router.get('/health/check', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    service: 'Game Service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Виконати хід гравця
const executeTurn: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { gameId } = req.params;
    const { playerId } = req.body;

    if (!playerId) {
      res.status(400).json({ error: 'Player ID is required' });
      return;
    }

    const game = await gameService.getGame(gameId);
    
    if (game.currentPlayer !== playerId) {
      res.status(400).json({ error: 'Не ваш хід' });
      return;
    }

    // Виконання ходу
    const turn = GameMechanicsService.executeTurn(game, playerId);
    
    // Перехід до наступного гравця
    const nextPlayerId = GameMechanicsService.nextPlayer(game);
    
    // Оновлення гри в базі даних
    await gameService.updateGame(gameId, game);

    res.json({
      success: true,
      turn,
      nextPlayer: nextPlayerId,
      game: {
        id: game.id,
        state: game.state,
        currentPlayer: game.currentPlayer,
        turn: game.turn,
        players: game.players.map(p => ({
          id: p.id,
          name: p.name,
          profession: p.profession.name,
          position: p.position,
          fastTrackPosition: p.fastTrackPosition,
          isOnFastTrack: p.isOnFastTrack,
          finances: {
            cash: p.finances.cash,
            salary: p.finances.salary,
            passiveIncome: p.finances.passiveIncome,
            expenses: p.finances.expenses,
            assetsCount: p.finances.assets.length
          }
        }))
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error executing turn:', error);
    res.status(500).json({ 
      error: 'Failed to execute turn',
      message: errorMessage 
    });
  }
};

// Кинути кубик
const rollDice: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { gameId } = req.params;
    const { playerId } = req.body;

    if (!playerId) {
      res.status(400).json({ error: 'Player ID is required' });
      return;
    }

    const game = await gameService.getGame(gameId);
    
    if (game.currentPlayer !== playerId) {
      res.status(400).json({ error: 'Не ваш хід' });
      return;
    }

    const result = GameMechanicsService.rollDiceAndMove(game, playerId);
    await gameService.updateGame(gameId, game);

    res.json({
      success: true,
      diceResult: result.diceResult,
      newPosition: result.newPosition,
      cellEffect: result.cellEffect,
      player: game.players.find(p => p.id === playerId)
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

// Купити угоду
const buyDeal: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { gameId } = req.params;
    const { playerId, dealId } = req.body;

    if (!playerId || !dealId) {
      res.status(400).json({ error: 'Player ID and Deal ID are required' });
      return;
    }

    const game = await gameService.getGame(gameId);
    const result = GameMechanicsService.buyDeal(game, playerId, dealId);
    
    if (result.success) {
      await gameService.updateGame(gameId, game);
    }

    res.json({
      success: result.success,
      message: result.message,
      transaction: result.transaction,
      player: game.players.find(p => p.id === playerId)
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error buying deal:', error);
    res.status(500).json({ 
      error: 'Failed to buy deal',
      message: errorMessage 
    });
  }
};

// Перейти на швидку доріжку
const moveToFastTrack: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { gameId } = req.params;
    const { playerId } = req.body;

    if (!playerId) {
      res.status(400).json({ error: 'Player ID is required' });
      return;
    }

    const game = await gameService.getGame(gameId);
    const player = game.players.find(p => p.id === playerId);
    
    if (!player) {
      res.status(404).json({ error: 'Player not found' });
      return;
    }

    if (!GameMechanicsService.checkFastTrackEligibility(player)) {
      res.status(400).json({ error: 'Не відповідаєте умовам переходу на швидку доріжку' });
      return;
    }

    GameMechanicsService.moveToFastTrack(player);
    await gameService.updateGame(gameId, game);

    res.json({
      success: true,
      message: 'Успішно переведено на швидку доріжку!',
      player: {
        id: player.id,
        isOnFastTrack: player.isOnFastTrack,
        fastTrackPosition: player.fastTrackPosition
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error moving to fast track:', error);
    res.status(500).json({ 
      error: 'Failed to move to fast track',
      message: errorMessage 
    });
  }
};

// Генерація нових угод
const generateDeals: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { gameId } = req.params;
    const { count = 4 } = req.body;

    const game = await gameService.getGame(gameId);
    const newDeals = GameMechanicsService.generateDeals(game, count);
    
    await gameService.updateGame(gameId, game);

    res.json({
      success: true,
      newDeals,
      totalDeals: game.deals.length
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error generating deals:', error);
    res.status(500).json({ 
      error: 'Failed to generate deals',
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
    
    const updatedGame = await gameService.changePlayerProfession(gameId, playerId, professionName);
    
    res.status(200).json({
      success: true,
      message: 'Profession changed successfully',
      game: {
        id: updatedGame.id,
        players: updatedGame.players.map((p: any) => ({
          id: p.id,
          name: p.name,
          profession: p.profession.name,
          isReady: p.isReady
        }))
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error changing profession:', error);
    res.status(500).json({ 
      error: 'Failed to change profession',
      message: errorMessage 
    });
  }
};

router.post('/:gameId/profession', changeProfession);
router.post('/:gameId/execute-turn', executeTurn);
router.post('/:gameId/roll-dice', rollDice);
router.post('/:gameId/buy-deal', buyDeal);
router.post('/:gameId/fast-track', moveToFastTrack);
router.post('/:gameId/generate-deals', generateDeals);

export { router as gameRoutes };
