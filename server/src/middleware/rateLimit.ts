import type { NextFunction, Request, Response } from 'express';
import { HttpError } from './errorHandler.js';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message: (retryAfterMinutes: number) => string;
}

/** One timestamp list per client IP, keyed by rate-limit bucket name (e.g. "signup", "login"). */
const buckets = new Map<string, Map<string, number[]>>();

function getBucket(name: string): Map<string, number[]> {
  let bucket = buckets.get(name);
  if (!bucket) {
    bucket = new Map();
    buckets.set(name, bucket);
  }
  return bucket;
}

export function rateLimit(name: string, options: RateLimitOptions) {
  const bucket = getBucket(name);

  return function rateLimitMiddleware(req: Request, _res: Response, next: NextFunction) {
    const ip = req.ip ?? 'unknown';
    const now = Date.now();
    const attempts = (bucket.get(ip) ?? []).filter((timestamp) => now - timestamp < options.windowMs);

    console.log(`[rate-limit:${name}] attempt from ${ip} at ${new Date(now).toISOString()} (${attempts.length + 1}/${options.max})`);

    if (attempts.length >= options.max) {
      const retryAfterMs = options.windowMs - (now - attempts[0]);
      const retryAfterMinutes = Math.max(1, Math.ceil(retryAfterMs / 60_000));
      console.warn(`[rate-limit:${name}] blocked ${ip}, retry in ${retryAfterMinutes}m`);
      next(new HttpError(429, options.message(retryAfterMinutes)));
      return;
    }

    attempts.push(now);
    bucket.set(ip, attempts);
    next();
  };
}

// Periodically drop IPs with no attempts inside the last 24h so the maps don't grow forever.
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000;
const MAX_ENTRY_AGE_MS = 24 * 60 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const bucket of buckets.values()) {
    for (const [ip, timestamps] of bucket) {
      const fresh = timestamps.filter((timestamp) => now - timestamp < MAX_ENTRY_AGE_MS);
      if (fresh.length === 0) {
        bucket.delete(ip);
      } else {
        bucket.set(ip, fresh);
      }
    }
  }
}, CLEANUP_INTERVAL_MS).unref();
