export declare const ownerController: {
    getAllOrders: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<import("@orpc/server").MergedInitialContext<{
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
        orders: ({
            id: string;
            status: string;
            pickupAddress: string;
            deliveryAddress: string;
            vehicleType: string;
            estimatedPrice: string;
            finalPrice: string;
            createdAt: Date;
            customerPhone: any;
        } | {
            id: string;
            status: string;
            pickupAddress: string;
            deliveryAddress: string;
            vehicleType: string;
            estimatedPrice: string;
            finalPrice: string;
            createdAt: Date;
            customerPhone: any;
        })[];
    }, {
        orders: ({
            id: string;
            status: string;
            pickupAddress: string;
            deliveryAddress: string;
            vehicleType: string;
            estimatedPrice: string;
            finalPrice: string;
            createdAt: Date;
            customerPhone: any;
        } | {
            id: string;
            status: string;
            pickupAddress: string;
            deliveryAddress: string;
            vehicleType: string;
            estimatedPrice: string;
            finalPrice: string;
            createdAt: Date;
            customerPhone: any;
        })[];
    }>, Record<never, never>, Record<never, never>>;
    getDriverLocations: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<import("@orpc/server").MergedInitialContext<{
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
        drivers: any[];
    }, {
        drivers: any[];
    }>, Record<never, never>, Record<never, never>>;
};
//# sourceMappingURL=owner.d.ts.map