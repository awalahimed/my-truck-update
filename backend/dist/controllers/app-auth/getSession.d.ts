import { z } from 'zod';
export declare const getSession: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, z.ZodObject<{
    accessToken: z.ZodString;
    refreshToken: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, import("@orpc/server").Schema<{
    user: {
        id: any;
        name: any;
        email: any;
        image: any;
        phoneNumber: any;
        phoneNumberVerified: any;
        role: any;
        accountStatus: any;
        banned: any;
        rejectionReason: any;
        rejectedDocument: any;
        rejectedAt: any;
        hasAssignedOrder: boolean;
    };
    session: {
        token: string;
    };
}, {
    user: {
        id: any;
        name: any;
        email: any;
        image: any;
        phoneNumber: any;
        phoneNumberVerified: any;
        role: any;
        accountStatus: any;
        banned: any;
        rejectionReason: any;
        rejectedDocument: any;
        rejectedAt: any;
        hasAssignedOrder: boolean;
    };
    session: {
        token: string;
    };
}>, Record<never, never>, Record<never, never>>;
//# sourceMappingURL=getSession.d.ts.map