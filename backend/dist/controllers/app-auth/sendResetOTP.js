import { os } from '@orpc/server';
import { z } from 'zod';
import { db } from '../../database/db.js';
import { verification } from '../../database/schema/auth-schema.js';
import { sendPasswordResetOTPSMS } from '../../utils/sms.js';
import { ORPCError } from '@orpc/server';
const OTP_EXPIRY_MINUTES = 15;
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
export const sendResetOTP = os
    .input(z.object({
    phoneNumber: z.string(),
}))
    .handler(async ({ input }) => {
    try {
        const { phoneNumber } = input;
        // Simple normalization for lookup
        const userRecord = await db.query.user.findFirst({
            where: (users, { eq, or }) => or(eq(users.phoneNumber, phoneNumber), phoneNumber.startsWith('+') ? undefined : eq(users.phoneNumber, `+${phoneNumber}`), phoneNumber.startsWith('+') ? eq(users.phoneNumber, phoneNumber.substring(1)) : undefined, phoneNumber.startsWith('0') ? eq(users.phoneNumber, `+251${phoneNumber.substring(1)}`) : undefined, phoneNumber.length === 9 ? eq(users.phoneNumber, `+251${phoneNumber}`) : undefined),
        });
        if (!userRecord) {
            throw new ORPCError('NOT_FOUND', {
                message: 'User not found with this phone number',
            });
        }
        const code = generateOTP();
        console.log("resend otp code:", code);
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
        await db.insert(verification).values({
            id: crypto.randomUUID(),
            identifier: userRecord.phoneNumber,
            value: code,
            expiresAt,
        });
        // Send SMS with reset OTP
        const smsResult = await sendPasswordResetOTPSMS(userRecord.phoneNumber, code);
        if (!smsResult.success) {
            console.error('Failed to send reset SMS:', smsResult.message);
            // Don't throw error here - OTP is still valid even if SMS fails
        }
        return {
            success: true,
            message: 'OTP sent successfully',
            expiresIn: OTP_EXPIRY_MINUTES,
        };
    }
    catch (error) {
        if (error instanceof ORPCError)
            throw error;
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
            message: 'An unexpected error occurred',
        });
    }
});
//# sourceMappingURL=sendResetOTP.js.map