export declare const paymentMethodController: {
    getBanks: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
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
    }>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
        success: boolean;
        banks: Array<{
            id: string;
            name: string;
            swift?: string;
        }>;
    }, {
        success: boolean;
        banks: Array<{
            id: string;
            name: string;
            swift?: string;
        }>;
    }>, Record<never, never>, Record<never, never>>;
    create: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
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
    }>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
        success: boolean;
        message: string;
        method: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            type: import("../../database/schema/payment-method-schema.js").PaymentMethodType;
            provider: string;
            accountNumber: string;
            accountName: string;
            isDefault: boolean;
            metadata: unknown;
        };
    }, {
        success: boolean;
        message: string;
        method: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            type: import("../../database/schema/payment-method-schema.js").PaymentMethodType;
            provider: string;
            accountNumber: string;
            accountName: string;
            isDefault: boolean;
            metadata: unknown;
        };
    }>, Record<never, never>, Record<never, never>>;
    list: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
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
    }>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
        methods: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            type: import("../../database/schema/payment-method-schema.js").PaymentMethodType;
            provider: string;
            accountNumber: string;
            accountName: string;
            isDefault: boolean;
            metadata: unknown;
        }[];
    }, {
        methods: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            type: import("../../database/schema/payment-method-schema.js").PaymentMethodType;
            provider: string;
            accountNumber: string;
            accountName: string;
            isDefault: boolean;
            metadata: unknown;
        }[];
    }>, Record<never, never>, Record<never, never>>;
    setDefault: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
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
    }>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
        success: boolean;
    }, {
        success: boolean;
    }>, Record<never, never>, Record<never, never>>;
    delete: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
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
    }>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
        success: boolean;
    }, {
        success: boolean;
    }>, Record<never, never>, Record<never, never>>;
};
//# sourceMappingURL=index.d.ts.map