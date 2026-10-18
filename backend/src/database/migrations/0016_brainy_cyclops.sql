CREATE TABLE `manager_assigned_cities` (
	`id` varchar(36) NOT NULL,
	`manager_id` varchar(36) NOT NULL,
	`city_id` varchar(36) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `manager_assigned_cities_id` PRIMARY KEY(`id`),
	CONSTRAINT `manager_city_idx` UNIQUE(`manager_id`,`city_id`)
);
--> statement-breakpoint
ALTER TABLE `market_rates` ADD `base_rate` decimal(12,2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE `market_rates` ADD `market_condition` varchar(30) DEFAULT 'NORMAL' NOT NULL;--> statement-breakpoint
ALTER TABLE `market_rates` ADD `notes` text;--> statement-breakpoint
ALTER TABLE `market_rates` ADD `manager_id` varchar(36);--> statement-breakpoint
ALTER TABLE `manager_assigned_cities` ADD CONSTRAINT `manager_assigned_cities_manager_id_town_manager_id_fk` FOREIGN KEY (`manager_id`) REFERENCES `town_manager`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `manager_assigned_cities` ADD CONSTRAINT `manager_assigned_cities_city_id_cities_id_fk` FOREIGN KEY (`city_id`) REFERENCES `cities`(`id`) ON DELETE cascade ON UPDATE no action;