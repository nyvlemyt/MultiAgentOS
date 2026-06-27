ALTER TABLE `memory_candidates` ADD `source_key` text;--> statement-breakpoint
ALTER TABLE `memory_candidates` ADD `trust` text;--> statement-breakpoint
CREATE INDEX `memory_candidates_source_key_idx` ON `memory_candidates` (`source_key`);