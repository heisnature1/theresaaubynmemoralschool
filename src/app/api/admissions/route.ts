import { NextRequest, NextResponse } from 'next/server';
import { appendAuditLog, getSchoolState, saveSchoolState, toClientState } from '@/lib/store';
import { getSession } from '@/lib/auth';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import {
  admissionMatches,
  findApplicationForParent,
  isAdmissionStatus,
  nextAdmissionReference,
  normalisePhone,
  summariseAdmissions,
} from '@/lib/admissions';
import { AdmissionApplication, StudentRecord } from '@/types/school';

export const dynamic = 'force-dynamic';

/**
 * A small throttle on the public check: it is one more place a reference or a
 * family's details could be guessed at, so attempts are counted per address.
 */
const checkAttempts = new Map<string, { count: number; first: number }>();
const CHECK_WINDOW_MS = 10 * 60 * 1000;
const CHECK_MAX_ATTEMPTS = 30;

/**
 * Admissions.
 *
 * GET   ?q=&status=&check=1   the register, searched; or a parent's own check
 * POST   a family applies for a place (open to the public)
 * PATCH  the office moves an application on, and enrols the child
 */

/* -------------------------------------------------------------------------- */
/*  GET — the searchable register, and the parents' check                     */
/* -------------------------------------------------------------------------- */

export async function GET(req: NextRequest) {
  const state = getSchoolState();
  const params = req.nextUrl.searchParams;

  // A parent checking on an application (no staff sign-in needed): reference,
  // or the child's name with the guardian's telephone number.
  if (params.get('check') === '1') {
    const forwarded = req.headers.get('x-forwarded-for') || 'local';
    const record = checkAttempts.get(forwarded);
    const now = Date.now();
    if (record && now - record.first <= CHECK_WINDOW_MS && record.count >= CHECK_MAX_ATTEMPTS) {
      return NextResponse.json(
        { error: 'Too many checks from this connection. Please wait ten minutes and try again.' },
        { status: 429 }
      );
    }
    if (!record || now - record.first > CHECK_WINDOW_MS) {
      checkAttempts.set(forwarded, { count: 1, first: now });
    } else {
      record.count += 1;
    }

    const application = findApplicationForParent(state.admissionApplications, {
      reference: params.get('reference') || '',
      childName: params.get('childName') || '',
      guardianPhone: params.get('guardianPhone') || '',
    });

    if (!application) {
      return NextResponse.json(
        { error: 'No application matches those details. Please check and try again.' },
        { status: 404 }
      );
    }

    // Only what a parent needs: never the office's internal notes.
    return NextResponse.json({
      ok: true,
      application: {
        reference: application.reference,
        childFullName: application.childFullName,
        classApplied: application.classApplied,
        guardianName: application.guardianName,
        status: application.status,
        studentCode: application.studentCode || null,
        createdAt: application.createdAt,
        updatedAt: application.updatedAt,
      },
    });
  }

  const session = getSession();
  if (!session || !['super_admin', 'headmaster'].includes(session.role)) {
    return NextResponse.json({ error: 'Administrator sign-in required.' }, { status: 401 });
  }

  const query = (params.get('q') || '').trim();
  const status = params.get('status') || '';

  const matched = state.admissionApplications
    .filter((entry) => (isAdmissionStatus(status) ? entry.status === status : true))
    .filter((entry) => admissionMatches(entry, query));

  return NextResponse.json({
    ok: true,
    applications: matched,
    total: state.admissionApplications.length,
    counts: summariseAdmissions(state.admissionApplications),
    query,
    status,
  });
}

/* -------------------------------------------------------------------------- */
/*  POST — a family applies for a place                                       */
/* -------------------------------------------------------------------------- */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const childFullName = String(body.childFullName || '').trim();
    const classApplied = String(body.classApplied || '').trim();
    const guardianName = String(body.guardianName || '').trim();
    const guardianPhone = String(body.guardianPhone || '').trim();

    if (!childFullName || !classApplied || !guardianName || !guardianPhone) {
      return NextResponse.json(
        {
          error:
            "The child's name, the class applied for, the guardian's name and a telephone number are required.",
        },
        { status: 400 }
      );
    }

    const state = getSchoolState();
    const application: AdmissionApplication = {
      id: `adm-${Date.now()}`,
      reference: nextAdmissionReference(state),
      childFullName,
      childDateOfBirth: body.childDateOfBirth ? String(body.childDateOfBirth) : undefined,
      gender: body.gender === 'Male' || body.gender === 'Female' ? body.gender : undefined,
      classApplied,
      guardianName,
      guardianPhone,
      guardianEmail: body.guardianEmail ? String(body.guardianEmail).trim() : undefined,
      previousSchool: body.previousSchool ? String(body.previousSchool).trim() : undefined,
      notes: body.notes ? String(body.notes).trim() : undefined,
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    state.admissionApplications.unshift(application);

    const supabase = getSupabaseServerClient();
    if (supabase) {
      await supabase.from('admission_applications').insert({
        reference: application.reference,
        child_full_name: application.childFullName,
        child_date_of_birth: application.childDateOfBirth ?? null,
        gender: application.gender ?? null,
        class_applied: application.classApplied,
        guardian_name: application.guardianName,
        guardian_phone: application.guardianPhone,
        guardian_email: application.guardianEmail ?? null,
        previous_school: application.previousSchool ?? null,
        notes: application.notes ?? null,
        status: application.status,
      });
    }

    appendAuditLog(state, {
      actorName: application.guardianName,
      actorRole: 'teacher',
      action: 'Submitted an admission application',
      category: 'admissions',
      details: `${application.reference}: ${application.childFullName} applied for ${application.classApplied} (guardian ${application.guardianName}, ${normalisePhone(
        application.guardianPhone
      )}).`,
    });

    saveSchoolState(state);

    return NextResponse.json({
      ok: true,
      reference: application.reference,
      application: {
        reference: application.reference,
        childFullName: application.childFullName,
        classApplied: application.classApplied,
        status: application.status,
        createdAt: application.createdAt,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'The application could not be sent.' },
      { status: 500 }
    );
  }
}

/* -------------------------------------------------------------------------- */
/*  PATCH — move an application on, or enrol the child                        */
/* -------------------------------------------------------------------------- */

export async function PATCH(req: NextRequest) {
  const session = getSession();
  if (!session || !['super_admin', 'headmaster'].includes(session.role)) {
    return NextResponse.json({ error: 'Administrator sign-in required.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { applicationId, status, notes, reviewNotes } = body;
    const state = getSchoolState();

    const application = state.admissionApplications.find(
      (entry) => entry.id === applicationId || entry.reference === applicationId
    );
    if (!application) {
      return NextResponse.json({ error: 'Application not found.' }, { status: 404 });
    }

    if (!isAdmissionStatus(status)) {
      return NextResponse.json({ error: 'Choose a valid status.' }, { status: 400 });
    }

    const previousStatus = application.status;
    application.status = status;
    application.reviewedBy = session.fullName;
    application.reviewedAt = new Date().toISOString();
    application.updatedAt = application.reviewedAt;
    if (notes !== undefined) application.notes = String(notes);
    if (reviewNotes !== undefined) application.notes = String(reviewNotes);

    let enrolledPupil: StudentRecord | null = null;

    // Enrolling the child adds them to the pupil roll with their own code.
    if (status === 'enrolled' && !application.studentId) {
      const numbers = state.students
        .map((pupil) => Number((pupil.studentCode.split('/').pop() || '').replace(/\D/g, '')))
        .filter((value) => Number.isFinite(value) && value > 0);
      const nextNumber = (numbers.length > 0 ? Math.max(...numbers) : 100) + 1;
      const year = new Date().getFullYear();

      const pupil: StudentRecord = {
        id: `stu-${Date.now()}`,
        studentCode: `STA/${year}/${String(nextNumber).padStart(3, '0')}`,
        fullName: application.childFullName,
        gender: application.gender || 'Female',
        dateOfBirth: application.childDateOfBirth || '',
        className: application.classApplied,
        guardianName: application.guardianName,
        guardianPhone: application.guardianPhone,
        guardianEmail: application.guardianEmail,
        tuitionPaid: 0,
        extraClassesPaid: 0,
        mealFeePaid: 0,
        attendancePresent: 0,
        attendanceTotal: 0,
        conduct: '',
        interestTalent: '',
        teacherRemark: '',
        headmasterRemark: '',
        reportEndorsed: false,
      };

      state.students.unshift(pupil);
      application.studentId = pupil.id;
      application.studentCode = pupil.studentCode;
      enrolledPupil = pupil;
    }

    const supabase = getSupabaseServerClient();
    if (supabase) {
      await supabase
        .from('admission_applications')
        .update({
          status: application.status,
          notes: application.notes ?? null,
          reviewed_by: application.reviewedBy,
          reviewed_at: application.reviewedAt,
          student_code: application.studentCode ?? null,
        })
        .eq('id', application.id);
    }

    appendAuditLog(state, {
      actorName: session.fullName,
      actorRole: session.role === 'headmaster' ? 'headmaster' : 'super_admin',
      action: status === 'enrolled' ? 'Enrolled an applicant' : 'Moved an admission application on',
      category: 'admissions',
      details:
        status === 'enrolled'
          ? `${application.reference}: enrolled ${application.childFullName} into ${application.classApplied}${
              enrolledPupil ? ` as ${enrolledPupil.studentCode}` : ''
            }.`
          : `${application.reference}: ${application.childFullName} moved from ${previousStatus} to ${status}.`,
    });

    saveSchoolState(state);

    return NextResponse.json({
      ok: true,
      application,
      student: enrolledPupil,
      state: toClientState(state),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'The application could not be updated.' },
      { status: 500 }
    );
  }
}
