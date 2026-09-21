interface NotificationPayload {
    title: string;
    body: string;
    type?: string;
    data?: Record<string, any>;
}
/**
 * Create in-app notification for a user
 */
export declare const createNotification: (userId: string, payload: NotificationPayload) => Promise<boolean>;
/**
 * Create notifications for multiple users
 */
export declare const createNotifications: (userIds: string[], payload: NotificationPayload) => Promise<{
    successCount: number;
    failureCount: number;
}>;
/**
 * Send critical alert via SMS and Email to a user (if contact info available)
 */
export declare const sendCriticalAlertToUser: (userId: string, payload: NotificationPayload) => Promise<{
    email: boolean;
    sms: boolean;
}>;
export {};
//# sourceMappingURL=notification.d.ts.map