CREATE TABLE `cities` (
	`id` varchar(36) NOT NULL,
	`name_en` varchar(100) NOT NULL,
	`name_am` varchar(100) NOT NULL,
	`name_om` varchar(100) NOT NULL,
	`region` varchar(100),
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `cities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `goods_types` (
	`id` varchar(36) NOT NULL,
	`name_en` varchar(100) NOT NULL,
	`name_am` varchar(100) NOT NULL,
	`name_om` varchar(100) NOT NULL,
	`default_unit_id` varchar(36) NOT NULL,
	`category` varchar(50) DEFAULT 'general',
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `goods_types_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `market_rates` (
	`id` varchar(36) NOT NULL,
	`origin_city_id` varchar(36) NOT NULL,
	`destination_city_id` varchar(36) NOT NULL,
	`pricing_unit_id` varchar(36) NOT NULL,
	`min_rate` decimal(12,2) NOT NULL,
	`max_rate` decimal(12,2) NOT NULL,
	`updated_by` varchar(36) NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `market_rates_id` PRIMARY KEY(`id`),
	CONSTRAINT `route_unit_idx` UNIQUE(`origin_city_id`,`destination_city_id`,`pricing_unit_id`)
);
--> statement-breakpoint
CREATE TABLE `pricing_units` (
	`id` varchar(36) NOT NULL,
	`unit_code` varchar(20) NOT NULL,
	`name_en` varchar(100) NOT NULL,
	`name_am` varchar(100) NOT NULL,
	`name_om` varchar(100) NOT NULL,
	`description` varchar(255),
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `pricing_units_id` PRIMARY KEY(`id`),
	CONSTRAINT `pricing_units_unit_code_unique` UNIQUE(`unit_code`)
);
--> statement-breakpoint
CREATE TABLE `truck_types` (
	`id` varchar(36) NOT NULL,
	`name_en` varchar(100) NOT NULL,
	`name_am` varchar(100) NOT NULL,
	`name_om` varchar(100) NOT NULL,
	`max_capacity` decimal(10,2) NOT NULL,
	`unit_id` varchar(36) NOT NULL,
	`image_url` varchar(500),
	`description` varchar(255),
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `truck_types_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `goods_types` ADD CONSTRAINT `goods_types_default_unit_id_pricing_units_id_fk` FOREIGN KEY (`default_unit_id`) REFERENCES `pricing_units`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `market_rates` ADD CONSTRAINT `market_rates_origin_city_id_cities_id_fk` FOREIGN KEY (`origin_city_id`) REFERENCES `cities`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `market_rates` ADD CONSTRAINT `market_rates_destination_city_id_cities_id_fk` FOREIGN KEY (`destination_city_id`) REFERENCES `cities`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `market_rates` ADD CONSTRAINT `market_rates_pricing_unit_id_pricing_units_id_fk` FOREIGN KEY (`pricing_unit_id`) REFERENCES `pricing_units`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `market_rates` ADD CONSTRAINT `market_rates_updated_by_user_id_fk` FOREIGN KEY (`updated_by`) REFERENCES `user`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `truck_types` ADD CONSTRAINT `truck_types_unit_id_pricing_units_id_fk` FOREIGN KEY (`unit_id`) REFERENCES `pricing_units`(`id`) ON DELETE restrict ON UPDATE no action;