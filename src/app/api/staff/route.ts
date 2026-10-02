import { NextRequest, NextResponse } from 'next/server';
import { getSession, hashPassword } from '@/lib/auth';
import { appendAuditLog, getSchoolState, saveSchoolState } from '@/lib/store';

export const dynamic = 'force-dynamic';

/** A temporary password for the office to hand to the member of staff. */
function issuePassword(): string {
  const letters = Math.random().toString(36).slice(2, 7).toUpperCase();
  const digits = Math.floor(100 + Math.random() * 900);
  return `Theresa-${letters}${digits}`;
}

/**
 * PATCH /api/staff -> the Super Administrator resets a member of staff's
 * password. The new password is shown once, to be handed over in person.
 */
export async function PATCH(req: NextRequest) {
  const session = getSession();
  if (!session || session.role !== 'super_admin') {
    return NextResponse.json(
      { error: 'Only the Super Administrator may reset staff passwords.' },
      { status: 403 }
    );
  }

  try {
    const { staffId } = await req.json();
    const state = getSchoolState();
    const member = state.staff.find((entry) => entry.id === staffId || entry.staffId === staffId);

    if (!member) {
      return NextResponse.json({ error: 'Staff record not found.' }, { status: 404 });
    }

    const temporaryPassword = issuePassword();
    member.passwordHash = hashPassword(temporaryPassword);

    // Keep a pending application in step with the new password.
    const registration = state.teacherRegistrations.find(
      (entry) => entry.email.toLowerCase() === member.email.toLowerCase()
    );
    if (registration) {
      registration.passwordHash = member.passwordHash;
    }

    appendAuditLog(state, {
      actorName: session.fullName,
      actorRole: 'super_admin',
      action: 'Reset a staff password',
      category: 'system',
      details: `Issued a temporary password for ${member.fullName} (${member.staffId}, ${member.email}).`,
    });
    saveSchoolState(state);

    return NextResponse.json({ ok: true, staffName: member.fullName, password: temporaryPassword });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'The password could not be reset.' },
      { status: 500 }
    );
  }
}
