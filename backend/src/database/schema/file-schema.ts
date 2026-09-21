import {
  mysqlTable,
  varchar,
  text,
  timestamp,
  int,
} from "drizzle-orm/mysql-core";
import { user } from "./auth-schema.js";


export const uploadStatus = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export type UploadStatus = (typeof uploadStatus)[keyof typeof uploadStatus];

export const uploadedFile = mysqlTable("uploaded_file", {
  id: varchar("id", { length: 36 }).primaryKey(),
  filename: text("filename").notNull(), // Original filename
  fileName: varchar("file_name", { length: 255 }).notNull(), // Stored filename (UUID-based)
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  documentType: varchar("document_type", { length: 50 }).default("other"), // e.g., 'profile_photo', 'license_front', 'license_back'
  size: int("size").notNull(), // File size in bytes
  path: text("path").notNull(), // Storage path
  uploadStatus: varchar("upload_status", { length: 20 })
    .$type<UploadStatus>()
    .default(uploadStatus.PENDING)
    .notNull(),
  uploadId: varchar("upload_id", { length: 36 }).notNull(), // For tracking chunk uploads
  chunkCount: int("chunk_count").notNull(), // Total expected chunks
  chunksReceived: int("chunks_received").default(0).notNull(),
  userId: varchar("user_id", { length: 36 })
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { fsp: 3 })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});