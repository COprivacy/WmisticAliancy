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
  zoneId: text("zone_id").notNull(),
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
  winnerZone: text("winner_zone_id").notNull(),
  loserId: text("loser_id").notNull(),
  loserZone: text("loser_zone_id").notNull(),
  proofImage: text("proof_image"), // URL to the screenshot proof
  status: text("status").notNull().default("pending"), // pending, approved, rejected
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


