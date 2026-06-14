CREATE TABLE `schedules` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`kind` text DEFAULT 'autopilot' NOT NULL,
	`window_start` text NOT NULL,
	`window_end` text NOT NULL,
	`days_json` text DEFAULT '[0,1,2,3,4,5,6]' NOT NULL,
	`max_risk` text DEFAULT 'low' NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`last_run_at` integer,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `schedules_project_idx` ON `schedules` (`project_id`,`enabled`);