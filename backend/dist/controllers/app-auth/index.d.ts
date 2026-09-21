import { sendLoginOTP } from './sendLoginOTP.js';
import { sendRegisterOTP } from './sendRegisterOTP.js';
import { verifyOTP } from './verifyOTP.js';
import { setPassword } from './setPassword.js';
import { verifyRegistrationOTP } from './verifyRegistrationOTP.js';
import { sendResetOTP } from './sendResetOTP.js';
import { resetPassword } from './resetPassword.js';
import { refreshTokens } from './refreshTokens.js';
import { getSession } from './getSession.js';
import { logout } from './logout.js';
import { softDeleteAccount } from './softdelete.js';
export { sendLoginOTP, sendRegisterOTP, verifyOTP, setPassword, verifyRegistrationOTP, sendResetOTP, resetPassword, refreshTokens, getSession, logout, softDeleteAccount };
export declare const authRouter: {
    sendLoginOTP: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("zod").ZodObject<{
        phoneNumber: import("zod").ZodString;
        password: import("zod").ZodOptional<import("zod").ZodString>;
    }, import("better-auth").$strip>, import("@orpc/contract").Schema<{
        success: boolean;
        message: string;
        expiresIn: number;
    }, {
        success: boolean;
        message: string;
        expiresIn: number;
    }>, Record<never, never>, Record<never, never>>;
    sendRegisterOTP: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("zod").ZodObject<{
        phone: import("zod").ZodString;
    }, import("better-auth").$strip>, import("@orpc/contract").Schema<{
        success: boolean;
        message: string;
    }, {
        success: boolean;
        message: string;
    }>, Record<never, never>, Record<never, never>>;
    verifyOTP: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("zod").ZodObject<{
        phoneNumber: import("zod").ZodString;
        code: import("zod").ZodString;
    }, import("better-auth").$strip>, import("@orpc/contract").Schema<{
        success: boolean;
        message: string;
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            name: any;
            email: any;
            image: any;
            phoneNumber: any;
            phoneNumberVerified: any;
            role: any;
            accountStatus: any;
            banned: any;
        };
    }, {
        success: boolean;
        message: string;
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            name: any;
            email: any;
            image: any;
            phoneNumber: any;
            phoneNumberVerified: any;
            role: any;
            accountStatus: any;
            banned: any;
        };
    }>, Record<never, never>, Record<never, never>>;
    setPassword: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("zod").ZodObject<{
        phoneNumber: import("zod").ZodString;
        newPassword: import("zod").ZodString;
    }, import("better-auth").$strip>, import("@orpc/contract").Schema<{
        success: boolean;
        message: string;
    }, {
        success: boolean;
        message: string;
    }>, Record<never, never>, Record<never, never>>;
    verifyRegistrationOTP: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("zod").ZodObject<{
        phoneNumber: import("zod").ZodString;
        code: import("zod").ZodString;
    }, import("better-auth").$strip>, import("@orpc/contract").Schema<{
        success: boolean;
        message: string;
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            name: any;
            email: any;
            image: any;
            phoneNumber: any;
            phoneNumberVerified: boolean;
            role: any;
            accountStatus: any;
            banned: any;
        };
    }, {
        success: boolean;
        message: string;
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            name: any;
            email: any;
            image: any;
            phoneNumber: any;
            phoneNumberVerified: boolean;
            role: any;
            accountStatus: any;
            banned: any;
        };
    }>, Record<never, never>, Record<never, never>>;
    sendResetOTP: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("zod").ZodObject<{
        phoneNumber: import("zod").ZodString;
    }, import("better-auth").$strip>, import("@orpc/contract").Schema<{
        success: boolean;
        message: string;
        expiresIn: number;
    }, {
        success: boolean;
        message: string;
        expiresIn: number;
    }>, Record<never, never>, Record<never, never>>;
    resetPassword: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("zod").ZodObject<{
        phoneNumber: import("zod").ZodString;
        code: import("zod").ZodString;
        newPassword: import("zod").ZodOptional<import("zod").ZodString>;
    }, import("better-auth").$strip>, import("@orpc/contract").Schema<{
        success: boolean;
        message: string;
        newPassword: string;
    }, {
        success: boolean;
        message: string;
        newPassword: string;
    }>, Record<never, never>, Record<never, never>>;
    refreshTokens: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("zod").ZodObject<{
        refreshToken: import("zod").ZodString;
    }, import("better-auth").$strip>, import("@orpc/contract").Schema<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            name: any;
            email: any;
            image: any;
            phoneNumber: any;
            phoneNumberVerified: any;
            role: any;
            accountStatus: any;
            banned: any;
        };
    }, {
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            name: any;
            email: any;
            image: any;
            phoneNumber: any;
            phoneNumberVerified: any;
            role: any;
            accountStatus: any;
            banned: any;
        };
    }>, Record<never, never>, Record<never, never>>;
    getSession: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("zod").ZodObject<{
        accessToken: import("zod").ZodString;
        refreshToken: import("zod").ZodOptional<import("zod").ZodString>;
    }, import("better-auth").$strip>, import("@orpc/contract").Schema<{
        user: {
            id: any;
            name: any;
            email: any;
            image: any;
            phoneNumber: any;
            phoneNumberVerified: any;
            role: any;
            accountStatus: any;
            banned: any;
            rejectionReason: any;
            rejectedDocument: any;
            rejectedAt: any;
            hasAssignedOrder: boolean;
        };
        session: {
            token: string;
        };
    }, {
        user: {
            id: any;
            name: any;
            email: any;
            image: any;
            phoneNumber: any;
            phoneNumberVerified: any;
            role: any;
            accountStatus: any;
            banned: any;
            rejectionReason: any;
            rejectedDocument: any;
            rejectedAt: any;
            hasAssignedOrder: boolean;
        };
        session: {
            token: string;
        };
    }>, Record<never, never>, Record<never, never>>;
    logout: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("zod").ZodObject<{
        userId: import("zod").ZodString;
    }, import("better-auth").$strip>, import("@orpc/contract").Schema<{
        success: boolean;
        message: string;
    }, {
        success: boolean;
        message: string;
    }>, Record<never, never>, Record<never, never>>;
    softDeleteAccount: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
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
    }>, import("@orpc/contract").Schema<unknown, unknown>, import("@orpc/contract").Schema<{
        success: boolean;
        message: string;
    }, {
        success: boolean;
        message: string;
    }>, Record<never, never>, Record<never, never>>;
};
//# sourceMappingURL=index.d.ts.map