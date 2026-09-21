import { mysqlTable, varchar, timestamp, boolean, json, } from "drizzle-orm/mysql-core";
import { user } from "./auth-schema.js";
export const paymentMethodType = {
    BANK_ACCOUNT: "bank_account",
    MOBILE_MONEY: "mobile_money",
};
export const paymentMethod = mysqlTable("payment_method", {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 })
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 20 })
        .$type()
        .notNull(),
    provider: varchar("provider", { length: 100 }).notNull(),
    accountNumber: varchar("account_number", { length: 100 }).notNull(),
    accountName: varchar("account_name", { length: 255 }).notNull(),
    isDefault: boolean("is_default").default(false).notNull(),
    metadata: json("metadata"),
    createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});
//# sourceMappingURL=payment-method-schema.js.map