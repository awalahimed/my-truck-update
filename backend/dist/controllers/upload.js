import { os } from '@orpc/server';
import { z } from 'zod';
import { initiateUpload, uploadChunk, completeUpload, getUploadStatus, cancelUpload, deleteFileByPath, } from '../utils/upload.js';
// Input validation schemas
const initiateSchema = z.object({
    filename: z.string(),
    mimeType: z.string(),
    size: z.number(),
    userId: z.string().optional(),
    documentType: z.string().optional(),
});
const chunkSchema = z.object({
    uploadId: z.string(),
    chunk: z.string(),
    index: z.number(),
});
const uploadIdSchema = z.object({
    uploadId: z.string(),
});
// ORPC handlers
export const upload = {
    initiate: os.handler(async (ctx) => {
        try {
            const input = initiateSchema.parse(ctx.input);
            const userId = input.userId ?? null;
            const documentType = input.documentType ?? 'other';
            console.log('[upload/initiate] Starting upload:', { filename: input.filename, mimeType: input.mimeType, size: input.size, userId, documentType });
            const result = await initiateUpload({
                filename: input.filename,
                mimeType: input.mimeType,
                size: Number(input.size),
                userId,
                documentType,
            });
            console.log('[upload/initiate] Success:', result.uploadId);
            return result;
        }
        catch (error) {
            console.error('[upload/initiate] Error:', error);
            throw error;
        }
    }),
    chunk: os.handler(async (ctx) => {
        try {
            const input = chunkSchema.parse(ctx.input);
            // Decode base64 to binary
            const chunk = Buffer.from(input.chunk, 'base64');
            console.log('[upload/chunk] Uploading chunk:', { uploadId: input.uploadId, index: input.index, chunkSize: chunk.length, base64Length: input.chunk.length });
            const result = await uploadChunk({
                uploadId: input.uploadId,
                chunk: new Uint8Array(chunk),
                index: Number(input.index),
            });
            console.log('[upload/chunk] Success:', result.chunksReceived);
            return result;
        }
        catch (error) {
            console.error('[upload/chunk] Error:', error);
            throw error;
        }
    }),
    complete: os.handler(async (ctx) => {
        try {
            const input = uploadIdSchema.parse(ctx.input);
            const result = await completeUpload({
                uploadId: input.uploadId,
            });
            return result;
        }
        catch (error) {
            console.error('[upload/complete] Error:', error);
            throw error;
        }
    }),
    status: os.handler(async (ctx) => {
        try {
            const input = uploadIdSchema.parse(ctx.input);
            const result = await getUploadStatus({
                uploadId: input.uploadId,
            });
            return result;
        }
        catch (error) {
            console.error('[upload/status] Error:', error);
            throw error;
        }
    }),
    cancel: os.handler(async (ctx) => {
        try {
            const input = uploadIdSchema.parse(ctx.input);
            const result = await cancelUpload({
                uploadId: input.uploadId,
            });
            return result;
        }
        catch (error) {
            console.error('[upload/cancel] Error:', error);
            throw error;
        }
    }),
    delete: os.handler(async (ctx) => {
        try {
            const input = z.object({ filePath: z.string() }).parse(ctx.input);
            const result = await deleteFileByPath(input.filePath);
            return result;
        }
        catch (error) {
            console.error('[upload/delete] Error:', error);
            throw error;
        }
    }),
};
//# sourceMappingURL=upload.js.map