import { z } from 'zod';
export declare const sendLoginOTP: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, z.ZodObject<{
    phoneNumber: z.ZodString;
    password: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, import("@orpc/server").Schema<{
    success: boolean;
    message: string;
    expiresIn: number;
}, {
    success: boolean;
    message: string;
    expiresIn: number;
}>, Record<never, never>, Record<never, never>>;
//# sourceMappingURL=sendLoginOTP.d.ts.map