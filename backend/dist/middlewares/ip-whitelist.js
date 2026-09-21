import { logger } from '../utils/logger.js';
// Get whitelisted IPs from environment variable
const getWhitelistedIPs = () => {
    const ips = process.env.WHITELISTED_IPS || '';
    return ips.split(',').map(ip => ip.trim()).filter(Boolean);
};
/**
 * IP Whitelist middleware
 * Only allows requests from whitelisted IP addresses
 */
export function ipWhitelist() {
    const whitelistedIPs = getWhitelistedIPs();
    return async (c, next) => {
        // If no whitelist configured, allow all (for development)
        if (whitelistedIPs.length === 0) {
            logger.warn('[IP Whitelist] No IPs configured - allowing all requests');
            return await next();
        }
        const clientIP = c.req.header('x-forwarded-for')?.split(',')[0].trim() ||
            c.req.header('x-real-ip') ||
            'unknown';
        // Check if IP is whitelisted
        if (!whitelistedIPs.includes(clientIP)) {
            logger.warn('[IP Whitelist] Blocked request', {
                ip: clientIP,
                path: c.req.path,
                whitelistedIPs
            });
            return c.text('', 403);
        }
        logger.info('[IP Whitelist] Allowed request', { ip: clientIP, path: c.req.path });
        await next();
    };
}
//# sourceMappingURL=ip-whitelist.js.map