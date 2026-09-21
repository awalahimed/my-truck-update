import { z } from 'zod';
export declare const orderController: {
    create: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
        req?: Request;
    } & Record<never, never>, {
        req?: Request;
    }, {
        req?: Request;
    }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        pickupAddress: z.ZodString;
        pickupLatitude: z.ZodNumber;
        pickupLongitude: z.ZodNumber;
        deliveryAddress: z.ZodString;
        deliveryLatitude: z.ZodNumber;
        deliveryLongitude: z.ZodNumber;
        materials: z.ZodArray<z.ZodString>;
        vehicleType: z.ZodEnum<{
            motorcycle: "motorcycle";
            car: "car";
            truck: "truck";
        }>;
        notes: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>, import("@orpc/server").Schema<{
        success: boolean;
        orderId: string;
        message: string;
    }, {
        success: boolean;
        orderId: string;
        message: string;
    }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    callCenterApprove: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
        req?: Request;
    } & Record<never, never>, {
        req?: Request;
    }, {
        req?: Request;
    }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        orderId: z.ZodString;
    }, z.core.$strip>, import("@orpc/server").Schema<{
        success: boolean;
        message: string;
    }, {
        success: boolean;
        message: string;
    }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    getCallCenterPendingOrders: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
        req?: Request;
    } & Record<never, never>, {
        req?: Request;
    }, {
        req?: Request;
    }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        orders: {
            customerName: any;
            customerPhone: any;
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
        success: boolean;
        orders: {
            customerName: any;
            customerPhone: any;
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
    }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    getNearbyAgents: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
        req?: Request;
    } & Record<never, never>, {
        req?: Request;
    }, {
        req?: Request;
    }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        orderId: z.ZodString;
    }, z.core.$strip>, import("@orpc/server").Schema<{
        success: boolean;
        agents: {
            id: any;
            name: any;
            phoneNumber: any;
            latitude: any;
            longitude: any;
            distance: any;
        }[];
    }, {
        success: boolean;
        agents: {
            id: any;
            name: any;
            phoneNumber: any;
            latitude: any;
            longitude: any;
            distance: any;
        }[];
    }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    callCenterReject: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
        req?: Request;
    } & Record<never, never>, {
        req?: Request;
    }, {
        req?: Request;
    }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        orderId: z.ZodString;
        reason: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>, import("@orpc/server").Schema<{
        success: boolean;
        message: string;
    }, {
        success: boolean;
        message: string;
    }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    callCenterSelectAgent: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
        req?: Request;
    } & Record<never, never>, {
        req?: Request;
    }, {
        req?: Request;
    }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        orderId: z.ZodString;
        agentId: z.ZodString;
    }, z.core.$strip>, import("@orpc/server").Schema<{
        success: boolean;
        message: string;
    }, {
        success: boolean;
        message: string;
    }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    agentApproveOrder: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
        req?: Request;
    } & Record<never, never>, {
        req?: Request;
    }, {
        req?: Request;
    }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        orderId: z.ZodString;
        notes: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>, import("@orpc/server").Schema<{
        success: boolean;
        message: string;
    }, {
        success: boolean;
        message: string;
    }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    agentRejectOrder: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
        req?: Request;
    } & Record<never, never>, {
        req?: Request;
    }, {
        req?: Request;
    }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        orderId: z.ZodString;
        reason: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>, import("@orpc/server").Schema<{
        success: boolean;
        message: string;
    }, {
        success: boolean;
        message: string;
    }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    callCenterFinalApprove: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
        req?: Request;
    } & Record<never, never>, {
        req?: Request;
    }, {
        req?: Request;
    }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        orderId: z.ZodString;
    }, z.core.$strip>, import("@orpc/server").Schema<{
        success: boolean;
        message: string;
    }, {
        success: boolean;
        message: string;
    }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    callCenterApproveWithAgent: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
        req?: Request;
    } & Record<never, never>, {
        req?: Request;
    }, {
        req?: Request;
    }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        orderId: z.ZodString;
        agentId: z.ZodString;
    }, z.core.$strip>, import("@orpc/server").Schema<{
        success: boolean;
        message: string;
    }, {
        success: boolean;
        message: string;
    }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    getPendingOrders: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<import("@orpc/server").MergedInitialContext<{
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
    }>>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<import("@orpc/server").MergedCurrentContext<{
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
    }>, Record<never, never>>, z.ZodOptional<z.ZodObject<{
        vehicleType: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>, import("@orpc/server").Schema<{
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
    }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    getMyOrders: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
        req?: Request;
    } & Record<never, never>, {
        req?: Request;
    }, {
        req?: Request;
    }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        success: boolean;
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
    }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    getById: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
        req?: Request;
    } & Record<never, never>, {
        req?: Request;
    }, {
        req?: Request;
    }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        orderId: z.ZodString;
    }, z.core.$strip>, import("@orpc/server").Schema<{
        success: boolean;
        order: {
            driver: {
                id: string;
                name: string;
                phone: string;
                vehicleInfo: string;
                profilePhoto?: string;
            };
            id: string;
            createdAt: Date;
            updatedAt: Date;
            rejectionReason: string;
            rejectedAt: Date;
            status: string;
            driverId: string;
            customerId: string;
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
            approvedAt: Date;
            assignedAt: Date;
            pickedUpAt: Date;
            deliveredAt: Date;
            completedAt: Date;
        };
    }, {
        success: boolean;
        order: {
            driver: {
                id: string;
                name: string;
                phone: string;
                vehicleInfo: string;
                profilePhoto?: string;
            };
            id: string;
            createdAt: Date;
            updatedAt: Date;
            rejectionReason: string;
            rejectedAt: Date;
            status: string;
            driverId: string;
            customerId: string;
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
            approvedAt: Date;
            assignedAt: Date;
            pickedUpAt: Date;
            deliveredAt: Date;
            completedAt: Date;
        };
    }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    getOrderOffers: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
        req?: Request;
    } & Record<never, never>, {
        req?: Request;
    }, {
        req?: Request;
    }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        orderId: z.ZodString;
    }, z.core.$strip>, import("@orpc/server").Schema<{
        success: boolean;
        offers: {
            id: string;
            driverId: string;
            driverName: any;
            driverPhone: any;
            driverImage: string;
            vehicleInfo: string;
            vehicleType: string;
            vehicleImage: string;
            plateNumber: string;
            offeredPrice: string;
            createdAt: Date;
        }[];
    }, {
        success: boolean;
        offers: {
            id: string;
            driverId: string;
            driverName: any;
            driverPhone: any;
            driverImage: string;
            vehicleInfo: string;
            vehicleType: string;
            vehicleImage: string;
            plateNumber: string;
            offeredPrice: string;
            createdAt: Date;
        }[];
    }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    acceptOffer: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
        req?: Request;
    } & Record<never, never>, {
        req?: Request;
    }, {
        req?: Request;
    }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        offerId: z.ZodString;
    }, z.core.$strip>, import("@orpc/server").Schema<{
        success: boolean;
        message: string;
    }, {
        success: boolean;
        message: string;
    }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    getMyOffers: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<import("@orpc/server").MergedInitialContext<{
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
    }>>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<import("@orpc/server").MergedCurrentContext<{
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
    }>, Record<never, never>>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
        success: boolean;
        offers: {
            id: string;
            orderId: string;
            offeredPrice: string;
            status: string;
            createdAt: Date;
            respondedAt: Date;
            pickupAddress: string;
            deliveryAddress: string;
            materials: unknown;
            vehicleType: string;
            orderStatus: string;
        }[];
    }, {
        success: boolean;
        offers: {
            id: string;
            orderId: string;
            offeredPrice: string;
            status: string;
            createdAt: Date;
            respondedAt: Date;
            pickupAddress: string;
            deliveryAddress: string;
            materials: unknown;
            vehicleType: string;
            orderStatus: string;
        }[];
    }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    cancel: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
        req?: Request;
    } & Record<never, never>, {
        req?: Request;
    }, {
        req?: Request;
    }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        orderId: z.ZodString;
    }, z.core.$strip>, import("@orpc/server").Schema<{
        success: boolean;
        message: string;
    }, {
        success: boolean;
        message: string;
    }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    updateOrderStatus: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
        req?: Request;
    } & Record<never, never>, {
        req?: Request;
    }, {
        req?: Request;
    }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        orderId: z.ZodString;
        status: z.ZodEnum<{
            completed: "completed";
            on_the_way: "on_the_way";
            delivered: "delivered";
        }>;
    }, z.core.$strip>, import("@orpc/server").Schema<{
        success: boolean;
        message: string;
    }, {
        success: boolean;
        message: string;
    }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
};
//# sourceMappingURL=order.d.ts.map