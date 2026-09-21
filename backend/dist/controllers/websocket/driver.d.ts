import { z } from 'zod';
export declare const driverController: {
    createOffer: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<import("@orpc/server").MergedInitialContext<{
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
    }>>, import("@orpc/server").MergedCurrentContext<import("@orpc/server").MergedCurrentContext<{
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
    }>, Record<never, never>>, z.ZodObject<{
        orderId: z.ZodString;
        offeredPrice: z.ZodNumber;
    }, z.core.$strip>, import("@orpc/contract").Schema<{
        success: boolean;
        message: string;
        offerId: string;
    }, {
        success: boolean;
        message: string;
        offerId: string;
    }>, Record<never, never>, Record<never, never>>;
    getAvailableOrders: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<import("@orpc/server").MergedInitialContext<{
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
    }>>, import("@orpc/server").MergedCurrentContext<import("@orpc/server").MergedCurrentContext<{
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
    }>, Record<never, never>>, import("@orpc/contract").Schema<unknown, unknown>, import("@orpc/contract").Schema<{
        orders: any[];
        isLocked: boolean;
        lockedOrderId: any;
        accountStatus: any;
        message: string;
    } | {
        orders: {
            materials: unknown;
            driverOffer: any;
            driverOfferId: any;
            hasOffer: boolean;
            customerName: any;
            customerPhone: any;
            customerProfilePhoto: string;
            pickupLocation: {
                latitude: string;
                longitude: string;
            };
            deliveryLocation: {
                latitude: string;
                longitude: string;
            };
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
        isLocked: boolean;
        lockedOrderId: string;
        accountStatus?: undefined;
        message?: undefined;
    } | {
        orders: {
            materials: unknown;
            driverOffer: string;
            driverOfferId: string;
            hasOffer: boolean;
            customerName: string;
            customerPhone: any;
            customerProfilePhoto: string;
            pickupLocation: {
                latitude: string;
                longitude: string;
            };
            deliveryLocation: {
                latitude: string;
                longitude: string;
            };
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
        isLocked: boolean;
        lockedOrderId: any;
        accountStatus?: undefined;
        message?: undefined;
    }, {
        orders: any[];
        isLocked: boolean;
        lockedOrderId: any;
        accountStatus: any;
        message: string;
    } | {
        orders: {
            materials: unknown;
            driverOffer: any;
            driverOfferId: any;
            hasOffer: boolean;
            customerName: any;
            customerPhone: any;
            customerProfilePhoto: string;
            pickupLocation: {
                latitude: string;
                longitude: string;
            };
            deliveryLocation: {
                latitude: string;
                longitude: string;
            };
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
        isLocked: boolean;
        lockedOrderId: string;
        accountStatus?: undefined;
        message?: undefined;
    } | {
        orders: {
            materials: unknown;
            driverOffer: string;
            driverOfferId: string;
            hasOffer: boolean;
            customerName: string;
            customerPhone: any;
            customerProfilePhoto: string;
            pickupLocation: {
                latitude: string;
                longitude: string;
            };
            deliveryLocation: {
                latitude: string;
                longitude: string;
            };
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
        isLocked: boolean;
        lockedOrderId: any;
        accountStatus?: undefined;
        message?: undefined;
    }>, Record<never, never>, Record<never, never>>;
    getMyOffers: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<import("@orpc/server").MergedInitialContext<{
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
    }>>, import("@orpc/server").MergedCurrentContext<import("@orpc/server").MergedCurrentContext<{
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
    }>, Record<never, never>>, import("@orpc/contract").Schema<unknown, unknown>, import("@orpc/contract").Schema<{
        offers: {
            id: string;
            orderId: string;
            driverId: string;
            offeredPrice: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            respondedAt: Date;
        }[];
    }, {
        offers: {
            id: string;
            orderId: string;
            driverId: string;
            offeredPrice: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            respondedAt: Date;
        }[];
    }>, Record<never, never>, Record<never, never>>;
    cancelOffer: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<import("@orpc/server").MergedInitialContext<{
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
    }>>, import("@orpc/server").MergedCurrentContext<import("@orpc/server").MergedCurrentContext<{
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
    }>, Record<never, never>>, z.ZodObject<{
        offerId: z.ZodString;
    }, z.core.$strip>, import("@orpc/contract").Schema<{
        success: boolean;
        message: string;
    }, {
        success: boolean;
        message: string;
    }>, Record<never, never>, Record<never, never>>;
    updateLocation: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<import("@orpc/server").MergedInitialContext<{
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
    }>>, import("@orpc/server").MergedCurrentContext<import("@orpc/server").MergedCurrentContext<{
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
    }>, Record<never, never>>, z.ZodObject<{
        latitude: z.ZodNumber;
        longitude: z.ZodNumber;
    }, z.core.$strip>, import("@orpc/contract").Schema<{
        success: boolean;
    }, {
        success: boolean;
    }>, Record<never, never>, Record<never, never>>;
    getMyOrders: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<import("@orpc/server").MergedInitialContext<{
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
    }>>, import("@orpc/server").MergedCurrentContext<import("@orpc/server").MergedCurrentContext<{
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
    }>, Record<never, never>>, import("@orpc/contract").Schema<unknown, unknown>, import("@orpc/contract").Schema<{
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
    getMyVehicle: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<import("@orpc/server").MergedInitialContext<{
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
    }>>, import("@orpc/server").MergedCurrentContext<import("@orpc/server").MergedCurrentContext<{
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
    }>, Record<never, never>>, import("@orpc/contract").Schema<unknown, unknown>, import("@orpc/contract").Schema<{
        vehicle: {
            id: string;
            driverId: string;
            type: string;
            make: string;
            model: string;
            year: string;
            plateNumber: string;
            color: string;
            capacity: string;
            registeredByAgentId: string;
            driverCycleCount: number;
            driverLifetimeEarnings: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    }, {
        vehicle: {
            id: string;
            driverId: string;
            type: string;
            make: string;
            model: string;
            year: string;
            plateNumber: string;
            color: string;
            capacity: string;
            registeredByAgentId: string;
            driverCycleCount: number;
            driverLifetimeEarnings: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    }>, Record<never, never>, Record<never, never>>;
};
//# sourceMappingURL=driver.d.ts.map