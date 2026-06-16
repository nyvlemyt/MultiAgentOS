CREATE TABLE `reports` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`mission_id` text,
	`task_id` text,
	`agent_id` text,
	`kind` text DEFAULT 'task' NOT NULL,
	`title` text NOT NULL,
	`human_md` text DEFAULT '' NOT NULL,
	`ai` text DEFAULT '{}' NOT NULL,
	`diff` text DEFAULT '' NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `reports_project_idx` ON `reports` (`project_id`,`createdAt`);--> statement-breakpoint
CREATE INDEX `reports_mission_idx` ON `reports` (`mission_id`);