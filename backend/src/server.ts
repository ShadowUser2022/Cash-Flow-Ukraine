import cors from "cors";
import express from "express";
import { board, createGame, dreams, type GameState, resolvePending, rollGame } from "./core.js";

const app = express();
const port = Number(process.env.PORT ?? 3001);
const games = new Map<string, GameState>();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.get("/api/core/meta", (_req, res) => {
  res.json({ dreams, board });
});

app.post("/api/core/new_game", (req, res) => {
  const playerName = String(req.body?.playerName ?? "").trim();
  const dreamId = String(req.body?.dreamId ?? dreams[0].id);
  const dreamExists = dreams.some((dream) => dream.id === dreamId);

  if (!playerName) {
    res.status(400).json({ error: "playerName is required" });
    return;
  }

  if (!dreamExists) {
    res.status(400).json({ error: "dreamId is invalid" });
    return;
  }

  const game = createGame(playerName, dreamId);
  games.set(game.id, game);
  res.status(201).json(game);
});

app.get("/api/core/state/:gameId", (req, res) => {
  const game = games.get(req.params.gameId);

  if (!game) {
    res.status(404).json({ error: "Game not found" });
    return;
  }

  res.json(game);
});

app.post("/api/core/roll", (req, res) => {
  updateGame(req.body?.gameId, res, rollGame);
});

app.post("/api/core/resolve_pending", (req, res) => {
  if (typeof req.body?.accept !== "boolean") {
    res.status(400).json({ error: "accept must be boolean" });
    return;
  }

  const accept = req.body.accept;
  updateGame(req.body?.gameId, res, (game) => resolvePending(game, accept));
});

function updateGame(
  gameId: unknown,
  res: express.Response,
  update: (game: GameState) => GameState,
) {
  const id = String(gameId ?? "");

  if (!id) {
    res.status(400).json({ error: "gameId is required" });
    return;
  }

  const game = games.get(id);

  if (!game) {
    res.status(404).json({ error: "Game not found" });
    return;
  }

  try {
    const next = update(game);
    games.set(next.id, next);
    res.json(next);
  } catch (error) {
    res.status(409).json({
      error: error instanceof Error ? error.message : "Core action failed",
    });
  }
}

app.listen(port, "0.0.0.0", () => {
  console.log(`Cash Flow Core API listening on ${port}`);
});
