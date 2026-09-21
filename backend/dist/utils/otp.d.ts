interface OTPResult {
    otp: string;
    expiresAt: Date;
}
/**
 * Create OTP for phone verification
 */
export declare function createOTP(params: {
    phoneNumber: string;
    type: string;
}): Promise<OTPResult>;
/**
 * Verify OTP
 */
export declare function verifyOTP(params: {
    phoneNumber: string;
    otp: string;
    type: string;
}): Promise<boolean>;
/**
 * Delete OTP after successful verification
 */
export declare function deleteOTP(params: {
    phoneNumber: string;
    type: string;
}): Promise<void>;
/**
 * Check if phone number already exists
 */
export declare function phoneNumberExists(phoneNumber: string, excludeUserId?: string): Promise<boolean>;
export {};
//# sourceMappingURL=otp.d.ts.map