'use client';

import React, { useMemo, useState } from 'react';
import {
  Award,
  Camera,
  CheckCircle2,
  Clock,
  Coins,
  CreditCard,
  Edit3,
  FileSpreadsheet,
  GraduationCap,
  Layers,
  Receipt,
  Save,
  Search,
  ShieldCheck,
  UserCheck,
  UserPlus,
  UserRound,
  Users,
  Utensils,
  XCircle,
} from 'lucide-react';
import {
  SchoolInformation,
  ClassFeeStructure,
  FeeCategory,
  SchoolStateSnapshot,
} from '@/types/school';
import { formatCurrency, SCHOOL_CLASSES } from '@/lib/grading';
import { ReportCardGenerator } from './ReportCardGenerator';
import { PhotoCapture } from '@/components/ui/PhotoCapture';

interface HeadmasterDashboardProps {
  state: SchoolStateSnapshot;
  /** The school's published particulars, forwarded to the report sheet. */
  siteInfo?: SchoolInformation | null;
  onStateChange: (newState: SchoolStateSnapshot) => void;
  onNotify: (msg: string, type?: 'success' | 'info') => void;
  initialTab?: 'class_fees' | 'student_payments' | 'admissions' | 'approvals' | 'reports';
}

export function HeadmasterDashboard({
  state,
  onStateChange,
  onNotify,
  initialTab = 'class_fees',
  siteInfo,
}: HeadmasterDashboardProps) {
  const headmaster = useMemo(
    () =>
      state.staff.find((s) => s.role === 'headmaster') || {
        fullName: 'Rev. Fr. Bernard Kweku Arthur, M.Ed.',
        staffId: 'STA-HM-002',
      },
    [state.staff]
  );

  const [activeTab, setActiveTab] = useState<
    'class_fees' | 'student_payments' | 'admissions' | 'approvals' | 'reports'
  >(initialTab);

  // =========================================================================
  // 1. CLASS FEE STRUCTURE MANAGEMENT STATE (Tuition, Extra Classes, Meal Fees)
  // =========================================================================
  const [editingClass, setEditingClass] = useState<ClassFeeStructure>(
    state.classFeeStructures[state.classFeeStructures.length - 1] ||
      state.classFeeStructures[0]
  );
  const [tuitionDraft, setTuitionDraft] = useState<number>(
    editingClass?.tuitionFee || 2100
  );
  const [extraDraft, setExtraDraft] = useState<number>(
    editingClass?.extraClassesFee || 600
  );
  const [dailyMealDraft, setDailyMealDraft] = useState<number>(
    editingClass?.dailyMealFee || 25
  );
  const [semesterMealDraft, setSemesterMealDraft] = useState<number>(
    editingClass?.semesterMealFee || 1625
  );
  const [ictDraft, setIctDraft] = useState<number>(
    editingClass?.ictAndBooksFee || 550
  );
  const [teacherDraft, setTeacherDraft] = useState<string>(
    editingClass?.classTeacher || 'Mr. Emmanuel Osei-Tutu'
  );
  const [savingClassFee, setSavingClassFee] = useState(false);

  function selectClassForEditing(cf: ClassFeeStructure) {
    setEditingClass(cf);
    setTuitionDraft(cf.tuitionFee);
    setExtraDraft(cf.extraClassesFee);
    setDailyMealDraft(cf.dailyMealFee);
    setSemesterMealDraft(cf.semesterMealFee);
    setIctDraft(cf.ictAndBooksFee);
    setTeacherDraft(cf.classTeacher);
  }

  async function handleSaveClassFeeStructure(e: React.FormEvent) {
    e.preventDefault();
    if (!editingClass) return;
    setSavingClassFee(true);
    try {
      const res = await fetch('/api/fees', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          className: editingClass.className,
          tuitionFee: tuitionDraft,
          extraClassesFee: extraDraft,
          dailyMealFee: dailyMealDraft,
          semesterMealFee: semesterMealDraft,
          ictAndBooksFee: ictDraft,
          classTeacher: teacherDraft,
          actorName: headmaster.fullName,
          actorRole: 'headmaster',
        }),
      });
      const data = await res.json();
      if (data.ok && data.state) {
        onStateChange(data.state);
        onNotify(
          `Updated ${editingClass.className} fees: Tuition GH₵ ${tuitionDraft}, Extra Classes GH₵ ${extraDraft}, Daily Meal GH₵ ${dailyMealDraft}/day.`
        );
      }
    } finally {
      setSavingClassFee(false);
    }
  }

  // =========================================================================
  // 2. STUDENT FEE PAYMENTS & RECEIPTS STATE
  // =========================================================================
  const [paymentClassFilter, setPaymentClassFilter] = useState<string>('All');
  const [paymentStudentId, setPaymentStudentId] = useState<string>(
    state.students[0]?.id || 'stu-1'
  );
  const [paymentCategory, setPaymentCategory] = useState<FeeCategory>('tuition');
  const [paymentAmount, setPaymentAmount] = useState<string>('500');
  const [paymentMethod, setPaymentMethod] = useState<
    'Mobile Money' | 'Bank Deposit' | 'Cash' | 'Cheque'
  >('Mobile Money');
  const [paymentNotes, setPaymentNotes] = useState<string>('');
  const [submittingPayment, setSubmittingPayment] = useState(false);

  async function handleRecordPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!paymentStudentId || !paymentAmount) return;
    setSubmittingPayment(true);
    try {
      const res = await fetch('/api/fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: paymentStudentId,
          category: paymentCategory,
          amount: Number(paymentAmount),
          paymentMethod,
          notes: paymentNotes,
          actorName: headmaster.fullName,
          actorRole: 'headmaster',
        }),
      });
      const data = await res.json();
      if (data.ok && data.state) {
        onStateChange(data.state);
        setPaymentNotes('');
        onNotify(
          `Official Receipt ${data.payment.receiptNo} issued for GH₵ ${Number(
            paymentAmount
          ).toFixed(2)}!`
        );
      }
    } finally {
      setSubmittingPayment(false);
    }
  }

  // =========================================================================
  // 2b. ADMISSIONS — ENROL A PUPIL (with a passport photograph)
  // =========================================================================
  const [admName, setAdmName] = useState('');
  const [admGender, setAdmGender] = useState<'Male' | 'Female'>('Female');
  const [admDob, setAdmDob] = useState('');
  const [admClass, setAdmClass] = useState('KG 1');
  const [admGuardian, setAdmGuardian] = useState('');
  const [admPhone, setAdmPhone] = useState('');
  const [admPhoto, setAdmPhoto] = useState<string>('');
  const [admError, setAdmError] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [pupilSearch, setPupilSearch] = useState('');

  const enrolledByClass = useMemo(() => {
    const counts = new Map<string, number>();
    state.students.forEach((pupil) => {
      counts.set(pupil.className, (counts.get(pupil.className) || 0) + 1);
    });
    return SCHOOL_CLASSES.map((className) => ({
      className,
      count: counts.get(className) || 0,
    }));
  }, [state.students]);

  const filteredPupils = useMemo(() => {
    const term = pupilSearch.trim().toLowerCase();
    const rows = [...state.students].sort((a, b) => a.className.localeCompare(b.className));
    if (!term) return rows.slice(0, 12);
    return rows
      .filter(
        (pupil) =>
          pupil.fullName.toLowerCase().includes(term) ||
          pupil.studentCode.toLowerCase().includes(term) ||
          pupil.className.toLowerCase().includes(term) ||
          pupil.guardianName.toLowerCase().includes(term)
      )
      .slice(0, 24);
  }, [state.students, pupilSearch]);

  async function handleEnrolPupil(e: React.FormEvent) {
    e.preventDefault();
    setAdmError(null);

    if (!admName.trim() || !admGuardian.trim()) {
      setAdmError('The pupil’s full name and the guardian’s name are required.');
      return;
    }
    if (!admPhoto) {
      setAdmError('Please take the pupil’s photograph before enrolling them.');
      return;
    }

    setEnrolling(true);
    try {
      const res = await fetch('/api/school', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_student',
          fullName: admName,
          gender: admGender,
          dateOfBirth: admDob || undefined,
          className: admClass,
          guardianName: admGuardian,
          guardianPhone: admPhone,
          photo: admPhoto,
          actorName: headmaster.fullName,
          actorRole: 'headmaster',
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setAdmError(data.error || 'The pupil could not be enrolled. Please try again.');
        return;
      }

      if (data.state) onStateChange(data.state);
      onNotify(
        `Enrolled ${data.student.fullName} (${data.student.studentCode}) into ${data.student.className}.`
      );
      setAdmName('');
      setAdmDob('');
      setAdmGuardian('');
      setAdmPhone('');
      setAdmPhoto('');
    } catch {
      setAdmError('The pupil could not be enrolled. Please try again.');
    } finally {
      setEnrolling(false);
    }
  }

  // =========================================================================
  // 3. TEACHER REGISTRATION APPROVALS STATE
  // =========================================================================
  const [processingRegId, setProcessingRegId] = useState<string | null>(null);
  const [customClassAssignments, setCustomClassAssignments] = useState<
    Record<string, string>
  >({});

  const pendingRegistrations = useMemo(
    () => state.teacherRegistrations.filter((r) => r.status === 'pending'),
    [state.teacherRegistrations]
  );

  async function handleReviewRegistration(
    regId: string,
    decision: 'approved' | 'rejected',
    defaultClass: string
  ) {
    setProcessingRegId(regId);
    try {
      const assignedClass = customClassAssignments[regId] || defaultClass;
      const res = await fetch('/api/teachers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationId: regId,
          status: decision,
          assignedClass,
          actorName: headmaster.fullName,
          actorRole: 'headmaster',
        }),
      });
      const data = await res.json();
      if (data.ok && data.state) {
        onStateChange(data.state);
        onNotify(
          decision === 'approved'
            ? data.issuedPassword
              ? `Application approved. Staff number ${data.registration.assignedStaffId} (${assignedClass}). Issue the temporary password: ${data.issuedPassword}`
              : `Application approved. Staff number ${data.registration.assignedStaffId} (${assignedClass}). The applicant may now sign in with the password chosen at application.`
            : 'Teaching application declined.',
          decision === 'approved' ? 'success' : 'info'
        );
      }
    } finally {
      setProcessingRegId(null);
    }
  }

  // Financial aggregates for Headmaster KPI cards
  const financialTotals = useMemo(() => {
    const tuitionCollected = state.students.reduce((s, stu) => s + stu.tuitionPaid, 0);
    const extraCollected = state.students.reduce((s, stu) => s + stu.extraClassesPaid, 0);
    const mealPrepaid = state.students.reduce((s, stu) => s + stu.mealFeePaid, 0);
    const dailyFeedingCash = state.dailyFeedingLogs
      .filter((l) => l.status === 'paid')
      .reduce((s, l) => s + l.amount, 0);

    return {
      tuitionCollected,
      extraCollected,
      mealPrepaid,
      dailyFeedingCash,
      totalMealRevenue: mealPrepaid + dailyFeedingCash,
    };
  }, [state.students, state.dailyFeedingLogs]);

  return (
    <div className="space-y-6">
      {/* Headmaster Header Banner */}
      <div className="animate-fade-up relative overflow-hidden rounded-3xl border border-theresa-gold-400/40 bg-gradient-to-r from-theresa-green-950 via-theresa-green-900 to-theresa-green-800 p-6 text-white shadow-lift">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(217,175,55,0.18),transparent_55%)]" />
          <div className="hero-blob -right-16 -top-24 h-64 w-64 bg-theresa-gold-600/20 animate-float-slow" />
          <div className="hero-blob -left-10 bottom-[-6rem] h-56 w-56 bg-theresa-green-500/25 animate-float" />
          <div className="absolute inset-0 pattern-grid opacity-[0.07]" />
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-theresa-gold-400/20 border border-theresa-gold-400/40 text-theresa-gold-300 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              Office of the Headmaster &middot; administration and bursary
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white">
              {headmaster.fullName}
            </h2>
            <p className="text-sm text-emerald-100/85">
              Staff number <span className="font-mono font-bold text-theresa-gold-300">{headmaster.staffId}</span> &middot; fee schedules, extra classes, meals, staff appointments and terminal reports
            </p>
          </div>

          {/* Quick Summary KPIs */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2.5 border border-white/15">
              <div className="text-[10px] uppercase tracking-wider text-theresa-gold-300 font-bold">
                Tuition received
              </div>
              <div className="text-base font-mono font-extrabold text-white">
                {formatCurrency(financialTotals.tuitionCollected)}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2.5 border border-white/15">
              <div className="text-[10px] uppercase tracking-wider text-theresa-gold-300 font-bold">
                Extra Classes
              </div>
              <div className="text-base font-mono font-extrabold text-white">
                {formatCurrency(financialTotals.extraCollected)}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2.5 border border-white/15">
              <div className="text-[10px] uppercase tracking-wider text-theresa-gold-300 font-bold">
                Applications
              </div>
              <div className="text-base font-mono font-extrabold text-theresa-gold-300">
                {pendingRegistrations.length} awaiting
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="mt-6 pt-5 border-t border-white/15 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('class_fees')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition ${
              activeTab === 'class_fees'
                ? 'bg-theresa-gold-400 text-theresa-green-950 shadow-md scale-[1.03]'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Layers className="w-4 h-4" />
            Fees by class
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('student_payments')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition ${
              activeTab === 'student_payments'
                ? 'bg-theresa-gold-400 text-theresa-green-950 shadow-md scale-[1.03]'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Payments &amp; receipts
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('admissions')}
            className={`group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
              activeTab === 'admissions'
                ? 'bg-theresa-gold-400 text-theresa-green-950 shadow-md scale-[1.03]'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Admissions
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('approvals')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
              activeTab === 'approvals'
                ? 'bg-theresa-gold-400 text-theresa-green-950 shadow-md scale-[1.03]'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Teaching applications
            {pendingRegistrations.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-xs font-extrabold">
                {pendingRegistrations.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition ${
              activeTab === 'reports'
                ? 'bg-theresa-gold-400 text-theresa-green-950 shadow-md scale-[1.03]'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Report cards
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: MANAGE STUDENT FEES BY CLASS, EXTRA CLASSES, AND MEAL FEES     */}
      {/* ===================================================================== */}
      {activeTab === 'class_fees' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 4 cols: Interactive Class Fee Rate Editor */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-theresa-green-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-theresa-gold-700">
                  Fee rates by class
                </span>
                <h3 className="text-xl font-serif font-bold text-theresa-green-950">
                  Configure {editingClass?.className} Rates
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-theresa-gold-100 flex items-center justify-center text-theresa-gold-800">
                <Edit3 className="w-5 h-5" />
              </div>
            </div>

            <form onSubmit={handleSaveClassFeeStructure} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Select Class Level
                </label>
                <select
                  value={editingClass?.className || ''}
                  onChange={(e) => {
                    const found = state.classFeeStructures.find(
                      (c) => c.className === e.target.value
                    );
                    if (found) selectClassForEditing(found);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-theresa-green-300 bg-theresa-green-50/50 text-sm font-bold text-theresa-green-950"
                >
                  {state.classFeeStructures.map((cf) => (
                    <option key={cf.id} value={cf.className}>
                      {cf.className} — ({cf.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Class Tuition Fee (GH₵)
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={tuitionDraft}
                    onChange={(e) => setTuitionDraft(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-mono text-sm font-bold text-theresa-green-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Extra Classes Fee (GH₵)
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={extraDraft}
                    onChange={(e) => setExtraDraft(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-mono text-sm font-bold text-theresa-gold-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Daily Meal Fee (GH₵/day)
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={dailyMealDraft}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setDailyMealDraft(val);
                      setSemesterMealDraft(Math.round(val * 65));
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-mono text-sm font-bold text-emerald-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Semester Meal Plan (65d)
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={semesterMealDraft}
                    onChange={(e) => setSemesterMealDraft(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-mono text-sm font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    ICT & Books Levy (GH₵)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={ictDraft}
                    onChange={(e) => setIctDraft(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Assigned Class Teacher
                  </label>
                  <input
                    type="text"
                    value={teacherDraft}
                    onChange={(e) => setTeacherDraft(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-theresa-ivory border border-theresa-gold-300 flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-600">
                  Full Package ({editingClass?.className}):
                </span>
                <span className="font-mono text-base font-extrabold text-theresa-green-950">
                  {formatCurrency(
                    tuitionDraft + extraDraft + semesterMealDraft + ictDraft
                  )}
                </span>
              </div>

              <button
                type="submit"
                disabled={savingClassFee}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-theresa-green-800 to-theresa-green-700 hover:from-theresa-green-900 hover:to-theresa-green-800 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition"
              >
                <Save className="w-4 h-4 text-theresa-gold-300" />
                {savingClassFee
                  ? 'Updating Schedule...'
                  : `Save ${editingClass?.className} Fee Schedule`}
              </button>
            </form>
          </div>

          {/* Right 8 cols: Master Class Fee Schedule Table (All Classes) */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-theresa-green-100 p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-theresa-green-700">
                  {state.currentSemester} • Master Fee Schedule
                </span>
                <h3 className="text-xl font-serif font-bold text-theresa-green-950">
                  Fee schedule for every class
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                Click any class row to edit its rates
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-theresa-green-900 text-white text-xs uppercase tracking-wider">
                    <th className="py-3.5 px-4 font-bold">Class</th>
                    <th className="py-3.5 px-3 font-bold">Department</th>
                    <th className="py-3.5 px-3 font-bold text-right">Tuition Fee</th>
                    <th className="py-3.5 px-3 font-bold text-right">Extra Classes</th>
                    <th className="py-3.5 px-3 font-bold text-right">Daily Meal</th>
                    <th className="py-3.5 px-3 font-bold text-right">Semester Meal</th>
                    <th className="py-3.5 px-4 font-bold">Class Teacher</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {state.classFeeStructures.map((cf) => {
                    const isSelected = editingClass?.className === cf.className;
                    return (
                      <tr
                        key={cf.id}
                        onClick={() => selectClassForEditing(cf)}
                        className={`cursor-pointer transition ${
                          isSelected
                            ? 'bg-theresa-gold-100/70 font-semibold'
                            : 'hover:bg-theresa-green-50/50'
                        }`}
                      >
                        <td className="py-3 px-4 font-bold text-theresa-green-950">
                          {cf.className}
                        </td>
                        <td className="py-3 px-3 text-xs text-slate-600">{cf.department}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                          {formatCurrency(cf.tuitionFee)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-theresa-gold-800">
                          {formatCurrency(cf.extraClassesFee)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                          {formatCurrency(cf.dailyMealFee)}/day
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-700">
                          {formatCurrency(cf.semesterMealFee)}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600">{cf.classTeacher}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: STUDENT FEE COLLECTIONS & MEAL LEDGERS                         */}
      {/* ===================================================================== */}
      {activeTab === 'student_payments' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 4 cols: Record a fee payment Form */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-theresa-green-100 p-6 shadow-sm">
            <div className="mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-theresa-gold-700">
                Bursary desk
              </span>
              <h3 className="text-xl font-serif font-bold text-theresa-green-950">
                Record a fee payment
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Record a payment and issue a receipt for class tuition, afternoon extra classes or the semester meal plan.
              </p>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Select Student
                </label>
                <select
                  value={paymentStudentId}
                  onChange={(e) => setPaymentStudentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-theresa-green-300 bg-theresa-green-50/50 text-sm font-bold text-theresa-green-950"
                >
                  {state.students.map((stu) => (
                    <option key={stu.id} value={stu.id}>
                      {stu.fullName} ({stu.className} • {stu.studentCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Fee Category
                </label>
                <select
                  value={paymentCategory}
                  onChange={(e) => setPaymentCategory(e.target.value as FeeCategory)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold"
                >
                  <option value="tuition">Student Class / Tuition Fee</option>
                  <option value="extra_classes">Afternoon Extra Classes Fee</option>
                  <option value="meal_fee">Semester Meal / Feeding Plan</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Amount Paid (GH₵)
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Payment Channel
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) =>
                      setPaymentMethod(
                        e.target.value as 'Mobile Money' | 'Bank Deposit' | 'Cash' | 'Cheque'
                      )
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-medium"
                  >
                    <option value="Mobile Money">Mobile Money</option>
                    <option value="Bank Deposit">Bank Deposit</option>
                    <option value="Cash">Cash at Bursary</option>
                    <option value="Cheque">Bankers Draft / Cheque</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Receipt Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Second installment payment"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={submittingPayment}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-theresa-green-800 to-theresa-green-700 hover:from-theresa-green-900 hover:to-theresa-green-800 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition"
              >
                <Receipt className="w-4 h-4 text-theresa-gold-300" />
                {submittingPayment
                  ? 'Issuing Official Receipt...'
                  : 'Record Payment & Generate Receipt'}
              </button>
            </form>
          </div>

          {/* Right 8 cols: Student Fee Balances by Class & Recent Receipts */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl border border-theresa-green-100 p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-theresa-green-700">
                    Pupil accounts by class
                  </span>
                  <h3 className="text-xl font-serif font-bold text-theresa-green-950">
                    Tuition, extra classes and meals
                  </h3>
                </div>

                <select
                  value={paymentClassFilter}
                  onChange={(e) => setPaymentClassFilter(e.target.value)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold"
                >
                  <option value="All">All Classes</option>
                  {Array.from(new Set(state.students.map((s) => s.className))).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-theresa-green-900 text-white text-xs uppercase">
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-3">Class</th>
                      <th className="py-3 px-3 text-right">Tuition Paid / Bill</th>
                      <th className="py-3 px-3 text-right">Extra Classes Paid / Bill</th>
                      <th className="py-3 px-3 text-right">Meal Plan Paid</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {state.students
                      .filter(
                        (s) =>
                          paymentClassFilter === 'All' || s.className === paymentClassFilter
                      )
                      .map((stu) => {
                        const cf = state.classFeeStructures.find(
                          (c) => c.className === stu.className
                        );
                        const tBill = cf?.tuitionFee || 1600;
                        const eBill = cf?.extraClassesFee || 350;
                        const cleared = stu.tuitionPaid >= tBill && stu.extraClassesPaid >= eBill;

                        return (
                          <tr key={stu.id} className="hover:bg-slate-50">
                            <td className="py-3 px-4 font-bold text-slate-900">
                              {stu.fullName}
                              <div className="text-[11px] font-mono text-slate-500">
                                {stu.studentCode}
                              </div>
                            </td>
                            <td className="py-3 px-3 font-semibold text-theresa-green-900">
                              {stu.className}
                            </td>
                            <td className="py-3 px-3 text-right font-mono text-xs">
                              <span className="font-bold text-slate-900">
                                {formatCurrency(stu.tuitionPaid)}
                              </span>{' '}
                              / {formatCurrency(tBill)}
                            </td>
                            <td className="py-3 px-3 text-right font-mono text-xs">
                              <span className="font-bold text-theresa-gold-800">
                                {formatCurrency(stu.extraClassesPaid)}
                              </span>{' '}
                              / {formatCurrency(eBill)}
                            </td>
                            <td className="py-3 px-3 text-right font-mono text-xs font-bold text-emerald-800">
                              {formatCurrency(stu.mealFeePaid)}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {cleared ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Cleared
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                                  Part Paid
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Official Receipts */}
            <div className="bg-white rounded-3xl border border-theresa-green-100 p-6 shadow-sm">
              <h4 className="text-sm font-bold uppercase tracking-wider text-theresa-green-900 mb-3">
                Recent Official Fee Receipts Issued ({state.feePayments.length})
              </h4>
              <div className="overflow-x-auto rounded-2xl border border-slate-200 max-h-56">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-100 text-slate-700 uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Receipt No.</th>
                      <th className="py-2.5 px-3">Student</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                      <th className="py-2.5 px-3">Method</th>
                      <th className="py-2.5 px-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {state.feePayments.map((pay) => (
                      <tr key={pay.id}>
                        <td className="py-2.5 px-3 font-mono font-bold text-theresa-green-900">
                          {pay.receiptNo}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-800">
                          {pay.studentName} ({pay.className})
                        </td>
                        <td className="py-2.5 px-3 uppercase font-semibold text-theresa-gold-800">
                          {pay.category.replace('_', ' ')}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800">
                          {formatCurrency(pay.amount)}
                        </td>
                        <td className="py-2.5 px-3">{pay.paymentMethod}</td>
                        <td className="py-2.5 px-3 font-mono">{pay.paymentDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: APPROVE TEACHER REGISTRATIONS                                  */}
      {/* ===================================================================== */}
      {/* ===================================================================== */}
      {/* TAB 2b: ADMISSIONS — ENROL A PUPIL WITH A PASSPORT PHOTOGRAPH         */}
      {/* ===================================================================== */}
      {activeTab === 'admissions' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Enrolment form */}
          <section className="lg:col-span-7 bg-white rounded-3xl border border-theresa-green-100 p-6 shadow-sm animate-fade-up">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-theresa-gold-700">
                  Admissions
                </span>
                <h3 className="text-2xl font-serif font-bold text-theresa-green-950">
                  Enrol a pupil
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Take the pupil&apos;s photograph, complete the register entry and issue a student
                  number. The photograph is kept with the pupil&apos;s record and printed on the
                  report card.
                </p>
              </div>
              <span className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-theresa-green-50 border border-theresa-green-200 text-xs font-bold text-theresa-green-800">
                <Camera className="w-4 h-4" />
                Photo required
              </span>
            </div>

            <form onSubmit={handleEnrolPupil} className="space-y-5">
              <PhotoCapture
                value={admPhoto || undefined}
                onChange={(dataUrl) => setAdmPhoto(dataUrl ?? '')}
                label="Pupil's passport photograph"
                caption="Pupil photograph"
                hint="Use the camera to take the pupil's picture at the office, or upload a recent passport photograph."
                required
                disabled={enrolling}
                shape="square"
                maxDimension={420}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="admName" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Pupil&apos;s full name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="admName"
                    required
                    value={admName}
                    onChange={(e) => setAdmName(e.target.value)}
                    placeholder="e.g. Ama Serwaa Mensah"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none transition focus:border-theresa-green-700 focus:ring-4 focus:ring-theresa-green-100/70"
                  />
                </div>

                <div>
                  <label htmlFor="admGender" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Gender
                  </label>
                  <select
                    id="admGender"
                    value={admGender}
                    onChange={(e) => setAdmGender(e.target.value as 'Male' | 'Female')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none transition focus:border-theresa-green-700 focus:ring-4 focus:ring-theresa-green-100/70"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="admDob" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Date of birth
                  </label>
                  <input
                    id="admDob"
                    type="date"
                    value={admDob}
                    onChange={(e) => setAdmDob(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none transition focus:border-theresa-green-700 focus:ring-4 focus:ring-theresa-green-100/70"
                  />
                </div>

                <div>
                  <label htmlFor="admClass" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Class <span className="text-rose-600">*</span>
                  </label>
                  <select
                    id="admClass"
                    value={admClass}
                    onChange={(e) => setAdmClass(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none transition focus:border-theresa-green-700 focus:ring-4 focus:ring-theresa-green-100/70"
                  >
                    {SCHOOL_CLASSES.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="admGuardian" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Guardian&apos;s name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="admGuardian"
                    required
                    value={admGuardian}
                    onChange={(e) => setAdmGuardian(e.target.value)}
                    placeholder="e.g. Mrs. Comfort Aubyn-Hammond"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none transition focus:border-theresa-green-700 focus:ring-4 focus:ring-theresa-green-100/70"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="admPhone" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Guardian&apos;s telephone
                  </label>
                  <input
                    id="admPhone"
                    type="tel"
                    value={admPhone}
                    onChange={(e) => setAdmPhone(e.target.value)}
                    placeholder="+233 24 000 0000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none transition focus:border-theresa-green-700 focus:ring-4 focus:ring-theresa-green-100/70"
                  />
                </div>
              </div>

              {admError && (
                <p className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-800 animate-fade-in">
                  <XCircle className="mt-0.5 w-4 h-4 shrink-0" />
                  {admError}
                </p>
              )}

              <button
                type="submit"
                disabled={enrolling}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-theresa-green-800 to-theresa-green-700 px-6 py-3.5 text-sm font-bold text-white shadow-soft transition hover:shadow-lift disabled:opacity-60 magnetic-btn shine"
              >
                {enrolling ? 'Enrolling pupil…' : 'Enrol pupil and issue a student number'}
                {!enrolling && <UserPlus className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />}
              </button>
            </form>
          </section>

          {/* Roll and recently enrolled */}
          <aside className="lg:col-span-5 space-y-6">
            <section className="bg-white rounded-3xl border border-theresa-green-100 p-6 shadow-sm animate-fade-up anim-delay-2">
              <h3 className="flex items-center gap-2 text-lg font-serif font-bold text-theresa-green-950">
                <Users className="w-4 h-4 text-theresa-gold-700" />
                Pupils on the roll
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                {state.students.length} pupils across {SCHOOL_CLASSES.length} classes.
              </p>

              <div className="mt-4 space-y-2">
                {enrolledByClass.map((row) => {
                  const max = Math.max(1, ...enrolledByClass.map((item) => item.count));
                  return (
                    <div key={row.className} className="flex items-center gap-3">
                      <span className="w-16 shrink-0 text-xs font-bold text-slate-700">
                        {row.className}
                      </span>
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-theresa-green-700 to-theresa-gold-400 transition-[width] duration-700"
                          style={{ width: `${(row.count / max) * 100}%` }}
                        />
                      </div>
                      <span className="w-8 shrink-0 text-right font-mono text-xs font-bold text-slate-600">
                        {row.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="bg-white rounded-3xl border border-theresa-green-100 p-6 shadow-sm animate-fade-up anim-delay-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="flex items-center gap-2 text-lg font-serif font-bold text-theresa-green-950">
                  <UserRound className="w-4 h-4 text-theresa-gold-700" />
                  Pupil register
                </h3>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                  {filteredPupils.length}
                </span>
              </div>

              <div className="relative mt-4">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={pupilSearch}
                  onChange={(e) => setPupilSearch(e.target.value)}
                  placeholder="Search by name, class or guardian"
                  className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-theresa-green-700 focus:ring-4 focus:ring-theresa-green-100/70"
                />
              </div>

              <ul className="mt-4 max-h-[420px] space-y-2 overflow-y-auto pr-1">
                {filteredPupils.map((pupil) => (
                  <li
                    key={pupil.id}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-2.5 transition hover:border-theresa-green-300 hover:bg-theresa-green-50/50"
                  >
                    {pupil.photo ? (
                      <img
                        src={pupil.photo}
                        alt={pupil.fullName}
                        className="h-11 w-11 shrink-0 rounded-xl border border-white object-cover shadow-sm"
                      />
                    ) : (
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-theresa-green-50 text-theresa-green-800">
                        <UserRound className="h-5 w-5" />
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-900">{pupil.fullName}</p>
                      <p className="truncate text-[11px] text-slate-500">
                        {pupil.className} &middot; {pupil.studentCode}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-theresa-green-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-theresa-green-800">
                      {pupil.gender === 'Female' ? 'F' : 'M'}
                    </span>
                  </li>
                ))}
                {filteredPupils.length === 0 && (
                  <li className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-xs text-slate-500">
                    No pupil matches that search.
                  </li>
                )}
              </ul>
            </section>
          </aside>
        </div>
      )}

      {activeTab === 'approvals' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-theresa-green-100 p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-theresa-gold-700">
                  Teaching applications
                </span>
                <h3 className="text-2xl font-serif font-bold text-theresa-green-950">
                  Teaching applications waiting for a decision
                </h3>
                <p className="text-sm text-slate-600">
                  Applications submitted through the school website. Approving a teacher issues their staff number and opens access to the teacher portal; applicants sign in with the password they chose when applying.
                </p>
              </div>
              <div className="px-4 py-2 rounded-2xl bg-theresa-ivory border border-theresa-gold-300 text-sm font-bold text-theresa-green-950">
                {pendingRegistrations.length} Pending Approval •{' '}
                {state.teacherRegistrations.filter((r) => r.status === 'approved').length}{' '}
                Approved
              </div>
            </div>

            <div className="space-y-4">
              {state.teacherRegistrations.map((reg) => {
                const isPending = reg.status === 'pending';
                const selectedClass =
                  customClassAssignments[reg.id] || reg.requestedClass;

                return (
                  <div
                    key={reg.id}
                    className={`p-5 rounded-2xl border transition hover:shadow-md ${
                      isPending
                        ? 'bg-amber-50/40 border-theresa-gold-400 shadow-sm'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        {reg.passportPhoto ? (
                          <img
                            src={reg.passportPhoto}
                            alt={`Passport photograph of ${reg.fullName}`}
                            className="h-20 w-16 shrink-0 rounded-xl border-2 border-white object-cover shadow-md"
                          />
                        ) : (
                          <span className="flex h-20 w-16 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 bg-white text-[9px] font-bold uppercase tracking-wider text-slate-400">
                            <UserRound className="h-5 w-5" />
                            No photo
                          </span>
                        )}
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-lg font-serif font-bold text-theresa-green-950">
                            {reg.fullName}
                          </h4>
                          {reg.status === 'pending' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold">
                              <Clock className="w-3.5 h-3.5" />
                              Awaiting a decision
                            </span>
                          )}
                          {reg.status === 'approved' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Approved ({reg.assignedStaffId})
                            </span>
                          )}
                          {reg.status === 'rejected' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-900 border border-rose-300 text-xs font-bold">
                              <XCircle className="w-3.5 h-3.5" />
                              Declined
                            </span>
                          )}
                        </div>

                        <div className="text-sm font-medium text-slate-700">
                          <span className="font-bold text-theresa-green-900">
                            Qualification:
                          </span>{' '}
                          {reg.qualification} ({reg.experienceYears} yrs experience)
                        </div>

                        <div className="text-xs text-slate-600 flex flex-wrap gap-4">
                          <span>
                            <strong>Email:</strong> {reg.email}
                          </span>
                          <span>
                            <strong>Phone:</strong> {reg.phone}
                          </span>
                          <span>
                            <strong>Subjects:</strong> {reg.subjects.join(', ')}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 italic bg-white/80 p-2.5 rounded-xl border border-slate-200/80 mt-2">
                          &ldquo;{reg.statement}&rdquo;
                        </p>
                      </div>
                      </div>

                      {/* Approval Controls */}
                      <div className="flex flex-wrap items-center gap-3 shrink-0">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                            Assign Class
                          </label>
                          <select
                            value={selectedClass}
                            disabled={!isPending}
                            onChange={(e) =>
                              setCustomClassAssignments((prev) => ({
                                ...prev,
                                [reg.id]: e.target.value,
                              }))
                            }
                            className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-theresa-green-950"
                          >
                            {SCHOOL_CLASSES.map((cls) => (
                              <option key={cls} value={cls}>
                                {cls}
                              </option>
                            ))}
                          </select>
                        </div>

                        {isPending ? (
                          <div className="flex items-center gap-2 pt-4">
                            <button
                              type="button"
                              disabled={processingRegId === reg.id}
                              onClick={() =>
                                handleReviewRegistration(
                                  reg.id,
                                  'approved',
                                  reg.requestedClass
                                )
                              }
                              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              Approve and issue a staff number
                            </button>

                            <button
                              type="button"
                              disabled={processingRegId === reg.id}
                              onClick={() =>
                                handleReviewRegistration(
                                  reg.id,
                                  'rejected',
                                  reg.requestedClass
                                )
                              }
                              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold transition"
                            >
                              <XCircle className="w-4 h-4" />
                              Decline
                            </button>
                          </div>
                        ) : (
                          <div className="pt-4 text-xs text-slate-500">
                            Reviewed by {reg.reviewedBy || 'Headmaster'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 4: END-OF-SEMESTER REPORTS & ENDORSEMENTS                         */}
      {/* ===================================================================== */}
      {activeTab === 'reports' && (
        <ReportCardGenerator
          state={state}
          siteInfo={siteInfo}
          activeRole="headmaster"
          actorName={headmaster.fullName}
          onStateChange={onStateChange}
          onNotify={onNotify}
        />
      )}
    </div>
  );
}
