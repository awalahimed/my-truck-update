import { z } from 'zod';
export declare const adminReferralController: {
    getAnalytics: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
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
    }>, import("@orpc/contract").Schema<unknown, unknown>, import("@orpc/contract").Schema<{
        success: boolean;
        analytics: {
            totalReferrals: number;
            completedReferrals: number;
            pendingReferrals: number;
            expiredReferrals: number;
            totalRewardsPaid: string;
            conversionRate: string;
            referralsByMonth: Record<string, number>;
        };
    }, {
        success: boolean;
        analytics: {
            totalReferrals: number;
            completedReferrals: number;
            pendingReferrals: number;
            expiredReferrals: number;
            totalRewardsPaid: string;
            conversionRate: string;
            referralsByMonth: Record<string, number>;
        };
    }>, Record<never, never>, Record<never, never>>;
    getConfig: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
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
    }>, import("@orpc/contract").Schema<unknown, unknown>, import("@orpc/contract").Schema<{
        success: boolean;
        config: {
            referrerRewardAmount: string;
            refereeRewardAmount: string;
            minOrderAmount: string;
            expiryDays: number;
            enabled: boolean;
        };
    } | {
        success: boolean;
        config: {
            id: string;
            referrerRewardAmount: string;
            refereeRewardAmount: string;
            minOrderAmount: string;
            expiryDays: number;
            enabled: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    }, {
        success: boolean;
        config: {
            referrerRewardAmount: string;
            refereeRewardAmount: string;
            minOrderAmount: string;
            expiryDays: number;
            enabled: boolean;
        };
    } | {
        success: boolean;
        config: {
            id: string;
            referrerRewardAmount: string;
            refereeRewardAmount: string;
            minOrderAmount: string;
            expiryDays: number;
            enabled: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    }>, Record<never, never>, Record<never, never>>;
    updateConfig: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
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
    }>, z.ZodObject<{
        referrerRewardAmount: z.ZodOptional<z.ZodString>;
        refereeRewardAmount: z.ZodOptional<z.ZodString>;
        minOrderAmount: z.ZodOptional<z.ZodString>;
        expiryDays: z.ZodOptional<z.ZodNumber>;
        enabled: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>, import("@orpc/contract").Schema<{
        success: boolean;
        message: string;
    }, {
        success: boolean;
        message: string;
    }>, Record<never, never>, Record<never, never>>;
    getTopReferrers: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
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
    }>, z.ZodObject<{
        limit: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strip>, import("@orpc/contract").Schema<{
        success: boolean;
        topReferrers: ({
            totalEarned: string;
            completedReferrals: number;
            userId: any;
            name: any;
            phoneNumber: any;
            referralCode: any;
            referralCount: any;
        } | {
            totalEarned: string;
            completedReferrals: number;
            userId: any;
            name: any;
            phoneNumber: any;
            referralCode: any;
            referralCount: any;
        })[];
    }, {
        success: boolean;
        topReferrers: ({
            totalEarned: string;
            completedReferrals: number;
            userId: any;
            name: any;
            phoneNumber: any;
            referralCode: any;
            referralCount: any;
        } | {
            totalEarned: string;
            completedReferrals: number;
            userId: any;
            name: any;
            phoneNumber: any;
            referralCode: any;
            referralCount: any;
        })[];
    }>, Record<never, never>, Record<never, never>>;
    getAllReferrals: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
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
    }>, z.ZodObject<{
        status: z.ZodOptional<z.ZodEnum<{
            pending: "pending";
            completed: "completed";
            cancelled: "cancelled";
            expired: "expired";
        }>>;
        limit: z.ZodDefault<z.ZodNumber>;
        offset: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strip>, import("@orpc/contract").Schema<{
        success: boolean;
        referrals: {
            id: string;
            status: import("../../database/schema/referral-schema.js").ReferralStatus;
            referrerReward: string;
            refereeReward: string;
            completedAt: Date;
            createdAt: Date;
            referrerName: string;
            referrerPhone: string;
            refereeName: string;
            refereePhone: string;
        }[];
        total: number;
        limit: number;
        offset: number;
    }, {
        success: boolean;
        referrals: {
            id: string;
            status: import("../../database/schema/referral-schema.js").ReferralStatus;
            referrerReward: string;
            refereeReward: string;
            completedAt: Date;
            createdAt: Date;
            referrerName: string;
            referrerPhone: string;
            refereeName: string;
            refereePhone: string;
        }[];
        total: number;
        limit: number;
        offset: number;
    }>, Record<never, never>, Record<never, never>>;
};
//# sourceMappingURL=referral.d.ts.map