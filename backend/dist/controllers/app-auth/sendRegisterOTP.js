import { os, ORPCError } from '@orpc/server';
import { z } from 'zod';
import { db } from '../../database/db.js';
import { user, verification } from '../../database/schema/auth-schema.js';
import { eq } from 'drizzle-orm';
import { sendOTPSMS } from '../../utils/sms.js';
export const sendRegisterOTP = os
    .input(z.object({
    phone: z.string(),
}))
    .handler(async ({ input }) => {
    try {
        const { phone } = input;
        // Check if phone is already registered and verified
        const existingUser = await db.query.user.findFirst({
            where: eq(user.phoneNumber, phone),
        });
        if (existingUser?.phoneNumberVerified) {
            throw new ORPCError('BAD_REQUEST', {
                message: 'Phone number already registered',
            });
        }
        // Generate 6-digit OTP
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        // Delete any existing OTP for this phone
        await db.delete(verification).where(eq(verification.identifier, phone));
        // Store OTP
        await db.insert(verification).values({
            id: crypto.randomUUID(),
            identifier: phone,
            value: code,
            expiresAt,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        console.log("Registration OTP code:", code);
        // Send SMS with OTP
        const smsResult = await sendOTPSMS(phone, code);
        // In development, don't fail if SMS fails - just log the OTP
        if (!smsResult.success) {
            console.warn('[sendRegisterOTP] SMS failed, but continuing in development mode');
            console.log('[sendRegisterOTP] Use this OTP for testing:', code);
        }
        return {
            success: true,
            message: 'OTP sent successfully',
        };
    }
    catch (error) {
        console.error('[sendRegisterOTP] Error:', error);
        if (error instanceof ORPCError)
            throw error;
        throw new ORPCError('INTERNAL_SERVER_ERROR');
    }
});
//# sourceMappingURL=sendRegisterOTP.js.map