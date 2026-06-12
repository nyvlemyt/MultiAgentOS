ALTER TABLE `memory_candidates` ADD `source_kind` text;--> statement-breakpoint
ALTER TABLE `memory_candidates` ADD `dossier_path` text;--> statement-breakpoint
ALTER TABLE `memory_candidates` ADD `classifier_decision` text;--> statement-breakpoint
ALTER TABLE `memory_candidates` ADD `auto_filed` integer DEFAULT false NOT NULL;