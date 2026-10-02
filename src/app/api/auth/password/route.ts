import { NextRequest, NextResponse } from 'next/server';
import { getSession, hashPassword, passwordProblem, verifyPassword } from '@/lib/auth';
import { appendAuditLog, getSchoolState, saveSchoolState } from '@/lib/store';

export const dynamic = 'force-dynamic';

// PATCH /api/auth/password -> a signed-in member of staff changes their own password
export async function PATCH(req: NextRequest) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: 'Sign-in required.' }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword } = await req.json();

    const state = getSchoolState();
    const staff = state.staff.find(
      (member) => member.email.toLowerCase() === session.email.toLowerCase()
    );

    if (!staff) {
      return NextResponse.json({ error: 'Staff record not found.' }, { status: 404 });
    }

    if (!verifyPassword(String(currentPassword || ''), staff.passwordHash)) {
      return NextResponse.json({ error: 'Your current password is not correct.' }, { status: 401 });
    }

    const problem = passwordProblem(String(newPassword || ''));
    if (problem) {
      return NextResponse.json({ error: problem }, { status: 400 });
    }

    if (verifyPassword(String(newPassword), staff.passwordHash)) {
      return NextResponse.json(
        { error: 'Please choose a password you have not used before.' },
        { status: 400 }
      );
    }

    staff.passwordHash = hashPassword(String(newPassword));
    appendAuditLog(state, {
      actorName: staff.fullName,
      actorRole: staff.role,
      action: 'Changed portal password',
      category: 'system',
      details: `${staff.fullName} updated their staff portal password.`,
    });
    saveSchoolState(state);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Could not update password.' },
      { status: 500 }
    );
  }
}
