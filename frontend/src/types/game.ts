// Тимчасові типи для фронтенду (до виправлення імпорту shared)

export interface Dream {
	id: string;
	title: string;
	description: string;
	icon: string;
	category: 'luxury' | 'travel' | 'business' | 'charity' | 'freedom';
	estimatedCost: number;
}

export interface Player {
	id: string;
	name: string;
	profession: {
		name: string;
		salary: number;
		expenses: number;
		description?: string;
	};
	position: number;
	fastTrackPosition: number;
	finances: {
		salary: number;
		passiveIncome: number;
		expenses: number;
		cash: number;
		assets: any[];
		liabilities: any[];
	};
	assets: any[];
	passiveIncome: number;
	isOnFastTrack: boolean;
	isReady: boolean;
	isConnected: boolean;
	avatar?: string;
	dream?: Dream; // Мрія гравця
	dreamSelected?: boolean; // Чи обрав гравець мрію в лобі
}

export interface Game {
	id: string;
	hostId: string;
	players: Player[];
	state: 'waiting' | 'starting' | 'in_progress' | 'paused' | 'finished';
	currentPlayer: string;
	turn: number;
	settings: any;
	board: any;
	deals: any[];
	marketEvents: any[];
	negotiations: any[];
	createdAt: Date;
	updatedAt: Date;
}

export interface Profession {
	name: string;
	salary: number;
	expenses: number;
	description?: string;
}

export interface Deal {
	id: string;
	title: string;
	description: string;
	type: string;
	cost?: number;
	downPayment?: number;
	cashFlow?: number;
}

export interface CellEffect {
	type: 'draw_card' | 'pay_money' | 'receive_money' | 'choose_charity' | 'market_event' | 'dream_check';
	data?: any;
}

export interface GameTurn {
	playerId: string;
	diceRoll?: number;
	actions: any[];
	timestamp: Date;
}

// Константи гри
export const PROFESSIONS: Profession[] = [
	{ name: 'Вчитель', salary: 3300, expenses: 2500, description: 'Освітній працівник' },
	{ name: 'Модератка', salary: 4100, expenses: 2800, description: 'Контент-модератор' },
	{ name: 'Поліцейський', salary: 3000, expenses: 2200, description: 'Правоохоронець' },
	{ name: 'Інженер', salary: 4900, expenses: 3900, description: 'Технічний спеціаліст' },
	{ name: 'Пілот', salary: 13200, expenses: 9650, description: 'Авіапілот' },
	{ name: 'Юрист', salary: 7500, expenses: 6100, description: 'Правовий консультант' }
];
