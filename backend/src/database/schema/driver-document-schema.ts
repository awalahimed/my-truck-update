import { mysqlTable, varchar, timestamp, text, int } from 'drizzle-orm/mysql-core'
import { user } from './auth-schema.js'

export const driverDocument = mysqlTable('driver_document', {
  id: varchar('id', { length: 36 }).primaryKey(),
  driverId: varchar('driver_id', { length: 36 }).notNull().references(() => user.id, { onDelete: 'cascade' }),
  licenseFrontId: varchar('license_front_id', { length: 36 }).notNull(),
  licenseBackId: varchar('license_back_id', { length: 36 }).notNull(),
  vehiclePhotoId: varchar('vehicle_photo_id', { length: 36 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
})

// New table for multiple vehicle images with descriptions
export const vehicleImage = mysqlTable('vehicle_image', {
  id: varchar('id', { length: 36 }).primaryKey(),
  driverId: varchar('driver_id', { length: 36 }).notNull().references(() => user.id, { onDelete: 'cascade' }),
  fileId: varchar('file_id', { length: 36 }).notNull(), // Reference to uploaded_file
  imageType: varchar('image_type', { length: 20 }).notNull(), // 'front', 'back', 'side', 'interior', 'other'
  description: text('description'), // User-provided description
  displayOrder: int('display_order').default(0), // For ordering images
  isActive: varchar('is_active', { length: 10 }).default('true'), // 'true' or 'false' as string
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
})
