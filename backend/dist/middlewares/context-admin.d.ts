import type { LoggerContext } from '@orpc/experimental-pino';
export interface CreateContextOptions {
    req: Request;
    res?: Response;
}
export interface Context extends LoggerContext {
    req: Request;
    res?: Response;
    user?: {
        id: string;
        email: string;
        name?: string;
        role?: string;
        phoneNumber?: string;
        phoneNumberVerified?: boolean;
        emailVerified?: boolean;
    };
    session?: {
        id: string;
        userId: string;
        token: string;
        expiresAt: Date;
    };
}
export declare const createAdminContext: ({ req, res }: CreateContextOptions) => Promise<Context>;
//# sourceMappingURL=context-admin.d.ts.map