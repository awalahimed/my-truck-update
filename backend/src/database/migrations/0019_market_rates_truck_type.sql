ALTER TABLE `market_rates` ADD COLUMN `truck_type_id` varchar(36) NULL;
ALTER TABLE `market_rates` ADD CONSTRAINT `fk_market_rates_truck_type` FOREIGN KEY (`truck_type_id`) REFERENCES `truck_types`(`id`) ON DELETE SET NULL;
ALTER TABLE `market_rates` ADD UNIQUE INDEX `route_unit_truck_idx` (`origin_city_id`, `destination_city_id`, `pricing_unit_id`, `truck_type_id`);
ALTER TABLE `market_rates` DROP INDEX `route_unit_idx`;
