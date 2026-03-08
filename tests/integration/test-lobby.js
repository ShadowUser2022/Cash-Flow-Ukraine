const io = require('socket.io-client');

async function testLobby() {
  console.log('🎮 Testing Cash Flow Ukraine Lobby...\n');

  try {
    // Create a game via REST API
    console.log('1️⃣ Creating game via REST API...');
    const response = await fetch('http://localhost:3001/api/games/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hostId: 'host-socket-test' })
    });

    const gameData = await response.json();
    console.log('✅ Game created:', gameData.game.id);
    const gameId = gameData.game.id;

    // Connect socket as the host
    console.log('\n2️⃣ Connecting host via Socket.IO...');
    const hostSocket = io('http://localhost:3001/game');
    
    await new Promise((resolve) => {
      hostSocket.on('connect', () => {
        console.log('✅ Host connected to Socket.IO');
        resolve();
      });
    });

    // Join game via socket
    console.log('\n3️⃣ Host joining game via socket...');
    hostSocket.emit('join-game', {
      gameId: gameId,
      playerId: 'host-socket-test',
      playerName: 'Socket Host'
    });

    // Listen for game state updates
    hostSocket.on('game-state', (game) => {
      console.log('🔄 Game state updated:', {
        id: game.id,
        playerCount: game.players.length,
        players: game.players.map(p => ({ id: p.id, name: p.name, profession: p.profession.name }))
      });
    });

    // Connect second player
    console.log('\n4️⃣ Connecting second player...');
    const player2Socket = io('http://localhost:3001/game');
    
    await new Promise((resolve) => {
      player2Socket.on('connect', () => {
        console.log('✅ Player 2 connected to Socket.IO');
        resolve();
      });
    });

    // Join as second player
    setTimeout(() => {
      console.log('\n5️⃣ Player 2 joining game...');
      player2Socket.emit('join-game', {
        gameId: gameId,
        playerId: 'player2-socket-test',
        playerName: 'Socket Player 2'
      });
    }, 1000);

    // Wait for results
    setTimeout(() => {
      console.log('\n🏁 Test completed!');
      hostSocket.disconnect();
      player2Socket.disconnect();
      process.exit(0);
    }, 3000);

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testLobby();
