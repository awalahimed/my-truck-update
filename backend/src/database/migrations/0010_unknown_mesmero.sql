CREATE TABLE `assistance_verification` (
	`id` varchar(36) NOT NULL,
	`order_id` varchar(36) NOT NULL,
	`assisting_agent_id` varchar(36) NOT NULL,
	`verified_by_id` varchar(36),
	`verification_status` varchar(20) NOT NULL DEFAULT 'pending',
	`verification_notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assistance_verification_id` PRIMARY KEY(`id`),
	CONSTRAINT `assistance_verification_order_id_unique` UNIQUE(`order_id`)
);
--> statement-breakpoint
CREATE TABLE `commission_history` (
	`id` varchar(36) NOT NULL,
	`agent_id` varchar(36) NOT NULL,
	`subject_id` varchar(36) NOT NULL,
	`order_id` varchar(36) NOT NULL,
	`commission_type` varchar(20) NOT NULL,
	`base_amount` decimal(10,2) NOT NULL,
	`rate_applied` decimal(5,4) NOT NULL,
	`payout_amount` decimal(10,2) NOT NULL,
	`stage_index` int NOT NULL,
	`is_assisted` boolean NOT NULL DEFAULT false,
	`anti_abuse_flag` boolean NOT NULL DEFAULT false,
	`flag_reason` text,
	`status` varchar(20) NOT NULL DEFAULT 'pending',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `commission_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `user` ADD `registered_by_agent_id` varchar(36);--> statement-breakpoint
ALTER TABLE `user` ADD `user_cycle_count` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `user_lifetime_earnings` decimal(10,2) DEFAULT '0.00' NOT NULL;--> statement-breakpoint
ALTER TABLE `vehicle` ADD `registered_by_agent_id` varchar(36);--> statement-breakpoint
ALTER TABLE `vehicle` ADD `driver_cycle_count` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `vehicle` ADD `driver_lifetime_earnings` decimal(10,2) DEFAULT '0.00' NOT NULL;--> statement-breakpoint
ALTER TABLE `assistance_verification` ADD CONSTRAINT `assistance_verification_order_id_order_id_fk` FOREIGN KEY (`order_id`) REFERENCES `order`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assistance_verification` ADD CONSTRAINT `assistance_verification_assisting_agent_id_user_id_fk` FOREIGN KEY (`assisting_agent_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assistance_verification` ADD CONSTRAINT `assistance_verification_verified_by_id_user_id_fk` FOREIGN KEY (`verified_by_id`) REFERENCES `user`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `commission_history` ADD CONSTRAINT `commission_history_agent_id_user_id_fk` FOREIGN KEY (`agent_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `commission_history` ADD CONSTRAINT `commission_history_order_id_order_id_fk` FOREIGN KEY (`order_id`) REFERENCES `order`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user` ADD CONSTRAINT `user_registered_by_agent_id_user_id_fk` FOREIGN KEY (`registered_by_agent_id`) REFERENCES `user`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vehicle` ADD CONSTRAINT `vehicle_registered_by_agent_id_user_id_fk` FOREIGN KEY (`registered_by_agent_id`) REFERENCES `user`(`id`) ON DELETE set null ON UPDATE no action;