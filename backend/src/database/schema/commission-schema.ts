import { mysqlTable, varchar, timestamp, boolean, decimal, int, text } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { user } from './auth-schema.js';
import { order } from './order-schema.js';

export const commissionHistory = mysqlTable('commission_history', {
  id: varchar('id', { length: 36 }).primaryKey(),
  agentId: varchar('agent_id', { length: 36 }).notNull().references(() => user.id, { onDelete: 'cascade' }),
  subjectId: varchar('subject_id', { length: 36 }).notNull(),
  orderId: varchar('order_id', { length: 36 }).notNull().references(() => order.id, { onDelete: 'cascade' }),
  commissionType: varchar('commission_type', { length: 20 }).notNull(),
  baseAmount: decimal('base_amount', { precision: 10, scale: 2 }).notNull(),
  rateApplied: decimal('rate_applied', { precision: 5, scale: 4 }).notNull(),
  payoutAmount: decimal('payout_amount', { precision: 10, scale: 2 }).notNull(),
  stageIndex: int('stage_index').notNull(),
  isAssisted: boolean('is_assisted').default(false).notNull(),
  antiAbuseFlag: boolean('anti_abuse_flag').default(false).notNull(),
  flagReason: text('flag_reason'),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const commissionHistoryRelations = relations(commissionHistory, ({ one }) => ({
  agent: one(user, { fields: [commissionHistory.agentId], references: [user.id] }),
  order: one(order, { fields: [commissionHistory.orderId], references: [order.id] }),
}));

export const assistanceVerification = mysqlTable('assistance_verification', {
  id: varchar('id', { length: 36 }).primaryKey(),
  orderId: varchar('order_id', { length: 36 }).notNull().unique().references(() => order.id, { onDelete: 'cascade' }),
  assistingAgentId: varchar('assisting_agent_id', { length: 36 }).notNull().references(() => user.id, { onDelete: 'cascade' }),
  verifiedById: varchar('verified_by_id', { length: 36 }).references(() => user.id, { onDelete: 'set null' }),
  verificationStatus: varchar('verification_status', { length: 20 }).notNull().default('pending'),
  verificationNotes: text('verification_notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const assistanceVerificationRelations = relations(assistanceVerification, ({ one }) => ({
  order: one(order, { fields: [assistanceVerification.orderId], references: [order.id] }),
  assistingAgent: one(user, { fields: [assistanceVerification.assistingAgentId], references: [user.id] }),
  verifiedBy: one(user, { fields: [assistanceVerification.verifiedById], references: [user.id] }),
}));

export type CommissionHistory = typeof commissionHistory.$inferSelect;
export type NewCommissionHistory = typeof commissionHistory.$inferInsert;
export type AssistanceVerification = typeof assistanceVerification.$inferSelect;
export type NewAssistanceVerification = typeof assistanceVerification.$inferInsert;
