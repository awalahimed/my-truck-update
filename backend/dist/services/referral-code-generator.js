import { db } from '../database/db.js';
import { user } from '../database/schema/auth-schema.js';
import { eq } from 'drizzle-orm';
/**
 * Generate a unique 6-character referral code
 * Format: ABC123 (3 uppercase letters + 3 numbers)
 */
export async function generateReferralCode(userId) {
    let code;
    let attempts = 0;
    const maxAttempts = 10;
    do {
        // Generate code from user ID prefix + random numbers
        const prefix = userId
            .substring(0, 3)
            .toUpperCase()
            .replace(/[^A-Z]/g, 'X'); // Replace non-letters with X
        const suffix = Math.floor(Math.random() * 1000)
            .toString()
            .padStart(3, '0');
        code = `${prefix}${suffix}`;
        // Check if code already exists
        const existing = await db
            .select({ id: user.id })
            .from(user)
            .where(eq(user.referralCode, code))
            .limit(1);
        if (existing.length === 0) {
            return code; // Code is unique
        }
        attempts++;
    } while (attempts < maxAttempts);
    // Fallback: generate completely random code
    const randomLetters = Array.from({ length: 3 }, () => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join('');
    const randomNumbers = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, '0');
    return `${randomLetters}${randomNumbers}`;
}
/**
 * Validate referral code format
 * Must be 6 characters: 3 letters + 3 numbers
 */
export function validateReferralCodeFormat(code) {
    if (!code || code.length !== 6)
        return false;
    // Check format: 3 uppercase letters + 3 digits
    const pattern = /^[A-Z]{3}[0-9]{3}$/;
    return pattern.test(code);
}
/**
 * Check if referral code exists and is valid
 */
export async function isReferralCodeValid(code) {
    if (!validateReferralCodeFormat(code))
        return false;
    const result = await db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.referralCode, code))
        .limit(1);
    return result.length > 0;
}
/**
 * Get user ID by referral code
 */
export async function getUserByReferralCode(code) {
    const result = await db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.referralCode, code))
        .limit(1);
    return result.length > 0 ? result[0].id : null;
}
//# sourceMappingURL=referral-code-generator.js.map