// @ts-nocheck
import { WebSocketServer } from 'ws';
import { RPCHandler } from '@orpc/server/ws';
import { onError } from '@orpc/server';
import { wsRouter } from '../../routes/ws-router.js';
import { db } from '../../database/db.js';
import { user } from '../../database/schema/auth-schema.js';
import { eq } from 'drizzle-orm';
import { verifyToken } from '../../utils/jwt.js';
import { registerConnection } from '../../utils/websocket-broadcast.js';
const handler = new RPCHandler(wsRouter, {
    interceptors: [
        onError((error) => {
            console.error('WebSocket RPC error:', error);
        }),
    ],
});
export const createWebSocketServer = (server) => {
    const wss = new WebSocketServer({ server });
    wss.on('connection', async (ws, req) => {
        const remote = req.socket?.remoteAddress;
        console.log('[WS] client connected', { remote });
        let authenticatedUser = null;
        // Extract token from query params or headers (for mobile app)
        const url = new URL(req.url, `http://${req.headers.host}`);
        const token = url.searchParams.get('token') || req.headers.authorization?.replace('Bearer ', '');
        if (token) {
            try {
                const decoded = await verifyToken(token);
                if (decoded) {
                    const dbUser = await db.select().from(user).where(eq(user.id, decoded.userId)).limit(1);
                    if (dbUser[0]) {
                        authenticatedUser = {
                            id: dbUser[0].id,
                            name: dbUser[0].name,
                            email: dbUser[0].email,
                            role: dbUser[0].role,
                            phoneNumber: dbUser[0].phoneNumber
                        };
                        console.log('[WS] authenticated via JWT', {
                            userId: authenticatedUser.id,
                            role: authenticatedUser.role,
                            phoneNumber: authenticatedUser.phoneNumber,
                            remote,
                        });
                        registerConnection(authenticatedUser.id, authenticatedUser.role, ws);
                    }
                }
            }
            catch (error) {
                console.log('[WS] JWT authentication failed:', error);
            }
        }
        // Try Better Auth session cookies (for web dashboard)
        if (!authenticatedUser && req.headers.cookie) {
            try {
                console.log('[WS] Attempting Better Auth session authentication...');
                const { auth } = await import('../../utils/auth.js');
                // Create a minimal Request object with cookies
                const headers = new Headers();
                headers.set('cookie', req.headers.cookie);
                const sessionData = await auth.api.getSession({
                    headers,
                });
                if (sessionData?.user && sessionData?.session) {
                    authenticatedUser = {
                        id: sessionData.user.id,
                        name: sessionData.user.name,
                        email: sessionData.user.email,
                        role: sessionData.user.role,
                        phoneNumber: sessionData.user.phoneNumber || ''
                    };
                    console.log('[WS] authenticated via Better Auth', {
                        userId: authenticatedUser.id,
                        role: authenticatedUser.role,
                        remote,
                    });
                    registerConnection(authenticatedUser.id, authenticatedUser.role, ws);
                }
                else {
                    console.log('[WS] Better Auth session not found');
                }
            }
            catch (error) {
                console.log('[WS] Better Auth authentication failed:', error);
            }
        }
        handler.upgrade(ws, {
            context: {
                user: authenticatedUser,
                authenticated: !!authenticatedUser,
            },
        });
        // Debug: log incoming WS frames (helps diagnose ORPCError: Not Found)
        ws.on('message', (data) => {
            try {
                const text = typeof data === 'string' ? data : data?.toString?.() ?? '';
                console.log('[WS] message', text.slice(0, 500));
            }
            catch (e) {
                console.log('[WS] message (unreadable)', String(e).slice(0, 200));
            }
        });
        ws.on('close', () => {
            console.log('[WS] client disconnected', {
                userId: authenticatedUser?.id,
                role: authenticatedUser?.role,
                remote,
            });
        });
    });
    console.log(`WebSocket server integrated with HTTP server`);
    return wss;
};
//# sourceMappingURL=ws.js.map