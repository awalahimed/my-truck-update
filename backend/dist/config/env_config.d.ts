import 'dotenv/config';
export declare const allowedOrigins: string[];
export declare const corsOptions: {
    origin: (origin: string | undefined) => string;
    allowMethods: string[];
    allowHeaders: string[];
    exposeHeaders: string[];
    credentials: boolean;
    maxAge: number;
};
export declare const port: number;
export declare const config: {
    nodeEnv: string;
    allowedOrigins: string[];
    port: number;
    version: string;
    logLevel: "silent" | "error" | "warn" | "info" | "debug" | "trace";
    mysql: {
        host: string;
        port: number;
        user: string;
        password: string;
        database: string;
        connectionLimit: number;
    };
    loginEnabled: string;
    registerEnabled: string;
    forgotPasswordEnabled: string;
    resetPasswordEnabled: string;
    otpEnabled: string;
    upload: {
        dir: string;
        maxFileSize: number;
        chunkSize: number;
        allowedMimeTypes: string[];
    };
    jwt: {
        secret: string;
        expiry: string;
        refreshExpiry: string;
        issuer: string;
        audience: string;
    };
    chapa: {
        secretKey: string;
        baseUrl: string;
    };
    ethiosms: {
        apiKey: string;
        baseUrl: string;
    };
    smtp: {
        host: string;
        port: number;
        secure: boolean;
        user: string;
        pass: string;
        from: string;
    };
    rateLimit: {
        windowMs: number;
        max: number;
    };
    authRateLimit: {
        windowMs: number;
        max: number;
    };
    env: string;
};
//# sourceMappingURL=env_config.d.ts.map