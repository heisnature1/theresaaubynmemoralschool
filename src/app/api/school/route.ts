import { NextRequest, NextResponse } from 'next/server';
import { appendAuditLog, getSchoolState, saveSchoolState, toClientState } from '@/lib/store';
import { getSession } from '@/lib/auth';
import { StudentRecord } from '@/types/school';

export const dynamic = 'force-dynamic';

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
      const { fullName, gender, dateOfBirth, className, guardianName, guardianPhone } = body;

      if (!fullName || !className || !guardianName) {
        return NextResponse.json(
          { error: 'Full name, class, and guardian name are required.' },
          { status: 400 }
        );
      }

      const nextNum = state.students.length + 101;
      const newStudent: StudentRecord = {
        id: `stu-${Date.now()}`,
        studentCode: `STA/2026/${nextNum}`,
        fullName: String(fullName).trim(),
        gender: gender === 'Female' ? 'Female' : 'Male',
        dateOfBirth: dateOfBirth || '2015-05-15',
        className,
        guardianName: String(guardianName).trim(),
        guardianPhone: String(guardianPhone || '+233 24 000 0000').trim(),
        tuitionPaid: 0,
        extraClassesPaid: 0,
        mealFeePaid: 0,
        attendancePresent: 60,
        attendanceTotal: 65,
        conduct: 'Respectful & Diligent',
        interestTalent: 'Reading & Athletics',
        teacherRemark: 'Newly enrolled pupil settling in well.',
        headmasterRemark: 'Welcome to St. Teresa Aubyn Memorial School; strive for excellence.',
        reportEndorsed: false,
      };

      state.students.unshift(newStudent);
      appendAuditLog(state, {
        actorName: session.fullName,
        actorRole: session.role,
        action: 'Enrolled New Pupil',
        category: 'system',
        details: `Enrolled ${newStudent.fullName} (${newStudent.studentCode}) into ${newStudent.className}.`,
      });
      saveSchoolState(state);

      return NextResponse.json({ ok: true, student: newStudent, state: toClientState(state) });
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Request failed' },
      { status: 500 }
    );
  }
}
