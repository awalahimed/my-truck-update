import { mysqlTable, varchar, text, decimal, timestamp, boolean, json } from 'drizzle-orm/mysql-core';
import { user } from './auth-schema.js';

export const order = mysqlTable('order', {
  id: varchar('id', { length: 255 }).primaryKey(),
  customerId: varchar('customer_id', { length: 255 }).notNull().references(() => user.id),
  driverId: varchar('driver_id', { length: 255 }).references(() => user.id),
  agentId: varchar('agent_id', { length: 255 }).references(() => user.id), // Call center agent who approved
  
  // Locations
  pickupAddress: text('pickup_address').notNull(),
  pickupLatitude: decimal('pickup_latitude', { precision: 10, scale: 8 }).notNull(),
  pickupLongitude: decimal('pickup_longitude', { precision: 11, scale: 8 }).notNull(),
  
  deliveryAddress: text('delivery_address').notNull(),
  deliveryLatitude: decimal('delivery_latitude', { precision: 10, scale: 8 }).notNull(),
  deliveryLongitude: decimal('delivery_longitude', { precision: 11, scale: 8 }).notNull(),
  
  // Order details
  materials: json('materials').notNull(), // Array of material names
  vehicleType: varchar('vehicle_type', { length: 50 }).notNull(), // motorcycle, car, truck
  notes: text('notes'),
  
  // Pricing
  estimatedPrice: decimal('estimated_price', { precision: 10, scale: 2 }),
  finalPrice: decimal('final_price', { precision: 10, scale: 2 }),
  agentFee: decimal('agent_fee', { precision: 10, scale: 2 }), // 5% platform fee
  
  // Status
  status: varchar('status', { length: 50 }).notNull().default('pending_approval'),
  
  // Rejection
  rejectionReason: text('rejection_reason'),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
  approvedAt: timestamp('approved_at'),
  rejectedAt: timestamp('rejected_at'),
  assignedAt: timestamp('assigned_at'),
  pickedUpAt: timestamp('picked_up_at'),
  deliveredAt: timestamp('delivered_at'),
  completedAt: timestamp('completed_at'),
});

export const orderStatus = {
  PENDING_APPROVAL: 'pending_approval',   // Order created, waiting for call center
  AGENT_SELECTED: 'agent_selected',       // Call center selected agent, waiting for agent approval
  APPROVED_BY_AGENT: 'approved_by_agent', // Agent approved, waiting for call center final approval
  REJECTED: 'rejected',                   // Call center rejected
  APPROVED: 'approved',                   // Call center approved, visible to drivers
  HAS_OFFERS: 'has_offers',              // At least one driver made an offer
  ASSIGNED: 'assigned',                   // User accepted a driver's offer
  ON_THE_WAY: 'on_the_way',              // Driver started delivery
  DELIVERED: 'delivered',                 // Driver marked as delivered
  COMPLETED: 'completed',                 // User confirmed, payment processed
  CANCELLED: 'cancelled',                 // Order cancelled
} as const;