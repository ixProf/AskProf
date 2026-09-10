import { cookies } from 'next/headers';
import crypto from 'crypto';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Prof442005';
const SESSION_SECRET = process.env.SESSION_SECRET || 'vault-mastermind-secret-key-salt-999';
const COOKIE_NAME = 'prof_vault_token';
export const ADMIN_ROUTE = process.env.ADMIN_ROUTE || '/login';

// Generates an HMAC token representing a valid session
export function createSessionToken(): string {
  const payload = `admin_auth_${Math.floor(Date.now() / (1000 * 60 * 60 * 24))}`; // valid for day
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  return `${payload}.${signature}`;
}

// Verifies whether the provided token is valid
export function verifySessionToken(token: string | null | undefined): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [payload, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig));
}

// Checks password against configured ADMIN_PASSWORD
export function checkAdminPassword(password: string): boolean {
  if (!password) return false;
  return password.trim() === ADMIN_PASSWORD.trim();
}

// Helper for route handlers to verify if current requester is admin
export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export { COOKIE_NAME };
