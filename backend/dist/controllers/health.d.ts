/**
 * Health check controller for connectivity testing
 */
export declare const healthController: {
    check: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, Record<never, never>, Record<never, never>>, Record<never, never>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
        status: "ok";
        timestamp: number;
        server: string;
        uptime: number;
    }, {
        status: "ok";
        timestamp: number;
        server: string;
        uptime: number;
    }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    ping: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, Record<never, never>, Record<never, never>>, Record<never, never>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
        pong: "pong";
        timestamp: number;
    }, {
        pong: "pong";
        timestamp: number;
    }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    networkTest: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, Record<never, never>, Record<never, never>>, Record<never, never>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
        serverTimestamp: number;
        clientTimestamp: number;
        roundTripTime: number;
    }, {
        serverTimestamp: number;
        clientTimestamp: number;
        roundTripTime: number;
    }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
};
//# sourceMappingURL=health.d.ts.map