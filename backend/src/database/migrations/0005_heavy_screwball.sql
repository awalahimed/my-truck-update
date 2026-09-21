CREATE TABLE `vehicle_image` (
	`id` varchar(36) NOT NULL,
	`driver_id` varchar(36) NOT NULL,
	`file_id` varchar(36) NOT NULL,
	`image_type` varchar(20) NOT NULL,
	`description` text,
	`display_order` int DEFAULT 0,
	`is_active` varchar(10) DEFAULT 'true',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vehicle_image_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `vehicle_image` ADD CONSTRAINT `vehicle_image_driver_id_user_id_fk` FOREIGN KEY (`driver_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;