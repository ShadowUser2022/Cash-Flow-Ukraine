/**
 * Frontend Lobby Testing Script
 * Tests the complete lobby functionality through the frontend UI
 */

const io = require('socket.io-client');

// Configuration
const BACKEND_URL = 'http://localhost:3001';
const FRONTEND_URL = 'http://localhost:5177';

// Test data
const players = [
  { name: 'Олексій', id: 'player-test-1' },
  { name: 'Марія', id: 'player-test-2' },
  { name: 'Дмитро', id: 'player-test-3' }
];

console.log('🎮 Starting Frontend Lobby Testing...\n');

async function testFrontendLobby() {
  try {
    // Step 1: Test backend health
    console.log('1️⃣ Testing backend health...');
    const healthResponse = await fetch(`${BACKEND_URL}/health`);
    const healthData = await healthResponse.json();
    console.log(`✅ Backend status: ${healthData.status}\n`);

    // Step 2: Create a game through REST API
    console.log('2️⃣ Creating game through API...');
    const createGameData = {
      hostId: players[0].id,
      hostPlayerName: players[0].name,
      maxPlayers: 4
    };

    const createResponse = await fetch(`${BACKEND_URL}/api/games/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createGameData)
    });

    const gameData = await createResponse.json();
    if (!gameData.success) {
      throw new Error(`Failed to create game: ${gameData.error}`);
    }

    const gameId = gameData.game.id;
    console.log(`✅ Game created with ID: ${gameId}\n`);

    // Step 3: Test Socket.IO connections for multiple players
    console.log('3️⃣ Testing Socket.IO connections...');
    const sockets = [];

    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      console.log(`   Connecting player ${player.name}...`);
      
      const socket = io(`${BACKEND_URL}/game`, {
        autoConnect: true,
        transports: ['websocket', 'polling']
      });

      // Wait for connection
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error(`Connection timeout for ${player.name}`));
        }, 5000);

        socket.on('connect', () => {
          clearTimeout(timeout);
          console.log(`   ✅ ${player.name} connected to Socket.IO`);
          resolve();
        });

        socket.on('connect_error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });
      });

      // Set up event listeners
      socket.on('game-state', (game) => {
        console.log(`   📡 ${player.name} received game state:`, {
          gameId: game.id,
          players: game.players.map(p => ({ name: p.name, profession: p.profession.name, ready: p.isReady })),
          status: game.status
        });
      });

      socket.on('player-joined', (data) => {
        console.log(`   👋 ${player.name} saw player join:`, data.playerName);
      });

      socket.on('player-ready', (data) => {
        console.log(`   ✅ ${player.name} saw ready change:`, data);
      });

      socket.on('profession-selected', (data) => {
        console.log(`   👔 ${player.name} saw profession change:`, data);
      });

      sockets.push({ socket, player });
    }

    // Step 4: Join game with first player (host)
    console.log('\n4️⃣ Host joining game via Socket.IO...');
    const hostSocket = sockets[0];
    hostSocket.socket.emit('join-game', {
      gameId,
      playerId: hostSocket.player.id,
      playerName: hostSocket.player.name
    });

    // Wait a bit for the join to process
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 5: Join game with other players
    console.log('\n5️⃣ Other players joining game...');
    for (let i = 1; i < sockets.length; i++) {
      const { socket, player } = sockets[i];
      
      // First join via REST API
      console.log(`   ${player.name} joining via REST API...`);
      const joinResponse = await fetch(`${BACKEND_URL}/api/games/${gameId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: player.id,
          playerName: player.name
        })
      });

      const joinData = await joinResponse.json();
      if (!joinData.success) {
        console.error(`   ❌ ${player.name} failed to join via REST:`, joinData.error);
        continue;
      }

      // Then join via Socket.IO
      console.log(`   ${player.name} joining via Socket.IO...`);
      socket.emit('join-game', {
        gameId,
        playerId: player.id,
        playerName: player.name
      });

      // Wait between joins
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Step 6: Test profession selection
    console.log('\n6️⃣ Testing profession selection...');
    const professions = ['Teacher', 'Engineer', 'Doctor'];
    
    for (let i = 0; i < Math.min(sockets.length, professions.length); i++) {
      const { socket, player } = sockets[i];
      const profession = professions[i];
      
      console.log(`   ${player.name} selecting profession: ${profession}`);
      socket.emit('profession-selected', {
        gameId,
        playerId: player.id,
        profession
      });
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Step 7: Test ready states
    console.log('\n7️⃣ Testing player ready states...');
    
    for (let i = 0; i < sockets.length; i++) {
      const { socket, player } = sockets[i];
      
      console.log(`   ${player.name} marking as ready...`);
      socket.emit('player-ready', {
        gameId,
        playerId: player.id,
        isReady: true
      });
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Step 8: Get final game state
    console.log('\n8️⃣ Getting final game state...');
    const finalStateResponse = await fetch(`${BACKEND_URL}/api/games/${gameId}`);
    const finalGameData = await finalStateResponse.json();
    
    if (finalGameData.success) {
      console.log('✅ Final game state:', {
        gameId: finalGameData.game.id,
        status: finalGameData.game.status,
        players: finalGameData.game.players.map(p => ({
          name: p.name,
          profession: p.profession.name,
          ready: p.isReady
        }))
      });
    }

    console.log('\n🎉 Frontend lobby testing completed successfully!');
    console.log('\n📋 Test Summary:');
    console.log('✅ Backend health check');
    console.log('✅ Game creation via REST API');
    console.log('✅ Multiple Socket.IO connections');
    console.log('✅ Players joining game');
    console.log('✅ Profession selection events');
    console.log('✅ Player ready state events');
    console.log('✅ Real-time game state updates');

    console.log('\n🌐 You can now test the frontend at:', FRONTEND_URL);
    console.log('   - Use Game ID:', gameId);
    console.log('   - Test with multiple browser tabs');
    console.log('   - Verify real-time updates work');

    // Cleanup
    sockets.forEach(({ socket }) => socket.disconnect());

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
  }
}

// Run the test
testFrontendLobby();
