import type { WebSocket } from 'ws';
export declare const registerConnection: (userId: string, role: string, ws: WebSocket) => void;
export declare const broadcastOrderToDrivers: (orderId: string) => Promise<void>;
export declare const broadcastToRole: (role: string, data: unknown) => void;
export declare const notifyCustomerOrderUpdate: (customerId: string, data: unknown) => void;
export declare const getUserWebSocket: (userId: string) => WebSocket | null;
export declare const notifyDriverOrderAssigned: (driverId: string, orderId: string) => Promise<void>;
export declare const notifyAgentOrderAssigned: (agentId: string, orderId: string) => Promise<void>;
export declare const broadcastOrderToCallCenter: (orderId: string) => Promise<void>;
//# sourceMappingURL=websocket-broadcast.d.ts.map