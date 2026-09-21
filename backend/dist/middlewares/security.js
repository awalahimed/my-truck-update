/**
 * Security headers middleware
 * Adds essential security headers to all responses
 */
export function securityHeaders() {
    return async (c, next) => {
        await next();
        // Prevent clickjacking
        c.res.headers.set('X-Frame-Options', 'DENY');
        // Prevent MIME type sniffing
        c.res.headers.set('X-Content-Type-Options', 'nosniff');
        // Enable XSS protection
        c.res.headers.set('X-XSS-Protection', '1; mode=block');
        // Referrer policy
        c.res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
        // Content Security Policy
        c.res.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;");
        // Strict Transport Security (HTTPS only)
        if (c.req.url.startsWith('https://')) {
            c.res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }
    };
}
/**
 * Request sanitization middleware
 * Prevents common injection attacks
 */
export function sanitizeInput() {
    return async (c, next) => {
        const contentType = c.req.header('content-type');
        if (contentType?.includes('application/json')) {
            try {
                const body = await c.req.json();
                // Check for suspicious patterns
                const suspicious = JSON.stringify(body).match(/<script|javascript:|onerror=|onclick=/i);
                if (suspicious) {
                    return c.json({ error: 'Invalid input detected' }, 400);
                }
            }
            catch (e) {
                // Invalid JSON will be handled by route handlers
            }
        }
        await next();
    };
}
//# sourceMappingURL=security.js.map