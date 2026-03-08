import { Namespace, Socket } from 'socket.io';
import { SOCKET_EVENTS } from '../../../shared/constants/game';

export class WebRTCSocketHandler {
  private rooms: Map<string, Set<string>> = new Map(); // roomId -> Set of playerIds
  private playerSockets: Map<string, string> = new Map(); // playerId -> socketId

  constructor(private io: Namespace) {}

  handleConnection(socket: Socket) {
    console.log(`WebRTC client connected: ${socket.id}`);

    socket.on(SOCKET_EVENTS.JOIN_ROOM, this.handleJoinRoom.bind(this, socket));
    socket.on(SOCKET_EVENTS.OFFER, this.handleOffer.bind(this, socket));
    socket.on(SOCKET_EVENTS.ANSWER, this.handleAnswer.bind(this, socket));
    socket.on(SOCKET_EVENTS.ICE_CANDIDATE, this.handleIceCandidate.bind(this, socket));
    socket.on('disconnect', this.handleDisconnect.bind(this, socket));
  }

  private handleJoinRoom(socket: Socket, data: { roomId: string; playerId: string }) {
    try {
      const { roomId, playerId } = data;
      
      console.log(`Player ${playerId} joining WebRTC room ${roomId}`);
      
      // Додаємо socket до кімнати
      socket.join(roomId);
      
      // Реєструємо гравця
      this.playerSockets.set(playerId, socket.id);
      
      // Додаємо гравця до кімнати
      if (!this.rooms.has(roomId)) {
        this.rooms.set(roomId, new Set());
      }
      
      const room = this.rooms.get(roomId)!;
      const existingPlayers = Array.from(room);
      
      // Додаємо нового гравця
      room.add(playerId);
      
      // Повідомляємо існуючих гравців про нового учасника
      existingPlayers.forEach(existingPlayerId => {
        const existingSocketId = this.playerSockets.get(existingPlayerId);
        if (existingSocketId) {
          const existingSocket = this.io.sockets.get(existingSocketId);
          if (existingSocket) {
            existingSocket.emit(SOCKET_EVENTS.USER_JOINED, { peerId: playerId });
          }
        }
      });
      
      // Відправляємо новому гравцю список існуючих учасників
      existingPlayers.forEach(existingPlayerId => {
        socket.emit(SOCKET_EVENTS.USER_JOINED, { peerId: existingPlayerId });
      });
      
      console.log(`Player ${playerId} joined WebRTC room ${roomId}. Room size: ${room.size}`);
      
    } catch (error) {
      console.error('Error joining WebRTC room:', error);
    }
  }

  private handleOffer(socket: Socket, data: { offer: RTCSessionDescriptionInit; to: string }) {
    try {
      const { offer, to } = data;
      const fromPlayerId = this.getPlayerIdBySocket(socket.id);
      
      if (!fromPlayerId) {
        console.error('Cannot find player ID for socket', socket.id);
        return;
      }
      
      console.log(`WebRTC offer from ${fromPlayerId} to ${to}`);
      
      // Знаходимо socket цільового гравця
      const targetSocketId = this.playerSockets.get(to);
      if (targetSocketId) {
        const targetSocket = this.io.sockets.get(targetSocketId);
        if (targetSocket) {
          targetSocket.emit(SOCKET_EVENTS.OFFER, {
            offer,
            from: fromPlayerId
          });
        }
      }
    } catch (error) {
      console.error('Error handling WebRTC offer:', error);
    }
  }

  private handleAnswer(socket: Socket, data: { answer: RTCSessionDescriptionInit; to: string }) {
    try {
      const { answer, to } = data;
      const fromPlayerId = this.getPlayerIdBySocket(socket.id);
      
      if (!fromPlayerId) {
        console.error('Cannot find player ID for socket', socket.id);
        return;
      }
      
      console.log(`WebRTC answer from ${fromPlayerId} to ${to}`);
      
      // Знаходимо socket цільового гравця
      const targetSocketId = this.playerSockets.get(to);
      if (targetSocketId) {
        const targetSocket = this.io.sockets.get(targetSocketId);
        if (targetSocket) {
          targetSocket.emit(SOCKET_EVENTS.ANSWER, {
            answer,
            from: fromPlayerId
          });
        }
      }
    } catch (error) {
      console.error('Error handling WebRTC answer:', error);
    }
  }

  private handleIceCandidate(socket: Socket, data: { candidate: RTCIceCandidateInit; to: string }) {
    try {
      const { candidate, to } = data;
      const fromPlayerId = this.getPlayerIdBySocket(socket.id);
      
      if (!fromPlayerId) {
        console.error('Cannot find player ID for socket', socket.id);
        return;
      }
      
      // Знаходимо socket цільового гравця
      const targetSocketId = this.playerSockets.get(to);
      if (targetSocketId) {
        const targetSocket = this.io.sockets.get(targetSocketId);
        if (targetSocket) {
          targetSocket.emit(SOCKET_EVENTS.ICE_CANDIDATE, {
            candidate,
            from: fromPlayerId
          });
        }
      }
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }

  private handleDisconnect(socket: Socket) {
    const playerId = this.getPlayerIdBySocket(socket.id);
    
    if (playerId) {
      console.log(`WebRTC client ${playerId} disconnected`);
      
      // Видаляємо з реєстру
      this.playerSockets.delete(playerId);
      
      // Видаляємо з усіх кімнат та повідомляємо інших
      for (const [roomId, players] of this.rooms.entries()) {
        if (players.has(playerId)) {
          players.delete(playerId);
          
          // Повідомляємо інших гравців у кімнаті
          socket.to(roomId).emit(SOCKET_EVENTS.USER_LEFT, { peerId: playerId });
          
          // Якщо кімната порожня, видаляємо її
          if (players.size === 0) {
            this.rooms.delete(roomId);
            console.log(`WebRTC room ${roomId} deleted (empty)`);
          }
          
          break;
        }
      }
    } else {
      console.log(`WebRTC client disconnected: ${socket.id} (no player ID found)`);
    }
  }

  private getPlayerIdBySocket(socketId: string): string | undefined {
    for (const [playerId, playerSocketId] of this.playerSockets.entries()) {
      if (playerSocketId === socketId) {
        return playerId;
      }
    }
    return undefined;
  }

  // Публічні методи для отримання статистики
  getRoomInfo(roomId: string) {
    const room = this.rooms.get(roomId);
    return {
      exists: !!room,
      playerCount: room ? room.size : 0,
      players: room ? Array.from(room) : []
    };
  }

  getAllRooms() {
    const result: { [roomId: string]: string[] } = {};
    for (const [roomId, players] of this.rooms.entries()) {
      result[roomId] = Array.from(players);
    }
    return result;
  }
}
