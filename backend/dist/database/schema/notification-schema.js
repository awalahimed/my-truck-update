import { mysqlTable, varchar, timestamp, boolean, text } from 'drizzle-orm/mysql-core';
import { user } from './auth-schema.js';
export const notification = mysqlTable('notification', {
    id: varchar('id', { length: 255 }).primaryKey(),
    userId: varchar('user_id', { length: 255 }).notNull().references(() => user.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    message: varchar('message', { length: 1000 }).notNull(),
    type: varchar('type', { length: 50 }).notNull(), // 'order', 'payment', 'delivery', 'system'
    data: text('data'), // JSON string for additional data (orderId, status, etc.)
    read: boolean('read').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
//# sourceMappingURL=notification-schema.js.map