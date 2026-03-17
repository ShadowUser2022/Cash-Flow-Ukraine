// Transaction Service — Pure In-Memory Version
// Всі операції з даними гравця відбуваються напряму на об'єктах в пам'яті.
// Без MongoDB: стара версія крашила через відсутність БД, що блокувало buy-deal.

import { Player, Asset, Liability } from '../../../shared/types/game';

export class TransactionService {
  private static instance: TransactionService;

  private constructor() {}

  public static getInstance(): TransactionService {
    if (!TransactionService.instance) {
      TransactionService.instance = new TransactionService();
    }
    return TransactionService.instance;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CORE IN-MEMORY OPERATIONS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Купівля активу:
   * списує downPayment, додає актив до finances, оновлює passiveIncome
   */
  public buyAsset(
    player: Player,
    assetData: {
      id: string;
      name: string;
      type: Asset['type'];
      cost: number;
      downPayment: number;
      cashFlow: number;
      mortgage?: number;
      description?: string;
    }
  ): { success: boolean; message: string } {
    const { downPayment, cashFlow, mortgage } = assetData;

    if (player.finances.cash < downPayment) {
      return {
        success: false,
        message: `Недостатньо готівки. Потрібно: $${downPayment.toLocaleString('uk-UA')}`,
      };
    }

    // Списуємо початковий внесок
    player.finances.cash -= downPayment;

    // Додаємо актив
    const asset: Asset = {
      id: assetData.id,
      name: assetData.name,
      type: assetData.type,
      cost: assetData.cost,
      cashFlow: cashFlow || 0,
      downPayment,
      mortgage: mortgage || 0,
      acquiredAt: new Date(),
      currentMultiplier: 1.0,
      purchasePrice: assetData.cost,
    } as Asset;
    player.finances.assets.push(asset);

    // Оновлюємо пасивний дохід
    if (cashFlow > 0) {
      player.finances.passiveIncome = (player.finances.passiveIncome || 0) + cashFlow;
    }

    // Додаємо liability якщо є іпотека
    if (mortgage && mortgage > 0) {
      const monthlyPayment = Math.round(mortgage * 0.007); // ~0.7% на місяць
      const liability: Liability = {
        id: `liab_${assetData.id}`,
        type: 'mortgage',
        name: `Іпотека: ${assetData.name}`,
        amount: mortgage,
        monthlyPayment,
      };
      if (!player.finances.liabilities) player.finances.liabilities = [];
      player.finances.liabilities.push(liability);
    }

    this.recalculateFinances(player);
    return { success: true, message: `Куплено: ${assetData.name}` };
  }

  /**
   * Продаж активу: додає кошти, видаляє актив, оновлює passiveIncome
   */
  public sellAsset(
    player: Player,
    assetId: string,
    sellPrice?: number
  ): { success: boolean; message: string; amountReceived?: number; profit?: number } {
    const assetIndex = player.finances.assets.findIndex(a => a.id === assetId);
    if (assetIndex === -1) return { success: false, message: 'Актив не знайдено' };

    const asset = player.finances.assets[assetIndex];
    const multiplier = (asset as any).currentMultiplier ?? 1.0;
    const salePrice = sellPrice ?? Math.floor(asset.cost * multiplier);
    const mortgageBalance = asset.mortgage ?? 0;
    const netProceeds = salePrice - mortgageBalance;

    if (netProceeds < 0) {
      return {
        success: false,
        message: `Ціна продажу $${salePrice.toLocaleString()} менша за залишок іпотеки $${mortgageBalance.toLocaleString()}`,
      };
    }

    const purchasePrice = (asset as any).purchasePrice ?? asset.cost;
    const profit = netProceeds - purchasePrice;

    // 1. Додаємо чисті кошти
    player.finances.cash += netProceeds;

    // 2. Знімаємо cashFlow з пасивного доходу
    if (asset.cashFlow > 0) {
      player.finances.passiveIncome = Math.max(0, player.finances.passiveIncome - asset.cashFlow);
    }

    // 3. Видаляємо пов'язану liability (іпотека)
    if (mortgageBalance > 0 && player.finances.liabilities) {
      const liabIdx = player.finances.liabilities.findIndex(
        l => l.id === assetId || l.id === `liab_${assetId}`
      );
      if (liabIdx !== -1) {
        const liab = player.finances.liabilities[liabIdx];
        player.finances.expenses = Math.max(0, player.finances.expenses - liab.monthlyPayment);
        player.finances.liabilities.splice(liabIdx, 1);
      }
    }

    // 4. Видаляємо актив
    player.finances.assets.splice(assetIndex, 1);

    this.recalculateFinances(player);

    console.log(
      `💸 [TX] Sell: ${asset.name} | sale=$${salePrice} | net=$${netProceeds} | profit=$${profit} | cash→$${player.finances.cash}`
    );

    return { success: true, message: `Продано: ${asset.name}`, amountReceived: netProceeds, profit };
  }

  /**
   * Списати витрату (doodad, lawsuit, тощо)
   */
  public payExpense(
    player: Player,
    amount: number,
    description: string
  ): { success: boolean; message: string } {
    player.finances.cash = Math.max(0, player.finances.cash - amount);
    console.log(`📉 [TX] Expense: ${description} | -$${amount} | cash→$${player.finances.cash}`);
    return { success: true, message: `Сплачено: ${description}` };
  }

  /**
   * Додати дохід (зарплата, пасивний дохід)
   */
  public receiveIncome(player: Player, amount: number, description: string): void {
    player.finances.cash += amount;
    console.log(`📈 [TX] Income: ${description} | +$${amount} | cash→$${player.finances.cash}`);
  }

  /**
   * Перерахувати passiveIncome з усіх активів гравця
   */
  public recalculateFinances(player: Player): void {
    let passiveIncome = 0;
    for (const asset of player.finances.assets) {
      if (asset.cashFlow > 0) passiveIncome += asset.cashFlow;
    }
    player.finances.passiveIncome = passiveIncome;
    // Синхронізуємо top-level поле
    player.passiveIncome = passiveIncome;
  }

  /**
   * Перевірка умови перемоги: passiveIncome >= monthlyExpenses
   */
  public checkWinCondition(player: Player): boolean {
    return player.finances.passiveIncome >= player.finances.expenses;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // LEGACY COMPATIBILITY — методи, що викликаються з GameMechanicsService
  // Більше не звертаються до MongoDB — просто логують
  // ─────────────────────────────────────────────────────────────────────────

  public async processAssetPurchase(
    playerId: string,
    gameId: string,
    amount: number,
    assetId: string,
    description: string,
    _playerObj?: any
  ): Promise<any> {
    // ✅ In-memory mode: cash managed directly by GameMechanicsService.buyDeal()
    // НЕ списуємо тут — уникаємо подвійного списання
    console.log(`📝 [TX] processAssetPurchase (no-op): ${description}, $${amount}`);
    return { id: `txn_${Date.now()}`, processed: true, type: 'asset_purchase', amount };
  }

  public async processSalary(
    playerId: string,
    gameId: string,
    amount: number,
    _playerObj?: any
  ): Promise<any> {
    console.log(`📝 [TX] processSalary (no-op): +$${amount}`);
    return { id: `txn_${Date.now()}`, processed: true, type: 'salary', amount };
  }

  public async processExpense(
    playerId: string,
    gameId: string,
    amount: number,
    description: string,
    _cellPosition?: number,
    _playerObj?: any
  ): Promise<any> {
    console.log(`📝 [TX] processExpense (no-op): ${description}, -$${amount}`);
    return { id: `txn_${Date.now()}`, processed: true, type: 'expense', amount: -amount };
  }

  public async processDeal(
    playerId: string,
    gameId: string,
    amount: number,
    dealId: string,
    description: string,
    _playerObj?: any
  ): Promise<any> {
    console.log(`📝 [TX] processDeal (no-op): ${description}, $${amount}`);
    return { id: `txn_${Date.now()}`, processed: true, type: 'deal', amount };
  }

  public async processCharity(
    playerId: string,
    gameId: string,
    amount: number,
    _playerObj?: any
  ): Promise<any> {
    console.log(`📝 [TX] processCharity (no-op): -$${amount}`);
    return { id: `txn_${Date.now()}`, processed: true, type: 'charity', amount: -amount };
  }

  public async processTax(
    playerId: string,
    gameId: string,
    amount: number,
    description: string = 'Tax payment',
    _playerObj?: any
  ): Promise<any> {
    console.log(`📝 [TX] processTax (no-op): ${description}, -$${amount}`);
    return { id: `txn_${Date.now()}`, processed: true, type: 'tax', amount: -amount };
  }

  public async getPlayerTransactions(_playerId: string, _limit: number = 50): Promise<any[]> {
    return [];
  }

  public async getGameTransactions(_gameId: string, _limit: number = 100): Promise<any[]> {
    return [];
  }

  public async getPlayerBalance(playerId: string): Promise<number> {
    console.warn(`[TX] getPlayerBalance called for ${playerId} — use player.finances.cash directly`);
    return 0;
  }
}

export default TransactionService;
