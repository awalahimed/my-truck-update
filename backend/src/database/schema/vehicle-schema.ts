import { mysqlTable, varchar, timestamp, text, boolean, int, decimal } from 'drizzle-orm/mysql-core';
import { user } from './auth-schema.js';

export const vehicle = mysqlTable('vehicle', {
  id: varchar('id', { length: 255 }).primaryKey(),
  driverId: varchar('driver_id', { length: 255 }).notNull().references(() => user.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(), // 'motorcycle', 'car', 'truck'
  make: varchar('make', { length: 100 }), // Toyota, Honda, etc.
  model: varchar('model', { length: 100 }), // Corolla, Civic, etc.
  year: varchar('year', { length: 4 }), // 2020, 2021, etc.
  plateNumber: varchar('plate_number', { length: 20 }).notNull(),
  color: varchar('color', { length: 50 }),
  capacity: varchar('capacity', { length: 50 }), // "Up to 20kg", "Up to 100kg"
  registeredByAgentId: varchar('registered_by_agent_id', { length: 36 }).references(() => user.id, { onDelete: 'set null' }),
  driverCycleCount: int('driver_cycle_count').default(0).notNull(),
  driverLifetimeEarnings: decimal('driver_lifetime_earnings', { precision: 10, scale: 2 }).default('0.00').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});
