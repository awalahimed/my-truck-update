import { mysqlTable, varchar, timestamp, } from "drizzle-orm/mysql-core";
import { user } from "./auth-schema.js";
export const agentProfile = mysqlTable("agent_profile", {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 })
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    nationalId: varchar("national_id", { length: 100 }),
    gender: varchar("gender", { length: 20 }),
    agentType: varchar("agent_type", { length: 50 }), // paid_agent, field_agent, verification_agent
    assignedCity: varchar("assigned_city", { length: 100 }),
    assignedTown: varchar("assigned_town", { length: 100 }),
    assignedTownManager: varchar("assigned_town_manager", { length: 100 }),
    latitude: varchar("latitude", { length: 50 }),
    longitude: varchar("longitude", { length: 50 }),
    idCardFrontId: varchar("id_card_front_id", { length: 36 }),
    idCardBackId: varchar("id_card_back_id", { length: 36 }),
    tier: varchar("tier", { length: 20 }).default("new").notNull(),
    tierEarnedAt: timestamp("tier_earned_at", { fsp: 3 }),
    tierCheckedAt: timestamp("tier_checked_at", { fsp: 3 }),
    createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});
//# sourceMappingURL=agent-schema.js.map