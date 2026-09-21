export declare const adminProcedure: import("@orpc/server").BuilderWithMiddlewares<import("@orpc/server").MergedInitialContext<{
    req?: Request;
} & Record<never, never>, {
    req?: Request;
}, {
    req?: Request;
}>, import("@orpc/server").MergedCurrentContext<{
    req?: Request;
}, {
    user: {
        id: string;
        email: string;
        name?: string;
        role?: string;
        phoneNumber?: string;
        phoneNumberVerified?: boolean;
        emailVerified?: boolean;
    };
    session: {
        id: string;
        userId: string;
        token: string;
        expiresAt: Date;
    };
    role: string;
}>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<unknown, unknown>, Record<never, never>, Record<never, never>>;
//# sourceMappingURL=auth-admin.d.ts.map