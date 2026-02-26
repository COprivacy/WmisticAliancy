import { users, players, matches, type User, type InsertUser, type Player, type InsertPlayer, type Match, type InsertMatch } from "@shared/schema";
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
}

export class DatabaseStorage implements IStorage {
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
}

export const storage = new DatabaseStorage();

