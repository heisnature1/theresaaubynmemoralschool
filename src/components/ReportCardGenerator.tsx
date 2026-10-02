'use client';

import React, { useMemo, useState } from 'react';
import {
  Award,
  CheckCircle2,
  Download,
  Edit3,
  FileCheck2,
  GraduationCap,
  Printer,
  Save,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import {
  ClassFeeStructure,
  DailyFeedingLog,
  SchoolStateSnapshot,
  StudentRecord,
  SubjectResult,
  UserRole,
} from '@/types/school';
import { calculateGrade, formatCurrency, formatOrdinal } from '@/lib/grading';
import { SchoolCrest } from './SchoolCrest';

interface ReportCardGeneratorProps {
  state: SchoolStateSnapshot;
  activeRole: UserRole;
  actorName: string;
  initialStudentId?: string;
  onStateChange: (newState: SchoolStateSnapshot) => void;
  onNotify: (msg: string, type?: 'success' | 'info') => void;
}

export function ReportCardGenerator({
  state,
  activeRole,
  actorName,
  initialStudentId,
  onStateChange,
  onNotify,
}: ReportCardGeneratorProps) {
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialStudentId || state.students[0]?.id || 'stu-1'
  );
  const [isEditingRemarks, setIsEditingRemarks] = useState(false);
  const [saving, setSaving] = useState(false);

  const filteredStudents = useMemo(() => {
    if (selectedClass === 'All') return state.students;
    return state.students.filter((s) => s.className === selectedClass);
  }, [state.students, selectedClass]);

  const currentStudent: StudentRecord | undefined = useMemo(() => {
    const found = filteredStudents.find((s) => s.id === selectedStudentId);
    return found || filteredStudents[0] || state.students[0];
  }, [filteredStudents, selectedStudentId, state.students]);

  const [teacherRemarkDraft, setTeacherRemarkDraft] = useState(
    currentStudent?.teacherRemark || ''
  );
  const [headmasterRemarkDraft, setHeadmasterRemarkDraft] = useState(
    currentStudent?.headmasterRemark || ''
  );
  const [conductDraft, setConductDraft] = useState(currentStudent?.conduct || '');
  const [talentDraft, setTalentDraft] = useState(currentStudent?.interestTalent || '');
  const [attendancePresentDraft, setAttendancePresentDraft] = useState(
    currentStudent?.attendancePresent || 64
  );

  // Sync draft fields when student changes
  React.useEffect(() => {
    if (currentStudent) {
      setTeacherRemarkDraft(currentStudent.teacherRemark);
      setHeadmasterRemarkDraft(currentStudent.headmasterRemark);
      setConductDraft(currentStudent.conduct);
      setTalentDraft(currentStudent.interestTalent);
      setAttendancePresentDraft(currentStudent.attendancePresent);
    }
  }, [currentStudent]);

  const studentResults: SubjectResult[] = useMemo(() => {
    if (!currentStudent) return [];
    return state.academicResults.filter((r) => r.studentId === currentStudent.id);
  }, [state.academicResults, currentStudent]);

  const classFeeStructure: ClassFeeStructure | undefined = useMemo(() => {
    if (!currentStudent) return undefined;
    return state.classFeeStructures.find((c) => c.className === currentStudent.className);
  }, [state.classFeeStructures, currentStudent]);

  const studentFeedingLogs: DailyFeedingLog[] = useMemo(() => {
    if (!currentStudent) return [];
    return state.dailyFeedingLogs.filter(
      (f) => f.studentId === currentStudent.id && f.status === 'paid'
    );
  }, [state.dailyFeedingLogs, currentStudent]);

  // Calculate student's average & class rank
  const academicSummary = useMemo(() => {
    if (!currentStudent) {
      return {
        totalObtained: 0,
        maxPossible: 0,
        averageScore: 0,
        overallGrade: 'A1',
        overallRemark: 'Excellent',
        classPosition: '1st',
        classSize: 1,
      };
    }

    const totalObtained = studentResults.reduce((acc, r) => acc + r.totalScore, 0);
    const maxPossible = studentResults.length * 100;
    const averageScore =
      studentResults.length > 0
        ? Math.round((totalObtained / studentResults.length) * 10) / 10
        : 0;

    // Compute rank among classmates
    const classmates = state.students.filter((s) => s.className === currentStudent.className);
    const ranked = classmates
      .map((mate) => {
        const mateRes = state.academicResults.filter((r) => r.studentId === mate.id);
        const avg =
          mateRes.length > 0
            ? mateRes.reduce((sum, r) => sum + r.totalScore, 0) / mateRes.length
            : 0;
        return { id: mate.id, avg };
      })
      .sort((a, b) => b.avg - a.avg);

    const posIndex = ranked.findIndex((r) => r.id === currentStudent.id);
    const classPosition = formatOrdinal(posIndex >= 0 ? posIndex + 1 : 1);

    const overallEval = calculateGrade(
      Math.min(30, averageScore * 0.3),
      Math.min(70, averageScore * 0.7)
    );

    return {
      totalObtained: Math.round(totalObtained * 10) / 10,
      maxPossible,
      averageScore,
      overallGrade: overallEval.grade,
      overallRemark: overallEval.remark,
      classPosition,
      classSize: classmates.length,
    };
  }, [currentStudent, studentResults, state.students, state.academicResults]);

  async function handleSaveReportRemarks(e: React.FormEvent) {
    e.preventDefault();
    if (!currentStudent) return;
    setSaving(true);
    try {
      const res = await fetch('/api/results', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: currentStudent.id,
          teacherRemark: teacherRemarkDraft,
          headmasterRemark: headmasterRemarkDraft,
          conduct: conductDraft,
          interestTalent: talentDraft,
          attendancePresent: attendancePresentDraft,
          reportEndorsed: true,
          actorName,
          actorRole: activeRole,
        }),
      });
      const data = await res.json();
      if (data.ok && data.state) {
        onStateChange(data.state);
        setIsEditingRemarks(false);
        onNotify(`Updated End-of-Semester Report remarks for ${currentStudent.fullName}.`);
      }
    } finally {
      setSaving(false);
    }
  }

  function handleExportCSV() {
    if (!currentStudent) return;
    const rows = [
      ['St. Teresa Aubyn Memorial School - End of Semester Report'],
      ['Student Name', currentStudent.fullName],
      ['Student ID', currentStudent.studentCode],
      ['Class', currentStudent.className],
      ['Semester', state.currentSemester],
      ['Average Score', `${academicSummary.averageScore}%`],
      ['Class Position', `${academicSummary.classPosition} of ${academicSummary.classSize}`],
      [],
      ['Subject', 'Class Score (30)', 'Exam Score (70)', 'Total Score (100)', 'Grade', 'Remark', 'Teacher'],
      ...studentResults.map((r) => [
        r.subject,
        String(r.classScore),
        String(r.examScore),
        String(r.totalScore),
        r.grade,
        r.remark,
        r.enteredBy,
      ]),
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      rows.map((e) => e.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `${currentStudent.fullName.replace(/\s+/g, '_')}_Semester_Report.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onNotify(`Downloaded CSV report for ${currentStudent.fullName}`, 'info');
  }

  if (!currentStudent) {
    return null;
  }

  const tuitionBill = classFeeStructure?.tuitionFee || 1600;
  const extraBill = classFeeStructure?.extraClassesFee || 350;
  const tuitionBalance = Math.max(0, tuitionBill - currentStudent.tuitionPaid);
  const extraBalance = Math.max(0, extraBill - currentStudent.extraClassesPaid);

  return (
    <div className="space-y-6">
      {/* Control Toolbar (hidden when printing) */}
      <div className="bg-white rounded-2xl border border-teresa-green-100 p-5 shadow-sm print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teresa-gold-100 text-teresa-gold-900 text-xs font-semibold mb-1">
              <FileCheck2 className="w-3.5 h-3.5 text-teresa-gold-700" />
              Official End-of-Semester Terminal Report Engine
            </div>
            <h3 className="text-xl font-serif font-bold text-teresa-green-950">
              Generate & Print Student Semester Report Cards
            </h3>
            <p className="text-sm text-slate-600">
              Combines continuous class assessments (30%), semester exams (70%), attendance, fee clearance, and official remarks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter by Class */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Filter Class
              </label>
              <select
                value={selectedClass}
                onChange={(e) => {
                  const cls = e.target.value;
                  setSelectedClass(cls);
                  const firstInClass =
                    cls === 'All'
                      ? state.students[0]
                      : state.students.find((s) => s.className === cls);
                  if (firstInClass) setSelectedStudentId(firstInClass.id);
                }}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teresa-green-600"
              >
                <option value="All">All Classes ({state.students.length})</option>
                {Array.from(new Set(state.students.map((s) => s.className))).map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            {/* Select Student */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Select Student
              </label>
              <select
                value={currentStudent.id}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-teresa-green-300 bg-teresa-green-50/60 text-sm font-semibold text-teresa-green-950 focus:outline-none focus:ring-2 focus:ring-teresa-green-600"
              >
                {filteredStudents.map((stu) => (
                  <option key={stu.id} value={stu.id}>
                    {stu.fullName} — ({stu.className} • {stu.studentCode})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 pt-5">
              <button
                type="button"
                onClick={() => setIsEditingRemarks(!isEditingRemarks)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-teresa-green-700 text-teresa-green-800 hover:bg-teresa-green-50 text-sm font-semibold transition"
              >
                <Edit3 className="w-4 h-4" />
                {isEditingRemarks ? 'Close Editor' : 'Edit Remarks'}
              </button>

              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-semibold transition"
              >
                <Download className="w-4 h-4" />
                CSV
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teresa-green-800 to-teresa-green-700 text-white hover:from-teresa-green-900 hover:to-teresa-green-800 text-sm font-semibold shadow-sm transition"
              >
                <Printer className="w-4 h-4 text-teresa-gold-300" />
                Print Report Card
              </button>
            </div>
          </div>
        </div>

        {/* Optional Quick Editor for Remarks & Attendance */}
        {isEditingRemarks && (
          <form
            onSubmit={handleSaveReportRemarks}
            className="mt-5 pt-5 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4 bg-teresa-ivory/70 p-4 rounded-xl"
          >
            <div>
              <label className="block text-xs font-bold text-teresa-green-900 uppercase mb-1">
                Class Teacher&apos;s Official Remark
              </label>
              <textarea
                rows={2}
                value={teacherRemarkDraft}
                onChange={(e) => setTeacherRemarkDraft(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-teresa-green-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-teresa-green-900 uppercase mb-1">
                Headmaster&apos;s Official Remark
              </label>
              <textarea
                rows={2}
                value={headmasterRemarkDraft}
                onChange={(e) => setHeadmasterRemarkDraft(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-teresa-green-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-3 md:col-span-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Conduct & Character
                </label>
                <input
                  type="text"
                  value={conductDraft}
                  onChange={(e) => setConductDraft(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Interest & Talent
                </label>
                <input
                  type="text"
                  value={talentDraft}
                  onChange={(e) => setTalentDraft(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Days Present (Out of {currentStudent.attendanceTotal})
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={currentStudent.attendanceTotal}
                    value={attendancePresentDraft}
                    onChange={(e) => setAttendancePresentDraft(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                  />
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teresa-gold-500 hover:bg-teresa-gold-600 text-teresa-green-950 font-bold text-sm whitespace-nowrap transition"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Report'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* ===================================================================== */}
      {/* OFFICIAL PRINTABLE TERMINAL REPORT SHEET                              */}
      {/* ===================================================================== */}
      <div className="bg-white rounded-3xl border-2 border-teresa-gold-400 shadow-xl overflow-hidden print:shadow-none print:border-2 print:rounded-none">
        {/* Top Ornamental Header Banner */}
        <div className="bg-gradient-to-r from-teresa-green-950 via-teresa-green-900 to-teresa-green-950 text-white px-6 py-6 border-b-4 border-teresa-gold-400 relative">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <SchoolCrest size="lg" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-[0.2em] text-teresa-gold-300 font-semibold">
                    Republic of Ghana • Directorate of Education
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-white">
                  ST. TERESA AUBYN MEMORIAL SCHOOL
                </h2>
                <p className="text-xs md:text-sm text-teresa-gold-200 italic font-serif">
                  &ldquo;Per Ardua Ad Astra — Through Diligence to the Stars&rdquo;
                </p>
                <p className="text-xs text-emerald-100/80 mt-1">
                  P.O. Box TA 188, Heritage Hill Avenue • Tel: +233 24 410 0888 • info@stteresa-aubyn.edu.gh
                </p>
              </div>
            </div>

            <div className="text-center md:text-right bg-white/10 backdrop-blur-sm border border-teresa-gold-400/40 rounded-2xl px-4 py-3">
              <div className="text-[11px] uppercase tracking-widest text-teresa-gold-300 font-bold">
                Official Terminal Report
              </div>
              <div className="text-base font-bold text-white mt-0.5">{state.currentSemester}</div>
              <div className="text-xs text-emerald-200 mt-0.5">
                Student ID: <span className="font-mono font-bold text-teresa-gold-300">{currentStudent.studentCode}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Student Bio & Academic Snapshot Bar */}
        <div className="p-6 bg-teresa-ivory/80 border-b border-teresa-gold-200">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Pupil / Student Name
              </div>
              <div className="text-sm font-bold text-teresa-green-950 mt-0.5">
                {currentStudent.fullName}
              </div>
              <div className="text-xs text-slate-500">{currentStudent.gender}</div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Class & Stream
              </div>
              <div className="text-sm font-bold text-teresa-green-950 mt-0.5">
                {currentStudent.className}
              </div>
              <div className="text-xs text-teresa-green-700 font-medium">
                {classFeeStructure?.department || 'Academic Stream'}
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Semester Average
              </div>
              <div className="text-lg font-mono font-extrabold text-teresa-green-800 mt-0.5">
                {academicSummary.averageScore}%
              </div>
              <div className="text-xs font-semibold text-teresa-gold-700">
                Grade {academicSummary.overallGrade} ({academicSummary.overallRemark})
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Position in Class
              </div>
              <div className="text-lg font-serif font-extrabold text-teresa-gold-700 mt-0.5">
                {academicSummary.classPosition}
              </div>
              <div className="text-xs text-slate-500">
                Roll: {academicSummary.classSize} Pupils in {currentStudent.className}
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Attendance Record
              </div>
              <div className="text-sm font-mono font-bold text-slate-900 mt-0.5">
                {currentStudent.attendancePresent} / {currentStudent.attendanceTotal} Days
              </div>
              <div className="text-xs text-emerald-700 font-medium">
                {Math.round(
                  (currentStudent.attendancePresent / currentStudent.attendanceTotal) * 100
                )}
                % Punctuality
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Next Term Re-Opening
              </div>
              <div className="text-sm font-bold text-teresa-green-950 mt-0.5">
                {state.nextSemesterReopening}
              </div>
              <div className="text-xs text-slate-500">Parent: {currentStudent.guardianName}</div>
            </div>
          </div>
        </div>

        {/* Subject Performance Table */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-teresa-green-900 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-teresa-gold-600" />
              Continuous Assessment (30%) & End-of-Semester Examination (70%) Breakdown
            </h4>
            <span className="text-xs font-mono text-slate-500">
              Total Marks: {academicSummary.totalObtained} / {academicSummary.maxPossible}
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-teresa-green-900 text-white text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-semibold">Subject</th>
                  <th className="py-3.5 px-3 font-semibold text-center">Class Score (30%)</th>
                  <th className="py-3.5 px-3 font-semibold text-center">Exam Score (70%)</th>
                  <th className="py-3.5 px-3 font-semibold text-center">Total (100%)</th>
                  <th className="py-3.5 px-3 font-semibold text-center">Grade</th>
                  <th className="py-3.5 px-4 font-semibold">Proficiency Remark</th>
                  <th className="py-3.5 px-4 font-semibold">Subject Teacher</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {studentResults.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No subject scores entered yet for {currentStudent.fullName}. Use the Teacher Portal to enter scores.
                    </td>
                  </tr>
                ) : (
                  studentResults.map((res, idx) => {
                    const gradeMeta = calculateGrade(res.classScore, res.examScore);
                    return (
                      <tr
                        key={res.id}
                        className={idx % 2 === 0 ? 'bg-white' : 'bg-teresa-ivory/50'}
                      >
                        <td className="py-3 px-4 font-bold text-slate-900">{res.subject}</td>
                        <td className="py-3 px-3 text-center font-mono text-slate-700">
                          {res.classScore}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-slate-700">
                          {res.examScore}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-extrabold text-teresa-green-900">
                          {res.totalScore}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${gradeMeta.badgeColor}`}
                          >
                            {res.grade}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-700">{res.remark}</td>
                        <td className="py-3 px-4 text-xs text-slate-500">{res.enteredBy}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {studentResults.length > 0 && (
                <tfoot>
                  <tr className="bg-teresa-gold-50 border-t-2 border-teresa-gold-300 font-bold text-teresa-green-950 text-sm">
                    <td className="py-3.5 px-4">SEMESTER AGGREGATE & AVERAGE</td>
                    <td className="py-3.5 px-3 text-center font-mono">
                      {studentResults.reduce((s, r) => s + r.classScore, 0)}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono">
                      {studentResults.reduce((s, r) => s + r.examScore, 0)}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono text-base text-teresa-green-900">
                      {academicSummary.totalObtained} / {academicSummary.maxPossible} (
                      {academicSummary.averageScore}%)
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="inline-flex px-2.5 py-0.5 rounded-full bg-teresa-green-900 text-teresa-gold-300 text-xs font-bold">
                        {academicSummary.overallGrade}
                      </span>
                    </td>
                    <td colSpan={2} className="py-3.5 px-4 text-teresa-green-900">
                      Overall Standing: {academicSummary.overallRemark} ({academicSummary.classPosition} in {currentStudent.className})
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* Grading Key Legend */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
            <span className="font-bold text-slate-700">Grading Scale:</span>
            <span className="px-2 py-0.5 rounded bg-slate-100">80–100%: A1 (Excellent)</span>
            <span className="px-2 py-0.5 rounded bg-slate-100">75–79%: B2 (Very Good)</span>
            <span className="px-2 py-0.5 rounded bg-slate-100">70–74%: B3 (Good)</span>
            <span className="px-2 py-0.5 rounded bg-slate-100">55–69%: C4–C6 (Credit)</span>
            <span className="px-2 py-0.5 rounded bg-slate-100">45–54%: D7–E8 (Pass)</span>
            <span className="px-2 py-0.5 rounded bg-slate-100">0–44%: F9 (Needs Remediation)</span>
          </div>
        </div>

        {/* Financial Clearance & Next Semester Fee Bill + Character Evaluation */}
        <div className="px-6 pb-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 cols: Conduct, Teacher Remark, Headmaster Remark */}
          <div className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs font-bold uppercase text-slate-400">
                  Conduct & Character Assessment
                </div>
                <div className="text-sm font-semibold text-slate-800 mt-1 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-teresa-gold-600 shrink-0" />
                  {currentStudent.conduct}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs font-bold uppercase text-slate-400">
                  Co-Curricular Interest & Talent
                </div>
                <div className="text-sm font-semibold text-slate-800 mt-1 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-teresa-green-700 shrink-0" />
                  {currentStudent.interestTalent}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-teresa-green-50/70 border border-teresa-green-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-teresa-green-900 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-teresa-green-700" />
                  Class Teacher&apos;s Terminal Remark ({classFeeStructure?.classTeacher || 'Class Teacher'})
                </span>
              </div>
              <p className="text-sm text-slate-800 italic">
                &ldquo;{currentStudent.teacherRemark}&rdquo;
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-teresa-gold-50/80 border border-teresa-gold-300">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-teresa-gold-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-teresa-gold-700" />
                  Headmaster&apos;s Official Endorsement (Rev. Fr. Bernard Kweku Arthur, M.Ed.)
                </span>
                {currentStudent.reportEndorsed && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    Endorsed & Sealed
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-900 font-medium italic">
                &ldquo;{currentStudent.headmasterRemark}&rdquo;
              </p>
            </div>
          </div>

          {/* Right 5 cols: Financial Clearance & Next Semester Fee Bill */}
          <div className="lg:col-span-5 bg-teresa-ivory rounded-2xl border border-teresa-gold-300 p-4 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-teresa-green-900 mb-3 flex items-center justify-between">
                <span>Bursary & Feeding Clearance ({currentStudent.className})</span>
                <span className="px-2 py-0.5 rounded bg-teresa-gold-200 text-teresa-green-950 text-[10px]">
                  Headmaster Approved Rates
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-200">
                  <span className="text-slate-600">Class Tuition Fee ({currentStudent.className}):</span>
                  <span className="font-mono font-bold text-slate-900">
                    Paid {formatCurrency(currentStudent.tuitionPaid)} / {formatCurrency(tuitionBill)}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-slate-200">
                  <span className="text-slate-600">Extra Classes Fee:</span>
                  <span className="font-mono font-bold text-slate-900">
                    Paid {formatCurrency(currentStudent.extraClassesPaid)} / {formatCurrency(extraBill)}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-slate-200">
                  <span className="text-slate-600">Daily Feeding Rate ({currentStudent.className}):</span>
                  <span className="font-mono font-semibold text-teresa-green-800">
                    {formatCurrency(classFeeStructure?.dailyMealFee || 20)} / day ({studentFeedingLogs.length} days logged)
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5">
                  <span className="font-bold text-slate-800">Current Arrears / Balance:</span>
                  <span
                    className={`font-mono font-extrabold ${
                      tuitionBalance + extraBalance === 0
                        ? 'text-emerald-700'
                        : 'text-amber-700'
                    }`}
                  >
                    {tuitionBalance + extraBalance === 0
                      ? 'GH₵ 0.00 (FULLY CLEARED)'
                      : formatCurrency(tuitionBalance + extraBalance)}
                  </span>
                </div>
              </div>
            </div>

            {/* Signatures Footer */}
            <div className="mt-4 pt-3 border-t border-dashed border-teresa-gold-400 grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="font-serif italic text-sm text-teresa-green-800">
                  {classFeeStructure?.classTeacher || 'M. Osei-Tutu'}
                </div>
                <div className="border-t border-slate-300 mt-1 pt-1 text-[10px] uppercase tracking-wider text-slate-500">
                  Class Teacher Signature
                </div>
              </div>
              <div>
                <div className="font-serif italic text-sm text-teresa-gold-800 font-bold">
                  Rev. Fr. B. K. Arthur
                </div>
                <div className="border-t border-slate-300 mt-1 pt-1 text-[10px] uppercase tracking-wider text-slate-500">
                  Headmaster&apos;s Stamp & Signature
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
