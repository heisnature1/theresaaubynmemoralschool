import { NextRequest, NextResponse } from 'next/server';
import { appendAuditLog, getSchoolState, saveSchoolState, toClientState } from '@/lib/store';
import { getSession, hashPassword, passwordProblem } from '@/lib/auth';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import {
  RegistrationStatus,
  StaffProfile,
  TeacherRegistrationRequest,
  UserRole,
} from '@/types/school';

export const dynamic = 'force-dynamic';

/**
 * Accepts a passport photograph sent as a data URL and rejects anything that
 * is not a small inline image, so the store can never be filled with junk.
 */
function readPhoto(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const photo = value.trim();
  if (!photo.startsWith('data:image/')) return undefined;
  if (photo.length > 900_000) return undefined; // ~675 KB of image data
  return photo;
}

/** Temporary password handed to a teacher when their application is approved. */
function issuePassword(): string {
  return `Theresa-${Math.random().toString(36).slice(2, 7).toUpperCase()}${Math.floor(10 + Math.random() * 89)}`;
}

// POST /api/teachers -> new teacher application (open to the public)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      fullName,
      email,
      phone,
      qualification,
      requestedClass,
      subjects = [],
      experienceYears = 2,
      statement = '',
      password,
      passportPhoto,
    } = body;

    if (!fullName || !email || !phone || !qualification || !requestedClass) {
      return NextResponse.json(
        {
          error:
            'Full name, email, phone number, qualification, and preferred class are required.',
        },
        { status: 400 }
      );
    }

    if (!password || passwordProblem(String(password))) {
      return NextResponse.json(
        { error: passwordProblem(String(password || '')) || 'A password is required.' },
        { status: 400 }
      );
    }

    const state = getSchoolState();
    const normalisedEmail = String(email).trim().toLowerCase();

    if (state.staff.some((member) => member.email.toLowerCase() === normalisedEmail)) {
      return NextResponse.json(
        { error: 'A staff account already uses this email address. Please sign in instead.' },
        { status: 409 }
      );
    }

    if (
      state.teacherRegistrations.some(
        (reg) => reg.email.toLowerCase() === normalisedEmail && reg.status === 'pending'
      )
    ) {
      return NextResponse.json(
        { error: 'An application from this email address is already awaiting review.' },
        { status: 409 }
      );
    }

    const parsedSubjects = Array.isArray(subjects)
      ? subjects
      : String(subjects)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

    const newRequest: TeacherRegistrationRequest = {
      id: `reg-${Date.now()}`,
      fullName: String(fullName).trim(),
      email: normalisedEmail,
      phone: String(phone).trim(),
      qualification: String(qualification).trim(),
      requestedClass: String(requestedClass).trim(),
      subjects: parsedSubjects.length > 0 ? parsedSubjects : ['English Language', 'Mathematics'],
      experienceYears: Math.max(0, Number(experienceYears) || 1),
      statement:
        String(statement).trim() ||
        'Committed to upholding the academic and moral standards of St Theresa Aubyn Memorial School.',
      passportPhoto: readPhoto(passportPhoto),
      status: 'pending',
      passwordHash: hashPassword(String(password)),
      createdAt: new Date().toISOString(),
    };

    state.teacherRegistrations.unshift(newRequest);

    const supabase = getSupabaseServerClient();
    if (supabase) {
      await supabase.from('teacher_registrations').insert({
        full_name: newRequest.fullName,
        email: newRequest.email,
        phone: newRequest.phone,
        qualification: newRequest.qualification,
        requested_class: newRequest.requestedClass,
        subjects: newRequest.subjects,
        experience_years: newRequest.experienceYears,
        statement: newRequest.statement,
        passport_photo: newRequest.passportPhoto,
        status: 'pending',
      });
    }

    appendAuditLog(state, {
      actorName: newRequest.fullName,
      actorRole: 'teacher',
      action: 'Submitted Teacher Application',
      category: 'teachers',
      details: `${newRequest.fullName} (${newRequest.qualification}) applied for a ${newRequest.requestedClass} teaching post${
        newRequest.passportPhoto ? ' (passport photograph attached)' : ''
      }. Awaiting review.`,
    });

    saveSchoolState(state);
    return NextResponse.json({
      ok: true,
      registration: {
        id: newRequest.id,
        fullName: newRequest.fullName,
        email: newRequest.email,
        requestedClass: newRequest.requestedClass,
        status: newRequest.status,
      },
      state: toClientState(state),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to submit application' },
      { status: 500 }
    );
  }
}

// PATCH /api/teachers -> approve or decline an application (Administrator / Super Admin)
export async function PATCH(req: NextRequest) {
  const session = getSession();
  if (!session || !['super_admin', 'headmaster'].includes(session.role)) {
    return NextResponse.json({ error: 'Administrator sign-in required.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { registrationId, status, assignedClass } = body;

    if (!registrationId || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'registrationId and a valid status (approved/rejected) are required.' },
        { status: 400 }
      );
    }

    const state = getSchoolState();
    const reg = state.teacherRegistrations.find((r) => r.id === registrationId);
    if (!reg) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    reg.status = status as RegistrationStatus;
    reg.reviewedBy = session.fullName;
    reg.reviewedAt = new Date().toISOString();

    if (assignedClass) {
      reg.requestedClass = assignedClass;
    }

    let issuedPassword: string | null = null;

    if (status === 'approved') {
      const usedNumbers = state.staff
        .map((member) => parseInt(member.staffId.replace(/\D/g, ''), 10))
        .filter((value) => !Number.isNaN(value));
      const nextNumber = usedNumbers.length > 0 ? Math.max(...usedNumbers) + 1 : 105;
      const assignedStaffId = reg.assignedStaffId || `STA-TCH-${nextNumber}`;
      reg.assignedStaffId = assignedStaffId;

      if (!reg.passwordHash) {
        // Application arrived without a password: issue one for the office to hand over.
        issuedPassword = issuePassword();
        reg.passwordHash = hashPassword(issuedPassword);
      }

      const existingStaff = state.staff.find(
        (s) => s.email.toLowerCase() === reg.email.toLowerCase()
      );

      if (existingStaff) {
        existingStaff.isActive = true;
        existingStaff.assignedClass = reg.requestedClass;
        existingStaff.passwordHash = reg.passwordHash;
        if (reg.passportPhoto) existingStaff.photo = reg.passportPhoto;
      } else {
        const newStaff: StaffProfile = {
          id: `stf-${Date.now()}`,
          staffId: assignedStaffId,
          fullName: reg.fullName,
          email: reg.email,
          phone: reg.phone,
          role: 'teacher',
          assignedClass: reg.requestedClass,
          subjects: reg.subjects,
          qualification: reg.qualification,
          isActive: true,
          joinedDate: new Date().toISOString().split('T')[0],
          passwordHash: reg.passwordHash,
          photo: reg.passportPhoto,
        };
        state.staff.push(newStaff);
      }
    }

    const supabase = getSupabaseServerClient();
    if (supabase) {
      await supabase
        .from('teacher_registrations')
        .update({
          status: reg.status,
          reviewed_by: reg.reviewedBy,
          reviewed_at: reg.reviewedAt,
          assigned_staff_id: reg.assignedStaffId,
          requested_class: reg.requestedClass,
        })
        .eq('id', reg.id);
    }

    appendAuditLog(state, {
      actorName: session.fullName,
      actorRole: session.role as UserRole,
      action:
        status === 'approved' ? 'Approved Teacher Application' : 'Declined Teacher Application',
      category: 'teachers',
      details:
        status === 'approved'
          ? `Approved ${reg.fullName} for ${reg.requestedClass} (Staff ID: ${reg.assignedStaffId}).`
          : `Declined the teaching application from ${reg.fullName}.`,
    });

    saveSchoolState(state);
    const { passwordHash: _omit, ...safeRegistration } = reg;

    return NextResponse.json({
      ok: true,
      registration: safeRegistration,
      issuedPassword,
      state: toClientState(state),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update application' },
      { status: 500 }
    );
  }
}
