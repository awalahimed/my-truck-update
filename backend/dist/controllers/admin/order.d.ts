import { z } from 'zod';
export declare const adminOrderController: {
    getAllOrders: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
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
        page: z.ZodDefault<z.ZodNumber>;
        pageSize: z.ZodDefault<z.ZodNumber>;
        search: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodString>;
        dateFrom: z.ZodOptional<z.ZodString>;
        dateTo: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>, import("@orpc/contract").Schema<{
        success: boolean;
        stats: {
            totalToday: number;
            active: number;
            completed: number;
            cancelled: number;
            delayed: number;
            avgRevenue: string;
        };
        orders: {
            id: string;
            customerId: string;
            customerName: unknown;
            customerPhone: unknown;
            driverId: string;
            driverName: unknown;
            driverPhone: unknown;
            pickupAddress: string;
            deliveryAddress: string;
            materials: unknown;
            vehicleType: string;
            status: string;
            estimatedPrice: string;
            finalPrice: string;
            createdAt: Date;
            updatedAt: Date;
        }[];
        total: number;
        page: number;
        pageSize: number;
    }, {
        success: boolean;
        stats: {
            totalToday: number;
            active: number;
            completed: number;
            cancelled: number;
            delayed: number;
            avgRevenue: string;
        };
        orders: {
            id: string;
            customerId: string;
            customerName: unknown;
            customerPhone: unknown;
            driverId: string;
            driverName: unknown;
            driverPhone: unknown;
            pickupAddress: string;
            deliveryAddress: string;
            materials: unknown;
            vehicleType: string;
            status: string;
            estimatedPrice: string;
            finalPrice: string;
            createdAt: Date;
            updatedAt: Date;
        }[];
        total: number;
        page: number;
        pageSize: number;
    }>, Record<never, never>, Record<never, never>>;
};
//# sourceMappingURL=order.d.ts.map