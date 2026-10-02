import { NextRequest, NextResponse } from 'next/server';
import { appendAuditLog, getSchoolState, saveSchoolState, toClientState } from '@/lib/store';
import { getSession, hashPassword } from '@/lib/auth';
import { StudentRecord } from '@/types/school';

export const dynamic = 'force-dynamic';

/** Only small inline images are accepted as a pupil's passport photograph. */
function readPhoto(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const photo = value.trim();
  if (!photo.startsWith('data:image/')) return undefined;
  if (photo.length > 900_000) return undefined;
  return photo;
}

// GET /api/school -> current school records (staff only)
export async function GET() {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: 'Sign-in required.' }, { status: 401 });
  }
  return NextResponse.json(toClientState(getSchoolState()));
}

// POST /api/school -> register a new pupil (Super Admin & Administrator)
export async function POST(req: NextRequest) {
  const session = getSession();
  if (!session || !['super_admin', 'headmaster'].includes(session.role)) {
    return NextResponse.json({ error: 'Sign-in required.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'add_student') {
      const state = getSchoolState();
      const {
        fullName,
        gender,
        dateOfBirth,
        className,
        guardianName,
        guardianPhone,
        guardianEmail,
        photo,
      } = body;

      if (!fullName || !className || !guardianName) {
        return NextResponse.json(
          { error: 'Full name, class, and guardian name are required.' },
          { status: 400 }
        );
      }

      const nextNum = state.students.length + 101;
      const year = new Date().getFullYear();
      const newStudent: StudentRecord = {
        id: `stu-${Date.now()}`,
        studentCode: `STA/${year}/${String(nextNum).padStart(3, '0')}`,
        fullName: String(fullName).trim(),
        gender: gender === 'Female' ? 'Female' : 'Male',
        dateOfBirth: dateOfBirth || '2015-05-15',
        className,
        guardianName: String(guardianName).trim(),
        guardianPhone: String(guardianPhone || '+233 24 000 0000').trim(),
        guardianEmail: guardianEmail ? String(guardianEmail).trim() : undefined,
        photo: readPhoto(photo),
        tuitionPaid: 0,
        extraClassesPaid: 0,
        mealFeePaid: 0,
        attendancePresent: 60,
        attendanceTotal: 65,
        conduct: 'Respectful & Diligent',
        interestTalent: 'Reading & Athletics',
        teacherRemark: 'Newly enrolled pupil settling in well.',
        headmasterRemark: 'Welcome to St Theresa Aubyn Memorial School; strive for excellence.',
        reportEndorsed: false,
      };

      state.students.unshift(newStudent);
      appendAuditLog(state, {
        actorName: session.fullName,
        actorRole: session.role,
        action: 'Enrolled New Pupil',
        category: 'system',
        details: `Enrolled ${newStudent.fullName} (${newStudent.studentCode}) into ${newStudent.className}${
          newStudent.photo ? ' with a passport photograph' : ''
        }.`,
      });
      saveSchoolState(state);

      return NextResponse.json({ ok: true, student: newStudent, state: toClientState(state) });
    }

    /*
     * Issue (or replace) a parent access PIN for a pupil. The PIN is shown to
     * the office once, to be handed to the family; only its hash is kept.
     */
    if (action === 'issue_parent_pin') {
      const state = getSchoolState();
      const { studentId } = body;
      const pupil = state.students.find(
        (entry) => entry.id === studentId || entry.studentCode === studentId
      );

      if (!pupil) {
        return NextResponse.json({ error: 'Pupil not found.' }, { status: 404 });
      }

      const pin = String(Math.floor(100000 + Math.random() * 900000));
      pupil.accessPinHash = hashPassword(pin);
      pupil.accessPinIssuedAt = new Date().toISOString();

      appendAuditLog(state, {
        actorName: session.fullName,
        actorRole: session.role,
        action: 'Issued a parent access PIN',
        category: 'parents',
        details: `Issued a parent access PIN for ${pupil.fullName} (${pupil.studentCode}, ${pupil.className}).`,
      });
      saveSchoolState(state);

      return NextResponse.json({
        ok: true,
        studentId: pupil.id,
        studentName: pupil.fullName,
        studentCode: pupil.studentCode,
        pin,
        issuedAt: pupil.accessPinIssuedAt,
        state: toClientState(state),
      });
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Request failed' },
      { status: 500 }
    );
  }
}
