/**
 * Cleanup job to remove pending transactions older than 1 hour
 * Runs once daily at night (2 AM)
 */
export declare function cleanupPendingTransactions(): Promise<{
    success: boolean;
    deletedCount: any;
    error?: undefined;
} | {
    success: boolean;
    error: string;
    deletedCount?: undefined;
}>;
//# sourceMappingURL=cleanup-pending-transactions.d.ts.map