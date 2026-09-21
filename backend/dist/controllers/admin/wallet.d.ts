import { z } from 'zod';
export declare const adminWalletController: {
    getStats: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
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
        message: string;
        stats: any;
    } | {
        success: boolean;
        stats: {
            currentBalance: string;
            totalFeesCollected: string;
            monthlyFees: string;
            todayFees: string;
            totalOrders: number;
            earningsByDay: Record<string, {
                amount: number;
                count: number;
            }>;
        };
        message?: undefined;
    }, {
        success: boolean;
        message: string;
        stats: any;
    } | {
        success: boolean;
        stats: {
            currentBalance: string;
            totalFeesCollected: string;
            monthlyFees: string;
            todayFees: string;
            totalOrders: number;
            earningsByDay: Record<string, {
                amount: number;
                count: number;
            }>;
        };
        message?: undefined;
    }>, Record<never, never>, Record<never, never>>;
    getTransactions: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
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
        offset: z.ZodDefault<z.ZodNumber>;
        startDate: z.ZodOptional<z.ZodString>;
        endDate: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>, import("@orpc/contract").Schema<{
        success: boolean;
        transactions: ({
            id: string;
            amount: string;
            txRef: string;
            description: string;
            meta: unknown;
            createdAt: Date;
            fromUserName: any;
            fromUserPhone: any;
            fromUserProfilePhoto: any;
        } | {
            id: string;
            amount: string;
            txRef: string;
            description: string;
            meta: unknown;
            createdAt: Date;
            fromUserName: any;
            fromUserPhone: any;
            fromUserProfilePhoto: any;
        })[];
        total: number;
        limit: number;
        offset: number;
    }, {
        success: boolean;
        transactions: ({
            id: string;
            amount: string;
            txRef: string;
            description: string;
            meta: unknown;
            createdAt: Date;
            fromUserName: any;
            fromUserPhone: any;
            fromUserProfilePhoto: any;
        } | {
            id: string;
            amount: string;
            txRef: string;
            description: string;
            meta: unknown;
            createdAt: Date;
            fromUserName: any;
            fromUserPhone: any;
            fromUserProfilePhoto: any;
        })[];
        total: number;
        limit: number;
        offset: number;
    }>, Record<never, never>, Record<never, never>>;
    getWithdrawals: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
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
        offset: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strip>, import("@orpc/contract").Schema<{
        success: boolean;
        withdrawals: {
            id: string;
            amount: string;
            txRef: string;
            description: string;
            status: import("../../database/schema/payment-schema.js").PaymentStatus;
            createdAt: Date;
        }[];
        total: number;
        limit: number;
        offset: number;
    }, {
        success: boolean;
        withdrawals: {
            id: string;
            amount: string;
            txRef: string;
            description: string;
            status: import("../../database/schema/payment-schema.js").PaymentStatus;
            createdAt: Date;
        }[];
        total: number;
        limit: number;
        offset: number;
    }>, Record<never, never>, Record<never, never>>;
    createPlatformWallet: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
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
        message: string;
    }, {
        success: boolean;
        message: string;
    }>, Record<never, never>, Record<never, never>>;
};
//# sourceMappingURL=wallet.d.ts.map