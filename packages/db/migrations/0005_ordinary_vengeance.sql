CREATE TABLE `decisions` (
	`id` text PRIMARY KEY NOT NULL,
	`scope` text DEFAULT 'global' NOT NULL,
	`project_id` text,
	`source` text DEFAULT 'user' NOT NULL,
	`source_mission_id` text,
	`source_task_id` text,
	`title` text NOT NULL,
	`body` text DEFAULT '' NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`source_mission_id`) REFERENCES `missions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`source_task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `ideas` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`body` text DEFAULT '' NOT NULL,
	`scope` text DEFAULT 'global' NOT NULL,
	`project_id` text,
	`status` text DEFAULT 'inbox' NOT NULL,
	`priority_score` integer DEFAULT 0 NOT NULL,
	`impact` integer DEFAULT 50 NOT NULL,
	`urgency` integer DEFAULT 50 NOT NULL,
	`effort_est` integer DEFAULT 50 NOT NULL,
	`risk_score` integer DEFAULT 0 NOT NULL,
	`cost_est_tokens` integer DEFAULT 0 NOT NULL,
	`source_dossier` text,
	`idea_id_link` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`idea_id_link`) REFERENCES `missions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `ideas_status_idx` ON `ideas` (`status`);--> statement-breakpoint
ALTER TABLE `missions` ADD `deadline` integer;--> statement-breakpoint
ALTER TABLE `missions` ADD `milestone` text;--> statement-breakpoint
ALTER TABLE `missions` ADD `priority_score` integer DEFAULT 0 NOT NULL;