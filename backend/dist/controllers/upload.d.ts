export declare const upload: {
    initiate: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
        uploadId: string;
        fileId: string;
        chunkCount: number;
    }, {
        uploadId: string;
        fileId: string;
        chunkCount: number;
    }>, Record<never, never>, Record<never, never>>;
    chunk: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
        success: boolean;
        chunksReceived: number;
    }, {
        success: boolean;
        chunksReceived: number;
    }>, Record<never, never>, Record<never, never>>;
    complete: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
        success: boolean;
        fileId: string;
        path: string;
    }, {
        success: boolean;
        fileId: string;
        path: string;
    }>, Record<never, never>, Record<never, never>>;
    status: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
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
    cancel: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
        success: boolean;
    }, {
        success: boolean;
    }>, Record<never, never>, Record<never, never>>;
    delete: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
        success: boolean;
    }, {
        success: boolean;
    }>, Record<never, never>, Record<never, never>>;
};
//# sourceMappingURL=upload.d.ts.map