import { z } from 'zod';
export declare const refreshTokens: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, z.ZodObject<{
    refreshToken: z.ZodString;
}, z.core.$strip>, import("@orpc/server").Schema<{
    accessToken: string;
    refreshToken: string;
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
    };
}, {
    accessToken: string;
    refreshToken: string;
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
    };
}>, Record<never, never>, Record<never, never>>;
//# sourceMappingURL=refreshTokens.d.ts.map