import { z } from 'zod';
export declare const adminTownManagerController: {
    getReport: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
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
    }>, z.ZodOptional<z.ZodObject<{
        search: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>, import("@orpc/server").Schema<{
        success: boolean;
        managers: {
            userId: any;
            name: any;
            phone: any;
            email: any;
            status: any;
            approvalStatus: any;
            townName: any;
            cityName: any;
            region: any;
            agentCount: number;
            totalRegisteredUsers: number;
            activeUsers: number;
            totalDrivers: number;
            totalOrders: number;
            totalRevenue: string;
            conversionRate: number;
        }[];
        totals: {
            totalRevenue: string;
            totalManagers: number;
            totalAgents: number;
            totalUsers: number;
            totalActive: number;
            totalDrivers: number;
            totalOrders: number;
        };
    }, {
        success: boolean;
        managers: {
            userId: any;
            name: any;
            phone: any;
            email: any;
            status: any;
            approvalStatus: any;
            townName: any;
            cityName: any;
            region: any;
            agentCount: number;
            totalRegisteredUsers: number;
            activeUsers: number;
            totalDrivers: number;
            totalOrders: number;
            totalRevenue: string;
            conversionRate: number;
        }[];
        totals: {
            totalRevenue: string;
            totalManagers: number;
            totalAgents: number;
            totalUsers: number;
            totalActive: number;
            totalDrivers: number;
            totalOrders: number;
        };
    }>, Record<never, never>, Record<never, never>>;
    listByCity: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
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
        cityName: z.ZodString;
    }, z.core.$strip>, import("@orpc/server").Schema<{
        success: boolean;
        managers: ({
            userId: string;
            name: any;
            phone: any;
            townName: string;
            cityName: string;
        } | {
            userId: string;
            name: any;
            phone: any;
            townName: string;
            cityName: string;
        })[];
    }, {
        success: boolean;
        managers: ({
            userId: string;
            name: any;
            phone: any;
            townName: string;
            cityName: string;
        } | {
            userId: string;
            name: any;
            phone: any;
            townName: string;
            cityName: string;
        })[];
    }>, Record<never, never>, Record<never, never>>;
};
//# sourceMappingURL=town-manager.d.ts.map