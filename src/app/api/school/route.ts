import { NextRequest, NextResponse } from 'next/server';
import {
  appendAuditLog,
  getSchoolState,
  resetSchoolState,
  saveSchoolState,
} from '@/lib/store';
import { StudentRecord, UserRole } from '@/types/school';

export const dynamic = 'force-dynamic';

export async function GET() {
  const state = getSchoolState();
  return NextResponse.json(state);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'reset') {
      const fresh = resetSchoolState();
      return NextResponse.json({
        ok: true,
        message: 'School portal state reset to initial seed data.',
        state: fresh,
      });
    }

    if (action === 'add_student') {
      const state = getSchoolState();
      const {
        fullName,
        gender,
        dateOfBirth,
        className,
        guardianName,
        guardianPhone,
        actorName = 'Super Admin',
        actorRole = 'super_admin',
      } = body;

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
        teacherRemark: 'Newly enrolled student showing positive adaptation and enthusiasm.',
        headmasterRemark: 'Welcome to St. Teresa Aubyn Memorial School; strive for excellence.',
        reportEndorsed: true,
      };

      state.students.unshift(newStudent);
      appendAuditLog(state, {
        actorName,
        actorRole: actorRole as UserRole,
        action: 'Enrolled New Student',
        category: 'system',
        details: `Enrolled ${newStudent.fullName} (${newStudent.studentCode}) into ${newStudent.className}.`,
      });
      saveSchoolState(state);

      return NextResponse.json({ ok: true, student: newStudent, state });
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Request failed' },
      { status: 500 }
    );
  }
}
