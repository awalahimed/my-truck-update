CREATE TABLE `manager_action_log` (
	`id` varchar(36) NOT NULL,
	`manager_id` varchar(36) NOT NULL,
	`action_type` varchar(50) NOT NULL,
	`target_agent_id` varchar(36),
	`description` text,
	`metadata` json,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `manager_action_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `manager_compensation` (
	`id` varchar(36) NOT NULL,
	`manager_id` varchar(36) NOT NULL,
	`type` varchar(50) NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`source_agent_id` varchar(36),
	`reference_id` varchar(36),
	`month` varchar(7),
	`status` varchar(20) DEFAULT 'pending',
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `manager_compensation_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `manager_fraud_alert` (
	`id` varchar(36) NOT NULL,
	`manager_id` varchar(36) NOT NULL,
	`agent_id` varchar(36) NOT NULL,
	`alert_type` varchar(50) NOT NULL,
	`severity` varchar(20) NOT NULL,
	`description` text NOT NULL,
	`status` varchar(20) DEFAULT 'open',
	`resolution` text,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `manager_fraud_alert_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `territory` (
	`id` varchar(36) NOT NULL,
	`manager_id` varchar(36) NOT NULL,
	`agent_id` varchar(36) NOT NULL,
	`area_name` varchar(100) NOT NULL,
	`status` varchar(20) DEFAULT 'active',
	`assigned_date` timestamp(3) NOT NULL DEFAULT (now()),
	`suspended_date` timestamp(3),
	`suspension_reason` text,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `territory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `town_manager` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`town_name` varchar(100) NOT NULL,
	`city_name` varchar(100) NOT NULL,
	`region` varchar(100) NOT NULL,
	`status` varchar(20) DEFAULT 'active',
	`total_agents` int DEFAULT 0,
	`regional_revenue` decimal(15,2) DEFAULT '0',
	`city_ranking` int,
	`latitude` varchar(50),
	`longitude` varchar(50),
	`contact_phone` varchar(20),
	`contact_email` varchar(100),
	`approval_status` varchar(20) DEFAULT 'pending',
	`approved_by` varchar(36),
	`notes` text,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `town_manager_id` PRIMARY KEY(`id`),
	CONSTRAINT `town_manager_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
ALTER TABLE `assistance_verification` MODIFY COLUMN `created_at` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `assistance_verification` MODIFY COLUMN `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `commission_history` MODIFY COLUMN `created_at` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `commission_history` MODIFY COLUMN `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `agent_profile` ADD `id_card_front_id` varchar(36);--> statement-breakpoint
ALTER TABLE `agent_profile` ADD `id_card_back_id` varchar(36);--> statement-breakpoint
ALTER TABLE `manager_action_log` ADD CONSTRAINT `manager_action_log_manager_id_town_manager_id_fk` FOREIGN KEY (`manager_id`) REFERENCES `town_manager`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `manager_compensation` ADD CONSTRAINT `manager_compensation_manager_id_town_manager_id_fk` FOREIGN KEY (`manager_id`) REFERENCES `town_manager`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `manager_fraud_alert` ADD CONSTRAINT `manager_fraud_alert_manager_id_town_manager_id_fk` FOREIGN KEY (`manager_id`) REFERENCES `town_manager`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `manager_fraud_alert` ADD CONSTRAINT `manager_fraud_alert_agent_id_user_id_fk` FOREIGN KEY (`agent_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `territory` ADD CONSTRAINT `territory_manager_id_town_manager_id_fk` FOREIGN KEY (`manager_id`) REFERENCES `town_manager`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `territory` ADD CONSTRAINT `territory_agent_id_user_id_fk` FOREIGN KEY (`agent_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `town_manager` ADD CONSTRAINT `town_manager_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;