// @ts-nocheck
import { db } from '../database/db.js';
import { notification } from '../database/schema/notification-schema.js';
import { user } from '../database/schema/auth-schema.js';
import { eq } from 'drizzle-orm';
import crypto from 'node:crypto';
import { logger } from '../utils/logger.js';
import { sendSMS } from '../utils/sms.js';
import { retryAsync } from '../utils/retry.js';
import { renderTemplate } from '../utils/email-templates.js';

interface NotificationPayload {
  title: string;
  body: string;
  type?: string;
  data?: Record<string, any>;
}

/**
 * Send notification via WebSocket to connected user
 */
const sendWebSocketNotification = async (userId: string, payload: NotificationPayload) => {
  try {
    const { getUserWebSocket } = await import('../utils/websocket-broadcast.js');
    const ws = getUserWebSocket(userId);
    
    if (ws && ws.readyState === 1) { // WebSocket.OPEN
      ws.send(JSON.stringify({
        type: 'notification',
        data: {
          id: crypto.randomUUID(),
          title: payload.title,
          body: payload.body,
          notificationType: payload.type || 'general',
          ...payload.data,
          timestamp: new Date().toISOString(),
        },
      }));
      logger.info('WebSocket notification sent', { userId, title: payload.title });
      return true;
    }
    return false;
  } catch (error) {
    logger.error('Failed to send WebSocket notification:', error as Error);
    return false;
  }
};

/**
 * Create in-app notification for a user
 */
export const createNotification = async (
  userId: string,
  payload: NotificationPayload
): Promise<boolean> => {
  try {
    // Check if user has notifications enabled
    const userData = await db
      .select({ notificationsEnabled: user.notificationsEnabled })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!userData.length || !userData[0]?.notificationsEnabled) {
      return false;
    }

    // Create notification in database
    const notificationId = crypto.randomUUID();
    await db.insert(notification).values({
      id: notificationId,
      userId,
      title: payload.title,
      message: payload.body,
      type: payload.type || 'general',
      data: payload.data ? JSON.stringify(payload.data) : null,
      read: false,
      createdAt: new Date(),
    });

    // Send via WebSocket if user is connected
    await sendWebSocketNotification(userId, payload);

    logger.info('In-app notification created', { userId, title: payload.title });
    return true;
  } catch (error) {
    logger.error('Failed to create notification:', error as Error);
    return false;
  }
};

/**
 * Create notifications for multiple users
 */
export const createNotifications = async (
  userIds: string[],
  payload: NotificationPayload
): Promise<{ successCount: number; failureCount: number }> => {
  let successCount = 0;
  let failureCount = 0;

  for (const userId of userIds) {
    const success = await createNotification(userId, payload);
    if (success) {
      successCount++;
    } else {
      failureCount++;
    }
  }

  return { successCount, failureCount };
};

/**
 * Send critical alert via SMS and Email to a user (if contact info available)
 */
export const sendCriticalAlertToUser = async (
  userId: string,
  payload: NotificationPayload
) => {
  try {
    const userRow = await db.select({ email: user.email, phone: user.phoneNumber }).from(user).where(eq(user.id, userId)).limit(1);
    if (!userRow.length) return { email: false, sms: false };
    const emailAddr = userRow[0].email;
    const phone = userRow[0].phone;

    // Render text template for SMS
    const tpl = renderTemplate(payload.type || 'general', {
      managerName: undefined,
      townName: payload.data?.managerId ? undefined : undefined,
      cityName: undefined,
      issuesCount: Array.isArray(payload.data?.issues) ? payload.data.issues.length : payload.data?.issuesCount,
      issues: payload.data?.issues,
    })

    let smsResult = false
    if (phone) {
      try {
        const res = await retryAsync(() => sendSMS(phone, tpl.text || payload.body), 3, 1000)
        smsResult = res.success
      } catch (err) {
        smsResult = false
      }
    }

    return { email: false, sms: smsResult };
  } catch (error) {
    logger.error('Failed to send critical alert to user:', { userId, error });
    return { email: false, sms: false };
  }
};
