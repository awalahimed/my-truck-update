CREATE TABLE `agent_profile` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`national_id` varchar(100),
	`gender` varchar(20),
	`agent_type` varchar(50),
	`assigned_city` varchar(100),
	`assigned_town` varchar(100),
	`assigned_town_manager` varchar(100),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `agent_profile_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `agent_profile` ADD CONSTRAINT `agent_profile_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;