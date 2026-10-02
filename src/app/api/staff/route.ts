import { NextRequest, NextResponse } from 'next/server';
import { getSession, hashPassword, passwordProblem } from '@/lib/auth';
import { appendAuditLog, getSchoolState, saveSchoolState, toClientState } from '@/lib/store';
import {
  createSupabaseStaffUser,
  setSupabaseStaffPassword,
  updateSupabaseStaffUser,
  upsertStaffProfile,
} from '@/lib/supabase/auth';
import { StaffProfile, UserRole } from '@/types/school';

export const dynamic = 'force-dynamic';

/** A temporary password for the office to hand to the member of staff. */
function issuePassword(): string {
  const letters = Math.random().toString(36).slice(2, 7).toUpperCase();
  const digits = Math.floor(100 + Math.random() * 900);
  return `Theresa-${letters}${digits}`;
}

function normaliseSubjects(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry).trim()).filter(Boolean);
  }
  return String(value || '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function findMember(state: ReturnType<typeof getSchoolState>, id: string) {
  return state.staff.find((entry) => entry.id === id || entry.staffId === id);
}

/** Never lets a password hash or a Supabase user id reach the browser. */
function publicStaff(member: StaffProfile) {
  const { passwordHash: _omit, authUserId: _auth, ...safe } = member;
  return safe;
}

// GET /api/staff?q=... -> the staff roll, searchable (Super Admin & Administrator)
export async function GET(req: NextRequest) {
  const session = getSession();
  if (!session || !['super_admin', 'headmaster'].includes(session.role)) {
    return NextResponse.json({ error: 'Administrator sign-in required.' }, { status: 401 });
  }

  const query = (req.nextUrl.searchParams.get('q') || '').trim().toLowerCase();
  const state = getSchoolState();

  const staff = state.staff
    .filter((member) => {
      if (!query) return true;
      return [
        member.fullName,
        member.email,
        member.staffId,
        member.assignedClass || '',
        member.qualification || '',
        ...member.subjects,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query);
    })
    .map((member) => {
      const { passwordHash: _omit, ...safe } = member;
      return { ...safe, authLinked: Boolean(member.authUserId) };
    });

  return NextResponse.json({ ok: true, staff, total: state.staff.length, query });
}

/**
 * POST /api/staff -> staff account management. The Super Administrator may
 * create an account, correct its details, reset its password or take it out of
 * service. When a Supabase project is connected the account is created in
 * Supabase Auth at the same time; otherwise the portal keeps its own password.
 */
export async function POST(req: NextRequest) {
  const session = getSession();
  if (!session || session.role !== 'super_admin') {
    return NextResponse.json(
      { error: 'Only the Super Administrator manages staff accounts.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const action = String(body.action || '').trim();
    const state = getSchoolState();

    /* ------------------------------------------------------------------ */
    /*  Create an account                                                  */
    /* ------------------------------------------------------------------ */
    if (action === 'create') {
      const fullName = String(body.fullName || '').trim();
      const email = String(body.email || '').trim().toLowerCase();
      const role = (['super_admin', 'headmaster', 'teacher'].includes(String(body.role))
        ? String(body.role)
        : 'teacher') as UserRole;

      if (!fullName || !email) {
        return NextResponse.json(
          { error: 'A full name and an email address are required.' },
          { status: 400 }
        );
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ error: 'That email address looks incomplete.' }, { status: 400 });
      }
      if (state.staff.some((member) => member.email.toLowerCase() === email)) {
        return NextResponse.json(
          { error: 'A staff account already uses this email address.' },
          { status: 409 }
        );
      }

      const temporaryPassword = issuePassword();
      const numbers = state.staff
        .map((member) => parseInt(member.staffId.replace(/\D/g, ''), 10))
        .filter((value) => !Number.isNaN(value));
      const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 101;
      const prefix = role === 'teacher' ? 'STA-TCH' : role === 'headmaster' ? 'STA-HM' : 'STA-OWN';
      const staffId = `${prefix}-${nextNumber}`;

      const member: StaffProfile = {
        id: `stf-${Date.now()}`,
        staffId,
        fullName,
        email,
        phone: String(body.phone || '').trim(),
        role,
        assignedClass: String(body.assignedClass || '').trim() || undefined,
        subjects: normaliseSubjects(body.subjects),
        qualification: String(body.qualification || '').trim(),
        isActive: true,
        joinedDate: new Date().toISOString().split('T')[0],
        passwordHash: hashPassword(temporaryPassword),
      };

      // Supabase Auth first, when the school has connected a project.
      const supabaseResult = await createSupabaseStaffUser({
        email,
        password: temporaryPassword,
        fullName,
        role,
        staffId,
      });
      if (supabaseResult.ok && supabaseResult.userId) {
        member.authUserId = supabaseResult.userId;
      }

      state.staff.push(member);
      appendAuditLog(state, {
        actorName: session.fullName,
        actorRole: 'super_admin',
        action: 'Created a staff account',
        category: 'teachers',
        details: `Created ${member.role} account for ${member.fullName} (${member.staffId}, ${member.email})${
          supabaseResult.ok ? ' in Supabase Auth' : ''
        }.`,
      });
      saveSchoolState(state);
      await upsertStaffProfile({
        staffId: member.staffId,
        fullName: member.fullName,
        email: member.email,
        phone: member.phone,
        role: member.role,
        assignedClass: member.assignedClass,
        subjects: member.subjects,
        qualification: member.qualification,
        isActive: member.isActive,
        authUserId: member.authUserId,
      });

      return NextResponse.json({
        ok: true,
        staff: publicStaff(member),
        temporaryPassword,
        supabaseAuth: supabaseResult.ok
          ? 'The account was created in Supabase Auth.'
          : supabaseResult.notConfigured
          ? 'Supabase Auth is not configured; the portal password is the account password.'
          : `Supabase Auth was not updated (${supabaseResult.error}). The portal password still works.`,
        state: toClientState(state),
      });
    }

    /* ------------------------------------------------------------------ */
    /*  Update details, reset a password, or set the account active        */
    /* ------------------------------------------------------------------ */
    const staffId = String(body.staffId || body.id || '').trim();
    const member = staffId ? findMember(state, staffId) : undefined;
    if (!member) {
      return NextResponse.json({ error: 'Staff record not found.' }, { status: 404 });
    }

    if (action === 'update') {
      const nextEmail = body.email ? String(body.email).trim().toLowerCase() : member.email;
      if (
        nextEmail !== member.email &&
        state.staff.some(
          (entry) => entry.id !== member.id && entry.email.toLowerCase() === nextEmail
        )
      ) {
        return NextResponse.json(
          { error: 'Another staff account already uses that email address.' },
          { status: 409 }
        );
      }

      member.fullName = body.fullName ? String(body.fullName).trim() : member.fullName;
      member.email = nextEmail;
      member.phone = body.phone !== undefined ? String(body.phone).trim() : member.phone;
      member.role = ['super_admin', 'headmaster', 'teacher'].includes(String(body.role))
        ? (String(body.role) as UserRole)
        : member.role;
      member.assignedClass =
        body.assignedClass !== undefined
          ? String(body.assignedClass).trim() || undefined
          : member.assignedClass;
      member.subjects =
        body.subjects !== undefined ? normaliseSubjects(body.subjects) : member.subjects;
      member.qualification =
        body.qualification !== undefined
          ? String(body.qualification).trim()
          : member.qualification;

      appendAuditLog(state, {
        actorName: session.fullName,
        actorRole: 'super_admin',
        action: 'Updated a staff account',
        category: 'teachers',
        details: `Updated ${member.fullName} (${member.staffId}): ${member.role}${
          member.assignedClass ? `, ${member.assignedClass}` : ''
        }.`,
      });
      saveSchoolState(state);

      const supabaseResult = await updateSupabaseStaffUser(member.authUserId || '', {
        email: member.email,
        fullName: member.fullName,
        role: member.role,
        staffId: member.staffId,
      });
      await upsertStaffProfile({
        staffId: member.staffId,
        fullName: member.fullName,
        email: member.email,
        phone: member.phone,
        role: member.role,
        assignedClass: member.assignedClass,
        subjects: member.subjects,
        qualification: member.qualification,
        isActive: member.isActive,
        authUserId: member.authUserId,
      });

      return NextResponse.json({
        ok: true,
        staff: publicStaff(member),
        supabaseAuth: supabaseResult.ok
          ? 'Supabase Auth was updated.'
          : supabaseResult.notConfigured
          ? 'Supabase Auth is not configured; the portal record was updated.'
          : `Supabase Auth was not updated (${supabaseResult.error}).`,
        state: toClientState(state),
      });
    }

    if (action === 'reset_password') {
      const requested = body.password ? String(body.password) : '';
      if (requested) {
        const problem = passwordProblem(requested);
        if (problem) return NextResponse.json({ error: problem }, { status: 400 });
      }
      const temporaryPassword = requested || issuePassword();
      member.passwordHash = hashPassword(temporaryPassword);

      // Keep a pending application in step with the new password.
      const registration = state.teacherRegistrations.find(
        (entry) => entry.email.toLowerCase() === member.email.toLowerCase()
      );
      if (registration) {
        registration.passwordHash = member.passwordHash;
      }

      const supabaseResult = await setSupabaseStaffPassword(
        member.authUserId || '',
        temporaryPassword
      );

      appendAuditLog(state, {
        actorName: session.fullName,
        actorRole: 'super_admin',
        action: 'Reset a staff password',
        category: 'system',
        details: `Issued a new password for ${member.fullName} (${member.staffId}, ${member.email})${
          supabaseResult.ok ? ' and in Supabase Auth' : ''
        }.`,
      });
      saveSchoolState(state);

      return NextResponse.json({
        ok: true,
        staffName: member.fullName,
        password: temporaryPassword,
        supabaseAuth: supabaseResult.ok
          ? 'The Supabase Auth password was changed too.'
          : supabaseResult.notConfigured
          ? 'Supabase Auth is not configured; the portal password was changed.'
          : `Supabase Auth was not changed (${supabaseResult.error}); the portal password was.`,
        state: toClientState(state),
      });
    }

    if (action === 'set_active') {
      const isActive = body.isActive !== false;
      member.isActive = isActive;

      const supabaseResult = await updateSupabaseStaffUser(member.authUserId || '', {
        disabled: !isActive,
      });

      appendAuditLog(state, {
        actorName: session.fullName,
        actorRole: 'super_admin',
        action: isActive ? 'Reinstated a staff account' : 'Suspended a staff account',
        category: 'teachers',
        details: `${isActive ? 'Reinstated' : 'Suspended'} ${member.fullName} (${
          member.staffId
        }, ${member.email}).`,
      });
      saveSchoolState(state);
      await upsertStaffProfile({
        staffId: member.staffId,
        fullName: member.fullName,
        email: member.email,
        phone: member.phone,
        role: member.role,
        assignedClass: member.assignedClass,
        subjects: member.subjects,
        qualification: member.qualification,
        isActive: member.isActive,
        authUserId: member.authUserId,
      });

      return NextResponse.json({
        ok: true,
        staff: publicStaff(member),
        supabaseAuth: supabaseResult.ok
          ? 'Supabase Auth was updated.'
          : supabaseResult.notConfigured
          ? 'Supabase Auth is not configured.'
          : `Supabase Auth was not updated (${supabaseResult.error}).`,
        state: toClientState(state),
      });
    }

    return NextResponse.json({ error: 'Unsupported action.' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'The request could not be completed.' },
      { status: 500 }
    );
  }
}

// PATCH is kept as an alias of the password reset action for older clients.
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
    const member = findMember(state, String(staffId || ''));
    if (!member) {
      return NextResponse.json({ error: 'Staff record not found.' }, { status: 404 });
    }

    const temporaryPassword = issuePassword();
    member.passwordHash = hashPassword(temporaryPassword);

    const registration = state.teacherRegistrations.find(
      (entry) => entry.email.toLowerCase() === member.email.toLowerCase()
    );
    if (registration) {
      registration.passwordHash = member.passwordHash;
    }

    const supabaseResult = await setSupabaseStaffPassword(
      member.authUserId || '',
      temporaryPassword
    );

    appendAuditLog(state, {
      actorName: session.fullName,
      actorRole: 'super_admin',
      action: 'Reset a staff password',
      category: 'system',
      details: `Issued a temporary password for ${member.fullName} (${member.staffId}, ${member.email}).`,
    });
    saveSchoolState(state);

    return NextResponse.json({
      ok: true,
      staffName: member.fullName,
      password: temporaryPassword,
      supabaseAuth: supabaseResult.ok
        ? 'The Supabase Auth password was changed too.'
        : supabaseResult.notConfigured
        ? 'Supabase Auth is not configured; the portal password was changed.'
        : `Supabase Auth was not changed (${supabaseResult.error}); the portal password was.`,
      state: toClientState(state),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'The password could not be reset.' },
      { status: 500 }
    );
  }
}
