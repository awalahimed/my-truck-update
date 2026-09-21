import { mysqlTable, varchar, decimal, timestamp } from 'drizzle-orm/mysql-core';
import { user } from './auth-schema.js';
import { order } from './order-schema.js';
export const driverOffer = mysqlTable('driver_offer', {
    id: varchar('id', { length: 255 }).primaryKey(),
    orderId: varchar('order_id', { length: 255 }).notNull().references(() => order.id),
    driverId: varchar('driver_id', { length: 255 }).notNull().references(() => user.id),
    // Offer details
    offeredPrice: decimal('offered_price', { precision: 10, scale: 2 }).notNull(), // Price in Birr
    status: varchar('status', { length: 50 }).notNull().default('pending'), // pending, accepted, rejected, cancelled
    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
    respondedAt: timestamp('responded_at'), // When customer accepts/rejects
});
export const offerStatus = {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
    CANCELLED: 'cancelled',
};
//# sourceMappingURL=driver-offer-schema.js.map