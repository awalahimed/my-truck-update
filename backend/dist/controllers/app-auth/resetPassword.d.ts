import { z } from 'zod';
export declare const resetPassword: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, z.ZodObject<{
    phoneNumber: z.ZodString;
    code: z.ZodString;
    newPassword: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, import("@orpc/server").Schema<{
    success: boolean;
    message: string;
    newPassword: string;
}, {
    success: boolean;
    message: string;
    newPassword: string;
}>, Record<never, never>, Record<never, never>>;
//# sourceMappingURL=resetPassword.d.ts.map