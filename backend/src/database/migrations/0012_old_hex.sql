ALTER TABLE `agent_profile` ADD `tier` varchar(20) DEFAULT 'bronze' NOT NULL;--> statement-breakpoint
ALTER TABLE `agent_profile` ADD `tier_earned_at` timestamp(3);--> statement-breakpoint
ALTER TABLE `agent_profile` ADD `tier_checked_at` timestamp(3);