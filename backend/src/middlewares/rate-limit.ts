import { Context, Next } from 'hono';
import { logger } from '../utils/logger.js';
import { config } from '../config/env_config.js';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 5 * 60 * 1000);

export interface RateLimitOptions {
  windowMs?: number; // Time window in milliseconds
  max?: number; // Max requests per window
  message?: string;
  skipSuccessfulRequests?: boolean;
}

export function rateLimit(options: RateLimitOptions = {}) {
  const {
    windowMs = config.rateLimit.windowMs,
    max = config.rateLimit.max,
    message = 'Too many requests, please try again later.',
    skipSuccessfulRequests = false,
  } = options;

  return async (c: Context, next: Next) => {
    const ip = c.req.header('x-forwarded-for')?.split(',')[0].trim() || 
               c.req.header('x-real-ip') || 
               'unknown';
    
    const key = `${ip}:${c.req.path}`;
    const now = Date.now();

    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 0,
        resetTime: now + windowMs,
      };
    }

    store[key].count++;

    if (store[key].count > max) {
      logger.warn('[Rate Limit] Exceeded', { ip, path: c.req.path, count: store[key].count });
      return c.json({ error: message }, 429);
    }

    await next();

    // Reset count if request was successful and skipSuccessfulRequests is true
    if (skipSuccessfulRequests && c.res.status < 400) {
      store[key].count--;
    }
  };
}

// Stricter rate limit for auth endpoints
export const authRateLimit = rateLimit({
  windowMs: config.authRateLimit.windowMs,
  max: config.authRateLimit.max,
  message: 'Too many login attempts, please try again later.',
});

// Standard rate limit for API endpoints
export const apiRateLimit = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
});
