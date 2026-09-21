import { z } from 'zod';
export declare const customerController: {
    subscribeToOrderUpdates: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
        user: {
            id: string;
            name: string;
            email: string | null;
            role: import("../../database/schema/auth-schema.js").UserRole;
            phoneNumber: string;
        } | null;
        authenticated: boolean;
    } & Record<never, never>, {
        user: {
            id: string;
            name: string;
            email: string | null;
            role: import("../../database/schema/auth-schema.js").UserRole;
            phoneNumber: string;
        } | null;
        authenticated: boolean;
    }, {
        user: {
            id: string;
            name: string;
            email: string | null;
            role: import("../../database/schema/auth-schema.js").UserRole;
            phoneNumber: string;
        } | null;
        authenticated: boolean;
    }>, import("@orpc/server").MergedCurrentContext<{
        user: {
            id: string;
            name: string;
            email: string | null;
            role: import("../../database/schema/auth-schema.js").UserRole;
            phoneNumber: string;
        } | null;
        authenticated: boolean;
    }, {
        user: {
            id: string;
            name: string;
            email: string | null;
            role: import("../../database/schema/auth-schema.js").UserRole;
            phoneNumber: string;
        };
    }>, z.ZodObject<{
        orderId: z.ZodString;
    }, z.core.$strip>, import("@orpc/contract").Schema<{
        success: boolean;
        message: string;
    }, {
        success: boolean;
        message: string;
    }>, Record<never, never>, Record<never, never>>;
    unsubscribeFromOrderUpdates: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
        user: {
            id: string;
            name: string;
            email: string | null;
            role: import("../../database/schema/auth-schema.js").UserRole;
            phoneNumber: string;
        } | null;
        authenticated: boolean;
    } & Record<never, never>, {
        user: {
            id: string;
            name: string;
            email: string | null;
            role: import("../../database/schema/auth-schema.js").UserRole;
            phoneNumber: string;
        } | null;
        authenticated: boolean;
    }, {
        user: {
            id: string;
            name: string;
            email: string | null;
            role: import("../../database/schema/auth-schema.js").UserRole;
            phoneNumber: string;
        } | null;
        authenticated: boolean;
    }>, import("@orpc/server").MergedCurrentContext<{
        user: {
            id: string;
            name: string;
            email: string | null;
            role: import("../../database/schema/auth-schema.js").UserRole;
            phoneNumber: string;
        } | null;
        authenticated: boolean;
    }, {
        user: {
            id: string;
            name: string;
            email: string | null;
            role: import("../../database/schema/auth-schema.js").UserRole;
            phoneNumber: string;
        };
    }>, z.ZodObject<{
        orderId: z.ZodString;
    }, z.core.$strip>, import("@orpc/contract").Schema<{
        success: boolean;
        message: string;
    }, {
        success: boolean;
        message: string;
    }>, Record<never, never>, Record<never, never>>;
    getMyOrders: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
        user: {
            id: string;
            name: string;
            email: string | null;
            role: import("../../database/schema/auth-schema.js").UserRole;
            phoneNumber: string;
        } | null;
        authenticated: boolean;
    } & Record<never, never>, {
        user: {
            id: string;
            name: string;
            email: string | null;
            role: import("../../database/schema/auth-schema.js").UserRole;
            phoneNumber: string;
        } | null;
        authenticated: boolean;
    }, {
        user: {
            id: string;
            name: string;
            email: string | null;
            role: import("../../database/schema/auth-schema.js").UserRole;
            phoneNumber: string;
        } | null;
        authenticated: boolean;
    }>, import("@orpc/server").MergedCurrentContext<{
        user: {
            id: string;
            name: string;
            email: string | null;
            role: import("../../database/schema/auth-schema.js").UserRole;
            phoneNumber: string;
        } | null;
        authenticated: boolean;
    }, {
        user: {
            id: string;
            name: string;
            email: string | null;
            role: import("../../database/schema/auth-schema.js").UserRole;
            phoneNumber: string;
        };
    }>, import("@orpc/contract").Schema<unknown, unknown>, import("@orpc/contract").Schema<{
        orders: {
            id: string;
            customerId: string;
            driverId: string;
            agentId: string;
            pickupAddress: string;
            pickupLatitude: string;
            pickupLongitude: string;
            deliveryAddress: string;
            deliveryLatitude: string;
            deliveryLongitude: string;
            materials: unknown;
            vehicleType: string;
            notes: string;
            estimatedPrice: string;
            finalPrice: string;
            agentFee: string;
            status: string;
            rejectionReason: string;
            createdAt: Date;
            updatedAt: Date;
            approvedAt: Date;
            rejectedAt: Date;
            assignedAt: Date;
            pickedUpAt: Date;
            deliveredAt: Date;
            completedAt: Date;
        }[];
    }, {
        orders: {
            id: string;
            customerId: string;
            driverId: string;
            agentId: string;
            pickupAddress: string;
            pickupLatitude: string;
            pickupLongitude: string;
            deliveryAddress: string;
            deliveryLatitude: string;
            deliveryLongitude: string;
            materials: unknown;
            vehicleType: string;
            notes: string;
            estimatedPrice: string;
            finalPrice: string;
            agentFee: string;
            status: string;
            rejectionReason: string;
            createdAt: Date;
            updatedAt: Date;
            approvedAt: Date;
            rejectedAt: Date;
            assignedAt: Date;
            pickedUpAt: Date;
            deliveredAt: Date;
            completedAt: Date;
        }[];
    }>, Record<never, never>, Record<never, never>>;
    getOrderOffers: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
        user: {
            id: string;
            name: string;
            email: string | null;
            role: import("../../database/schema/auth-schema.js").UserRole;
            phoneNumber: string;
        } | null;
        authenticated: boolean;
    } & Record<never, never>, {
        user: {
            id: string;
            name: string;
            email: string | null;
            role: import("../../database/schema/auth-schema.js").UserRole;
            phoneNumber: string;
        } | null;
        authenticated: boolean;
    }, {
        user: {
            id: string;
            name: string;
            email: string | null;
            role: import("../../database/schema/auth-schema.js").UserRole;
            phoneNumber: string;
        } | null;
        authenticated: boolean;
    }>, import("@orpc/server").MergedCurrentContext<{
        user: {
            id: string;
            name: string;
            email: string | null;
            role: import("../../database/schema/auth-schema.js").UserRole;
            phoneNumber: string;
        } | null;
        authenticated: boolean;
    }, {
        user: {
            id: string;
            name: string;
            email: string | null;
            role: import("../../database/schema/auth-schema.js").UserRole;
            phoneNumber: string;
        };
    }>, z.ZodObject<{
        orderId: z.ZodString;
    }, z.core.$strip>, import("@orpc/contract").Schema<{
        offers: {
            id: string;
            driverId: string;
            driverName: any;
            driverPhone: any;
            vehicleInfo: string;
            offeredPrice: string;
            createdAt: Date;
        }[];
    }, {
        offers: {
            id: string;
            driverId: string;
            driverName: any;
            driverPhone: any;
            vehicleInfo: string;
            offeredPrice: string;
            createdAt: Date;
        }[];
    }>, Record<never, never>, Record<never, never>>;
    acceptOffer: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
        user: {
            id: string;
            name: string;
            email: string | null;
            role: import("../../database/schema/auth-schema.js").UserRole;
            phoneNumber: string;
        } | null;
        authenticated: boolean;
    } & Record<never, never>, {
        user: {
            id: string;
            name: string;
            email: string | null;
            role: import("../../database/schema/auth-schema.js").UserRole;
            phoneNumber: string;
        } | null;
        authenticated: boolean;
    }, {
        user: {
            id: string;
            name: string;
            email: string | null;
            role: import("../../database/schema/auth-schema.js").UserRole;
            phoneNumber: string;
        } | null;
        authenticated: boolean;
    }>, import("@orpc/server").MergedCurrentContext<{
        user: {
            id: string;
            name: string;
            email: string | null;
            role: import("../../database/schema/auth-schema.js").UserRole;
            phoneNumber: string;
        } | null;
        authenticated: boolean;
    }, {
        user: {
            id: string;
            name: string;
            email: string | null;
            role: import("../../database/schema/auth-schema.js").UserRole;
            phoneNumber: string;
        };
    }>, z.ZodObject<{
        offerId: z.ZodString;
    }, z.core.$strip>, import("@orpc/contract").Schema<{
        success: boolean;
        message: string;
    }, {
        success: boolean;
        message: string;
    }>, Record<never, never>, Record<never, never>>;
    rejectOffer: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
        user: {
            id: string;
            name: string;
            email: string | null;
            role: import("../../database/schema/auth-schema.js").UserRole;
            phoneNumber: string;
        } | null;
        authenticated: boolean;
    } & Record<never, never>, {
        user: {
            id: string;
            name: string;
            email: string | null;
            role: import("../../database/schema/auth-schema.js").UserRole;
            phoneNumber: string;
        } | null;
        authenticated: boolean;
    }, {
        user: {
            id: string;
            name: string;
            email: string | null;
            role: import("../../database/schema/auth-schema.js").UserRole;
            phoneNumber: string;
        } | null;
        authenticated: boolean;
    }>, import("@orpc/server").MergedCurrentContext<{
        user: {
            id: string;
            name: string;
            email: string | null;
            role: import("../../database/schema/auth-schema.js").UserRole;
            phoneNumber: string;
        } | null;
        authenticated: boolean;
    }, {
        user: {
            id: string;
            name: string;
            email: string | null;
            role: import("../../database/schema/auth-schema.js").UserRole;
            phoneNumber: string;
        };
    }>, z.ZodObject<{
        offerId: z.ZodString;
    }, z.core.$strip>, import("@orpc/contract").Schema<{
        success: boolean;
        message: string;
    }, {
        success: boolean;
        message: string;
    }>, Record<never, never>, Record<never, never>>;
};
export declare const notifyOrderSubscribers: (orderId: string, updateData: any) => Promise<void>;
export declare const notifyCustomerNewOffer: (orderId: string, offerData: any) => Promise<void>;
//# sourceMappingURL=customer.d.ts.map