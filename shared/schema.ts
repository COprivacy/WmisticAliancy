import { sql } from "drizzle-orm";
import { pgTable, text, integer, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  gameName: text("game_name").notNull(),
  accountId: text("account_id").notNull(),
  zoneId: text("zone_id").notNull().default(""),
  points: integer("points").notNull().default(100),
  wins: integer("wins").notNull().default(0),
  losses: integer("losses").notNull().default(0),
  rank: text("rank").notNull().default("Recruta"),
  avatar: text("avatar"),
  currentRank: text("current_rank"),
  streak: integer("streak").notNull().default(0),
  bio: text("bio"),
  twitch: text("twitch"),
  instagram: text("instagram"),
  youtube: text("youtube"),
  mainHero: text("main_hero"),
  isBanned: boolean("is_banned").notNull().default(false),
  pin: text("pin"),
  lastClaimedAt: timestamp("last_claimed_at"),
  gloryPoints: integer("glory_points").notNull().default(0),
  activeFrame: text("active_frame"),
  activeBackground: text("active_background"),
  activeMusic: text("active_music"),
  activeNameColor: text("active_name_color"), // Hex or CSS class
  activeNameEffect: text("active_name_effect"), // CSS animation class
  activeNameFont: text("active_name_font"), // Font family or class
  arenaTickets: integer("arena_tickets").notNull().default(5),
  lastTicketResetAt: timestamp("last_ticket_reset_at"),
});

export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  winnerId: text("winner_id").notNull(),
  winnerZone: text("winner_zone_id").notNull().default(""),
  winnerHero: text("winner_hero"),
  loserId: text("loser_id").notNull(),
  loserZone: text("loser_zone_id").notNull().default(""),
  loserHero: text("loser_hero"),
  proofImage: text("proof_image"),
  status: text("status").notNull().default("pending"),
  aiStatus: text("ai_status").default("none"), // none, processing, success, failed, inconclusive
  aiAnalysis: text("ai_analysis"), // JSON string of results
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const rewards = pgTable("rewards", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  rarity: text("rarity").notNull(),
  stars: integer("stars").notNull().default(1),
  icon: text("icon").notNull(),
  effect: text("effect"),
  isRankPrize: boolean("is_rank_prize").notNull().default(false),
  price: integer("price").notNull().default(0),
  isAvailableInStore: boolean("is_available_in_store").notNull().default(true),
  type: text("type").notNull().default("relic"), // relic, frame, background, music
});

export const playerRewards = pgTable("player_rewards", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull(),
  rewardId: integer("reward_id").notNull(),
  assignedAt: timestamp("assigned_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"),
});

export const seasons = pgTable("seasons", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  championName: text("champion_name"),
  championId: text("champion_account_id"),
  championZone: text("champion_zone_id"),
  secondName: text("second_name"),
  thirdName: text("third_name"),
  endedAt: timestamp("ended_at").notNull(),
});

export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  challengerId: text("challenger_id").notNull(),
  challengerZone: text("challenger_zone_id").notNull(),
  challengedId: text("challenged_id").notNull(),
  challengedZone: text("challenged_zone_id").notNull(),
  status: text("status").notNull().default("pending"),
  message: text("message"),
  scheduledAt: timestamp("scheduled_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  playerId: integer("player_id"),
  playerGameName: text("player_game_name"),
  data: text("data"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const configs = pgTable("configs", {
  key: text("key").primaryKey(),
  value: text("value").notNull(), // stringified JSON
});

export const reactions = pgTable("reactions", {
  id: serial("id").primaryKey(),
  activityId: integer("activity_id").notNull(),
  userId: text("user_id").notNull(),
  emoji: text("emoji").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  sid: text("sid").primaryKey(),
  sess: text("sess").notNull(), // json stringified
  expire: timestamp("expire").notNull(),
});

export const globalMessages = pgTable("global_messages", {
  id: serial("id").primaryKey(),
  authorId: text("author_id").notNull(),
  authorName: text("author_name").notNull(),
  authorAvatar: text("author_avatar"),
  authorFrame: text("author_frame"),
  authorRank: text("author_rank"),
  authorNameColor: text("author_name_color"),
  authorNameEffect: text("author_name_effect"),
  authorNameFont: text("author_name_font"),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const privateMessages = pgTable("private_messages", {
  id: serial("id").primaryKey(),
  senderId: text("sender_id").notNull(),
  senderZone: text("sender_zone").notNull(),
  receiverId: text("receiver_id").notNull(),
  receiverZone: text("receiver_zone").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  isRead: boolean("is_read").notNull().default(false),
});

export const gloryTopups = pgTable("glory_topups", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull(),
  amount: integer("amount").notNull(), // points amount
  price: integer("price").notNull(), // cents
  status: text("status").notNull().default("pending"), // pending, completed, rejected
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const quests = pgTable("quests", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  difficulty: text("difficulty").notNull(), // easy, medium, hard, epic
  points: integer("points").notNull(), // rank points
  glory: integer("glory").notNull().default(0), // optional glory points reward
  type: text("type").notNull(), // matches, wins, streak, daily_claim
  target: integer("target").notNull(),
});

export const playerQuests = pgTable("player_quests", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull(),
  questId: integer("quest_id").notNull(),
  progress: integer("progress").notNull().default(0),
  status: text("status").notNull().default("pending"), // pending, completed, claimed
  lastResetAt: timestamp("last_reset_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertPlayerSchema = createInsertSchema(players, {
  accountId: z.string().trim(),
  zoneId: z.string().trim(),
}).omit({
  id: true,
});

export const insertMatchSchema = createInsertSchema(matches, {
  winnerId: z.string().trim(),
  winnerZone: z.string().trim(),
  loserId: z.string().trim(),
  loserZone: z.string().trim(),
}).omit({
  id: true,
  status: true,
  createdAt: true,
});

export const insertChallengeSchema = createInsertSchema(challenges, {
  challengerId: z.string().trim(),
  challengerZone: z.string().trim(),
  challengedId: z.string().trim(),
  challengedZone: z.string().trim(),
  scheduledAt: z.preprocess((val) => (val === "" ? undefined : val), z.string().or(z.date()).optional()),
}).omit({
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
export type Config = typeof configs.$inferSelect;
export type InsertConfig = typeof configs.$inferInsert;
export type Activity = typeof activities.$inferSelect;
export type Reaction = typeof reactions.$inferSelect;
export type GlobalMessage = typeof globalMessages.$inferSelect;
export type PrivateMessage = typeof privateMessages.$inferSelect;
export type GloryTopup = typeof gloryTopups.$inferSelect;
export const insertGloryTopupSchema = createInsertSchema(gloryTopups).omit({ id: true, createdAt: true });
export type InsertGloryTopup = z.infer<typeof insertGloryTopupSchema>;

export type Quest = typeof quests.$inferSelect;
export type PlayerQuest = typeof playerQuests.$inferSelect;
export const insertQuestSchema = createInsertSchema(quests).omit({ id: true });
export type InsertQuest = z.infer<typeof insertQuestSchema>;

export function calculateRank(points: number): string {
  if (points >= 2000) return "Grande Mestre";
  if (points >= 1000) return "Mestre";
  if (points >= 600) return "Elite";
  if (points >= 300) return "Guerreiro";
  if (points >= 100) return "Soldado";
  return "Recruta";
}
