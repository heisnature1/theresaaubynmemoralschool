import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import {
  PARENT_SESSION_COOKIE,
  createParentSessionToken,
  parentCookieOptions,
  verifyPassword,
} from '@/lib/auth';
import { appendAuditLog, getSchoolState, saveSchoolState } from '@/lib/store';
import { normalisePhone } from '@/lib/admissions';

export const dynamic = 'force-dynamic';

/**
 * Parents' sign-in.
 *
 * A parent signs in with the pupil's admission code and either the guardian
 * telephone number already on the pupil's record or the access PIN the office
 * issued. The session names the pupil records the parent may open: brothers
 * and sisters on the same telephone number come together.
 */

const attempts = new Map<string, { count: number; first: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 6;

function throttleKey(forwarded: string, code: string) {
  return `parent:${forwarded}:${code}`;
}

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

/** STA/2026/101 and sta 2026 101 are the same code. */
function normaliseCode(value: string): string {
  return String(value || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

export async function POST(req: NextRequest) {
  try {
    const { studentCode, guardianPhone, pin } = await req.json();

    if (!studentCode) {
      return NextResponse.json(
        { error: "Please enter the pupil's admission code." },
        { status: 400 }
      );
    }
    if (!guardianPhone && !pin) {
      return NextResponse.json(
        { error: 'Enter the guardian telephone number on the school record, or the access PIN.' },
        { status: 400 }
      );
    }

    const forwarded = headers().get('x-forwarded-for') || 'local';
    const code = normaliseCode(studentCode);
    const key = throttleKey(forwarded, code);

    if (tooManyAttempts(key)) {
      return NextResponse.json(
        { error: 'Too many attempts. Please wait ten minutes, or ask the school office.' },
        { status: 429 }
      );
    }

    const state = getSchoolState();
    const pupil = state.students.find((entry) => normaliseCode(entry.studentCode) === code);

    if (!pupil) {
      noteFailedAttempt(key);
      return NextResponse.json(
        { error: "We could not find that admission code. Please check it and try again." },
        { status: 401 }
      );
    }

    const pinAccepted = pin ? verifyPassword(String(pin), pupil.accessPinHash) : false;
    const phoneAccepted = guardianPhone
      ? normalisePhone(String(guardianPhone)) === normalisePhone(pupil.guardianPhone) &&
        normalisePhone(String(guardianPhone)).length >= 6
      : false;

    if (!pinAccepted && !phoneAccepted) {
      noteFailedAttempt(key);
      return NextResponse.json(
        {
          error:
            'Those details do not match our records. Use the guardian telephone number the school holds, or ask the office for an access PIN.',
        },
        { status: 401 }
      );
    }

    // Brothers and sisters on the same guardian telephone number.
    const familyPhone = normalisePhone(pupil.guardianPhone);
    const family = state.students.filter(
      (entry) => normalisePhone(entry.guardianPhone) === familyPhone
    );
    const studentIds = (family.length > 0 ? family : [pupil]).map((entry) => entry.id);

    appendAuditLog(state, {
      actorName: pupil.guardianName || 'Parent',
      actorRole: 'teacher',
      action: 'Parent signed in',
      category: 'parents',
      details: `${pupil.guardianName || 'A parent'} signed in for ${pupil.fullName} (${pupil.studentCode}) using ${
        pinAccepted ? 'an access PIN' : 'the guardian telephone number'
      }.`,
    });
    saveSchoolState(state);

    const response = NextResponse.json({
      ok: true,
      redirect: '/parents',
      children: family.map((entry) => ({
        fullName: entry.fullName,
        studentCode: entry.studentCode,
        className: entry.className,
      })),
    });

    response.cookies.set(
      PARENT_SESSION_COOKIE,
      createParentSessionToken({
        fullName: pupil.guardianName || 'Parent',
        studentIds,
        guardianPhone: familyPhone,
      }),
      parentCookieOptions()
    );
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sign-in could not be completed." },
      { status: 500 }
    );
  }
}
