import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPlayerSchema, insertMatchSchema } from "@shared/schema";
import { getHeroDetails } from "./mlbb-api";
import asyncHandler from "express-async-handler";
import multer from "multer";
import path from "path";
import fs from "fs";

const storageMulter = multer.diskStorage({
  destination: function (_req, _file, cb) {
    const uploadDir = 'client/public/uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (_req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'proof-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storageMulter });

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Get all players for rankings
  app.get("/api/players", asyncHandler(async (_req, res) => {
    const playersList = await storage.getPlayers();
    res.json(playersList);
  }));

  // Get single player details
  app.get("/api/players/:accountId/:zoneId", asyncHandler(async (req, res) => {
    const { accountId, zoneId } = req.params;
    const player = await storage.getPlayerByAccountId(accountId as string, zoneId as string);
    if (!player) {
      res.status(404).json({ message: "Jogador não encontrado." });
      return;
    }

    const matchesList = await storage.getMatchesByPlayerId(accountId as string, zoneId as string);
    const playersList = await storage.getPlayers();

    const matchesWithNames = matchesList.map(m => {
      const winner = playersList.find(p => p.accountId === m.winnerId && p.zoneId === m.winnerZone);
      const loser = playersList.find(p => p.accountId === m.loserId && p.zoneId === m.loserZone);
      return {
        ...m,
        winnerName: winner?.gameName || "Soldado",
        loserName: loser?.gameName || "Soldado"
      };
    });

    // Mock live MLBB data to complement internal storage
    const liveStats = {
      totalMatches: Math.floor(Math.random() * 5000) + 1000,
      overallWinrate: (Math.random() * 20 + 45).toFixed(1) + "%",
      mainRole: ["Jungler", "Exp Lane", "Mid Lane", "Gold Lane", "Roamer"][Math.floor(Math.random() * 5)],
      favoriteHero: ["Lancelot", "Fanny", "Gusion", "Chou", "Ling", "Paquito"][Math.floor(Math.random() * 6)],
      rankIcon: "https://vignette.wikia.nocookie.net/mobile-legends/images/c/c2/Rank_Mythic.png"
    };

    res.json({ player, history: matchesWithNames, liveStats });
  }));

  // MLBB Account Info Proxy (Validation)
  app.get("/api/mlbb/account/:id/:zone", asyncHandler(async (req, res) => {
    const { id, zone } = req.params;
    if (!id || id.length < 5) {
      res.status(400).json({ message: "ID Inválido" });
      return;
    }

    res.json({
      name: `Soldado_${id.slice(-4)}`,
      rank: "Mythical Glory",
      avatarImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}${zone}&backgroundColor=b6e3f4`
    });
  }));

  // Get pending matches (Admin)
  app.get("/api/matches", asyncHandler(async (_req, res) => {
    const pending = await storage.getPendingMatches();
    res.json(pending);
  }));

  // Register or Claim a spot
  app.post("/api/players", asyncHandler(async (req, res) => {
    const result = insertPlayerSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error });
      return;
    }

    const existing = await storage.getPlayerByAccountId(result.data.accountId, result.data.zoneId);
    if (existing) {
      res.status(400).json({ message: "ID de conta já registrado nesta zona." });
      return;
    }

    const player = await storage.createPlayer(result.data);
    res.json(player);
  }));

  // Report a combat
  app.post("/api/matches", asyncHandler(async (req, res) => {
    const result = insertMatchSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error });
      return;
    }

    const match = await storage.createMatch(result.data);
    res.json(match);
  }));

  // Image Upload Route
  app.post("/api/upload", upload.single('file'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "Nenhum arquivo enviado." });
    }
    const filePath = `/uploads/${req.file.filename}`;
    res.json({ url: filePath });
  });

  // Admin Actions: Approve or Reject
  app.post("/api/matches/:id/:action", asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id as string);
    const action = req.params.action;

    if (action === "approve") {
      const matches_list = await storage.getPendingMatches();
      const match = matches_list.find(m => m.id === id);
      if (!match) {
        res.status(404).json({ message: "Combate não encontrado." });
        return;
      }

      // Update Winner
      const winner = await storage.getPlayerByAccountId(match.winnerId, match.winnerZone);
      if (winner) {
        await storage.updatePlayer(winner.id, {
          points: winner.points + 50,
          wins: winner.wins + 1,
          streak: winner.streak + 1
        });
      }

      // Update Loser
      const loser = await storage.getPlayerByAccountId(match.loserId, match.loserZone);
      if (loser) {
        await storage.updatePlayer(loser.id, {
          points: Math.max(0, loser.points - 20),
          losses: loser.losses + 1,
          streak: 0
        });
      }

      await storage.updateMatchStatus(id, "approved");
      res.json({ message: "Combate aprovado e pontos atualizados." });
    } else {
      await storage.updateMatchStatus(id, "rejected");
      res.json({ message: "Combate rejeitado." });
    }
  }));

  // Example proxy to MLBB API for hero data
  app.get("/api/mlbb/hero/:id", async (req, res) => {
    const hero = await getHeroDetails(req.params.id);
    if (!hero) return res.status(404).json({ message: "Hero não encontrado." });
    res.json(hero);
  });

  return httpServer;
}

