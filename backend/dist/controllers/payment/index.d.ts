import { z } from 'zod';
export declare const payment: {
    initialize: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
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
        amount: z.ZodString;
        currency: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        first_name: z.ZodString;
        last_name: z.ZodString;
        callback_url: z.ZodOptional<z.ZodString>;
        return_url: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>, import("@orpc/server").Schema<{
        success: boolean;
        checkout_url: string;
        tx_ref: string;
    }, {
        success: boolean;
        checkout_url: string;
        tx_ref: string;
    }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    verify: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
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
        tx_ref: z.ZodString;
    }, z.core.$strip>, import("@orpc/server").Schema<{
        success: boolean;
        status: "success";
    } | {
        success: boolean;
        status: "cancelled";
    }, {
        success: boolean;
        status: "success";
    } | {
        success: boolean;
        status: "cancelled";
    }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
};
//# sourceMappingURL=index.d.ts.map