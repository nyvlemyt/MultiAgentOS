CREATE TABLE `agents` (
	`id` text PRIMARY KEY NOT NULL,
	`tier` text NOT NULL,
	`fiche_path` text NOT NULL,
	`name` text NOT NULL,
	`emoji` text,
	`avatar_path` text,
	`model` text DEFAULT 'claude-haiku-4-5' NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`total_runs` integer DEFAULT 0 NOT NULL,
	`total_tokens` integer DEFAULT 0 NOT NULL,
	`success_rate` real DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `budgets` (
	`id` text PRIMARY KEY NOT NULL,
	`scope` text NOT NULL,
	`scope_id` text,
	`period` text NOT NULL,
	`tokens_cap` integer NOT NULL,
	`tokens_spent` integer DEFAULT 0 NOT NULL,
	`money_cap_cents` integer DEFAULT 0 NOT NULL,
	`money_spent_cents` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `context_packs` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`path` text NOT NULL,
	`generatedAt` integer NOT NULL,
	`token_size` integer DEFAULT 0 NOT NULL,
	`file_count` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`mission_id` text,
	`task_id` text,
	`agent_id` text,
	`type` text NOT NULL,
	`payload_json` text DEFAULT '{}' NOT NULL,
	`tokens_in` integer DEFAULT 0 NOT NULL,
	`tokens_out` integer DEFAULT 0 NOT NULL,
	`cache_read` integer DEFAULT 0 NOT NULL,
	`cache_creation` integer DEFAULT 0 NOT NULL,
	`cost_cents` integer DEFAULT 0 NOT NULL,
	`risk` text DEFAULT 'low' NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`mission_id`) REFERENCES `missions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `events_mission_idx` ON `events` (`mission_id`,`createdAt`);--> statement-breakpoint
CREATE INDEX `events_agent_idx` ON `events` (`agent_id`,`createdAt`);--> statement-breakpoint
CREATE TABLE `memory_candidates` (
	`id` text PRIMARY KEY NOT NULL,
	`source_task_id` text,
	`type` text NOT NULL,
	`body` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`source_task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `memory_items` (
	`id` text PRIMARY KEY NOT NULL,
	`scope` text NOT NULL,
	`project_id` text,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`source_mission_id` text,
	`accepted` integer DEFAULT true NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`source_mission_id`) REFERENCES `missions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `missions` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`title` text NOT NULL,
	`objective` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`risk` text DEFAULT 'low' NOT NULL,
	`budget_tokens` integer DEFAULT 20000 NOT NULL,
	`spent_tokens` integer DEFAULT 0 NOT NULL,
	`autonomy_override` text,
	`mode_override` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `missions_status_idx` ON `missions` (`project_id`,`status`);--> statement-breakpoint
CREATE TABLE `permissions` (
	`id` text PRIMARY KEY NOT NULL,
	`category` text NOT NULL,
	`action` text NOT NULL,
	`risk` text NOT NULL,
	`allow_list_json` text DEFAULT '[]' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `project_links` (
	`project_id` text NOT NULL,
	`kind` text NOT NULL,
	`ref_id` text NOT NULL,
	`pinned` integer DEFAULT false NOT NULL,
	`weight` real DEFAULT 1 NOT NULL,
	PRIMARY KEY(`project_id`, `kind`, `ref_id`),
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`path` text NOT NULL,
	`type` text NOT NULL,
	`stack_json` text DEFAULT '[]' NOT NULL,
	`autonomy` text DEFAULT 'manual' NOT NULL,
	`default_model` text DEFAULT 'claude-haiku-4-5' NOT NULL,
	`default_mode` text DEFAULT 'eco' NOT NULL,
	`monthly_budget_cents` integer DEFAULT 500 NOT NULL,
	`createdAt` integer NOT NULL,
	`lastActiveAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `projects_slug_unique` ON `projects` (`slug`);--> statement-breakpoint
CREATE TABLE `skills` (
	`id` text PRIMARY KEY NOT NULL,
	`source` text NOT NULL,
	`path` text NOT NULL,
	`summary_path` text,
	`tags_json` text DEFAULT '[]' NOT NULL,
	`tier` text DEFAULT 'on-demand' NOT NULL,
	`auto_load` integer DEFAULT false NOT NULL,
	`lastUsedAt` integer
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`mission_id` text NOT NULL,
	`parent_task_id` text,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'todo' NOT NULL,
	`risk` text DEFAULT 'low' NOT NULL,
	`agent_id` text,
	`skills_json` text DEFAULT '[]' NOT NULL,
	`depends_on_json` text DEFAULT '[]' NOT NULL,
	`budget_tokens` integer DEFAULT 2000 NOT NULL,
	`spent_tokens` integer DEFAULT 0 NOT NULL,
	`output_path` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`mission_id`) REFERENCES `missions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `tasks_mission_status_idx` ON `tasks` (`mission_id`,`status`);--> statement-breakpoint
CREATE TABLE `validations` (
	`id` text PRIMARY KEY NOT NULL,
	`task_id` text NOT NULL,
	`requested_by_agent` text NOT NULL,
	`action_summary` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`decidedAt` integer,
	`decided_by_user` text,
	`payload_json` text DEFAULT '{}' NOT NULL,
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE cascade
);
