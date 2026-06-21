CREATE TABLE `agent_overrides` (
	`id` text PRIMARY KEY NOT NULL,
	`agent_id` text NOT NULL,
	`project_id` text NOT NULL,
	`model` text,
	`autonomy` text,
	`budget_cap` integer,
	`effort_mode` text,
	`enabled_skills` text,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `agent_overrides_agent_project_unq` ON `agent_overrides` (`agent_id`,`project_id`);--> statement-breakpoint
CREATE TABLE `fiche_revisions` (
	`id` text PRIMARY KEY NOT NULL,
	`agent_id` text NOT NULL,
	`content` text NOT NULL,
	`summary` text NOT NULL,
	`savedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `fiche_revisions_agent_idx` ON `fiche_revisions` (`agent_id`,`savedAt`);