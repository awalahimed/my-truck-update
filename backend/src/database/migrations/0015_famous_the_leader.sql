CREATE TABLE `commissions` (
	`id` varchar(36) NOT NULL,
	`order_id` varchar(255) NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'collected',
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `commissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `commissions` ADD CONSTRAINT `commissions_order_id_order_id_fk` FOREIGN KEY (`order_id`) REFERENCES `order`(`id`) ON DELETE cascade ON UPDATE no action;