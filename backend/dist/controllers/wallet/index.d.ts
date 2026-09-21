export declare const walletController: {
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
    }, {
        success: boolean;
        message: string;
    }>, Record<never, never>, Record<never, never>>;
    get: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
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
        wallet: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            isActive: boolean;
            balance: string;
            reservedBalance: string;
            totalTopup: string;
            totalWithdrawn: string;
        };
    }, {
        wallet: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            isActive: boolean;
            balance: string;
            reservedBalance: string;
            totalTopup: string;
            totalWithdrawn: string;
        };
    }>, Record<never, never>, Record<never, never>>;
    getTransactions: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
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
        transactions: ({
            id: string;
            txRef: string;
            amount: string;
            type: import("../../database/schema/payment-schema.js").TransactionType;
            status: import("../../database/schema/payment-schema.js").PaymentStatus;
            description: string;
            createdAt: Date;
            fromUser: {
                id: any;
                name: any;
                profilePhoto: any;
            };
            toUser: {
                id: any;
                name: any;
                profilePhoto: any;
            };
        } | {
            id: string;
            txRef: string;
            amount: string;
            type: import("../../database/schema/payment-schema.js").TransactionType;
            status: import("../../database/schema/payment-schema.js").PaymentStatus;
            description: string;
            createdAt: Date;
            fromUser: {
                id: any;
                name: any;
                profilePhoto: any;
            };
            toUser: {
                id: any;
                name: any;
                profilePhoto: any;
            };
        })[];
    }, {
        transactions: ({
            id: string;
            txRef: string;
            amount: string;
            type: import("../../database/schema/payment-schema.js").TransactionType;
            status: import("../../database/schema/payment-schema.js").PaymentStatus;
            description: string;
            createdAt: Date;
            fromUser: {
                id: any;
                name: any;
                profilePhoto: any;
            };
            toUser: {
                id: any;
                name: any;
                profilePhoto: any;
            };
        } | {
            id: string;
            txRef: string;
            amount: string;
            type: import("../../database/schema/payment-schema.js").TransactionType;
            status: import("../../database/schema/payment-schema.js").PaymentStatus;
            description: string;
            createdAt: Date;
            fromUser: {
                id: any;
                name: any;
                profilePhoto: any;
            };
            toUser: {
                id: any;
                name: any;
                profilePhoto: any;
            };
        })[];
    }>, Record<never, never>, Record<never, never>>;
};
//# sourceMappingURL=index.d.ts.map