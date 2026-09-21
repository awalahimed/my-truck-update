CREATE TABLE `referral` (
	`id` varchar(36) NOT NULL,
	`referrer_id` varchar(36) NOT NULL,
	`referee_id` varchar(36) NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'pending',
	`referrer_reward` decimal(10,2),
	`referee_reward` decimal(10,2),
	`referrer_reward_claimed` boolean NOT NULL DEFAULT false,
	`referee_reward_claimed` boolean NOT NULL DEFAULT false,
	`first_order_id` varchar(36),
	`completed_at` timestamp(3),
	`expires_at` timestamp(3),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `referral_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `referral_config` (
	`id` varchar(36) NOT NULL,
	`referrer_reward_amount` decimal(10,2) NOT NULL DEFAULT '50.00',
	`referee_reward_amount` decimal(10,2) NOT NULL DEFAULT '25.00',
	`min_order_amount` decimal(10,2) NOT NULL DEFAULT '100.00',
	`expiry_days` int NOT NULL DEFAULT 30,
	`enabled` boolean NOT NULL DEFAULT true,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `referral_config_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `user` ADD `referral_code` varchar(10);--> statement-breakpoint
ALTER TABLE `user` ADD `referred_by` varchar(36);--> statement-breakpoint
ALTER TABLE `user` ADD `referral_reward_claimed` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `user` ADD `referral_count` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `user` ADD CONSTRAINT `user_referral_code_unique` UNIQUE(`referral_code`);--> statement-breakpoint
ALTER TABLE `referral` ADD CONSTRAINT `referral_referrer_id_user_id_fk` FOREIGN KEY (`referrer_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `referral` ADD CONSTRAINT `referral_referee_id_user_id_fk` FOREIGN KEY (`referee_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `referral` ADD CONSTRAINT `referral_first_order_id_order_id_fk` FOREIGN KEY (`first_order_id`) REFERENCES `order`(`id`) ON DELETE no action ON UPDATE no action;