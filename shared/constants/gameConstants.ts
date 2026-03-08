// 🎯 Cash Flow Ukraine - Ігрові константи
// Єдине джерело істини для всіх числових значень в грі

export const GAME_CONSTANTS = {
  // Основні правила гри
  BOARD: {
    RAT_RACE_CELLS: 24,
    FAST_TRACK_CELLS: 16,
    START_POSITION: 0
  },

  // Фінансові формули
  FINANCIAL_FREEDOM: {
    CONDITION: 'passiveIncome >= monthlyExpenses' // НЕ ЗМІНЮВАТИ!
  },

  // Професії (стартові налаштування)
  PROFESSIONS: {
    PROGRAMMER: {
      salary: 25000,
      expenses: 18000,
      startingCash: 5000,
      startingDebt: 50000,
      name: 'Програміст'
    },
    DOCTOR: {
      salary: 20000,
      expenses: 15000,
      startingCash: 8000,
      startingDebt: 80000,
      name: 'Лікар'
    },
    TEACHER: {
      salary: 12000,
      expenses: 10000,
      startingCash: 3000,
      startingDebt: 20000,
      name: 'Вчитель'
    },
    ENGINEER: {
      salary: 18000,
      expenses: 14000,
      startingCash: 4000,
      startingDebt: 40000,
      name: 'Інженер'
    },
    NURSE: {
      salary: 15000,
      expenses: 12000,
      startingCash: 3500,
      startingDebt: 30000,
      name: 'Медсестра'
    },
    ACCOUNTANT: {
      salary: 16000,
      expenses: 13000,
      startingCash: 3800,
      startingDebt: 35000,
      name: 'Бухгалтер'
    }
  },

  // Мрії (для Fast Track)
  DREAMS: {
    TRAVEL: {
      name: 'Подорожі по світу',
      cost: 200000,
      description: 'Відвідати 5 країн світу'
    },
    HOUSE: {
      name: 'Будинок мрії',
      cost: 500000,
      description: 'Власний будинок з басейном'
    },
    EDUCATION: {
      name: 'Вища освіта',
      cost: 150000,
      description: 'MBA в топ-університеті'
    },
    BUSINESS: {
      name: 'Власна компанія',
      cost: 1000000,
      description: 'Створити IT-стартап'
    },
    HOBBY: {
      name: 'Улюблене хобі',
      cost: 300000,
      description: 'Займатися мистецтвом'
    },
    CHARITY: {
      name: 'Благодійність',
      cost: 250000,
      description: 'Допомагати дітям'
    }
  },

  // Діапазони для карток
  CARDS: {
    SMALL_DEALS: {
      MIN_PRICE: 1000,
      MAX_PRICE: 50000,
      MIN_DOWN_PAYMENT_PERCENT: 10,
      MAX_DOWN_PAYMENT_PERCENT: 50,
      MIN_MONTHLY_INCOME: 100,
      MAX_MONTHLY_INCOME: 5000
    },
    BIG_DEALS: {
      MIN_PRICE: 50000,
      MAX_PRICE: 500000,
      MIN_DOWN_PAYMENT_PERCENT: 10,
      MAX_DOWN_PAYMENT_PERCENT: 30,
      MIN_MONTHLY_INCOME: 5000,
      MAX_MONTHLY_INCOME: 50000
    },
    DOODADS: {
      MIN_ONE_TIME: 1000,
      MAX_ONE_TIME: 50000,
      MIN_MONTHLY_INCREASE: 200,
      MAX_MONTHLY_INCREASE: 2000
    }
  },

  // Клітинки ігрового поля
  CELL_TYPES: {
    RAT_RACE: {
      START: 'start',
      PAYDAY: 'payday',
      SMALL_DEAL: 'small_deal',
      BIG_DEAL: 'big_deal',
      DOODAD: 'doodad',
      MARKET: 'market',
      CHARITY: 'charity',
      BABY: 'baby',
      DOWNSIZED: 'downsized'
    },
    FAST_TRACK: {
      DREAMS: 'dreams',
      CASHFLOW_DAY: 'cashflow_day',
      BUSINESS: 'business',
      LAWSUIT: 'lawsuit',
      DIVORCE: 'divorce',
      TAX_AUDIT: 'tax_audit'
    }
  },

  // Розподіл клітинок на Rat Race (загалом 24)
  RAT_RACE_DISTRIBUTION: {
    START: 1,           // клітинка 0
    PAYDAY: 3,          // клітинки 6, 12, 18
    SMALL_DEAL: 8,      // найчастіші
    DOODAD: 6,          // витрати
    BIG_DEAL: 3,        // рідкісні
    MARKET: 2,          // ринкові події
    CHARITY: 1          // одна клітинка
  },

  // Спеціальні ефекти
  SPECIAL_EFFECTS: {
    BABY: {
      EXPENSE_INCREASE: 5000 // +5000 грн до щомісячних витрат
    },
    DOWNSIZED: {
      SKIP_TURNS: 2 // пропустити 2 ходи
    },
    CHARITY: {
      CASH_PERCENT: 10, // 10% від готівки
      FIXED_AMOUNT: 2000, // або фіксована сума
      EXTRA_DICE_ROLLS: 1 // додатковий кидок кубика
    },
    DIVORCE: {
      ASSET_LOSS_PERCENT: 50 // втратити 50% активів
    },
    TAX_AUDIT: {
      INCOME_PENALTY_PERCENT: 20 // 20% від доходу
    }
  },

  // Множники для Fast Track
  FAST_TRACK_MULTIPLIERS: {
    CASHFLOW_DAY: [2, 3, 4, 5], // можливі множники пасивного доходу
    BUSINESS_DEALS: {
      MIN_PRICE: 500000,
      MAX_PRICE: 5000000
    }
  },

  // Налаштування гри
  GAME_SETTINGS: {
    MIN_PLAYERS: 2,
    MAX_PLAYERS: 6,
    DICE_FACES: 6,
    PAYDAY_FREQUENCY: 6 // кожні 6 клітинок PAYDAY
  },

  // Валідація балансу гри
  BALANCE_RULES: {
    // ROI (Return on Investment) - повернення інвестицій
    MIN_ANNUAL_ROI_PERCENT: 8,  // мінімум 8% річних
    MAX_ANNUAL_ROI_PERCENT: 20, // максимум 20% річних
    
    // Співвідношення зарплати до витрат
    SALARY_TO_EXPENSES_RATIO: {
      MIN: 1.1, // витрати максимум 90% від зарплати
      MAX: 1.4   // витрати мінімум 71% від зарплати
    }
  }
} as const;

// Допоміжні функції для роботи з константами
export const GAME_HELPERS = {
  // Перевірка ROI угоди
  validateDealROI: (monthlyIncome: number, totalPrice: number): boolean => {
    const annualIncome = monthlyIncome * 12;
    const annualROI = (annualIncome / totalPrice) * 100;
    return annualROI >= GAME_CONSTANTS.BALANCE_RULES.MIN_ANNUAL_ROI_PERCENT &&
           annualROI <= GAME_CONSTANTS.BALANCE_RULES.MAX_ANNUAL_ROI_PERCENT;
  },

  // Перевірка балансу професії
  validateProfessionBalance: (salary: number, expenses: number): boolean => {
    const ratio = salary / expenses;
    return ratio >= GAME_CONSTANTS.BALANCE_RULES.SALARY_TO_EXPENSES_RATIO.MIN &&
           ratio <= GAME_CONSTANTS.BALANCE_RULES.SALARY_TO_EXPENSES_RATIO.MAX;
  },

  // Отримати позицію PAYDAY клітинок
  getPaydayPositions: (): number[] => {
    const positions: number[] = [];
    const frequency = GAME_CONSTANTS.GAME_SETTINGS.PAYDAY_FREQUENCY;
    const totalCells = GAME_CONSTANTS.BOARD.RAT_RACE_CELLS;
    
    for (let i = frequency; i < totalCells; i += frequency) {
      positions.push(i);
    }
    return positions;
  },

  // Перевірити чи клітинка є PAYDAY
  isPaydayCell: (position: number): boolean => {
    return GAME_HELPERS.getPaydayPositions().includes(position);
  }
};

// Експорт для TypeScript типізації
export type ProfessionKey = keyof typeof GAME_CONSTANTS.PROFESSIONS;
export type DreamKey = keyof typeof GAME_CONSTANTS.DREAMS;
export type CellType = typeof GAME_CONSTANTS.CELL_TYPES.RAT_RACE[keyof typeof GAME_CONSTANTS.CELL_TYPES.RAT_RACE] | 
                       typeof GAME_CONSTANTS.CELL_TYPES.FAST_TRACK[keyof typeof GAME_CONSTANTS.CELL_TYPES.FAST_TRACK];

// Заборонити модифікацію констант
Object.freeze(GAME_CONSTANTS);
Object.freeze(GAME_HELPERS);
