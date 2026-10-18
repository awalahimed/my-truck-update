import {
  mysqlTable,
  varchar,
  text,
  timestamp,
  boolean,
  int,
  decimal,
  AnyMySqlColumn,
} from "drizzle-orm/mysql-core";

// User role definitions
export const userRoles = {
  UNKNOWN: "unknown",
  ADMIN: "admin",
  OWNER_SHOP: "user",
  AGENT_DELALA: "agent_delala",
  AGENT: "agent",
  DRIVER: "driver",
  CALL_CENTER: "call_center",
  TOWN_MANAGER: "town_manager",
} as const;

export type UserRole = (typeof userRoles)[keyof typeof userRoles];

// Account status definitions
export const accountStatus = {
  ACTIVE: "active",
  SUSPENDED: "suspended",
  PENDING: "pending",
  FLAGGED: "flagged",
  DELETED: "deleted",
  REJECTED: "rejected",
  RE_UPLOADED: "re-uploaded",
} as const;

export type AccountStatus = (typeof accountStatus)[keyof typeof accountStatus];

export const user = mysqlTable("user", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: text("name").notNull(),
  email: varchar("email", { length: 255 }).unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { fsp: 3 })
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  role: varchar("role", { length: 20 })
    .$type<UserRole>()
    .default(userRoles.UNKNOWN)
    .notNull(),
  accountStatus: varchar("account_status", { length: 20 })
    .$type<AccountStatus>()
    .default(accountStatus.PENDING)
    .notNull(),
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires", { fsp: 3 }),
  phoneNumber: varchar("phone_number", { length: 255 }).unique(),
  phoneNumberVerified: boolean("phone_number_verified").default(false),
  notificationsEnabled: boolean("notifications_enabled").default(true),
  deletedAt: timestamp("deleted_at", { fsp: 3 }),
  // Driver rejection fields
  rejectionReason: text("rejection_reason"),
  rejectedDocument: varchar("rejected_document", { length: 50 }), // 'license' or 'vehicle'
  rejectedAt: timestamp("rejected_at", { fsp: 3 }),
  // FCM push notification token
  fcmToken: text("fcm_token"),
  // Referral fields
  referralCode: varchar("referral_code", { length: 10 }).unique(),
  referredBy: varchar("referred_by", { length: 36 }), // ID of user who referred them
  registeredByAgentId: varchar("registered_by_agent_id", { length: 36 }).references(
    (): AnyMySqlColumn => user.id,
    { onDelete: "set null" }
  ),
  referralRewardClaimed: boolean("referral_reward_claimed").default(false),
  referralCount: int("referral_count").default(0), // Total successful referrals
  userCycleCount: int('user_cycle_count').default(0).notNull(),
  userLifetimeEarnings: decimal('user_lifetime_earnings', { precision: 10, scale: 2 }).default('0.00').notNull(),
});

export const session = mysqlTable("session", {
  id: varchar("id", { length: 36 }).primaryKey(),
  expiresAt: timestamp("expires_at", { fsp: 3 }).notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { fsp: 3 })
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  impersonatedBy: text("impersonated_by"),
});

export const account = mysqlTable("account", {
  id: varchar("id", { length: 36 }).primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),

  
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { fsp: 3 }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { fsp: 3 }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { fsp: 3 })
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const verification = mysqlTable("verification", {
  id: varchar("id", { length: 36 }).primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { fsp: 3 }).notNull(),
  createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { fsp: 3 })
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});
