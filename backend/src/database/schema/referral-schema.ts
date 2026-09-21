import { mysqlTable, varchar, timestamp, boolean, decimal, int } from 'drizzle-orm/mysql-core';
import { user } from './auth-schema.js';
import { order } from './order-schema.js';

// Referral status definitions
export const referralStatus = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
} as const;

export type ReferralStatus = (typeof referralStatus)[keyof typeof referralStatus];

// Referral tracking table
export const referral = mysqlTable('referral', {
  id: varchar('id', { length: 36 }).primaryKey(),
  
  // Relationship
  referrerId: varchar('referrer_id', { length: 36 })
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  refereeId: varchar('referee_id', { length: 36 })
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  
  // Status tracking
  status: varchar('status', { length: 20 })
    .$type<ReferralStatus>()
    .notNull()
    .default(referralStatus.PENDING),
  
  // Rewards
  referrerReward: decimal('referrer_reward', { precision: 10, scale: 2 }),
  refereeReward: decimal('referee_reward', { precision: 10, scale: 2 }),
  referrerRewardClaimed: boolean('referrer_reward_claimed').default(false).notNull(),
  refereeRewardClaimed: boolean('referee_reward_claimed').default(false).notNull(),
  
  // Completion tracking
  firstOrderId: varchar('first_order_id', { length: 36 }).references(() => order.id),
  completedAt: timestamp('completed_at', { fsp: 3 }),
  expiresAt: timestamp('expires_at', { fsp: 3 }), // Referral expires after X days
  
  // Timestamps
  createdAt: timestamp('created_at', { fsp: 3 }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { fsp: 3 })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Referral configuration table
export const referralConfig = mysqlTable('referral_config', {
  id: varchar('id', { length: 36 }).primaryKey(),
  
  // Rewards
  referrerRewardAmount: decimal('referrer_reward_amount', { precision: 10, scale: 2 })
    .default('50.00')
    .notNull(),
  refereeRewardAmount: decimal('referee_reward_amount', { precision: 10, scale: 2 })
    .default('25.00')
    .notNull(),
  
  // Conditions
  minOrderAmount: decimal('min_order_amount', { precision: 10, scale: 2 })
    .default('100.00')
    .notNull(),
  expiryDays: int('expiry_days').default(30).notNull(),
  
  // Status
  enabled: boolean('enabled').default(true).notNull(),
  
  // Timestamps
  createdAt: timestamp('created_at', { fsp: 3 }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { fsp: 3 })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type Referral = typeof referral.$inferSelect;
export type NewReferral = typeof referral.$inferInsert;

export type ReferralConfig = typeof referralConfig.$inferSelect;
export type NewReferralConfig = typeof referralConfig.$inferInsert;
