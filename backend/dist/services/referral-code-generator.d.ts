/**
 * Generate a unique 6-character referral code
 * Format: ABC123 (3 uppercase letters + 3 numbers)
 */
export declare function generateReferralCode(userId: string): Promise<string>;
/**
 * Validate referral code format
 * Must be 6 characters: 3 letters + 3 numbers
 */
export declare function validateReferralCodeFormat(code: string): boolean;
/**
 * Check if referral code exists and is valid
 */
export declare function isReferralCodeValid(code: string): Promise<boolean>;
/**
 * Get user ID by referral code
 */
export declare function getUserByReferralCode(code: string): Promise<string | null>;
//# sourceMappingURL=referral-code-generator.d.ts.map