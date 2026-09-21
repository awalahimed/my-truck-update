import { Context, Next } from 'hono';
/**
 * Security headers middleware
 * Adds essential security headers to all responses
 */
export declare function securityHeaders(): (c: Context, next: Next) => Promise<void>;
/**
 * Request sanitization middleware
 * Prevents common injection attacks
 */
export declare function sanitizeInput(): (c: Context, next: Next) => Promise<Response & import("hono").TypedResponse<{
    error: string;
}, 400, "json">>;
//# sourceMappingURL=security.d.ts.map