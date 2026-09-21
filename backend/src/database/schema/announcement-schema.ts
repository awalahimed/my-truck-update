import { mysqlTable, varchar, text, longtext, timestamp, boolean } from 'drizzle-orm/mysql-core';

export const announcementTargetType = {
  ALL: 'all',
  USER: 'user',
  DRIVER: 'driver',
} as const;

export type AnnouncementTargetType = (typeof announcementTargetType)[keyof typeof announcementTargetType];

export const announcement = mysqlTable('announcement', {
  id: varchar('id', { length: 36 }).primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  message: longtext('message').notNull(),
  targetType: varchar('target_type', { length: 50 })
    .$type<AnnouncementTargetType>()
    .notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdBy: varchar('created_by', { length: 36 }).notNull(),
  createdAt: timestamp('created_at', { fsp: 3 }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { fsp: 3 })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  expiresAt: timestamp('expires_at', { fsp: 3 }),
});
