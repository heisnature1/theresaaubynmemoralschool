import { NextRequest, NextResponse } from 'next/server';
import { appendAuditLog, getSchoolState, saveSchoolState, toClientState } from '@/lib/store';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth';
import { FeeCategory, FeePaymentRecord, UserRole } from '@/types/school';

export const dynamic = 'force-dynamic';

// PATCH /api/fees -> Update class fee structure (Tuition, Extra Classes, Meal Fees by Class)
export async function PATCH(req: NextRequest) {
  const session = getSession();
  if (!session || !['super_admin', 'headmaster'].includes(session.role)) {
    return NextResponse.json({ error: 'Administrator sign-in required.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      className,
      tuitionFee,
      extraClassesFee,
      dailyMealFee,
      semesterMealFee,
      ictAndBooksFee,
      classTeacher,
      actorName = 'Rev. Fr. Bernard Kweku Arthur, M.Ed.',
      actorRole = 'headmaster',
    } = body;

    if (!className) {
      return NextResponse.json({ error: 'className is required' }, { status: 400 });
    }

    const state = getSchoolState();
    const target = state.classFeeStructures.find((c) => c.className === className);

    if (!target) {
      return NextResponse.json({ error: `Class ${className} not found` }, { status: 404 });
    }

    if (tuitionFee !== undefined) target.tuitionFee = Math.max(0, Number(tuitionFee));
    if (extraClassesFee !== undefined) target.extraClassesFee = Math.max(0, Number(extraClassesFee));
    if (dailyMealFee !== undefined) {
      target.dailyMealFee = Math.max(0, Number(dailyMealFee));
      // If semesterMealFee wasn't explicitly overridden, keep 65-day semester sync or use provided value
      if (semesterMealFee === undefined) {
        target.semesterMealFee = Math.round(target.dailyMealFee * 65);
      }
    }
    if (semesterMealFee !== undefined) target.semesterMealFee = Math.max(0, Number(semesterMealFee));
    if (ictAndBooksFee !== undefined) target.ictAndBooksFee = Math.max(0, Number(ictAndBooksFee));
    if (classTeacher !== undefined) target.classTeacher = String(classTeacher);

    target.updatedBy = actorName;
    target.updatedAt = new Date().toISOString();

    // Sync with Supabase if configured
    const supabase = getSupabaseServerClient();
    if (supabase) {
      await supabase
        .from('class_fee_structures')
        .upsert(
          {
            class_name: target.className,
            department: target.department,
            semester: target.semester,
            tuition_fee: target.tuitionFee,
            extra_classes_fee: target.extraClassesFee,
            daily_meal_fee: target.dailyMealFee,
            semester_meal_fee: target.semesterMealFee,
            ict_and_books_fee: target.ictAndBooksFee,
            class_teacher: target.classTeacher,
            updated_by: target.updatedBy,
            updated_at: target.updatedAt,
          },
          { onConflict: 'class_name' }
        );
    }

    appendAuditLog(state, {
      actorName,
      actorRole: actorRole as UserRole,
      action: `Updated ${className} Fee Structure`,
      category: 'fees',
      details: `Set ${className} Tuition: GH₵ ${target.tuitionFee}, Extra Classes: GH₵ ${target.extraClassesFee}, Daily Meal: GH₵ ${target.dailyMealFee}/day (Semester Meal: GH₵ ${target.semesterMealFee}).`,
    });

    saveSchoolState(state);
    return NextResponse.json({ ok: true, feeStructure: target, state: toClientState(state) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update class fee structure' },
      { status: 500 }
    );
  }
}

// POST /api/fees -> Record a student fee payment (tuition, extra_classes, or meal_fee)
export async function POST(req: NextRequest) {
  const session = getSession();
  if (!session || !['super_admin', 'headmaster'].includes(session.role)) {
    return NextResponse.json({ error: 'Administrator sign-in required.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      studentId,
      category,
      amount,
      paymentMethod = 'Mobile Money',
      notes = '',
      actorName = 'Rev. Fr. Bernard Kweku Arthur, M.Ed.',
      actorRole = 'headmaster',
    } = body;

    const numericAmount = Number(amount);
    if (!studentId || !category || isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json(
        { error: 'Valid studentId, category, and positive amount are required.' },
        { status: 400 }
      );
    }

    const state = getSchoolState();
    const student = state.students.find((s) => s.id === studentId);
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const validCategory = category as FeeCategory;
    if (validCategory === 'tuition') {
      student.tuitionPaid += numericAmount;
    } else if (validCategory === 'extra_classes') {
      student.extraClassesPaid += numericAmount;
    } else if (validCategory === 'meal_fee') {
      student.mealFeePaid += numericAmount;
    }

    const receiptNo = `STA-RCP-2026-${900 + state.feePayments.length + 1}`;
    const paymentDate = new Date().toISOString().split('T')[0];

    const newPayment: FeePaymentRecord = {
      id: `pay-${Date.now()}`,
      receiptNo,
      studentId: student.id,
      studentName: student.fullName,
      className: student.className,
      category: validCategory,
      amount: numericAmount,
      paymentMethod,
      paymentDate,
      recordedBy: actorName,
      notes,
    };

    state.feePayments.unshift(newPayment);

    const supabase = getSupabaseServerClient();
    if (supabase) {
      await supabase.from('fee_payments').insert({
        receipt_no: newPayment.receiptNo,
        student_id: newPayment.studentId,
        student_name: newPayment.studentName,
        class_name: newPayment.className,
        category: newPayment.category,
        amount: newPayment.amount,
        payment_method: newPayment.paymentMethod,
        payment_date: newPayment.paymentDate,
        recorded_by: newPayment.recordedBy,
        notes: newPayment.notes,
      });
    }

    const categoryLabel =
      validCategory === 'tuition'
        ? 'Class Tuition Fee'
        : validCategory === 'extra_classes'
        ? 'Extra Classes Fee'
        : 'Semester Meal Fee';

    appendAuditLog(state, {
      actorName,
      actorRole: actorRole as UserRole,
      action: `Recorded ${categoryLabel} Payment`,
      category: 'fees',
      details: `Receipt ${receiptNo}: GH₵ ${numericAmount.toFixed(2)} received for ${student.fullName} (${student.className}) via ${paymentMethod}.`,
    });

    saveSchoolState(state);
    return NextResponse.json({ ok: true, payment: newPayment, state: toClientState(state) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to record fee payment' },
      { status: 500 }
    );
  }
}
