ALTER TABLE `conversations` ADD `mission_id` text REFERENCES missions(id);--> statement-breakpoint
CREATE INDEX `conversations_mission_idx` ON `conversations` (`scope`,`project_id`,`mission_id`);