import { z } from 'zod';
export declare const verifyRegistrationOTP: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, z.ZodObject<{
    phoneNumber: z.ZodString;
    code: z.ZodString;
}, z.core.$strip>, import("@orpc/server").Schema<{
    success: boolean;
    message: string;
    accessToken: string;
    refreshToken: string;
    user: {
        id: any;
        name: any;
        email: any;
        image: any;
        phoneNumber: any;
        phoneNumberVerified: boolean;
        role: any;
        accountStatus: any;
        banned: any;
    };
}, {
    success: boolean;
    message: string;
    accessToken: string;
    refreshToken: string;
    user: {
        id: any;
        name: any;
        email: any;
        image: any;
        phoneNumber: any;
        phoneNumberVerified: boolean;
        role: any;
        accountStatus: any;
        banned: any;
    };
}>, Record<never, never>, Record<never, never>>;
//# sourceMappingURL=verifyRegistrationOTP.d.ts.map