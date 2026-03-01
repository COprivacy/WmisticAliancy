import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPlayerSchema, insertMatchSchema, calculateRank } from "@shared/schema";
import { getHeroDetails } from "./mlbb-api";
import asyncHandler from "express-async-handler";
import multer from "multer";
import path from "path";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";

// Supabase configuration for persistent storage
const supabaseUrl = process.env.SUPABASE_URL || `https://${process.env.SUPABASE_PROJECT_ID}.supabase.co`;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

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

const upload = multer({ storage: multer.memoryStorage() });

async function uploadToSupabase(file: Express.Multer.File, bucket: string): Promise<string | null> {
  if (!supabase) return null;

  const fileExt = path.extname(file.originalname);
  const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
  const filePath = `${fileName}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: true
    });

  if (error) {
    console.error(`Supabase upload error (${bucket}):`, error);
    return null;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
}

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

    if (!player) {
      res.status(404).json({ message: "Jogador não encontrado." });
      return;
    }

    if (player.isBanned) {
      res.status(403).json({ message: "Sua conta foi suspensa por violar as regras da arena." });
      return;
    }

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

    req.session.user = {
      username: isAdmin ? "Sem+Pai (ADM)" : player.gameName,
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
    const activeSeason = await storage.getConfig("active_season");
    // Ensure all fields are present with safe defaults
    const sanitizedSeason = {
      name: (activeSeason && activeSeason.name) || "O Despertar da Aliança",
      endsAt: (activeSeason && activeSeason.endsAt) || new Date("2026-03-27T00:00:00Z").toISOString(),
      prizes: (activeSeason && activeSeason.prizes) || [],
      fontSize: (activeSeason && Number(activeSeason.fontSize)) || 72,
      fontFamily: (activeSeason && activeSeason.fontFamily) || "font-serif",
      titleEffect: (activeSeason && activeSeason.titleEffect) || "none",
    };
    res.json(sanitizedSeason);
  }));

  // Update Season Info (Admin only)
  app.post("/api/admin/season", asyncHandler(async (req, res) => {
    if (!req.session.user?.isAdmin) {
      res.status(403).json({ message: "Apenas guardiões supremos podem alterar o destino da temporada." });
      return;
    }

    const { name, endsAt, prizes, fontSize, fontFamily, titleEffect } = req.body;

    // Explicitly build the config object to ensure it has all fields
    const newConfig = {
      name: String(name || "Temporada de Abertura"),
      endsAt: String(endsAt || new Date().toISOString()),
      prizes: prizes || [],
      fontSize: Number(fontSize) || 72,
      fontFamily: String(fontFamily || "font-serif"),
      titleEffect: String(titleEffect || "none")
    };

    console.log("-----------------------------------------");
    console.log("!!! ADMIN SEASON UPDATE ATTEMPT !!!");
    console.log("Raw Body:", JSON.stringify(req.body));
    console.log("Processed Config:", JSON.stringify(newConfig));

    await storage.setConfig("active_season", newConfig);

    // Verify save by reading back
    const verifyConfig = await storage.getConfig("active_season");
    console.log("DB Confirmation:", JSON.stringify(verifyConfig));
    console.log("-----------------------------------------");

    res.json({
      message: "Temporada reconfigurada com sucesso.",
      config: verifyConfig || newConfig
    });
  }));

  // Batch Distribution by Rank
  app.post("/api/admin/distribute-rank-rewards", requireAdmin, asyncHandler(async (req, res) => {
    const { rankTarget, rewardId, days } = req.body;
    const playersList = await storage.getPlayers();
    playersList.sort((a, b) => b.points - a.points);

    let targets: any[] = [];
    if (rankTarget === "top1" && playersList[0]) targets = [playersList[0]];
    else if (rankTarget === "top2" && playersList[1]) targets = [playersList[1]];
    else if (rankTarget === "top3" && playersList[2]) targets = [playersList[2]];
    else if (rankTarget === "top10") targets = playersList.slice(0, 10);

    const expiresAt = days ? new Date() : undefined;
    if (expiresAt && days) expiresAt.setDate(expiresAt.getDate() + parseInt(days));

    const rewards = await storage.getRewards();
    const reward = rewards.find(r => r.id === rewardId);

    if (!reward) {
      res.status(404).json({ message: "Relíquia não encontrada" });
      return;
    }

    for (const player of targets) {
      await storage.assignReward(player.id, rewardId, expiresAt);
      await storage.createActivity("reward_earned", player.id, player.gameName, {
        rewardName: reward.name,
        rewardIcon: reward.icon
      });
    }

    res.json({ success: true, count: targets.length });
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

  // Image Upload Route (Persist to Supabase or local storage)
  app.post("/api/upload", requireAdmin, upload.single('file'), asyncHandler(async (req, res) => {
    if (!req.file) {
      res.status(400).json({ message: "Nenhum arquivo enviado." });
      return;
    }

    if (supabase) {
      const publicUrl = await uploadToSupabase(req.file, 'uploads');
      if (publicUrl) {
        res.json({ url: publicUrl });
        return;
      }
    }

    // Local fallback: write buffer to file since we use memoryStorage
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(req.file.originalname)}`;
    const uploadDir = path.resolve(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, req.file.buffer);

    res.json({ url: `/uploads/${fileName}` });
  }));

  // Avatar Upload Route
  app.post("/api/players/:id/avatar", upload.single('avatar'), asyncHandler(async (req, res) => {
    const playerId = parseInt(req.params.id as string);
    if (!req.file) {
      res.status(400).json({ message: "Nenhum arquivo enviado." });
      return;
    }

    if (supabase) {
      const avatarUrl = await uploadToSupabase(req.file, 'avatars');
      if (avatarUrl) {
        const player = await storage.updatePlayer(playerId, { avatar: avatarUrl });
        res.json({ avatar: player.avatar });
        return;
      }
    }

    res.status(503).json({ message: "Serviço de armazenamento não configurado." });
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

  app.post("/api/rewards", requireAdmin, asyncHandler(async (req, res) => {
    const reward = await storage.createReward(req.body);
    res.json(reward);
  }));

  app.patch("/api/rewards/:id", requireAdmin, asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id as string);
    const reward = await storage.updateReward(id, req.body);
    res.json(reward);
  }));

  app.delete("/api/rewards/:id", requireAdmin, asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id as string);
    await storage.deleteReward(id);
    res.json({ success: true });
  }));

  app.get("/api/seasons", asyncHandler(async (_req, res) => {
    const allSeasons = await storage.getSeasons();
    res.json(allSeasons);
  }));


  app.post("/api/players/:id/rewards", requireAdmin, asyncHandler(async (req, res) => {
    const playerId = parseInt(req.params.id as string);
    const { rewardId, expiresAt } = req.body;

    await storage.assignReward(playerId, rewardId, expiresAt ? new Date(expiresAt) : undefined);

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
