import { z } from 'zod';
export declare const setPassword: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, z.ZodObject<{
    phoneNumber: z.ZodString;
    newPassword: z.ZodString;
}, z.core.$strip>, import("@orpc/server").Schema<{
    success: boolean;
    message: string;
}, {
    success: boolean;
    message: string;
}>, Record<never, never>, Record<never, never>>;
//# sourceMappingURL=setPassword.d.ts.map