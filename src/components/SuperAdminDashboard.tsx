'use client';

import React, { useMemo, useState } from 'react';
import {
  Activity,
  Award,
  BarChart3,
  CheckCircle2,
  Cloud,
  Coins,
  Copy,
  Database,
  Eye,
  FileSpreadsheet,
  GraduationCap,
  Layers,
  Mail,
  PlusCircle,
  RefreshCw,
  Shield,
  Sparkles,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
  Utensils,
} from 'lucide-react';
import { SchoolStateSnapshot } from '@/types/school';
import { formatCurrency, SCHOOL_CLASSES } from '@/lib/grading';
import { ReportCardGenerator } from './ReportCardGenerator';

interface SuperAdminDashboardProps {
  state: SchoolStateSnapshot;
  onStateChange: (newState: SchoolStateSnapshot) => void;
  onNotify: (msg: string, type?: 'success' | 'info') => void;
  onSwitchRole?: (role: 'super_admin' | 'headmaster' | 'teacher') => void;
}

export function SuperAdminDashboard({
  state,
  onStateChange,
  onNotify,
  onSwitchRole,
}: SuperAdminDashboardProps) {
  const owner = useMemo(
    () =>
      state.staff.find((s) => s.role === 'super_admin') || {
        fullName: 'Dr. Lady Victoria Aubyn-Donkor',
        staffId: 'STA-OWN-001',
      },
    [state.staff]
  );

  const [activeTab, setActiveTab] = useState<
    'overview' | 'finances' | 'directory' | 'reports' | 'cloud'
  >('overview');

  // New Student Enrollment state
  const [stuName, setStuName] = useState('');
  const [stuGender, setStuGender] = useState<'Male' | 'Female'>('Female');
  const [stuClass, setStuClass] = useState('Basic 4');
  const [stuGuardian, setStuGuardian] = useState('');
  const [stuPhone, setStuPhone] = useState('');
  const [enrolling, setEnrolling] = useState(false);

  // Executive KPIs across the entire school
  const metrics = useMemo(() => {
    const totalTuitionPaid = state.students.reduce((s, stu) => s + stu.tuitionPaid, 0);
    const totalExtraPaid = state.students.reduce(
      (s, stu) => s + stu.extraClassesPaid,
      0
    );
    const totalMealPrepaid = state.students.reduce((s, stu) => s + stu.mealFeePaid, 0);
    const totalDailyFeedingCash = state.dailyFeedingLogs
      .filter((l) => l.status === 'paid')
      .reduce((s, l) => s + l.amount, 0);

    const totalRevenue =
      totalTuitionPaid + totalExtraPaid + totalMealPrepaid + totalDailyFeedingCash;

    const avgAcademicScore =
      state.academicResults.length > 0
        ? Math.round(
            (state.academicResults.reduce((s, r) => s + r.totalScore, 0) /
              state.academicResults.length) *
              10
          ) / 10
        : 0;

    const pendingTeachers = state.teacherRegistrations.filter(
      (r) => r.status === 'pending'
    ).length;

    return {
      totalTuitionPaid,
      totalExtraPaid,
      totalMealPrepaid,
      totalDailyFeedingCash,
      totalRevenue,
      avgAcademicScore,
      pendingTeachers,
    };
  }, [
    state.students,
    state.dailyFeedingLogs,
    state.academicResults,
    state.teacherRegistrations,
  ]);

  async function handleEnrollStudent(e: React.FormEvent) {
    e.preventDefault();
    if (!stuName.trim() || !stuGuardian.trim()) return;
    setEnrolling(true);
    try {
      const res = await fetch('/api/school', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_student',
          fullName: stuName,
          gender: stuGender,
          className: stuClass,
          guardianName: stuGuardian,
          guardianPhone: stuPhone,
          actorName: owner.fullName,
          actorRole: 'super_admin',
        }),
      });
      const data = await res.json();
      if (data.ok && data.state) {
        onStateChange(data.state);
        setStuName('');
        setStuGuardian('');
        setStuPhone('');
        onNotify(
          `Enrolled ${data.student.fullName} (${data.student.studentCode}) into ${data.student.className}!`
        );
      }
    } finally {
      setEnrolling(false);
    }
  }

  async function handleOwnerApproveTeacher(regId: string, decision: 'approved' | 'rejected') {
    const res = await fetch('/api/teachers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        registrationId: regId,
        status: decision,
        actorName: `${owner.fullName} (Owner Override)`,
        actorRole: 'super_admin',
      }),
    });
    const data = await res.json();
    if (data.ok && data.state) {
      onStateChange(data.state);
      onNotify(`Owner ${decision} teacher registration request.`);
    }
  }

  async function handleResetDemoState() {
    const res = await fetch('/api/school', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset' }),
    });
    const data = await res.json();
    if (data.ok && data.state) {
      onStateChange(data.state);
      onNotify('Reset school database to initial seed state.', 'info');
    }
  }

  return (
    <div className="space-y-6">
      {/* Super Admin Executive Header Banner */}
      <div className="bg-gradient-to-r from-teresa-green-950 via-teresa-green-900 to-teresa-green-950 rounded-3xl p-6 text-white shadow-xl border-2 border-teresa-gold-400/50 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teresa-gold-400 text-teresa-green-950 text-xs font-extrabold uppercase tracking-wider">
              <Eye className="w-3.5 h-3.5" />
              Super Admin • School Owner Full Visibility Suite
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white">
              {owner.fullName}
            </h2>
            <p className="text-sm text-emerald-100/85">
              Executive Proprietor & Chair of Council • Complete real-time visibility across Headmaster Bursary, Teacher Portals, Daily Feeding, & Academic Reports
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {onSwitchRole && (
              <>
                <button
                  type="button"
                  onClick={() => onSwitchRole('headmaster')}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-teresa-gold-200 transition"
                >
                  Inspect Headmaster View →
                </button>
                <button
                  type="button"
                  onClick={() => onSwitchRole('teacher')}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-teresa-gold-200 transition"
                >
                  Inspect Teacher View →
                </button>
              </>
            )}
            <button
              type="button"
              onClick={handleResetDemoState}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teresa-gold-400/20 hover:bg-teresa-gold-400/30 border border-teresa-gold-400/40 text-xs font-bold text-teresa-gold-300 transition"
              title="Reset demo state"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Seed Data
            </button>
          </div>
        </div>

        {/* Top-Level Full Visibility KPI Cards */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3.5 border border-teresa-gold-400/30">
            <div className="text-[10px] uppercase tracking-wider text-teresa-gold-300 font-bold">
              Total Gross Revenue
            </div>
            <div className="text-lg font-mono font-extrabold text-white mt-0.5">
              {formatCurrency(metrics.totalRevenue)}
            </div>
            <div className="text-[11px] text-emerald-300">All Fee Streams</div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3.5 border border-white/15">
            <div className="text-[10px] uppercase tracking-wider text-emerald-200 font-bold">
              Class Tuition Paid
            </div>
            <div className="text-lg font-mono font-extrabold text-white mt-0.5">
              {formatCurrency(metrics.totalTuitionPaid)}
            </div>
            <div className="text-[11px] text-emerald-200/80">11 Class Streams</div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3.5 border border-white/15">
            <div className="text-[10px] uppercase tracking-wider text-emerald-200 font-bold">
              Extra Classes Revenue
            </div>
            <div className="text-lg font-mono font-extrabold text-teresa-gold-300 mt-0.5">
              {formatCurrency(metrics.totalExtraPaid)}
            </div>
            <div className="text-[11px] text-emerald-200/80">Afternoon Prep</div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3.5 border border-white/15">
            <div className="text-[10px] uppercase tracking-wider text-emerald-200 font-bold">
              Daily Feeding + Meal Plan
            </div>
            <div className="text-lg font-mono font-extrabold text-white mt-0.5">
              {formatCurrency(metrics.totalMealPrepaid + metrics.totalDailyFeedingCash)}
            </div>
            <div className="text-[11px] text-teresa-gold-300">
              Daily Logs: {formatCurrency(metrics.totalDailyFeedingCash)}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3.5 border border-white/15">
            <div className="text-[10px] uppercase tracking-wider text-emerald-200 font-bold">
              School Academic Index
            </div>
            <div className="text-lg font-mono font-extrabold text-white mt-0.5">
              {metrics.avgAcademicScore}% Avg
            </div>
            <div className="text-[11px] text-emerald-300">
              {state.academicResults.length} Graded Entries
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3.5 border border-white/15">
            <div className="text-[10px] uppercase tracking-wider text-emerald-200 font-bold">
              Staff & Teacher Queue
            </div>
            <div className="text-lg font-mono font-extrabold text-white mt-0.5">
              {state.staff.length} Active Staff
            </div>
            <div className="text-[11px] text-teresa-gold-300">
              {metrics.pendingTeachers} Pending Sign-Ups
            </div>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="mt-6 pt-5 border-t border-white/15 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition ${
              activeTab === 'overview'
                ? 'bg-teresa-gold-400 text-teresa-green-950 shadow-md'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            1. Executive Full-Visibility Matrix & Audit Log
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('finances')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition ${
              activeTab === 'finances'
                ? 'bg-teresa-gold-400 text-teresa-green-950 shadow-md'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Coins className="w-4 h-4" />
            2. All Fee Ledgers & Daily Feeding Collections
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('directory')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition ${
              activeTab === 'directory'
                ? 'bg-teresa-gold-400 text-teresa-green-950 shadow-md'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Users className="w-4 h-4" />
            3. Students, Faculty & Teacher Approvals
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
            4. End-of-Semester Reports Inspector
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cloud')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition ${
              activeTab === 'cloud'
                ? 'bg-teresa-gold-400 text-teresa-green-950 shadow-md'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Database className="w-4 h-4" />
            5. Inquiries & Supabase / Vercel Cloud Status
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: EXECUTIVE OVERVIEW & AUDIT LOG                                 */}
      {/* ===================================================================== */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 8 cols: Class-by-Class Financial & Academic Performance Matrix */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-teresa-green-100 p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teresa-gold-700">
                  Owner Institutional Oversight
                </span>
                <h3 className="text-xl font-serif font-bold text-teresa-green-950">
                  Class-by-Class Fee Structure, Feeding Rate & Academic Standing
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-teresa-green-50 text-teresa-green-900 text-xs font-bold">
                11 Active Class Streams
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-teresa-green-900 text-white text-xs uppercase">
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-3">Class Teacher</th>
                    <th className="py-3 px-3 text-right">Tuition Rate</th>
                    <th className="py-3 px-3 text-right">Extra Classes</th>
                    <th className="py-3 px-3 text-right">Daily Meal</th>
                    <th className="py-3 px-3 text-center">Class Avg %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {state.classFeeStructures.map((cf) => {
                    const classResults = state.academicResults.filter(
                      (r) => r.className === cf.className
                    );
                    const avg =
                      classResults.length > 0
                        ? Math.round(
                            (classResults.reduce((s, r) => s + r.totalScore, 0) /
                              classResults.length) *
                              10
                          ) / 10
                        : null;

                    return (
                      <tr key={cf.id} className="hover:bg-teresa-ivory/60">
                        <td className="py-3 px-4 font-bold text-teresa-green-950">
                          {cf.className}
                          <div className="text-[11px] text-slate-500 font-normal">
                            {cf.department}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-xs font-medium text-slate-700">
                          {cf.classTeacher}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                          {formatCurrency(cf.tuitionFee)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-teresa-gold-800">
                          {formatCurrency(cf.extraClassesFee)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                          {formatCurrency(cf.dailyMealFee)}/day
                        </td>
                        <td className="py-3 px-3 text-center">
                          {avg !== null ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-mono text-xs font-bold">
                              {avg}%
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">Active</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right 4 cols: Live Institutional Activity & Audit Stream */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-teresa-green-100 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-teresa-green-700">
                    Real-Time Telemetry
                  </span>
                  <h3 className="text-xl font-serif font-bold text-teresa-green-950">
                    System Audit Log
                  </h3>
                </div>
                <div className="w-9 h-9 rounded-xl bg-teresa-gold-100 flex items-center justify-center text-teresa-gold-800">
                  <Activity className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {state.auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-2xl border border-slate-200/90 bg-teresa-ivory/50 space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-teresa-green-950">
                        {log.action}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-teresa-green-900 text-teresa-gold-300">
                        {log.actorRole.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{log.details}</p>
                    <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                      <span>By {log.actorName}</span>
                      <span className="font-mono">
                        {new Date(log.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: ALL FINANCIAL LEDGERS & DAILY FEEDING COLLECTIONS              */}
      {/* ===================================================================== */}
      {activeTab === 'finances' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 6 cols: All Daily Feeding Fee Collections Logged by Teachers */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-teresa-green-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teresa-gold-700">
                  Teacher Daily Collections
                </span>
                <h3 className="text-xl font-serif font-bold text-teresa-green-950">
                  Daily Feeding Fee Ledger (By Student & Date)
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-mono text-xs font-bold">
                Total: {formatCurrency(metrics.totalDailyFeedingCash)}
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 max-h-96">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 bg-teresa-green-900 text-white uppercase">
                  <tr>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Student Name</th>
                    <th className="py-3 px-3">Class</th>
                    <th className="py-3 px-3 text-right">Amount</th>
                    <th className="py-3 px-3">Teacher</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {state.dailyFeedingLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-semibold text-slate-700">
                        {log.collectionDate}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        {log.studentName}
                      </td>
                      <td className="py-2.5 px-3">{log.className}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800">
                        {formatCurrency(log.amount)}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">{log.loggedByTeacher}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right 6 cols: All Tuition, Extra Classes & Meal Plan Receipts */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-teresa-green-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teresa-green-700">
                  Headmaster & Bursary Ledger
                </span>
                <h3 className="text-xl font-serif font-bold text-teresa-green-950">
                  Tuition, Extra Classes & Meal Plan Receipts
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-teresa-gold-100 text-teresa-green-950 font-mono text-xs font-bold">
                {state.feePayments.length} Receipts
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 max-h-96">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 bg-teresa-green-900 text-white uppercase">
                  <tr>
                    <th className="py-3 px-3">Receipt</th>
                    <th className="py-3 px-3">Student</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3 text-right">Amount</th>
                    <th className="py-3 px-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {state.feePayments.map((pay) => (
                    <tr key={pay.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-teresa-green-900">
                        {pay.receiptNo}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        {pay.studentName} ({pay.className})
                      </td>
                      <td className="py-2.5 px-3 uppercase font-semibold text-teresa-gold-800">
                        {pay.category.replace('_', ' ')}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800">
                        {formatCurrency(pay.amount)}
                      </td>
                      <td className="py-2.5 px-3 font-mono">{pay.paymentDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: STUDENTS, FACULTY & TEACHER APPROVALS                          */}
      {/* ===================================================================== */}
      {activeTab === 'directory' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 4 cols: Enroll New Student Form */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-teresa-green-100 p-6 shadow-sm">
            <div className="mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-teresa-gold-700">
                Admissions Registry
              </span>
              <h3 className="text-xl font-serif font-bold text-teresa-green-950">
                Enroll New Student
              </h3>
            </div>

            <form onSubmit={handleEnrollStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Student Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nana Ama Mensimah"
                  value={stuName}
                  onChange={(e) => setStuName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Gender
                  </label>
                  <select
                    value={stuGender}
                    onChange={(e) => setStuGender(e.target.value as 'Male' | 'Female')}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Class
                  </label>
                  <select
                    value={stuClass}
                    onChange={(e) => setStuClass(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-bold"
                  >
                    {SCHOOL_CLASSES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Parent / Guardian Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mr. Kofi Mensimah"
                  value={stuGuardian}
                  onChange={(e) => setStuGuardian(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Guardian Phone
                </label>
                <input
                  type="tel"
                  placeholder="+233 24 000 1111"
                  value={stuPhone}
                  onChange={(e) => setStuPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={enrolling}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teresa-green-800 to-teresa-green-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition"
              >
                <PlusCircle className="w-4 h-4 text-teresa-gold-300" />
                {enrolling ? 'Enrolling...' : 'Enroll Student into Roster'}
              </button>
            </form>
          </div>

          {/* Right 8 cols: Staff Directory & Pending Teacher Sign-Ups */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl border border-teresa-green-100 p-6 shadow-sm">
              <h3 className="text-xl font-serif font-bold text-teresa-green-950 mb-3">
                Active Leadership & Teaching Faculty ({state.staff.length})
              </h3>
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-teresa-green-900 text-white text-xs uppercase">
                      <th className="py-3 px-4">Staff ID</th>
                      <th className="py-3 px-3">Full Name</th>
                      <th className="py-3 px-3">Role</th>
                      <th className="py-3 px-3">Class</th>
                      <th className="py-3 px-4">Qualification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {state.staff.map((stf) => (
                      <tr key={stf.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono font-bold text-teresa-green-900 text-xs">
                          {stf.staffId}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900">
                          {stf.fullName}
                          <div className="text-xs text-slate-500 font-normal">{stf.email}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2.5 py-0.5 rounded-full bg-teresa-gold-100 text-teresa-green-950 text-xs font-bold uppercase">
                            {stf.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-700">
                          {stf.assignedClass || 'All-School'}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600">
                          {stf.qualification}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Teacher Sign-up Requests Queue */}
            <div className="bg-white rounded-3xl border border-teresa-green-100 p-6 shadow-sm">
              <h3 className="text-lg font-serif font-bold text-teresa-green-950 mb-3">
                Teacher Registration Queue (Owner & Headmaster Oversight)
              </h3>
              <div className="space-y-3">
                {state.teacherRegistrations.map((reg) => (
                  <div
                    key={reg.id}
                    className="p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-bold text-slate-900 text-sm">
                        {reg.fullName} — <span className="text-teresa-green-800">{reg.requestedClass}</span>
                      </div>
                      <div className="text-xs text-slate-600">{reg.qualification}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {reg.status === 'pending' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOwnerApproveTeacher(reg.id, 'approved')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOwnerApproveTeacher(reg.id, 'rejected')}
                            className="px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold transition"
                          >
                            Decline
                          </button>
                        </>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase">
                          {reg.status} ({reg.assignedStaffId || 'Reviewed'})
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 4: END-OF-SEMESTER REPORTS INSPECTOR                              */}
      {/* ===================================================================== */}
      {activeTab === 'reports' && (
        <ReportCardGenerator
          state={state}
          activeRole="super_admin"
          actorName={owner.fullName}
          onStateChange={onStateChange}
          onNotify={onNotify}
        />
      )}

      {/* ===================================================================== */}
      {/* TAB 5: PUBLIC INQUIRIES & SUPABASE + VERCEL ARCHITECTURE              */}
      {/* ===================================================================== */}
      {activeTab === 'cloud' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 6 cols: Public Contact & Admissions Inquiries */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-teresa-green-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teresa-gold-700">
                  Public Website Inbox
                </span>
                <h3 className="text-xl font-serif font-bold text-teresa-green-950">
                  Contact & Admissions Inquiries ({state.contactInquiries.length})
                </h3>
              </div>
              <Mail className="w-5 h-5 text-teresa-green-800" />
            </div>

            <div className="space-y-3">
              {state.contactInquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-teresa-ivory/50 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{inq.subject}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-teresa-green-100 text-teresa-green-900 text-[11px] font-bold uppercase">
                      {inq.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{inq.message}</p>
                  <div className="text-[11px] text-slate-500 pt-1 flex flex-wrap gap-3">
                    <span>
                      <strong>From:</strong> {inq.fullName}
                    </span>
                    <span>
                      <strong>Email:</strong> {inq.email}
                    </span>
                    <span>
                      <strong>Phone:</strong> {inq.phone}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right 6 cols: Supabase + Vercel Cloud Integration Inspector */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-teresa-green-100 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  TypeScript Backend Architecture
                </span>
                <h3 className="text-xl font-serif font-bold text-teresa-green-950">
                  Vercel + Supabase Cloud Integration
                </h3>
              </div>
              <Cloud className="w-6 h-6 text-teresa-gold-600" />
            </div>

            <div className="p-4 rounded-2xl bg-teresa-green-950 text-white space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-teresa-gold-300">
                  Active Storage Engine
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {state.supabaseConnected
                    ? 'Connected to Live Supabase PostgreSQL'
                    : 'Hybrid Stateful Engine (Supabase-Ready)'}
                </span>
              </div>
              <p className="text-xs text-emerald-100/80 leading-relaxed">
                Built with Next.js App Router TypeScript API Routes (<code className="text-teresa-gold-300">/api/school</code>, <code className="text-teresa-gold-300">/api/fees</code>, <code className="text-teresa-gold-300">/api/feeding</code>, <code className="text-teresa-gold-300">/api/teachers</code>, <code className="text-teresa-gold-300">/api/results</code>, <code className="text-teresa-gold-300">/api/contact</code>) and <code className="text-teresa-gold-300">@supabase/supabase-js</code>.
              </p>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="font-bold text-teresa-green-950 uppercase tracking-wider">
                Supabase Schema & Row-Level Security (`supabase/schema.sql`)
              </div>
              <ul className="grid grid-cols-2 gap-2">
                {[
                  'public.profiles (Role-Based Staff)',
                  'public.teacher_registrations',
                  'public.class_fee_structures',
                  'public.students (Full Roster)',
                  'public.fee_payments (Receipts)',
                  'public.daily_feeding_logs',
                  'public.academic_results',
                  'public.audit_logs (Owner Trail)',
                ].map((tbl) => (
                  <li
                    key={tbl}
                    className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] text-teresa-green-900"
                  >
                    ✓ {tbl}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-teresa-ivory border border-teresa-gold-300 flex items-center justify-between">
              <div className="text-xs text-slate-700">
                <strong>Deploy to Vercel:</strong> Add <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in Vercel Project Settings.
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(
                    'NEXT_PUBLIC_SUPABASE_URL=\nNEXT_PUBLIC_SUPABASE_ANON_KEY=\nSUPABASE_SERVICE_ROLE_KEY='
                  );
                  onNotify('Copied .env template to clipboard!', 'info');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teresa-green-900 text-teresa-gold-300 text-xs font-bold shrink-0"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy .env Keys
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
