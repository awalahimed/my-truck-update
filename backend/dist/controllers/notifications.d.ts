export declare const notifications: {
    toggleNotifications: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
        success: boolean;
        message: string;
    }, {
        success: boolean;
        message: string;
    }>, Record<never, never>, Record<never, never>>;
    getNotificationPreference: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
        success: boolean;
        notificationsEnabled: any;
    }, {
        success: boolean;
        notificationsEnabled: any;
    }>, Record<never, never>, Record<never, never>>;
    softDeleteAccount: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
        req?: Request;
    } & Record<never, never>, {
        req?: Request;
    }, {
        req?: Request;
    }>, import("@orpc/server").MergedCurrentContext<{
        req?: Request;
    }, {
        user: {
            id: string;
            email: string;
            name?: string;
            role?: string;
            phoneNumber?: string;
            phoneNumberVerified?: boolean;
            emailVerified?: boolean;
        };
        session: {
            id: string;
            userId: string;
            token: string;
            expiresAt: Date;
        };
        role: string;
    }>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
        success: boolean;
        message: string;
    }, {
        success: boolean;
        message: string;
    }>, Record<never, never>, Record<never, never>>;
    getUserNotifications: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
        req?: Request;
    } & Record<never, never>, {
        req?: Request;
    }, {
        req?: Request;
    }>, import("@orpc/server").MergedCurrentContext<{
        req?: Request;
    }, {
        user: {
            id: string;
            email: string;
            name?: string;
            role?: string;
            phoneNumber?: string;
            phoneNumberVerified?: boolean;
            emailVerified?: boolean;
        };
        session: {
            id: string;
            userId: string;
            token: string;
            expiresAt: Date;
        };
        role: string;
    }>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
        success: boolean;
        notifications: {
            id: string;
            title: string;
            message: string;
            type: string;
            read: boolean;
            createdAt: Date;
        }[];
    }, {
        success: boolean;
        notifications: {
            id: string;
            title: string;
            message: string;
            type: string;
            read: boolean;
            createdAt: Date;
        }[];
    }>, Record<never, never>, Record<never, never>>;
    getUnreadCount: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
        req?: Request;
    } & Record<never, never>, {
        req?: Request;
    }, {
        req?: Request;
    }>, import("@orpc/server").MergedCurrentContext<{
        req?: Request;
    }, {
        user: {
            id: string;
            email: string;
            name?: string;
            role?: string;
            phoneNumber?: string;
            phoneNumberVerified?: boolean;
            emailVerified?: boolean;
        };
        session: {
            id: string;
            userId: string;
            token: string;
            expiresAt: Date;
        };
        role: string;
    }>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
        success: boolean;
        count: number;
    }, {
        success: boolean;
        count: number;
    }>, Record<never, never>, Record<never, never>>;
    markAsRead: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
        req?: Request;
    } & Record<never, never>, {
        req?: Request;
    }, {
        req?: Request;
    }>, import("@orpc/server").MergedCurrentContext<{
        req?: Request;
    }, {
        user: {
            id: string;
            email: string;
            name?: string;
            role?: string;
            phoneNumber?: string;
            phoneNumberVerified?: boolean;
            emailVerified?: boolean;
        };
        session: {
            id: string;
            userId: string;
            token: string;
            expiresAt: Date;
        };
        role: string;
    }>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
        success: boolean;
        message: string;
    }, {
        success: boolean;
        message: string;
    }>, Record<never, never>, Record<never, never>>;
};
//# sourceMappingURL=notifications.d.ts.map