CREATE TABLE `matches` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`winner_id` text NOT NULL,
	`winner_zone_id` text DEFAULT '' NOT NULL,
	`winner_hero` text,
	`loser_id` text NOT NULL,
	`loser_zone_id` text DEFAULT '' NOT NULL,
	`loser_hero` text,
	`proof_image` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `player_rewards` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`player_id` integer NOT NULL,
	`reward_id` integer NOT NULL,
	`assigned_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`expires_at` integer
);
--> statement-breakpoint
CREATE TABLE `players` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`game_name` text NOT NULL,
	`account_id` text NOT NULL,
	`zone_id` text DEFAULT '' NOT NULL,
	`points` integer DEFAULT 100 NOT NULL,
	`wins` integer DEFAULT 0 NOT NULL,
	`losses` integer DEFAULT 0 NOT NULL,
	`rank` text DEFAULT 'Recruta' NOT NULL,
	`avatar` text,
	`current_rank` text,
	`streak` integer DEFAULT 0 NOT NULL,
	`bio` text,
	`twitch` text,
	`instagram` text,
	`youtube` text,
	`main_hero` text
);
--> statement-breakpoint
CREATE TABLE `rewards` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`rarity` text NOT NULL,
	`icon` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `seasons` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`champion_name` text,
	`champion_account_id` text,
	`champion_zone_id` text,
	`second_name` text,
	`third_name` text,
	`ended_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);