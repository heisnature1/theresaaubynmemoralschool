import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import {
  HOME_FOR_ROLE,
  LOGIN_FOR_ROLE,
  SESSION_COOKIE,
  createSessionToken,
  sessionCookieOptions,
  verifyPassword,
} from '@/lib/auth';
import { appendAuditLog, getSchoolState, saveSchoolState } from '@/lib/store';
import { UserRole } from '@/types/school';

export const dynamic = 'force-dynamic';

const PORTAL_ROLES: Record<string, UserRole> = {
  super_admin: 'super_admin',
  administrator: 'headmaster',
  teacher: 'teacher',
};

/** Very small in-memory throttle: five attempts per address per ten minutes. */
const attempts = new Map<string, { count: number; first: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function tooManyAttempts(key: string): boolean {
  const record = attempts.get(key);
  if (!record) return false;
  if (Date.now() - record.first > WINDOW_MS) {
    attempts.delete(key);
    return false;
  }
  return record.count >= MAX_ATTEMPTS;
}

function noteFailedAttempt(key: string) {
  const record = attempts.get(key);
  if (!record || Date.now() - record.first > WINDOW_MS) {
    attempts.set(key, { count: 1, first: Date.now() });
    return;
  }
  record.count += 1;
}

export async function POST(req: NextRequest) {
  try {
    const { email, password, portal } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Please enter your email address and password.' },
        { status: 400 }
      );
    }

    const expectedRole = PORTAL_ROLES[String(portal || '')] || null;
    const forwarded = headers().get('x-forwarded-for') || 'local';
    const throttleKey = `${forwarded}:${String(email).toLowerCase()}`;

    if (tooManyAttempts(throttleKey)) {
      return NextResponse.json(
        { error: 'Too many failed attempts. Please wait ten minutes and try again.' },
        { status: 429 }
      );
    }

    const state = getSchoolState();
    const staff = state.staff.find(
      (member) => member.email.toLowerCase() === String(email).trim().toLowerCase()
    );

    if (!staff || !staff.isActive || !verifyPassword(String(password), staff.passwordHash)) {
      noteFailedAttempt(throttleKey);
      return NextResponse.json(
        { error: 'Those credentials do not match our records. Please try again.' },
        { status: 401 }
      );
    }

    if (expectedRole && staff.role !== expectedRole) {
      return NextResponse.json(
        {
          error: `This account signs in through the ${
            staff.role === 'super_admin'
              ? 'Super Administrator'
              : staff.role === 'headmaster'
              ? 'Administrator'
              : 'Teacher'
          } page.`,
          redirect: LOGIN_FOR_ROLE[staff.role],
        },
        { status: 403 }
      );
    }

    staff.lastLoginAt = new Date().toISOString();
    appendAuditLog(state, {
      actorName: staff.fullName,
      actorRole: staff.role,
      action: 'Signed in to the staff portal',
      category: 'system',
      details: `${staff.fullName} (${staff.email}) signed in from ${forwarded}.`,
    });
    saveSchoolState(state);

    const response = NextResponse.json({
      ok: true,
      redirect: HOME_FOR_ROLE[staff.role],
      user: { fullName: staff.fullName, role: staff.role, staffId: staff.staffId },
    });
    response.cookies.set(
      SESSION_COOKIE,
      createSessionToken({
        staffId: staff.staffId,
        fullName: staff.fullName,
        email: staff.email,
        role: staff.role,
      }),
      sessionCookieOptions()
    );
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sign-in failed.' },
      { status: 500 }
    );
  }
}
