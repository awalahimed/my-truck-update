import { z } from 'zod';
import { os } from '@orpc/server';
import { adminProcedure } from '../middlewares/auth-admin.js';
import { authProcedure } from '../middlewares/auth.js';
import { db } from '../database/db.js';
import { announcement } from '../database/schema/announcement-schema.js';
import { user } from '../database/schema/auth-schema.js';
import { eq, and, or, desc, gt, isNull, sql } from 'drizzle-orm';
import crypto from 'node:crypto';
import { createNotifications } from '../services/notification.js';

export const announcementController = os.router({
  // Create announcement (Admin only)
  create: adminProcedure
    .input(z.object({
      title: z.string().min(1).max(255),
      message: z.string().min(1),
      targetType: z.enum(['all', 'user', 'driver']),
      expiresAt: z.string().optional(), // ISO date string
    }))
    .handler(async ({ input, context }) => {
      const id = crypto.randomUUID();
      
      await db.insert(announcement).values({
        id,
        title: input.title,
        message: input.message,
        targetType: input.targetType,
        createdBy: context.user.id,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
        isActive: true,
      });

      // Send notifications to target users
      try {
        // Get target users based on targetType
        let targetUsers: { id: string }[] = [];
        
        if (input.targetType === 'all') {
          targetUsers = await db.select({ id: user.id })
            .from(user)
            .where(eq(user.notificationsEnabled, true));
        } else {
          targetUsers = await db.select({ id: user.id })
            .from(user)
            .where(and(
              eq(user.role, input.targetType),
              eq(user.notificationsEnabled, true)
            ));
        }

        // Send notification to all target users
        const userIds = targetUsers.map(u => u.id);
        if (userIds.length > 0) {
          await createNotifications(userIds, {
            title: `📢 ${input.title}`,
            body: input.message.substring(0, 100) + (input.message.length > 100 ? '...' : ''),
            type: 'announcement',
            data: { announcementId: id },
          });
        }
      } catch (error) {
        console.error('Failed to send announcement notifications:', error);
        // Don't fail the announcement creation if notifications fail
      }

      return { success: true, id, message: 'Announcement created' };
    }),

  // Get all announcements (Admin only)
  getAll: adminProcedure
    .input(z.object({
      includeInactive: z.boolean().optional(),
    }).optional())
    .handler(async ({ input }) => {
      const conditions = [];
      
      if (!input?.includeInactive) {
        conditions.push(eq(announcement.isActive, true));
      }

      const announcements = await db.select({
        announcement,
        creator: {
          id: user.id,
          name: user.name,
        },
      })
        .from(announcement)
        .leftJoin(user, eq(announcement.createdBy, user.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(announcement.createdAt));

      return { success: true, announcements };
    }),

  // Get announcements for current user (Mobile)
  getForUser: authProcedure
    .handler(async ({ context }) => {
      const userRole = context.user.role || 'user';
      
      const announcements = await db.select()
        .from(announcement)
        .where(and(
          eq(announcement.isActive, true),
          or(
            eq(announcement.targetType, 'all'),
            sql`${announcement.targetType} = ${userRole}`
          ),
          or(
            isNull(announcement.expiresAt),
            gt(announcement.expiresAt, new Date())
          )
        ))
        .orderBy(desc(announcement.createdAt));

      return { success: true, announcements };
    }),

  // Update announcement (Admin only)
  update: adminProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().min(1).max(255).optional(),
      message: z.string().min(1).optional(),
      targetType: z.enum(['all', 'user', 'driver']).optional(),
      isActive: z.boolean().optional(),
      expiresAt: z.string().nullable().optional(),
    }))
    .handler(async ({ input }) => {
      const { id, ...updates } = input;
      
      const updateData: any = {};
      if (updates.title) updateData.title = updates.title;
      if (updates.message) updateData.message = updates.message;
      if (updates.targetType) updateData.targetType = updates.targetType;
      if (updates.isActive !== undefined) updateData.isActive = updates.isActive;
      if (updates.expiresAt !== undefined) {
        updateData.expiresAt = updates.expiresAt ? new Date(updates.expiresAt) : null;
      }

      await db.update(announcement)
        .set(updateData)
        .where(eq(announcement.id, id));

      return { success: true, message: 'Announcement updated' };
    }),

  // Delete announcement (Admin only)
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
      await db.delete(announcement)
        .where(eq(announcement.id, input.id));

      return { success: true, message: 'Announcement deleted' };
    }),

  // Toggle active status (Admin only)
  toggleActive: adminProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
      const existing = await db.select()
        .from(announcement)
        .where(eq(announcement.id, input.id))
        .limit(1);

      if (!existing || existing.length === 0) {
        throw new Error('Announcement not found');
      }

      const currentStatus = existing[0]!.isActive;

      await db.update(announcement)
        .set({ isActive: !currentStatus })
        .where(eq(announcement.id, input.id));

      return { success: true, isActive: !currentStatus };
    }),
});
