import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { RPCHandler } from '@orpc/server/fetch';
import * as fs from 'fs';
import * as path from 'path';
import cron from 'node-cron';
import { allowedOrigins, port, config } from './config/env_config.js';
import { logger } from './utils/logger.js';
import { router } from './routes/_app.js';
import { seedAdmin } from './database/seeds/admin-seed.js';
import { seedReferralConfig } from './database/seeds/referral-config-seed.js';
import { betterauthConfig } from './config/betterauth_config.js';
import { createContext } from './middlewares/context.js';
import { createAdminContext } from './middlewares/context-admin.js';
import { createWebSocketServer } from './controllers/websocket/ws.js';
import { cleanupPendingTransactions } from './jobs/cleanup-pending-transactions.js';
import { ipWhitelist } from './middlewares/ip-whitelist.js';
const app = new Hono();
// Security headers
// app.use('*', securityHeaders())
// Input sanitization
// app.use('*', sanitizeInput())
// app.use('*', apiRateLimit)
// uncomment them in production and edit the env file with  ip address, for now in the deployment section  it is commented  
// CORS
app.use('*', cors({
    origin: (origin, _c) => {
        if (!origin) {
            return allowedOrigins[0];
        }
        if (allowedOrigins.includes(origin)) {
            return origin;
        }
        logger.warn('[CORS] Unauthorized origin:', { origin, allowedOrigins });
        return allowedOrigins[0];
    },
    allowMethods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'Cookie', 'Set-Cookie'],
    exposeHeaders: ['Content-Length', 'Content-Type', 'Set-Cookie'],
    credentials: true,
    maxAge: 86400, // 24 hours
}));
let Auth = null;
// Request logging middleware
app.use('*', async (c, next) => {
    const startedAt = Date.now();
    await next();
    const durationMs = Date.now() - startedAt;
    logger.info(`${c.req.method} ${c.req.path} ${c.res.status} - ${durationMs}ms`, {
        version: config.version,
        env: config.nodeEnv,
        durationMs,
        method: c.req.method,
        path: c.req.path,
        status: c.res.status,
    });
});
// Auth routes via Better Auth fetch-style handler (IP whitelist)
app.on(['GET', 'POST'], '/api/auth/*', ipWhitelist(), async (c) => {
    if (!Auth) {
        return c.json({ error: 'Authentication service not ready' }, 503);
    }
    try {
        const request = c.req.raw;
        const headers = new Headers(request.headers);
        if (!headers.get('origin')) {
            headers.set('origin', betterauthConfig.baseURL);
        }
        const modifiedRequest = new Request(request.url, {
            method: request.method,
            headers: headers,
            body: request.body,
            duplex: 'half',
        });
        return await ('handler' in Auth ? Auth.handler(modifiedRequest) : Auth(modifiedRequest));
    }
    catch (error) {
        logger.error('Auth handler error:', {
            error,
            version: config.version,
            env: config.nodeEnv,
            path: c.req.path,
            method: c.req.method,
        });
        return c.json({ error: 'Authentication error' }, 500);
    }
});
const rpcHandler = new RPCHandler(router);
app.all('/rpc/*', async (c) => {
    try {
        const request = c.req.raw;
        const path = c.req.path;
        // Log request body for debugging
        if (path.includes('updateOrderStatus')) {
            try {
                const clonedRequest = request.clone();
                const body = await clonedRequest.text();
                console.log('[RPC] updateOrderStatus request body:', body);
                console.log('[RPC] updateOrderStatus content-length:', request.headers.get('content-length'));
            }
            catch (e) {
                console.error('[RPC] Failed to log request body:', e);
            }
        }
        // Use admin context for admin routes
        const isAdminRoute = path.startsWith('/rpc/admin.');
        const context = isAdminRoute
            ? await createAdminContext({ req: request })
            : await createContext({ req: request });
        const { matched, response } = await rpcHandler.handle(request, {
            prefix: '/rpc',
            context,
        });
        if (matched) {
            // Log response status for debugging
            if (path.includes('updateOrderStatus')) {
                console.log('[RPC] updateOrderStatus response status:', response.status);
                if (response.status === 400) {
                    const clonedResponse = response.clone();
                    const errorBody = await clonedResponse.text();
                    console.log('[RPC] updateOrderStatus 400 error body:', errorBody);
                }
            }
            return response;
        }
        return c.notFound();
    }
    catch (error) {
        logger.error('RPC handler error:', {
            error,
            version: config.version,
            env: config.nodeEnv,
            path: c.req.path,
            method: c.req.method,
        });
        return c.json({ error: 'RPC error' }, 500);
    }
});
// Health check endpoint
app.get('/health', async (c) => {
    return c.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: config.version,
        env: config.nodeEnv
    });
});
// Serve uploaded files statically
app.get('/uploads/*', async (c) => {
    const uploadDir = path.resolve(config.upload.dir);
    const urlPath = c.req.path.replace('/uploads/', '');
    // Try direct file path first (for backward compatibility)
    const directPath = path.join(uploadDir, urlPath);
    const resolvedDirect = path.resolve(directPath);
    if (resolvedDirect.startsWith(uploadDir) && fs.existsSync(resolvedDirect)) {
        const ext = path.extname(directPath).toLowerCase();
        const contentTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.pdf': 'application/pdf',
        };
        const contentType = contentTypes[ext] || 'application/octet-stream';
        const fileContent = fs.readFileSync(resolvedDirect);
        return new Response(fileContent, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000',
            },
        });
    }
    // Look up file by database ID
    const { db } = await import('./database/db.js');
    const { uploadedFile } = await import('./database/schema/file-schema.js');
    const { eq } = await import('drizzle-orm');
    const [fileRecord] = await db
        .select()
        .from(uploadedFile)
        .where(eq(uploadedFile.id, urlPath))
        .limit(1);
    if (!fileRecord) {
        return c.json({ error: 'File not found' }, 404);
    }
    const filePath = path.join(uploadDir, fileRecord.path);
    const resolvedPath = path.resolve(filePath);
    // Security: ensure the file is within the upload directory
    if (!resolvedPath.startsWith(uploadDir)) {
        return c.json({ error: 'Forbidden' }, 403);
    }
    if (!fs.existsSync(resolvedPath)) {
        return c.json({ error: 'File not found' }, 404);
    }
    const ext = path.extname(resolvedPath).toLowerCase();
    const contentTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.pdf': 'application/pdf',
    };
    const contentType = contentTypes[ext] || 'application/octet-stream';
    const fileContent = fs.readFileSync(resolvedPath);
    return new Response(fileContent, {
        headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=31536000',
        },
    });
});
// Serve frontend static files
app.get('/assets/*', async (c) => {
    const frontendDir = path.resolve('./front-end-build');
    const urlPath = c.req.path;
    const filePath = path.join(frontendDir, urlPath);
    const resolvedPath = path.resolve(filePath);
    // Security check
    if (!resolvedPath.startsWith(frontendDir)) {
        return c.json({ error: 'Forbidden' }, 403);
    }
    if (!fs.existsSync(resolvedPath)) {
        return c.json({ error: 'File not found' }, 404);
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentTypes = {
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.webp': 'image/webp',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.ttf': 'font/ttf',
        '.eot': 'application/vnd.ms-fontobject',
    };
    const contentType = contentTypes[ext] || 'application/octet-stream';
    const fileContent = fs.readFileSync(resolvedPath);
    return new Response(fileContent, {
        headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=31536000',
        },
    });
});
// Catch-all route for SPA - serve index.html for all non-API routes
app.get('*', async (c) => {
    const reqPath = c.req.path;
    // Skip API and RPC routes
    if (reqPath.startsWith('/api/') || reqPath.startsWith('/rpc/')) {
        return c.notFound();
    }
    // If URL has a file extension, try to serve it as a static file from frontend build
    const ext = path.extname(reqPath).toLowerCase();
    if (ext) {
        const frontendDir = path.resolve('./front-end-build');
        const filePath = path.join(frontendDir, reqPath);
        const resolvedPath = path.resolve(filePath);
        if (resolvedPath.startsWith(frontendDir) && fs.existsSync(resolvedPath)) {
            const contentTypes = {
                '.js': 'application/javascript',
                '.css': 'text/css',
                '.json': 'application/json',
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.gif': 'image/gif',
                '.svg': 'image/svg+xml',
                '.webp': 'image/webp',
                '.woff': 'font/woff',
                '.woff2': 'font/woff2',
                '.ttf': 'font/ttf',
                '.eot': 'application/vnd.ms-fontobject',
            };
            const contentType = contentTypes[ext] || 'application/octet-stream';
            const fileContent = fs.readFileSync(resolvedPath);
            return new Response(fileContent, {
                headers: {
                    'Content-Type': contentType,
                    'Cache-Control': 'public, max-age=31536000',
                },
            });
        }
        // File not found — return 404 instead of index.html
        return c.json({ error: 'File not found' }, 404);
    }
    // Serve index.html for all other routes (SPA routing)
    const indexPath = path.resolve('./front-end-build/index.html');
    if (!fs.existsSync(indexPath)) {
        logger.warn('[Frontend] index.html not found at:', { path: indexPath });
        return c.json({ error: 'Frontend not built' }, 404);
    }
    const indexContent = fs.readFileSync(indexPath, 'utf-8');
    return c.html(indexContent);
});
// Start server
// Admin routes use cookie-based authentication
const startServer = async () => {
    try {
        const { auth } = await import('./utils/auth.js');
        Auth = auth;
        // Seed admin user
        await seedAdmin();
        // Seed referral config
        await seedReferralConfig();
        const server = serve({
            port,
            fetch: app.fetch,
        });
        // Start WebSocket server on the same HTTP server
        createWebSocketServer(server);
        // Schedule cleanup job to run daily at 2 AM
        cron.schedule('0 2 * * *', async () => {
            logger.info('[Cron] Running scheduled cleanup job at 2 AM');
            await cleanupPendingTransactions();
        }, {
            timezone: 'Africa/Addis_Ababa' // Ethiopian timezone
        });
        // Schedule daily fraud scan at 3 AM
        cron.schedule('0 3 * * *', async () => {
            try {
                logger.info('[Cron] Running scheduled daily fraud scan at 3 AM');
                const { runDailyFraudScan } = await import('./jobs/daily-fraud-scan.js');
                await runDailyFraudScan();
            }
            catch (err) {
                logger.error('[Cron] Daily fraud scan failed:', { error: err });
            }
        }, {
            timezone: 'Africa/Addis_Ababa'
        });
        // Schedule daily tier recalculation at 4 AM
        cron.schedule('0 4 * * *', async () => {
            try {
                logger.info('[Cron] Running scheduled daily tier recalculation at 4 AM');
                const { recalculateAllTiers } = await import('./services/tier.js');
                const result = await recalculateAllTiers();
                logger.info(`[Cron] Tier recalculation complete: ${result.total} agents, ${result.upgrades} upgrades`);
            }
            catch (err) {
                logger.error('[Cron] Daily tier recalculation failed:', { error: err });
            }
        }, {
            timezone: 'Africa/Addis_Ababa'
        });
        logger.info('Scheduled job: Daily tier recalculation at 4 AM (Africa/Addis_Ababa)');
        logger.info('Scheduled job: Daily fraud scan at 3 AM (Africa/Addis_Ababa)');
        logger.info(`Server listening on port ${port}`, { version: config.version, env: config.nodeEnv });
        logger.info(`WebSocket server integrated with HTTP server`, { version: config.version, env: config.nodeEnv });
        logger.info('Scheduled job: Cleanup pending transactions daily at 2 AM (Africa/Addis_Ababa)', { version: config.version, env: config.nodeEnv });
    }
    catch (error) {
        logger.error('Failed to start server:', { error, version: config.version, env: config.nodeEnv });
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=index.js.map