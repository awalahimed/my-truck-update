import { os } from '@orpc/server';
import { z } from 'zod';
import { eq, desc, and } from 'drizzle-orm';
import { db } from '../database/db.js';
import { user } from '../database/schema/auth-schema.js';
import { notification } from '../database/schema/notification-schema.js';
import { logger } from '../utils/logger.js';
import { authProcedure } from '../middlewares/auth.js';
import { softDeleteAccount } from './app-auth/softdelete.js';
// Toggle notification preference
const toggleNotifications = os.handler(async (ctx) => {
    const input = z.object({
        userId: z.string(),
        enabled: z.boolean(),
    }).parse(ctx.input);
    try {
        // Update user notification preference
        await db
            .update(user)
            .set({
            notificationsEnabled: input.enabled,
            updatedAt: new Date(),
        })
            .where(eq(user.id, input.userId));
        logger.info(`User ${input.userId} ${input.enabled ? 'enabled' : 'disabled'} notifications`);
        return {
            success: true,
            message: `Notifications ${input.enabled ? 'enabled' : 'disabled'} successfully`,
        };
    }
    catch (error) {
        logger.error('Error toggling notifications:', error);
        throw new Error('Failed to update notification preference');
    }
});
// Get notification preference
const getNotificationPreference = os.handler(async (ctx) => {
    const input = z.object({
        userId: z.string(),
    }).parse(ctx.input);
    try {
        const userRecord = await db
            .select({ notificationsEnabled: user.notificationsEnabled })
            .from(user)
            .where(eq(user.id, input.userId))
            .limit(1);
        if (!userRecord.length) {
            throw new Error('User not found');
        }
        return {
            success: true,
            notificationsEnabled: userRecord[0]?.notificationsEnabled ?? true,
        };
    }
    catch (error) {
        logger.error('Error getting notification preference:', error);
        throw new Error('Failed to get notification preference');
    }
});
export const notifications = {
    toggleNotifications,
    getNotificationPreference,
    softDeleteAccount,
    getUserNotifications: authProcedure.handler(async (ctx) => {
        const input = z.object({
            limit: z.number().optional().default(50),
        }).parse(ctx.input);
        try {
            const notifications = await db
                .select({
                id: notification.id,
                title: notification.title,
                message: notification.message,
                type: notification.type,
                read: notification.read,
                createdAt: notification.createdAt,
            })
                .from(notification)
                .where(eq(notification.userId, ctx.context.user.id))
                .orderBy(desc(notification.createdAt))
                .limit(input.limit);
            return {
                success: true,
                notifications,
            };
        }
        catch (error) {
            logger.error('Error getting notifications:', error);
            throw new Error('Failed to get notifications');
        }
    }),
    getUnreadCount: authProcedure.handler(async (ctx) => {
        try {
            const unreadNotifications = await db
                .select({
                id: notification.id,
            })
                .from(notification)
                .where(and(eq(notification.userId, ctx.context.user.id), eq(notification.read, false)));
            return {
                success: true,
                count: unreadNotifications.length,
            };
        }
        catch (error) {
            logger.error('Error getting unread count:', error);
            throw new Error('Failed to get unread count');
        }
    }),
    markAsRead: authProcedure.handler(async (ctx) => {
        const input = z.object({
            notificationId: z.string(),
        }).parse(ctx.input);
        try {
            await db
                .update(notification)
                .set({ read: true, updatedAt: new Date() })
                .where(and(eq(notification.id, input.notificationId), eq(notification.userId, ctx.context.user.id)));
            return {
                success: true,
                message: 'Notification marked as read',
            };
        }
        catch (error) {
            logger.error('Error marking notification as read:', error);
            throw new Error('Failed to mark notification as read');
        }
    }),
};
//# sourceMappingURL=notifications.js.map