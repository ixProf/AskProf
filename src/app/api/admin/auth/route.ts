import { NextRequest, NextResponse } from 'next/server';
import { checkAdminPassword, createSessionToken, isAdminAuthenticated, COOKIE_NAME } from '@/lib/auth';
import {
  checkAdminLoginRateLimit,
  recordAdminLoginFailure,
  recordAdminLoginSuccess,
} from '@/lib/ratelimit';

export async function GET() {
  const authenticated = await isAdminAuthenticated();
  return NextResponse.json({ authenticated });
}

export async function POST(req: NextRequest) {
  try {
    // Extract client IP safely
    const forwarded = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const ip = forwarded
      ? forwarded.split(',')[0].trim()
      : realIp
      ? realIp.trim()
      : 'local-client';

    // 1. Check if IP is currently locked out
    const rateCheck = await checkAdminLoginRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many failed login attempts. Access temporarily locked for security.',
          resetInSeconds: rateCheck.resetInSeconds,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { password } = body;

    // 2. Validate password (credentials are never logged)
    if (!password || typeof password !== 'string' || !checkAdminPassword(password)) {
      const failState = await recordAdminLoginFailure(ip);
      if (!failState.allowed) {
        return NextResponse.json(
          {
            success: false,
            error: 'Too many failed login attempts. Access temporarily locked for security.',
            resetInSeconds: failState.resetInSeconds,
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Invalid credentials.',
          remainingAttempts: failState.remaining,
        },
        { status: 401 }
      );
    }

    // 3. Password is valid: Reset failed attempt count for this IP
    await recordAdminLoginSuccess(ip);

    const token = createSessionToken();
    const response = NextResponse.json({
      success: true,
      message: 'Access granted.',
    });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Admin auth error:', error);
    return NextResponse.json({ success: false, error: 'Authentication request failed' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Session closed' });
  response.cookies.delete(COOKIE_NAME);
  return response;
}
