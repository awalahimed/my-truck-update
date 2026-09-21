import { mysqlTable, varchar, int, decimal, timestamp, text, json, } from "drizzle-orm/mysql-core";
import { user } from "./auth-schema.js";
/**
 * Town/City Manager - manages agents and operations in assigned region
 */
export const townManager = mysqlTable("town_manager", {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 })
        .notNull()
        .unique()
        .references(() => user.id, { onDelete: "cascade" }),
    townName: varchar("town_name", { length: 100 }).notNull(),
    cityName: varchar("city_name", { length: 100 }).notNull(),
    region: varchar("region", { length: 100 }).notNull(),
    status: varchar("status", { length: 20 }).default("active"), // active, suspended, inactive
    totalAgents: int("total_agents").default(0),
    regionalRevenue: decimal("regional_revenue", { precision: 15, scale: 2 }).default("0"),
    cityRanking: int("city_ranking"),
    latitude: varchar("latitude", { length: 50 }),
    longitude: varchar("longitude", { length: 50 }),
    contactPhone: varchar("contact_phone", { length: 20 }),
    contactEmail: varchar("contact_email", { length: 100 }),
    approvalStatus: varchar("approval_status", { length: 20 }).default("pending"), // pending, approved, rejected
    approvedBy: varchar("approved_by", { length: 36 }), // admin who approved
    notes: text("notes"),
    createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});
/**
 * Territory assignment - tracks which agents are managed by which manager
 */
export const territory = mysqlTable("territory", {
    id: varchar("id", { length: 36 }).primaryKey(),
    managerId: varchar("manager_id", { length: 36 })
        .notNull()
        .references(() => townManager.id, { onDelete: "cascade" }),
    agentId: varchar("agent_id", { length: 36 })
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    areaName: varchar("area_name", { length: 100 }).notNull(),
    status: varchar("status", { length: 20 }).default("active"), // active, suspended
    assignedDate: timestamp("assigned_date", { fsp: 3 }).defaultNow().notNull(),
    suspendedDate: timestamp("suspended_date", { fsp: 3 }),
    suspensionReason: text("suspension_reason"),
    createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});
/**
 * Manager Compensation - tracks override commissions and operational incentives
 */
export const managerCompensation = mysqlTable("manager_compensation", {
    id: varchar("id", { length: 36 }).primaryKey(),
    managerId: varchar("manager_id", { length: 36 })
        .notNull()
        .references(() => townManager.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 50 }).notNull(), // override_commission, operational_incentive
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    sourceAgentId: varchar("source_agent_id", { length: 36 }), // agent who generated the commission
    referenceId: varchar("reference_id", { length: 36 }), // order_id or truck_id
    month: varchar("month", { length: 7 }), // YYYY-MM format
    status: varchar("status", { length: 20 }).default("pending"), // pending, approved, paid
    createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});
/**
 * Manager Actions Log - tracks approve/suspend/fraud alerts
 */
export const managerActionLog = mysqlTable("manager_action_log", {
    id: varchar("id", { length: 36 }).primaryKey(),
    managerId: varchar("manager_id", { length: 36 })
        .notNull()
        .references(() => townManager.id, { onDelete: "cascade" }),
    actionType: varchar("action_type", { length: 50 }).notNull(), // approve_agent, suspend_agent, fraud_alert, territory_assign, review_report
    targetAgentId: varchar("target_agent_id", { length: 36 }),
    description: text("description"),
    metadata: json("metadata"), // additional data like suspension reason, approval notes
    createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
});
/**
 * Manager Fraud Alerts - tracks suspicious activities
 */
export const managerFraudAlert = mysqlTable("manager_fraud_alert", {
    id: varchar("id", { length: 36 }).primaryKey(),
    managerId: varchar("manager_id", { length: 36 })
        .notNull()
        .references(() => townManager.id, { onDelete: "cascade" }),
    agentId: varchar("agent_id", { length: 36 })
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    alertType: varchar("alert_type", { length: 50 }).notNull(), // suspicious_activity, unusual_pattern, compliance_breach
    severity: varchar("severity", { length: 20 }).notNull(), // low, medium, high, critical
    description: text("description").notNull(),
    status: varchar("status", { length: 20 }).default("open"), // open, investigating, resolved, dismissed
    resolution: text("resolution"),
    createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});
//# sourceMappingURL=manager-schema.js.map