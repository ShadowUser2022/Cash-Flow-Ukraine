import { io, Socket } from "socket.io-client";
import type { ServerToClientEvents, ClientToServerEvents } from "../types";
import { SOCKET_EVENTS } from "../constants/socketEvents";
import config from "../config/api";

class SocketService {
  private gameSocket: Socket<
    ServerToClientEvents,
    ClientToServerEvents
  > | null = null;
  private webrtcSocket: Socket<
    ServerToClientEvents,
    ClientToServerEvents
  > | null = null;
  private serverUrl: string;
  private _pendingRejoin: { gameId: string; playerId: string; playerName?: string } | null = null;

  constructor() {
    this.serverUrl = config.socketUrl;
  }

  // Підключення до ігрового namespace
  connectToGame(): Socket<ServerToClientEvents, ClientToServerEvents> {
    if (this.gameSocket?.connected) {
      return this.gameSocket;
    }

    this.gameSocket = io(`${this.serverUrl}/game`, {
      transports: ["websocket", "polling"],
      timeout: 20000,
      retries: 3,
    });

    this.gameSocket.on("connect", () => {
      console.log("✅ Connected to game server:", this.gameSocket?.id);
      // ✅ FIX: якщо socket перепідключився з новим ID — автоматично re-join кімнати гри
      // Інакше після reconnect socket не отримує broadcast events (turn-completed тощо)
      if (this._pendingRejoin) {
        const { gameId, playerId, playerName } = this._pendingRejoin;
        console.log(`🔄 Auto-rejoining game room ${gameId} after reconnect`);
        this.gameSocket?.emit("join-game" as any, { gameId, playerId, playerName });
      }
    });

    this.gameSocket.on("disconnect", (reason) => {
      console.log("⚠️ Disconnected from game server:", reason);
    });

    this.gameSocket.on("connect_error", (error) => {
      console.error("Game connection error:", error);
    });

    return this.gameSocket;
  }

  setRejoinData(gameId: string, playerId: string, playerName?: string) {
    this._pendingRejoin = { gameId, playerId, playerName };
  }

  clearRejoinData() {
    this._pendingRejoin = null;
  }

  // Підключення до WebRTC namespace
  connectToWebRTC(): Socket<ServerToClientEvents, ClientToServerEvents> {
    if (this.webrtcSocket?.connected) {
      return this.webrtcSocket;
    }

    this.webrtcSocket = io(`${this.serverUrl}/webrtc`, {
      transports: ["websocket", "polling"],
      timeout: 20000,
      retries: 3,
    });

    this.webrtcSocket.on("connect", () => {
      console.log("Connected to WebRTC server");
    });

    this.webrtcSocket.on("disconnect", (reason) => {
      console.log("Disconnected from WebRTC server:", reason);
    });

    this.webrtcSocket.on("connect_error", (error) => {
      console.error("WebRTC connection error:", error);
    });

    return this.webrtcSocket;
  }

  // Ігрові методи
  joinGame(gameId: string, playerId: string, playerName?: string) {
    if (!this.gameSocket) {
      throw new Error("Game socket not connected");
    }

    this.gameSocket.emit(SOCKET_EVENTS.JOIN_GAME, {
      gameId,
      playerId,
      playerName,
    });

    // ✅ FIX: зберігаємо дані для авто-rejoin при reconnect
    this.setRejoinData(gameId, playerId, playerName);
  }

  leaveGame(gameId: string, playerId: string) {
    if (!this.gameSocket) return;

    this.gameSocket.emit(SOCKET_EVENTS.LEAVE_GAME, {
      gameId,
      playerId,
    });
  }

  rollDice(gameId: string, playerId: string) {
    if (!this.gameSocket) {
      throw new Error("Game socket not connected");
    }

    this.gameSocket.emit(SOCKET_EVENTS.ROLL_DICE, {
      gameId,
      playerId,
    });
  }

  makeDeal(gameId: string, playerId: string, dealId: string) {
    if (!this.gameSocket) {
      throw new Error("Game socket not connected");
    }

    this.gameSocket.emit(SOCKET_EVENTS.MAKE_DEAL, {
      gameId,
      playerId,
      dealId,
    });
  }

  buyDeal(gameId: string, playerId: string, dealId: string) {
    if (!this.gameSocket) {
      throw new Error("Game socket not connected");
    }

    this.gameSocket.emit(SOCKET_EVENTS.BUY_DEAL, {
      gameId,
      playerId,
      dealId,
    });
  }

  executeTurn(gameId: string, playerId: string) {
    if (!this.gameSocket) {
      throw new Error("Game socket not connected");
    }

    this.gameSocket.emit(SOCKET_EVENTS.EXECUTE_TURN, {
      gameId,
      playerId,
    });
  }

  moveToFastTrack(gameId: string, playerId: string) {
    if (!this.gameSocket) {
      throw new Error("Game socket not connected");
    }

    this.gameSocket.emit(SOCKET_EVENTS.MOVE_TO_FAST_TRACK, {
      gameId,
      playerId,
    });
  }

  generateDeals(gameId: string, count: number = 4) {
    if (!this.gameSocket) {
      throw new Error("Game socket not connected");
    }

    this.gameSocket.emit(SOCKET_EVENTS.GENERATE_DEALS, {
      gameId,
      count,
    });
  }

  setReady(gameId: string, playerId: string) {
    if (!this.gameSocket) {
      throw new Error("Game socket not connected");
    }

    this.gameSocket.emit(SOCKET_EVENTS.READY_TO_START, {
      gameId,
      playerId,
    });
  }

  completeTurn(gameId: string, playerId: string) {
    if (!this.gameSocket) {
      throw new Error("Game socket not connected");
    }

    this.gameSocket.emit("turn-completed" as any, {
      gameId,
      playerId,
    });
  }

  // Card action methods
  payExpense(gameId: string, playerId: string, amount: number, reason?: string) {
    if (!this.gameSocket) {
      throw new Error("Game socket not connected");
    }

    this.gameSocket.emit(SOCKET_EVENTS.PAY_EXPENSE, {
      gameId,
      playerId,
      amount,
      reason,
    });
  }

  charityChoice(
    gameId: string,
    playerId: string,
    choice: string,
    amount?: number,
  ) {
    if (!this.gameSocket) {
      throw new Error("Game socket not connected");
    }

    this.gameSocket.emit(SOCKET_EVENTS.CHARITY_CHOICE, {
      gameId,
      playerId,
      choice,
      amount,
    });
  }

  marketAction(gameId: string, playerId: string, action: string, data?: any) {
    if (!this.gameSocket) {
      throw new Error("Game socket not connected");
    }

    this.gameSocket.emit(SOCKET_EVENTS.MARKET_ACTION, {
      gameId,
      playerId,
      action,
      data,
    });
  }

  // Нові методи для фінансових операцій
  receiveIncome(
    gameId: string,
    playerId: string,
    amount: number,
    description?: string,
  ) {
    if (!this.gameSocket) {
      throw new Error("Game socket not connected");
    }

    this.gameSocket.emit(SOCKET_EVENTS.RECEIVE_INCOME as any, {
      gameId,
      playerId,
      amount,
      description,
    });
  }

  collectSalary(gameId: string, playerId: string) {
    if (!this.gameSocket) {
      throw new Error("Game socket not connected");
    }

    this.gameSocket.emit(SOCKET_EVENTS.COLLECT_SALARY as any, {
      gameId,
      playerId,
    });
  }

  getPlayerFinances(gameId: string, playerId: string): Promise<any> {
    if (!this.gameSocket) {
      throw new Error("Game socket not connected");
    }

    return new Promise((resolve, reject) => {
      this.gameSocket!.emit(
        SOCKET_EVENTS.GET_PLAYER_FINANCES as any,
        {
          gameId,
          playerId,
        },
        (response: any) => {
          if (response.success) {
            resolve(response.finances);
          } else {
            reject(new Error(response.error));
          }
        },
      );
    });
  }

  // 🏗️ Auction — ставка на велику угоду
  placeBid(gameId: string, playerId: string, amount: number) {
    if (!this.gameSocket) throw new Error("Game socket not connected");
    this.gameSocket.emit("place-bid" as any, { gameId, playerId, amount });
  }

  // 🏗️ Auction — пас (відмова від великої угоди)
  passBid(gameId: string, playerId: string) {
    if (!this.gameSocket) throw new Error("Game socket not connected");
    this.gameSocket.emit("pass-bid" as any, { gameId, playerId });
  }

  // Reject deal — відхилити угоду (картку opportunity/business)
  rejectDeal(gameId: string, playerId: string, dealId: string) {
    if (!this.gameSocket) {
      throw new Error("Game socket not connected");
    }
    this.gameSocket.emit("reject-deal" as any, { gameId, playerId, dealId });
  }

  // Sell asset (Phase 4)
  sellAsset(gameId: string, playerId: string, assetId: string, sellPrice?: number) {
    if (!this.gameSocket) {
      throw new Error("Game socket not connected");
    }
    this.gameSocket.emit("sell-deal" as any, { gameId, playerId, assetId, sellPrice });
  }

  // Dream methods
  setPlayerDream(gameId: string, playerId: string, dream: any) {
    if (!this.gameSocket) {
      throw new Error("Game socket not connected");
    }

    this.gameSocket.emit(SOCKET_EVENTS.SET_PLAYER_DREAM as any, {
      gameId,
      playerId,
      dream,
    });
  }

  getPlayerDream(
    gameId: string,
    playerId: string,
  ): Promise<{ dream: any; hasSelected: boolean }> {
    if (!this.gameSocket) {
      throw new Error("Game socket not connected");
    }

    return new Promise((resolve, reject) => {
      this.gameSocket!.emit(
        SOCKET_EVENTS.GET_PLAYER_DREAM as any,
        {
          gameId,
          playerId,
        },
        (response: any) => {
          if (response.success) {
            resolve({
              dream: response.dream,
              hasSelected: response.hasSelected,
            });
          } else {
            reject(new Error(response.error));
          }
        },
      );
    });
  }

  // WebRTC методи
  joinWebRTCRoom(roomId: string, playerId: string) {
    if (!this.webrtcSocket) {
      throw new Error("WebRTC socket not connected");
    }

    this.webrtcSocket.emit(SOCKET_EVENTS.JOIN_ROOM, {
      roomId,
      playerId,
    });
  }

  sendOffer(offer: RTCSessionDescriptionInit, to: string) {
    if (!this.webrtcSocket) {
      throw new Error("WebRTC socket not connected");
    }

    this.webrtcSocket.emit(SOCKET_EVENTS.OFFER, {
      offer,
      to,
    });
  }

  sendAnswer(answer: RTCSessionDescriptionInit, to: string) {
    if (!this.webrtcSocket) {
      throw new Error("WebRTC socket not connected");
    }

    this.webrtcSocket.emit(SOCKET_EVENTS.ANSWER, {
      answer,
      to,
    });
  }

  sendIceCandidate(candidate: RTCIceCandidateInit, to: string) {
    if (!this.webrtcSocket) {
      throw new Error("WebRTC socket not connected");
    }

    this.webrtcSocket.emit(SOCKET_EVENTS.ICE_CANDIDATE, {
      candidate,
      to,
    });
  }

  // Підписка на події
  onGameEvent<T extends keyof ServerToClientEvents>(
    event: T,
    handler: ServerToClientEvents[T],
  ) {
    if (!this.gameSocket) {
      throw new Error("Game socket not connected");
    }

    this.gameSocket.on(event, handler);
  }

  onWebRTCEvent<T extends keyof ServerToClientEvents>(
    event: T,
    handler: ServerToClientEvents[T],
  ) {
    if (!this.webrtcSocket) {
      throw new Error("WebRTC socket not connected");
    }

    this.webrtcSocket.on(event, handler);
  }

  // Відписка від подій
  offGameEvent<T extends keyof ServerToClientEvents>(
    event: T,
    handler?: ServerToClientEvents[T],
  ) {
    if (this.gameSocket) {
      this.gameSocket.off(event, handler);
    }
  }

  offWebRTCEvent<T extends keyof ServerToClientEvents>(
    event: T,
    handler?: ServerToClientEvents[T],
  ) {
    if (this.webrtcSocket) {
      this.webrtcSocket.off(event, handler);
    }
  }

  // Від'єднання
  disconnectGame() {
    if (this.gameSocket) {
      this.gameSocket.disconnect();
      this.gameSocket = null;
    }
  }

  disconnectWebRTC() {
    if (this.webrtcSocket) {
      this.webrtcSocket.disconnect();
      this.webrtcSocket = null;
    }
  }

  disconnectAll() {
    this.disconnectGame();
    this.disconnectWebRTC();
  }

  // Геттери для статусу з'єднання
  get isGameConnected(): boolean {
    return this.gameSocket?.connected || false;
  }

  get isWebRTCConnected(): boolean {
    return this.webrtcSocket?.connected || false;
  }

  // Геттери для сокетів
  getGameSocket(): Socket<ServerToClientEvents, ClientToServerEvents> | null {
    return this.gameSocket;
  }

  getWebRTCSocket(): Socket<ServerToClientEvents, ClientToServerEvents> | null {
    return this.webrtcSocket;
  }
}

// Експортуємо єдиний екземпляр
export const socketService = new SocketService();
