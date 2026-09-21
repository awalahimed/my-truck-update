import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
const scryptAsync = promisify(scrypt);
/**
 * Hash a password using scrypt
 */
export async function hashPassword(password) {
    try {
        const salt = randomBytes(16);
        // parameters: password, salt, keylen
        const derivedKey = (await scryptAsync(password, salt, 64));
        return Buffer.concat([salt, derivedKey]).toString('hex');
    }
    catch (error) {
        console.error('[password] hashPassword Error:', error);
        throw error;
    }
}
/**
 * Verify a password against a hash
 */
export async function verifyPassword(password, hash) {
    try {
        const hashBuffer = Buffer.from(hash, 'hex');
        const salt = hashBuffer.subarray(0, 16);
        const derivedKey = hashBuffer.subarray(16);
        const targetKey = (await scryptAsync(password, salt, 64));
        return timingSafeEqual(derivedKey, targetKey);
    }
    catch (error) {
        console.error('[password] verifyPassword Error:', error);
        return false;
    }
}
//# sourceMappingURL=password.js.map