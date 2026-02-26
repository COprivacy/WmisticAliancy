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
});

export const matches = sqliteTable("matches", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  winnerId: text("winner_id").notNull(),
  winnerZone: text("winner_zone_id").notNull().default(""),
  loserId: text("loser_id").notNull(),
  loserZone: text("loser_zone_id").notNull().default(""),
  proofImage: text("proof_image"), // URL to the screenshot proof
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const rewards = sqliteTable("rewards", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  rarity: text("rarity").notNull(), // mythic, legendary, epic, rare
  icon: text("icon").notNull(),
});

export const playerRewards = sqliteTable("player_rewards", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  playerId: integer("player_id").notNull(),
  rewardId: integer("reward_id").notNull(),
  assignedAt: integer("assigned_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  expiresAt: integer("expires_at", { mode: "timestamp" }), // Null means permanent
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


