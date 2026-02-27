import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPlayerSchema, insertMatchSchema, calculateRank } from "@shared/schema";
import { getHeroDetails } from "./mlbb-api";
import asyncHandler from "express-async-handler";
import multer from "multer";
import path from "path";
import fs from "fs";

declare module "express-session" {
  interface SessionData {
    user: {
      id: string;
      zoneId: string;
      username: string;
      isAdmin: boolean;
    };
  }
}

const ADMIN_ID = "1792001576";

const requireAuth = (req: any, res: any, next: any) => {
  if (!req.session.user) return res.status(401).json({ message: "Não autorizado" });
  next();
};

const requireAdmin = (req: any, res: any, next: any) => {
  if (!req.session.user?.isAdmin) return res.status(403).json({ message: "Acesso negado: Apenas admins" });
  next();
};

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
  // Authentication Routes
  app.post("/api/login", asyncHandler(async (req, res) => {
    const { username, id, zoneId, pin } = req.body;
    const isAdmin = id === ADMIN_ID;

    // Check if player exists
    const player = await storage.getPlayerByAccountId(id, zoneId);

    if (!isAdmin && !player) {
      res.status(404).json({ message: "Jogador não encontrado." });
      return;
    }

    if (player?.isBanned) {
      res.status(403).json({ message: "Sua conta foi suspensa por violar as regras da arena." });
      return;
    }

    // Only skip pin for Admin or if specifically handled (but let's enforce Pin if it's there)
    if (!isAdmin && player) {
      if (player.pin) {
        if (!pin) {
          res.json({ status: "needs_pin" });
          return;
        }
        if (player.pin !== pin) {
          res.status(401).json({ message: "PIN de acesso incorreto." });
          return;
        }
      } else {
        // Player exists but has no pin set yet
        if (!pin) {
          res.json({ status: "needs_setup_pin" });
          return;
        }
        // Save the first time pin
        await storage.updatePlayer(player.id, { pin });
      }
    }

    req.session.user = {
      username: isAdmin ? "sempaiadm" : (player?.gameName || username),
      id,
      zoneId: zoneId || "0000",
      isAdmin
    };

    res.json(req.session.user);
  }));

  app.get("/api/user", (req, res) => {
    res.json(req.session.user || null);
  });

  app.post("/api/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });
  // Get all players for rankings
  app.get("/api/players", asyncHandler(async (_req, res) => {
    const playersList = await storage.getPlayers();
    const playersWithRewards = await Promise.all(playersList.map(async (p) => {
      const rewards = await storage.getPlayerRewards(p.id);
      return { ...p, rewards };
    }));
    res.json(playersWithRewards);
  }));

  app.post("/api/daily-claim", requireAuth, asyncHandler(async (req, res) => {
    const user = req.session.user;
    if (!user) {
      res.sendStatus(401);
      return;
    }

    const player = await storage.getPlayerByAccountId(user.id, user.zoneId);
    if (!player) {
      res.status(404).json({ message: "Guerreiro não encontrado." });
      return;
    }

    const now = new Date();
    const lastClaimed = player.lastClaimedAt ? new Date(player.lastClaimedAt) : null;

    if (lastClaimed &&
      lastClaimed.getDate() === now.getDate() &&
      lastClaimed.getMonth() === now.getMonth() &&
      lastClaimed.getFullYear() === now.getFullYear()) {
      res.status(400).json({ message: "Você já resgatou sua honra hoje! Volte amanhã." });
      return;
    }

    const rewardPoints = 15;
    const newPoints = player.points + rewardPoints;
    const newRank = calculateRank(newPoints);
    const rankUp = newRank !== player.rank;

    const updated = await storage.updatePlayer(player.id, {
      points: newPoints,
      rank: newRank,
      lastClaimedAt: now
    });

    await storage.createActivity("daily_claim", player.id, player.gameName, { points: rewardPoints });

    if (rankUp) {
      await storage.createActivity("rank_up", player.id, player.gameName, { newRank });
    }

    res.json({
      success: true,
      points: updated.points,
      message: `Você recebeu +${rewardPoints} pontos de honra diária! ⚔️`
    });
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
    const accountId = req.params.accountId as string;
    const zoneId = req.params.zoneId as string;
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

    const playersList = await storage.getPlayers();
    const matchesWithNames = history.map(m => {
      const isWinner = m.winnerId === accountId && m.winnerZone === zoneId;
      const opponentId = isWinner ? m.loserId : m.winnerId;
      const opponentZone = isWinner ? m.loserZone : m.winnerZone;
      const opponent = playersList.find(p => p.accountId === opponentId && p.zoneId === opponentZone);

      return {
        ...m,
        opponentName: opponent?.gameName || (isWinner ? "Oponente Desconhecido" : "Vencedor Desconhecido"),
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

    const existing = await storage.getPlayerByAccountId(result.data.accountId as string, result.data.zoneId as string);
    if (existing) {
      res.status(400).json({ message: "ID de conta já registrado nesta zona." });
      return;
    }

    const playerData = {
      ...result.data,
      rank: calculateRank(result.data.points || 100)
    };
    const player = await storage.createPlayer(playerData);

    // Log Activity: New Player
    await storage.createActivity("new_player", player.id, player.gameName);

    res.json(player);
  }));

  // Hero Stats / Global Meta
  app.get("/api/activities", asyncHandler(async (_req, res) => {
    const latest = await storage.getLatestActivities(15);
    res.json(latest);
  }));

  app.post("/api/activities/:id/react", requireAuth, asyncHandler(async (req, res) => {
    const activityId = parseInt(req.params.id as string);
    const { emoji } = req.body;
    const userId = req.session.user?.id;
    if (!userId) {
      res.sendStatus(401);
      return;
    }

    await storage.toggleReaction(activityId, userId, emoji);
    res.json({ success: true });
  }));

  app.get("/api/matches/approved", asyncHandler(async (_req, res) => {
    const allApproved = await storage.getAllApprovedMatches();
    res.json(allApproved);
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
      res.status(400).json({ message: "Nenhum arquivo enviado." });
      return;
    }
    const filePath = `/uploads/${req.file.filename}`;
    res.json({ url: filePath });
  });

  // Avatar Upload Route
  app.post("/api/players/:id/avatar", upload.single('avatar'), asyncHandler(async (req, res) => {
    const playerId = parseInt(req.params.id as string);
    if (!req.file) {
      res.status(400).json({ message: "Nenhum arquivo enviado." });
      return;
    }
    const avatarUrl = `/uploads/${req.file.filename}`;
    const player = await storage.updatePlayer(playerId, { avatar: avatarUrl });
    res.json({ avatar: player.avatar });
  }));

  // Update Player Profile (Bio, Socials)
  app.put("/api/players/:id", asyncHandler(async (req, res) => {
    const playerId = parseInt(req.params.id as string);
    // Basic session validation: can only edit own profile or must be admin
    if (req.session.user?.id !== req.body.accountId && !req.session.user?.isAdmin) {
      res.status(403).json({ message: "Não autorizado a editar este perfil" });
      return;
    }

    const updatedPlayer = await storage.updatePlayer(playerId, {
      bio: req.body.bio,
      instagram: req.body.instagram,
      twitch: req.body.twitch,
      youtube: req.body.youtube,
      mainHero: req.body.mainHero
    });

    res.json(updatedPlayer);
  }));

  app.patch("/api/players/:id/admin", requireAdmin, asyncHandler(async (req, res) => {
    const playerId = parseInt(req.params.id as string);
    const { points, isBanned, pin } = req.body;

    const update: any = {};
    if (points !== undefined) {
      update.points = points;
      update.rank = calculateRank(points);
    }
    if (isBanned !== undefined) {
      update.isBanned = isBanned;
    }
    if (pin !== undefined) {
      update.pin = pin;
    }

    const updated = await storage.updatePlayer(playerId, update);
    res.json(updated);
  }));

  app.post("/api/admin/reset-season", requireAdmin, asyncHandler(async (_req, res) => {
    const playersList = await storage.getPlayers();
    for (const p of playersList) {
      await storage.updatePlayer(p.id, {
        points: 100,
        wins: 0,
        losses: 0,
        streak: 0,
        rank: "Recruta"
      });
    }
    res.json({ success: true, message: "Temporada resetada com sucesso!" });
  }));

  app.post("/api/admin/reset/activities", requireAdmin, asyncHandler(async (_req, res) => {
    await storage.clearActivities();
    res.json({ success: true, message: "Radar da Arena resetado!" });
  }));

  app.post("/api/admin/reset/matches", requireAdmin, asyncHandler(async (_req, res) => {
    await storage.clearMatches();
    res.json({ success: true, message: "Histórico de Partidas resetado!" });
  }));

  app.post("/api/admin/reset/challenges", requireAdmin, asyncHandler(async (_req, res) => {
    await storage.clearChallenges();
    res.json({ success: true, message: "War Room (Desafios) resetado!" });
  }));

  // Rewards Routes
  app.get("/api/rewards", asyncHandler(async (_req, res) => {
    const allRewards = await storage.getRewards();
    res.json(allRewards);
  }));

  app.get("/api/seasons", asyncHandler(async (_req, res) => {
    const allSeasons = await storage.getSeasons();
    res.json(allSeasons);
  }));

  app.post("/api/players/:id/rewards", requireAdmin, asyncHandler(async (req, res) => {
    const playerId = parseInt(req.params.id as string);
    const { rewardId } = req.body;

    await storage.assignReward(playerId, rewardId);

    // Log Activity: Reward Earned
    const [player, allRewards] = await Promise.all([
      storage.getPlayer(playerId),
      storage.getRewards()
    ]);
    const reward = allRewards.find(r => r.id === rewardId);

    if (player && reward) {
      await storage.createActivity("reward_earned", player.id, player.gameName, {
        rewardName: reward.name,
        rewardIcon: reward.icon
      });
    }

    res.json({ success: true });
  }));

  // Challenges Routes
  app.get("/api/challenges", requireAuth, asyncHandler(async (_req, res) => {
    const list = await storage.getAllChallenges();
    res.json(list);
  }));

  app.post("/api/challenges", requireAuth, asyncHandler(async (req, res) => {
    const { challengerId, challengerZone, challengedId, challengedZone, message, scheduledAt } = req.body;
    // Check if user is the challenger
    if (req.session.user?.id !== challengerId) {
      res.status(403).json({ message: "Não autorizado" });
      return;
    }
    const challenge = await storage.createChallenge(
      challengerId,
      challengerZone,
      challengedId,
      challengedZone,
      message,
      scheduledAt ? new Date(scheduledAt) : undefined
    );
    res.json(challenge);
  }));

  app.get("/api/challenges/:accountId/:zoneId", requireAuth, asyncHandler(async (req, res) => {
    const accountId = req.params.accountId as string;
    const zoneId = req.params.zoneId as string;
    const challengesList = await storage.getChallengesByPlayer(accountId, zoneId);
    res.json(challengesList);
  }));

  app.patch("/api/challenges/:id", requireAuth, asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id as string);
    const { status } = req.body;
    // Basic validation: user must be one of the participants
    // For simplicity, we assume the client sends the correct status update (accept/reject)
    await storage.updateChallengeStatus(id, status);
    res.json({ success: true });
  }));

  // Admin Actions: Approve or Reject
  app.post("/api/matches/:id/:action", requireAdmin, asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id as string);
    const action = req.params.action as string;

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
        const newPoints = winner.points + 50;
        const newRank = calculateRank(newPoints);
        const rankUp = newRank !== winner.rank;

        await storage.updatePlayer(winner.id, {
          points: newPoints,
          wins: winner.wins + 1,
          streak: winner.streak + 1,
          rank: newRank
        });

        const loser = await storage.getPlayerByAccountId(match.loserId, match.loserZone);

        // Log Activity: Match Win
        await storage.createActivity("match_approved", winner.id, winner.gameName, {
          opponentName: loser?.gameName || "Oponente",
          winnerHero: match.winnerHero,
          proofImage: match.proofImage
        });

        // Log Activity: Rank Up
        if (rankUp) {
          await storage.createActivity("rank_up", winner.id, winner.gameName, {
            newRank: newRank
          });
        }
      }

      // Update Loser
      const loser = await storage.getPlayerByAccountId(match.loserId, match.loserZone);
      if (loser) {
        const newPoints = Math.max(0, loser.points - 20);
        await storage.updatePlayer(loser.id, {
          points: newPoints,
          losses: loser.losses + 1,
          streak: 0,
          rank: calculateRank(newPoints)
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
    if (!hero) {
      res.status(404).json({ message: "Hero não encontrado." });
      return;
    }
    res.json(hero);
  });

  return httpServer;
}
