import { z } from 'zod';
export declare const announcementController: {
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
    }>, z.ZodObject<{
        title: z.ZodString;
        message: z.ZodString;
        targetType: z.ZodEnum<{
            user: "user";
            driver: "driver";
            all: "all";
        }>;
        expiresAt: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>, import("@orpc/server").Schema<{
        success: boolean;
        id: `${string}-${string}-${string}-${string}-${string}`;
        message: string;
    }, {
        success: boolean;
        id: `${string}-${string}-${string}-${string}-${string}`;
        message: string;
    }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
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
    }>, z.ZodOptional<z.ZodObject<{
        includeInactive: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>>, import("@orpc/server").Schema<{
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
    }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
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
    }>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
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
    }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
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
    }>, z.ZodObject<{
        id: z.ZodString;
        title: z.ZodOptional<z.ZodString>;
        message: z.ZodOptional<z.ZodString>;
        targetType: z.ZodOptional<z.ZodEnum<{
            user: "user";
            driver: "driver";
            all: "all";
        }>>;
        isActive: z.ZodOptional<z.ZodBoolean>;
        expiresAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>, import("@orpc/server").Schema<{
        success: boolean;
        message: string;
    }, {
        success: boolean;
        message: string;
    }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
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
    }>, z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>, import("@orpc/server").Schema<{
        success: boolean;
        message: string;
    }, {
        success: boolean;
        message: string;
    }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
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
    }>, z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>, import("@orpc/server").Schema<{
        success: boolean;
        isActive: boolean;
    }, {
        success: boolean;
        isActive: boolean;
    }>, import("@orpc/server").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
};
//# sourceMappingURL=announcement.d.ts.map