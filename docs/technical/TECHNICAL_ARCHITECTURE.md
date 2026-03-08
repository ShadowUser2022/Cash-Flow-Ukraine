# Cash Flow Ukraine - Технічна архітектура (Enhanced Edition)
*Версія: 2.0.0-enhanced | Дата: 15.06.2025*

## 1. Актуальна структура проекту

```
Cash Flow Ukr/
├── docs/                        # 📚 Документація (організована)
│   ├── api/                     # API документація
│   │   └── REST-API.md         # Повна REST API документація
│   ├── technical/               # Технічна документація
│   │   ├── TECHNICAL_ARCHITECTURE.md  # Ця документація
│   │   ├── ENHANCED_INTEGRATION_COMPLETE.md
│   │   └── PROJECT_DESIGN.md
│   ├── user-guides/            # Інструкції користувача
│   ├── project-management/     # Управління проектом
│   └── README.md               # Індекс документації
├── backend/                     # 🔧 Node.js + Express сервер (Enhanced)
│   ├── src/
│   │   ├── controllers/        # HTTP контролери (TypeScript)
│   │   │   └── gameController-memory.ts  # Головний контролер
│   │   ├── services/           # Бізнес логіка
│   │   │   ├── GameService-memory.ts     # In-memory сервіс гри
│   │   │   ├── GameMechanicsService.ts   # Ігрова механіка
│   │   │   └── DealService.ts            # Сервіс угод
│   │   ├── models/             # Моделі даних
│   │   │   └── Game.ts         # TypeScript моделі
│   │   ├── middleware/         # Express middleware
│   │   ├── sockets/            # Socket.io обробники
│   │   ├── utils/              # Утиліти
│   │   └── types/              # TypeScript типи
│   ├── config/                 # Конфігурація
│   │   └── server.config.ts    # Головна конфігурація
│   ├── scripts/                # Скрипти запуску
│   │   └── server.js          # Enhanced запускач
│   ├── cashflow-server-enhanced.js  # Поточний робочий сервер
│   ├── package.json
│   └── tsconfig.json
├── frontend/                    # 🎨 React + TypeScript додаток
│   ├── public/
│   ├── src/
│   │   ├── components/         # Компоненти React
│   │   │   ├── GameBoard/      # Ігрове поле
│   │   │   ├── VideoChat/      # Відеочат
│   │   │   ├── PlayerPanel/    # Панель гравця
│   │   │   ├── DealsPanel/     # Панель угод
│   │   │   ├── GameLobby/      # Лобі гри
│   │   │   └── Chat/           # Текстовий чат
│   │   ├── hooks/              # Custom hooks
│   │   ├── services/           # API сервіси
│   │   ├── types/              # TypeScript типи
│   │   ├── utils/              # Утиліти
│   │   └── store/              # Zustand store
│   ├── package.json
│   └── vite.config.ts
├── shared/                      # 🔄 Спільні типи та утиліти
│   ├── types/
│   │   └── game.ts             # Спільні типи гри
│   └── constants/
│       └── game.ts             # Ігрові константи
├── scripts/                     # 🚀 Скрипти проекту
│   └── setup/
│       └── install.sh          # Автоматична установка
├── tests/                       # 🧪 Тести
│   └── integration/            # Інтеграційні тести
└── README.md                   # Головний README
```

## 2. Архітектура Backend (Enhanced Edition)

## 2. Архітектура Backend (Enhanced Edition)

### 2.1 Поточна архітектура зберігання
**In-Memory Storage** (замість MongoDB):
- Використовується `Map<string, Game>` для зберігання ігор
- Дані зберігаються в оперативній пам'яті
- Автоматичне очищення старих ігор
- Готово для майбутнього переходу на MongoDB

### 2.2 Основні сервіси

#### GameService-memory.ts
- Управління іграми в пам'яті
- CRUD операції для ігор
- Управління гравцями
- Ігрова логіка

#### GameMechanicsService.ts
- Кидання кубика та переміщення
- Ефекти клітинок
- Ігрова механіка

#### DealService.ts
- Генерація угод (малі, великі, ринкові, дрібнички)
- Управління угодами
- Ринкові події

### 2.3 API Endpoints (v2.0.0-enhanced)

**Base URL**: `http://localhost:3001`

#### Базові операції:
- `POST /api/games/create` - Створення гри
- `GET /api/games` - Список ігор
- `GET /api/games/:gameId` - Дані гри
- `GET /api/games/:gameId/state` - Повний стан гри
- `POST /api/games/:gameId/join` - Приєднання до гри
- `POST /api/games/:gameId/start` - Старт гри

#### Ігрові механіки:
- `POST /api/games/:gameId/roll-dice` - Кидання кубика
- `POST /api/games/:gameId/end-turn` - Завершення ходу
- `POST /api/games/:gameId/draw-deal` - Взяття угоди
- `POST /api/games/:gameId/execute-deal` - Виконання угоди

### 2.4 Socket.IO Real-time Події

#### Client → Server:
- `joinGame`, `leaveGame`, `playerReady`
- `diceRolled`, `turnEnded`
- `dealDrawn`, `dealExecuted`

#### Server → Client:
- `playerJoined`, `playerLeft`, `gameStarted`
- `diceRolled`, `turnEnded`
- `dealDrawn`, `dealExecuted`, `playerDisconnected`

## 3. Frontend архітектура (React + Vite)
import { BoardCell } from './BoardCell';
import { DiceRoller } from './DiceRoller';

interface GameBoardProps {
  gameId: string;
}

export const GameBoard: React.FC<GameBoardProps> = ({ gameId }) => {
  const { gameState, players, currentPlayer } = useGameStore();
  
  return (
    <div className="game-board">
      <div className="rat-race-track">
        {gameState.ratRaceCells.map((cell, index) => (
          <BoardCell
            key={index}
            cell={cell}
            players={players.filter(p => p.position === index)}
            isCurrentPosition={currentPlayer?.position === index}
          />
        ))}
      </div>
      
      <div className="fast-track">
        {gameState.fastTrackCells.map((cell, index) => (
          <BoardCell
            key={`fast-${index}`}
            cell={cell}
            players={players.filter(p => p.fastTrackPosition === index)}
          />
        ))}
      </div>
      
      <DiceRoller onRoll={handleDiceRoll} disabled={!isCurrentPlayerTurn} />
    </div>
  );
};
```

#### VideoChat Component with WebRTC
```typescript
// frontend/src/components/VideoChat/VideoChat.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useWebRTC } from '../../hooks/useWebRTC';
import { VideoStream } from './VideoStream';

interface VideoChatProps {
  roomId: string;
  playerId: string;
}

export const VideoChat: React.FC<VideoChatProps> = ({ roomId, playerId }) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const { 
    localStream, 
    remoteStreams, 
    isConnected, 
    toggleVideo, 
    toggleAudio,
    isVideoEnabled,
    isAudioEnabled 
  } = useWebRTC(roomId, playerId);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  return (
    <div className="video-chat">
      <div className="video-grid">
        {/* Локальне відео */}
        <div className="video-container local">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="video-stream"
          />
          <div className="video-controls">
            <button onClick={toggleVideo} className={isVideoEnabled ? 'active' : ''}>
              📹
            </button>
            <button onClick={toggleAudio} className={isAudioEnabled ? 'active' : ''}>
              🎤
            </button>
          </div>
        </div>

        {/* Віддалені відео */}
        {Object.entries(remoteStreams).map(([peerId, stream]) => (
          <VideoStream
            key={peerId}
            stream={stream}
            peerId={peerId}
          />
        ))}
      </div>
    </div>
  );
};
```

#### WebRTC Hook
```typescript
// frontend/src/hooks/useWebRTC.ts
import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export const useWebRTC = (roomId: string, playerId: string) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  
  const socketRef = useRef<Socket>();
  const peerConnectionsRef = useRef<Record<string, RTCPeerConnection>>({});
  const localStreamRef = useRef<MediaStream>();

  useEffect(() => {
    initializeMedia();
    initializeSocket();
    
    return () => {
      cleanup();
    };
  }, [roomId, playerId]);

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240 },
        audio: true
      });
      setLocalStream(stream);
      localStreamRef.current = stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  const initializeSocket = () => {
    socketRef.current = io('/webrtc');
    
    socketRef.current.emit('join-room', { roomId, playerId });
    
    socketRef.current.on('user-joined', handleUserJoined);
    socketRef.current.on('offer', handleOffer);
    socketRef.current.on('answer', handleAnswer);
    socketRef.current.on('ice-candidate', handleIceCandidate);
    socketRef.current.on('user-left', handleUserLeft);
  };

  const createPeerConnection = (peerId: string): RTCPeerConnection => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    // Додаємо локальний стрім
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStreamRef.current!);
      });
    }

    // Обробляємо віддалений стрім
    peerConnection.ontrack = (event) => {
      setRemoteStreams(prev => ({
        ...prev,
        [peerId]: event.streams[0]
      }));
    };

    // Обробляємо ICE кандидатів
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit('ice-candidate', {
          candidate: event.candidate,
          to: peerId
        });
      }
    };

    peerConnectionsRef.current[peerId] = peerConnection;
    return peerConnection;
  };

  const handleUserJoined = async ({ peerId }: { peerId: string }) => {
    const peerConnection = createPeerConnection(peerId);
    
    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      socketRef.current?.emit('offer', {
        offer,
        to: peerId
      });
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  };

  const handleOffer = async ({ offer, from }: { offer: RTCSessionDescriptionInit, from: string }) => {
    const peerConnection = createPeerConnection(from);
    
    try {
      await peerConnection.setRemoteDescription(offer);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      
      socketRef.current?.emit('answer', {
        answer,
        to: from
      });
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  };

  const handleAnswer = async ({ answer, from }: { answer: RTCSessionDescriptionInit, from: string }) => {
    const peerConnection = peerConnectionsRef.current[from];
    if (peerConnection) {
      try {
        await peerConnection.setRemoteDescription(answer);
      } catch (error) {
        console.error('Error handling answer:', error);
      }
    }
  };

  const handleIceCandidate = async ({ candidate, from }: { candidate: RTCIceCandidateInit, from: string }) => {
    const peerConnection = peerConnectionsRef.current[from];
    if (peerConnection) {
      try {
        await peerConnection.addIceCandidate(candidate);
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    }
  };

  const handleUserLeft = ({ peerId }: { peerId: string }) => {
    if (peerConnectionsRef.current[peerId]) {
      peerConnectionsRef.current[peerId].close();
      delete peerConnectionsRef.current[peerId];
    }
    
    setRemoteStreams(prev => {
      const newStreams = { ...prev };
      delete newStreams[peerId];
      return newStreams;
    });
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const cleanup = () => {
    // Закриваємо всі peer connections
    Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
    peerConnectionsRef.current = {};
    
    // Зупиняємо локальний стрім
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    // Закриваємо socket
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  };

  return {
    localStream,
    remoteStreams,
    isConnected,
    isVideoEnabled,
    isAudioEnabled,
    toggleVideo,
    toggleAudio
  };
};
```

## 3. Backend архітектура

### 3.1 Socket.io обробники

#### Game Socket Handler
```typescript
// backend/src/sockets/gameSocketHandler.ts
import { Server, Socket } from 'socket.io';
import { GameService } from '../services/GameService';
import { DealService } from '../services/DealService';
import { Game, Player, Deal } from '../types/game';

export class GameSocketHandler {
  private gameService: GameService;
  private dealService: DealService;

  constructor(private io: Server) {
    this.gameService = new GameService();
    this.dealService = new DealService();
  }

  handleConnection(socket: Socket) {
    console.log(`User connected: ${socket.id}`);

    socket.on('join-game', this.handleJoinGame.bind(this, socket));
    socket.on('roll-dice', this.handleRollDice.bind(this, socket));
    socket.on('make-deal', this.handleMakeDeal.bind(this, socket));
    socket.on('propose-negotiation', this.handleProposeNegotiation.bind(this, socket));
    socket.on('respond-negotiation', this.handleRespondNegotiation.bind(this, socket));
    socket.on('disconnect', this.handleDisconnect.bind(this, socket));
  }

  private async handleJoinGame(socket: Socket, data: { gameId: string; playerId: string }) {
    try {
      const { gameId, playerId } = data;
      
      // Додаємо гравця до гри
      const game = await this.gameService.addPlayerToGame(gameId, playerId);
      
      // Додаємо socket до кімнати
      socket.join(gameId);
      
      // Відправляємо стан гри
      socket.emit('game-state', game);
      
      // Повідомляємо інших гравців
      socket.to(gameId).emit('player-joined', {
        playerId,
        playerData: game.players.find(p => p.id === playerId)
      });
      
      console.log(`Player ${playerId} joined game ${gameId}`);
    } catch (error) {
      socket.emit('error', { message: 'Failed to join game', error: error.message });
    }
  }

  private async handleRollDice(socket: Socket, data: { gameId: string; playerId: string }) {
    try {
      const { gameId, playerId } = data;
      
      // Перевіряємо чи це хід гравця
      const game = await this.gameService.getGame(gameId);
      if (game.currentPlayer !== playerId) {
        socket.emit('error', { message: 'Not your turn' });
        return;
      }
      
      // Кидаємо кубик
      const diceResult = Math.floor(Math.random() * 6) + 1;
      
      // Оновлюємо позицію гравця
      const updatedGame = await this.gameService.movePlayer(gameId, playerId, diceResult);
      
      // Відправляємо оновлення всім гравцям
      this.io.to(gameId).emit('dice-rolled', {
        playerId,
        diceResult,
        newPosition: updatedGame.players.find(p => p.id === playerId)?.position,
        gameState: updatedGame
      });
      
      // Обробляємо клітинку на яку потрапив гравець
      const cellAction = await this.gameService.handleCellAction(gameId, playerId);
      if (cellAction) {
        this.io.to(gameId).emit('cell-action', cellAction);
      }
      
    } catch (error) {
      socket.emit('error', { message: 'Failed to roll dice', error: error.message });
    }
  }

  private async handleMakeDeal(socket: Socket, data: { gameId: string; playerId: string; dealId: string }) {
    try {
      const { gameId, playerId, dealId } = data;
      
      // Обробляємо угоду
      const result = await this.dealService.processDeal(gameId, playerId, dealId);
      
      // Оновлюємо стан гри
      const updatedGame = await this.gameService.updatePlayerFinances(gameId, playerId, result.financialChanges);
      
      // Відправляємо оновлення
      this.io.to(gameId).emit('deal-completed', {
        playerId,
        dealId,
        result,
        gameState: updatedGame
      });
      
      // Генеруємо нові угоди
      const newDeals = await this.dealService.generateNewDeals(gameId);
      this.io.to(gameId).emit('new-deals', newDeals);
      
    } catch (error) {
      socket.emit('error', { message: 'Failed to make deal', error: error.message });
    }
  }

  private async handleProposeNegotiation(socket: Socket, data: {
    gameId: string;
    proposerId: string;
    targetId: string;
    proposal: any;
  }) {
    try {
      const { gameId, proposerId, targetId, proposal } = data;
      
      // Створюємо переговори
      const negotiation = await this.gameService.createNegotiation(gameId, proposerId, targetId, proposal);
      
      // Відправляємо пропозицію цільовому гравцю
      const targetSocket = this.getSocketByPlayerId(targetId);
      if (targetSocket) {
        targetSocket.emit('negotiation-proposal', {
          negotiationId: negotiation.id,
          proposerId,
          proposal
        });
      }
      
      // Сповіщаємо ініціатора
      socket.emit('negotiation-sent', { negotiationId: negotiation.id });
      
    } catch (error) {
      socket.emit('error', { message: 'Failed to propose negotiation', error: error.message });
    }
  }

  private async handleRespondNegotiation(socket: Socket, data: {
    gameId: string;
    negotiationId: string;
    playerId: string;
    response: 'accept' | 'reject' | 'counter';
    counterProposal?: any;
  }) {
    try {
      const { gameId, negotiationId, playerId, response, counterProposal } = data;
      
      const result = await this.gameService.respondToNegotiation(
        gameId, 
        negotiationId, 
        playerId, 
        response, 
        counterProposal
      );
      
      // Відправляємо результат обом сторонам
      this.io.to(gameId).emit('negotiation-response', {
        negotiationId,
        response,
        result
      });
      
      // Якщо угода прийнята, виконуємо її
      if (response === 'accept' && result.completed) {
        const updatedGame = await this.gameService.executeNegotiation(gameId, negotiationId);
        this.io.to(gameId).emit('game-state', updatedGame);
      }
      
    } catch (error) {
      socket.emit('error', { message: 'Failed to respond to negotiation', error: error.message });
    }
  }

  private handleDisconnect(socket: Socket) {
    console.log(`User disconnected: ${socket.id}`);
    // Логіка відключення гравця
  }

  private getSocketByPlayerId(playerId: string): Socket | undefined {
    // Реалізація пошуку socket по playerId
    // Потрібно зберігати mapping playerId -> socketId
    return undefined;
  }
}
```

### 3.2 Game Service
```typescript
// backend/src/services/GameService.ts
import { Game, Player, GameState, Position } from '../types/game';
import { GameModel } from '../models/Game';
import { DealService } from './DealService';

export class GameService {
  private dealService: DealService;

  constructor() {
    this.dealService = new DealService();
  }

  async createGame(hostId: string): Promise<Game> {
    const game: Game = {
      id: this.generateGameId(),
      hostId,
      players: [],
      state: GameState.WAITING,
      currentPlayer: '',
      turn: 0,
      settings: {
        maxPlayers: 6,
        timeLimit: 3600, // 1 година
        language: 'uk'
      },
      board: this.initializeBoard(),
      deals: await this.dealService.getInitialDeals(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await GameModel.create(game);
    return game;
  }

  async addPlayerToGame(gameId: string, playerId: string): Promise<Game> {
    const game = await this.getGame(gameId);
    
    if (game.players.length >= game.settings.maxPlayers) {
      throw new Error('Game is full');
    }

    if (game.players.find(p => p.id === playerId)) {
      throw new Error('Player already in game');
    }

    const player: Player = {
      id: playerId,
      name: `Player ${game.players.length + 1}`,
      profession: this.assignRandomProfession(),
      position: 0,
      fastTrackPosition: -1,
      finances: this.getInitialFinances(),
      assets: [],
      passiveIncome: 0,
      isOnFastTrack: false,
      isReady: false
    };

    game.players.push(player);
    
    // Якщо це перший гравець, робимо його поточним
    if (game.players.length === 1) {
      game.currentPlayer = playerId;
    }

    await this.updateGame(game);
    return game;
  }

  async movePlayer(gameId: string, playerId: string, steps: number): Promise<Game> {
    const game = await this.getGame(gameId);
    const player = game.players.find(p => p.id === playerId);
    
    if (!player) {
      throw new Error('Player not found');
    }

    if (player.isOnFastTrack) {
      player.fastTrackPosition = (player.fastTrackPosition + steps) % 8;
    } else {
      player.position = (player.position + steps) % 24;
      
      // Перевіряємо чи гравець може перейти на швидку доріжку
      if (this.canMoveToFastTrack(player)) {
        player.isOnFastTrack = true;
        player.fastTrackPosition = 0;
      }
    }

    // Переходимо до наступного гравця
    game.currentPlayer = this.getNextPlayer(game, playerId);
    game.turn++;

    await this.updateGame(game);
    return game;
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

  private async handleOpportunityCell(game: Game, player: Player) {
    // Дістаємо нову угоду
    const deal = await this.dealService.getRandomDeal('small');
    
    return {
      type: 'opportunity',
      deal,
      playerId: player.id
    };
  }

  private async handleMarketCell(game: Game, player: Player) {
    // Ринкові умови впливають на всіх гравців
    const marketEvent = await this.dealService.getMarketEvent();
    
    return {
      type: 'market',
      event: marketEvent,
      affectedPlayers: game.players.map(p => p.id)
    };
  }

  private canMoveToFastTrack(player: Player): boolean {
    return player.passiveIncome > player.finances.expenses;
  }

  private getNextPlayer(game: Game, currentPlayerId: string): string {
    const currentIndex = game.players.findIndex(p => p.id === currentPlayerId);
    const nextIndex = (currentIndex + 1) % game.players.length;
    return game.players[nextIndex].id;
  }

  private getCellType(player: Player): string {
    const cells = [
      'opportunity', 'doodad', 'market', 'opportunity',
      'doodad', 'charity', 'opportunity', 'market',
      'doodad', 'opportunity', 'market', 'doodad',
      'opportunity', 'market', 'doodad', 'opportunity',
      'market', 'doodad', 'opportunity', 'market',
      'doodad', 'opportunity', 'charity', 'market'
    ];
    
    return cells[player.position] || 'opportunity';
  }

  // Утилітарні методи
  private generateGameId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private assignRandomProfession() {
    const professions = [
      { name: 'Вчитель', salary: 3300, expenses: 2500 },
      { name: 'Медсестра', salary: 3100, expenses: 2300 },
      { name: 'Поліцейський', salary: 3000, expenses: 2200 },
      { name: 'Інженер', salary: 4900, expenses: 3900 },
      { name: 'Лікар', salary: 13200, expenses: 9650 },
      { name: 'Юрист', salary: 7500, expenses: 6100 }
    ];
    
    return professions[Math.floor(Math.random() * professions.length)];
  }

  private getInitialFinances() {
    return {
      salary: 0,
      passiveIncome: 0,
      expenses: 0,
      cash: 400,
      assets: [],
      liabilities: []
    };
  }

  private initializeBoard() {
    // Ініціалізація ігрового поля
    return {
      ratRaceCells: new Array(24).fill(null).map((_, index) => ({
        id: index,
        type: this.getCellTypeByIndex(index)
      })),
      fastTrackCells: new Array(8).fill(null).map((_, index) => ({
        id: index,
        type: 'dream'
      }))
    };
  }

  private getCellTypeByIndex(index: number): string {
    const pattern = [
      'opportunity', 'doodad', 'market', 'opportunity',
      'doodad', 'charity', 'opportunity', 'market',
      'doodad', 'opportunity', 'market', 'doodad',
      'opportunity', 'market', 'doodad', 'opportunity',
      'market', 'doodad', 'opportunity', 'market',
      'doodad', 'opportunity', 'charity', 'market'
    ];
    
    return pattern[index] || 'opportunity';
  }

  private async updateGame(game: Game): Promise<void> {
    game.updatedAt = new Date();
    await GameModel.findByIdAndUpdate(game.id, game);
  }

  async getGame(gameId: string): Promise<Game> {
    const game = await GameModel.findById(gameId);
    if (!game) {
      throw new Error('Game not found');
    }
    return game.toObject();
  }
}
```

## 4. WebRTC Integration

### 4.1 WebRTC Socket Handler
```typescript
// backend/src/sockets/webrtcSocketHandler.ts
import { Server, Socket } from 'socket.io';

export class WebRTCSocketHandler {
  private rooms: Map<string, Set<string>> = new Map();

  constructor(private io: Server) {}

  handleConnection(socket: Socket) {
    socket.on('join-room', this.handleJoinRoom.bind(this, socket));
    socket.on('offer', this.handleOffer.bind(this, socket));
    socket.on('answer', this.handleAnswer.bind(this, socket));
    socket.on('ice-candidate', this.handleIceCandidate.bind(this, socket));
    socket.on('disconnect', this.handleDisconnect.bind(this, socket));
  }

  private handleJoinRoom(socket: Socket, data: { roomId: string; playerId: string }) {
    const { roomId, playerId } = data;
    
    socket.join(roomId);
    
    // Додаємо гравця до кімнати
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId)!.add(playerId);
    
    // Повідомляємо інших гравців про нового учасника
    socket.to(roomId).emit('user-joined', { peerId: playerId });
    
    console.log(`Player ${playerId} joined WebRTC room ${roomId}`);
  }

  private handleOffer(socket: Socket, data: { offer: RTCSessionDescriptionInit; to: string }) {
    socket.to(data.to).emit('offer', {
      offer: data.offer,
      from: socket.id
    });
  }

  private handleAnswer(socket: Socket, data: { answer: RTCSessionDescriptionInit; to: string }) {
    socket.to(data.to).emit('answer', {
      answer: data.answer,
      from: socket.id
    });
  }

  private handleIceCandidate(socket: Socket, data: { candidate: RTCIceCandidateInit; to: string }) {
    socket.to(data.to).emit('ice-candidate', {
      candidate: data.candidate,
      from: socket.id
    });
  }

  private handleDisconnect(socket: Socket) {
    // Видаляємо гравця з усіх кімнат
    for (const [roomId, players] of this.rooms.entries()) {
      if (players.has(socket.id)) {
        players.delete(socket.id);
        socket.to(roomId).emit('user-left', { peerId: socket.id });
        
        if (players.size === 0) {
          this.rooms.delete(roomId);
        }
        break;
      }
    }
  }
}
```

## 5. Менеджмент стану (Zustand)

```typescript
// frontend/src/store/gameStore.ts
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Game, Player, Deal } from '../types/game';
import { socketService } from '../services/socketService';

interface GameStore {
  // Стан
  game: Game | null;
  players: Player[];
  currentPlayer: Player | null;
  deals: Deal[];
  isConnected: boolean;
  error: string | null;
  
  // Дії
  joinGame: (gameId: string, playerId: string) => void;
  rollDice: () => void;
  makeDeal: (dealId: string) => void;
  proposeNegotiation: (targetId: string, proposal: any) => void;
  respondToNegotiation: (negotiationId: string, response: string) => void;
  setError: (error: string | null) => void;
  updateGameState: (game: Game) => void;
}

export const useGameStore = create<GameStore>()(
  subscribeWithSelector((set, get) => ({
    // Початковий стан
    game: null,
    players: [],
    currentPlayer: null,
    deals: [],
    isConnected: false,
    error: null,

    // Дії
    joinGame: (gameId: string, playerId: string) => {
      socketService.joinGame(gameId, playerId);
    },

    rollDice: () => {
      const { game, currentPlayer } = get();
      if (game && currentPlayer) {
        socketService.rollDice(game.id, currentPlayer.id);
      }
    },

    makeDeal: (dealId: string) => {
      const { game, currentPlayer } = get();
      if (game && currentPlayer) {
        socketService.makeDeal(game.id, currentPlayer.id, dealId);
      }
    },

    proposeNegotiation: (targetId: string, proposal: any) => {
      const { game, currentPlayer } = get();
      if (game && currentPlayer) {
        socketService.proposeNegotiation(game.id, currentPlayer.id, targetId, proposal);
      }
    },

    respondToNegotiation: (negotiationId: string, response: string) => {
      const { game, currentPlayer } = get();
      if (game && currentPlayer) {
        socketService.respondToNegotiation(game.id, negotiationId, currentPlayer.id, response);
      }
    },

    setError: (error: string | null) => {
      set({ error });
    },

    updateGameState: (game: Game) => {
      set({
        game,
        players: game.players,
        deals: game.deals || []
      });
    }
  }))
);

// Підписка на зміни Socket.io
socketService.on('game-state', (game: Game) => {
  useGameStore.getState().updateGameState(game);
});

socketService.on('error', (error: { message: string }) => {
  useGameStore.getState().setError(error.message);
});
```

## 6. Наступні кроки для реалізації

1. **Налаштування проекту**
   - Створення package.json файлів
   - Налаштування TypeScript
   - Конфігурація Vite та Express

2. **Базова структура**
   - Створення компонентів React
   - Налаштування Socket.io
   - Підключення MongoDB

3. **Основний функціонал**
   - Реалізація ігрового поля
   - Система ходів та кубика
   - Базова логіка угод

4. **WebRTC відеочат**
   - Налаштування STUN/TURN серверів
   - Реалізація peer-to-peer з'єднань
   - Інтерфейс відеочату

5. **Плаваючі угоди**
   - Динамічна генерація угод
   - Система переговорів
   - Ринкові події

Готові перейти до реалізації?
