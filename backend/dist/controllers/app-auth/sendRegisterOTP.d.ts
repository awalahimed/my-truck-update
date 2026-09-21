import { z } from 'zod';
export declare const sendRegisterOTP: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, z.ZodObject<{
    phone: z.ZodString;
}, z.core.$strip>, import("@orpc/server").Schema<{
    success: boolean;
    message: string;
}, {
    success: boolean;
    message: string;
}>, Record<never, never>, Record<never, never>>;
//# sourceMappingURL=sendRegisterOTP.d.ts.map