import { type UserRole } from '../database/schema/auth-schema.js';
type WSContext = {
    user: {
        id: string;
        name: string;
        email: string | null;
        role: UserRole;
        phoneNumber: string;
    } | null;
    authenticated: boolean;
};
export declare const wsAuthProcedure: import("@orpc/server").BuilderWithMiddlewares<import("@orpc/server").MergedInitialContext<WSContext & Record<never, never>, WSContext, WSContext>, import("@orpc/server").MergedCurrentContext<WSContext, {
    user: {
        id: string;
        name: string;
        email: string | null;
        role: UserRole;
        phoneNumber: string;
    };
}>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<unknown, unknown>, Record<never, never>, Record<never, never>>;
export declare const wsDriverProcedure: import("@orpc/server").BuilderWithMiddlewares<import("@orpc/server").MergedInitialContext<import("@orpc/server").MergedInitialContext<WSContext & Record<never, never>, WSContext, WSContext>, import("@orpc/server").MergedCurrentContext<WSContext, {
    user: {
        id: string;
        name: string;
        email: string | null;
        role: UserRole;
        phoneNumber: string;
    };
}>, import("@orpc/server").MergedCurrentContext<WSContext, {
    user: {
        id: string;
        name: string;
        email: string | null;
        role: UserRole;
        phoneNumber: string;
    };
}>>, import("@orpc/server").MergedCurrentContext<import("@orpc/server").MergedCurrentContext<WSContext, {
    user: {
        id: string;
        name: string;
        email: string | null;
        role: UserRole;
        phoneNumber: string;
    };
}>, Record<never, never>>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<unknown, unknown>, Record<never, never>, Record<never, never>>;
export declare const wsOwnerProcedure: import("@orpc/server").BuilderWithMiddlewares<import("@orpc/server").MergedInitialContext<import("@orpc/server").MergedInitialContext<WSContext & Record<never, never>, WSContext, WSContext>, import("@orpc/server").MergedCurrentContext<WSContext, {
    user: {
        id: string;
        name: string;
        email: string | null;
        role: UserRole;
        phoneNumber: string;
    };
}>, import("@orpc/server").MergedCurrentContext<WSContext, {
    user: {
        id: string;
        name: string;
        email: string | null;
        role: UserRole;
        phoneNumber: string;
    };
}>>, import("@orpc/server").MergedCurrentContext<import("@orpc/server").MergedCurrentContext<WSContext, {
    user: {
        id: string;
        name: string;
        email: string | null;
        role: UserRole;
        phoneNumber: string;
    };
}>, Record<never, never>>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<unknown, unknown>, Record<never, never>, Record<never, never>>;
export {};
//# sourceMappingURL=ws-auth.d.ts.map