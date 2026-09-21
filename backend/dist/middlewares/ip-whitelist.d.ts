import { Context, Next } from 'hono';
/**
 * IP Whitelist middleware
 * Only allows requests from whitelisted IP addresses
 */
export declare function ipWhitelist(): (c: Context, next: Next) => Promise<void | (Response & import("hono").TypedResponse<"", 403, "text">)>;
//# sourceMappingURL=ip-whitelist.d.ts.map