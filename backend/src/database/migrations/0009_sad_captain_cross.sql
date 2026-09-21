CREATE TABLE `wallet_transaction` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`wallet_id` varchar(36) NOT NULL,
	`type` varchar(50) NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`description` text,
	`status` varchar(20) NOT NULL DEFAULT 'completed',
	`reference_id` varchar(36),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `wallet_transaction_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `wallet_transaction` ADD CONSTRAINT `wallet_transaction_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `wallet_transaction` ADD CONSTRAINT `wallet_transaction_wallet_id_wallet_id_fk` FOREIGN KEY (`wallet_id`) REFERENCES `wallet`(`id`) ON DELETE cascade ON UPDATE no action;