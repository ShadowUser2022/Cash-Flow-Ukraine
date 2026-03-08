// Transaction Service for Cash Flow Ukraine
// Handles all financial transactions in the game

import Transaction from '../models/Transaction';
import Player from '../models/Player';
import { ITransaction } from '../models/Transaction';

export class TransactionService {
  private static instance: TransactionService;

  private constructor() {}

  public static getInstance(): TransactionService {
    if (!TransactionService.instance) {
      TransactionService.instance = new TransactionService();
    }
    return TransactionService.instance;
  }

  // Process salary payment
  public async processSalary(playerId: string, gameId: string, amount: number): Promise<ITransaction> {
    try {
      // Update player's cash
      const player = await (Player as any).findByPlayerId(playerId);
      if (!player) {
        throw new Error('Player not found');
      }

      const previousBalance = player.finances.cash;
      player.finances.cash += amount;
      await player.save();

      // Create transaction record
      const transaction = await (Transaction as any).createTransaction({
        playerId,
        gameId,
        type: 'salary',
        amount,
        description: 'Salary payment',
        category: 'income',
        metadata: {
          previousBalance,
          newBalance: player.finances.cash
        }
      });

      await transaction.process();
      return transaction;
    } catch (error) {
      console.error('Error processing salary:', error);
      throw error;
    }
  }

  // Process expense payment
  public async processExpense(playerId: string, gameId: string, amount: number, description: string, cellPosition?: number): Promise<ITransaction> {
    try {
      // Update player's cash
      const player = await (Player as any).findByPlayerId(playerId);
      if (!player) {
        throw new Error('Player not found');
      }

      if (player.finances.cash < amount) {
        throw new Error('Insufficient funds');
      }

      const previousBalance = player.finances.cash;
      player.finances.cash -= amount;
      await player.save();

      // Create transaction record
      const transaction = await (Transaction as any).createTransaction({
        playerId,
        gameId,
        type: 'expense',
        amount: -amount,
        description,
        category: 'expenses',
        metadata: {
          cellPosition,
          previousBalance,
          newBalance: player.finances.cash
        }
      });

      await transaction.process();
      return transaction;
    } catch (error) {
      console.error('Error processing expense:', error);
      throw error;
    }
  }

  // Process asset purchase
  public async processAssetPurchase(playerId: string, gameId: string, amount: number, assetId: string, description: string): Promise<ITransaction> {
    try {
      // Update player's cash
      const player = await Player.findByPlayerId(playerId);
      if (!player) {
        throw new Error('Player not found');
      }

      if (player.finances.cash < amount) {
        throw new Error('Insufficient funds for asset purchase');
      }

      const previousBalance = player.finances.cash;
      player.finances.cash -= amount;
      await player.save();

      // Create transaction record
      const transaction = await Transaction.createTransaction({
        playerId,
        gameId,
        type: 'asset_purchase',
        amount: -amount,
        description,
        category: 'assets',
        metadata: {
          assetId,
          previousBalance,
          newBalance: player.finances.cash
        }
      });

      await transaction.process();
      return transaction;
    } catch (error) {
      console.error('Error processing asset purchase:', error);
      throw error;
    }
  }

  // Process deal transaction
  public async processDeal(playerId: string, gameId: string, amount: number, dealId: string, description: string): Promise<ITransaction> {
    try {
      // Update player's cash
      const player = await Player.findByPlayerId(playerId);
      if (!player) {
        throw new Error('Player not found');
      }

      const isExpense = amount < 0;
      if (isExpense && player.finances.cash < Math.abs(amount)) {
        throw new Error('Insufficient funds for deal');
      }

      const previousBalance = player.finances.cash;
      player.finances.cash += amount;
      await player.save();

      // Create transaction record
      const transaction = await Transaction.createTransaction({
        playerId,
        gameId,
        type: 'deal',
        amount,
        description,
        category: isExpense ? 'expenses' : 'income',
        metadata: {
          dealId,
          previousBalance,
          newBalance: player.finances.cash
        }
      });

      await transaction.process();
      return transaction;
    } catch (error) {
      console.error('Error processing deal:', error);
      throw error;
    }
  }

  // Process charity payment
  public async processCharity(playerId: string, gameId: string, amount: number): Promise<ITransaction> {
    try {
      // Update player's cash
      const player = await Player.findByPlayerId(playerId);
      if (!player) {
        throw new Error('Player not found');
      }

      if (player.finances.cash < amount) {
        throw new Error('Insufficient funds for charity');
      }

      const previousBalance = player.finances.cash;
      player.finances.cash -= amount;
      await player.save();

      // Create transaction record
      const transaction = await Transaction.createTransaction({
        playerId,
        gameId,
        type: 'charity',
        amount: -amount,
        description: 'Charity donation',
        category: 'charity',
        metadata: {
          previousBalance,
          newBalance: player.finances.cash
        }
      });

      await transaction.process();
      return transaction;
    } catch (error) {
      console.error('Error processing charity:', error);
      throw error;
    }
  }

  // Process tax payment
  public async processTax(playerId: string, gameId: string, amount: number, description: string = 'Tax payment'): Promise<ITransaction> {
    try {
      // Update player's cash
      const player = await Player.findByPlayerId(playerId);
      if (!player) {
        throw new Error('Player not found');
      }

      if (player.finances.cash < amount) {
        throw new Error('Insufficient funds for tax payment');
      }

      const previousBalance = player.finances.cash;
      player.finances.cash -= amount;
      await player.save();

      // Create transaction record
      const transaction = await Transaction.createTransaction({
        playerId,
        gameId,
        type: 'tax',
        amount: -amount,
        description,
        category: 'tax',
        metadata: {
          previousBalance,
          newBalance: player.finances.cash
        }
      });

      await transaction.process();
      return transaction;
    } catch (error) {
      console.error('Error processing tax:', error);
      throw error;
    }
  }

  // Get player transaction history
  public async getPlayerTransactions(playerId: string, limit: number = 50): Promise<ITransaction[]> {
    try {
      return await (Transaction as any).findByPlayerId(playerId)
        .limit(limit)
        .populate('fromPlayer', 'name')
        .populate('toPlayer', 'name');
    } catch (error) {
      console.error('Error getting player transactions:', error);
      throw error;
    }
  }

  // Get game transaction history
  public async getGameTransactions(gameId: string, limit: number = 100): Promise<ITransaction[]> {
    try {
      return await (Transaction as any).findByGameId(gameId)
        .limit(limit)
        .populate('playerId', 'name')
        .sort({ timestamp: -1 });
    } catch (error) {
      console.error('Error getting game transactions:', error);
      throw error;
    }
  }

  // Get player balance
  public async getPlayerBalance(playerId: string): Promise<number> {
    try {
      const player = await (Player as any).findByPlayerId(playerId);
      if (!player) {
        throw new Error('Player not found');
      }
      return player.finances.cash;
    } catch (error) {
      console.error('Error getting player balance:', error);
      throw error;
    }
  }

  // Process player movement and apply cell effects
  public async processPlayerMovement(playerId: string, gameId: string, newPosition: number, cellType: string): Promise<ITransaction[]> {
    try {
      const transactions: ITransaction[] = [];

      switch (cellType) {
        case 'expense':
          const expenseAmount = Math.floor(Math.random() * 500) + 100; // Random expense 100-600
          const expenseTx = await (Transaction as any).createTransaction({
            playerId,
            gameId,
            type: 'expense',
            amount: -expenseAmount,
            description: 'Board expense',
            category: 'expenses',
            metadata: {
              cellPosition: newPosition
            }
          });
          await expenseTx.process();
          transactions.push(expenseTx);
          break;

        case 'charity':
          const charityAmount = Math.floor(Math.random() * 200) + 50; // Random charity 50-250
          const charityTx = await (Transaction as any).createTransaction({
            playerId,
            gameId,
            type: 'charity',
            amount: -charityAmount,
            description: 'Charity donation',
            category: 'charity',
            metadata: {
              cellPosition: newPosition
            }
          });
          await charityTx.process();
          transactions.push(charityTx);
          break;

        case 'salary':
        case 'payday':
          const player = await (Player as any).findByPlayerId(playerId);
          if (player) {
            const salaryAmount = player.profession.salary;
            const salaryTx = await (Transaction as any).createTransaction({
              playerId,
              gameId,
              type: 'salary',
              amount: salaryAmount,
              description: 'Salary payment',
              category: 'income',
              metadata: {
                previousBalance: player.finances.cash,
                newBalance: player.finances.cash + salaryAmount
              }
            });
            await salaryTx.process();
            transactions.push(salaryTx);
          }
          break;

        case 'market':
          // Market events can be positive or negative
          const marketAmount = (Math.random() - 0.5) * 400; // -200 to +200
          if (marketAmount > 0) {
            const incomeTx = await (Transaction as any).createTransaction({
              playerId,
              gameId,
              type: 'income',
              amount: marketAmount,
              description: 'Market gain',
              category: 'income',
              metadata: {
                cellPosition: newPosition
              }
            });
            await incomeTx.process();
            transactions.push(incomeTx);
          } else {
            const lossTx = await (Transaction as any).createTransaction({
              playerId,
              gameId,
              type: 'expense',
              amount: Math.abs(marketAmount),
              description: 'Market loss',
              category: 'expenses',
              metadata: {
                cellPosition: newPosition
              }
            });
            await lossTx.process();
            transactions.push(lossTx);
          }
          break;

        default:
          // No financial effect for other cell types
          break;
      }

      return transactions;
    } catch (error) {
      console.error('Error processing player movement:', error);
      throw error;
    }
  }
}

export default TransactionService;
