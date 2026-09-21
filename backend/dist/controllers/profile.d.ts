export declare const profile: {
    getProfile: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
        success: boolean;
        user: {
            maskedPhoneNumber: string;
            profilePhoto: {
                id: string;
                filename: string;
                originalFilename: string;
                mimeType: string;
                size: number;
            };
            hasAssignedOrder: boolean;
            id: any;
            name: any;
            email: any;
            phoneNumber: any;
            image: any;
            role: any;
            accountStatus: any;
            banned: any;
            createdAt: any;
        } | {
            maskedPhoneNumber: string;
            profilePhoto: {
                id: string;
                filename: string;
                originalFilename: string;
                mimeType: string;
                size: number;
            };
            hasAssignedOrder: boolean;
            id: any;
            name: any;
            email: any;
            phoneNumber: any;
            image: any;
            role: any;
            accountStatus: any;
            banned: any;
            createdAt: any;
        };
        hasPassword: boolean;
    }, {
        success: boolean;
        user: {
            maskedPhoneNumber: string;
            profilePhoto: {
                id: string;
                filename: string;
                originalFilename: string;
                mimeType: string;
                size: number;
            };
            hasAssignedOrder: boolean;
            id: any;
            name: any;
            email: any;
            phoneNumber: any;
            image: any;
            role: any;
            accountStatus: any;
            banned: any;
            createdAt: any;
        } | {
            maskedPhoneNumber: string;
            profilePhoto: {
                id: string;
                filename: string;
                originalFilename: string;
                mimeType: string;
                size: number;
            };
            hasAssignedOrder: boolean;
            id: any;
            name: any;
            email: any;
            phoneNumber: any;
            image: any;
            role: any;
            accountStatus: any;
            banned: any;
            createdAt: any;
        };
        hasPassword: boolean;
    }>, Record<never, never>, Record<never, never>>;
    updateProfile: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
        success: boolean;
        message: string;
        user: {
            id: any;
            name: any;
            email: any;
            phoneNumber: any;
            image: any;
        } | {
            id: any;
            name: any;
            email: any;
            phoneNumber: any;
            image: any;
        };
        profilePhoto: any;
    }, {
        success: boolean;
        message: string;
        user: {
            id: any;
            name: any;
            email: any;
            phoneNumber: any;
            image: any;
        } | {
            id: any;
            name: any;
            email: any;
            phoneNumber: any;
            image: any;
        };
        profilePhoto: any;
    }>, Record<never, never>, Record<never, never>>;
    sendPhoneUpdateOTP: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
        otp: string;
        success: boolean;
        message: string;
    }, {
        otp: string;
        success: boolean;
        message: string;
    }>, Record<never, never>, Record<never, never>>;
    verifyAndUpdatePhone: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
        success: boolean;
        message: string;
    }, {
        success: boolean;
        message: string;
    }>, Record<never, never>, Record<never, never>>;
    changePassword: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
        success: boolean;
        message: string;
    }, {
        success: boolean;
        message: string;
    }>, Record<never, never>, Record<never, never>>;
    checkPhoneExists: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
        exists: boolean;
    }, {
        exists: boolean;
    }>, Record<never, never>, Record<never, never>>;
    getRejectionStatus: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
        success: boolean;
        hasRejection: boolean;
        rejectionReason?: undefined;
        rejectedDocument?: undefined;
        rejectedAt?: undefined;
    } | {
        success: boolean;
        hasRejection: boolean;
        rejectionReason: any;
        rejectedDocument: any;
        rejectedAt: any;
    }, {
        success: boolean;
        hasRejection: boolean;
        rejectionReason?: undefined;
        rejectedDocument?: undefined;
        rejectedAt?: undefined;
    } | {
        success: boolean;
        hasRejection: boolean;
        rejectionReason: any;
        rejectedDocument: any;
        rejectedAt: any;
    }>, Record<never, never>, Record<never, never>>;
    clearRejection: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
        success: boolean;
        message: string;
    }, {
        success: boolean;
        message: string;
    }>, Record<never, never>, Record<never, never>>;
};
//# sourceMappingURL=profile.d.ts.map