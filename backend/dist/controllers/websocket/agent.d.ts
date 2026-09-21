import { z } from 'zod';
export declare const agentController: {
    getPendingOrders: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
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
            customerName: any;
            customerPhone: any;
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
            customerName: any;
            customerPhone: any;
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
    getAllOrders: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
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
            customerName: any;
            customerPhone: any;
            driverName: any;
            driverPhone: any;
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
            customerName: any;
            customerPhone: any;
            driverName: any;
            driverPhone: any;
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
    getOrderById: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
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
        order: {
            customerName: any;
            customerPhone: any;
            driverName: any;
            driverPhone: any;
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
        };
    }, {
        order: {
            customerName: any;
            customerPhone: any;
            driverName: any;
            driverPhone: any;
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
        };
    }>, Record<never, never>, Record<never, never>>;
    getAssignedOrders: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
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
            customerName: any;
            customerPhone: any;
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
            customerName: any;
            customerPhone: any;
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
    getApprovedByAgentOrders: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
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
            customerName: any;
            customerPhone: any;
            agentName: any;
            agentPhone: any;
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
            customerName: any;
            customerPhone: any;
            agentName: any;
            agentPhone: any;
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
};
//# sourceMappingURL=agent.d.ts.map