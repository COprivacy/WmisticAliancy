import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const players = sqliteTable("players", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  gameName: text("game_name").notNull(),
  accountId: text("account_id").notNull(),
  zoneId: text("zone_id").notNull().default(""),
  points: integer("points").notNull().default(100), // Start with 100 points
  wins: integer("wins").notNull().default(0),
  losses: integer("losses").notNull().default(0),
  rank: text("rank").notNull().default("Recruta"),
  avatar: text("avatar"), // Link to MLBB Avatar
  currentRank: text("current_rank"), // Link to MLBB Real Rank (Mythic, etc)
  streak: integer("streak").notNull().default(0),
  // New social and bio fields
  bio: text("bio"),
  twitch: text("twitch"),
  instagram: text("instagram"),
  youtube: text("youtube"),
  mainHero: text("main_hero"),
  isBanned: integer("is_banned", { mode: "boolean" }).notNull().default(false),
  pin: text("pin"),
  lastClaimedAt: integer("last_claimed_at", { mode: "timestamp" }),
});

export const matches = sqliteTable("matches", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  winnerId: text("winner_id").notNull(),
  winnerZone: text("winner_zone_id").notNull().default(""),
  winnerHero: text("winner_hero"), // Hero used by winner
  loserId: text("loser_id").notNull(),
  loserZone: text("loser_zone_id").notNull().default(""),
  loserHero: text("loser_hero"), // Hero used by loser
  proofImage: text("proof_image"), // URL to the screenshot proof
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const rewards = sqliteTable("rewards", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  rarity: text("rarity").notNull(), // mythic, legendary, epic, rare
  stars: integer("stars").notNull().default(1),
  icon: text("icon").notNull(),
});

export const playerRewards = sqliteTable("player_rewards", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  playerId: integer("player_id").notNull(),
  rewardId: integer("reward_id").notNull(),
  assignedAt: integer("assigned_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now') * 1000)`),
  expiresAt: integer("expires_at", { mode: "timestamp" }), // Null means permanent
});

export const seasons = sqliteTable("seasons", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  championName: text("champion_name"),
  championId: text("champion_account_id"),
  championZone: text("champion_zone_id"),
  secondName: text("second_name"),
  thirdName: text("third_name"),
  endedAt: integer("ended_at", { mode: "timestamp" }).notNull(),
});

export const challenges = sqliteTable("challenges", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  challengerId: text("challenger_id").notNull(),
  challengerZone: text("challenger_zone_id").notNull(),
  challengedId: text("challenged_id").notNull(),
  challengedZone: text("challenged_zone_id").notNull(),
  status: text("status").notNull().default("pending"), // pending, accepted, rejected, completed
  message: text("message"),
  scheduledAt: integer("scheduled_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const activities = sqliteTable("activities", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type").notNull(), // match_approved, rank_up, reward_earned, new_player
  playerId: integer("player_id"),
  playerGameName: text("player_game_name"),
  data: text("data"), // JSON string with extra info (opponent, reward name, rank name)
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const reactions = sqliteTable("reactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  activityId: integer("activity_id").notNull(),
  userId: text("user_id").notNull(),
  emoji: text("emoji").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertPlayerSchema = createInsertSchema(players).omit({
  id: true,
});

export const insertMatchSchema = createInsertSchema(matches).omit({
  id: true,
  status: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Match = typeof matches.$inferSelect;

export const insertRewardSchema = createInsertSchema(rewards).omit({ id: true });
export type InsertReward = z.infer<typeof insertRewardSchema>;
export type Reward = typeof rewards.$inferSelect;
export type PlayerReward = typeof playerRewards.$inferSelect;

export function calculateRank(points: number): string {
  if (points >= 2000) return "Grande Mestre";
  if (points >= 1000) return "Mestre";
  if (points >= 600) return "Elite";
  if (points >= 300) return "Guerreiro";
  if (points >= 100) return "Soldado";
  return "Recruta";
}
