# Frontend Lobby Testing Guide

## Current Status
✅ **Backend Running**: localhost:3001  
✅ **Frontend Running**: localhost:5177  
✅ **Test Game Created**: ID `Z60UQ7` (from test script)  
✅ **Socket.IO Connections**: Verified working  

## Manual Testing Checklist

### 1. Basic Connection Test
- [ ] Open browser at http://localhost:5177
- [ ] Click "Test Backend Connection" button
- [ ] Should see success notification
- [ ] Status should show "Підключено" (Connected)

### 2. Create Game Test
- [ ] Enter player name (e.g., "Тест Гравець")
- [ ] Click "Створити гру" (Create Game)
- [ ] Should see success alert with new game ID
- [ ] Game ID should appear in "Гра створена!" section
- [ ] Status should show current game ID

### 3. Join Existing Game Test
- [ ] Open new browser tab/window at http://localhost:5177
- [ ] Enter different player name (e.g., "Гравець 2")  
- [ ] Enter Game ID: `Z60UQ7` (or the new one from step 2)
- [ ] Click "Приєднатися" (Join)
- [ ] Should see success notification
- [ ] Game data should appear showing multiple players

### 4. Real-time Updates Test
- [ ] Keep both browser tabs open
- [ ] Actions in one tab should update in the other
- [ ] Game data section should show updated player list
- [ ] Socket.IO events should appear in console

### 5. Socket.IO Events Test
Open browser console (F12) and look for:
- [ ] "Connected to game server" on page load
- [ ] "Game state updated" when joining game
- [ ] "Player joined" events from other players
- [ ] Real-time game state updates

### 6. Error Handling Test
- [ ] Try joining non-existent game ID
- [ ] Try creating game without connection
- [ ] Try actions when disconnected

## Advanced Testing with GameLobby Component

### Setup for Advanced Testing
To test the comprehensive lobby features:

1. **Profession Selection**: The GameLobby component supports selecting different professions
2. **Player Ready States**: Players can mark themselves as ready
3. **Host Controls**: Host can start game and remove players
4. **Real-time Notifications**: All actions are broadcasted to all players

### Test Game IDs Available
- `Z60UQ7` - Created by test script with 3 players
- Create new ones using the "Створити гру" button

### Expected Behavior
1. **Game Creation**: Should create game and automatically join as host
2. **Game Joining**: Should join existing game and receive current state
3. **Real-time Updates**: All players should see updates immediately
4. **Socket.IO Events**: Console should show all Socket.IO communications
5. **Error Handling**: Should show appropriate error messages

## Debugging Tips
- Check browser console for Socket.IO logs
- Check Network tab for REST API calls
- Status section shows connection state
- Game data section shows current game state
- Notifications appear in top-right corner

## Next Steps for Full Lobby Testing
1. ✅ Test basic functionality (current step)
2. Integrate GameLobby component for profession selection
3. Test ready states and host controls
4. Test with multiple browser sessions
5. Verify all Socket.IO events work correctly
