import { neon } from '@neondatabase/serverless';

// ==========================================
// Configurable Rate Limit Constants
// ==========================================
export const MAX_ADMIN_LOGIN_ATTEMPTS = 5;
export const ADMIN_LOCKOUT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// In-memory sliding window rate limiter (for general requests & fallback)
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

function getDbSql() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;
  try {
    return neon(connectionString);
  } catch {
    return null;
  }
}

/**
 * Checks if a given identifier exceeds the limit (in-memory sliding window).
 * Used for public question submissions.
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 5,
  windowMs: number = 5 * 60 * 1000
): { allowed: boolean; remaining: number; resetInSeconds: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  // Clean up if expired
  if (!record || now > record.resetAt) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetInSeconds: Math.ceil(windowMs / 1000),
    };
  }

  if (record.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds: Math.ceil((record.resetAt - now) / 1000),
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetInSeconds: Math.ceil((record.resetAt - now) / 1000),
  };
}

/**
 * Checks if an IP is locked out from admin login attempts.
 * Uses Neon Postgres for durable tracking across serverless instances,
 * with fallback to memory if database is not reachable.
 */
export async function checkAdminLoginRateLimit(ip: string): Promise<{
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
}> {
  const now = Date.now();
  const sql = getDbSql();

  if (sql) {
    try {
      const rows = await sql`
        SELECT failed_attempts, locked_until, updated_at
        FROM admin_login_attempts
        WHERE ip = ${ip}
        LIMIT 1;
      `;

      if (rows.length > 0) {
        const row = rows[0] as {
          failed_attempts: number;
          locked_until: string | Date | null;
          updated_at: string | Date;
        };

        const failedAttempts = Number(row.failed_attempts) || 0;
        const updatedAt = new Date(row.updated_at).getTime();
        const lockedUntil = row.locked_until ? new Date(row.locked_until).getTime() : null;

        // Check if currently locked out
        if (lockedUntil && lockedUntil > now) {
          const resetInSeconds = Math.max(1, Math.ceil((lockedUntil - now) / 1000));
          return { allowed: false, remaining: 0, resetInSeconds };
        }

        // Check if window has expired since last attempt
        if (now - updatedAt > ADMIN_LOCKOUT_WINDOW_MS) {
          return {
            allowed: true,
            remaining: MAX_ADMIN_LOGIN_ATTEMPTS,
            resetInSeconds: Math.ceil(ADMIN_LOCKOUT_WINDOW_MS / 1000),
          };
        }

        // Check if reached max attempts
        if (failedAttempts >= MAX_ADMIN_LOGIN_ATTEMPTS) {
          const resetInSeconds = Math.max(1, Math.ceil((updatedAt + ADMIN_LOCKOUT_WINDOW_MS - now) / 1000));
          return { allowed: false, remaining: 0, resetInSeconds };
        }

        const remaining = Math.max(0, MAX_ADMIN_LOGIN_ATTEMPTS - failedAttempts);
        return {
          allowed: true,
          remaining,
          resetInSeconds: Math.ceil((updatedAt + ADMIN_LOCKOUT_WINDOW_MS - now) / 1000),
        };
      }
    } catch (err) {
      console.error('Database rate limit check failed, falling back to memory store:', err);
    }
  }

  // In-memory fallback
  const memKey = `admin_login_${ip}`;
  const memRecord = rateLimitStore.get(memKey);
  if (!memRecord || now > memRecord.resetAt) {
    return {
      allowed: true,
      remaining: MAX_ADMIN_LOGIN_ATTEMPTS,
      resetInSeconds: Math.ceil(ADMIN_LOCKOUT_WINDOW_MS / 1000),
    };
  }

  if (memRecord.count >= MAX_ADMIN_LOGIN_ATTEMPTS) {
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds: Math.ceil((memRecord.resetAt - now) / 1000),
    };
  }

  return {
    allowed: true,
    remaining: MAX_ADMIN_LOGIN_ATTEMPTS - memRecord.count,
    resetInSeconds: Math.ceil((memRecord.resetAt - now) / 1000),
  };
}

/**
 * Records a failed login attempt for an IP.
 */
export async function recordAdminLoginFailure(ip: string): Promise<{
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
}> {
  const now = Date.now();
  const sql = getDbSql();

  // In-memory update (both for fallback and dual-layer defense)
  const memKey = `admin_login_${ip}`;
  const memRecord = rateLimitStore.get(memKey);
  if (!memRecord || now > memRecord.resetAt) {
    rateLimitStore.set(memKey, { count: 1, resetAt: now + ADMIN_LOCKOUT_WINDOW_MS });
  } else {
    memRecord.count += 1;
  }

  if (sql) {
    try {
      const lockDurationInterval = `${Math.ceil(ADMIN_LOCKOUT_WINDOW_MS / 60000)} minutes`;

      const rows = await sql`
        INSERT INTO admin_login_attempts (ip, failed_attempts, locked_until, updated_at)
        VALUES (
          ${ip},
          1,
          CASE WHEN 1 >= ${MAX_ADMIN_LOGIN_ATTEMPTS} THEN NOW() + (${lockDurationInterval})::interval ELSE NULL END,
          NOW()
        )
        ON CONFLICT (ip) DO UPDATE SET
          failed_attempts = CASE
            WHEN NOW() - admin_login_attempts.updated_at > (${lockDurationInterval})::interval THEN 1
            ELSE admin_login_attempts.failed_attempts + 1
          END,
          locked_until = CASE
            WHEN admin_login_attempts.failed_attempts + 1 >= ${MAX_ADMIN_LOGIN_ATTEMPTS}
                 AND (NOW() - admin_login_attempts.updated_at <= (${lockDurationInterval})::interval)
            THEN NOW() + (${lockDurationInterval})::interval
            ELSE NULL
          END,
          updated_at = NOW()
        RETURNING failed_attempts, locked_until;
      `;

      if (rows.length > 0) {
        const row = rows[0] as { failed_attempts: number; locked_until: string | Date | null };
        const failed = Number(row.failed_attempts) || 0;
        const remaining = Math.max(0, MAX_ADMIN_LOGIN_ATTEMPTS - failed);
        const locked = failed >= MAX_ADMIN_LOGIN_ATTEMPTS;
        return {
          allowed: !locked,
          remaining,
          resetInSeconds: Math.ceil(ADMIN_LOCKOUT_WINDOW_MS / 1000),
        };
      }
    } catch (err) {
      console.error('Database record login failure error, fallback applied:', err);
    }
  }

  const updatedMem = rateLimitStore.get(memKey);
  const count = updatedMem ? updatedMem.count : 1;
  const remaining = Math.max(0, MAX_ADMIN_LOGIN_ATTEMPTS - count);
  return {
    allowed: count < MAX_ADMIN_LOGIN_ATTEMPTS,
    remaining,
    resetInSeconds: Math.ceil(ADMIN_LOCKOUT_WINDOW_MS / 1000),
  };
}

/**
 * Resets failed login attempts after a successful authentication.
 */
export async function recordAdminLoginSuccess(ip: string): Promise<void> {
  // Clear in-memory
  rateLimitStore.delete(`admin_login_${ip}`);

  const sql = getDbSql();
  if (sql) {
    try {
      await sql`
        DELETE FROM admin_login_attempts
        WHERE ip = ${ip};
      `;
    } catch (err) {
      console.error('Database reset login attempts error:', err);
    }
  }
}
