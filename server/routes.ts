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
    const playersWithRewards = await Promise.all(playersList.map(async (p) => {
      const rewards = await storage.getPlayerRewards(p.id);
      return { ...p, rewards };
    }));
    res.json(playersWithRewards);
  }));

  // Season Info Route
  app.get("/api/season", asyncHandler(async (_req, res) => {
    // Hardcoded for now, can be moved to storage later
    const seasonEnd = new Date("2026-03-26T00:00:00Z");
    res.json({
      name: "Temporada de Abertura: O Despertar da Aliança",
      endsAt: seasonEnd.toISOString(),
      prizes: [
        { rank: "Top 1", prize: "Espada Suprema da Aliança (Mítica) + 1000 Diamantes" },
        { rank: "Top 3", prize: "Cajado do Arcanista (Lendário) + 500 Diamantes" },
        { rank: "Top 10", prize: "Asas da Vitória (Épica)" }
      ]
    });
  }));

  // Get single player details
  app.get("/api/players/:accountId/:zoneId", asyncHandler(async (req, res) => {
    const { accountId, zoneId } = req.params;
    const [player, history] = await Promise.all([
      storage.getPlayerByAccountId(accountId, zoneId),
      storage.getMatchesByPlayerId(accountId, zoneId),
    ]);

    if (!player) {
      res.status(404).json({ message: "Player not found" });
      return;
    }

    const playerRewards = await storage.getPlayerRewards(player.id);

    // Real arena stats (calculated from actual match data)
    const arenaWins = history.filter(m => m.winnerId === accountId && m.winnerZone === zoneId).length;
    const arenaLosses = history.filter(m => m.loserId === accountId && m.loserZone === zoneId).length;
    const totalArena = arenaWins + arenaLosses;
    const arenaStats = {
      totalMatches: totalArena,
      wins: arenaWins,
      losses: arenaLosses,
      winRate: totalArena > 0 ? ((arenaWins / totalArena) * 100).toFixed(1) + "%" : "0%",
    };

    const matchesWithNames = history.map(m => {
      const isWinner = m.winnerId === accountId && m.winnerZone === zoneId;
      return {
        ...m,
        opponentName: isWinner ? "Inimigo" : "Vencedor",
        result: isWinner ? "win" : "loss"
      };
    });

    res.json({ player, history: matchesWithNames, arenaStats, rewards: playerRewards });
  }));

  // MLBB Account Info Proxy (Real API Validation)
  app.get("/api/mlbb/account/:id/:zone", asyncHandler(async (req, res) => {
    const { id, zone } = req.params;
    if (!id || id.length < 5) {
      res.status(400).json({ message: "ID Inválido" });
      return;
    }

    try {
      const apiRes = await fetch(`https://api.isan.eu.org/nickname/ml?id=${id}&zone=${zone}`);
      if (apiRes.ok) {
        const data = await apiRes.json() as { success: boolean; name?: string };
        if (data.success && data.name) {
          const realName = decodeURIComponent(data.name.replace(/\+/g, ' '));
          res.json({
            name: realName,
            rank: "Verificado",
            avatarImage: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(realName)}&backgroundColor=1e3a5f&textColor=f1f5f9&fontSize=36`
          });
          return;
        }
      }
    } catch (err) {
      console.error("MLBB API Error:", err);
    }

    // Fallback if API fails
    res.json({
      name: `Soldado_${id.slice(-4)}`,
      rank: "Não verificado",
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

  // Rewards Routes
  app.get("/api/rewards", asyncHandler(async (_req, res) => {
    const allRewards = await storage.getRewards();
    res.json(allRewards);
  }));

  app.post("/api/players/:id/rewards", asyncHandler(async (req, res) => {
    const playerId = parseInt(req.params.id);
    const { rewardId } = req.body;
    await storage.assignReward(playerId, rewardId);
    res.json({ success: true });
  }));

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
