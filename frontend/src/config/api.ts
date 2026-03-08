// API Configuration
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_URL;

export const config = {
  apiUrl: API_URL,
  socketUrl: SOCKET_URL,
  endpoints: {
    health: `${API_URL}/health`,
    games: `${API_URL}/api/games`,
    createGame: `${API_URL}/api/games/create`,
    joinGame: (gameId: string) => `${API_URL}/api/games/${gameId}/join`,
    readyStatus: (gameId: string) => `${API_URL}/api/games/${gameId}/ready`,
    profession: (gameId: string) => `${API_URL}/api/games/${gameId}/profession`,
    removePlayer: (gameId: string) =>
      `${API_URL}/api/games/${gameId}/remove-player`,
    startGame: (gameId: string) => `${API_URL}/api/games/${gameId}/start`,
  },
};

export default config;
