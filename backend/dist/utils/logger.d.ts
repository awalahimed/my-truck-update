export declare const logger: {
    readonly error: (message: unknown, meta?: Record<string, unknown>) => void;
    readonly warn: (message: unknown, meta?: Record<string, unknown>) => void;
    readonly info: (message: unknown, meta?: Record<string, unknown>) => void;
    readonly debug: (message: unknown, meta?: Record<string, unknown>) => void;
    readonly trace: (message: unknown, meta?: Record<string, unknown>) => void;
};
export type Logger = typeof logger;
//# sourceMappingURL=logger.d.ts.map