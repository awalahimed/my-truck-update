import { uploadedFile, type UploadStatus } from '../database/schema/file-schema.js';
export declare function ensureUploadDir(): void;
export declare function ensureTypeDir(documentType: string): string;
export declare function generateFileName(originalName: string): string;
export declare function validateMimeType(mimeType: string): boolean;
export declare function initiateUpload(params: {
    filename: string;
    mimeType: string;
    size: number;
    userId?: string | null;
    documentType?: string;
}): Promise<{
    uploadId: string;
    fileId: string;
    chunkCount: number;
}>;
export declare function uploadChunk(params: {
    uploadId: string;
    chunk: Uint8Array;
    index: number;
}): Promise<{
    success: boolean;
    chunksReceived: number;
}>;
export declare function completeUpload(params: {
    uploadId: string;
}): Promise<{
    success: boolean;
    fileId: string;
    path: string;
}>;
export declare function getUploadStatus(params: {
    uploadId: string;
}): Promise<{
    uploadId: string;
    fileId: string;
    status: UploadStatus;
    chunksReceived: number;
    chunkCount: number;
    progress: number;
}>;
export declare function cancelUpload(params: {
    uploadId: string;
}): Promise<{
    success: boolean;
}>;
export declare function getFileByUserAndType(params: {
    userId: string;
    documentType: string;
}): Promise<typeof uploadedFile.$inferSelect | null>;
export declare function deleteFileByPath(filePath: string): Promise<{
    success: boolean;
}>;
export declare function deleteFileById(params: {
    fileId: string;
}): Promise<{
    success: boolean;
}>;
//# sourceMappingURL=upload.d.ts.map