# 🎯 Cash Flow Ukraine API Documentation

## Overview
REST API для Cash Flow Ukraine онлайн гри з real-time функціональністю через Socket.IO.

**Base URL**: `http://localhost:3001`  
**Version**: 2.0.0-enhanced  
**Format**: JSON

## Authentication
Поточна версія не вимагає аутентифікації. Гравці ідентифікуються через унікальні ID, які генеруються автоматично.

## Endpoints

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-06-15T07:55:35.195Z",
  "version": "2.0.0-enhanced",
  "environment": "development"
}
```

---

### Game Management

#### Create Game
```http
POST /api/games/create
```

**Request Body:**
```json
{
  "hostId": "string"
}
```

**Response:**
```json
{
  "success": true,
  "game": {
    "id": "ABC123",
    "hostId": "user-123",
    "state": "waiting",
    "playerCount": 0,
    "maxPlayers": 6,
    "createdAt": "2025-06-15T07:55:35.195Z"
  }
}
```

#### Get Games List
```http
GET /api/games
```

**Response:**
```json
{
  "success": true,
  "games": [
    {
      "id": "ABC123",
      "hostId": "user-123",
      "playerCount": 2,
      "maxPlayers": 6,
      "state": "waiting",
      "createdAt": "2025-06-15T07:55:35.195Z"
    }
  ]
}
```

#### Get Game Details
```http
GET /api/games/{gameId}
```

**Response:**
```json
{
  "success": true,
  "game": {
    "id": "ABC123",
    "hostId": "user-123",
    "players": [
      {
        "id": "player-1",
        "name": "John Doe",
        "profession": {
          "title": "Вчитель",
          "salary": 3300,
          "expenses": 2760
        },
        "isReady": false,
        "isConnected": true
      }
    ],
    "state": "waiting",
    "settings": {
      "maxPlayers": 6,
      "timeLimit": 3600,
      "language": "uk"
    }
  }
}
```

#### Get Game State
```http
GET /api/games/{gameId}/state
```

**Response:**
```json
{
  "success": true,
  "gameState": {
    "id": "ABC123",
    "state": "in_progress",
    "currentPlayer": "player-1",
    "turn": 5,
    "players": [
      {
        "id": "player-1",
        "name": "John Doe",
        "position": 12,
        "finances": {
          "salary": 3300,
          "cash": 15000,
          "passiveIncome": 500,
          "expenses": 2760
        },
        "isOnFastTrack": false
      }
    ]
  }
}
```

---

### Player Management

#### Join Game
```http
POST /api/games/{gameId}/join
```

**Request Body:**
```json
{
  "name": "Player Name",
  "profession": {
    "title": "Вчитель",
    "salary": 3300,
    "expenses": 2760
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully joined game",
  "game": {
    "id": "ABC123",
    "playerCount": 1,
    "players": [
      {
        "id": "auto-generated-id",
        "name": "Player Name",
        "profession": {
          "title": "Вчитель",
          "salary": 3300,
          "expenses": 2760
        },
        "isReady": false
      }
    ]
  }
}
```

#### Leave Game
```http
DELETE /api/games/{gameId}/players/{playerId}
```

#### Set Player Ready Status
```http
PATCH /api/games/{gameId}/players/{playerId}/ready
```

**Request Body:**
```json
{
  "isReady": true
}
```

#### Start Game
```http
POST /api/games/{gameId}/start
```

---

### Game Mechanics

#### Roll Dice
```http
POST /api/games/{gameId}/roll-dice
```

**Request Body:**
```json
{
  "playerId": "player-1"
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "diceResult": 4,
    "newPosition": 8,
    "cellEffect": {
      "type": "opportunity",
      "description": "Можливість інвестування"
    }
  }
}
```

#### End Turn
```http
POST /api/games/{gameId}/end-turn
```

**Request Body:**
```json
{
  "playerId": "player-1"
}
```

#### Draw Deal
```http
POST /api/games/{gameId}/draw-deal
```

**Request Body:**
```json
{
  "type": "small"
}
```

**Deal Types:**
- `small` - Малі угоди
- `big` - Великі угоди  
- `market` - Ринкові угоди
- `doodad` - Дрібнички

**Response:**
```json
{
  "success": true,
  "deal": {
    "id": "deal-123",
    "type": "small",
    "category": "Бізнес",
    "title": "Вендингові автомати",
    "description": "3 автомати з продажу напоїв у торгових центрах",
    "cost": 20000,
    "downPayment": 8000,
    "mortgage": 12000,
    "cashFlow": 180,
    "isAvailable": true
  }
}
```

#### Execute Deal
```http
POST /api/games/{gameId}/execute-deal
```

**Request Body:**
```json
{
  "playerId": "player-1",
  "dealId": "deal-123",
  "action": "buy"
}
```

**Actions:**
- `buy` - Купити угоду
- `pass` - Пропустити угоду

---

## Socket.IO Events

### Client → Server

| Event | Data | Description |
|-------|------|-------------|
| `joinGame` | `{gameId, playerId}` | Приєднання до гри |
| `leaveGame` | `{gameId, playerId}` | Вихід з гри |
| `playerReady` | `{gameId, playerId, isReady}` | Зміна статусу готовності |
| `diceRolled` | `{gameId, playerId, result}` | Результат кидання кубика |
| `turnEnded` | `{gameId, playerId, nextPlayer}` | Завершення ходу |
| `dealDrawn` | `{gameId, playerId, deal}` | Взяття угоди |
| `dealExecuted` | `{gameId, playerId, dealId, action}` | Виконання угоди |

### Server → Client

| Event | Data | Description |
|-------|------|-------------|
| `playerJoined` | `{playerId}` | Новий гравець приєднався |
| `playerLeft` | `{playerId}` | Гравець покинув гру |
| `playerReadyStatusChanged` | `{playerId, isReady}` | Зміна готовності гравця |
| `gameStarted` | `{gameId}` | Гра почалася |
| `diceRolled` | `{playerId, result}` | Результат кидання кубика |
| `turnEnded` | `{playerId, nextPlayer}` | Хід завершено |
| `dealDrawn` | `{playerId, deal}` | Угода взята |
| `dealExecuted` | `{playerId, dealId, action}` | Угода виконана |
| `playerDisconnected` | `{playerId}` | Гравець відключився |

---

## Error Responses

**Format:**
```json
{
  "error": "Error message",
  "message": "Detailed error description"
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting
Поточна версія не має обмежень по запитах, але рекомендується не більше 100 запитів на хвилину на одного користувача.

## Examples

### Complete Game Flow
```javascript
// 1. Create game
const game = await fetch('/api/games/create', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({hostId: 'user-123'})
});

// 2. Join game
const joinResponse = await fetch(`/api/games/${gameId}/join`, {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    name: 'John Doe',
    profession: {title: 'Вчитель', salary: 3300, expenses: 2760}
  })
});

// 3. Set ready
await fetch(`/api/games/${gameId}/players/${playerId}/ready`, {
  method: 'PATCH',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({isReady: true})
});

// 4. Start game
await fetch(`/api/games/${gameId}/start`, {method: 'POST'});
```
