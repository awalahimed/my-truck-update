export declare const softDeleteAccount: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
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
}>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
    success: boolean;
    message: string;
}, {
    success: boolean;
    message: string;
}>, Record<never, never>, Record<never, never>>;
//# sourceMappingURL=softdelete.d.ts.map