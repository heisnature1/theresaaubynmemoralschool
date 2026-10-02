'use client';

import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Coins,
  FileSpreadsheet,
  KeyRound,
  PlusCircle,
  Search,
  Send,
  Utensils,
} from 'lucide-react';
import {
  FeedingStatus,
  SchoolStateSnapshot,
} from '@/types/school';
import {
  calculateGrade,
  formatCurrency,
  SCHOOL_CLASSES,
  SCHOOL_SUBJECTS,
} from '@/lib/grading';
import { ReportCardGenerator } from './ReportCardGenerator';

interface TeacherDashboardProps {
  state: SchoolStateSnapshot;
  onStateChange: (newState: SchoolStateSnapshot) => void;
  onNotify: (msg: string, type?: 'success' | 'info') => void;
  initialTab?: 'results' | 'feeding' | 'reports' | 'profile';
  /** Details of the teacher who is signed in. */
  currentUser?: { fullName: string; staffId: string; email: string };
}

export function TeacherDashboard({
  state,
  onStateChange,
  onNotify,
  initialTab = 'results',
  currentUser,
}: TeacherDashboardProps) {
  const teachers = useMemo(
    () => state.staff.filter((s) => s.role === 'teacher'),
    [state.staff]
  );

  const signedInTeacher = useMemo(
    () => teachers.find((t) => t.email.toLowerCase() === (currentUser?.email || '').toLowerCase()),
    [teachers, currentUser]
  );

  const [activeTeacherId, setActiveTeacherId] = useState<string>(
    signedInTeacher?.id || teachers[0]?.id || 'stf-t1'
  );
  const activeTeacher = useMemo(
    () => teachers.find((t) => t.id === activeTeacherId) || teachers[0],
    [teachers, activeTeacherId]
  );

  const [activeTab, setActiveTab] = useState<'results' | 'feeding' | 'reports' | 'profile'>(
    initialTab
  );

  // =========================================================================
  // 1. STUDENT RESULTS ENTRY STATE
  // =========================================================================
  const [resultClassFilter, setResultClassFilter] = useState<string>('All');
  const filteredResultStudents = useMemo(() => {
    if (resultClassFilter === 'All') return state.students;
    return state.students.filter((s) => s.className === resultClassFilter);
  }, [state.students, resultClassFilter]);

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    state.students[0]?.id || 'stu-1'
  );
  const [selectedSubject, setSelectedSubject] = useState<string>(SCHOOL_SUBJECTS[0]);
  const [classScore, setClassScore] = useState<number>(27);
  const [examScore, setExamScore] = useState<number>(62);
  const [submittingResult, setSubmittingResult] = useState(false);

  const liveGradePreview = useMemo(
    () => calculateGrade(classScore, examScore),
    [classScore, examScore]
  );

  const currentStudent = useMemo(
    () =>
      filteredResultStudents.find((s) => s.id === selectedStudentId) ||
      filteredResultStudents[0] ||
      state.students[0],
    [filteredResultStudents, selectedStudentId, state.students]
  );

  const currentStudentResults = useMemo(() => {
    if (!currentStudent) return [];
    return state.academicResults.filter((r) => r.studentId === currentStudent.id);
  }, [state.academicResults, currentStudent]);

  async function handleResultSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentStudent) return;
    setSubmittingResult(true);
    try {
      const res = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: currentStudent.id,
          subject: selectedSubject,
          classScore,
          examScore,
          semester: state.currentSemester,
          enteredBy: activeTeacher?.fullName || 'Mr. Emmanuel Osei-Tutu',
          actorRole: 'teacher',
        }),
      });
      const data = await res.json();
      if (data.ok && data.state) {
        onStateChange(data.state);
        onNotify(
          `Saved ${selectedSubject} result for ${currentStudent.fullName}: ${liveGradePreview.totalScore}% (${liveGradePreview.grade})`
        );
      }
    } finally {
      setSubmittingResult(false);
    }
  }

  // =========================================================================
  // 2. DAILY FEEDING FEE COLLECTION BY STUDENT NAME & DATE STATE
  // =========================================================================
  const [feedingDate, setFeedingDate] = useState<string>('2026-10-02');
  const [feedingClassFilter, setFeedingClassFilter] = useState<string>('All');
  const [feedingSearchQuery, setFeedingSearchQuery] = useState<string>('');
  const [feedingStudentNameInput, setFeedingStudentNameInput] = useState<string>(
    state.students[0]?.fullName || 'Kwame Boateng Mensah'
  );
  const [feedingPaymentMethod, setFeedingPaymentMethod] = useState<
    'Cash' | 'Mobile Money' | 'Prepaid Meal Card'
  >('Cash');
  const [feedingStatusInput, setFeedingStatusInput] = useState<FeedingStatus>('paid');
  const [feedingCustomAmount, setFeedingCustomAmount] = useState<string>('25');
  const [feedingNotes, setFeedingNotes] = useState<string>('');
  const [submittingFeeding, setSubmittingFeeding] = useState(false);

  // Sync default amount when student name changes
  function handleSelectFeedingStudentName(name: string) {
    setFeedingStudentNameInput(name);
    const matchedStu = state.students.find(
      (s) => s.fullName.toLowerCase() === name.toLowerCase()
    );
    if (matchedStu) {
      const feeStruct = state.classFeeStructures.find(
        (c) => c.className === matchedStu.className
      );
      if (feeStruct) {
        setFeedingCustomAmount(String(feeStruct.dailyMealFee));
      }
    }
  }

  async function handleLogDailyFeedingByForm(e: React.FormEvent) {
    e.preventDefault();
    if (!feedingStudentNameInput.trim()) return;
    setSubmittingFeeding(true);
    try {
      const matchedStudent = state.students.find(
        (s) => s.fullName.toLowerCase() === feedingStudentNameInput.trim().toLowerCase()
      );
      const res = await fetch('/api/feeding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'single',
          studentId: matchedStudent?.id,
          studentName: feedingStudentNameInput.trim(),
          className:
            matchedStudent?.className ||
            (feedingClassFilter !== 'All' ? feedingClassFilter : 'JHS 3'),
          collectionDate: feedingDate,
          amount: feedingStatusInput === 'paid' ? Number(feedingCustomAmount) || 20 : 0,
          status: feedingStatusInput,
          paymentMethod: feedingPaymentMethod,
          loggedByTeacher: activeTeacher?.fullName || 'Mr. Emmanuel Osei-Tutu',
          actorRole: 'teacher',
          notes: feedingNotes,
        }),
      });
      const data = await res.json();
      if (data.ok && data.state) {
        onStateChange(data.state);
        setFeedingNotes('');
        onNotify(
          `Logged daily feeding fee (${feedingDate}) for ${feedingStudentNameInput.trim()}.`
        );
      }
    } finally {
      setSubmittingFeeding(false);
    }
  }

  async function handleQuickToggleStudentFeeding(
    studentId: string,
    studentName: string,
    className: string,
    status: FeedingStatus
  ) {
    const classFee = state.classFeeStructures.find((c) => c.className === className);
    const dailyRate = classFee ? classFee.dailyMealFee : 20;
    const res = await fetch('/api/feeding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'single',
        studentId,
        studentName,
        className,
        collectionDate: feedingDate,
        amount: status === 'paid' ? dailyRate : 0,
        status,
        paymentMethod: 'Cash',
        loggedByTeacher: activeTeacher?.fullName || 'Mr. Emmanuel Osei-Tutu',
        actorRole: 'teacher',
        notes: `Quick roll-call entry on ${feedingDate}`,
      }),
    });
    const data = await res.json();
    if (data.ok && data.state) {
      onStateChange(data.state);
      onNotify(
        `Marked ${studentName} (${className}) as ${status.toUpperCase()} for ${feedingDate}.`
      );
    }
  }

  async function handleBatchMarkClassPaid(className: string) {
    setSubmittingFeeding(true);
    try {
      const res = await fetch('/api/feeding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'batch_class',
          className,
          collectionDate: feedingDate,
          loggedByTeacher: activeTeacher?.fullName || 'Mr. Emmanuel Osei-Tutu',
          actorRole: 'teacher',
        }),
      });
      const data = await res.json();
      if (data.ok && data.state) {
        onStateChange(data.state);
        onNotify(`Marked all ${className} students Paid for ${feedingDate}!`);
      }
    } finally {
      setSubmittingFeeding(false);
    }
  }

  // Filtered daily feeding logs for the selected date & search query
  const filteredFeedingLogs = useMemo(() => {
    return state.dailyFeedingLogs.filter((log) => {
      const matchesDate = !feedingDate || log.collectionDate === feedingDate;
      const matchesClass =
        feedingClassFilter === 'All' || log.className === feedingClassFilter;
      const matchesQuery =
        !feedingSearchQuery.trim() ||
        log.studentName.toLowerCase().includes(feedingSearchQuery.trim().toLowerCase()) ||
        log.className.toLowerCase().includes(feedingSearchQuery.trim().toLowerCase());
      return matchesDate && matchesClass && matchesQuery;
    });
  }, [state.dailyFeedingLogs, feedingDate, feedingClassFilter, feedingSearchQuery]);

  const totalCollectedOnSelectedDate = useMemo(() => {
    return filteredFeedingLogs
      .filter((l) => l.status === 'paid')
      .reduce((sum, l) => sum + l.amount, 0);
  }, [filteredFeedingLogs]);

  // =========================================================================
  // 3. MY ACCOUNT (password change)
  // =========================================================================
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(
    null
  );

  async function handlePasswordChange(event: React.FormEvent) {
    event.preventDefault();
    setPasswordMessage(null);

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ kind: 'error', text: 'The two new passwords do not match.' });
      return;
    }

    setChangingPassword(true);
    try {
      const response = await fetch('/api/auth/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        setPasswordMessage({ kind: 'error', text: data.error || 'The password could not be changed.' });
        return;
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMessage({
        kind: 'ok',
        text: 'Your password has been changed. Use the new one the next time you sign in.',
      });
      onNotify('Password updated.');
    } catch {
      setPasswordMessage({ kind: 'error', text: 'The server could not be reached. Please try again.' });
    } finally {
      setChangingPassword(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Signed-in teacher banner */}
      <div className="bg-gradient-to-r from-teresa-green-900 via-teresa-green-800 to-teresa-green-900 rounded-3xl p-6 text-white shadow-lg border border-teresa-gold-400/30">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teresa-gold-400/20 border border-teresa-gold-400/40 text-teresa-gold-300 text-xs font-bold uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              Class teacher&apos;s desk
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white">
              Welcome, {activeTeacher?.fullName || 'Class Teacher'}
            </h2>
            <p className="text-sm text-emerald-100/85">
              Staff ID: <span className="font-mono font-bold text-teresa-gold-300">{activeTeacher?.staffId}</span> • Primary Class:{' '}
              <span className="font-bold text-white">{activeTeacher?.assignedClass || 'All Classes'}</span> • Subjects:{' '}
              {activeTeacher?.subjects.join(', ')}
            </p>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/10 p-3.5 text-xs text-emerald-50">
            <p className="font-bold uppercase tracking-wider text-teresa-gold-300">Signed in</p>
            <p className="mt-1 font-semibold text-white">
              {currentUser?.fullName || activeTeacher?.fullName}
            </p>
            <p className="text-emerald-100/80">
              Staff number {currentUser?.staffId || activeTeacher?.staffId}
            </p>
          </div>
        </div>

        {/* Navigation Sub-Tabs for Teacher Tasks */}
        <div className="mt-6 pt-5 border-t border-white/15 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('results')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition ${
              activeTab === 'results'
                ? 'bg-teresa-gold-400 text-teresa-green-950 shadow-md'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            Assessment marks
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('feeding')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition ${
              activeTab === 'feeding'
                ? 'bg-teresa-gold-400 text-teresa-green-950 shadow-md'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Utensils className="w-4 h-4" />
            Daily feeding register
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition ${
              activeTab === 'reports'
                ? 'bg-teresa-gold-400 text-teresa-green-950 shadow-md'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Report cards
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition ${
              activeTab === 'profile'
                ? 'bg-teresa-gold-400 text-teresa-green-950 shadow-md'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            My account
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: ENTER STUDENT RESULTS                                          */}
      {/* ===================================================================== */}
      {activeTab === 'results' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 5 cols: Score Entry Form */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-teresa-green-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teresa-gold-700">
                  Continuous assessment and examination
                </span>
                <h3 className="text-xl font-serif font-bold text-teresa-green-950">
                  Enter a subject mark
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-teresa-green-50 flex items-center justify-center text-teresa-green-800">
                <ClipboardCheck className="w-5 h-5" />
              </div>
            </div>

            <form onSubmit={handleResultSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Filter Class
                  </label>
                  <select
                    value={resultClassFilter}
                    onChange={(e) => {
                      const cls = e.target.value;
                      setResultClassFilter(cls);
                      const firstStu =
                        cls === 'All'
                          ? state.students[0]
                          : state.students.find((s) => s.className === cls);
                      if (firstStu) setSelectedStudentId(firstStu.id);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium"
                  >
                    <option value="All">All Classes</option>
                    {Array.from(new Set(state.students.map((s) => s.className))).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Academic Term
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={state.currentSemester}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Select Student
                </label>
                <select
                  value={currentStudent?.id || ''}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-teresa-green-300 bg-teresa-green-50/50 text-sm font-bold text-teresa-green-950 focus:ring-2 focus:ring-teresa-green-600 focus:outline-none"
                >
                  {filteredResultStudents.map((stu) => (
                    <option key={stu.id} value={stu.id}>
                      {stu.fullName} ({stu.className} • {stu.studentCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => {
                    const subj = e.target.value;
                    setSelectedSubject(subj);
                    const existing = currentStudentResults.find((r) => r.subject === subj);
                    if (existing) {
                      setClassScore(existing.classScore);
                      setExamScore(existing.examScore);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-teresa-green-600 focus:outline-none"
                >
                  {SCHOOL_SUBJECTS.map((subj) => (
                    <option key={subj} value={subj}>
                      {subj}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Class Score (Max 30)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    step="0.5"
                    required
                    value={classScore}
                    onChange={(e) => setClassScore(Math.min(30, Math.max(0, Number(e.target.value))))}
                    className="mt-1.5 w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-lg font-bold text-teresa-green-950 focus:ring-2 focus:ring-teresa-green-600 focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Homework, tests & project (30%)
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Exam Score (Max 70)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={70}
                    step="0.5"
                    required
                    value={examScore}
                    onChange={(e) => setExamScore(Math.min(70, Math.max(0, Number(e.target.value))))}
                    className="mt-1.5 w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-lg font-bold text-teresa-green-950 focus:ring-2 focus:ring-teresa-green-600 focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    End-of-Semester Exam (70%)
                  </span>
                </div>
              </div>

              {/* Grade preview as marks are typed */}
              <div className="p-4 rounded-2xl bg-teresa-ivory border border-teresa-gold-300 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase text-slate-500">
                    Computed Total & Grade
                  </div>
                  <div className="text-sm font-semibold text-slate-800 mt-0.5">
                    Remark: <span className="font-bold text-teresa-green-900">{liveGradePreview.remark}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-2xl font-mono font-extrabold text-teresa-green-950">
                      {liveGradePreview.totalScore}%
                    </div>
                    <div className="text-[10px] uppercase text-slate-500">Out of 100</div>
                  </div>
                  <span
                    className={`px-3 py-1.5 rounded-xl text-sm font-extrabold border ${liveGradePreview.badgeColor}`}
                  >
                    {liveGradePreview.grade}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingResult}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teresa-green-800 to-teresa-green-700 hover:from-teresa-green-900 hover:to-teresa-green-800 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition"
              >
                <PlusCircle className="w-4 h-4 text-teresa-gold-300" />
                {submittingResult
                  ? 'Saving Score...'
                  : `Save ${selectedSubject} Result for ${currentStudent?.fullName.split(' ')[0]}`}
              </button>
            </form>
          </div>

          {/* Right 7 cols: Current Student's Entered Results & Quick Report Preview */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-teresa-green-100 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-teresa-green-700">
                    Student Academic Transcript ({currentStudent?.className})
                  </span>
                  <h3 className="text-xl font-serif font-bold text-teresa-green-950">
                    {currentStudent?.fullName} — Recorded Subject Scores
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('reports')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teresa-gold-100 hover:bg-teresa-gold-200 text-teresa-green-950 text-xs font-bold transition"
                >
                  <FileSpreadsheet className="w-4 h-4 text-teresa-gold-700" />
                  Open Full Semester Report Card
                </button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 text-xs uppercase">
                      <th className="py-3 px-4 font-bold">Subject</th>
                      <th className="py-3 px-3 text-center font-bold">Class (30)</th>
                      <th className="py-3 px-3 text-center font-bold">Exam (70)</th>
                      <th className="py-3 px-3 text-center font-bold">Total (100)</th>
                      <th className="py-3 px-3 text-center font-bold">Grade</th>
                      <th className="py-3 px-4 font-bold">Remark</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-sm">
                    {currentStudentResults.map((r) => {
                      const g = calculateGrade(r.classScore, r.examScore);
                      return (
                        <tr
                          key={r.id}
                          onClick={() => {
                            setSelectedSubject(r.subject);
                            setClassScore(r.classScore);
                            setExamScore(r.examScore);
                          }}
                          className="hover:bg-teresa-green-50/60 cursor-pointer transition"
                          title="Click to load this subject into the score editor"
                        >
                          <td className="py-3 px-4 font-bold text-slate-900">{r.subject}</td>
                          <td className="py-3 px-3 text-center font-mono">{r.classScore}</td>
                          <td className="py-3 px-3 text-center font-mono">{r.examScore}</td>
                          <td className="py-3 px-3 text-center font-mono font-extrabold text-teresa-green-900">
                            {r.totalScore}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${g.badgeColor}`}
                            >
                              {r.grade}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs font-medium text-slate-600">
                            {r.remark}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-2xl bg-teresa-green-50/70 border border-teresa-green-200 flex items-center justify-between text-xs text-teresa-green-900">
              <span>
                <strong>Tip:</strong> Select a subject row to load its marks in the editor on the left.
              </span>
              <span className="font-mono font-bold">
                {currentStudentResults.length} Subjects Recorded
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: DAILY FEEDING FEE COLLECTION BY STUDENT NAME & DATE            */}
      {/* ===================================================================== */}
      {activeTab === 'feeding' && (
        <div className="space-y-6">
          {/* Top KPI Summary Bar for Selected Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-teresa-green-100 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Selected Collection Date
                </div>
                <div className="text-xl font-mono font-extrabold text-teresa-green-950 mt-1">
                  {feedingDate}
                </div>
                <div className="text-xs text-teresa-green-700 font-medium mt-0.5">
                  Logged by {activeTeacher?.fullName}
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-teresa-green-50 flex items-center justify-center text-teresa-green-800">
                <Calendar className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-teresa-green-100 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Students Fed / Logged ({feedingDate})
                </div>
                <div className="text-2xl font-mono font-extrabold text-teresa-green-900 mt-1">
                  {filteredFeedingLogs.filter((l) => l.status === 'paid').length} Pupils
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Out of {state.students.length} enrolled pupils
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-teresa-gold-100 flex items-center justify-center text-teresa-gold-800">
                <Utensils className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-teresa-gold-300 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-teresa-gold-800">
                  Feeding Cash Collected ({feedingDate})
                </div>
                <div className="text-2xl font-mono font-extrabold text-teresa-green-950 mt-1">
                  {formatCurrency(totalCollectedOnSelectedDate)}
                </div>
                <div className="text-xs text-emerald-700 font-semibold mt-0.5">
                  Also recorded in the Bursary's fee ledger
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800">
                <Coins className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 5 cols: Log Daily Feeding Fee by Student Name & Date Form */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-teresa-green-100 p-6 shadow-sm">
              <div className="mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-teresa-gold-700">
                  Daily feeding register
                </span>
                <h3 className="text-xl font-serif font-bold text-teresa-green-950">
                  Feeding fee by pupil and date
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose a pupil and the date, and record the meal fee collected.
                </p>
              </div>

              <form onSubmit={handleLogDailyFeedingByForm} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Collection Date
                  </label>
                  <input
                    type="date"
                    required
                    value={feedingDate}
                    onChange={(e) => setFeedingDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm font-bold text-teresa-green-950 focus:ring-2 focus:ring-teresa-green-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Choose a pupil from the class list
                  </label>
                  <select
                    value={
                      state.students.some(
                        (s) =>
                          s.fullName.toLowerCase() ===
                          feedingStudentNameInput.trim().toLowerCase()
                      )
                        ? feedingStudentNameInput
                        : ''
                    }
                    onChange={(e) => {
                      if (e.target.value) handleSelectFeedingStudentName(e.target.value);
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-700 mb-2"
                  >
                    <option value="">-- Select from enrolled students --</option>
                    {state.students.map((stu) => {
                      const cf = state.classFeeStructures.find(
                        (c) => c.className === stu.className
                      );
                      return (
                        <option key={stu.id} value={stu.fullName}>
                          {stu.fullName} ({stu.className} • Daily Rate: GH₵{' '}
                          {cf?.dailyMealFee || 20})
                        </option>
                      );
                    })}
                  </select>

                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Student Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kwame Boateng Mensah"
                    value={feedingStudentNameInput}
                    onChange={(e) => handleSelectFeedingStudentName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-teresa-green-300 bg-teresa-green-50/40 text-sm font-bold text-teresa-green-950 focus:ring-2 focus:ring-teresa-green-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Daily Amount (GH₵)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="1"
                      required
                      value={feedingCustomAmount}
                      onChange={(e) => setFeedingCustomAmount(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Payment Status
                    </label>
                    <select
                      value={feedingStatusInput}
                      onChange={(e) => setFeedingStatusInput(e.target.value as FeedingStatus)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold"
                    >
                      <option value="paid">Paid</option>
                      <option value="exempt">Exempt / Prepaid</option>
                      <option value="unpaid">Unpaid / Absent</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Payment Method
                    </label>
                    <select
                      value={feedingPaymentMethod}
                      onChange={(e) =>
                        setFeedingPaymentMethod(
                          e.target.value as 'Cash' | 'Mobile Money' | 'Prepaid Meal Card'
                        )
                      }
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-medium"
                    >
                      <option value="Cash">Cash (In Class)</option>
                      <option value="Mobile Money">Mobile Money</option>
                      <option value="Prepaid Meal Card">Prepaid Meal Card</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Optional Note
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Morning assembly"
                      value={feedingNotes}
                      onChange={(e) => setFeedingNotes(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submittingFeeding}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teresa-green-800 to-teresa-green-700 hover:from-teresa-green-900 hover:to-teresa-green-800 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition"
                >
                  <Utensils className="w-4 h-4 text-teresa-gold-300" />
                  {submittingFeeding
                    ? 'Recording Collection...'
                    : `Log Feeding Fee for ${feedingDate}`}
                </button>
              </form>
            </div>

            {/* Right 7 cols: Interactive Class Roll-Call & Daily Feeding Log Table */}
            <div className="lg:col-span-7 space-y-6">
              {/* Quick Class Roll-Call Card */}
              <div className="bg-white rounded-3xl border border-teresa-green-100 p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-teresa-green-700">
                      1-Click Class Feeding Register ({feedingDate})
                    </span>
                    <h3 className="text-lg font-serif font-bold text-teresa-green-950">
                      Class roll-call for the day
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={feedingClassFilter}
                      onChange={(e) => setFeedingClassFilter(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold"
                    >
                      <option value="All">All classes</option>
                      {Array.from(new Set(state.students.map((s) => s.className))).map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>

                    {feedingClassFilter !== 'All' && (
                      <button
                        type="button"
                        onClick={() => handleBatchMarkClassPaid(feedingClassFilter)}
                        className="px-3 py-2 rounded-xl bg-teresa-gold-400 hover:bg-teresa-gold-500 text-teresa-green-950 text-xs font-bold transition"
                      >
                        Mark the whole of {feedingClassFilter} as paid
                      </button>
                    )}
                  </div>
                </div>

                {/* Search by Student Name */}
                <div className="relative mb-4">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search the register by name or class…"
                    value={feedingSearchQuery}
                    onChange={(e) => setFeedingSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teresa-green-600 focus:outline-none"
                  />
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200 max-h-80">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-slate-100 text-slate-700 text-xs uppercase">
                      <tr>
                        <th className="py-3 px-4 font-bold">Student Name</th>
                        <th className="py-3 px-3 font-bold">Class</th>
                        <th className="py-3 px-3 font-bold text-center">Date</th>
                        <th className="py-3 px-3 font-bold text-right">Rate</th>
                        <th className="py-3 px-3 font-bold text-center">Status ({feedingDate})</th>
                        <th className="py-3 px-4 font-bold text-right">Quick Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-sm">
                      {state.students
                        .filter((stu) => {
                          const matchesClass =
                            feedingClassFilter === 'All' ||
                            stu.className === feedingClassFilter;
                          const matchesSearch =
                            !feedingSearchQuery.trim() ||
                            stu.fullName
                              .toLowerCase()
                              .includes(feedingSearchQuery.trim().toLowerCase());
                          return matchesClass && matchesSearch;
                        })
                        .map((stu) => {
                          const existingLog = state.dailyFeedingLogs.find(
                            (l) =>
                              l.studentId === stu.id && l.collectionDate === feedingDate
                          );
                          const cf = state.classFeeStructures.find(
                            (c) => c.className === stu.className
                          );
                          const dailyRate = cf?.dailyMealFee || 20;

                          return (
                            <tr key={stu.id} className="hover:bg-slate-50">
                              <td className="py-2.5 px-4 font-bold text-slate-900">
                                {stu.fullName}
                              </td>
                              <td className="py-2.5 px-3 text-xs font-semibold text-slate-600">
                                {stu.className}
                              </td>
                              <td className="py-2.5 px-3 text-center font-mono text-xs text-slate-500">
                                {feedingDate}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-teresa-green-900">
                                GH₵ {dailyRate}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                {existingLog ? (
                                  <span
                                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                      existingLog.status === 'paid'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : existingLog.status === 'exempt'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-rose-100 text-rose-800'
                                    }`}
                                  >
                                    {existingLog.status.toUpperCase()} (GH₵ {existingLog.amount})
                                  </span>
                                ) : (
                                  <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                                    Not Logged
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-4 text-right">
                                <div className="inline-flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleQuickToggleStudentFeeding(
                                        stu.id,
                                        stu.fullName,
                                        stu.className,
                                        'paid'
                                      )
                                    }
                                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition"
                                  >
                                    Paid
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleQuickToggleStudentFeeding(
                                        stu.id,
                                        stu.fullName,
                                        stu.className,
                                        'unpaid'
                                      )
                                    }
                                    className="px-2 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition"
                                  >
                                    Unpaid
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Historical Daily Feeding Collection Log Table */}
              <div className="bg-white rounded-3xl border border-teresa-green-100 p-6 shadow-sm">
                <h4 className="text-sm font-bold uppercase tracking-wider text-teresa-green-900 mb-3">
                  Recorded Feeding Fee Collections for {feedingDate} ({filteredFeedingLogs.length} Entries)
                </h4>
                <div className="overflow-x-auto rounded-2xl border border-slate-200 max-h-60">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-teresa-green-900 text-white uppercase">
                      <tr>
                        <th className="py-2.5 px-3">Student Name</th>
                        <th className="py-2.5 px-3">Class</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Amount</th>
                        <th className="py-2.5 px-3">Method</th>
                        <th className="py-2.5 px-3">Logged By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredFeedingLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-bold text-slate-900">
                            {log.studentName}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">{log.className}</td>
                          <td className="py-2.5 px-3 font-mono">{log.collectionDate}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-emerald-800">
                            {formatCurrency(log.amount)}
                          </td>
                          <td className="py-2.5 px-3">{log.paymentMethod}</td>
                          <td className="py-2.5 px-3 text-slate-500">{log.loggedByTeacher}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: GENERATE END-OF-SEMESTER REPORTS                               */}
      {/* ===================================================================== */}
      {activeTab === 'reports' && (
        <ReportCardGenerator
          state={state}
          activeRole="teacher"
          actorName={activeTeacher?.fullName || 'Mr. Emmanuel Osei-Tutu'}
          initialStudentId={selectedStudentId}
          onStateChange={onStateChange}
          onNotify={onNotify}
        />
      )}

      {/* ===================================================================== */}
      {/* TAB 4: MY ACCOUNT                                                     */}
      {/* ===================================================================== */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white rounded-2xl border border-teresa-green-100 p-6 shadow-sm">
            <h3 className="font-serif text-xl font-bold text-teresa-green-950">My staff record</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wider text-slate-500">Name</dt>
                <dd className="font-semibold text-slate-900">
                  {activeTeacher?.fullName || currentUser?.fullName}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-slate-500">Staff number</dt>
                <dd className="font-mono text-slate-800">
                  {activeTeacher?.staffId || currentUser?.staffId}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-slate-500">Email</dt>
                <dd className="text-slate-800">{activeTeacher?.email || currentUser?.email}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-slate-500">Class</dt>
                <dd className="text-slate-800">{activeTeacher?.assignedClass || 'Not assigned'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-slate-500">Subjects</dt>
                <dd className="text-slate-800">{activeTeacher?.subjects.join(', ') || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-slate-500">Qualification</dt>
                <dd className="text-slate-800">{activeTeacher?.qualification || '—'}</dd>
              </div>
            </dl>
            <p className="mt-5 border-t border-slate-100 pt-4 text-xs leading-relaxed text-slate-500">
              Corrections to your name, class or subjects are made by the Headmaster from the
              administration portal.
            </p>
          </div>

          <div className="lg:col-span-7 bg-white rounded-2xl border border-teresa-green-100 p-6 shadow-sm">
            <h3 className="font-serif text-xl font-bold text-teresa-green-950">Change my password</h3>
            <p className="mt-1 text-sm text-slate-600">
              Passwords must be at least eight characters long and contain a letter and a number.
            </p>

            <form onSubmit={handlePasswordChange} className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                  Current password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-teresa-green-700 focus:ring-2 focus:ring-teresa-green-100"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                    New password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-teresa-green-700 focus:ring-2 focus:ring-teresa-green-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                    Repeat new password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-teresa-green-700 focus:ring-2 focus:ring-teresa-green-100"
                  />
                </div>
              </div>

              {passwordMessage && (
                <p
                  className={`rounded-md border px-3.5 py-2.5 text-sm ${
                    passwordMessage.kind === 'ok'
                      ? 'border-teresa-green-200 bg-teresa-green-50 text-teresa-green-900'
                      : 'border-rose-200 bg-rose-50 text-rose-800'
                  }`}
                >
                  {passwordMessage.text}
                </p>
              )}

              <button
                type="submit"
                disabled={changingPassword}
                className="rounded-md bg-teresa-green-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teresa-green-900 disabled:opacity-60"
              >
                {changingPassword ? 'Saving…' : 'Change password'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
