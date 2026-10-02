import { NextRequest, NextResponse } from 'next/server';
import { appendAuditLog, getSchoolState, saveSchoolState, toClientState } from '@/lib/store';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth';
import { DailyFeedingLog, FeedingStatus, UserRole } from '@/types/school';

export const dynamic = 'force-dynamic';

// POST /api/feeding -> Log daily feeding fee collection by student name and date (single or batch)
export async function POST(req: NextRequest) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: 'Teacher sign-in required.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      mode = 'single',
      studentId,
      studentName,
      className,
      collectionDate,
      amount,
      status = 'paid',
      paymentMethod = 'Cash',
      notes = '',
    } = body;

    const loggedByTeacher = session.fullName;
    const actorRole = session.role;

    const state = getSchoolState();
    const dateStr = collectionDate || new Date().toISOString().split('T')[0];

    // Mode: Batch mark an entire class for a given date
    if (mode === 'batch_class' && className) {
      const classStudents = state.students.filter((s) => s.className === className);
      const classFee = state.classFeeStructures.find((c) => c.className === className);
      const dailyRate = classFee ? classFee.dailyMealFee : 20;

      let countLogged = 0;
      for (const stu of classStudents) {
        const existingIdx = state.dailyFeedingLogs.findIndex(
          (l) => l.studentId === stu.id && l.collectionDate === dateStr
        );

        const entry: DailyFeedingLog = {
          id: existingIdx >= 0 ? state.dailyFeedingLogs[existingIdx].id : `feed-${Date.now()}-${stu.id}`,
          studentId: stu.id,
          studentName: stu.fullName,
          className: stu.className,
          collectionDate: dateStr,
          amount: dailyRate,
          status: 'paid',
          paymentMethod: 'Cash',
          loggedByTeacher,
          notes: notes || 'Batch class daily feeding roll-call',
          createdAt: new Date().toISOString(),
        };

        if (existingIdx >= 0) {
          state.dailyFeedingLogs[existingIdx] = entry;
        } else {
          state.dailyFeedingLogs.unshift(entry);
        }
        countLogged++;
      }

      appendAuditLog(state, {
        actorName: loggedByTeacher,
        actorRole: actorRole as UserRole,
        action: `Batch Logged Daily Feeding (${className})`,
        category: 'feeding',
        details: `Marked ${countLogged} students in ${className} as Paid (GH₵ ${dailyRate}/pupil) for date ${dateStr}.`,
      });

      saveSchoolState(state);
      return NextResponse.json({ ok: true, countLogged, state: toClientState(state) });
    }

    // Mode: Single student entry by Student ID or Student Name + Date
    let targetStudent = state.students.find((s) => s.id === studentId);
    if (!targetStudent && studentName) {
      targetStudent = state.students.find(
        (s) => s.fullName.toLowerCase() === String(studentName).trim().toLowerCase()
      );
    }

    const resolvedName = targetStudent ? targetStudent.fullName : String(studentName || '').trim();
    const resolvedClass = targetStudent ? targetStudent.className : String(className || 'JHS 3');
    const resolvedStudentId = targetStudent ? targetStudent.id : `stu-custom-${Date.now()}`;

    if (!resolvedName || !dateStr) {
      return NextResponse.json(
        { error: 'Student name and collection date are required.' },
        { status: 400 }
      );
    }

    const classFee = state.classFeeStructures.find((c) => c.className === resolvedClass);
    const defaultRate = classFee ? classFee.dailyMealFee : 20;
    const validStatus = (status as FeedingStatus) || 'paid';
    const numericAmount =
      validStatus === 'paid'
        ? amount !== undefined
          ? Math.max(0, Number(amount))
          : defaultRate
        : 0;

    // Upsert by studentId + collectionDate (or studentName + collectionDate)
    const existingIndex = state.dailyFeedingLogs.findIndex(
      (l) =>
        (l.studentId === resolvedStudentId ||
          l.studentName.toLowerCase() === resolvedName.toLowerCase()) &&
        l.collectionDate === dateStr
    );

    const logEntry: DailyFeedingLog = {
      id:
        existingIndex >= 0
          ? state.dailyFeedingLogs[existingIndex].id
          : `feed-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      studentId: resolvedStudentId,
      studentName: resolvedName,
      className: resolvedClass,
      collectionDate: dateStr,
      amount: numericAmount,
      status: validStatus,
      paymentMethod,
      loggedByTeacher,
      notes: notes || (validStatus === 'paid' ? 'Daily feeding fee collected' : 'Marked in daily register'),
      createdAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      state.dailyFeedingLogs[existingIndex] = logEntry;
    } else {
      state.dailyFeedingLogs.unshift(logEntry);
    }

    const supabase = getSupabaseServerClient();
    if (supabase && targetStudent) {
      await supabase.from('daily_feeding_logs').upsert(
        {
          student_id: logEntry.studentId,
          student_name: logEntry.studentName,
          class_name: logEntry.className,
          collection_date: logEntry.collectionDate,
          amount: logEntry.amount,
          status: logEntry.status,
          payment_method: logEntry.paymentMethod,
          logged_by_teacher: logEntry.loggedByTeacher,
          notes: logEntry.notes,
        },
        { onConflict: 'student_id,collection_date' }
      );
    }

    appendAuditLog(state, {
      actorName: loggedByTeacher,
      actorRole: actorRole as UserRole,
      action: 'Logged Daily Feeding Fee',
      category: 'feeding',
      details: `${logEntry.studentName} (${logEntry.className}) — Date: ${logEntry.collectionDate} — Status: ${logEntry.status.toUpperCase()} (GH₵ ${logEntry.amount.toFixed(2)} via ${logEntry.paymentMethod}).`,
    });

    saveSchoolState(state);
    return NextResponse.json({ ok: true, feedingLog: logEntry, state: toClientState(state) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to log daily feeding fee' },
      { status: 500 }
    );
  }
}
