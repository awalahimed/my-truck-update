CREATE TABLE `announcement` (
	`id` varchar(36) NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`target_type` varchar(50) NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_by` varchar(36) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	`expires_at` timestamp(3),
	CONSTRAINT `announcement_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `account` (
	`id` varchar(36) NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` timestamp(3),
	`refresh_token_expires_at` timestamp(3),
	`scope` text,
	`password` text,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL,
	CONSTRAINT `account_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` varchar(36) NOT NULL,
	`expires_at` timestamp(3) NOT NULL,
	`token` varchar(255) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` varchar(36) NOT NULL,
	`impersonated_by` text,
	CONSTRAINT `session_id` PRIMARY KEY(`id`),
	CONSTRAINT `session_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` varchar(36) NOT NULL,
	`name` text NOT NULL,
	`email` varchar(255),
	`email_verified` boolean NOT NULL DEFAULT false,
	`image` text,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	`role` varchar(20) NOT NULL DEFAULT 'unknown',
	`account_status` varchar(20) NOT NULL DEFAULT 'pending',
	`banned` boolean DEFAULT false,
	`ban_reason` text,
	`ban_expires` timestamp(3),
	`phone_number` varchar(255),
	`phone_number_verified` boolean DEFAULT false,
	`notifications_enabled` boolean DEFAULT true,
	`deleted_at` timestamp(3),
	`rejection_reason` text,
	`rejected_document` varchar(50),
	`rejected_at` timestamp(3),
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_email_unique` UNIQUE(`email`),
	CONSTRAINT `user_phone_number_unique` UNIQUE(`phone_number`)
);
--> statement-breakpoint
CREATE TABLE `verification` (
	`id` varchar(36) NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` timestamp(3) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `verification_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `driver_document` (
	`id` varchar(36) NOT NULL,
	`driver_id` varchar(36) NOT NULL,
	`license_front_id` varchar(36) NOT NULL,
	`license_back_id` varchar(36) NOT NULL,
	`vehicle_photo_id` varchar(36),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `driver_document_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `driver_offer` (
	`id` varchar(255) NOT NULL,
	`order_id` varchar(255) NOT NULL,
	`driver_id` varchar(255) NOT NULL,
	`offered_price` decimal(10,2) NOT NULL,
	`status` varchar(50) NOT NULL DEFAULT 'pending',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`responded_at` timestamp,
	CONSTRAINT `driver_offer_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `uploaded_file` (
	`id` varchar(36) NOT NULL,
	`filename` text NOT NULL,
	`file_name` varchar(255) NOT NULL,
	`mime_type` varchar(100) NOT NULL,
	`document_type` varchar(50) DEFAULT 'other',
	`size` int NOT NULL,
	`path` text NOT NULL,
	`upload_status` varchar(20) NOT NULL DEFAULT 'pending',
	`upload_id` varchar(36) NOT NULL,
	`chunk_count` int NOT NULL,
	`chunks_received` int NOT NULL DEFAULT 0,
	`user_id` varchar(36),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `uploaded_file_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notification` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` varchar(1000) NOT NULL,
	`type` varchar(50) NOT NULL,
	`read` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notification_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order` (
	`id` varchar(255) NOT NULL,
	`customer_id` varchar(255) NOT NULL,
	`driver_id` varchar(255),
	`agent_id` varchar(255),
	`pickup_address` text NOT NULL,
	`pickup_latitude` decimal(10,8) NOT NULL,
	`pickup_longitude` decimal(11,8) NOT NULL,
	`delivery_address` text NOT NULL,
	`delivery_latitude` decimal(10,8) NOT NULL,
	`delivery_longitude` decimal(11,8) NOT NULL,
	`materials` json NOT NULL,
	`vehicle_type` varchar(50) NOT NULL,
	`notes` text,
	`estimated_price` decimal(10,2),
	`final_price` decimal(10,2),
	`agent_fee` decimal(10,2),
	`status` varchar(50) NOT NULL DEFAULT 'pending_approval',
	`rejection_reason` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`approved_at` timestamp,
	`rejected_at` timestamp,
	`assigned_at` timestamp,
	`picked_up_at` timestamp,
	`delivered_at` timestamp,
	`completed_at` timestamp,
	CONSTRAINT `order_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payment_method` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`type` varchar(20) NOT NULL,
	`provider` varchar(100) NOT NULL,
	`account_number` varchar(100) NOT NULL,
	`account_name` varchar(255) NOT NULL,
	`is_default` boolean NOT NULL DEFAULT false,
	`metadata` json,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `payment_method_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transaction` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`from_user_id` varchar(36),
	`to_user_id` varchar(36),
	`tx_ref` varchar(100) NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'ETB',
	`type` varchar(20) NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'pending',
	`chapa_reference` varchar(100),
	`payment_method` varchar(50),
	`description` varchar(255),
	`meta` json,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `transaction_id` PRIMARY KEY(`id`),
	CONSTRAINT `transaction_tx_ref_unique` UNIQUE(`tx_ref`)
);
--> statement-breakpoint
CREATE TABLE `vehicle` (
	`id` varchar(255) NOT NULL,
	`driver_id` varchar(255) NOT NULL,
	`type` varchar(50) NOT NULL,
	`make` varchar(100),
	`model` varchar(100),
	`year` varchar(4),
	`plate_number` varchar(20) NOT NULL,
	`color` varchar(50),
	`capacity` varchar(50),
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vehicle_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wallet` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`balance` decimal(10,2) NOT NULL DEFAULT '0.00',
	`total_topup` decimal(10,2) NOT NULL DEFAULT '0.00',
	`total_withdrawn` decimal(10,2) NOT NULL DEFAULT '0.00',
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `wallet_id` PRIMARY KEY(`id`),
	CONSTRAINT `wallet_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
ALTER TABLE `account` ADD CONSTRAINT `account_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `driver_document` ADD CONSTRAINT `driver_document_driver_id_user_id_fk` FOREIGN KEY (`driver_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `driver_offer` ADD CONSTRAINT `driver_offer_order_id_order_id_fk` FOREIGN KEY (`order_id`) REFERENCES `order`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `driver_offer` ADD CONSTRAINT `driver_offer_driver_id_user_id_fk` FOREIGN KEY (`driver_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `uploaded_file` ADD CONSTRAINT `uploaded_file_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notification` ADD CONSTRAINT `notification_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order` ADD CONSTRAINT `order_customer_id_user_id_fk` FOREIGN KEY (`customer_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order` ADD CONSTRAINT `order_driver_id_user_id_fk` FOREIGN KEY (`driver_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order` ADD CONSTRAINT `order_agent_id_user_id_fk` FOREIGN KEY (`agent_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payment_method` ADD CONSTRAINT `payment_method_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transaction` ADD CONSTRAINT `transaction_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transaction` ADD CONSTRAINT `transaction_from_user_id_user_id_fk` FOREIGN KEY (`from_user_id`) REFERENCES `user`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transaction` ADD CONSTRAINT `transaction_to_user_id_user_id_fk` FOREIGN KEY (`to_user_id`) REFERENCES `user`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vehicle` ADD CONSTRAINT `vehicle_driver_id_user_id_fk` FOREIGN KEY (`driver_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `wallet` ADD CONSTRAINT `wallet_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;