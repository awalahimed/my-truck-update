export declare const adminDashboardController: {
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
        stats: {
            totalUsers: number;
            totalOrders: number;
            monthlyRevenue: string;
            totalRevenue: string;
            activeOrders: number;
            recentTransactions: number;
            roleBreakdown: Record<string, number>;
            statusBreakdown: Record<string, number>;
            ordersByDay: Record<string, number>;
            revenueByDay: Record<string, number>;
        };
    }, {
        success: boolean;
        stats: {
            totalUsers: number;
            totalOrders: number;
            monthlyRevenue: string;
            totalRevenue: string;
            activeOrders: number;
            recentTransactions: number;
            roleBreakdown: Record<string, number>;
            statusBreakdown: Record<string, number>;
            ordersByDay: Record<string, number>;
            revenueByDay: Record<string, number>;
        };
    }>, Record<never, never>, Record<never, never>>;
    getRecentActivity: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
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
        recentOrders: {
            id: string;
            status: string;
            finalPrice: string;
            createdAt: Date;
            customerName: string;
        }[];
        recentUsers: ({
            id: any;
            name: any;
            role: any;
            createdAt: any;
        } | {
            id: any;
            name: any;
            role: any;
            createdAt: any;
        })[];
    }, {
        success: boolean;
        recentOrders: {
            id: string;
            status: string;
            finalPrice: string;
            createdAt: Date;
            customerName: string;
        }[];
        recentUsers: ({
            id: any;
            name: any;
            role: any;
            createdAt: any;
        } | {
            id: any;
            name: any;
            role: any;
            createdAt: any;
        })[];
    }>, Record<never, never>, Record<never, never>>;
};
//# sourceMappingURL=dashboard.d.ts.map