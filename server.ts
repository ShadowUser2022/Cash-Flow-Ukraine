/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import http from 'http';
import path from 'path';
import os from 'os';
import { createServer as createViteServer } from 'vite';
import { WebSocketServer, WebSocket } from 'ws';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { GameState, Player, Asset, Liability, OpportunityCard, ExpenseCard, MarketCard, GameLog } from './src/types';
import { CAREERS, getInitialLiabilitiesForCareer, calculatePlayerTotals } from './src/careers';
import { BOARD_SPACES, SMALL_DEALS, BIG_DEALS, EXPENSES, MARKET_DECK } from './src/board';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = 3000;

// Initialize Gemini API
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Parse JSON payloads
app.use(express.json());

// In-memory store for game rooms
const rooms: Record<string, GameState> = {};

// Keep track of active WebSocket connections per room
const roomConnections: Record<string, Set<WebSocket>> = {};

// Public rooms list for Lobby view
app.get('/api/rooms/public', (req, res) => {
  const publicRooms = Object.values(rooms)
    .filter(r => r.status !== 'FINISHED')
    .map(r => ({
      roomId: r.roomId,
      hostName: r.players[0]?.name || 'Невідомий гравець',
      playerCount: r.players.length,
      maxPlayers: 6,
      status: r.status,
    }))
    .sort((a, b) => {
      // Prioritize LOBBY over PLAYING
      if (a.status === 'LOBBY' && b.status !== 'LOBBY') return -1;
      if (a.status !== 'LOBBY' && b.status === 'LOBBY') return 1;
      return 0;
    });

  res.json(publicRooms);
});

// Admin Dashboard routes
app.get('/admin', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'admin.html'));
});

let lastCpuUsage = process.cpuUsage();
let lastCpuCheckTime = Date.now();

function getProcessCpuPercent(): number {
  const currentUsage = process.cpuUsage(lastCpuUsage);
  const currentTime = Date.now();
  const timeDelta = (currentTime - lastCpuCheckTime) * 1000;
  lastCpuUsage = process.cpuUsage();
  lastCpuCheckTime = currentTime;

  if (timeDelta <= 0) return 0;
  const userSysMicroSecs = currentUsage.user + currentUsage.system;
  const cpuPercent = Math.round((userSysMicroSecs / timeDelta) * 100);
  return Math.min(100, Math.max(0, cpuPercent));
}

app.get('/api/admin/status', (req, res) => {
  const roomList = Object.values(rooms);
  
  let totalConnections = 0;
  let totalHumans = 0;
  let totalBots = 0;

  const roomsData = roomList.map((room) => {
    const connSet = roomConnections[room.roomId];
    const connectionsCount = connSet ? connSet.size : 0;
    totalConnections += connectionsCount;

    room.players.forEach((player) => {
      if (player.isBot) {
        totalBots++;
      } else {
        totalHumans++;
      }
    });

    return {
      roomId: room.roomId,
      status: room.status,
      players: room.players,
      connectionsCount,
      logs: room.logs.slice(0, 10), // return last 10 logs
    };
  });

  // Accurate Process & Memory metrics
  const totalMemGB = (os.totalmem() / (1024 * 1024 * 1024)).toFixed(1);
  const processMemoryMB = Math.round(process.memoryUsage().rss / (1024 * 1024));
  const processCpu = getProcessCpuPercent();
  
  const cpus = os.cpus();

  const uptimeSec = Math.round(process.uptime());
  const hours = Math.floor(uptimeSec / 3600);
  const minutes = Math.floor((uptimeSec % 3600) / 60);
  const seconds = uptimeSec % 60;
  const uptimeString = hours > 0 ? `${hours}г ${minutes}хв ${seconds}с` : `${minutes}хв ${seconds}с`;

  res.json({
    stats: {
      totalRooms: roomList.length,
      totalConnections,
      totalHumans,
      totalBots,
    },
    system: {
      cpuPercent: processCpu,
      cpuCores: cpus.length,
      cpuModel: cpus[0]?.model || 'Apple Silicon / Mac CPU',
      processMemoryMB,
      ramTotalGB: totalMemGB,
      uptime: uptimeString,
    },
    rooms: roomsData,
  });
});

app.delete('/api/admin/rooms/:roomId', (req, res) => {
  const { roomId } = req.params;
  if (rooms[roomId]) {
    // Notify clients that the room is closed
    const connections = roomConnections[roomId];
    if (connections) {
      const payload = JSON.stringify({
        type: 'ERROR',
        payload: 'Кімната була закрита адміністратором.',
      });
      connections.forEach((conn) => {
        if (conn.readyState === WebSocket.OPEN) {
          conn.send(payload);
          conn.close();
        }
      });
      delete roomConnections[roomId];
    }
    delete rooms[roomId];
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Room not found' });
  }
});

app.post('/api/admin/rooms/clear-empty', (req, res) => {
  let clearedCount = 0;
  const roomIds = Object.keys(rooms);
  for (const roomId of roomIds) {
    const room = rooms[roomId];
    const connSet = roomConnections[roomId];
    const connectionsCount = connSet ? connSet.size : 0;
    
    // Clear rooms with no players, or rooms with no active web sockets and are finished/lobby
    if (room.players.length === 0 || (connectionsCount === 0 && room.status !== 'PLAYING')) {
      if (connSet) {
        connSet.forEach(conn => conn.close());
        delete roomConnections[roomId];
      }
      delete rooms[roomId];
      clearedCount++;
    }
  }
  res.json({ clearedCount });
});

// Utility: Generate unique room code
function generateRoomId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Utility: Create a default log entry
function addLog(room: GameState, message: string, type: GameLog['type'] = 'info', playerId?: string, playerName?: string) {
  const log: GameLog = {
    id: Math.random().toString(36).substring(2, 9),
    timestamp: Date.now(),
    playerId,
    playerName,
    message,
    type,
  };
  room.logs.unshift(log); // newest first
  if (room.logs.length > 100) {
    room.logs.pop();
  }
}

// Broadcast game state to all players in a room
function broadcastRoomState(roomId: string) {
  const room = rooms[roomId];
  if (!room) return;

  const payload = JSON.stringify({
    type: 'ROOM_UPDATE',
    payload: room,
  });

  const connections = roomConnections[roomId];
  if (connections) {
    connections.forEach((conn) => {
      if (conn.readyState === WebSocket.OPEN) {
        conn.send(payload);
      }
    });
  }
}

// Run bot logic if it is a bot's turn
function handleBotTurn(room: GameState, botPlayer: Player) {
  addLog(room, `Хід: ${botPlayer.name}...`, 'info', botPlayer.id, botPlayer.name);
  
  setTimeout(() => {
    // 1. Roll dice
    // Decide if we should do charity
    const rollCount = (botPlayer.charityTurnsLeft > 0) ? 2 : 1;
    const roll1 = Math.floor(Math.random() * 6) + 1;
    const roll2 = rollCount === 2 ? Math.floor(Math.random() * 6) + 1 : 0;
    const totalRoll = roll1 + roll2;

    if (rollCount === 2) {
      addLog(room, `${botPlayer.name} кинув кубики: ${roll1} + ${roll2} = ${totalRoll}`, 'dice', botPlayer.id, botPlayer.name);
    } else {
      addLog(room, `${botPlayer.name} кинув кубик: ${roll1}`, 'dice', botPlayer.id, botPlayer.name);
    }

    // Move player
    botPlayer.currentPosition = (botPlayer.currentPosition + totalRoll) % 24;
    const space = BOARD_SPACES[botPlayer.currentPosition];
    addLog(room, `${botPlayer.name} став на клітинку: "${space.name}"`, 'info', botPlayer.id, botPlayer.name);

    // Trigger cell logic
    if (space.type === 'PAYDAY') {
      const totals = calculatePlayerTotals(botPlayer, room.playerAssets[botPlayer.id] || [], room.playerLiabilities[botPlayer.id] || []);
      botPlayer.cash += totals.monthlyCashFlow;
      addLog(room, `${botPlayer.name} отримав місячний кешфлоу +${totals.monthlyCashFlow} ₴`, 'success', botPlayer.id, botPlayer.name);
      room.activeCard = null;
      advanceTurn(room);
    } else if (space.type === 'BABY') {
      if (botPlayer.childrenCount < 3) {
        botPlayer.childrenCount += 1;
        addLog(room, `У ${botPlayer.name} народилася дитина! Щомісячні витрати збільшились на ${botPlayer.career.childExpensePerChild} ₴`, 'warning', botPlayer.id, botPlayer.name);
      } else {
        addLog(room, `У ${botPlayer.name} вже є 3 дітей, максимальна кількість досягнута.`, 'info', botPlayer.id, botPlayer.name);
      }
      room.activeCard = null;
      advanceTurn(room);
    } else if (space.type === 'LAYOFF') {
      const totals = calculatePlayerTotals(botPlayer, room.playerAssets[botPlayer.id] || [], room.playerLiabilities[botPlayer.id] || []);
      botPlayer.cash = Math.max(0, botPlayer.cash - totals.totalExpenses);
      botPlayer.layoffTurnsLeft = 2;
      addLog(room, `${botPlayer.name} потрапив під скорочення! Сплатив ${totals.totalExpenses} ₴ витрат та пропускає 2 ходи`, 'danger', botPlayer.id, botPlayer.name);
      room.activeCard = null;
      advanceTurn(room);
    } else if (space.type === 'CHARITY') {
      // Bot donates if they have enough cash
      const totals = calculatePlayerTotals(botPlayer, room.playerAssets[botPlayer.id] || [], room.playerLiabilities[botPlayer.id] || []);
      const donation = Math.round(totals.totalIncome * 0.1);
      if (botPlayer.cash >= donation) {
        botPlayer.cash -= donation;
        botPlayer.charityTurnsLeft = 3;
        addLog(room, `${botPlayer.name} пожертвував ${donation} ₴ на ЗСУ! Наступні 3 ходи він може кидати 2 кубики.`, 'success', botPlayer.id, botPlayer.name);
      } else {
        addLog(room, `${botPlayer.name} вирішив не брати участь у благодійності (недостатньо готівки).`, 'info', botPlayer.id, botPlayer.name);
      }
      room.activeCard = null;
      advanceTurn(room);
    } else if (space.type === 'EXPENSE') {
      // Pick random expense card
      const card = EXPENSES[Math.floor(Math.random() * EXPENSES.length)];
      botPlayer.cash = Math.max(0, botPlayer.cash - card.cost);
      addLog(room, `${botPlayer.name} несе позачергові витрати: "${card.name}" (-${card.cost} ₴)`, 'danger', botPlayer.id, botPlayer.name);
      room.activeCard = null;
      advanceTurn(room);
    } else if (space.type === 'OPPORTUNITY') {
      // Bot chooses Big Deal if cash > 200,000 ₴, otherwise Small Deal
      const isBig = botPlayer.cash >= 200000;
      const deck = isBig ? BIG_DEALS : SMALL_DEALS;
      const card = deck[Math.floor(Math.random() * deck.length)];

      room.activeCard = {
        type: 'OPPORTUNITY',
        card,
        playerId: botPlayer.id,
        resolved: false,
      };

      addLog(room, `${botPlayer.name} обрав ${isBig ? 'Велику' : 'Малу'} угоду: "${card.name}"`, 'info', botPlayer.id, botPlayer.name);

      // Bot decision to buy
      setTimeout(() => {
        const canAfford = botPlayer.cash >= card.downPayment;
        const isGoodInvestment = card.cashFlow > 0 || card.assetType === 'STOCK' || card.assetType === 'BOND';
        
        if (canAfford && isGoodInvestment) {
          // Buy
          botPlayer.cash -= card.downPayment;
          const newAsset: Asset = {
            id: Math.random().toString(36).substring(2, 9),
            type: card.assetType,
            name: card.name,
            symbol: card.symbol,
            shares: card.assetType === 'STOCK' ? Math.floor(botPlayer.cash / card.cost) || 100 : undefined,
            cost: card.cost,
            downPayment: card.downPayment,
            mortgage: card.mortgage,
            cashFlow: card.cashFlow,
            dividend: card.dividend,
          };
          
          if (!room.playerAssets[botPlayer.id]) {
            room.playerAssets[botPlayer.id] = [];
          }
          room.playerAssets[botPlayer.id].push(newAsset);
          
          if (card.mortgage) {
            const newLiability: Liability = {
              id: `mortgage_${newAsset.id}`,
              name: `Іпотека: ${card.name}`,
              amount: card.mortgage,
              monthlyPayment: Math.round(card.mortgage * 0.01), // bot mortgage payment rate
            };
            if (!room.playerLiabilities[botPlayer.id]) {
              room.playerLiabilities[botPlayer.id] = [];
            }
            room.playerLiabilities[botPlayer.id].push(newLiability);
          }

          // Recalculate Totals
          const calc = calculatePlayerTotals(botPlayer, room.playerAssets[botPlayer.id], room.playerLiabilities[botPlayer.id]);
          botPlayer.passiveIncome = calc.passiveIncome;

          addLog(room, `${botPlayer.name} придбав актив: "${card.name}" за ${card.downPayment} ₴ (Грошовий потік: +${card.cashFlow} ₴)`, 'success', botPlayer.id, botPlayer.name);
          
          // Check win condition
          if (botPlayer.passiveIncome >= calc.totalExpenses) {
            room.winnerId = botPlayer.id;
            room.status = 'FINISHED';
            addLog(room, `${botPlayer.name} вийшов з Щурячих перегонів і ПЕРЕМІГ У ГРІ!`, 'success', botPlayer.id, botPlayer.name);
          }
        } else {
          addLog(room, `${botPlayer.name} відмовився від угоди "${card.name}" (не вигідно або замало готівки).`, 'info', botPlayer.id, botPlayer.name);
        }

        room.activeCard = null;
        advanceTurn(room);
        broadcastRoomState(room.roomId);
      }, 1500);
    }

    // Decrement charity turns
    if (botPlayer.charityTurnsLeft > 0) {
      botPlayer.charityTurnsLeft -= 1;
    }

    // 25% chance for bot to send a chat message
    if (Math.random() < 0.25) {
      const botPhrases = [
        "Чудовий хід! Інвестуємо далі 🚀",
        "Український бізнес зростає! 📈",
        "Перевіряйте свій Пасивний Дохід 💰",
        "Слава Україні! Донатимо на ЗСУ 🇺🇦",
        "Який актив зараз найвигідніший? 🤔",
        "Фінансова свобода вже близько! 💡",
        "Хтось купував акції ОВДП нещодавно? 🏦"
      ];
      const phrase = botPhrases[Math.floor(Math.random() * botPhrases.length)];
      const botMsg = {
        id: Math.random().toString(36).substring(2, 9),
        senderId: botPlayer.id,
        senderName: botPlayer.name,
        senderColor: botPlayer.color,
        isBot: true,
        text: phrase,
        mediaType: 'text',
        timestamp: Date.now(),
      };
      const payloadStr = JSON.stringify({
        type: 'NEW_CHAT_MESSAGE',
        payload: botMsg,
      });
      const conns = roomConnections[room.roomId];
      if (conns) {
        conns.forEach((c) => {
          if (c.readyState === WebSocket.OPEN) c.send(payloadStr);
        });
      }
    }

    broadcastRoomState(room.roomId);
  }, 1000);
}

// Advance turn to the next player
function advanceTurn(room: GameState) {
  if (room.status !== 'PLAYING') return;

  let attempts = 0;
  do {
    room.currentTurnIndex = (room.currentTurnIndex + 1) % room.players.length;
    const nextPlayer = room.players[room.currentTurnIndex];
    
    if (nextPlayer.layoffTurnsLeft > 0) {
      nextPlayer.layoffTurnsLeft -= 1;
      addLog(room, `Гравець ${nextPlayer.name} пропускає хід (залишилось пропустити: ${nextPlayer.layoffTurnsLeft})`, 'warning', nextPlayer.id, nextPlayer.name);
    } else {
      // Found valid player
      addLog(room, `Наступний хід: ${nextPlayer.name}`, 'info', nextPlayer.id, nextPlayer.name);
      
      // If it's a bot, trigger bot logic
      if (nextPlayer.isBot) {
        handleBotTurn(room, nextPlayer);
      }
      break;
    }
    attempts++;
  } while (attempts < room.players.length);
}

// Websocket connection upgrade
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

wss.on('connection', (ws: WebSocket, req: http.IncomingMessage) => {
  let userRoomId: string | null = null;
  let userId: string | null = null;

  const clientCountry = (req?.headers['cf-ipcountry'] as string) || 'UA';
  const clientCity = (req?.headers['cf-ipcity'] as string) || (req?.headers['cf-ipcountry'] ? '' : 'Київ');

  ws.on('message', async (messageData: string) => {
    try {
      const message = JSON.parse(messageData);
      const { type, payload } = message;

      // Associate or re-associate connection if roomId and playerId are provided in the message
      if (message.roomId) {
        userRoomId = message.roomId;
        if (!roomConnections[userRoomId]) {
          roomConnections[userRoomId] = new Set();
        }
        roomConnections[userRoomId].add(ws);
      }
      if (message.playerId) {
        userId = message.playerId;
      }

      if (type === 'CREATE_ROOM') {
        const roomId = generateRoomId();
        const firstPlayer: Player = {
          id: Math.random().toString(36).substring(2, 9),
          name: payload.playerName || 'Гравець 1',
          career: CAREERS[Math.floor(Math.random() * CAREERS.length)],
          cash: 0,
          passiveIncome: 0,
          childrenCount: 0,
          charityTurnsLeft: 0,
          layoffTurnsLeft: 0,
          currentPosition: 0,
          isFastTrack: false,
          color: '#E11D48', // Tailwind Rose-600
          ready: false,
          country: clientCountry,
          city: clientCity,
        };

        // Populate initial parameters based on career
        firstPlayer.cash = firstPlayer.career.initialCash;

        const initialAssets: Asset[] = [];
        const initialLiabilities = getInitialLiabilitiesForCareer(firstPlayer.career);

        const totals = calculatePlayerTotals(firstPlayer, initialAssets, initialLiabilities);
        firstPlayer.passiveIncome = totals.passiveIncome;

        rooms[roomId] = {
          roomId,
          status: 'LOBBY',
          players: [firstPlayer],
          playerAssets: { [firstPlayer.id]: initialAssets },
          playerLiabilities: { [firstPlayer.id]: initialLiabilities },
          currentTurnIndex: 0,
          logs: [],
          activeCard: null,
          winnerId: null,
          aiAdvisorTips: {},
          aiThinking: false,
        };

        userRoomId = roomId;
        userId = firstPlayer.id;

        if (!roomConnections[roomId]) {
          roomConnections[roomId] = new Set();
        }
        roomConnections[roomId].add(ws);

        addLog(rooms[roomId], `Створено гру. Код кімнати: ${roomId}`, 'info');
        addLog(rooms[roomId], `Гравець ${firstPlayer.name} приєднався як ${firstPlayer.career.name}`, 'info', firstPlayer.id, firstPlayer.name);

        ws.send(JSON.stringify({
          type: 'ROOM_CREATED',
          payload: { roomId, playerId: firstPlayer.id },
        }));

        broadcastRoomState(roomId);
      }

      else if (type === 'JOIN_ROOM') {
        const roomId = (payload.roomId || '').toUpperCase();
        const room = rooms[roomId];

        if (!room) {
          ws.send(JSON.stringify({
            type: 'ERROR',
            payload: 'Кімната не знайдена. Перевірте код кімнати!',
          }));
          return;
        }

        if (room.status !== 'LOBBY') {
          ws.send(JSON.stringify({
            type: 'ERROR',
            payload: 'Гра вже розпочалася в цій кімнаті.',
          }));
          return;
        }

        if (room.players.length >= 6) {
          ws.send(JSON.stringify({
            type: 'ERROR',
            payload: 'Кімната заповнена (максимум 6 гравців).',
          }));
          return;
        }

        const colors = ['#2563EB', '#16A34A', '#D97706', '#9333EA', '#0891B2', '#059669'];
        const randomColor = colors[room.players.length % colors.length];

        const newPlayer: Player = {
          id: Math.random().toString(36).substring(2, 9),
          name: payload.playerName || `Гравець ${room.players.length + 1}`,
          career: CAREERS[room.players.length % CAREERS.length],
          cash: 0,
          passiveIncome: 0,
          childrenCount: 0,
          charityTurnsLeft: 0,
          layoffTurnsLeft: 0,
          currentPosition: 0,
          isFastTrack: false,
          color: randomColor,
          ready: false,
          country: clientCountry,
          city: clientCity,
        };

        newPlayer.cash = newPlayer.career.initialCash;

        const initialAssets: Asset[] = [];
        const initialLiabilities = getInitialLiabilitiesForCareer(newPlayer.career);

        const totals = calculatePlayerTotals(newPlayer, initialAssets, initialLiabilities);
        newPlayer.passiveIncome = totals.passiveIncome;

        room.players.push(newPlayer);
        room.playerAssets[newPlayer.id] = initialAssets;
        room.playerLiabilities[newPlayer.id] = initialLiabilities;

        userRoomId = roomId;
        userId = newPlayer.id;

        if (!roomConnections[roomId]) {
          roomConnections[roomId] = new Set();
        }
        roomConnections[roomId].add(ws);

        addLog(room, `Гравець ${newPlayer.name} приєднався як ${newPlayer.career.name}`, 'info', newPlayer.id, newPlayer.name);

        ws.send(JSON.stringify({
          type: 'JOINED_SUCCESS',
          payload: { roomId, playerId: newPlayer.id },
        }));

        broadcastRoomState(roomId);
      }

      else if (type === 'ADD_BOT') {
        const roomId = userRoomId;
        if (!roomId) return;
        const room = rooms[roomId];
        if (!room || room.status !== 'LOBBY') return;

        const botNames = ['Тарас (Бот)', 'Олена (Бот)', 'Микола (Бот)', 'Юлія (Бот)', 'Андрій (Бот)'];
        const botName = botNames[Math.floor(Math.random() * botNames.length)];
        
        const colors = ['#2563EB', '#16A34A', '#D97706', '#9333EA', '#0891B2', '#059669'];
        const randomColor = colors[room.players.length % colors.length];

        const botPlayer: Player = {
          id: `bot_${Math.random().toString(36).substring(2, 9)}`,
          name: botName,
          career: CAREERS[room.players.length % CAREERS.length],
          cash: 0,
          passiveIncome: 0,
          childrenCount: 0,
          charityTurnsLeft: 0,
          layoffTurnsLeft: 0,
          currentPosition: 0,
          isFastTrack: false,
          color: randomColor,
          ready: true,
          isBot: true,
          country: 'UA',
          city: 'ШІ Бот',
        };

        botPlayer.cash = botPlayer.career.initialCash;

        const initialAssets: Asset[] = [];
        const initialLiabilities = getInitialLiabilitiesForCareer(botPlayer.career);

        const totals = calculatePlayerTotals(botPlayer, initialAssets, initialLiabilities);
        botPlayer.passiveIncome = totals.passiveIncome;

        room.players.push(botPlayer);
        room.playerAssets[botPlayer.id] = initialAssets;
        room.playerLiabilities[botPlayer.id] = initialLiabilities;

        addLog(room, `Додано фінансового конкурента: ${botPlayer.name} (${botPlayer.career.name})`, 'info', botPlayer.id, botPlayer.name);
        broadcastRoomState(roomId);
      }

      else if (type === 'READY_PLAYER') {
        const roomId = userRoomId;
        if (!roomId) return;
        const room = rooms[roomId];
        if (!room) return;

        const player = room.players.find((p) => p.id === userId);
        if (player) {
          player.ready = payload.ready;
          addLog(room, `Гравець ${player.name} ${player.ready ? 'готовий' : 'не готовий'}`, 'info', player.id, player.name);
          broadcastRoomState(roomId);
        }
      }

      else if (type === 'START_GAME') {
        const roomId = userRoomId;
        if (!roomId) return;
        const room = rooms[roomId];
        if (!room || room.status !== 'LOBBY') return;

        room.status = 'PLAYING';
        room.currentTurnIndex = 0;
        
        addLog(room, `ГРУ РОЗПОЧАТО! Бажаємо кожному вийти з Щурячих перегонів на Швидкісний трек!`, 'success');
        
        const firstPlayer = room.players[0];
        addLog(room, `Перший хід робить: ${firstPlayer.name}`, 'info', firstPlayer.id, firstPlayer.name);

        if (firstPlayer.isBot) {
          handleBotTurn(room, firstPlayer);
        }

        broadcastRoomState(roomId);
      }

      else if (type === 'ROLL_DICE') {
        const roomId = userRoomId;
        if (!roomId) return;
        const room = rooms[roomId];
        if (!room || room.status !== 'PLAYING') return;

        const player = room.players[room.currentTurnIndex];
        if (player.id !== userId) return;

        const diceCount = payload.count || 1;
        const roll1 = Math.floor(Math.random() * 6) + 1;
        const roll2 = diceCount === 2 ? Math.floor(Math.random() * 6) + 1 : 0;
        const totalRoll = roll1 + roll2;

        if (diceCount === 2) {
          addLog(room, `${player.name} кинув кубики: ${roll1} + ${roll2} = ${totalRoll}`, 'dice', player.id, player.name);
        } else {
          addLog(room, `${player.name} кинув кубик: ${roll1}`, 'dice', player.id, player.name);
        }

        player.currentPosition = (player.currentPosition + totalRoll) % 24;
        const space = BOARD_SPACES[player.currentPosition];
        addLog(room, `${player.name} став на клітинку: "${space.name}"`, 'info', player.id, player.name);

        // Reset any un-resolved active cards
        room.activeCard = null;

        if (space.type === 'PAYDAY') {
          const totals = calculatePlayerTotals(player, room.playerAssets[player.id] || [], room.playerLiabilities[player.id] || []);
          player.cash += totals.monthlyCashFlow;
          addLog(room, `${player.name} отримав місячний кешфлоу +${totals.monthlyCashFlow} ₴`, 'success', player.id, player.name);
          advanceTurn(room);
        } else if (space.type === 'BABY') {
          if (player.childrenCount < 3) {
            player.childrenCount += 1;
            addLog(room, `У ${player.name} народилася дитина! Витрати на дитину збільшились на ${player.career.childExpensePerChild} ₴`, 'warning', player.id, player.name);
          } else {
            addLog(room, `Максимальна кількість дітей (3) вже досягнута.`, 'info', player.id, player.name);
          }
          advanceTurn(room);
        } else if (space.type === 'LAYOFF') {
          const totals = calculatePlayerTotals(player, room.playerAssets[player.id] || [], room.playerLiabilities[player.id] || []);
          player.cash = Math.max(0, player.cash - totals.totalExpenses);
          player.layoffTurnsLeft = 2;
          addLog(room, `Скорочення! ${player.name} сплачує загальні місячні витрати ${totals.totalExpenses} ₴ та пропускає 2 ходи`, 'danger', player.id, player.name);
          advanceTurn(room);
        } else if (space.type === 'CHARITY') {
          // Player will select in client whether to pay
          room.activeCard = {
            type: 'CHARITY',
            playerId: player.id,
            resolved: false,
          };
        } else if (space.type === 'EXPENSE') {
          const card = EXPENSES[Math.floor(Math.random() * EXPENSES.length)];
          player.cash = Math.max(0, player.cash - card.cost);
          addLog(room, `${player.name} несе непередбачувані витрати: "${card.name}" (-${card.cost} ₴)`, 'danger', player.id, player.name);
          
          room.activeCard = {
            type: 'EXPENSE',
            card,
            playerId: player.id,
            resolved: true,
          };
          // Turn is not advanced immediately, player has to click "Зрозуміло"
        } else if (space.type === 'OPPORTUNITY') {
          // Waiting for player to choose SMALL or BIG deal
          room.activeCard = {
            type: 'OPPORTUNITY',
            playerId: player.id,
            resolved: false,
          };
        }

        // Reduce charity count if active
        if (player.charityTurnsLeft > 0) {
          player.charityTurnsLeft -= 1;
        }

        broadcastRoomState(roomId);
      }

      else if (type === 'CHOOSE_DEAL_TYPE') {
        const roomId = userRoomId;
        if (!roomId) return;
        const room = rooms[roomId];
        if (!room) return;

        const player = room.players[room.currentTurnIndex];
        if (player.id !== userId) return;

        const dealType = payload.dealType; // 'SMALL' | 'BIG'
        const deck = dealType === 'BIG' ? BIG_DEALS : SMALL_DEALS;
        const card = deck[Math.floor(Math.random() * deck.length)];

        room.activeCard = {
          type: 'OPPORTUNITY',
          card,
          playerId: player.id,
          resolved: false,
        };

        addLog(room, `${player.name} обрав ${dealType === 'BIG' ? 'Велику' : 'Малу'} угоду: "${card.name}"`, 'info', player.id, player.name);
        broadcastRoomState(roomId);
      }

      else if (type === 'BUY_ASSET') {
        const roomId = userRoomId;
        if (!roomId) return;
        const room = rooms[roomId];
        if (!room) return;

        const player = room.players[room.currentTurnIndex];
        if (player.id !== userId) return;

        if (!room.activeCard || room.activeCard.type !== 'OPPORTUNITY' || !room.activeCard.card) return;
        const card = room.activeCard.card as OpportunityCard;

        if (player.cash < card.downPayment) {
          ws.send(JSON.stringify({
            type: 'ERROR',
            payload: 'Недостатньо готівки для першого внеску! Візьміть кредит або відмовтесь від угоди.',
          }));
          return;
        }

        player.cash -= card.downPayment;
        
        const newAsset: Asset = {
          id: Math.random().toString(36).substring(2, 9),
          type: card.assetType,
          name: card.name,
          symbol: card.symbol,
          shares: card.assetType === 'STOCK' ? Math.floor((player.cash + card.downPayment) / card.cost) || 100 : undefined,
          cost: card.cost,
          downPayment: card.downPayment,
          mortgage: card.mortgage,
          cashFlow: card.cashFlow,
          dividend: card.dividend,
        };

        if (!room.playerAssets[player.id]) {
          room.playerAssets[player.id] = [];
        }
        room.playerAssets[player.id].push(newAsset);

        if (card.mortgage) {
          const newLiability: Liability = {
            id: `mortgage_${newAsset.id}`,
            name: `Іпотека: ${card.name}`,
            amount: card.mortgage,
            monthlyPayment: Math.round(card.mortgage * 0.0133), // roughly 16% APR
          };
          if (!room.playerLiabilities[player.id]) {
            room.playerLiabilities[player.id] = [];
          }
          room.playerLiabilities[player.id].push(newLiability);
        }

        // Recalculate totals
        const calc = calculatePlayerTotals(player, room.playerAssets[player.id], room.playerLiabilities[player.id]);
        player.passiveIncome = calc.passiveIncome;

        addLog(room, `${player.name} купив актив: "${card.name}" за ${card.downPayment} ₴ (Кешфлоу: +${card.cashFlow} ₴)`, 'success', player.id, player.name);

        // Check escape rat race condition
        if (player.passiveIncome >= calc.totalExpenses) {
          room.winnerId = player.id;
          room.status = 'FINISHED';
          addLog(room, `${player.name} ВИЙШОВ З ЩУРЯЧИХ ПЕРЕГОНІВ ТА ПЕРЕМІГ!`, 'success', player.id, player.name);
        }

        room.activeCard = null;
        advanceTurn(room);
        broadcastRoomState(roomId);
      }

      else if (type === 'DECLINE_CARD') {
        const roomId = userRoomId;
        if (!roomId) return;
        const room = rooms[roomId];
        if (!room) return;

        const player = room.players[room.currentTurnIndex];
        if (player.id !== userId) return;

        addLog(room, `${player.name} відмовився від можливості.`, 'info', player.id, player.name);
        room.activeCard = null;
        advanceTurn(room);
        broadcastRoomState(roomId);
      }

      else if (type === 'RESOLVE_CARD') {
        const roomId = userRoomId;
        if (!roomId) return;
        const room = rooms[roomId];
        if (!room) return;

        const player = room.players[room.currentTurnIndex];
        if (player.id !== userId) return;

        room.activeCard = null;
        advanceTurn(room);
        broadcastRoomState(roomId);
      }

      else if (type === 'CHARITY_DECISION') {
        const roomId = userRoomId;
        if (!roomId) return;
        const room = rooms[roomId];
        if (!room) return;

        const player = room.players[room.currentTurnIndex];
        if (player.id !== userId) return;

        const accepted = payload.accepted;
        const totals = calculatePlayerTotals(player, room.playerAssets[player.id] || [], room.playerLiabilities[player.id] || []);
        const donation = Math.round(totals.totalIncome * 0.1);

        if (accepted) {
          if (player.cash >= donation) {
            player.cash -= donation;
            player.charityTurnsLeft = 3;
            addLog(room, `${player.name} задонатив ${donation} ₴ на ЗСУ! Отримано право кидати 2 кубики на наступні 3 ходи.`, 'success', player.id, player.name);
          } else {
            addLog(room, `${player.name} хотів підтримати ЗСУ, але не мав достатньо готівки (${donation} ₴)`, 'warning', player.id, player.name);
          }
        } else {
          addLog(room, `${player.name} вирішив пропустити благодійність на цьому ході.`, 'info', player.id, player.name);
        }

        room.activeCard = null;
        advanceTurn(room);
        broadcastRoomState(roomId);
      }

      else if (type === 'BORROW_MONEY') {
        const roomId = userRoomId;
        if (!roomId) return;
        const room = rooms[roomId];
        if (!room) return;

        const player = room.players.find((p) => p.id === userId);
        if (!player) return;

        const amount = payload.amount; // multiplier of 10000
        if (amount <= 0 || amount % 10000 !== 0) {
          ws.send(JSON.stringify({
            type: 'ERROR',
            payload: 'Сума кредиту має бути кратною 10,000 ₴',
          }));
          return;
        }

        player.cash += amount;
        
        const liabilityId = `loan_${Math.random().toString(36).substring(2, 9)}`;
        const monthlyPayment = Math.round(amount * 0.1); // 10% monthly interest

        const newLiability: Liability = {
          id: liabilityId,
          name: `Банківський кредит (+${amount} ₴)`,
          amount: amount,
          monthlyPayment: monthlyPayment,
        };

        if (!room.playerLiabilities[player.id]) {
          room.playerLiabilities[player.id] = [];
        }
        room.playerLiabilities[player.id].push(newLiability);

        // Recalculate totals
        calculatePlayerTotals(player, room.playerAssets[player.id] || [], room.playerLiabilities[player.id]);

        addLog(room, `${player.name} взяв кредит у банку на суму ${amount} ₴ (Щомісячний платіж: +${monthlyPayment} ₴/міс)`, 'warning', player.id, player.name);
        broadcastRoomState(roomId);
      }

      else if (type === 'PAY_DEBT') {
        const roomId = userRoomId;
        if (!roomId) return;
        const room = rooms[roomId];
        if (!room) return;

        const player = room.players.find((p) => p.id === userId);
        if (!player) return;

        const liabilityId = payload.liabilityId;
        const list = room.playerLiabilities[player.id] || [];
        const debtIndex = list.findIndex((l) => l.id === liabilityId);

        if (debtIndex === -1) return;

        const debt = list[debtIndex];
        if (player.cash < debt.amount) {
          ws.send(JSON.stringify({
            type: 'ERROR',
            payload: `Недостатньо готівки для закриття боргу ${debt.name}! Потрібно ${debt.amount} ₴`,
          }));
          return;
        }

        player.cash -= debt.amount;
        list.splice(debtIndex, 1);

        // Check if there was an associated asset (for mortgages)
        if (liabilityId.startsWith('mortgage_')) {
          const assetId = liabilityId.replace('mortgage_', '');
          const assets = room.playerAssets[player.id] || [];
          const asset = assets.find((a) => a.id === assetId);
          if (asset) {
            asset.mortgage = 0; // paid off mortgage
          }
        }

        calculatePlayerTotals(player, room.playerAssets[player.id] || [], room.playerLiabilities[player.id]);

        addLog(room, `${player.name} достроково сплатив борг: "${debt.name}" (${debt.amount} ₴) та вивільнив +${debt.monthlyPayment} ₴/міс кешфлоу!`, 'success', player.id, player.name);
        broadcastRoomState(roomId);
      }

      else if (type === 'TRIGGER_MARKET_CARD') {
        // Anyone can trigger market cards at Opportunity cells or we can trigger them globally
        const roomId = userRoomId;
        if (!roomId) return;
        const room = rooms[roomId];
        if (!room) return;

        const card = MARKET_DECK[Math.floor(Math.random() * MARKET_DECK.length)];
        
        room.activeCard = {
          type: 'MARKET',
          card,
          playerId: userId || '',
          resolved: false,
        };

        addLog(room, `НОВИЙ СТАН РИНКУ: "${card.name}" — ${card.description}`, 'warning');
        broadcastRoomState(roomId);
      }

      else if (type === 'SELL_ASSET_TO_MARKET') {
        const roomId = userRoomId;
        if (!roomId) return;
        const room = rooms[roomId];
        if (!room) return;

        const player = room.players.find((p) => p.id === userId);
        if (!player) return;

        const assetId = payload.assetId;
        const assets = room.playerAssets[player.id] || [];
        const assetIndex = assets.findIndex((a) => a.id === assetId);

        if (assetIndex === -1) return;
        const asset = assets[assetIndex];

        if (!room.activeCard || room.activeCard.type !== 'MARKET' || !room.activeCard.card) return;
        const marketCard = room.activeCard.card as MarketCard;

        // Verify if asset corresponds to card
        let payout = 0;
        if (marketCard.effectType === 'BUYER') {
          // Calculate selling price
          // Real estate is sold as a whole property
          const salePrice = marketCard.targetPrice || asset.cost;
          const mortgageToPay = asset.mortgage || 0;
          payout = salePrice - mortgageToPay;

          // Remove mortgage liability
          const liabList = room.playerLiabilities[player.id] || [];
          const mortgageIndex = liabList.findIndex((l) => l.id === `mortgage_${asset.id}`);
          if (mortgageIndex !== -1) {
            liabList.splice(mortgageIndex, 1);
          }

          player.cash += payout;
          assets.splice(assetIndex, 1);

          // Recalculate totals
          const totals = calculatePlayerTotals(player, assets, liabList);
          player.passiveIncome = totals.passiveIncome;

          addLog(room, `${player.name} вигідно продав нерухомість "${asset.name}" покупцю на ринку! Отримав чистими +${payout} ₴ (після покриття іпотеки ${mortgageToPay} ₴)`, 'success', player.id, player.name);
          broadcastRoomState(roomId);
        }
      }

      else if (type === 'GET_AI_ADVICE') {
        const roomId = userRoomId;
        if (!roomId) return;
        const room = rooms[roomId];
        if (!room) return;

        const player = room.players.find((p) => p.id === userId);
        if (!player) return;

        room.aiThinking = true;
        broadcastRoomState(roomId);

        try {
          const assets = room.playerAssets[player.id] || [];
          const liabilities = room.playerLiabilities[player.id] || [];
          const totals = calculatePlayerTotals(player, assets, liabilities);

          const careerPrompt = `
            Професія: ${player.career.name}
            Базова Зарплата: ${player.career.salary} ₴
            Готівка: ${player.cash} ₴
            Пасивний Дохід: ${player.passiveIncome} ₴
            Загальний Дохід: ${totals.totalIncome} ₴
            Загальні Витрати: ${totals.totalExpenses} ₴
            Щомісячний Кешфлоу (вільні гроші): ${totals.monthlyCashFlow} ₴
            Кількість дітей: ${player.childrenCount} (витрати на дитину: ${player.career.childExpensePerChild} ₴)

            Наявні Активи:
            ${assets.map(a => `- ${a.name} (Купівля: ${a.cost} ₴, Перший внесок: ${a.downPayment} ₴, Борг/Іпотека: ${a.mortgage || 0} ₴, Дохід/Кешфлоу: +${a.cashFlow} ₴/міс)`).join('\n') || 'Активи відсутні'}

            Наявні Зобовязання (Борги):
            ${liabilities.map(l => `- ${l.name} (Залишок боргу: ${l.amount} ₴, Щомісячний платіж: ${l.monthlyPayment} ₴)`).join('\n') || 'Борги відсутні'}
            
            Логи останніх подій:
            ${room.logs.slice(0, 5).map(l => `[${l.playerName || 'Система'}]: ${l.message}`).join('\n')}
          `;

          const prompt = `
            Ти — професійний український фінансовий радник та експерт з інвестицій у грі "Cash Flow" (Щурячі перегони), розробленій за мотивами Роберта Кіосакі, але адаптованій під українські реалії.
            Проаналізуй фінансовий звіт гравця та останні події в грі. Надай детальні поради українською мовою.

            Зверни особливу увагу на "сліпі зони" (blind spots):
            1. Якщо в гравця накопичилось багато готівки (наприклад, понад 100,000 ₴), яка не працює.
            2. Якщо гравець має дорогі споживчі кредити чи кредитні картки з високими платежами, які краще закрити в першу чергу.
            3. Співвідношення витрат і пасивного доходу. Скільки йому ще залишилось до виходу з перегонів (ціль: Пасивний дохід >= Загальні витрати).
            4. Чи варто йому брати Малі чи Великі угоди з огляду на його поточний капітал.

            Надішли відповідь ТІЛЬКИ у форматі JSON (без маркдауну \`\`\`json і так далі, чистий JSON об'єкт):
            {
              "blindSpots": ["Список сліпих зон гравця (що він робить не так)"],
              "tips": ["Конкретні поради крок за кроком для виходу з перегонів"],
              "overallScore": 85, // Оцінка фінансового здоров'я від 0 до 100
              "advisorComment": "Твій підбадьорливий та професійний коментар"
            }
          `;

          const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: `${prompt}\n\nДані гравця:\n${careerPrompt}`,
            config: {
              responseMimeType: 'application/json',
            },
          });

          const rawText = response.text || '{}';
          const cleanJson = JSON.parse(rawText.trim());

          room.aiAdvisorTips[player.id] = cleanJson;
          addLog(room, `Експерт AI проаналізував звіт ${player.name} та дав свіжі поради по сліпих зонах!`, 'ai', player.id, player.name);
        } catch (err: any) {
          console.error('Gemini API Error:', err);
          room.aiAdvisorTips[player.id] = {
            blindSpots: ['Не вдалося зв\'язатися з фінансовим радником через мережевий збій.'],
            tips: ['Продовжуйте інвестувати в активи з високим першим внеском і хорошим кешфлоу.', 'Гасіть борги з найбільшим щомісячним платежем.'],
            overallScore: 50,
            advisorComment: 'Вибачте, виникла помилка зв\'язку. Спробуйте запитати поради на наступному ході!',
          };
        } finally {
          room.aiThinking = false;
          broadcastRoomState(roomId);
        }
      }

      else if (type === 'CHAT_MESSAGE') {
        const roomId = userRoomId;
        if (!roomId) return;
        const room = rooms[roomId];
        if (!room) return;

        const chatMsg = {
          id: Math.random().toString(36).substring(2, 9),
          senderId: payload.senderId || userId,
          senderName: payload.senderName || 'Гравець',
          senderColor: payload.senderColor || '#3b82f6',
          isBot: payload.isBot || false,
          text: payload.text || '',
          mediaType: payload.mediaType || 'text',
          audioUrl: payload.audioUrl,
          timestamp: Date.now(),
        };

        const payloadStr = JSON.stringify({
          type: 'NEW_CHAT_MESSAGE',
          payload: chatMsg,
        });

        const connections = roomConnections[roomId];
        if (connections) {
          connections.forEach((conn) => {
            if (conn.readyState === WebSocket.OPEN) {
              conn.send(payloadStr);
            }
          });
        }
      }

    } catch (error) {
      console.error('WebSocket parsing error:', error);
    }
  });

  ws.on('close', () => {
    // Cleanup connection
    if (userRoomId && roomConnections[userRoomId]) {
      roomConnections[userRoomId].delete(ws);
      // If room is empty, we could keep it or clean up, let's keep it in memory for a while
    }
  });
});

// Setup Vite Dev Server / Static Asset Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Cashflow Ukraine Server running on http://localhost:${PORT}`);
  });
}

startServer();
