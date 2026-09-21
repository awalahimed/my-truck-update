import { z } from 'zod';
export declare const adminGiveawayController: {
    getAgents: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
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
        search: z.ZodOptional<z.ZodString>;
        offset: z.ZodDefault<z.ZodNumber>;
        limit: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strip>, import("@orpc/server").Schema<{
        success: boolean;
        agents: {
            id: any;
            name: any;
            phone: any;
            email: any;
            tier: any;
            assignedCity: any;
            assignedTown: any;
            totalRegistered: number;
            totalDrivers: number;
            activeUsers: number;
            activeDrivers: number;
            inactiveUsers: number;
            conversionRate: number;
            walletBalance: any;
        }[];
        total: number;
        offset: number;
        limit: number;
    }, {
        success: boolean;
        agents: {
            id: any;
            name: any;
            phone: any;
            email: any;
            tier: any;
            assignedCity: any;
            assignedTown: any;
            totalRegistered: number;
            totalDrivers: number;
            activeUsers: number;
            activeDrivers: number;
            inactiveUsers: number;
            conversionRate: number;
            walletBalance: any;
        }[];
        total: number;
        offset: number;
        limit: number;
    }>, Record<never, never>, Record<never, never>>;
    awardBonus: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
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
        agentIds: z.ZodArray<z.ZodString>;
        amount: z.ZodNumber;
        reason: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>, import("@orpc/server").Schema<{
        success: boolean;
        succeeded: number;
        failed: number;
        totalAmount: string;
        results: {
            agentId: string;
            name: string;
            success: boolean;
            error?: string;
        }[];
    }, {
        success: boolean;
        succeeded: number;
        failed: number;
        totalAmount: string;
        results: {
            agentId: string;
            name: string;
            success: boolean;
            error?: string;
        }[];
    }>, Record<never, never>, Record<never, never>>;
};
//# sourceMappingURL=giveaway.d.ts.map