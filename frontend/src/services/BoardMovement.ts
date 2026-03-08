// BoardMovement.ts - Система руху по дошці та клітинки
import type { Player, CellEffect } from '../types';

// Типи клітинок на дошці Cash Flow
export const CellType = {
	START: 'start',           // Стартова клітинка
	PAYDAY: 'payday',         // День зарплати
	OPPORTUNITY: 'opportunity', // Інвестиційна можливість  
	MARKET: 'market',         // Ринкова подія
	CHARITY: 'charity',       // Благодійність
	DOWNSIZE: 'downsize',     // Скорочення
	DOODAD: 'doodad',         // Маленькі витрати
	FAST_TRACK: 'fast_track', // Перехід на швидку доріжку
	DREAM: 'dream'            // Мрія (тільки на швидкій доріжці)
} as const;

export type CellTypeValue = typeof CellType[keyof typeof CellType];

// Опис клітинки дошки
export interface BoardCell {
	id: number;
	type: CellTypeValue;
	title: string;
	description: string;
	position: { x: number; y: number }; // Позиція на візуальній дошці
}

// Результат руху по дошці
export interface MovementResult {
	startPosition: number;
	endPosition: number;
	steps: number;
	passedPayday: boolean;
	landedCell: BoardCell;
	cellEffect: CellEffect | null;
}

// Конфігурація дошки Cash Flow (40 клітинок як в Monopoly)
export const CASH_FLOW_BOARD: BoardCell[] = [
	// Стартова позиція
	{ id: 0, type: CellType.START, title: 'СТАРТ', description: 'Стартова позиція', position: { x: 0, y: 0 } },

	// Перший сектор (1-10)
	{ id: 1, type: CellType.OPPORTUNITY, title: 'Мала угода', description: 'Інвестиційна можливість', position: { x: 1, y: 0 } },
	{ id: 2, type: CellType.MARKET, title: 'Ринок', description: 'Ринкова подія', position: { x: 2, y: 0 } },
	{ id: 3, type: CellType.DOODAD, title: 'Витрати', description: 'Несподівані витрати', position: { x: 3, y: 0 } },
	{ id: 4, type: CellType.CHARITY, title: 'Благодійність', description: 'Допомогти чи пройти', position: { x: 4, y: 0 } },
	{ id: 5, type: CellType.PAYDAY, title: 'ЗАРПЛАТА', description: 'Отримати зарплату', position: { x: 5, y: 0 } },
	{ id: 6, type: CellType.OPPORTUNITY, title: 'Велика угода', description: 'Інвестиційна можливість', position: { x: 6, y: 0 } },
	{ id: 7, type: CellType.MARKET, title: 'Ринок', description: 'Ринкова подія', position: { x: 7, y: 0 } },
	{ id: 8, type: CellType.DOODAD, title: 'Витрати', description: 'Несподівані витрати', position: { x: 8, y: 0 } },
	{ id: 9, type: CellType.DOWNSIZE, title: 'Скорочення', description: 'Втрата роботи', position: { x: 9, y: 0 } },
	{ id: 10, type: CellType.FAST_TRACK, title: 'Швидка доріжка', description: 'Вихід зі крисячих перегонів', position: { x: 10, y: 0 } },

	// Другий сектор (11-20) - правий край
	{ id: 11, type: CellType.OPPORTUNITY, title: 'Мала угода', description: 'Інвестиційна можливість', position: { x: 10, y: 1 } },
	{ id: 12, type: CellType.MARKET, title: 'Ринок', description: 'Ринкова подія', position: { x: 10, y: 2 } },
	{ id: 13, type: CellType.DOODAD, title: 'Витрати', description: 'Несподівані витрати', position: { x: 10, y: 3 } },
	{ id: 14, type: CellType.CHARITY, title: 'Благодійність', description: 'Допомогти чи пройти', position: { x: 10, y: 4 } },
	{ id: 15, type: CellType.PAYDAY, title: 'ЗАРПЛАТА', description: 'Отримати зарплату', position: { x: 10, y: 5 } },
	{ id: 16, type: CellType.OPPORTUNITY, title: 'Велика угода', description: 'Інвестиційна можливість', position: { x: 10, y: 6 } },
	{ id: 17, type: CellType.MARKET, title: 'Ринок', description: 'Ринкова подія', position: { x: 10, y: 7 } },
	{ id: 18, type: CellType.DOODAD, title: 'Витрати', description: 'Несподівані витрати', position: { x: 10, y: 8 } },
	{ id: 19, type: CellType.DOWNSIZE, title: 'Скорочення', description: 'Втрата роботи', position: { x: 10, y: 9 } },
	{ id: 20, type: CellType.FAST_TRACK, title: 'Швидка доріжка', description: 'Вихід зі крисячих перегонів', position: { x: 10, y: 10 } },

	// Третій сектор (21-30) - нижній край
	{ id: 21, type: CellType.OPPORTUNITY, title: 'Мала угода', description: 'Інвестиційна можливість', position: { x: 9, y: 10 } },
	{ id: 22, type: CellType.MARKET, title: 'Ринок', description: 'Ринкова подія', position: { x: 8, y: 10 } },
	{ id: 23, type: CellType.DOODAD, title: 'Витрати', description: 'Несподівані витрати', position: { x: 7, y: 10 } },
	{ id: 24, type: CellType.CHARITY, title: 'Благодійність', description: 'Допомогти чи пройти', position: { x: 6, y: 10 } },
	{ id: 25, type: CellType.PAYDAY, title: 'ЗАРПЛАТА', description: 'Отримати зарплату', position: { x: 5, y: 10 } },
	{ id: 26, type: CellType.OPPORTUNITY, title: 'Велика угода', description: 'Інвестиційна можливість', position: { x: 4, y: 10 } },
	{ id: 27, type: CellType.MARKET, title: 'Ринок', description: 'Ринкова подія', position: { x: 3, y: 10 } },
	{ id: 28, type: CellType.DOODAD, title: 'Витрати', description: 'Несподівані витрати', position: { x: 2, y: 10 } },
	{ id: 29, type: CellType.DOWNSIZE, title: 'Скорочення', description: 'Втрата роботи', position: { x: 1, y: 10 } },
	{ id: 30, type: CellType.FAST_TRACK, title: 'Швидка доріжка', description: 'Вихід зі крисячих перегонів', position: { x: 0, y: 10 } },

	// Четвертий сектор (31-39) - лівий край
	{ id: 31, type: CellType.OPPORTUNITY, title: 'Мала угода', description: 'Інвестиційна можливість', position: { x: 0, y: 9 } },
	{ id: 32, type: CellType.MARKET, title: 'Ринок', description: 'Ринкова подія', position: { x: 0, y: 8 } },
	{ id: 33, type: CellType.DOODAD, title: 'Витрати', description: 'Несподівані витрати', position: { x: 0, y: 7 } },
	{ id: 34, type: CellType.CHARITY, title: 'Благодійність', description: 'Допомогти чи пройти', position: { x: 0, y: 6 } },
	{ id: 35, type: CellType.PAYDAY, title: 'ЗАРПЛАТА', description: 'Отримати зарплату', position: { x: 0, y: 5 } },
	{ id: 36, type: CellType.OPPORTUNITY, title: 'Велика угода', description: 'Інвестиційна можливість', position: { x: 0, y: 4 } },
	{ id: 37, type: CellType.MARKET, title: 'Ринок', description: 'Ринкова подія', position: { x: 0, y: 3 } },
	{ id: 38, type: CellType.DOODAD, title: 'Витрати', description: 'Несподівані витрати', position: { x: 0, y: 2 } },
	{ id: 39, type: CellType.DOWNSIZE, title: 'Скорочення', description: 'Втрата роботи', position: { x: 0, y: 1 } }
];

// Швидка доріжка (внутрішнє коло для гравців що вийшли з крисячих перегонів)
export const FAST_TRACK_BOARD: BoardCell[] = [
	{ id: 100, type: CellType.DREAM, title: 'Мрія 1', description: 'Досягти мрії', position: { x: 3, y: 3 } },
	{ id: 101, type: CellType.DREAM, title: 'Мрія 2', description: 'Досягти мрії', position: { x: 7, y: 3 } },
	{ id: 102, type: CellType.DREAM, title: 'Мрія 3', description: 'Досягти мрії', position: { x: 7, y: 7 } },
	{ id: 103, type: CellType.DREAM, title: 'Мрія 4', description: 'Досягти мрії', position: { x: 3, y: 7 } }
];

// Класи для роботи з рухом по дошці
export class BoardMovement {

	// Рух гравця на N кроків
	static movePlayer(player: Player, steps: number): MovementResult {
		const currentBoard = player.isOnFastTrack ? FAST_TRACK_BOARD : CASH_FLOW_BOARD;
		const startPosition = player.position || 0;

		// Розрахунок нової позиції (з урахуванням кільцевої дошки)
		let endPosition = (startPosition + steps) % currentBoard.length;

		// Перевірка чи пройшли повний круг (зарплата)
		const passedPayday = !player.isOnFastTrack && (startPosition + steps >= currentBoard.length);

		// Отримуємо клітинку куди потрапив
		const landedCell = currentBoard[endPosition];

		// Генеруємо ефект клітинки
		const cellEffect = BoardMovement.generateCellEffect(landedCell, player);

		return {
			startPosition,
			endPosition,
			steps,
			passedPayday,
			landedCell,
			cellEffect
		};
	}

	// Генерація ефекту клітинки
	static generateCellEffect(cell: BoardCell, player: Player): CellEffect | null {
		switch (cell.type) {
			case CellType.PAYDAY:
				return {
					type: 'receive_money',
					data: {
						amount: player.profession?.salary || 3000,
						reason: 'Зарплата',
						automatic: true
					}
				};

			case CellType.OPPORTUNITY:
				return {
					type: 'draw_card',
					data: {
						cardType: 'opportunity',
						title: 'Інвестиційна можливість',
						description: 'Нова можливість для інвестування'
					}
				};

			case CellType.MARKET:
				return {
					type: 'market_event',
					data: {
						title: 'Ринкова подія',
						description: 'Зміни на ринку впливають на ваші активи'
					}
				};

			case CellType.CHARITY:
				return {
					type: 'choose_charity',
					data: {
						title: 'Благодійність',
						description: 'Виберіть: допомогти або пройти повз',
						amount: Math.floor(player.finances?.cash * 0.1) || 100
					}
				};

			case CellType.DOODAD:
				return {
					type: 'pay_money',
					data: {
						amount: Math.floor(Math.random() * 500) + 100,
						reason: 'Несподівані витрати',
						automatic: true
					}
				};

			case CellType.DOWNSIZE:
				return {
					type: 'pay_money',
					data: {
						amount: player.profession?.salary || 3000,
						reason: 'Скорочення - пропуск зарплати',
						automatic: true
					}
				};

			case CellType.FAST_TRACK:
				return {
					type: 'dream_check',
					data: {
						title: 'Швидка доріжка',
						description: 'Перевірка можливості виходу зі крисячих перегонів',
						requiredIncome: (player.finances?.expenses || 0) * 1.2
					}
				};

			case CellType.DREAM:
				return {
					type: 'dream_check',
					data: {
						title: 'Мрія досягнута!',
						description: 'Ви досягли своєї мрії!',
						isVictory: true
					}
				};

			default:
				return null;
		}
	}

	// Отримання клітинки за позицією
	static getCellByPosition(position: number, isOnFastTrack: boolean = false): BoardCell | null {
		const board = isOnFastTrack ? FAST_TRACK_BOARD : CASH_FLOW_BOARD;
		return board[position] || null;
	}

	// Перевірка чи може гравець перейти на швидку доріжку
	static canMoveToFastTrack(player: Player): boolean {
		if (player.isOnFastTrack) return false;

		const passiveIncome = player.finances?.passiveIncome || 0;
		const expenses = player.finances?.expenses || 0;

		// Умова: пасивний дохід більше витрат
		return passiveIncome > expenses;
	}

	// Переміщення на швидку доріжку
	static moveToFastTrack(player: Player): Player {
		return {
			...player,
			isOnFastTrack: true,
			position: 0 // Початкова позиція на швидкій доріжці
		};
	}
}
