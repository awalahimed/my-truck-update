import { mysqlTable, varchar, decimal, timestamp, json, } from "drizzle-orm/mysql-core";
import { user } from "./auth-schema.js";
export const paymentStatus = {
    PENDING: "pending",
    SUCCESS: "success",
    FAILED: "failed",
    CANCELLED: "cancelled",
};
export const transactionType = {
    TOPUP: "topup",
    WITHDRAWAL: "withdrawal",
    PAYMENT: "payment",
    COMMISSION: "commission",
    REFUND: "refund",
    AGENT_FEE: "agent_fee", // Platform fee (5%)
};
export const transaction = mysqlTable("transaction", {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 })
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    fromUserId: varchar("from_user_id", { length: 36 })
        .references(() => user.id, { onDelete: "set null" }),
    toUserId: varchar("to_user_id", { length: 36 })
        .references(() => user.id, { onDelete: "set null" }),
    txRef: varchar("tx_ref", { length: 100 }).notNull().unique(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("ETB").notNull(),
    type: varchar("type", { length: 20 })
        .$type()
        .notNull(),
    status: varchar("status", { length: 20 })
        .$type()
        .default(paymentStatus.PENDING)
        .notNull(),
    chapaReference: varchar("chapa_reference", { length: 100 }),
    paymentMethod: varchar("payment_method", { length: 50 }),
    description: varchar("description", { length: 255 }),
    meta: json("meta"),
    createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});
//# sourceMappingURL=payment-schema.js.map