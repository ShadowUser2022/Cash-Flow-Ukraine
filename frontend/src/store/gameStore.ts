import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { 
  Game, 
  Player, 
  GameUIState, 
  WebRTCState, 
  ChatMessage, 
  DiceAnimation,
  Deal,
  Negotiation,
  Notification
} from '../types';
import type { GameError } from '../utils/errorHandling';
import { socketService } from '../services/socketService';
import { SOCKET_EVENTS } from '../constants/socketEvents';

interface GameStore extends GameUIState, WebRTCState {
  // Game state
  game: Game | null;
  currentPlayer: Player | null;
  playerId: string | null;
  isConnected: boolean;
  
  // Error state
  lastError: GameError | null;
  isLoading: boolean;
  
  // Chat state
  chatMessages: ChatMessage[];
  
  // Deal state
  availableDeals: Deal[];
  currentDeals: Deal[];
  activeNegotiations: Negotiation[];
  
  // Turn timer
  turnTimerStartedAt: number | null;
  turnTimerDuration: number;
  setTurnTimer: (startedAt: number | null, duration: number) => void;

  // Dice animation
  diceAnimation: DiceAnimation;
  
  // Actions
  setGame: (game: Game | null) => void;
  setCurrentPlayer: (player: Player | null) => void;
  setPlayerId: (id: string | null) => void;
  setConnectionStatus: (connected: boolean) => void;
  
  // UI Actions
  setSelectedPlayer: (playerId: string | null) => void;
  toggleDealModal: (show?: boolean, deal?: Deal | null) => void;
  toggleNegotiationModal: (show?: boolean) => void;
  setDiceRolling: (rolling: boolean) => void;
  
  // Error Actions
  setError: (error: GameError | null) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  
  // Chat Actions
  addChatMessage: (message: ChatMessage) => void;
  clearChat: () => void;
  
  // Deal Actions
  buyDeal: (playerId: string, dealId: string) => void;
  sellDeal: (playerId: string, dealId: string) => void;
  negotiateDeal: (fromPlayerId: string, toPlayerId: string, dealId: string, offer: number) => void;
  setAvailableDeals: (deals: Deal[]) => void;
  addDeal: (deal: Deal) => void;
  removeDeal: (dealId: string) => void;
  setActiveNegotiations: (negotiations: Negotiation[]) => void;
  addNegotiation: (negotiation: Negotiation) => void;
  updateNegotiation: (negotiationId: string, updates: Partial<Negotiation>) => void;
  removeNegotiation: (negotiationId: string) => void;
  
  // WebRTC Actions
  setLocalStream: (stream: MediaStream | null) => void;
  addRemoteStream: (peerId: string, stream: MediaStream) => void;
  removeRemoteStream: (peerId: string) => void;
  setVideoEnabled: (enabled: boolean) => void;
  setAudioEnabled: (enabled: boolean) => void;
  setWebRTCConnectionStatus: (status: WebRTCState['connectionStatus']) => void;
  setParticipants: (participants: string[]) => void;
  
  // Dice Actions
  setDiceAnimation: (animation: Partial<DiceAnimation>) => void;
  resetDiceAnimation: () => void;
}

const useGameStore = create<GameStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      game: null,
      currentPlayer: null,
      playerId: null,
      isConnected: false,
      
      // Error state
      lastError: null,
      isLoading: false,
      
      // UI State
      selectedPlayer: null,
      showDealModal: false,
      showNegotiationModal: false,
      currentDeal: null,
      diceRolling: false,
      
      // WebRTC State
      localStream: null,
      remoteStreams: {},
      isVideoEnabled: true,
      isAudioEnabled: true,
      connectionStatus: 'disconnected',
      participants: [],
      
      // Chat State
      chatMessages: [],
      
      // Deal State
      availableDeals: [],
      currentDeals: [],
      activeNegotiations: [],
      
      // Turn Timer
      turnTimerStartedAt: null,
      turnTimerDuration: 90,

      // Dice Animation
      diceAnimation: {
        isRolling: false,
        result: null,
        playerId: null
      },
      
      // Game Actions
      setGame: (game) => {
        console.log('🏪 GameStore.setGame called with:', game);
        set({ game });
        console.log('🏪 GameStore.setGame complete, new state:', { game });
      },
      setCurrentPlayer: (player) => set({ currentPlayer: player }),
      setPlayerId: (id) => set({ playerId: id }),
      setConnectionStatus: (connected) => set({ isConnected: connected }),
      
      // UI Actions
      setSelectedPlayer: (playerId) => set({ selectedPlayer: playerId }),
      toggleDealModal: (show, deal = null) => set({ 
        showDealModal: show ?? !get().showDealModal,
        currentDeal: deal 
      }),
      toggleNegotiationModal: (show) => set({ 
        showNegotiationModal: show ?? !get().showNegotiationModal 
      }),
      setDiceRolling: (rolling) => set({ diceRolling: rolling }),
      
      // Error Actions
      setError: (error) => set({ lastError: error }),
      clearError: () => set({ lastError: null }),
      setLoading: (loading) => set({ isLoading: loading }),
      
      // Chat Actions
      addChatMessage: (message) => set(state => ({
        chatMessages: [...state.chatMessages, message]
      })),
      clearChat: () => set({ chatMessages: [] }),
      
      // Deal Actions
      buyDeal: (playerId, dealId) => {
        const socket = socketService.getGameSocket();
        const { game } = get();
        if (socket && game) {
          socket.emit(SOCKET_EVENTS.BUY_DEAL, { gameId: game.id, playerId, dealId });
        }
      },
      sellDeal: (playerId, dealId) => {
        // dealId is treated as assetId — emit sell-deal to server
        const socket = socketService.getGameSocket();
        const { game } = get();
        if (socket && game) {
          socket.emit(SOCKET_EVENTS.SELL_DEAL as any, { gameId: game.id, playerId, assetId: dealId });
        }
      },
      negotiateDeal: (fromPlayerId, toPlayerId, dealId, offer) => {
        const socket = socketService.getGameSocket();
        const { game } = get();
        if (socket && game) {
          // Note: Using PROPOSE_NEGOTIATION for deal negotiation
          socket.emit(SOCKET_EVENTS.PROPOSE_NEGOTIATION, { 
            gameId: game.id, 
            proposerId: fromPlayerId, 
            targetId: toPlayerId, 
            proposal: { offerCash: offer, terms: `Deal negotiation for deal ${dealId}` } 
          });
        }
      },
      setAvailableDeals: (deals) => set({ availableDeals: deals }),
      addDeal: (deal) => set(state => ({
        availableDeals: [...state.availableDeals, deal]
      })),
      removeDeal: (dealId) => set(state => ({
        availableDeals: state.availableDeals.filter(d => d.id !== dealId)
      })),
      setActiveNegotiations: (negotiations) => set({ activeNegotiations: negotiations }),
      addNegotiation: (negotiation) => set(state => ({
        activeNegotiations: [...state.activeNegotiations, negotiation]
      })),
      updateNegotiation: (negotiationId, updates) => set(state => ({
        activeNegotiations: state.activeNegotiations.map(n => 
          n.id === negotiationId ? { ...n, ...updates } : n
        )
      })),
      removeNegotiation: (negotiationId) => set(state => ({
        activeNegotiations: state.activeNegotiations.filter(n => n.id !== negotiationId)
      })),
      
      // WebRTC Actions
      setLocalStream: (stream) => set({ localStream: stream }),
      addRemoteStream: (peerId, stream) => set(state => ({
        remoteStreams: { ...state.remoteStreams, [peerId]: stream }
      })),
      removeRemoteStream: (peerId) => set(state => {
        const { [peerId]: removed, ...remoteStreams } = state.remoteStreams;
        return { remoteStreams };
      }),
      setVideoEnabled: (enabled) => set({ isVideoEnabled: enabled }),
      setAudioEnabled: (enabled) => set({ isAudioEnabled: enabled }),
      setWebRTCConnectionStatus: (status) => set({ connectionStatus: status }),
      setParticipants: (participants) => set({ participants }),
      
      // Turn Timer Actions
      setTurnTimer: (startedAt, duration) => set({ turnTimerStartedAt: startedAt, turnTimerDuration: duration }),

      // Dice Actions
      setDiceAnimation: (animation) => set(state => ({
        diceAnimation: { ...state.diceAnimation, ...animation }
      })),
      resetDiceAnimation: () => set({
        diceAnimation: { isRolling: false, result: null, playerId: null }
      })
    }),
    { name: 'cashflow-game' }
  )
);

export default useGameStore;
