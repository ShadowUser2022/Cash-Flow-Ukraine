// Експорт всіх спільних типів з backend
export * from '../../../shared/types/game';
export * from '../../../shared/constants/game';

// Додаткові типи специфічні для frontend
export interface GameUIState {
	selectedPlayer: string | null;
	showDealModal: boolean;
	showNegotiationModal: boolean;
	currentDeal: any | null;
	diceRolling: boolean;
	notifications: Notification[];
}

export interface Notification {
	id: string;
	type: 'info' | 'success' | 'warning' | 'error';
	title: string;
	message: string;
	duration?: number;
	timestamp: Date;
}

export interface WebRTCState {
	localStream: MediaStream | null;
	remoteStreams: { [peerId: string]: MediaStream };
	isVideoEnabled: boolean;
	isAudioEnabled: boolean;
	isConnected: boolean;
	connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'failed';
	participants: string[];
}

export interface ChatMessage {
	id: string;
	senderId: string;
	senderName: string;
	message: string;
	timestamp: Date;
	type: 'text' | 'system' | 'negotiation';
}

export interface DiceAnimation {
	isRolling: boolean;
	result: number | null;
	playerId: string | null;
	axis?: 'x' | 'y' | 'z';
}
