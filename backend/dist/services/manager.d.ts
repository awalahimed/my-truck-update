/**
 * NOTE: Manager features are not yet implemented.
 * These functions are stubs and will return mock data or no-op responses.
 * Implement these functions once manager schema is finalized in database.
 */
/**
 * Get manager dashboard stats
 */
export declare function getManagerDashboard(managerId: string): Promise<{
    manager: {
        id: string;
    };
    stats: {
        totalAgents: number;
        regionalRevenue: number;
        monthlyCommission: number;
    };
    recentActivity: {};
}>;
/**
 * Get all managed agents for a manager
 */
export declare function getManagedAgents(managerId: string): Promise<any[]>;
/**
 * Run automated fraud detection checks for a manager's region
 */
export declare function runFraudDetection(managerId: string): Promise<any[]>;
/**
 * Approve an agent
 */
export declare function approveAgent(managerId: string, agentId: string, notes?: string): Promise<{
    success: boolean;
    message: string;
}>;
/**
 * Suspend an agent
 */
export declare function suspendAgent(managerId: string, agentId: string, reason: string): Promise<{
    success: boolean;
    message: string;
}>;
/**
 * Assign territory to an agent
 */
export declare function assignTerritory(managerId: string, agentId: string, areaName: string): Promise<{
    success: boolean;
    message: string;
}>;
/**
 * Create fraud alert
 */
export declare function createFraudAlert(managerId: string, agentId: string, alertType: string, severity: 'low' | 'medium' | 'high' | 'critical', description: string): Promise<{
    success: boolean;
    alertId: string;
}>;
/**
 * Calculate manager override commission from agent earnings
 */
export declare function calculateManagerCommission(managerId: string, agentId: string, agentCommissionAmount: number, orderId: string, month: string): Promise<{
    success: boolean;
    amount: number;
}>;
/**
 * Add operational incentive
 */
export declare function addOperationalIncentive(managerId: string, agentId: string, amount: number): Promise<{
    success: boolean;
    message: string;
}>;
/**
 * Get manager monthly compensation
 */
export declare function getManagerMonthlyCompensation(managerId: string, month: string): Promise<{
    compensation: any[];
    totalAmount: number;
}>;
/**
 * Get manager fraud alerts
 */
export declare function getManagerFraudAlerts(managerId: string): Promise<any[]>;
/**
 * Resolve fraud alert
 */
export declare function resolveFraudAlert(managerId: string, alertId: string, resolution: string): Promise<{
    success: boolean;
    message: string;
}>;
//# sourceMappingURL=manager.d.ts.map