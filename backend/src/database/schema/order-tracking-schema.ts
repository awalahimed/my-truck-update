import { mysqlTable, varchar, decimal, timestamp, boolean } from 'drizzle-orm/mysql-core';
import { order } from './order-schema.js';
import { user } from './auth-schema.js';

export const tripWaypoints = mysqlTable('trip_waypoints', {
  id: varchar('id', { length: 36 }).primaryKey(),
  orderId: varchar('order_id', { length: 255 }).notNull().references(() => order.id),
  driverId: varchar('driver_id', { length: 255 }).notNull().references(() => user.id),
  latitude: decimal('latitude', { precision: 10, scale: 8 }).notNull(),
  longitude: decimal('longitude', { precision: 11, scale: 8 }).notNull(),
  bearing: decimal('bearing', { precision: 6, scale: 2 }),
  speedKmh: decimal('speed_kmh', { precision: 6, scale: 2 }),
  accuracy: decimal('accuracy', { precision: 6, scale: 2 }),
  isMilestone: boolean('is_milestone').default(false).notNull(),
  recordedAt: timestamp('recorded_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type TripWaypoint = typeof tripWaypoints.$inferSelect;
export type NewTripWaypoint = typeof tripWaypoints.$inferInsert;
