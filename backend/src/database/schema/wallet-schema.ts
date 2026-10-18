import {
  mysqlTable,
  varchar,
  decimal,
  timestamp,
  boolean,
  text,
} from "drizzle-orm/mysql-core";
import { user } from "./auth-schema.js";

export const wallet = mysqlTable("wallet", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0.00").notNull(),
  reservedBalance: decimal("reserved_balance", { precision: 10, scale: 2 }).default("0.00").notNull(), // Reserved for future use
  totalTopup: decimal("total_topup", { precision: 10, scale: 2 }).default("0.00").notNull(),
  totalWithdrawn: decimal("total_withdrawn", { precision: 10, scale: 2 }).default("0.00").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { fsp: 3 })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const walletTransaction = mysqlTable("wallet_transaction", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  walletId: varchar("wallet_id", { length: 36 })
    .notNull()
    .references(() => wallet.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(), // commission, withdrawal, penalty, bonus, topup
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 20 }).default("completed").notNull(), // completed, pending, failed
  referenceId: varchar("reference_id", { length: 36 }), // Order ID or other reference
  createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { fsp: 3 })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const wallets = wallet;
export type Wallet = typeof wallet.$inferSelect;
export type NewWallet = typeof wallet.$inferInsert;
export type WalletTransaction = typeof walletTransaction.$inferSelect;
export type NewWalletTransaction = typeof walletTransaction.$inferInsert;
