import crypto from 'crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { UserRole } from '@/types/school';

export const SESSION_COOKIE = 'sta_staff_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // eight hour school-day shift

const KEY_LENGTH = 64;
const SCRYPT_OPTIONS = { N: 16384, r: 8, p: 1 } as const;

/* -------------------------------------------------------------------------- */
/*  Passwords                                                                 */
/* -------------------------------------------------------------------------- */

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const derived = crypto.scryptSync(password, salt, KEY_LENGTH, SCRYPT_OPTIONS);
  return `scrypt$${salt.toString('hex')}$${derived.toString('hex')}`;
}

export function verifyPassword(password: string, storedHash?: string): boolean {
  if (!storedHash) return false;
  const parts = storedHash.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;

  try {
    const salt = Buffer.from(parts[1], 'hex');
    const expected = Buffer.from(parts[2], 'hex');
    const derived = crypto.scryptSync(password, salt, expected.length, SCRYPT_OPTIONS);
    return crypto.timingSafeEqual(expected, derived);
  } catch {
    return false;
  }
}

export function passwordProblem(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters long.';
  if (!/[A-Za-z]/.test(password)) return 'Password must contain at least one letter.';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number.';
  return null;
}

/* -------------------------------------------------------------------------- */
/*  Sessions — signed, HttpOnly cookie                                        */
/* -------------------------------------------------------------------------- */

export interface StaffSession {
  staffId: string;
  fullName: string;
  email: string;
  role: UserRole;
  issuedAt: number;
  expiresAt: number;
}

function sessionSecret(): string {
  return (
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    'st-theresa-aubyn-memorial-school-session-secret'
  );
}

function sign(payload: string): string {
  return crypto.createHmac('sha256', sessionSecret()).update(payload).digest('base64url');
}

export function createSessionToken(
  staff: { staffId: string; fullName: string; email: string; role: UserRole }
): string {
  const now = Math.floor(Date.now() / 1000);
  const session: StaffSession & { v: number } = {
    v: 1,
    staffId: staff.staffId,
    fullName: staff.fullName,
    email: staff.email,
    role: staff.role,
    issuedAt: now,
    expiresAt: now + SESSION_MAX_AGE_SECONDS,
  };

  const payload = Buffer.from(JSON.stringify(session)).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function readSessionToken(token?: string | null): StaffSession | null {
  if (!token) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;

  const expected = sign(payload);
  if (
    expected.length !== signature.length ||
    !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  ) {
    return null;
  }

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8')) as StaffSession;
    if (!decoded?.expiresAt || decoded.expiresAt * 1000 < Date.now()) return null;
    return decoded;
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

/* -------------------------------------------------------------------------- */
/*  Server helpers                                                            */
/* -------------------------------------------------------------------------- */

export function getSession(): StaffSession | null {
  return readSessionToken(cookies().get(SESSION_COOKIE)?.value);
}

export const HOME_FOR_ROLE: Record<UserRole, string> = {
  super_admin: '/portal/super-admin',
  headmaster: '/portal/administrator',
  teacher: '/portal/teacher',
};

export const LOGIN_FOR_ROLE: Record<UserRole, string> = {
  super_admin: '/login/super-admin',
  headmaster: '/login/administrator',
  teacher: '/login/teacher',
};

/** Use inside a server component / page to gate a portal section. */
export function requireRole(roles: UserRole[]): StaffSession {
  const session = getSession();
  if (!session) redirect('/login/administrator');

  if (!roles.includes(session.role)) {
    redirect(HOME_FOR_ROLE[session.role]);
  }
  return session;
}

/** Use inside a server component when any signed-in member of staff is enough. */
export function requireStaff(): StaffSession {
  const session = getSession();
  if (!session) redirect('/login/administrator');
  return session;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Administrator',
  headmaster: 'Administrator',
  teacher: 'Teacher',
};
