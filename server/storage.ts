import {
  users, players, matches, rewards, playerRewards, seasons, challenges, activities, reactions, configs, globalMessages, privateMessages, userBlocks, gloryTopups,
  quests, playerQuests,
  type User, type InsertUser, type Player, type InsertPlayer, type Match, type InsertMatch,
  type Reward, type InsertReward, type Config, type InsertConfig, type Activity, type Reaction,
  type GlobalMessage, type PrivateMessage, type GloryTopup, type InsertGloryTopup,
  type Quest, type PlayerQuest, type InsertQuest, calculateRank
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, sql, desc, ne } from "drizzle-orm";
import { pgTable, alias } from "drizzle-orm/pg-core";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Player methods
  getPlayers(): Promise<Player[]>;
  getPlayer(id: number): Promise<Player | undefined>;
  getPlayerByAccountId(accountId: string, zoneId: string): Promise<Player | undefined>;
  getPlayerByAccountIdOnly(accountId: string): Promise<Player | undefined>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  updatePlayer(id: number, update: Partial<Player>): Promise<Player>;
  consumeArenaTicket(playerId: number): Promise<boolean>;
  addArenaTickets(playerId: number, amount: number): Promise<void>;

  // Match methods
  getMatch(id: number): Promise<Match | undefined>;
  getPendingMatches(): Promise<(Match & { winnerName: string; loserName: string })[]>;
  createMatch(match: InsertMatch): Promise<Match>;
  updateMatchStatus(id: number, status: string): Promise<Match>;
  approveMatch(id: number): Promise<void>;
  rejectMatch(id: number, action: "reject" | "punish"): Promise<void>;
  updateMatchAiInfo(id: number, aiStatus: string, aiAnalysis?: string): Promise<void>;
  getMatchesByPlayerId(accountId: string, zoneId: string): Promise<Match[]>;
  getAllApprovedMatches(): Promise<Match[]>;

  // Search
  searchPlayers(query: string): Promise<Player[]>;

  // Reward methods
  getRewards(): Promise<Reward[]>;
  createReward(reward: InsertReward): Promise<Reward>;
  updateReward(id: number, update: Partial<Reward>): Promise<Reward>;
  deleteReward(id: number): Promise<void>;
  assignReward(playerId: number, rewardId: number, expiresAt?: Date): Promise<void>;
  revokeReward(playerId: number, rewardId: number): Promise<void>;
  getPlayerRewards(playerId: number): Promise<Reward[]>;
  purchaseReward(playerId: number, rewardId: number): Promise<void>;
  awardGloryPoints(playerId: number, points: number): Promise<void>;
  createGloryTopup(topup: InsertGloryTopup): Promise<GloryTopup>;
  updateGloryTopupStatus(id: number, status: string): Promise<GloryTopup>;
  getGloryTopups(playerId?: number): Promise<GloryTopup[]>;

  // Season methods
  getSeasons(): Promise<any[]>;

  // Challenge methods
  createChallenge(challengerId: string, challengerZone: string, challengedId: string, challengedZone: string, message?: string, scheduledAt?: Date): Promise<any>;
  getChallengesByPlayer(accountId: string, zoneId: string): Promise<any[]>;
  getAllChallenges(): Promise<any[]>;
  getChallengeById(id: number): Promise<any | undefined>;
  updateChallengeStatus(id: number, status: string): Promise<void>;
  completeChallengeBetween(p1Id: string, p1Zone: string, p2Id: string, p2Zone: string): Promise<void>;

  // Activity methods
  createActivity(type: string, playerId?: number, playerGameName?: string, data?: any): Promise<void>;
  getLatestActivities(limit?: number): Promise<any[]>;
  toggleReaction(activityId: number, userId: string, emoji: string): Promise<void>;

  // Config methods
  getConfig(key: string): Promise<any>;
  setConfig(key: string, value: any): Promise<void>;

  // Clear methods
  clearActivities(): Promise<void>;
  clearMatches(): Promise<void>;
  clearChallenges(): Promise<void>;

  // Chat methods
  getGlobalMessages(limit?: number): Promise<GlobalMessage[]>;
  createGlobalMessage(message: Omit<GlobalMessage, "id" | "createdAt">): Promise<GlobalMessage>;
  clearGlobalMessages(): Promise<void>;

  // Private Chat
  getPrivateMessages(p1Id: string, p1Zone: string, p2Id: string, p2Zone: string, limit?: number): Promise<PrivateMessage[]>;
  createPrivateMessage(data: Omit<PrivateMessage, "id" | "createdAt" | "isRead">): Promise<PrivateMessage>;
  getRecentConversations(playerId: string, zoneId: string): Promise<any[]>;
  markMessagesAsRead(senderId: string, senderZone: string, receiverId: string, receiverZone: string): Promise<void>;
  deletePrivateConversation(p1Id: string, p1Zone: string, p2Id: string, p2Zone: string): Promise<void>;

  // Blocking methods
  blockUser(blockerId: string, blockerZone: string, blockedId: string, blockedZone: string): Promise<void>;
  unblockUser(blockerId: string, blockerZone: string, blockedId: string, blockedZone: string): Promise<void>;
  isBlocked(u1Id: string, u1Zone: string, u2Id: string, u2Zone: string): Promise<boolean>;
  getBlocksForPlayer(playerId: string, zoneId: string): Promise<any[]>;

  // Quest methods
  getQuests(): Promise<Quest[]>;
  getQuest(id: number): Promise<Quest | undefined>;
  createQuest(quest: InsertQuest): Promise<Quest>;
  updateQuest(id: number, update: Partial<Quest>): Promise<Quest>;
  getPlayerQuests(playerId: number): Promise<(PlayerQuest & { quest: Quest })[]>;
  updateQuestProgress(playerId: number, questType: string, amount?: number, isAbsolute?: boolean): Promise<void>;
  claimQuestReward(playerId: number, questId: number): Promise<{ success: boolean; message: string; points: number; glory: number }>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.seedRewards();
    this.seedConfig();
  }

  async seedConfig() {
    const existing = await this.getConfig("active_season");
    if (!existing) {
      const defaultSeason = {
        name: "Temporada de Abertura: O Despertar da Aliança",
        endsAt: new Date("2026-03-26T00:00:00Z").toISOString(),
        prizes: [
          { rank: "Top 1", prize: "Espada Suprema da Aliança (Mítica) + 1000 Diamantes", image: "/images/rewards/mythic-sword.png" },
          { rank: "Top 3", prize: "Cajado do Arcanista (Lendário) + 500 Diamantes", image: "/images/rewards/legendary-staff.png" },
          { rank: "Top 10", prize: "Asas da Vitória (Épica)", image: "/images/rewards/epic-wings.svg" }
        ]
      };
      await this.setConfig("active_season", defaultSeason);
    }
  }

  async seedRewards() {
    try {
      const fs = await import("fs");
      const path = await import("path");
      const relicsPath = path.resolve(process.cwd(), "shared", "relics.json");

      if (!fs.existsSync(relicsPath)) return;

      const initialRewards = JSON.parse(fs.readFileSync(relicsPath, "utf-8"));
      const existing = await this.getRewards();

      // Get list of manually deleted rewards to avoid recreating them
      const deletedRewards = await this.getConfig("deleted_rewards") || [];

      for (const reward of initialRewards) {
        // Skip if this reward was explicitly deleted via Admin
        if (deletedRewards.includes(reward.name)) {
          continue;
        }

        const alreadyExists = existing.find(r => r.name === reward.name);
        if (!alreadyExists) {
          console.log(`SEED: Creating reward ${reward.name}`);
          await this.createReward(reward);
        }
      }
    } catch (e) {
      console.error("Failed to seed rewards:", e);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getPlayers(): Promise<Player[]> {
    return await db.select().from(players).orderBy(sql`${players.points} DESC`);
  }

  async getPlayer(id: number): Promise<Player | undefined> {
    const [player] = await db.select().from(players).where(eq(players.id, id));
    if (player) {
      return await this.checkAndResetTickets(player);
    }
    return player;
  }

  async getPlayerByAccountId(accountId: string, zoneId: string): Promise<Player | undefined> {
    const [player] = await db.select().from(players)
      .where(and(eq(players.accountId, accountId), eq(players.zoneId, zoneId)));

    if (player) {
      return await this.checkAndResetTickets(player);
    }
    return player;
  }

  // Private helper to ensure tickets are reset at 00:00 (Brazil Time)
  private async checkAndResetTickets(player: Player): Promise<Player> {
    const now = new Date();
    // Use Brazil Time (America/Sao_Paulo) for day comparison
    const brTimeStr = now.toLocaleDateString("en-US", { timeZone: "America/Sao_Paulo" });
    const today = new Date(brTimeStr);

    let lastResetDate: Date | null = null;
    if (player.lastTicketResetAt) {
      const resetTimeStr = new Date(player.lastTicketResetAt).toLocaleDateString("en-US", { timeZone: "America/Sao_Paulo" });
      lastResetDate = new Date(resetTimeStr);
    }

    // If it's a new day or no reset date recorded, HARD RESET to 5 tickets
    if (!lastResetDate || lastResetDate.getTime() < today.getTime()) {
      console.log(`[Arena] Resetting tickets for player ${player.id} (${player.gameName}). New day in Brazil.`);
      const [updated] = await db.update(players).set({
        arenaTickets: 5,
        lastTicketResetAt: now
      }).where(eq(players.id, player.id)).returning();
      return updated;
    }

    return player;
  }

  async getPlayerByAccountIdOnly(accountId: string): Promise<Player | undefined> {
    const [player] = await db.select().from(players)
      .where(eq(players.accountId, accountId))
      .limit(1);
    return player;
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const [player] = await db.insert(players).values(insertPlayer).returning();

    // Auto-assign Welcome Relic
    try {
      const allRewards = await this.getRewards();
      const welcomeRelic = allRewards.find(r => r.name === "Selo de Sangue da Aliança");
      if (welcomeRelic) {
        await this.assignReward(player.id, welcomeRelic.id);
      }
    } catch (err) {
      console.error("Failed to assign welcome relic:", err);
    }

    return player;
  }

  async updatePlayer(id: number, update: Partial<Player>): Promise<Player> {
    const [player] = await db.update(players).set(update).where(eq(players.id, id)).returning();
    if (!player) throw new Error("Player not found");
    return player;
  }

  async consumeArenaTicket(playerId: number): Promise<boolean> {
    let player = await this.getPlayer(playerId);
    if (!player) return false;

    // The call to getPlayer (which calls checkAndResetTickets) already ensured 
    // the tickets are up to date for the current day.

    if (player.arenaTickets > 0) {
      await db.update(players).set({
        arenaTickets: player.arenaTickets - 1
      }).where(eq(players.id, playerId));
      return true;
    }

    return false; // Sem ingressos!
  }

  async addArenaTickets(playerId: number, amount: number): Promise<void> {
    const [player] = await db.select().from(players).where(eq(players.id, playerId));
    if (!player) return;

    // Assegurar que os gratis são respeitados se for um dia novo?
    // Somente adicionamos por cima do que o jogador tem, sem resetar a data pro caso dele ganhar mais
    const now = new Date();
    let isSameDay = false;
    if (player.lastTicketResetAt) {
      const resetDate = new Date(player.lastTicketResetAt);
      isSameDay = resetDate.getDate() === now.getDate() &&
        resetDate.getMonth() === now.getMonth() &&
        resetDate.getFullYear() === now.getFullYear();
    }

    const currentTickets = isSameDay ? player.arenaTickets : 5;

    await db.update(players).set({
      arenaTickets: currentTickets + amount,
      lastTicketResetAt: isSameDay ? player.lastTicketResetAt : now
    }).where(eq(players.id, playerId));
  }

  async searchPlayers(query: string): Promise<Player[]> {
    return await db.select().from(players).where(sql`${players.gameName} LIKE ${`%${query}%`}`);
  }

  async getMatch(id: number): Promise<Match | undefined> {
    const [match] = await db.select().from(matches).where(eq(matches.id, id));
    return match;
  }

  async getPendingMatches(): Promise<(Match & { winnerName: string; loserName: string })[]> {
    const p1 = alias(players, "p1");
    const p2 = alias(players, "p2");

    const results = await db.select({
      match: matches,
      winnerName: p1.gameName,
      loserName: p2.gameName
    })
      .from(matches)
      .leftJoin(p1, and(eq(matches.winnerId, p1.accountId), eq(matches.winnerZone, p1.zoneId)))
      .leftJoin(p2, and(eq(matches.loserId, p2.accountId), eq(matches.loserZone, p2.zoneId)))
      .where(eq(matches.status, "pending"))
      .orderBy(desc(matches.createdAt));

    return results.map(r => ({
      ...r.match,
      winnerName: r.winnerName || "Soldado Desconhecido",
      loserName: r.loserName || "Soldado Desconhecido"
    }));
  }

  async createMatch(insertMatch: InsertMatch): Promise<Match> {
    const [match] = await db.insert(matches).values({
      ...insertMatch,
      createdAt: new Date()
    }).returning();
    return match;
  }

  async approveMatch(id: number): Promise<void> {
    const [match] = await db.select().from(matches).where(eq(matches.id, id));
    if (!match || match.status !== "pending") return;

    // Update Winner
    const winner = await this.getPlayerByAccountId(match.winnerId, match.winnerZone);
    const loser = await this.getPlayerByAccountId(match.loserId, match.loserZone);

    if (winner) {
      const newPoints = winner.points + 50;
      const newRank = calculateRank(newPoints);
      const rankUp = newRank !== winner.rank;

      await this.updatePlayer(winner.id, {
        points: newPoints,
        wins: winner.wins + 1,
        streak: winner.streak + 1,
        rank: newRank,
      });

      // Award 5 Glory Points for a win (moved from updateMatchStatus)
      await this.awardGloryPoints(winner.id, 5);

      // Log Activity: Match Win
      await this.createActivity("match_approved", winner.id, winner.gameName, {
        opponentName: loser?.gameName || "Oponente",
        winnerHero: match.winnerHero,
        proofImage: match.proofImage,
      });

      if (rankUp) {
        await this.createActivity("rank_up", winner.id, winner.gameName, {
          newRank: newRank,
        });
      }

      // Update Quests for winner
      await this.updateQuestProgress(winner.id, "matches", 1);
      await this.updateQuestProgress(winner.id, "wins", 1);
      await this.updateQuestProgress(winner.id, "streak", winner.streak + 1, true);
    }

    // Update Loser
    if (loser) {
      const newPoints = Math.max(0, loser.points - 20);
      await this.updatePlayer(loser.id, {
        points: newPoints,
        losses: loser.losses + 1,
        streak: 0,
        rank: calculateRank(newPoints),
      });

      // Update Quests for loser
      await this.updateQuestProgress(loser.id, "matches", 1);
      await this.updateQuestProgress(loser.id, "streak", 0, true);
    }

    await this.updateMatchStatus(id, "approved");

    // --- RANDOM DROP ON WIN (25% Chance) ---
    try {
      const dropChance = 0.25;
      if (Math.random() < dropChance && winner) {
        const dropType = Math.floor(Math.random() * 3); // 0: Relic, 1: Rank Points, 2: Glory Points

        if (dropType === 0) {
          const allRewards = await this.getRewards();
          const droppableRelics = allRewards.filter(r => r.type === 'relic' && !r.isRankPrize);

          if (droppableRelics.length > 0) {
            const randomRelic = droppableRelics[Math.floor(Math.random() * droppableRelics.length)];
            const playerRewards = await this.getPlayerRewards(winner.id);
            const alreadyHas = playerRewards.some(pr => pr.id === randomRelic.id);

            if (!alreadyHas) {
              await this.assignReward(winner.id, randomRelic.id);
              await this.createActivity("reward_earned", winner.id, winner.gameName, {
                rewardName: randomRelic.name,
                rewardIcon: randomRelic.icon,
                isDrop: true,
              });
            } else {
              await this.awardGloryPoints(winner.id, 5);
              await this.createActivity("match_drop", winner.id, winner.gameName, {
                type: "glory",
                amount: 5,
                message: "Recebeu +5 Glória como prêmio de consolação (Relíquia repetida)",
              });
            }
          }
        } else if (dropType === 1) {
          const bonusPoints = 15;
          const newPoints = winner.points + bonusPoints;
          const newRank = calculateRank(newPoints);
          await this.updatePlayer(winner.id, {
            points: newPoints,
            rank: newRank,
          });
          await this.createActivity("match_drop", winner.id, winner.gameName, {
            type: "rank",
            amount: bonusPoints,
            message: `Ganhou um bônus de +${bonusPoints} pontos de Rank!`,
          });
        } else {
          const bonusGlory = 5;
          await this.awardGloryPoints(winner.id, bonusGlory);
          await this.createActivity("match_drop", winner.id, winner.gameName, {
            type: "glory",
            amount: bonusGlory,
            message: `Ganhou um bônus de +${bonusGlory} moedas de Glória!`,
          });
        }
      }
    } catch (err) {
      console.error("Failed to process random drop:", err);
    }

    // Close the challenge automatically
    await this.completeChallengeBetween(match.winnerId, match.winnerZone, match.loserId, match.loserZone);
  }

  async rejectMatch(id: number, action: "reject" | "punish"): Promise<void> {
    const [match] = await db.select().from(matches).where(eq(matches.id, id));
    if (!match || match.status !== "pending") return;

    await this.updateMatchStatus(id, "rejected");

    if (action === "punish") {
      const reporter = await this.getPlayerByAccountId(match.winnerId, match.winnerZone);
      if (reporter) {
        const penaltyPoints = 100;
        const penaltyGlory = 50;

        const newPoints = Math.max(0, reporter.points - penaltyPoints);
        await this.updatePlayer(reporter.id, {
          points: newPoints,
          gloryPoints: Math.max(0, reporter.gloryPoints - penaltyGlory),
          rank: calculateRank(newPoints),
        });

        await this.createActivity("match_drop", reporter.id, reporter.gameName, {
          type: "penalty",
          message: `🚫 FRAUDE DETECTADA: Punido com -${penaltyPoints} pontos e -${penaltyGlory} Glória.`,
        });
      }
    }
  }

  async updateMatchAiInfo(id: number, aiStatus: string, aiAnalysis?: string): Promise<void> {
    await db.update(matches)
      .set({ aiStatus, aiAnalysis })
      .where(eq(matches.id, id));
  }

  async updateMatchStatus(id: number, status: string): Promise<Match> {
    const [match] = await db.update(matches).set({ status }).where(eq(matches.id, id)).returning();
    if (!match) throw new Error("Match not found");
    return match;
  }

  async getMatchesByPlayerId(accountId: string, zoneId: string): Promise<Match[]> {
    return await db.select().from(matches)
      .where(
        and(
          eq(matches.status, "approved"),
          sql`(${matches.winnerId} = ${accountId} AND ${matches.winnerZone} = ${zoneId}) OR (${matches.loserId} = ${accountId} AND ${matches.loserZone} = ${zoneId})`
        )
      )
      .orderBy(sql`${matches.createdAt} DESC`);
  }

  async getAllApprovedMatches(): Promise<Match[]> {
    return await db.select().from(matches)
      .where(eq(matches.status, "approved"))
      .orderBy(sql`${matches.createdAt} DESC`);
  }

  async getRewards(): Promise<Reward[]> {
    return await db.select().from(rewards);
  }

  async createReward(insertReward: InsertReward): Promise<Reward> {
    const [reward] = await db.insert(rewards).values(insertReward).returning();
    return reward;
  }

  async updateReward(id: number, update: Partial<Reward>): Promise<Reward> {
    const [reward] = await db.update(rewards).set(update).where(eq(rewards.id, id)).returning();
    if (!reward) throw new Error("Reward not found");
    return reward;
  }

  async deleteReward(id: number): Promise<void> {
    const [reward] = await db.select().from(rewards).where(eq(rewards.id, id));
    if (reward) {
      // Add to deleted_rewards list so Seeder doesn't bring it back
      const deletedRewards = await this.getConfig("deleted_rewards") || [];
      if (!deletedRewards.includes(reward.name)) {
        deletedRewards.push(reward.name);
        await this.setConfig("deleted_rewards", deletedRewards);
      }
    }
    await db.delete(rewards).where(eq(rewards.id, id));
  }

  async assignReward(playerId: number, rewardId: number, expiresAt?: Date): Promise<void> {
    await db.insert(playerRewards).values({
      playerId,
      rewardId,
      assignedAt: new Date(),
      expiresAt: expiresAt || null
    });
  }

  async revokeReward(playerId: number, revRewardId: number): Promise<void> {
    console.log(`[STORAGE] Revoking reward ${revRewardId} for player ${playerId}`);
    try {
      await db.delete(playerRewards)
        .where(and(eq(playerRewards.playerId, playerId), eq(playerRewards.rewardId, revRewardId)));
      console.log(`[STORAGE] Successfully revoked reward ${revRewardId}`);
    } catch (err) {
      console.error(`[STORAGE] Error revoking reward:`, err);
      throw err;
    }
  }

  async getPlayerRewards(playerId: number): Promise<Reward[]> {
    const results = await db.select({
      reward: rewards
    }).from(playerRewards)
      .innerJoin(rewards, eq(playerRewards.rewardId, rewards.id))
      .where(eq(playerRewards.playerId, playerId));

    return results.map(r => r.reward);
  }

  async purchaseReward(playerId: number, rewardId: number): Promise<void> {
    await db.transaction(async (tx) => {
      const [player] = await tx.select().from(players).where(eq(players.id, playerId));
      const [reward] = await tx.select().from(rewards).where(eq(rewards.id, rewardId));

      if (!player || !reward) throw new Error("Player or Reward not found");
      if (player.gloryPoints < reward.price) throw new Error("Saldo de Glória insuficiente");

      if (reward.type === 'ticket') {
        // Apenas adiciona os tickets na tabela players
        await tx.update(players).set({
          gloryPoints: player.gloryPoints - reward.price,
          arenaTickets: (player.arenaTickets || 0) + 1
        }).where(eq(players.id, playerId));
      } else {
        await tx.update(players).set({
          gloryPoints: player.gloryPoints - reward.price
        }).where(eq(players.id, playerId));

        await tx.insert(playerRewards).values({
          playerId,
          rewardId,
          assignedAt: new Date(),
          expiresAt: null
        });
      }

      // Log Activity: we use 'this' but since we are in a transaction we should be careful. 
      // Activities and logging are secondary, but let's keep it consistent.
      await tx.insert(activities).values({
        type: "reward_purchased",
        playerId: player.id,
        playerGameName: player.gameName,
        data: JSON.stringify({
          rewardName: reward.name,
          rewardIcon: reward.icon,
          price: reward.price,
          isTicket: reward.type === 'ticket'
        }),
        createdAt: new Date()
      });
    });
  }

  async awardGloryPoints(playerId: number, points: number): Promise<void> {
    const [player] = await db.select().from(players).where(eq(players.id, playerId));
    if (player) {
      await db.update(players).set({
        gloryPoints: player.gloryPoints + points
      }).where(eq(players.id, playerId));
    }
  }

  async createGloryTopup(topup: InsertGloryTopup): Promise<GloryTopup> {
    const [newTopup] = await db.insert(gloryTopups).values(topup).returning();
    return newTopup;
  }

  async updateGloryTopupStatus(id: number, status: string): Promise<GloryTopup> {
    return await db.transaction(async (tx) => {
      const [topup] = await tx.select().from(gloryTopups).where(eq(gloryTopups.id, id));
      if (!topup) throw new Error("Top-up request not found");

      if (status === "completed" && topup.status !== "completed") {
        const [player] = await tx.select().from(players).where(eq(players.id, topup.playerId));
        if (player) {
          await tx.update(players).set({
            gloryPoints: player.gloryPoints + topup.amount
          }).where(eq(players.id, topup.playerId));

          await tx.insert(activities).values({
            type: "glory_purchase_completed",
            playerId: player.id,
            playerGameName: player.gameName,
            data: JSON.stringify({ amount: topup.amount }),
            createdAt: new Date()
          });
        }
      }

      const [updated] = await tx.update(gloryTopups).set({ status }).where(eq(gloryTopups.id, id)).returning();
      return updated;
    });
  }

  async getGloryTopups(playerId?: number): Promise<GloryTopup[]> {
    if (playerId) {
      return await db.select().from(gloryTopups).where(eq(gloryTopups.playerId, playerId)).orderBy(sql`${gloryTopups.createdAt} DESC`);
    }
    return await db.select().from(gloryTopups).orderBy(sql`${gloryTopups.createdAt} DESC`);
  }

  async getSeasons(): Promise<any[]> {
    return await db.select().from(seasons).orderBy(sql`${seasons.endedAt} DESC`);
  }

  async createChallenge(challengerId: string, challengerZone: string, challengedId: string, challengedZone: string, message?: string, scheduledAt?: Date): Promise<any> {
    const [challenge] = await db.insert(challenges).values({
      challengerId,
      challengerZone,
      challengedId,
      challengedZone,
      status: "pending",
      message: message || null,
      scheduledAt: scheduledAt || null,
      createdAt: new Date()
    }).returning();
    return challenge;
  }

  async getChallengesByPlayer(accountId: string, zoneId: string): Promise<any[]> {
    const list = await db.select().from(challenges)
      .where(
        sql`(${challenges.challengerId} = ${accountId} AND ${challenges.challengerZone} = ${zoneId}) OR (${challenges.challengedId} = ${accountId} AND ${challenges.challengedZone} = ${zoneId})`
      )
      .orderBy(sql`${challenges.createdAt} DESC`);

    const enriched = await Promise.all(list.map(async (c) => {
      const challenger = await this.getPlayerByAccountId(c.challengerId, c.challengerZone);
      const challenged = await this.getPlayerByAccountId(c.challengedId, c.challengedZone);
      return {
        ...c,
        challengerName: challenger?.gameName || "Soldado",
        challengedName: challenged?.gameName || "Soldado"
      };
    }));
    return enriched;
  }

  async getAllChallenges(): Promise<any[]> {
    const all = await db.select().from(challenges).orderBy(sql`${challenges.createdAt} DESC`);
    const enriched = await Promise.all(all.map(async (c) => {
      const [challenger, challenged] = await Promise.all([
        this.getPlayerByAccountId(c.challengerId, c.challengerZone),
        this.getPlayerByAccountId(c.challengedId, c.challengedZone)
      ]);
      return {
        ...c,
        challengerName: challenger?.gameName || "Desconhecido",
        challengedName: challenged?.gameName || "Desconhecido",
        challengerAvatar: challenger?.avatar,
        challengedAvatar: challenged?.avatar,
        challengerFrame: challenger?.activeFrame,
        challengedFrame: challenged?.activeFrame,
        challengerStreak: challenger?.streak || 0,
        challengedStreak: challenged?.streak || 0,
        challengerIsBanned: challenger?.isBanned || false,
        challengedIsBanned: challenged?.isBanned || false
      };
    }));
    return enriched;
  }

  async getChallengeById(id: number): Promise<any | undefined> {
    const [challenge] = await db.select().from(challenges).where(eq(challenges.id, id));
    return challenge;
  }

  async updateChallengeStatus(id: number, status: string): Promise<void> {
    await db.update(challenges).set({ status }).where(eq(challenges.id, id));
  }

  async completeChallengeBetween(p1Id: string, p1Zone: string, p2Id: string, p2Zone: string): Promise<void> {
    await db.update(challenges).set({ status: 'completed' }).where(
      and(
        or(eq(challenges.status, 'accepted'), eq(challenges.status, 'pending')),
        or(
          and(
            eq(challenges.challengerId, p1Id), eq(challenges.challengerZone, p1Zone),
            eq(challenges.challengedId, p2Id), eq(challenges.challengedZone, p2Zone)
          ),
          and(
            eq(challenges.challengerId, p2Id), eq(challenges.challengerZone, p2Zone),
            eq(challenges.challengedId, p1Id), eq(challenges.challengedZone, p1Zone)
          )
        )
      )
    );
  }

  async createActivity(type: string, playerId?: number, playerGameName?: string, data?: any): Promise<void> {
    await db.insert(activities).values({
      type,
      playerId,
      playerGameName,
      data: data ? JSON.stringify(data) : null,
      createdAt: new Date()
    });
  }

  async getLatestActivities(limit: number = 20): Promise<any[]> {
    const results = await db.select().from(activities).orderBy(sql`${activities.createdAt} DESC`).limit(limit);

    const enriched = await Promise.all(results.map(async (a) => {
      const activityReactions = await db.select().from(reactions).where(eq(reactions.activityId, a.id));
      return {
        ...a,
        data: a.data ? JSON.parse(a.data) : null,
        reactions: activityReactions
      };
    }));

    return enriched;
  }

  async toggleReaction(activityId: number, userId: string, emoji: string): Promise<void> {
    const existing = await db.select().from(reactions).where(
      and(
        eq(reactions.activityId, activityId),
        eq(reactions.userId, userId),
        eq(reactions.emoji, emoji)
      )
    );

    if (existing.length > 0) {
      await db.delete(reactions).where(
        and(
          eq(reactions.activityId, activityId),
          eq(reactions.userId, userId),
          eq(reactions.emoji, emoji)
        )
      );
    } else {
      await db.insert(reactions).values({
        activityId,
        userId,
        emoji,
        createdAt: new Date()
      });
    }
  }

  async getConfig(key: string): Promise<any> {
    const [config] = await db.select().from(configs).where(eq(configs.key, key));
    return config ? JSON.parse(config.value) : null;
  }

  async setConfig(key: string, value: any): Promise<void> {
    const stringValue = JSON.stringify(value);
    await db.insert(configs)
      .values({ key, value: stringValue })
      .onConflictDoUpdate({
        target: configs.key,
        set: { value: stringValue }
      });
  }

  async clearActivities(): Promise<void> {
    await db.delete(activities);
    await db.delete(reactions);
  }

  async clearMatches(): Promise<void> {
    await db.delete(matches);
  }

  async clearChallenges(): Promise<void> {
    await db.delete(challenges);
  }

  async getGlobalMessages(limit: number = 50): Promise<GlobalMessage[]> {
    const msgs = await db.select().from(globalMessages).orderBy(sql`${globalMessages.createdAt} DESC`).limit(limit);

    // Anexa as informações atualizadas de avatar e zoneId dos jogadores correspondentes
    const enriched = await Promise.all(msgs.map(async (m) => {
      if (m.authorId === "admin") {
        return { ...m, authorZoneId: "0" } as any;
      }
      const [player] = await db.select().from(players).where(eq(players.accountId, m.authorId)).limit(1);
      if (player) {
        return {
          ...m,
          authorName: m.authorRank === "Moderador" ? `${player.gameName} (ADM)` : player.gameName,
          authorAvatar: player.avatar || m.authorAvatar,
          authorRank: m.authorRank === "Moderador" ? "Moderador" : player.rank,
          authorZoneId: player.zoneId,
          authorNameColor: player.activeNameColor || m.authorNameColor,
          authorNameEffect: player.activeNameEffect || m.authorNameEffect,
          authorNameFont: player.activeNameFont || m.authorNameFont
        } as any;
      }
      return { ...m, authorZoneId: "0" } as any;
    }));

    return enriched;
  }

  async createGlobalMessage(messageData: Omit<GlobalMessage, "id" | "createdAt">): Promise<GlobalMessage> {
    const [message] = await db.insert(globalMessages).values({
      ...messageData,
      createdAt: new Date()
    }).returning();

    // Mantém apenas as 200 mensagens mais recentes, apagando as antigas para economizar espaço
    try {
      await db.execute(sql`
        DELETE FROM ${globalMessages}
        WHERE id NOT IN (
          SELECT id FROM ${globalMessages}
          ORDER BY created_at DESC
          LIMIT 200
        )
      `);
    } catch (err) {
      console.error("Erro ao limpar mensagens antigas da taverna:", err);
    }

    return message;
  }

  async clearGlobalMessages(): Promise<void> {
    try {
      await db.execute(sql`DELETE FROM ${globalMessages}`);
      console.log("Chat system: All messages cleared from database.");
    } catch (err) {
      console.error("Chat system error while clearing messages:", err);
      throw err;
    }
  }

  // --- Private Chat Implementation ---
  async getPrivateMessages(p1Id: string, p1Zone: string, p2Id: string, p2Zone: string, limit: number = 50): Promise<PrivateMessage[]> {
    return await db.select().from(privateMessages)
      .where(
        or(
          and(
            eq(privateMessages.senderId, p1Id), eq(privateMessages.senderZone, p1Zone),
            eq(privateMessages.receiverId, p2Id), eq(privateMessages.receiverZone, p2Zone)
          ),
          and(
            eq(privateMessages.senderId, p2Id), eq(privateMessages.senderZone, p2Zone),
            eq(privateMessages.receiverId, p1Id), eq(privateMessages.receiverZone, p1Zone)
          )
        )
      )
      .orderBy(sql`${privateMessages.createdAt} ASC`)
      .limit(limit);
  }

  async createPrivateMessage(data: Omit<PrivateMessage, "id" | "createdAt" | "isRead">): Promise<PrivateMessage> {
    // Check if either user has blocked the other
    const blocked = await this.isBlocked(data.senderId, data.senderZone, data.receiverId, data.receiverZone);
    if (blocked) {
      throw new Error("Você não pode enviar mensagens para este usuário pois há um bloqueio ativo.");
    }

    const [message] = await db.insert(privateMessages).values({
      ...data,
      createdAt: new Date(),
      isRead: false
    }).returning();

    // Auto cleanup: keep last 50 messages for this specific conversation
    try {
      await db.execute(sql`
        DELETE FROM ${privateMessages}
        WHERE id IN (
          SELECT id FROM ${privateMessages}
          WHERE (
            (sender_id = ${data.senderId} AND sender_zone = ${data.senderZone} AND receiver_id = ${data.receiverId} AND receiver_zone = ${data.receiverZone})
            OR 
            (sender_id = ${data.receiverId} AND sender_zone = ${data.receiverZone} AND receiver_id = ${data.senderId} AND receiver_zone = ${data.senderZone})
          )
          ORDER BY created_at DESC
          OFFSET 50
        )
      `);
    } catch (err) {
      console.error("Erro ao limpar mensagens privadas antigas:", err);
    }

    return message;
  }

  async getRecentConversations(playerId: string, zoneId: string): Promise<any[]> {
    // Find all unique people the player has chatted with
    const sent = await db.select({
      id: privateMessages.receiverId,
      zone: privateMessages.receiverZone
    }).from(privateMessages).where(and(eq(privateMessages.senderId, playerId), eq(privateMessages.senderZone, zoneId)));

    const received = await db.select({
      id: privateMessages.senderId,
      zone: privateMessages.senderZone
    }).from(privateMessages).where(and(eq(privateMessages.receiverId, playerId), eq(privateMessages.receiverZone, zoneId)));

    const uniquePairs = new Map<string, { id: string, zone: string }>();
    [...sent, ...received].forEach(p => {
      uniquePairs.set(`${p.id}-${p.zone}`, p);
    });

    const conversationPartners = Array.from(uniquePairs.values());
    const results = await Promise.all(conversationPartners.map(async (p) => {
      const player = await this.getPlayerByAccountId(p.id, p.zone);

      // Get last message for this pair
      const [lastMsg] = await db.select().from(privateMessages)
        .where(
          or(
            and(eq(privateMessages.senderId, playerId), eq(privateMessages.senderZone, zoneId), eq(privateMessages.receiverId, p.id), eq(privateMessages.receiverZone, p.zone)),
            and(eq(privateMessages.senderId, p.id), eq(privateMessages.senderZone, p.zone), eq(privateMessages.receiverId, playerId), eq(privateMessages.receiverZone, zoneId))
          )
        )
        .orderBy(sql`${privateMessages.createdAt} DESC`)
        .limit(1);

      // Get unread count sent from this person to the current player
      const unread = await db.select().from(privateMessages)
        .where(
          and(
            eq(privateMessages.senderId, p.id), eq(privateMessages.senderZone, p.zone),
            eq(privateMessages.receiverId, playerId), eq(privateMessages.receiverZone, zoneId),
            eq(privateMessages.isRead, false)
          )
        );

      return {
        id: p.id,
        zone: p.zone,
        gameName: player?.gameName || "Soldado",
        avatar: player?.avatar,
        lastMessage: lastMsg?.content,
        lastMessageAt: lastMsg?.createdAt,
        unreadCount: unread.length
      };
    }));

    return results.sort((a, b) => new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime());
  }

  async markMessagesAsRead(senderId: string, senderZone: string, receiverId: string, receiverZone: string): Promise<void> {
    await db.update(privateMessages)
      .set({ isRead: true })
      .where(
        and(
          eq(privateMessages.senderId, senderId),
          eq(privateMessages.senderZone, senderZone),
          eq(privateMessages.receiverId, receiverId),
          eq(privateMessages.receiverZone, receiverZone),
          eq(privateMessages.isRead, false)
        )
      );
  }

  // Quest implementations
  async getQuests(): Promise<Quest[]> {
    return await db.select().from(quests);
  }

  async getQuest(id: number): Promise<Quest | undefined> {
    const [quest] = await db.select().from(quests).where(eq(quests.id, id));
    return quest;
  }

  async createQuest(insertQuest: InsertQuest): Promise<Quest> {
    const [quest] = await db.insert(quests).values(insertQuest).returning();
    return quest;
  }

  async updateQuest(id: number, update: Partial<Quest>): Promise<Quest> {
    const [quest] = await db.update(quests).set(update).where(eq(quests.id, id)).returning();
    if (!quest) throw new Error("Quest not found");
    return quest;
  }

  async getPlayerQuests(playerId: number): Promise<(PlayerQuest & { quest: Quest })[]> {
    const results = await db.select({
      playerQuest: playerQuests,
      quest: quests
    })
      .from(playerQuests)
      .innerJoin(quests, eq(playerQuests.questId, quests.id))
      .where(eq(playerQuests.playerId, playerId));

    // Handle daily reset logic here
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const enriched = await Promise.all(results.map(async (r) => {
      const lastReset = new Date(r.playerQuest.lastResetAt);
      if (lastReset < startOfToday) {
        // Reset this quest for the player
        const [reset] = await db.update(playerQuests)
          .set({
            progress: 0,
            status: "pending",
            lastResetAt: now,
            completedAt: null
          })
          .where(eq(playerQuests.id, r.playerQuest.id))
          .returning();
        return { ...reset, quest: r.quest };
      }
      return { ...r.playerQuest, quest: r.quest };
    }));

    // If player doesn't have all quests assigned, assign them
    const allQuests = await this.getQuests();
    const assignedQuestIds = results.map(r => r.playerQuest.questId);

    for (const q of allQuests) {
      if (!assignedQuestIds.includes(q.id)) {
        const [pq] = await db.insert(playerQuests).values({
          playerId,
          questId: q.id,
          progress: 0,
          status: "pending",
          lastResetAt: now
        }).returning();
        enriched.push({ ...pq, quest: q });
      }
    }

    return enriched;
  }

  async updateQuestProgress(playerId: number, questType: string, amount: number = 1, isAbsolute: boolean = false): Promise<void> {
    const pQuests = await this.getPlayerQuests(playerId);
    const pendingTypeQuests = pQuests.filter(pq => pq.quest.type === questType && pq.status === 'pending');

    for (const pq of pendingTypeQuests) {
      const newProgress = Math.min(isAbsolute ? amount : pq.progress + amount, pq.quest.target);
      const isCompleted = newProgress >= pq.quest.target;

      await db.update(playerQuests)
        .set({
          progress: newProgress,
          status: isCompleted ? "completed" : "pending",
          completedAt: isCompleted ? new Date() : null
        })
        .where(eq(playerQuests.id, pq.id));

      if (isCompleted) {
        const [player] = await db.select().from(players).where(eq(players.id, playerId));
        if (player) {
          await this.createActivity("quest_completed", player.id, player.gameName, {
            questTitle: pq.quest.title,
            questDifficulty: pq.quest.difficulty
          });
        }
      }
    }
  }

  async claimQuestReward(playerId: number, pqId: number): Promise<{ success: boolean; message: string; points: number; glory: number }> {
    return await db.transaction(async (tx) => {
      const [pq] = await tx.select().from(playerQuests).where(eq(playerQuests.id, pqId));
      if (!pq) throw new Error("Missão não encontrada.");
      if (pq.playerId !== playerId) throw new Error("Não autorizado.");
      if (pq.status !== "completed") throw new Error("Missão ainda não concluída.");

      const [quest] = await tx.select().from(quests).where(eq(quests.id, pq.questId));
      if (!quest) throw new Error("Definição da missão não encontrada.");

      const [player] = await tx.select().from(players).where(eq(players.id, playerId));
      if (!player) throw new Error("Guerreiro não encontrado.");

      // Mark as claimed
      await tx.update(playerQuests)
        .set({ status: "claimed" })
        .where(eq(playerQuests.id, pqId));

      const rewardPoints = quest.points;
      const rewardGlory = quest.glory;

      // Update player
      const newPoints = player.points + rewardPoints;
      const { calculateRank } = await import("@shared/schema");
      const newRank = calculateRank(newPoints);

      await tx.update(players).set({
        points: newPoints,
        rank: newRank,
        gloryPoints: player.gloryPoints + rewardGlory
      }).where(eq(players.id, playerId));

      return {
        success: true,
        message: `Recompensa resgatada! +${rewardPoints} Pontos e +${rewardGlory} Glória.`,
        points: rewardPoints,
        glory: rewardGlory
      };
    });
  }

  async deletePrivateConversation(p1Id: string, p1Zone: string, p2Id: string, p2Zone: string): Promise<void> {
    await db.delete(privateMessages).where(
      or(
        and(
          eq(privateMessages.senderId, p1Id), eq(privateMessages.senderZone, p1Zone),
          eq(privateMessages.receiverId, p2Id), eq(privateMessages.receiverZone, p2Zone)
        ),
        and(
          eq(privateMessages.senderId, p2Id), eq(privateMessages.senderZone, p2Zone),
          eq(privateMessages.receiverId, p1Id), eq(privateMessages.receiverZone, p1Zone)
        )
      )
    );
  }

  // Blocking Methods
  async blockUser(blockerId: string, blockerZone: string, blockedId: string, blockedZone: string): Promise<void> {
    await db.insert(userBlocks).values({
      blockerId, blockerZone, blockedId, blockedZone
    }).onConflictDoNothing();
  }

  async unblockUser(blockerId: string, blockerZone: string, blockedId: string, blockedZone: string): Promise<void> {
    await db.delete(userBlocks).where(
      and(
        eq(userBlocks.blockerId, blockerId), eq(userBlocks.blockerZone, blockerZone),
        eq(userBlocks.blockedId, blockedId), eq(userBlocks.blockedZone, blockedZone)
      )
    );
  }

  async isBlocked(u1Id: string, u1Zone: string, u2Id: string, u2Zone: string): Promise<boolean> {
    const blocks = await db.select().from(userBlocks).where(
      or(
        and(
          eq(userBlocks.blockerId, u1Id), eq(userBlocks.blockerZone, u1Zone),
          eq(userBlocks.blockedId, u2Id), eq(userBlocks.blockedZone, u2Zone)
        ),
        and(
          eq(userBlocks.blockerId, u2Id), eq(userBlocks.blockerZone, u2Zone),
          eq(userBlocks.blockedId, u1Id), eq(userBlocks.blockedZone, u1Zone)
        )
      )
    );
    return blocks.length > 0;
  }

  async getBlocksForPlayer(playerId: string, zoneId: string): Promise<any[]> {
    return await db.select().from(userBlocks).where(
      and(
        eq(userBlocks.blockerId, playerId), eq(userBlocks.blockerZone, zoneId)
      )
    );
  }
}

export const storage = new DatabaseStorage();
