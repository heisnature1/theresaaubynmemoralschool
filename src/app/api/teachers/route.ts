import { NextRequest, NextResponse } from 'next/server';
import { appendAuditLog, getSchoolState, saveSchoolState } from '@/lib/store';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import {
  RegistrationStatus,
  StaffProfile,
  TeacherRegistrationRequest,
  UserRole,
} from '@/types/school';

export const dynamic = 'force-dynamic';

// POST /api/teachers -> Submit a new Teacher Sign-Up Registration Request
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
    } = body;

    if (!fullName || !email || !phone || !qualification || !requestedClass) {
      return NextResponse.json(
        {
          error:
            'Full name, email, phone, qualification, and requested class are required.',
        },
        { status: 400 }
      );
    }

    const state = getSchoolState();
    const parsedSubjects = Array.isArray(subjects)
      ? subjects
      : String(subjects)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

    const newRequest: TeacherRegistrationRequest = {
      id: `reg-${Date.now()}`,
      fullName: String(fullName).trim(),
      email: String(email).trim().toLowerCase(),
      phone: String(phone).trim(),
      qualification: String(qualification).trim(),
      requestedClass: String(requestedClass).trim(),
      subjects: parsedSubjects.length > 0 ? parsedSubjects : ['English Language', 'Mathematics'],
      experienceYears: Math.max(0, Number(experienceYears) || 1),
      statement:
        String(statement).trim() ||
        'Committed to upholding the academic and moral standards of St. Teresa Aubyn Memorial School.',
      status: 'pending',
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
        status: 'pending',
      });
    }

    appendAuditLog(state, {
      actorName: newRequest.fullName,
      actorRole: 'teacher',
      action: 'Submitted Teacher Sign-Up Request',
      category: 'teachers',
      details: `${newRequest.fullName} (${newRequest.qualification}) applied for ${newRequest.requestedClass} teaching assignment. Pending Headmaster approval.`,
    });

    saveSchoolState(state);
    return NextResponse.json({ ok: true, registration: newRequest, state });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to submit registration' },
      { status: 500 }
    );
  }
}

// PATCH /api/teachers -> Headmaster or Super Admin approves or rejects a Teacher Registration
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      registrationId,
      status,
      assignedClass,
      actorName = 'Rev. Fr. Bernard Kweku Arthur, M.Ed.',
      actorRole = 'headmaster',
    } = body;

    if (!registrationId || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'registrationId and valid status (approved/rejected) are required.' },
        { status: 400 }
      );
    }

    const state = getSchoolState();
    const reg = state.teacherRegistrations.find((r) => r.id === registrationId);
    if (!reg) {
      return NextResponse.json({ error: 'Registration request not found' }, { status: 404 });
    }

    reg.status = status as RegistrationStatus;
    reg.reviewedBy = actorName;
    reg.reviewedAt = new Date().toISOString();

    if (assignedClass) {
      reg.requestedClass = assignedClass;
    }

    if (status === 'approved') {
      const teacherCount = state.staff.filter((s) => s.role === 'teacher').length;
      const assignedStaffId = reg.assignedStaffId || `STA-TCH-${101 + teacherCount + 1}`;
      reg.assignedStaffId = assignedStaffId;

      // Add to active staff directory if not already present
      const existingStaff = state.staff.find(
        (s) => s.email.toLowerCase() === reg.email.toLowerCase()
      );
      if (!existingStaff) {
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
      actorName,
      actorRole: actorRole as UserRole,
      action:
        status === 'approved'
          ? 'Approved Teacher Registration'
          : 'Declined Teacher Registration',
      category: 'teachers',
      details:
        status === 'approved'
          ? `Approved ${reg.fullName} for ${reg.requestedClass} (Staff ID: ${reg.assignedStaffId}).`
          : `Declined teacher registration request from ${reg.fullName}.`,
    });

    saveSchoolState(state);
    return NextResponse.json({ ok: true, registration: reg, state });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update registration' },
      { status: 500 }
    );
  }
}
