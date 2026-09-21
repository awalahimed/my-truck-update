export declare const router: {
    handshake: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/contract").Schema<unknown, unknown>, import("@orpc/contract").Schema<{
        service: string;
        version: string;
        env: string;
        auth: {
            login: string;
            register: string;
            forgotPassword: string;
            otp: string;
        };
    }, {
        service: string;
        version: string;
        env: string;
        auth: {
            login: string;
            register: string;
            forgotPassword: string;
            otp: string;
        };
    }>, Record<never, never>, Record<never, never>>;
    upload: {
        initiate: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/contract").Schema<unknown, unknown>, import("@orpc/contract").Schema<{
            uploadId: string;
            fileId: string;
            chunkCount: number;
        }, {
            uploadId: string;
            fileId: string;
            chunkCount: number;
        }>, Record<never, never>, Record<never, never>>;
        chunk: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/contract").Schema<unknown, unknown>, import("@orpc/contract").Schema<{
            success: boolean;
            chunksReceived: number;
        }, {
            success: boolean;
            chunksReceived: number;
        }>, Record<never, never>, Record<never, never>>;
        complete: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/contract").Schema<unknown, unknown>, import("@orpc/contract").Schema<{
            success: boolean;
            fileId: string;
            path: string;
        }, {
            success: boolean;
            fileId: string;
            path: string;
        }>, Record<never, never>, Record<never, never>>;
        status: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/contract").Schema<unknown, unknown>, import("@orpc/contract").Schema<{
            uploadId: string;
            fileId: string;
            status: import("../database/schema/file-schema.js").UploadStatus;
            chunksReceived: number;
            chunkCount: number;
            progress: number;
        }, {
            uploadId: string;
            fileId: string;
            status: import("../database/schema/file-schema.js").UploadStatus;
            chunksReceived: number;
            chunkCount: number;
            progress: number;
        }>, Record<never, never>, Record<never, never>>;
        cancel: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/contract").Schema<unknown, unknown>, import("@orpc/contract").Schema<{
            success: boolean;
        }, {
            success: boolean;
        }>, Record<never, never>, Record<never, never>>;
        delete: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/contract").Schema<unknown, unknown>, import("@orpc/contract").Schema<{
            success: boolean;
        }, {
            success: boolean;
        }>, Record<never, never>, Record<never, never>>;
    };
    onboarding: {
        updateOwnerProfile: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/contract").Schema<unknown, unknown>, import("@orpc/contract").Schema<{
            success: boolean;
            userId: string;
        }, {
            success: boolean;
            userId: string;
        }>, Record<never, never>, Record<never, never>>;
        updateDriverProfile: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/contract").Schema<unknown, unknown>, import("@orpc/contract").Schema<{
            success: boolean;
            userId: string;
            licenseStatus: string;
        }, {
            success: boolean;
            userId: string;
            licenseStatus: string;
        }>, Record<never, never>, Record<never, never>>;
        reuploadDriverLicense: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/contract").Schema<unknown, unknown>, import("@orpc/contract").Schema<{
            success: boolean;
            userId: string;
            licenseStatus: string;
            message: string;
        }, {
            success: boolean;
            userId: string;
            licenseStatus: string;
            message: string;
        }>, Record<never, never>, Record<never, never>>;
        reuploadVehiclePhoto: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/contract").Schema<unknown, unknown>, import("@orpc/contract").Schema<{
            success: boolean;
            userId: string;
            vehicleStatus: string;
            message: string;
        }, {
            success: boolean;
            userId: string;
            vehicleStatus: string;
            message: string;
        }>, Record<never, never>, Record<never, never>>;
    };
    profile: {
        getProfile: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/contract").Schema<unknown, unknown>, import("@orpc/contract").Schema<{
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
        updateProfile: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/contract").Schema<unknown, unknown>, import("@orpc/contract").Schema<{
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
        sendPhoneUpdateOTP: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/contract").Schema<unknown, unknown>, import("@orpc/contract").Schema<{
            otp: string;
            success: boolean;
            message: string;
        }, {
            otp: string;
            success: boolean;
            message: string;
        }>, Record<never, never>, Record<never, never>>;
        verifyAndUpdatePhone: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/contract").Schema<unknown, unknown>, import("@orpc/contract").Schema<{
            success: boolean;
            message: string;
        }, {
            success: boolean;
            message: string;
        }>, Record<never, never>, Record<never, never>>;
        changePassword: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/contract").Schema<unknown, unknown>, import("@orpc/contract").Schema<{
            success: boolean;
            message: string;
        }, {
            success: boolean;
            message: string;
        }>, Record<never, never>, Record<never, never>>;
        checkPhoneExists: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/contract").Schema<unknown, unknown>, import("@orpc/contract").Schema<{
            exists: boolean;
        }, {
            exists: boolean;
        }>, Record<never, never>, Record<never, never>>;
        getRejectionStatus: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/contract").Schema<unknown, unknown>, import("@orpc/contract").Schema<{
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
        clearRejection: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/contract").Schema<unknown, unknown>, import("@orpc/contract").Schema<{
            success: boolean;
            message: string;
        }, {
            success: boolean;
            message: string;
        }>, Record<never, never>, Record<never, never>>;
    };
    authApp: {
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
    payment: {
        initialize: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        }>, import("zod").ZodObject<{
            amount: import("zod").ZodString;
            currency: import("zod").ZodDefault<import("zod").ZodOptional<import("zod").ZodString>>;
            first_name: import("zod").ZodString;
            last_name: import("zod").ZodString;
            callback_url: import("zod").ZodOptional<import("zod").ZodString>;
            return_url: import("zod").ZodOptional<import("zod").ZodString>;
        }, import("better-auth").$strip>, import("@orpc/contract").Schema<{
            success: boolean;
            checkout_url: string;
            tx_ref: string;
        }, {
            success: boolean;
            checkout_url: string;
            tx_ref: string;
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
        verify: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        }>, import("zod").ZodObject<{
            tx_ref: import("zod").ZodString;
        }, import("better-auth").$strip>, import("@orpc/contract").Schema<{
            success: boolean;
            status: "success";
        } | {
            success: boolean;
            status: "cancelled";
        }, {
            success: boolean;
            status: "success";
        } | {
            success: boolean;
            status: "cancelled";
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    };
    wallet: {
        create: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
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
        get: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
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
            wallet: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                isActive: boolean;
                balance: string;
                reservedBalance: string;
                totalTopup: string;
                totalWithdrawn: string;
            };
        }, {
            wallet: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                isActive: boolean;
                balance: string;
                reservedBalance: string;
                totalTopup: string;
                totalWithdrawn: string;
            };
        }>, Record<never, never>, Record<never, never>>;
        getTransactions: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
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
            transactions: ({
                id: string;
                txRef: string;
                amount: string;
                type: import("../database/schema/payment-schema.js").TransactionType;
                status: import("../database/schema/payment-schema.js").PaymentStatus;
                description: string;
                createdAt: Date;
                fromUser: {
                    id: any;
                    name: any;
                    profilePhoto: any;
                };
                toUser: {
                    id: any;
                    name: any;
                    profilePhoto: any;
                };
            } | {
                id: string;
                txRef: string;
                amount: string;
                type: import("../database/schema/payment-schema.js").TransactionType;
                status: import("../database/schema/payment-schema.js").PaymentStatus;
                description: string;
                createdAt: Date;
                fromUser: {
                    id: any;
                    name: any;
                    profilePhoto: any;
                };
                toUser: {
                    id: any;
                    name: any;
                    profilePhoto: any;
                };
            })[];
        }, {
            transactions: ({
                id: string;
                txRef: string;
                amount: string;
                type: import("../database/schema/payment-schema.js").TransactionType;
                status: import("../database/schema/payment-schema.js").PaymentStatus;
                description: string;
                createdAt: Date;
                fromUser: {
                    id: any;
                    name: any;
                    profilePhoto: any;
                };
                toUser: {
                    id: any;
                    name: any;
                    profilePhoto: any;
                };
            } | {
                id: string;
                txRef: string;
                amount: string;
                type: import("../database/schema/payment-schema.js").TransactionType;
                status: import("../database/schema/payment-schema.js").PaymentStatus;
                description: string;
                createdAt: Date;
                fromUser: {
                    id: any;
                    name: any;
                    profilePhoto: any;
                };
                toUser: {
                    id: any;
                    name: any;
                    profilePhoto: any;
                };
            })[];
        }>, Record<never, never>, Record<never, never>>;
    };
    paymentMethod: {
        getBanks: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
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
            banks: Array<{
                id: string;
                name: string;
                swift?: string;
            }>;
        }, {
            success: boolean;
            banks: Array<{
                id: string;
                name: string;
                swift?: string;
            }>;
        }>, Record<never, never>, Record<never, never>>;
        create: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
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
            method: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                type: import("../database/schema/payment-method-schema.js").PaymentMethodType;
                provider: string;
                accountNumber: string;
                accountName: string;
                isDefault: boolean;
                metadata: unknown;
            };
        }, {
            success: boolean;
            message: string;
            method: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                type: import("../database/schema/payment-method-schema.js").PaymentMethodType;
                provider: string;
                accountNumber: string;
                accountName: string;
                isDefault: boolean;
                metadata: unknown;
            };
        }>, Record<never, never>, Record<never, never>>;
        list: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
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
            methods: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                type: import("../database/schema/payment-method-schema.js").PaymentMethodType;
                provider: string;
                accountNumber: string;
                accountName: string;
                isDefault: boolean;
                metadata: unknown;
            }[];
        }, {
            methods: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                type: import("../database/schema/payment-method-schema.js").PaymentMethodType;
                provider: string;
                accountNumber: string;
                accountName: string;
                isDefault: boolean;
                metadata: unknown;
            }[];
        }>, Record<never, never>, Record<never, never>>;
        setDefault: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
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
        }, {
            success: boolean;
        }>, Record<never, never>, Record<never, never>>;
        delete: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
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
        }, {
            success: boolean;
        }>, Record<never, never>, Record<never, never>>;
    };
    notifications: {
        toggleNotifications: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/contract").Schema<unknown, unknown>, import("@orpc/contract").Schema<{
            success: boolean;
            message: string;
        }, {
            success: boolean;
            message: string;
        }>, Record<never, never>, Record<never, never>>;
        getNotificationPreference: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/contract").Schema<unknown, unknown>, import("@orpc/contract").Schema<{
            success: boolean;
            notificationsEnabled: any;
        }, {
            success: boolean;
            notificationsEnabled: any;
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
        getUserNotifications: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
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
            notifications: {
                id: string;
                title: string;
                message: string;
                type: string;
                read: boolean;
                createdAt: Date;
            }[];
        }, {
            success: boolean;
            notifications: {
                id: string;
                title: string;
                message: string;
                type: string;
                read: boolean;
                createdAt: Date;
            }[];
        }>, Record<never, never>, Record<never, never>>;
        getUnreadCount: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
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
            count: number;
        }, {
            success: boolean;
            count: number;
        }>, Record<never, never>, Record<never, never>>;
        markAsRead: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
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
    order: {
        create: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        }>, import("zod").ZodObject<{
            pickupAddress: import("zod").ZodString;
            pickupLatitude: import("zod").ZodNumber;
            pickupLongitude: import("zod").ZodNumber;
            deliveryAddress: import("zod").ZodString;
            deliveryLatitude: import("zod").ZodNumber;
            deliveryLongitude: import("zod").ZodNumber;
            materials: import("zod").ZodArray<import("zod").ZodString>;
            vehicleType: import("zod").ZodEnum<{
                motorcycle: "motorcycle";
                car: "car";
                truck: "truck";
            }>;
            notes: import("zod").ZodOptional<import("zod").ZodString>;
        }, import("better-auth").$strip>, import("@orpc/contract").Schema<{
            success: boolean;
            orderId: string;
            message: string;
        }, {
            success: boolean;
            orderId: string;
            message: string;
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
        callCenterApprove: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        }>, import("zod").ZodObject<{
            orderId: import("zod").ZodString;
        }, import("better-auth").$strip>, import("@orpc/contract").Schema<{
            success: boolean;
            message: string;
        }, {
            success: boolean;
            message: string;
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
        getCallCenterPendingOrders: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
            orders: {
                customerName: any;
                customerPhone: any;
                id: string;
                customerId: string;
                driverId: string;
                agentId: string;
                pickupAddress: string;
                pickupLatitude: string;
                pickupLongitude: string;
                deliveryAddress: string;
                deliveryLatitude: string;
                deliveryLongitude: string;
                materials: unknown;
                vehicleType: string;
                notes: string;
                estimatedPrice: string;
                finalPrice: string;
                agentFee: string;
                status: string;
                rejectionReason: string;
                createdAt: Date;
                updatedAt: Date;
                approvedAt: Date;
                rejectedAt: Date;
                assignedAt: Date;
                pickedUpAt: Date;
                deliveredAt: Date;
                completedAt: Date;
            }[];
        }, {
            success: boolean;
            orders: {
                customerName: any;
                customerPhone: any;
                id: string;
                customerId: string;
                driverId: string;
                agentId: string;
                pickupAddress: string;
                pickupLatitude: string;
                pickupLongitude: string;
                deliveryAddress: string;
                deliveryLatitude: string;
                deliveryLongitude: string;
                materials: unknown;
                vehicleType: string;
                notes: string;
                estimatedPrice: string;
                finalPrice: string;
                agentFee: string;
                status: string;
                rejectionReason: string;
                createdAt: Date;
                updatedAt: Date;
                approvedAt: Date;
                rejectedAt: Date;
                assignedAt: Date;
                pickedUpAt: Date;
                deliveredAt: Date;
                completedAt: Date;
            }[];
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
        getNearbyAgents: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        }>, import("zod").ZodObject<{
            orderId: import("zod").ZodString;
        }, import("better-auth").$strip>, import("@orpc/contract").Schema<{
            success: boolean;
            agents: {
                id: any;
                name: any;
                phoneNumber: any;
                latitude: any;
                longitude: any;
                distance: any;
            }[];
        }, {
            success: boolean;
            agents: {
                id: any;
                name: any;
                phoneNumber: any;
                latitude: any;
                longitude: any;
                distance: any;
            }[];
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
        callCenterReject: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        }>, import("zod").ZodObject<{
            orderId: import("zod").ZodString;
            reason: import("zod").ZodOptional<import("zod").ZodString>;
        }, import("better-auth").$strip>, import("@orpc/contract").Schema<{
            success: boolean;
            message: string;
        }, {
            success: boolean;
            message: string;
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
        callCenterSelectAgent: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        }>, import("zod").ZodObject<{
            orderId: import("zod").ZodString;
            agentId: import("zod").ZodString;
        }, import("better-auth").$strip>, import("@orpc/contract").Schema<{
            success: boolean;
            message: string;
        }, {
            success: boolean;
            message: string;
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
        agentApproveOrder: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        }>, import("zod").ZodObject<{
            orderId: import("zod").ZodString;
            notes: import("zod").ZodOptional<import("zod").ZodString>;
        }, import("better-auth").$strip>, import("@orpc/contract").Schema<{
            success: boolean;
            message: string;
        }, {
            success: boolean;
            message: string;
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
        agentRejectOrder: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        }>, import("zod").ZodObject<{
            orderId: import("zod").ZodString;
            reason: import("zod").ZodOptional<import("zod").ZodString>;
        }, import("better-auth").$strip>, import("@orpc/contract").Schema<{
            success: boolean;
            message: string;
        }, {
            success: boolean;
            message: string;
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
        callCenterFinalApprove: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        }>, import("zod").ZodObject<{
            orderId: import("zod").ZodString;
        }, import("better-auth").$strip>, import("@orpc/contract").Schema<{
            success: boolean;
            message: string;
        }, {
            success: boolean;
            message: string;
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
        callCenterApproveWithAgent: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        }>, import("zod").ZodObject<{
            orderId: import("zod").ZodString;
            agentId: import("zod").ZodString;
        }, import("better-auth").$strip>, import("@orpc/contract").Schema<{
            success: boolean;
            message: string;
        }, {
            success: boolean;
            message: string;
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
        getPendingOrders: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<import("@orpc/server").MergedInitialContext<{
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
        }>>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<import("@orpc/server").MergedCurrentContext<{
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
        }>, Record<never, never>>, import("zod").ZodOptional<import("zod").ZodObject<{
            vehicleType: import("zod").ZodOptional<import("zod").ZodString>;
        }, import("better-auth").$strip>>, import("@orpc/contract").Schema<{
            orders: {
                id: string;
                customerId: string;
                driverId: string;
                agentId: string;
                pickupAddress: string;
                pickupLatitude: string;
                pickupLongitude: string;
                deliveryAddress: string;
                deliveryLatitude: string;
                deliveryLongitude: string;
                materials: unknown;
                vehicleType: string;
                notes: string;
                estimatedPrice: string;
                finalPrice: string;
                agentFee: string;
                status: string;
                rejectionReason: string;
                createdAt: Date;
                updatedAt: Date;
                approvedAt: Date;
                rejectedAt: Date;
                assignedAt: Date;
                pickedUpAt: Date;
                deliveredAt: Date;
                completedAt: Date;
            }[];
        }, {
            orders: {
                id: string;
                customerId: string;
                driverId: string;
                agentId: string;
                pickupAddress: string;
                pickupLatitude: string;
                pickupLongitude: string;
                deliveryAddress: string;
                deliveryLatitude: string;
                deliveryLongitude: string;
                materials: unknown;
                vehicleType: string;
                notes: string;
                estimatedPrice: string;
                finalPrice: string;
                agentFee: string;
                status: string;
                rejectionReason: string;
                createdAt: Date;
                updatedAt: Date;
                approvedAt: Date;
                rejectedAt: Date;
                assignedAt: Date;
                pickedUpAt: Date;
                deliveredAt: Date;
                completedAt: Date;
            }[];
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
        getMyOrders: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
            orders: {
                id: string;
                customerId: string;
                driverId: string;
                agentId: string;
                pickupAddress: string;
                pickupLatitude: string;
                pickupLongitude: string;
                deliveryAddress: string;
                deliveryLatitude: string;
                deliveryLongitude: string;
                materials: unknown;
                vehicleType: string;
                notes: string;
                estimatedPrice: string;
                finalPrice: string;
                agentFee: string;
                status: string;
                rejectionReason: string;
                createdAt: Date;
                updatedAt: Date;
                approvedAt: Date;
                rejectedAt: Date;
                assignedAt: Date;
                pickedUpAt: Date;
                deliveredAt: Date;
                completedAt: Date;
            }[];
        }, {
            success: boolean;
            orders: {
                id: string;
                customerId: string;
                driverId: string;
                agentId: string;
                pickupAddress: string;
                pickupLatitude: string;
                pickupLongitude: string;
                deliveryAddress: string;
                deliveryLatitude: string;
                deliveryLongitude: string;
                materials: unknown;
                vehicleType: string;
                notes: string;
                estimatedPrice: string;
                finalPrice: string;
                agentFee: string;
                status: string;
                rejectionReason: string;
                createdAt: Date;
                updatedAt: Date;
                approvedAt: Date;
                rejectedAt: Date;
                assignedAt: Date;
                pickedUpAt: Date;
                deliveredAt: Date;
                completedAt: Date;
            }[];
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
        getById: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        }>, import("zod").ZodObject<{
            orderId: import("zod").ZodString;
        }, import("better-auth").$strip>, import("@orpc/contract").Schema<{
            success: boolean;
            order: {
                driver: {
                    id: string;
                    name: string;
                    phone: string;
                    vehicleInfo: string;
                    profilePhoto?: string;
                };
                id: string;
                createdAt: Date;
                updatedAt: Date;
                rejectionReason: string;
                rejectedAt: Date;
                status: string;
                driverId: string;
                customerId: string;
                agentId: string;
                pickupAddress: string;
                pickupLatitude: string;
                pickupLongitude: string;
                deliveryAddress: string;
                deliveryLatitude: string;
                deliveryLongitude: string;
                materials: unknown;
                vehicleType: string;
                notes: string;
                estimatedPrice: string;
                finalPrice: string;
                agentFee: string;
                approvedAt: Date;
                assignedAt: Date;
                pickedUpAt: Date;
                deliveredAt: Date;
                completedAt: Date;
            };
        }, {
            success: boolean;
            order: {
                driver: {
                    id: string;
                    name: string;
                    phone: string;
                    vehicleInfo: string;
                    profilePhoto?: string;
                };
                id: string;
                createdAt: Date;
                updatedAt: Date;
                rejectionReason: string;
                rejectedAt: Date;
                status: string;
                driverId: string;
                customerId: string;
                agentId: string;
                pickupAddress: string;
                pickupLatitude: string;
                pickupLongitude: string;
                deliveryAddress: string;
                deliveryLatitude: string;
                deliveryLongitude: string;
                materials: unknown;
                vehicleType: string;
                notes: string;
                estimatedPrice: string;
                finalPrice: string;
                agentFee: string;
                approvedAt: Date;
                assignedAt: Date;
                pickedUpAt: Date;
                deliveredAt: Date;
                completedAt: Date;
            };
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
        getOrderOffers: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        }>, import("zod").ZodObject<{
            orderId: import("zod").ZodString;
        }, import("better-auth").$strip>, import("@orpc/contract").Schema<{
            success: boolean;
            offers: {
                id: string;
                driverId: string;
                driverName: any;
                driverPhone: any;
                driverImage: string;
                vehicleInfo: string;
                vehicleType: string;
                vehicleImage: string;
                plateNumber: string;
                offeredPrice: string;
                createdAt: Date;
            }[];
        }, {
            success: boolean;
            offers: {
                id: string;
                driverId: string;
                driverName: any;
                driverPhone: any;
                driverImage: string;
                vehicleInfo: string;
                vehicleType: string;
                vehicleImage: string;
                plateNumber: string;
                offeredPrice: string;
                createdAt: Date;
            }[];
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
        acceptOffer: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        }>, import("zod").ZodObject<{
            offerId: import("zod").ZodString;
        }, import("better-auth").$strip>, import("@orpc/contract").Schema<{
            success: boolean;
            message: string;
        }, {
            success: boolean;
            message: string;
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
        getMyOffers: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<import("@orpc/server").MergedInitialContext<{
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
        }>>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<import("@orpc/server").MergedCurrentContext<{
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
        }>, Record<never, never>>, import("@orpc/contract").Schema<unknown, unknown>, import("@orpc/contract").Schema<{
            success: boolean;
            offers: {
                id: string;
                orderId: string;
                offeredPrice: string;
                status: string;
                createdAt: Date;
                respondedAt: Date;
                pickupAddress: string;
                deliveryAddress: string;
                materials: unknown;
                vehicleType: string;
                orderStatus: string;
            }[];
        }, {
            success: boolean;
            offers: {
                id: string;
                orderId: string;
                offeredPrice: string;
                status: string;
                createdAt: Date;
                respondedAt: Date;
                pickupAddress: string;
                deliveryAddress: string;
                materials: unknown;
                vehicleType: string;
                orderStatus: string;
            }[];
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
        cancel: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        }>, import("zod").ZodObject<{
            orderId: import("zod").ZodString;
        }, import("better-auth").$strip>, import("@orpc/contract").Schema<{
            success: boolean;
            message: string;
        }, {
            success: boolean;
            message: string;
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
        updateOrderStatus: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        }>, import("zod").ZodObject<{
            orderId: import("zod").ZodString;
            status: import("zod").ZodEnum<{
                completed: "completed";
                on_the_way: "on_the_way";
                delivered: "delivered";
            }>;
        }, import("better-auth").$strip>, import("@orpc/contract").Schema<{
            success: boolean;
            message: string;
        }, {
            success: boolean;
            message: string;
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    };
    admin: {
        dashboard: {
            getStats: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
                req?: Request;
            } & Record<never, never>, {
                req?: Request;
            }, {
                req?: Request;
            }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
                stats: {
                    totalUsers: number;
                    totalOrders: number;
                    monthlyRevenue: string;
                    totalRevenue: string;
                    activeOrders: number;
                    recentTransactions: number;
                    roleBreakdown: Record<string, number>;
                    statusBreakdown: Record<string, number>;
                    ordersByDay: Record<string, number>;
                    revenueByDay: Record<string, number>;
                };
            }, {
                success: boolean;
                stats: {
                    totalUsers: number;
                    totalOrders: number;
                    monthlyRevenue: string;
                    totalRevenue: string;
                    activeOrders: number;
                    recentTransactions: number;
                    roleBreakdown: Record<string, number>;
                    statusBreakdown: Record<string, number>;
                    ordersByDay: Record<string, number>;
                    revenueByDay: Record<string, number>;
                };
            }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
            getRecentActivity: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
                req?: Request;
            } & Record<never, never>, {
                req?: Request;
            }, {
                req?: Request;
            }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
                recentOrders: {
                    id: string;
                    status: string;
                    finalPrice: string;
                    createdAt: Date;
                    customerName: string;
                }[];
                recentUsers: ({
                    id: any;
                    name: any;
                    role: any;
                    createdAt: any;
                } | {
                    id: any;
                    name: any;
                    role: any;
                    createdAt: any;
                })[];
            }, {
                success: boolean;
                recentOrders: {
                    id: string;
                    status: string;
                    finalPrice: string;
                    createdAt: Date;
                    customerName: string;
                }[];
                recentUsers: ({
                    id: any;
                    name: any;
                    role: any;
                    createdAt: any;
                } | {
                    id: any;
                    name: any;
                    role: any;
                    createdAt: any;
                })[];
            }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
        };
        wallet: {
            getStats: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
                req?: Request;
            } & Record<never, never>, {
                req?: Request;
            }, {
                req?: Request;
            }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
                stats: any;
            } | {
                success: boolean;
                stats: {
                    currentBalance: string;
                    totalFeesCollected: string;
                    monthlyFees: string;
                    todayFees: string;
                    totalOrders: number;
                    earningsByDay: Record<string, {
                        amount: number;
                        count: number;
                    }>;
                };
                message?: undefined;
            }, {
                success: boolean;
                message: string;
                stats: any;
            } | {
                success: boolean;
                stats: {
                    currentBalance: string;
                    totalFeesCollected: string;
                    monthlyFees: string;
                    todayFees: string;
                    totalOrders: number;
                    earningsByDay: Record<string, {
                        amount: number;
                        count: number;
                    }>;
                };
                message?: undefined;
            }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
            getTransactions: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
                req?: Request;
            } & Record<never, never>, {
                req?: Request;
            }, {
                req?: Request;
            }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
            }>, import("zod").ZodObject<{
                limit: import("zod").ZodDefault<import("zod").ZodNumber>;
                offset: import("zod").ZodDefault<import("zod").ZodNumber>;
                startDate: import("zod").ZodOptional<import("zod").ZodString>;
                endDate: import("zod").ZodOptional<import("zod").ZodString>;
            }, import("better-auth").$strip>, import("@orpc/contract").Schema<{
                success: boolean;
                transactions: ({
                    id: string;
                    amount: string;
                    txRef: string;
                    description: string;
                    meta: unknown;
                    createdAt: Date;
                    fromUserName: any;
                    fromUserPhone: any;
                    fromUserProfilePhoto: any;
                } | {
                    id: string;
                    amount: string;
                    txRef: string;
                    description: string;
                    meta: unknown;
                    createdAt: Date;
                    fromUserName: any;
                    fromUserPhone: any;
                    fromUserProfilePhoto: any;
                })[];
                total: number;
                limit: number;
                offset: number;
            }, {
                success: boolean;
                transactions: ({
                    id: string;
                    amount: string;
                    txRef: string;
                    description: string;
                    meta: unknown;
                    createdAt: Date;
                    fromUserName: any;
                    fromUserPhone: any;
                    fromUserProfilePhoto: any;
                } | {
                    id: string;
                    amount: string;
                    txRef: string;
                    description: string;
                    meta: unknown;
                    createdAt: Date;
                    fromUserName: any;
                    fromUserPhone: any;
                    fromUserProfilePhoto: any;
                })[];
                total: number;
                limit: number;
                offset: number;
            }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
            getWithdrawals: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
                req?: Request;
            } & Record<never, never>, {
                req?: Request;
            }, {
                req?: Request;
            }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
            }>, import("zod").ZodObject<{
                limit: import("zod").ZodDefault<import("zod").ZodNumber>;
                offset: import("zod").ZodDefault<import("zod").ZodNumber>;
            }, import("better-auth").$strip>, import("@orpc/contract").Schema<{
                success: boolean;
                withdrawals: {
                    id: string;
                    amount: string;
                    txRef: string;
                    description: string;
                    status: import("../database/schema/payment-schema.js").PaymentStatus;
                    createdAt: Date;
                }[];
                total: number;
                limit: number;
                offset: number;
            }, {
                success: boolean;
                withdrawals: {
                    id: string;
                    amount: string;
                    txRef: string;
                    description: string;
                    status: import("../database/schema/payment-schema.js").PaymentStatus;
                    createdAt: Date;
                }[];
                total: number;
                limit: number;
                offset: number;
            }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
            createPlatformWallet: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
                req?: Request;
            } & Record<never, never>, {
                req?: Request;
            }, {
                req?: Request;
            }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
            }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
        };
        referral: {
            getAnalytics: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
                req?: Request;
            } & Record<never, never>, {
                req?: Request;
            }, {
                req?: Request;
            }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
                analytics: {
                    totalReferrals: number;
                    completedReferrals: number;
                    pendingReferrals: number;
                    expiredReferrals: number;
                    totalRewardsPaid: string;
                    conversionRate: string;
                    referralsByMonth: Record<string, number>;
                };
            }, {
                success: boolean;
                analytics: {
                    totalReferrals: number;
                    completedReferrals: number;
                    pendingReferrals: number;
                    expiredReferrals: number;
                    totalRewardsPaid: string;
                    conversionRate: string;
                    referralsByMonth: Record<string, number>;
                };
            }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
            getConfig: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
                req?: Request;
            } & Record<never, never>, {
                req?: Request;
            }, {
                req?: Request;
            }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
                config: {
                    referrerRewardAmount: string;
                    refereeRewardAmount: string;
                    minOrderAmount: string;
                    expiryDays: number;
                    enabled: boolean;
                };
            } | {
                success: boolean;
                config: {
                    id: string;
                    referrerRewardAmount: string;
                    refereeRewardAmount: string;
                    minOrderAmount: string;
                    expiryDays: number;
                    enabled: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                };
            }, {
                success: boolean;
                config: {
                    referrerRewardAmount: string;
                    refereeRewardAmount: string;
                    minOrderAmount: string;
                    expiryDays: number;
                    enabled: boolean;
                };
            } | {
                success: boolean;
                config: {
                    id: string;
                    referrerRewardAmount: string;
                    refereeRewardAmount: string;
                    minOrderAmount: string;
                    expiryDays: number;
                    enabled: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                };
            }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
            updateConfig: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
                req?: Request;
            } & Record<never, never>, {
                req?: Request;
            }, {
                req?: Request;
            }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
            }>, import("zod").ZodObject<{
                referrerRewardAmount: import("zod").ZodOptional<import("zod").ZodString>;
                refereeRewardAmount: import("zod").ZodOptional<import("zod").ZodString>;
                minOrderAmount: import("zod").ZodOptional<import("zod").ZodString>;
                expiryDays: import("zod").ZodOptional<import("zod").ZodNumber>;
                enabled: import("zod").ZodOptional<import("zod").ZodBoolean>;
            }, import("better-auth").$strip>, import("@orpc/contract").Schema<{
                success: boolean;
                message: string;
            }, {
                success: boolean;
                message: string;
            }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
            getTopReferrers: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
                req?: Request;
            } & Record<never, never>, {
                req?: Request;
            }, {
                req?: Request;
            }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
            }>, import("zod").ZodObject<{
                limit: import("zod").ZodDefault<import("zod").ZodNumber>;
            }, import("better-auth").$strip>, import("@orpc/contract").Schema<{
                success: boolean;
                topReferrers: ({
                    totalEarned: string;
                    completedReferrals: number;
                    userId: any;
                    name: any;
                    phoneNumber: any;
                    referralCode: any;
                    referralCount: any;
                } | {
                    totalEarned: string;
                    completedReferrals: number;
                    userId: any;
                    name: any;
                    phoneNumber: any;
                    referralCode: any;
                    referralCount: any;
                })[];
            }, {
                success: boolean;
                topReferrers: ({
                    totalEarned: string;
                    completedReferrals: number;
                    userId: any;
                    name: any;
                    phoneNumber: any;
                    referralCode: any;
                    referralCount: any;
                } | {
                    totalEarned: string;
                    completedReferrals: number;
                    userId: any;
                    name: any;
                    phoneNumber: any;
                    referralCode: any;
                    referralCount: any;
                })[];
            }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
            getAllReferrals: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
                req?: Request;
            } & Record<never, never>, {
                req?: Request;
            }, {
                req?: Request;
            }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
            }>, import("zod").ZodObject<{
                status: import("zod").ZodOptional<import("zod").ZodEnum<{
                    pending: "pending";
                    completed: "completed";
                    cancelled: "cancelled";
                    expired: "expired";
                }>>;
                limit: import("zod").ZodDefault<import("zod").ZodNumber>;
                offset: import("zod").ZodDefault<import("zod").ZodNumber>;
            }, import("better-auth").$strip>, import("@orpc/contract").Schema<{
                success: boolean;
                referrals: {
                    id: string;
                    status: import("../database/schema/referral-schema.js").ReferralStatus;
                    referrerReward: string;
                    refereeReward: string;
                    completedAt: Date;
                    createdAt: Date;
                    referrerName: string;
                    referrerPhone: string;
                    refereeName: string;
                    refereePhone: string;
                }[];
                total: number;
                limit: number;
                offset: number;
            }, {
                success: boolean;
                referrals: {
                    id: string;
                    status: import("../database/schema/referral-schema.js").ReferralStatus;
                    referrerReward: string;
                    refereeReward: string;
                    completedAt: Date;
                    createdAt: Date;
                    referrerName: string;
                    referrerPhone: string;
                    refereeName: string;
                    refereePhone: string;
                }[];
                total: number;
                limit: number;
                offset: number;
            }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
        };
        agents: {
            list: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
                req?: Request;
            } & Record<never, never>, {
                req?: Request;
            }, {
                req?: Request;
            }>, Record<never, never>>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
            }>, import("zod").ZodOptional<import("zod").ZodObject<{
                search: import("zod").ZodOptional<import("zod").ZodString>;
            }, import("better-auth").$strip>>, import("@orpc/contract").Schema<{
                success: boolean;
                agents: ({
                    id: any;
                    name: any;
                    phoneNumber: any;
                    email: any;
                    accountStatus: any;
                    createdAt: any;
                    image: any;
                    rejectionReason: any;
                    nationalId: string;
                    gender: string;
                    agentType: string;
                    assignedCity: string;
                    assignedTown: string;
                    assignedTownManager: string;
                    latitude: string;
                    longitude: string;
                    idCardFrontId: string;
                    idCardBackId: string;
                } | {
                    id: any;
                    name: any;
                    phoneNumber: any;
                    email: any;
                    accountStatus: any;
                    createdAt: any;
                    image: any;
                    rejectionReason: any;
                    nationalId: string;
                    gender: string;
                    agentType: string;
                    assignedCity: string;
                    assignedTown: string;
                    assignedTownManager: string;
                    latitude: string;
                    longitude: string;
                    idCardFrontId: string;
                    idCardBackId: string;
                })[];
                manager?: undefined;
            } | {
                success: boolean;
                agents: ({
                    id: any;
                    name: any;
                    phoneNumber: any;
                    email: any;
                    accountStatus: any;
                    createdAt: any;
                    image: any;
                    rejectionReason: any;
                    nationalId: string;
                    gender: string;
                    agentType: string;
                    assignedCity: string;
                    assignedTown: string;
                    assignedTownManager: string;
                    latitude: string;
                    longitude: string;
                    idCardFrontId: string;
                    idCardBackId: string;
                } | {
                    id: any;
                    name: any;
                    phoneNumber: any;
                    email: any;
                    accountStatus: any;
                    createdAt: any;
                    image: any;
                    rejectionReason: any;
                    nationalId: string;
                    gender: string;
                    agentType: string;
                    assignedCity: string;
                    assignedTown: string;
                    assignedTownManager: string;
                    latitude: string;
                    longitude: string;
                    idCardFrontId: string;
                    idCardBackId: string;
                })[];
                manager: {
                    townName: string;
                    cityName: string;
                    region: string;
                };
            }, {
                success: boolean;
                agents: ({
                    id: any;
                    name: any;
                    phoneNumber: any;
                    email: any;
                    accountStatus: any;
                    createdAt: any;
                    image: any;
                    rejectionReason: any;
                    nationalId: string;
                    gender: string;
                    agentType: string;
                    assignedCity: string;
                    assignedTown: string;
                    assignedTownManager: string;
                    latitude: string;
                    longitude: string;
                    idCardFrontId: string;
                    idCardBackId: string;
                } | {
                    id: any;
                    name: any;
                    phoneNumber: any;
                    email: any;
                    accountStatus: any;
                    createdAt: any;
                    image: any;
                    rejectionReason: any;
                    nationalId: string;
                    gender: string;
                    agentType: string;
                    assignedCity: string;
                    assignedTown: string;
                    assignedTownManager: string;
                    latitude: string;
                    longitude: string;
                    idCardFrontId: string;
                    idCardBackId: string;
                })[];
                manager?: undefined;
            } | {
                success: boolean;
                agents: ({
                    id: any;
                    name: any;
                    phoneNumber: any;
                    email: any;
                    accountStatus: any;
                    createdAt: any;
                    image: any;
                    rejectionReason: any;
                    nationalId: string;
                    gender: string;
                    agentType: string;
                    assignedCity: string;
                    assignedTown: string;
                    assignedTownManager: string;
                    latitude: string;
                    longitude: string;
                    idCardFrontId: string;
                    idCardBackId: string;
                } | {
                    id: any;
                    name: any;
                    phoneNumber: any;
                    email: any;
                    accountStatus: any;
                    createdAt: any;
                    image: any;
                    rejectionReason: any;
                    nationalId: string;
                    gender: string;
                    agentType: string;
                    assignedCity: string;
                    assignedTown: string;
                    assignedTownManager: string;
                    latitude: string;
                    longitude: string;
                    idCardFrontId: string;
                    idCardBackId: string;
                })[];
                manager: {
                    townName: string;
                    cityName: string;
                    region: string;
                };
            }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
            create: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
                req?: Request;
            } & Record<never, never>, {
                req?: Request;
            }, {
                req?: Request;
            }>, Record<never, never>>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
            }>, import("zod").ZodObject<{
                name: import("zod").ZodString;
                phone: import("zod").ZodString;
                email: import("zod").ZodOptional<import("zod").ZodString>;
                password: import("zod").ZodString;
                nationalId: import("zod").ZodOptional<import("zod").ZodString>;
                gender: import("zod").ZodOptional<import("zod").ZodString>;
                assignedCity: import("zod").ZodOptional<import("zod").ZodString>;
                assignedTown: import("zod").ZodOptional<import("zod").ZodString>;
                assignedTownManager: import("zod").ZodOptional<import("zod").ZodString>;
                agentType: import("zod").ZodOptional<import("zod").ZodString>;
                latitude: import("zod").ZodOptional<import("zod").ZodString>;
                longitude: import("zod").ZodOptional<import("zod").ZodString>;
                idCardFrontId: import("zod").ZodOptional<import("zod").ZodString>;
                idCardBackId: import("zod").ZodOptional<import("zod").ZodString>;
                profilePhotoId: import("zod").ZodOptional<import("zod").ZodString>;
            }, import("better-auth").$strip>, import("@orpc/contract").Schema<{
                success: boolean;
                message: string;
                agentId: any;
            }, {
                success: boolean;
                message: string;
                agentId: any;
            }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
            update: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
                req?: Request;
            } & Record<never, never>, {
                req?: Request;
            }, {
                req?: Request;
            }>, Record<never, never>>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
            }>, import("zod").ZodObject<{
                id: import("zod").ZodString;
                name: import("zod").ZodOptional<import("zod").ZodString>;
                phone: import("zod").ZodOptional<import("zod").ZodString>;
                email: import("zod").ZodOptional<import("zod").ZodString>;
                password: import("zod").ZodOptional<import("zod").ZodString>;
                nationalId: import("zod").ZodOptional<import("zod").ZodString>;
                gender: import("zod").ZodOptional<import("zod").ZodString>;
                assignedCity: import("zod").ZodOptional<import("zod").ZodString>;
                assignedTown: import("zod").ZodOptional<import("zod").ZodString>;
                assignedTownManager: import("zod").ZodOptional<import("zod").ZodString>;
                agentType: import("zod").ZodOptional<import("zod").ZodString>;
                latitude: import("zod").ZodOptional<import("zod").ZodString>;
                longitude: import("zod").ZodOptional<import("zod").ZodString>;
                idCardFrontId: import("zod").ZodOptional<import("zod").ZodString>;
                idCardBackId: import("zod").ZodOptional<import("zod").ZodString>;
                profilePhotoId: import("zod").ZodOptional<import("zod").ZodString>;
            }, import("better-auth").$strip>, import("@orpc/contract").Schema<{
                success: boolean;
                message: string;
            }, {
                success: boolean;
                message: string;
            }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
            updateStatus: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
                req?: Request;
            } & Record<never, never>, {
                req?: Request;
            }, {
                req?: Request;
            }>, Record<never, never>>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
            }>, import("zod").ZodObject<{
                id: import("zod").ZodString;
                status: import("zod").ZodEnum<{
                    active: "active";
                    suspended: "suspended";
                    pending: "pending";
                    rejected: "rejected";
                }>;
            }, import("better-auth").$strip>, import("@orpc/contract").Schema<{
                success: boolean;
                message: string;
            }, {
                success: boolean;
                message: string;
            }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
            rejectAgent: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
                req?: Request;
            } & Record<never, never>, {
                req?: Request;
            }, {
                req?: Request;
            }>, Record<never, never>>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
            }>, import("zod").ZodObject<{
                agentId: import("zod").ZodString;
                reason: import("zod").ZodString;
            }, import("better-auth").$strip>, import("@orpc/contract").Schema<{
                success: boolean;
                message: string;
            }, {
                success: boolean;
                message: string;
            }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
            getPerformance: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
                req?: Request;
            } & Record<never, never>, {
                req?: Request;
            }, {
                req?: Request;
            }>, Record<never, never>>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
            }>, import("zod").ZodObject<{
                agentId: import("zod").ZodString;
            }, import("better-auth").$strip>, import("@orpc/contract").Schema<{
                success: boolean;
                agent: {
                    id: any;
                    name: any;
                    phoneNumber: any;
                    assignedCity: string;
                    assignedTown: string;
                    accountStatus: any;
                } | {
                    id: any;
                    name: any;
                    phoneNumber: any;
                    assignedCity: string;
                    assignedTown: string;
                    accountStatus: any;
                };
                stats: {
                    totalOrders: number;
                    completedOrders: number;
                    pendingOrders: number;
                    rejectedOrders: number;
                };
                commissions: {
                    totalEarnings: number;
                    userCommissions: number;
                    driverCommissions: number;
                    assistedCommissions: number;
                };
                recentJobs: {
                    finalPrice: number;
                    id: string;
                    status: string;
                    createdAt: Date;
                    completedAt: Date;
                }[];
            }, {
                success: boolean;
                agent: {
                    id: any;
                    name: any;
                    phoneNumber: any;
                    assignedCity: string;
                    assignedTown: string;
                    accountStatus: any;
                } | {
                    id: any;
                    name: any;
                    phoneNumber: any;
                    assignedCity: string;
                    assignedTown: string;
                    accountStatus: any;
                };
                stats: {
                    totalOrders: number;
                    completedOrders: number;
                    pendingOrders: number;
                    rejectedOrders: number;
                };
                commissions: {
                    totalEarnings: number;
                    userCommissions: number;
                    driverCommissions: number;
                    assistedCommissions: number;
                };
                recentJobs: {
                    finalPrice: number;
                    id: string;
                    status: string;
                    createdAt: Date;
                    completedAt: Date;
                }[];
            }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
            getMapData: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
                req?: Request;
            } & Record<never, never>, {
                req?: Request;
            }, {
                req?: Request;
            }>, Record<never, never>>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
                agents: ({
                    id: any;
                    name: any;
                    phoneNumber: any;
                    latitude: string;
                    longitude: string;
                    assignedCity: string;
                    assignedTown: string;
                    accountStatus: any;
                    agentType: string;
                } | {
                    id: any;
                    name: any;
                    phoneNumber: any;
                    latitude: string;
                    longitude: string;
                    assignedCity: string;
                    assignedTown: string;
                    accountStatus: any;
                    agentType: string;
                })[];
            }, {
                success: boolean;
                agents: ({
                    id: any;
                    name: any;
                    phoneNumber: any;
                    latitude: string;
                    longitude: string;
                    assignedCity: string;
                    assignedTown: string;
                    accountStatus: any;
                    agentType: string;
                } | {
                    id: any;
                    name: any;
                    phoneNumber: any;
                    latitude: string;
                    longitude: string;
                    assignedCity: string;
                    assignedTown: string;
                    accountStatus: any;
                    agentType: string;
                })[];
            }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
            updateLocation: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
                req?: Request;
            } & Record<never, never>, {
                req?: Request;
            }, {
                req?: Request;
            }>, Record<never, never>>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
            }>, import("zod").ZodObject<{
                id: import("zod").ZodString;
                latitude: import("zod").ZodOptional<import("zod").ZodString>;
                longitude: import("zod").ZodOptional<import("zod").ZodString>;
                assignedCity: import("zod").ZodOptional<import("zod").ZodString>;
                assignedTown: import("zod").ZodOptional<import("zod").ZodString>;
            }, import("better-auth").$strip>, import("@orpc/contract").Schema<{
                success: boolean;
                message: string;
            }, {
                success: boolean;
                message: string;
            }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
            getAnalytics: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
                req?: Request;
            } & Record<never, never>, {
                req?: Request;
            }, {
                req?: Request;
            }>, Record<never, never>>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
                stats: {
                    totalAgents: number;
                    avgReliability: number;
                    totalLateDeliveries: number;
                    totalCompleted: number;
                };
                topAgents: {
                    agentId: string;
                    agentName: unknown;
                    totalOrders: number;
                    completedOrders: number;
                    rejectedOrders: number;
                    cancelledOrders: number;
                    lateDeliveries: number;
                    reliability: number;
                }[];
                lowestAgents: {
                    agentId: string;
                    agentName: unknown;
                    totalOrders: number;
                    completedOrders: number;
                    rejectedOrders: number;
                    cancelledOrders: number;
                    lateDeliveries: number;
                    reliability: number;
                }[];
                allAgents: {
                    agentId: string;
                    agentName: unknown;
                    totalOrders: number;
                    completedOrders: number;
                    rejectedOrders: number;
                    cancelledOrders: number;
                    lateDeliveries: number;
                    reliability: number;
                }[];
                reliabilityTrends: {
                    month: unknown;
                    totalOrders: number;
                    completedOrders: number;
                    reliability: number;
                }[];
            }, {
                success: boolean;
                stats: {
                    totalAgents: number;
                    avgReliability: number;
                    totalLateDeliveries: number;
                    totalCompleted: number;
                };
                topAgents: {
                    agentId: string;
                    agentName: unknown;
                    totalOrders: number;
                    completedOrders: number;
                    rejectedOrders: number;
                    cancelledOrders: number;
                    lateDeliveries: number;
                    reliability: number;
                }[];
                lowestAgents: {
                    agentId: string;
                    agentName: unknown;
                    totalOrders: number;
                    completedOrders: number;
                    rejectedOrders: number;
                    cancelledOrders: number;
                    lateDeliveries: number;
                    reliability: number;
                }[];
                allAgents: {
                    agentId: string;
                    agentName: unknown;
                    totalOrders: number;
                    completedOrders: number;
                    rejectedOrders: number;
                    cancelledOrders: number;
                    lateDeliveries: number;
                    reliability: number;
                }[];
                reliabilityTrends: {
                    month: unknown;
                    totalOrders: number;
                    completedOrders: number;
                    reliability: number;
                }[];
            }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
            getConversionStats: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
                req?: Request;
            } & Record<never, never>, {
                req?: Request;
            }, {
                req?: Request;
            }>, Record<never, never>>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
                overall: {
                    totalRegistered: any;
                    totalActiveUsers: any;
                    totalDrivers: any;
                    totalActiveDrivers: any;
                    totalInactive: any;
                    overallConversion: number;
                };
                agents: {
                    agentId: any;
                    agentName: any;
                    totalRegistered: number;
                    totalDrivers: number;
                    activeUsers: number;
                    activeDrivers: number;
                    inactiveUsers: number;
                    userConversionRate: number;
                    driverConversionRate: number;
                }[];
                trends: {
                    month: any;
                    newRegistrations: number;
                    firstOrders: number;
                    conversionRate: number;
                }[];
            }, {
                success: boolean;
                overall: {
                    totalRegistered: any;
                    totalActiveUsers: any;
                    totalDrivers: any;
                    totalActiveDrivers: any;
                    totalInactive: any;
                    overallConversion: number;
                };
                agents: {
                    agentId: any;
                    agentName: any;
                    totalRegistered: number;
                    totalDrivers: number;
                    activeUsers: number;
                    activeDrivers: number;
                    inactiveUsers: number;
                    userConversionRate: number;
                    driverConversionRate: number;
                }[];
                trends: {
                    month: any;
                    newRegistrations: number;
                    firstOrders: number;
                    conversionRate: number;
                }[];
            }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
            getTierBreakdown: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
                req?: Request;
            } & Record<never, never>, {
                req?: Request;
            }, {
                req?: Request;
            }>, Record<never, never>>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
            }>, import("@orpc/contract").Schema<unknown, unknown>, import("@orpc/contract").Schema<any, any>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
            recalculateTiers: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
                req?: Request;
            } & Record<never, never>, {
                req?: Request;
            }, {
                req?: Request;
            }>, Record<never, never>>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
                total: number;
                upgrades: number;
                breakdown: Record<string, number>;
                success: boolean;
            }, {
                total: number;
                upgrades: number;
                breakdown: Record<string, number>;
                success: boolean;
            }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        };
        driver: {
            getAllDrivers: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
                req?: Request;
            } & Record<never, never>, {
                req?: Request;
            }, {
                req?: Request;
            }>, Record<never, never>>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
                drivers: ({
                    vehicleType: string;
                    vehiclePlate: string;
                    id: any;
                    name: any;
                    phoneNumber: any;
                    accountStatus: any;
                    banned: any;
                    createdAt: any;
                    image: any;
                } | {
                    vehicleType: string;
                    vehiclePlate: string;
                    id: any;
                    name: any;
                    phoneNumber: any;
                    accountStatus: any;
                    banned: any;
                    createdAt: any;
                    image: any;
                })[];
            }, {
                success: boolean;
                drivers: ({
                    vehicleType: string;
                    vehiclePlate: string;
                    id: any;
                    name: any;
                    phoneNumber: any;
                    accountStatus: any;
                    banned: any;
                    createdAt: any;
                    image: any;
                } | {
                    vehicleType: string;
                    vehiclePlate: string;
                    id: any;
                    name: any;
                    phoneNumber: any;
                    accountStatus: any;
                    banned: any;
                    createdAt: any;
                    image: any;
                })[];
            }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
            getDriverDetails: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
                req?: Request;
            } & Record<never, never>, {
                req?: Request;
            }, {
                req?: Request;
            }>, Record<never, never>>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
            }>, import("zod").ZodObject<{
                driverId: import("zod").ZodString;
            }, import("better-auth").$strip>, import("@orpc/contract").Schema<{
                success: boolean;
                driver: {
                    vehicle: {
                        id: string;
                        driverId: string;
                        type: string;
                        make: string;
                        model: string;
                        year: string;
                        plateNumber: string;
                        color: string;
                        capacity: string;
                        registeredByAgentId: string;
                        driverCycleCount: number;
                        driverLifetimeEarnings: string;
                        isActive: boolean;
                        createdAt: Date;
                        updatedAt: Date;
                    };
                    vehicleImage: any;
                    licenseFrontImage: any;
                    licenseBackImage: any;
                };
            }, {
                success: boolean;
                driver: {
                    vehicle: {
                        id: string;
                        driverId: string;
                        type: string;
                        make: string;
                        model: string;
                        year: string;
                        plateNumber: string;
                        color: string;
                        capacity: string;
                        registeredByAgentId: string;
                        driverCycleCount: number;
                        driverLifetimeEarnings: string;
                        isActive: boolean;
                        createdAt: Date;
                        updatedAt: Date;
                    };
                    vehicleImage: any;
                    licenseFrontImage: any;
                    licenseBackImage: any;
                };
            }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
            rejectDriver: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
                req?: Request;
            } & Record<never, never>, {
                req?: Request;
            }, {
                req?: Request;
            }>, Record<never, never>>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
            }>, import("zod").ZodObject<{
                driverId: import("zod").ZodString;
                reason: import("zod").ZodString;
                rejectedDocument: import("zod").ZodEnum<{
                    vehicle: "vehicle";
                    license: "license";
                }>;
            }, import("better-auth").$strip>, import("@orpc/contract").Schema<{
                success: boolean;
                message: string;
            }, {
                success: boolean;
                message: string;
            }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
            getRejectionStatus: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
                req?: Request;
            } & Record<never, never>, {
                req?: Request;
            }, {
                req?: Request;
            }>, Record<never, never>>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
            }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
            clearRejection: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
                req?: Request;
            } & Record<never, never>, {
                req?: Request;
            }, {
                req?: Request;
            }>, Record<never, never>>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
            }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        };
        user: {
            createManager: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
                req?: Request;
            } & Record<never, never>, {
                req?: Request;
            }, {
                req?: Request;
            }>, Record<never, never>>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
            }>, import("zod").ZodObject<{
                name: import("zod").ZodString;
                phoneNumber: import("zod").ZodString;
                password: import("zod").ZodString;
                townName: import("zod").ZodString;
                cityName: import("zod").ZodString;
                region: import("zod").ZodString;
            }, import("better-auth").$strip>, import("@orpc/contract").Schema<{
                success: boolean;
                message: string;
                userId: any;
                managerId: `${string}-${string}-${string}-${string}-${string}`;
            }, {
                success: boolean;
                message: string;
                userId: any;
                managerId: `${string}-${string}-${string}-${string}-${string}`;
            }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
            softDeleteUser: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
                req?: Request;
            } & Record<never, never>, {
                req?: Request;
            }, {
                req?: Request;
            }>, Record<never, never>>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
            }>, import("zod").ZodObject<{
                userId: import("zod").ZodString;
            }, import("better-auth").$strip>, import("@orpc/contract").Schema<{
                success: boolean;
                message: string;
            }, {
                success: boolean;
                message: string;
            }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
            restoreUser: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
                req?: Request;
            } & Record<never, never>, {
                req?: Request;
            }, {
                req?: Request;
            }>, Record<never, never>>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
            }>, import("zod").ZodObject<{
                userId: import("zod").ZodString;
            }, import("better-auth").$strip>, import("@orpc/contract").Schema<{
                success: boolean;
                message: string;
            }, {
                success: boolean;
                message: string;
            }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        };
        order: {
            getAllOrders: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
                req?: Request;
            } & Record<never, never>, {
                req?: Request;
            }, {
                req?: Request;
            }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
            }>, import("zod").ZodObject<{
                page: import("zod").ZodDefault<import("zod").ZodNumber>;
                pageSize: import("zod").ZodDefault<import("zod").ZodNumber>;
                search: import("zod").ZodOptional<import("zod").ZodString>;
                status: import("zod").ZodOptional<import("zod").ZodString>;
                dateFrom: import("zod").ZodOptional<import("zod").ZodString>;
                dateTo: import("zod").ZodOptional<import("zod").ZodString>;
            }, import("better-auth").$strip>, import("@orpc/contract").Schema<{
                success: boolean;
                stats: {
                    totalToday: number;
                    active: number;
                    completed: number;
                    cancelled: number;
                    delayed: number;
                    avgRevenue: string;
                };
                orders: {
                    id: string;
                    customerId: string;
                    customerName: unknown;
                    customerPhone: unknown;
                    driverId: string;
                    driverName: unknown;
                    driverPhone: unknown;
                    pickupAddress: string;
                    deliveryAddress: string;
                    materials: unknown;
                    vehicleType: string;
                    status: string;
                    estimatedPrice: string;
                    finalPrice: string;
                    createdAt: Date;
                    updatedAt: Date;
                }[];
                total: number;
                page: number;
                pageSize: number;
            }, {
                success: boolean;
                stats: {
                    totalToday: number;
                    active: number;
                    completed: number;
                    cancelled: number;
                    delayed: number;
                    avgRevenue: string;
                };
                orders: {
                    id: string;
                    customerId: string;
                    customerName: unknown;
                    customerPhone: unknown;
                    driverId: string;
                    driverName: unknown;
                    driverPhone: unknown;
                    pickupAddress: string;
                    deliveryAddress: string;
                    materials: unknown;
                    vehicleType: string;
                    status: string;
                    estimatedPrice: string;
                    finalPrice: string;
                    createdAt: Date;
                    updatedAt: Date;
                }[];
                total: number;
                page: number;
                pageSize: number;
            }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
        };
        giveaway: {
            getAgents: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
                req?: Request;
            } & Record<never, never>, {
                req?: Request;
            }, {
                req?: Request;
            }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
            }>, import("zod").ZodObject<{
                search: import("zod").ZodOptional<import("zod").ZodString>;
                offset: import("zod").ZodDefault<import("zod").ZodNumber>;
                limit: import("zod").ZodDefault<import("zod").ZodNumber>;
            }, import("better-auth").$strip>, import("@orpc/contract").Schema<{
                success: boolean;
                agents: {
                    id: any;
                    name: any;
                    phone: any;
                    email: any;
                    tier: any;
                    assignedCity: any;
                    assignedTown: any;
                    totalRegistered: number;
                    totalDrivers: number;
                    activeUsers: number;
                    activeDrivers: number;
                    inactiveUsers: number;
                    conversionRate: number;
                    walletBalance: any;
                }[];
                total: number;
                offset: number;
                limit: number;
            }, {
                success: boolean;
                agents: {
                    id: any;
                    name: any;
                    phone: any;
                    email: any;
                    tier: any;
                    assignedCity: any;
                    assignedTown: any;
                    totalRegistered: number;
                    totalDrivers: number;
                    activeUsers: number;
                    activeDrivers: number;
                    inactiveUsers: number;
                    conversionRate: number;
                    walletBalance: any;
                }[];
                total: number;
                offset: number;
                limit: number;
            }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
            awardBonus: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
                req?: Request;
            } & Record<never, never>, {
                req?: Request;
            }, {
                req?: Request;
            }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
            }>, import("zod").ZodObject<{
                agentIds: import("zod").ZodArray<import("zod").ZodString>;
                amount: import("zod").ZodNumber;
                reason: import("zod").ZodOptional<import("zod").ZodString>;
            }, import("better-auth").$strip>, import("@orpc/contract").Schema<{
                success: boolean;
                succeeded: number;
                failed: number;
                totalAmount: string;
                results: {
                    agentId: string;
                    name: string;
                    success: boolean;
                    error?: string;
                }[];
            }, {
                success: boolean;
                succeeded: number;
                failed: number;
                totalAmount: string;
                results: {
                    agentId: string;
                    name: string;
                    success: boolean;
                    error?: string;
                }[];
            }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
        };
        townManager: {
            getReport: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
                req?: Request;
            } & Record<never, never>, {
                req?: Request;
            }, {
                req?: Request;
            }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
            }>, import("zod").ZodOptional<import("zod").ZodObject<{
                search: import("zod").ZodOptional<import("zod").ZodString>;
            }, import("better-auth").$strip>>, import("@orpc/contract").Schema<{
                success: boolean;
                managers: {
                    userId: any;
                    name: any;
                    phone: any;
                    email: any;
                    status: any;
                    approvalStatus: any;
                    townName: any;
                    cityName: any;
                    region: any;
                    agentCount: number;
                    totalRegisteredUsers: number;
                    activeUsers: number;
                    totalDrivers: number;
                    totalOrders: number;
                    totalRevenue: string;
                    conversionRate: number;
                }[];
                totals: {
                    totalRevenue: string;
                    totalManagers: number;
                    totalAgents: number;
                    totalUsers: number;
                    totalActive: number;
                    totalDrivers: number;
                    totalOrders: number;
                };
            }, {
                success: boolean;
                managers: {
                    userId: any;
                    name: any;
                    phone: any;
                    email: any;
                    status: any;
                    approvalStatus: any;
                    townName: any;
                    cityName: any;
                    region: any;
                    agentCount: number;
                    totalRegisteredUsers: number;
                    activeUsers: number;
                    totalDrivers: number;
                    totalOrders: number;
                    totalRevenue: string;
                    conversionRate: number;
                }[];
                totals: {
                    totalRevenue: string;
                    totalManagers: number;
                    totalAgents: number;
                    totalUsers: number;
                    totalActive: number;
                    totalDrivers: number;
                    totalOrders: number;
                };
            }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
            listByCity: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
                req?: Request;
            } & Record<never, never>, {
                req?: Request;
            }, {
                req?: Request;
            }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
            }>, import("zod").ZodObject<{
                cityName: import("zod").ZodString;
            }, import("better-auth").$strip>, import("@orpc/contract").Schema<{
                success: boolean;
                managers: ({
                    userId: string;
                    name: any;
                    phone: any;
                    townName: string;
                    cityName: string;
                } | {
                    userId: string;
                    name: any;
                    phone: any;
                    townName: string;
                    cityName: string;
                })[];
            }, {
                success: boolean;
                managers: ({
                    userId: string;
                    name: any;
                    phone: any;
                    townName: string;
                    cityName: string;
                } | {
                    userId: string;
                    name: any;
                    phone: any;
                    townName: string;
                    cityName: string;
                })[];
            }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
        };
    };
    agent: {
        dashboard: {
            getStats: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
                req?: Request;
            } & Record<never, never>, {
                req?: Request;
            }, {
                req?: Request;
            }>, Record<never, never>>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
                stats: {
                    totalCustomers: number;
                    totalDrivers: number;
                    totalOrders: number;
                    activeOrders: number;
                    recentTransactions: number;
                    currentBalance: number;
                    totalCommissionEarnings: number;
                    userCommissionEarnings: number;
                    driverCommissionEarnings: number;
                    assistedCommissionEarnings: number;
                    statusBreakdown: Record<string, number>;
                    ordersByDay: Record<string, number>;
                    revenueByDay: Record<string, number>;
                    referredCustomers: number;
                    referredDrivers: number;
                };
            }, {
                success: boolean;
                stats: {
                    totalCustomers: number;
                    totalDrivers: number;
                    totalOrders: number;
                    activeOrders: number;
                    recentTransactions: number;
                    currentBalance: number;
                    totalCommissionEarnings: number;
                    userCommissionEarnings: number;
                    driverCommissionEarnings: number;
                    assistedCommissionEarnings: number;
                    statusBreakdown: Record<string, number>;
                    ordersByDay: Record<string, number>;
                    revenueByDay: Record<string, number>;
                    referredCustomers: number;
                    referredDrivers: number;
                };
            }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        };
        getAssignedOrders: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
            orders: {
                customerName: any;
                customerPhone: any;
                pickupLocation: {
                    latitude: string;
                    longitude: string;
                };
                deliveryLocation: {
                    latitude: string;
                    longitude: string;
                };
                id: string;
                customerId: string;
                driverId: string;
                agentId: string;
                pickupAddress: string;
                pickupLatitude: string;
                pickupLongitude: string;
                deliveryAddress: string;
                deliveryLatitude: string;
                deliveryLongitude: string;
                materials: unknown;
                vehicleType: string;
                notes: string;
                estimatedPrice: string;
                finalPrice: string;
                agentFee: string;
                status: string;
                rejectionReason: string;
                createdAt: Date;
                updatedAt: Date;
                approvedAt: Date;
                rejectedAt: Date;
                assignedAt: Date;
                pickedUpAt: Date;
                deliveredAt: Date;
                completedAt: Date;
            }[];
        }, {
            success: boolean;
            orders: {
                customerName: any;
                customerPhone: any;
                pickupLocation: {
                    latitude: string;
                    longitude: string;
                };
                deliveryLocation: {
                    latitude: string;
                    longitude: string;
                };
                id: string;
                customerId: string;
                driverId: string;
                agentId: string;
                pickupAddress: string;
                pickupLatitude: string;
                pickupLongitude: string;
                deliveryAddress: string;
                deliveryLatitude: string;
                deliveryLongitude: string;
                materials: unknown;
                vehicleType: string;
                notes: string;
                estimatedPrice: string;
                finalPrice: string;
                agentFee: string;
                status: string;
                rejectionReason: string;
                createdAt: Date;
                updatedAt: Date;
                approvedAt: Date;
                rejectedAt: Date;
                assignedAt: Date;
                pickedUpAt: Date;
                deliveredAt: Date;
                completedAt: Date;
            }[];
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
        commissions: {
            getUserProgression: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
                req?: Request;
            } & Record<never, never>, {
                req?: Request;
            }, {
                req?: Request;
            }>, Record<never, never>>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
                customers: ({
                    currentRate: number;
                    userLifetimeEarnings: number;
                    id: any;
                    name: any;
                    phoneNumber: any;
                    userCycleCount: any;
                    createdAt: any;
                } | {
                    currentRate: number;
                    userLifetimeEarnings: number;
                    id: any;
                    name: any;
                    phoneNumber: any;
                    userCycleCount: any;
                    createdAt: any;
                })[];
            }, {
                success: boolean;
                customers: ({
                    currentRate: number;
                    userLifetimeEarnings: number;
                    id: any;
                    name: any;
                    phoneNumber: any;
                    userCycleCount: any;
                    createdAt: any;
                } | {
                    currentRate: number;
                    userLifetimeEarnings: number;
                    id: any;
                    name: any;
                    phoneNumber: any;
                    userCycleCount: any;
                    createdAt: any;
                })[];
            }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
            getDriverProgression: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
                req?: Request;
            } & Record<never, never>, {
                req?: Request;
            }, {
                req?: Request;
            }>, Record<never, never>>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
                vehicles: ({
                    currentRate: number;
                    userLifetimeEarnings: number;
                    id: any;
                    name: any;
                    phoneNumber: any;
                    userCycleCount: any;
                    createdAt: any;
                } | {
                    currentRate: number;
                    userLifetimeEarnings: number;
                    id: any;
                    name: any;
                    phoneNumber: any;
                    userCycleCount: any;
                    createdAt: any;
                })[];
            }, {
                success: boolean;
                vehicles: ({
                    currentRate: number;
                    userLifetimeEarnings: number;
                    id: any;
                    name: any;
                    phoneNumber: any;
                    userCycleCount: any;
                    createdAt: any;
                } | {
                    currentRate: number;
                    userLifetimeEarnings: number;
                    id: any;
                    name: any;
                    phoneNumber: any;
                    userCycleCount: any;
                    createdAt: any;
                })[];
            }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
            getConversionMetrics: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
                req?: Request;
            } & Record<never, never>, {
                req?: Request;
            }, {
                req?: Request;
            }>, Record<never, never>>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
                metrics: {
                    totalCustomers: number;
                    activeCustomers: number;
                    inactiveCustomers: number;
                    customerConversionRate: number;
                    totalDrivers: number;
                    activeDrivers: number;
                    inactiveDrivers: number;
                    driverConversionRate: number;
                };
            }, {
                success: boolean;
                metrics: {
                    totalCustomers: number;
                    activeCustomers: number;
                    inactiveCustomers: number;
                    customerConversionRate: number;
                    totalDrivers: number;
                    activeDrivers: number;
                    inactiveDrivers: number;
                    driverConversionRate: number;
                };
            }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
            getAssistanceVerifications: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
                req?: Request;
            } & Record<never, never>, {
                req?: Request;
            }, {
                req?: Request;
            }>, Record<never, never>>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
                verifications: {
                    id: string;
                    orderId: string;
                    assistingAgentId: string;
                    verifiedById: string;
                    verificationStatus: string;
                    verificationNotes: string;
                    createdAt: Date;
                    updatedAt: Date;
                }[];
            }, {
                success: boolean;
                verifications: {
                    id: string;
                    orderId: string;
                    assistingAgentId: string;
                    verifiedById: string;
                    verificationStatus: string;
                    verificationNotes: string;
                    createdAt: Date;
                    updatedAt: Date;
                }[];
            }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        };
        wallet: {
            getWallet: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
                req?: Request;
            } & Record<never, never>, {
                req?: Request;
            }, {
                req?: Request;
            }>, Record<never, never>>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
                wallet: {
                    currentBalance: number;
                    pendingEarnings: number;
                    withdrawableAmount: number;
                    totalLifetimeEarnings: number;
                    lastPaymentDate: Date;
                };
            }, {
                success: boolean;
                wallet: {
                    currentBalance: number;
                    pendingEarnings: number;
                    withdrawableAmount: number;
                    totalLifetimeEarnings: number;
                    lastPaymentDate: Date;
                };
            }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
            getTransactions: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
                req?: Request;
            } & Record<never, never>, {
                req?: Request;
            }, {
                req?: Request;
            }>, Record<never, never>>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
            }>, import("zod").ZodOptional<import("zod").ZodObject<{
                limit: import("zod").ZodDefault<import("zod").ZodOptional<import("zod").ZodNumber>>;
                offset: import("zod").ZodDefault<import("zod").ZodOptional<import("zod").ZodNumber>>;
            }, import("better-auth").$strip>>, import("@orpc/contract").Schema<{
                success: boolean;
                transactions: {
                    id: string;
                    type: string;
                    amount: number;
                    description: string;
                    status: string;
                    createdAt: Date;
                }[];
            }, {
                success: boolean;
                transactions: {
                    id: string;
                    type: string;
                    amount: number;
                    description: string;
                    status: string;
                    createdAt: Date;
                }[];
            }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        };
        completeOnboarding: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        }>, import("zod").ZodObject<{
            name: import("zod").ZodString;
            nationalId: import("zod").ZodOptional<import("zod").ZodString>;
            idCardFrontId: import("zod").ZodString;
            idCardBackId: import("zod").ZodString;
            gender: import("zod").ZodOptional<import("zod").ZodString>;
            agentType: import("zod").ZodDefault<import("zod").ZodOptional<import("zod").ZodEnum<{
                paid_agent: "paid_agent";
                field_agent: "field_agent";
                verification_agent: "verification_agent";
            }>>>;
            assignedCity: import("zod").ZodOptional<import("zod").ZodString>;
            assignedTown: import("zod").ZodOptional<import("zod").ZodString>;
            latitude: import("zod").ZodOptional<import("zod").ZodString>;
            longitude: import("zod").ZodOptional<import("zod").ZodString>;
        }, import("better-auth").$strip>, import("@orpc/contract").Schema<{
            success: boolean;
        }, {
            success: boolean;
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
        selfRegister: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, Record<never, never>, Record<never, never>>, Record<never, never>, import("@orpc/contract").Schema<unknown, unknown>, import("@orpc/contract").Schema<{
            success: boolean;
            message: string;
        }, {
            success: boolean;
            message: string;
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
        getTier: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
            currentTier: import("../services/tier.js").Tier;
            qualifiedTier: import("../services/tier.js").Tier;
            nextTier: import("../services/tier.js").Tier | null;
            stats: import("../services/tier.js").AgentTierStats;
            progress: Record<string, {
                current: number;
                required: number;
                met: boolean;
            }>;
            benefits: string[];
            nextTierBenefits: string[] | null;
            success: boolean;
        }, {
            currentTier: import("../services/tier.js").Tier;
            qualifiedTier: import("../services/tier.js").Tier;
            nextTier: import("../services/tier.js").Tier | null;
            stats: import("../services/tier.js").AgentTierStats;
            progress: Record<string, {
                current: number;
                required: number;
                met: boolean;
            }>;
            benefits: string[];
            nextTierBenefits: string[] | null;
            success: boolean;
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    };
    announcement: {
        create: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        }>, import("zod").ZodObject<{
            title: import("zod").ZodString;
            message: import("zod").ZodString;
            targetType: import("zod").ZodEnum<{
                user: "user";
                driver: "driver";
                all: "all";
            }>;
            expiresAt: import("zod").ZodOptional<import("zod").ZodString>;
        }, import("better-auth").$strip>, import("@orpc/contract").Schema<{
            success: boolean;
            id: `${string}-${string}-${string}-${string}-${string}`;
            message: string;
        }, {
            success: boolean;
            id: `${string}-${string}-${string}-${string}-${string}`;
            message: string;
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
        getAll: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        }>, import("zod").ZodOptional<import("zod").ZodObject<{
            includeInactive: import("zod").ZodOptional<import("zod").ZodBoolean>;
        }, import("better-auth").$strip>>, import("@orpc/contract").Schema<{
            success: boolean;
            announcements: ({
                announcement: {
                    id: string;
                    title: string;
                    message: string;
                    targetType: import("../database/schema/announcement-schema.js").AnnouncementTargetType;
                    isActive: boolean;
                    createdBy: string;
                    createdAt: Date;
                    updatedAt: Date;
                    expiresAt: Date;
                };
                creator: {
                    id: any;
                    name: any;
                };
            } | {
                announcement: {
                    id: string;
                    title: string;
                    message: string;
                    targetType: import("../database/schema/announcement-schema.js").AnnouncementTargetType;
                    isActive: boolean;
                    createdBy: string;
                    createdAt: Date;
                    updatedAt: Date;
                    expiresAt: Date;
                };
                creator: {
                    id: any;
                    name: any;
                };
            })[];
        }, {
            success: boolean;
            announcements: ({
                announcement: {
                    id: string;
                    title: string;
                    message: string;
                    targetType: import("../database/schema/announcement-schema.js").AnnouncementTargetType;
                    isActive: boolean;
                    createdBy: string;
                    createdAt: Date;
                    updatedAt: Date;
                    expiresAt: Date;
                };
                creator: {
                    id: any;
                    name: any;
                };
            } | {
                announcement: {
                    id: string;
                    title: string;
                    message: string;
                    targetType: import("../database/schema/announcement-schema.js").AnnouncementTargetType;
                    isActive: boolean;
                    createdBy: string;
                    createdAt: Date;
                    updatedAt: Date;
                    expiresAt: Date;
                };
                creator: {
                    id: any;
                    name: any;
                };
            })[];
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
        getForUser: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
            announcements: {
                id: string;
                title: string;
                message: string;
                targetType: import("../database/schema/announcement-schema.js").AnnouncementTargetType;
                isActive: boolean;
                createdBy: string;
                createdAt: Date;
                updatedAt: Date;
                expiresAt: Date;
            }[];
        }, {
            success: boolean;
            announcements: {
                id: string;
                title: string;
                message: string;
                targetType: import("../database/schema/announcement-schema.js").AnnouncementTargetType;
                isActive: boolean;
                createdBy: string;
                createdAt: Date;
                updatedAt: Date;
                expiresAt: Date;
            }[];
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
        update: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        }>, import("zod").ZodObject<{
            id: import("zod").ZodString;
            title: import("zod").ZodOptional<import("zod").ZodString>;
            message: import("zod").ZodOptional<import("zod").ZodString>;
            targetType: import("zod").ZodOptional<import("zod").ZodEnum<{
                user: "user";
                driver: "driver";
                all: "all";
            }>>;
            isActive: import("zod").ZodOptional<import("zod").ZodBoolean>;
            expiresAt: import("zod").ZodOptional<import("zod").ZodNullable<import("zod").ZodString>>;
        }, import("better-auth").$strip>, import("@orpc/contract").Schema<{
            success: boolean;
            message: string;
        }, {
            success: boolean;
            message: string;
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
        delete: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        }>, import("zod").ZodObject<{
            id: import("zod").ZodString;
        }, import("better-auth").$strip>, import("@orpc/contract").Schema<{
            success: boolean;
            message: string;
        }, {
            success: boolean;
            message: string;
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
        toggleActive: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
            req?: Request;
        } & Record<never, never>, {
            req?: Request;
        }, {
            req?: Request;
        }>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
        }>, import("zod").ZodObject<{
            id: import("zod").ZodString;
        }, import("better-auth").$strip>, import("@orpc/contract").Schema<{
            success: boolean;
            isActive: boolean;
        }, {
            success: boolean;
            isActive: boolean;
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    };
    referral: {
        getMyReferralCode: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
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
            code: string;
            shareUrl: string;
        }, {
            success: boolean;
            code: string;
            shareUrl: string;
        }>, Record<never, never>, Record<never, never>>;
        validateCode: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/contract").Schema<unknown, unknown>, import("@orpc/contract").Schema<{
            success: boolean;
            valid: boolean;
            message: string;
            reward?: undefined;
        } | {
            success: boolean;
            valid: boolean;
            reward: string;
            message: string;
        }, {
            success: boolean;
            valid: boolean;
            message: string;
            reward?: undefined;
        } | {
            success: boolean;
            valid: boolean;
            reward: string;
            message: string;
        }>, Record<never, never>, Record<never, never>>;
        applyCode: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
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
        getStats: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
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
            totalReferrals: number;
            completedReferrals: number;
            pendingReferrals: number;
            totalEarned: string;
            availableRewards: string;
            success: boolean;
        }, {
            totalReferrals: number;
            completedReferrals: number;
            pendingReferrals: number;
            totalEarned: string;
            availableRewards: string;
            success: boolean;
        }>, Record<never, never>, Record<never, never>>;
        getHistory: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
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
            referrals: ({
                id: string;
                status: import("../database/schema/referral-schema.js").ReferralStatus;
                referrerReward: string;
                referrerRewardClaimed: boolean;
                completedAt: Date;
                createdAt: Date;
                expiresAt: Date;
                refereeName: any;
                refereePhone: any;
            } | {
                id: string;
                status: import("../database/schema/referral-schema.js").ReferralStatus;
                referrerReward: string;
                referrerRewardClaimed: boolean;
                completedAt: Date;
                createdAt: Date;
                expiresAt: Date;
                refereeName: any;
                refereePhone: any;
            })[];
        }, {
            success: boolean;
            referrals: ({
                id: string;
                status: import("../database/schema/referral-schema.js").ReferralStatus;
                referrerReward: string;
                referrerRewardClaimed: boolean;
                completedAt: Date;
                createdAt: Date;
                expiresAt: Date;
                refereeName: any;
                refereePhone: any;
            } | {
                id: string;
                status: import("../database/schema/referral-schema.js").ReferralStatus;
                referrerReward: string;
                referrerRewardClaimed: boolean;
                completedAt: Date;
                createdAt: Date;
                expiresAt: Date;
                refereeName: any;
                refereePhone: any;
            })[];
        }>, Record<never, never>, Record<never, never>>;
        getProgramStatus: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/contract").Schema<unknown, unknown>, import("@orpc/contract").Schema<{
            success: boolean;
            enabled: boolean;
            referrerReward: string;
            refereeReward: string;
            minOrderAmount: string;
            expiryDays: number;
        } | {
            success: boolean;
            enabled: boolean;
            referrerReward?: undefined;
            refereeReward?: undefined;
            minOrderAmount?: undefined;
            expiryDays?: undefined;
        }, {
            success: boolean;
            enabled: boolean;
            referrerReward: string;
            refereeReward: string;
            minOrderAmount: string;
            expiryDays: number;
        } | {
            success: boolean;
            enabled: boolean;
            referrerReward?: undefined;
            refereeReward?: undefined;
            minOrderAmount?: undefined;
            expiryDays?: undefined;
        }>, Record<never, never>, Record<never, never>>;
    };
    health: {
        check: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, Record<never, never>, Record<never, never>>, Record<never, never>, import("@orpc/contract").Schema<unknown, unknown>, import("@orpc/contract").Schema<{
            status: "ok";
            timestamp: number;
            server: string;
            uptime: number;
        }, {
            status: "ok";
            timestamp: number;
            server: string;
            uptime: number;
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
        ping: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, Record<never, never>, Record<never, never>>, Record<never, never>, import("@orpc/contract").Schema<unknown, unknown>, import("@orpc/contract").Schema<{
            pong: "pong";
            timestamp: number;
        }, {
            pong: "pong";
            timestamp: number;
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
        networkTest: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, Record<never, never>, Record<never, never>>, Record<never, never>, import("@orpc/contract").Schema<unknown, unknown>, import("@orpc/contract").Schema<{
            serverTimestamp: number;
            clientTimestamp: number;
            roundTripTime: number;
        }, {
            serverTimestamp: number;
            clientTimestamp: number;
            roundTripTime: number;
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    };
    driverDocuments: {
        getVehicleImages: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/contract").Schema<unknown, unknown>, import("@orpc/contract").Schema<{
            success: boolean;
            images: {
                id: string;
                fileId: string;
                imageType: string;
                description: string;
                displayOrder: number;
                fileName: string;
                mimeType: string;
                size: number;
                url: string;
                createdAt: Date;
                updatedAt: Date;
                isLegacy: boolean;
            }[];
        }, {
            success: boolean;
            images: {
                id: string;
                fileId: string;
                imageType: string;
                description: string;
                displayOrder: number;
                fileName: string;
                mimeType: string;
                size: number;
                url: string;
                createdAt: Date;
                updatedAt: Date;
                isLegacy: boolean;
            }[];
        }>, Record<never, never>, Record<never, never>>;
        addVehicleImage: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/contract").Schema<unknown, unknown>, import("@orpc/contract").Schema<{
            success: boolean;
            imageId: `${string}-${string}-${string}-${string}-${string}`;
            message: string;
        }, {
            success: boolean;
            imageId: `${string}-${string}-${string}-${string}-${string}`;
            message: string;
        }>, Record<never, never>, Record<never, never>>;
        updateVehicleImage: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/contract").Schema<unknown, unknown>, import("@orpc/contract").Schema<{
            success: boolean;
            message: string;
        }, {
            success: boolean;
            message: string;
        }>, Record<never, never>, Record<never, never>>;
        deleteVehicleImage: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/contract").Schema<unknown, unknown>, import("@orpc/contract").Schema<{
            success: boolean;
            message: string;
        }, {
            success: boolean;
            message: string;
        }>, Record<never, never>, Record<never, never>>;
        reorderVehicleImages: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/contract").Schema<unknown, unknown>, import("@orpc/contract").Schema<{
            success: boolean;
            message: string;
        }, {
            success: boolean;
            message: string;
        }>, Record<never, never>, Record<never, never>>;
        migrateLegacyVehiclePhoto: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/contract").Schema<unknown, unknown>, import("@orpc/contract").Schema<{
            success: boolean;
            message: string;
            imageId?: undefined;
        } | {
            success: boolean;
            imageId: `${string}-${string}-${string}-${string}-${string}`;
            message: string;
        }, {
            success: boolean;
            message: string;
            imageId?: undefined;
        } | {
            success: boolean;
            imageId: `${string}-${string}-${string}-${string}-${string}`;
            message: string;
        }>, Record<never, never>, Record<never, never>>;
    };
    manager: {
        dashboard: {
            getMyProfile: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
                req?: Request;
            } & Record<never, never>, {
                req?: Request;
            }, {
                req?: Request;
            }>, Record<never, never>>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
                data?: undefined;
            } | {
                success: boolean;
                data: {
                    id: string;
                    userId: string;
                    townName: string;
                    cityName: string;
                    region: string;
                    status: string;
                    totalAgents: number;
                    regionalRevenue: string;
                    cityRanking: number;
                    latitude: string;
                    longitude: string;
                    contactPhone: string;
                    contactEmail: string;
                    approvalStatus: string;
                    approvedBy: string;
                    notes: string;
                    createdAt: Date;
                    updatedAt: Date;
                };
                message?: undefined;
            }, {
                success: boolean;
                message: string;
                data?: undefined;
            } | {
                success: boolean;
                data: {
                    id: string;
                    userId: string;
                    townName: string;
                    cityName: string;
                    region: string;
                    status: string;
                    totalAgents: number;
                    regionalRevenue: string;
                    cityRanking: number;
                    latitude: string;
                    longitude: string;
                    contactPhone: string;
                    contactEmail: string;
                    approvalStatus: string;
                    approvedBy: string;
                    notes: string;
                    createdAt: Date;
                    updatedAt: Date;
                };
                message?: undefined;
            }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
            getStats: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
                req?: Request;
            } & Record<never, never>, {
                req?: Request;
            }, {
                req?: Request;
            }>, Record<never, never>>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
                profile?: undefined;
                totals?: undefined;
                agents?: undefined;
            } | {
                success: boolean;
                profile: {
                    townName: string;
                    cityName: string;
                    region: string;
                    status: string;
                };
                totals: {
                    totalRevenue: string;
                    totalAgents: number;
                    totalRegistered: number;
                    totalActive: number;
                    totalDrivers: number;
                    totalOrders: number;
                };
                agents: {
                    agentId: any;
                    agentName: any;
                    agentPhone: any;
                    assignedCity: any;
                    assignedTown: any;
                    tier: any;
                    totalRegistered: number;
                    totalDrivers: number;
                    activeUsers: number;
                    activeDrivers: number;
                    completedOrders: number;
                    totalRevenue: number;
                    conversionRate: number;
                }[];
                message?: undefined;
            }, {
                success: boolean;
                message: string;
                profile?: undefined;
                totals?: undefined;
                agents?: undefined;
            } | {
                success: boolean;
                profile: {
                    townName: string;
                    cityName: string;
                    region: string;
                    status: string;
                };
                totals: {
                    totalRevenue: string;
                    totalAgents: number;
                    totalRegistered: number;
                    totalActive: number;
                    totalDrivers: number;
                    totalOrders: number;
                };
                agents: {
                    agentId: any;
                    agentName: any;
                    agentPhone: any;
                    assignedCity: any;
                    assignedTown: any;
                    tier: any;
                    totalRegistered: number;
                    totalDrivers: number;
                    activeUsers: number;
                    activeDrivers: number;
                    completedOrders: number;
                    totalRevenue: number;
                    conversionRate: number;
                }[];
                message?: undefined;
            }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        };
        agents: {
            approve: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
                req?: Request;
            } & Record<never, never>, {
                req?: Request;
            }, {
                req?: Request;
            }>, Record<never, never>>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
            }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
            suspend: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
                req?: Request;
            } & Record<never, never>, {
                req?: Request;
            }, {
                req?: Request;
            }>, Record<never, never>>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
            }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
            assignTerritory: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<Record<never, never>, import("@orpc/server").MergedInitialContext<{
                req?: Request;
            } & Record<never, never>, {
                req?: Request;
            }, {
                req?: Request;
            }>, Record<never, never>>, Record<never, never>>, import("@orpc/server").MergedCurrentContext<{
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
            }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        };
    };
};
export type AppRouter = typeof router;
//# sourceMappingURL=_app.d.ts.map