export interface JWTPayload extends Record<string, unknown> {
    userId: string;
    email: string;
    name: string;
    role: string;
    phoneNumber: string;
    phoneNumberVerified: boolean;
    emailVerified?: boolean;
    banned?: boolean;
    accountStatus?: string | undefined;
    type: 'access' | 'refresh';
    iat: number;
}
export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}
/**
 * Generate an access token (15 minutes expiry)
 */
export declare function generateAccessToken(user: {
    id: string;
    email: string;
    name: string;
    role: string;
    phoneNumber: string;
    phoneNumberVerified: boolean;
    emailVerified?: boolean;
    banned?: boolean;
    accountStatus?: string;
}): Promise<string>;
/**
 * Generate a refresh token (7 days expiry)
 */
export declare function generateRefreshToken(userId: string): Promise<string>;
/**
 * Generate both access and refresh tokens
 */
export declare function generateTokenPair(user: {
    id: string;
    email: string;
    name: string;
    role: string;
    phoneNumber: string;
    phoneNumberVerified: boolean;
    banned?: boolean;
    accountStatus?: string;
}): Promise<TokenPair>;
/**
 * Verify and decode a JWT token
 * Returns null if invalid or expired
 */
export declare function verifyToken(token: string): Promise<JWTPayload | null>;
/**
 * Verify a refresh token (only checks type is 'refresh')
 */
export declare function verifyRefreshToken(token: string): Promise<JWTPayload | null>;
/**
 * Extract token from Authorization header
 * Format: "Bearer <token>"
 */
export declare function extractToken(authHeader: string | null): string | null;
/**
 * Check if token is expired
 */
export declare function isTokenExpired(payload: JWTPayload): boolean;
/**
 * Check if token is about to expire (within 2 minutes)
 * Used to proactively refresh access token
 */
export declare function shouldRefreshToken(payload: JWTPayload): boolean;
//# sourceMappingURL=jwt.d.ts.map