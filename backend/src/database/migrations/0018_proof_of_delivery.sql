ALTER TABLE `order` ADD `delivery_pin` varchar(10);
ALTER TABLE `order` ADD `consignee_name` varchar(255);
ALTER TABLE `order` ADD `consignee_phone` varchar(50);
ALTER TABLE `order` ADD `pod_waybill_photo` text;
ALTER TABLE `order` ADD `pod_cargo_photo` text;
ALTER TABLE `order` ADD `pod_completed_by` varchar(50);
ALTER TABLE `order` ADD `pod_latitude` decimal(10,8);
ALTER TABLE `order` ADD `pod_longitude` decimal(11,8);
ALTER TABLE `order` ADD `pod_dispute_reason` text;
ALTER TABLE `order` ADD `pod_disputed_at` timestamp;

CREATE TABLE IF NOT EXISTS `trip_waypoints` (
  `id` varchar(36) PRIMARY KEY,
  `order_id` varchar(255) NOT NULL,
  `driver_id` varchar(255) NOT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `bearing` decimal(6,2),
  `speed_kmh` decimal(6,2),
  `accuracy` decimal(6,2),
  `is_milestone` boolean NOT NULL DEFAULT false,
  `recorded_at` timestamp NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
