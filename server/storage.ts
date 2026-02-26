import { users, players, matches, rewards, playerRewards, type User, type InsertUser, type Player, type InsertPlayer, type Match, type InsertMatch, type Reward, type InsertReward } from "@shared/schema";
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

  // Search
  searchPlayers(query: string): Promise<Player[]>;

  // Reward methods
  getRewards(): Promise<Reward[]>;
  createReward(reward: InsertReward): Promise<Reward>;
  assignReward(playerId: number, rewardId: number): Promise<void>;
  getPlayerRewards(playerId: number): Promise<Reward[]>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.seedRewards();
  }

  async seedRewards() {
    try {
      const existing = await this.getRewards();
      if (existing.length === 0) {
        const initialRewards = [
          { name: "Espada Suprema da Aliança", description: "Campeão absoluto da temporada (Top 1).", rarity: "mythic", icon: "/images/rewards/mythic-sword.png" },
          { name: "Cajado do Arcanista", description: "Top 3 da arena por 3 temporadas seguidas.", rarity: "legendary", icon: "/images/rewards/legendary-staff.png" },
          { name: "Asas da Vitória", description: "Mais de 100 vitórias na temporada.", rarity: "epic", icon: "/images/rewards/epic-wings.png" },
          { name: "Medalha de Honra", description: "Participação em mais de 50 duelos.", rarity: "rare", icon: "/images/rewards/rare-medal.png" }
        ];
        for (const reward of initialRewards) {
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
    return player;
  }

  async getPlayerByAccountId(accountId: string, zoneId: string): Promise<Player | undefined> {
    const [player] = await db.select().from(players)
      .where(and(eq(players.accountId, accountId), eq(players.zoneId, zoneId)));
    return player;
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const [player] = await db.insert(players).values(insertPlayer).returning();
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
    const [match] = await db.insert(matches).values(insertMatch).returning();
    return match;
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

  async getRewards(): Promise<Reward[]> {
    return await db.select().from(rewards);
  }

  async createReward(insertReward: InsertReward): Promise<Reward> {
    const [reward] = await db.insert(rewards).values(insertReward).returning();
    return reward;
  }

  async assignReward(playerId: number, rewardId: number): Promise<void> {
    await db.insert(playerRewards).values({ playerId, rewardId });
  }

  async getPlayerRewards(playerId: number): Promise<Reward[]> {
    const results = await db.select({
      reward: rewards
    }).from(playerRewards)
      .innerJoin(rewards, eq(playerRewards.rewardId, rewards.id))
      .where(eq(playerRewards.playerId, playerId));

    return results.map(r => r.reward);
  }
}

export const storage = new DatabaseStorage();
