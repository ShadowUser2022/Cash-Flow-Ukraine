import { Game, Player, GameState, Deal } from '../../../shared/types/game';
import { PROFESSIONS, GAME_CONFIG } from '../../../shared/types/game';
import { GameModel } from '../models/Game';
import { DealService } from './DealService';
import { v4 as uuidv4 } from 'uuid';

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
      board: this.initializeBoard(),
      deals: await this.dealService.getInitialDeals(),
      marketEvents: [],
      negotiations: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const gameDoc = new GameModel(game);
    await gameDoc.save();
    
    return game;
  }

  async getGame(gameId: string): Promise<Game> {
    const gameDoc = await GameModel.findOne({ id: gameId });
    if (!gameDoc) {
      throw new Error('Game not found');
    }
    return this.documentToGame(gameDoc);
  }

  async addPlayerToGame(gameId: string, playerId: string, playerName?: string): Promise<Game> {
    const gameDoc = await GameModel.findOne({ id: gameId });
    if (!gameDoc) {
      throw new Error('Game not found');
    }

    if (gameDoc.players.length >= gameDoc.settings.maxPlayers) {
      throw new Error('Game is full');
    }

    if (gameDoc.players.some(p => p.id === playerId)) {
      throw new Error('Player already in game');
    }

    const player: Player = {
      id: playerId,
      name: playerName || `Player ${gameDoc.players.length + 1}`,
      profession: this.assignRandomProfession(),
      position: 0,
      fastTrackPosition: -1,
      finances: this.getInitialFinances(),
      assets: [],
      passiveIncome: 0,
      isOnFastTrack: false,
      isReady: false,
      isConnected: true
    };

    // Встановлюємо початкові фінанси на основі професії
    player.finances.salary = player.profession.salary;
    player.finances.expenses = player.profession.expenses;

    gameDoc.players.push(player);

    // Якщо це перший гравець, робимо його поточним
    if (gameDoc.players.length === 1) {
      gameDoc.currentPlayer = playerId;
    }

    await gameDoc.save();
    return this.documentToGame(gameDoc);
  }

  async removePlayerFromGame(gameId: string, playerId: string): Promise<Game> {
    const gameDoc = await GameModel.findOne({ id: gameId });
    if (!gameDoc) {
      throw new Error('Game not found');
    }

    const playerIndex = gameDoc.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) {
      throw new Error('Player not found in game');
    }

    gameDoc.players.splice(playerIndex, 1);

    // Якщо це був поточний гравець, переходимо до наступного
    if (gameDoc.currentPlayer === playerId && gameDoc.players.length > 0) {
      const nextPlayerIndex = playerIndex >= gameDoc.players.length ? 0 : playerIndex;
      gameDoc.currentPlayer = gameDoc.players[nextPlayerIndex].id;
    }

    // Якщо гравців не залишилось, змінюємо стан гри
    if (gameDoc.players.length === 0) {
      gameDoc.state = GameState.FINISHED;
    }

    await gameDoc.save();
    return this.documentToGame(gameDoc);
  }

  async movePlayer(gameId: string, playerId: string, steps: number): Promise<Game> {
    const gameDoc = await GameModel.findOne({ id: gameId });
    if (!gameDoc) {
      throw new Error('Game not found');
    }

    const player = gameDoc.players.find(p => p.id === playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    if (gameDoc.currentPlayer !== playerId) {
      throw new Error('Not player\'s turn');
    }

    // Рухаємо гравця
    if (player.isOnFastTrack) {
      player.fastTrackPosition = (player.fastTrackPosition + steps) % 8;
    } else {
      const newPosition = (player.position + steps) % 24;
      player.position = newPosition;

      // Перевіряємо чи гравець може перейти на швидку доріжку
      if (this.canMoveToFastTrack(player)) {
        player.isOnFastTrack = true;
        player.fastTrackPosition = 0;
      }

      // Перевіряємо чи гравець пройшов повне коло (отримує зарплату)
      if (player.position < (player.position - steps + 24) % 24) {
        player.finances.cash += player.finances.salary;
      }
    }

    // Переходимо до наступного гравця
    gameDoc.currentPlayer = this.getNextPlayerId(gameDoc, playerId);
    gameDoc.turn++;

    await gameDoc.save();
    return this.documentToGame(gameDoc);
  }

  async handleCellAction(gameId: string, playerId: string): Promise<any> {
    const game = await this.getGame(gameId);
    const player = game.players.find(p => p.id === playerId);
    
    if (!player) return null;

    const cellType = this.getCellType(player);
    
    switch (cellType) {
      case 'opportunity':
        return await this.handleOpportunityCell(game, player);
      case 'market':
        return await this.handleMarketCell(game, player);
      case 'doodad':
        return await this.handleDoodadCell(game, player);
      case 'charity':
        return await this.handleCharityCell(game, player);
      default:
        return null;
    }
  }

  async setPlayerReady(gameId: string, playerId: string, isReady: boolean): Promise<Game> {
    const gameDoc = await GameModel.findOne({ id: gameId });
    if (!gameDoc) {
      throw new Error('Game not found');
    }

    const player = gameDoc.players.find(p => p.id === playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    player.isReady = isReady;

    // Перевіряємо чи всі гравці готові
    const allReady = gameDoc.players.length >= 2 && gameDoc.players.every(p => p.isReady);
    if (allReady && gameDoc.state === GameState.WAITING) {
      gameDoc.state = GameState.STARTING;
      
      // Через 5 секунд починаємо гру
      setTimeout(async () => {
        const updatedGameDoc = await GameModel.findOne({ id: gameId });
        if (updatedGameDoc && updatedGameDoc.state === GameState.STARTING) {
          updatedGameDoc.state = GameState.IN_PROGRESS;
          await updatedGameDoc.save();
        }
      }, 5000);
    }

    await gameDoc.save();
    return this.documentToGame(gameDoc);
  }

  async startGame(gameId: string): Promise<Game> {
    const gameDoc = await GameModel.findOne({ id: gameId });
    if (!gameDoc) {
      throw new Error('Game not found');
    }

    if (gameDoc.state !== GameState.WAITING && gameDoc.state !== GameState.STARTING) {
      throw new Error('Game cannot be started from current state');
    }

    if (gameDoc.players.length < 2) {
      throw new Error('At least 2 players are required to start the game');
    }

    if (!gameDoc.players.every(p => p.isReady)) {
      throw new Error('All players must be ready before starting the game');
    }

    gameDoc.state = GameState.IN_PROGRESS;
    
    // Встановлюємо першого гравця як поточного, якщо ще не встановлено
    if (!gameDoc.currentPlayer && gameDoc.players.length > 0) {
      gameDoc.currentPlayer = gameDoc.players[0].id;
    }

    gameDoc.turn = 1;
    gameDoc.updatedAt = new Date();

    await gameDoc.save();
    return this.documentToGame(gameDoc);
  }

  async changePlayerProfession(gameId: string, playerId: string, professionName: string): Promise<Game> {
    const gameDoc = await GameModel.findOne({ id: gameId });
    if (!gameDoc) {
      throw new Error('Game not found');
    }

    if (gameDoc.state !== GameState.WAITING) {
      throw new Error('Cannot change profession after game has started');
    }

    const player = gameDoc.players.find(p => p.id === playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    const profession = PROFESSIONS.find(p => p.name === professionName);
    if (!profession) {
      throw new Error('Invalid profession');
    }

    player.profession = profession;
    player.finances.salary = profession.salary;
    player.finances.expenses = profession.expenses;

    await gameDoc.save();
    return this.documentToGame(gameDoc);
  }

  async updateGame(gameId: string, game: Game): Promise<Game> {
    const gameDoc = await GameModel.findOne({ id: gameId });
    if (!gameDoc) {
      throw new Error('Game not found');
    }

    // Оновлюємо всі поля гри
    Object.assign(gameDoc, {
      ...game,
      updatedAt: new Date()
    });

    await gameDoc.save();
    return this.documentToGame(gameDoc);
  }

  // Приватні методи

  private documentToGame(gameDoc: any): Game {
    const game = gameDoc.toObject();
    game.id = game.id || game._id.toString();
    delete game._id;
    delete game.__v;
    return game;
  }

  private generateGameId(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  private assignRandomProfession() {
    return PROFESSIONS[Math.floor(Math.random() * PROFESSIONS.length)];
  }

  private getInitialFinances() {
    return {
      salary: 0,
      passiveIncome: 0,
      expenses: 0,
      cash: GAME_CONFIG.INITIAL_CASH,
      assets: [],
      liabilities: []
    };
  }

  private initializeBoard() {
    return {
      ratRaceCells: Array.from({ length: 24 }, (_, index) => ({
        id: index,
        type: this.getCellTypeByIndex(index),
        title: this.getCellTitle(index),
        description: this.getCellDescription(index)
      })),
      fastTrackCells: Array.from({ length: 8 }, (_, index) => ({
        id: index,
        type: 'dream' as const,
        title: `Мрія ${index + 1}`,
        description: 'Досягніть своєї мрії!'
      }))
    };
  }

  private getCellTypeByIndex(index: number): 'opportunity' | 'market' | 'doodad' | 'charity' | 'dream' {
    const pattern: ('opportunity' | 'market' | 'doodad' | 'charity' | 'dream')[] = [
      'opportunity', 'doodad', 'market', 'opportunity',
      'doodad', 'charity', 'opportunity', 'market',
      'doodad', 'opportunity', 'market', 'doodad',
      'opportunity', 'market', 'doodad', 'opportunity',
      'market', 'doodad', 'opportunity', 'market',
      'doodad', 'opportunity', 'charity', 'market'
    ];
    
    return pattern[index] || 'opportunity';
  }

  private getCellTitle(index: number): string {
    const cellType = this.getCellTypeByIndex(index);
    const titles: Record<'opportunity' | 'market' | 'doodad' | 'charity' | 'dream', string> = {
      opportunity: 'Можливість',
      doodad: 'Дрібничка',
      market: 'Ринок',
      charity: 'Благодійність',
      dream: 'Мрія'
    };
    return titles[cellType] || 'Клітинка';
  }

  private getCellDescription(index: number): string {
    const cellType = this.getCellTypeByIndex(index);
    const descriptions: Record<'opportunity' | 'market' | 'doodad' | 'charity' | 'dream', string> = {
      opportunity: 'Візьміть картку можливості',
      doodad: 'Візьміть картку дрібнички',
      market: 'Ринкова подія впливає на всіх',
      charity: 'Допоможіть іншим і отримайте бонус',
      dream: 'Досягніть своєї мрії'
    };
    return descriptions[cellType] || '';
  }

  private getCellType(player: Player): string {
    if (player.isOnFastTrack) {
      return 'dream';
    }
    return this.getCellTypeByIndex(player.position);
  }

  private canMoveToFastTrack(player: Player): boolean {
    return player.finances.passiveIncome > player.finances.expenses;
  }

  private getNextPlayerId(gameDoc: any, currentPlayerId: string): string {
    const currentIndex = gameDoc.players.findIndex((p: any) => p.id === currentPlayerId);
    const nextIndex = (currentIndex + 1) % gameDoc.players.length;
    return gameDoc.players[nextIndex].id;
  }

  private async handleOpportunityCell(game: Game, player: Player) {
    const deal = await this.dealService.getRandomDeal('small');
    return {
      type: 'opportunity',
      deal,
      playerId: player.id
    };
  }

  private async handleMarketCell(game: Game, player: Player) {
    const marketEvent = await this.dealService.getMarketEvent();
    return {
      type: 'market',
      event: marketEvent,
      affectedPlayers: game.players.map(p => p.id)
    };
  }

  private async handleDoodadCell(game: Game, player: Player) {
    const doodad = await this.dealService.getRandomDeal('doodad');
    return {
      type: 'doodad',
      deal: doodad,
      playerId: player.id
    };
  }

  private async handleCharityCell(game: Game, player: Player) {
    // Логіка благодійності - гравець може допомогти іншим
    const charityAmount = Math.floor(player.finances.cash * 0.1); // 10% від готівки
    return {
      type: 'charity',
      maxAmount: charityAmount,
      playerId: player.id
    };
  }
}
