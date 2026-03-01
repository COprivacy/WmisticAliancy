import {
  users, players, matches, rewards, playerRewards, seasons, challenges, activities, reactions, configs, globalMessages, gloryTopups,
  type User, type InsertUser, type Player, type InsertPlayer, type Match, type InsertMatch,
  type Reward, type InsertReward, type Config, type InsertConfig, type Activity, type Reaction,
  type GlobalMessage, type GloryTopup, type InsertGloryTopup
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Player methods
  getPlayers(): Promise<Player[]>;
  getPlayer(id: number): Promise<Player | undefined>;
  getPlayerByAccountId(accountId: string, zoneId: string): Promise<Player | undefined>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  updatePlayer(id: number, update: Partial<Player>): Promise<Player>;

  // Match methods
  getPendingMatches(): Promise<(Match & { winnerName: string; loserName: string })[]>;
  createMatch(match: InsertMatch): Promise<Match>;
  updateMatchStatus(id: number, status: string): Promise<Match>;
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
  updateChallengeStatus(id: number, status: string): Promise<void>;

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

      for (const reward of initialRewards) {
        const alreadyExists = existing.find(r => r.name === reward.name);
        if (!alreadyExists) {
          console.log(`SEED: Creating reward ${reward.name}`);
          await this.createReward(reward);
        } else if (alreadyExists.price !== reward.price || alreadyExists.isAvailableInStore !== reward.isAvailableInStore) {
          console.log(`SEED: Updating reward ${reward.name} (Price: ${alreadyExists.price} -> ${reward.price})`);
          await this.updateReward(alreadyExists.id, {
            price: reward.price,
            isAvailableInStore: reward.isAvailableInStore
          });
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
    return player;
  }

  async getPlayerByAccountId(accountId: string, zoneId: string): Promise<Player | undefined> {
    const [player] = await db.select().from(players)
      .where(and(eq(players.accountId, accountId), eq(players.zoneId, zoneId)));
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

  async searchPlayers(query: string): Promise<Player[]> {
    return await db.select().from(players).where(sql`${players.gameName} LIKE ${`%${query}%`}`);
  }

  async getPendingMatches(): Promise<(Match & { winnerName: string; loserName: string })[]> {
    const pending = await db.select().from(matches)
      .where(eq(matches.status, "pending"))
      .orderBy(sql`${matches.createdAt} DESC`);

    const playersList = await this.getPlayers();

    return pending.map(m => {
      const winner = playersList.find(p => p.accountId === m.winnerId && p.zoneId === m.winnerZone);
      const loser = playersList.find(p => p.accountId === m.loserId && p.zoneId === m.loserZone);
      return {
        ...m,
        winnerName: winner?.gameName || "Soldado Desconhecido",
        loserName: loser?.gameName || "Soldado Desconhecido"
      };
    });
  }

  async createMatch(insertMatch: InsertMatch): Promise<Match> {
    const [match] = await db.insert(matches).values({
      ...insertMatch,
      createdAt: new Date()
    }).returning();
    return match;
  }

  async updateMatchStatus(id: number, status: string): Promise<Match> {
    const [match] = await db.update(matches).set({ status }).where(eq(matches.id, id)).returning();
    if (!match) throw new Error("Match not found");

    if (status === "approved") {
      const winner = await this.getPlayerByAccountId(match.winnerId, match.winnerZone);
      if (winner) {
        // Award 15 Glory Points for a win
        await this.awardGloryPoints(winner.id, 15);
      }
    }
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

  async getPlayerRewards(playerId: number): Promise<Reward[]> {
    const results = await db.select({
      reward: rewards
    }).from(playerRewards)
      .innerJoin(rewards, eq(playerRewards.rewardId, rewards.id))
      .where(eq(playerRewards.playerId, playerId));

    return results.map(r => r.reward);
  }

  async purchaseReward(playerId: number, rewardId: number): Promise<void> {
    const [player] = await db.select().from(players).where(eq(players.id, playerId));
    const [reward] = await db.select().from(rewards).where(eq(rewards.id, rewardId));

    if (!player || !reward) throw new Error("Player or Reward not found");
    if (player.gloryPoints < reward.price) throw new Error("Saldo de Glória insuficiente");

    // Process payment and assignment in a transaction if possible, or sequential
    await db.update(players).set({
      gloryPoints: player.gloryPoints - reward.price
    }).where(eq(players.id, playerId));

    await this.assignReward(playerId, rewardId);

    // Log Activity
    await this.createActivity("reward_purchased", player.id, player.gameName, {
      rewardName: reward.name,
      rewardIcon: reward.icon,
      price: reward.price
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
    const [topup] = await db.select().from(gloryTopups).where(eq(gloryTopups.id, id));
    if (!topup) throw new Error("Top-up request not found");

    if (status === "completed" && topup.status !== "completed") {
      await this.awardGloryPoints(topup.playerId, topup.amount);
      const [player] = await db.select().from(players).where(eq(players.id, topup.playerId));
      if (player) {
        await this.createActivity("glory_purchase_completed", player.id, player.gameName, {
          amount: topup.amount
        });
      }
    }

    const [updated] = await db.update(gloryTopups).set({ status }).where(eq(gloryTopups.id, id)).returning();
    return updated;
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
    return await db.select().from(challenges)
      .where(
        sql`(${challenges.challengerId} = ${accountId} AND ${challenges.challengerZone} = ${zoneId}) OR (${challenges.challengedId} = ${accountId} AND ${challenges.challengedZone} = ${zoneId})`
      )
      .orderBy(sql`${challenges.createdAt} DESC`);
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
        challengedAvatar: challenged?.avatar
      };
    }));
    return enriched;
  }

  async updateChallengeStatus(id: number, status: string): Promise<void> {
    await db.update(challenges).set({ status }).where(eq(challenges.id, id));
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
          authorZoneId: player.zoneId
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
}

export const storage = new DatabaseStorage();
