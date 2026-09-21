import { os } from '@orpc/server';
import { z } from 'zod';
/**
 * Health check controller for connectivity testing
 */
export const healthController = os.router({
    /**
     * Simple health check endpoint
     * Returns basic server status and timestamp
     */
    check: os.handler(async () => {
        return {
            status: 'ok',
            timestamp: Date.now(),
            server: 'MyTruck API',
            uptime: process.uptime(),
        };
    }),
    /**
     * Ping endpoint for minimal latency testing
     * Returns just a simple pong response
     */
    ping: os.handler(async () => {
        return {
            pong: 'pong',
            timestamp: Date.now(),
        };
    }),
    /**
     * Network quality test endpoint
     * Returns server time and allows measuring round-trip time
     */
    networkTest: os.handler(async (ctx) => {
        const input = z.object({
            clientTimestamp: z.number(),
        }).parse(ctx.input);
        const serverTimestamp = Date.now();
        const roundTripTime = serverTimestamp - input.clientTimestamp;
        return {
            serverTimestamp,
            clientTimestamp: input.clientTimestamp,
            roundTripTime: roundTripTime > 0 ? roundTripTime : undefined,
        };
    }),
});
//# sourceMappingURL=health.js.map