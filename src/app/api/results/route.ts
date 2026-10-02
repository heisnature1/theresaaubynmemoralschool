import { NextRequest, NextResponse } from 'next/server';
import { calculateGrade } from '@/lib/grading';
import { appendAuditLog, getSchoolState, saveSchoolState } from '@/lib/store';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { SubjectResult, UserRole } from '@/types/school';

export const dynamic = 'force-dynamic';

// POST /api/results -> Enter or update a student's academic subject score (Class Score 30% + Exam Score 70%)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      studentId,
      subject,
      classScore,
      examScore,
      semester = '2026/2027 - First Semester',
      enteredBy = 'Mr. Emmanuel Osei-Tutu',
      actorRole = 'teacher',
    } = body;

    if (!studentId || !subject || classScore === undefined || examScore === undefined) {
      return NextResponse.json(
        { error: 'studentId, subject, classScore (0-30), and examScore (0-70) are required.' },
        { status: 400 }
      );
    }

    const numClass = Math.min(30, Math.max(0, Number(classScore)));
    const numExam = Math.min(70, Math.max(0, Number(examScore)));

    const state = getSchoolState();
    const student = state.students.find((s) => s.id === studentId);
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const assessment = calculateGrade(numClass, numExam);

    const existingIdx = state.academicResults.findIndex(
      (r) =>
        r.studentId === student.id &&
        r.subject.toLowerCase() === String(subject).toLowerCase() &&
        r.semester === semester
    );

    const resultRecord: SubjectResult = {
      id:
        existingIdx >= 0
          ? state.academicResults[existingIdx].id
          : `res-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      studentId: student.id,
      studentName: student.fullName,
      className: student.className,
      semester,
      subject: String(subject),
      classScore: numClass,
      examScore: numExam,
      totalScore: assessment.totalScore,
      grade: assessment.grade,
      remark: assessment.remark,
      enteredBy,
      updatedAt: new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      state.academicResults[existingIdx] = resultRecord;
    } else {
      state.academicResults.push(resultRecord);
    }

    const supabase = getSupabaseServerClient();
    if (supabase) {
      await supabase.from('academic_results').upsert(
        {
          student_id: resultRecord.studentId,
          student_name: resultRecord.studentName,
          class_name: resultRecord.className,
          semester: resultRecord.semester,
          subject: resultRecord.subject,
          class_score: resultRecord.classScore,
          exam_score: resultRecord.examScore,
          grade: resultRecord.grade,
          remark: resultRecord.remark,
          entered_by: resultRecord.enteredBy,
          updated_at: resultRecord.updatedAt,
        },
        { onConflict: 'student_id,semester,subject' }
      );
    }

    appendAuditLog(state, {
      actorName: enteredBy,
      actorRole: actorRole as UserRole,
      action: `Entered ${resultRecord.subject} Result`,
      category: 'results',
      details: `${student.fullName} (${student.className}): Class ${numClass}/30 + Exam ${numExam}/70 = ${assessment.totalScore}/100 (${assessment.grade} - ${assessment.remark}).`,
    });

    saveSchoolState(state);
    return NextResponse.json({ ok: true, result: resultRecord, state });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save student result' },
      { status: 500 }
    );
  }
}

// PATCH /api/results -> Update student's End-of-Semester Report metadata (Teacher Remark, Headmaster Remark, Attendance, Endorsement)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      studentId,
      teacherRemark,
      headmasterRemark,
      attendancePresent,
      attendanceTotal,
      conduct,
      interestTalent,
      reportEndorsed,
      actorName = 'Rev. Fr. Bernard Kweku Arthur, M.Ed.',
      actorRole = 'headmaster',
    } = body;

    if (!studentId) {
      return NextResponse.json({ error: 'studentId is required' }, { status: 400 });
    }

    const state = getSchoolState();
    const student = state.students.find((s) => s.id === studentId);
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    if (teacherRemark !== undefined) student.teacherRemark = String(teacherRemark);
    if (headmasterRemark !== undefined) student.headmasterRemark = String(headmasterRemark);
    if (attendancePresent !== undefined)
      student.attendancePresent = Math.max(0, Number(attendancePresent));
    if (attendanceTotal !== undefined)
      student.attendanceTotal = Math.max(1, Number(attendanceTotal));
    if (conduct !== undefined) student.conduct = String(conduct);
    if (interestTalent !== undefined) student.interestTalent = String(interestTalent);
    if (reportEndorsed !== undefined) student.reportEndorsed = Boolean(reportEndorsed);

    appendAuditLog(state, {
      actorName,
      actorRole: actorRole as UserRole,
      action: 'Updated End-of-Semester Report Remarks',
      category: 'reports',
      details: `Updated terminal report evaluation & remarks for ${student.fullName} (${student.className}).`,
    });

    saveSchoolState(state);
    return NextResponse.json({ ok: true, student, state });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update report metadata' },
      { status: 500 }
    );
  }
}
