import { Context, Next } from 'hono';
export interface RateLimitOptions {
    windowMs?: number;
    max?: number;
    message?: string;
    skipSuccessfulRequests?: boolean;
}
export declare function rateLimit(options?: RateLimitOptions): (c: Context, next: Next) => Promise<Response & import("hono").TypedResponse<{
    error: string;
}, 429, "json">>;
export declare const authRateLimit: (c: Context, next: Next) => Promise<Response & import("hono").TypedResponse<{
    error: string;
}, 429, "json">>;
export declare const apiRateLimit: (c: Context, next: Next) => Promise<Response & import("hono").TypedResponse<{
    error: string;
}, 429, "json">>;
//# sourceMappingURL=rate-limit.d.ts.map