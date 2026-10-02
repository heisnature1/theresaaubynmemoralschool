'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Download,
  GraduationCap,
  LogOut,
  Printer,
  Receipt,
  School,
  Utensils,
  Wallet,
} from 'lucide-react';
import { formatCurrency } from '@/lib/grading';

/** Everything a parent may see, already narrowed to their own children. */
export interface ParentChildView {
  id: string;
  fullName: string;
  studentCode: string;
  className: string;
  photo?: string;
  attendancePresent: number;
  attendanceTotal: number;
  conduct: string;
  interestTalent: string;
  teacherRemark: string;
  headmasterRemark: string;
  reportEndorsed: boolean;
  fees: {
    items: { label: string; amount: number }[];
    totalBilled: number;
    totalPaid: number;
    balance: number;
    payments: { id: string; receiptNo: string; date: string; category: string; amount: number; method: string }[];
  };
  feeding: {
    mealsLogged: number;
    amountPaid: number;
    exemptDays: number;
    unpaidDays: number;
    recent: { id: string; date: string; status: string; amount: number }[];
  };
  results: {
    id: string;
    subject: string;
    classScore: number;
    examScore: number;
    totalScore: number;
    grade: string;
    remark: string;
    semester: string;
  }[];
  termAverage: number | null;
}

interface ParentPortalProps {
  guardianName: string;
  children: ParentChildView[];
  school: {
    name: string;
    mainPhone: string | null;
    generalEmail: string | null;
    currentSemester: string | null;
    nextReopening: string | null;
    officeHours: string | null;
  };
}

type Tab = 'overview' | 'feeding' | 'results' | 'report';

const TABS: { id: Tab; label: string; icon: typeof Wallet }[] = [
  { id: 'overview', label: 'Fees & payments', icon: Wallet },
  { id: 'feeding', label: 'Feeding account', icon: Utensils },
  { id: 'results', label: 'Marks', icon: BookOpen },
  { id: 'report', label: 'Report card', icon: GraduationCap },
];

function attendancePercent(present: number, total: number): number | null {
  if (!total) return null;
  return Math.round((present / total) * 100);
}

export function ParentPortal({ guardianName, children, school }: ParentPortalProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(children[0]?.id || '');
  const [tab, setTab] = useState<Tab>('overview');
  const [signingOut, setSigningOut] = useState(false);

  const child = useMemo(
    () => children.find((entry) => entry.id === selectedId) || children[0],
    [children, selectedId]
  );

  const attendance = child ? attendancePercent(child.attendancePresent, child.attendanceTotal) : null;

  async function signOut() {
    setSigningOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.replace('/');
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  if (!child) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-600">
        No pupil records are attached to this sign-in. Please ask the school office to check the
        guardian telephone number on your child&apos;s record.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Child selector */}
      <div className="flex flex-wrap items-center gap-3">
        {children.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => setSelectedId(entry.id)}
            className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all duration-300 ${
              entry.id === child.id
                ? 'border-theresa-green-800 bg-theresa-green-900 text-white shadow-lift'
                : 'border-slate-200 bg-white text-slate-700 hover:border-theresa-green-500'
            }`}
          >
            {entry.photo ? (
              <img
                src={entry.photo}
                alt=""
                className="h-10 w-10 rounded-full border border-white/40 object-cover"
              />
            ) : (
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold ${
                  entry.id === child.id
                    ? 'bg-white/15 text-theresa-gold-200'
                    : 'bg-theresa-green-50 text-theresa-green-800'
                }`}
              >
                {entry.fullName.split(' ').map((part) => part[0]).slice(0, 2).join('')}
              </span>
            )}
            <span className="leading-tight">
              <span className="block text-sm font-bold">{entry.fullName}</span>
              <span
                className={`block text-[11px] ${
                  entry.id === child.id ? 'text-emerald-100/80' : 'text-slate-500'
                }`}
              >
                {entry.className} &middot; {entry.studentCode}
              </span>
            </span>
          </button>
        ))}

        <button
          type="button"
          onClick={signOut}
          disabled={signingOut}
          className="ml-auto inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-rose-300 hover:text-rose-700 disabled:opacity-60"
        >
          <LogOut className="h-4 w-4" />
          {signingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </div>

      {/* The child at a glance */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Fees outstanding
          </p>
          <p className="mt-2 font-serif text-2xl font-bold text-theresa-green-950">
            {formatCurrency(child.fees.balance)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {formatCurrency(child.fees.totalPaid)} paid of {formatCurrency(child.fees.totalBilled)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Attendance</p>
          <p className="mt-2 font-serif text-2xl font-bold text-theresa-green-950">
            {attendance === null ? '—' : `${attendance}%`}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {child.attendanceTotal > 0
              ? `${child.attendancePresent} of ${child.attendanceTotal} school days`
              : 'Not yet recorded'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Feeding account
          </p>
          <p className="mt-2 font-serif text-2xl font-bold text-theresa-green-950">
            {child.feeding.mealsLogged}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            meals logged &middot; {formatCurrency(child.feeding.amountPaid)} paid
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Term average
          </p>
          <p className="mt-2 font-serif text-2xl font-bold text-theresa-green-950">
            {child.termAverage === null ? '—' : `${child.termAverage}%`}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {child.results.length} {child.results.length === 1 ? 'subject' : 'subjects'} recorded
          </p>
        </div>
      </section>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 print:hidden">
        {TABS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => setTab(entry.id)}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
              tab === entry.id
                ? 'border-theresa-green-900 bg-theresa-green-900 text-white shadow-soft'
                : 'border-slate-200 bg-white text-slate-700 hover:border-theresa-green-500'
            }`}
          >
            <entry.icon className="h-4 w-4" />
            {entry.label}
          </button>
        ))}
      </div>

      {/* Fees and payments */}
      {tab === 'overview' && (
        <section className="grid gap-5 lg:grid-cols-12">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft lg:col-span-7">
            <h2 className="font-serif text-lg font-bold text-theresa-green-950">
              What the school bills for {child.fullName.split(' ')[0]}
            </h2>
            <table className="mt-4 w-full border-collapse text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="py-2 font-semibold">Item</th>
                  <th className="py-2 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {child.fees.items.map((item) => (
                  <tr key={item.label}>
                    <td className="py-2.5 text-slate-700">{item.label}</td>
                    <td className="py-2.5 text-right font-semibold text-slate-900">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-[#FCFBF7]">
                  <td className="py-2.5 font-bold text-slate-900">Total billed</td>
                  <td className="py-2.5 text-right font-bold text-slate-900">
                    {formatCurrency(child.fees.totalBilled)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-slate-700">Paid so far</td>
                  <td className="py-2.5 text-right font-semibold text-theresa-green-800">
                    {formatCurrency(child.fees.totalPaid)}
                  </td>
                </tr>
                <tr className="border-t-2 border-theresa-green-900/10">
                  <td className="py-2.5 font-bold text-slate-900">Balance</td>
                  <td className="py-2.5 text-right font-bold text-theresa-green-950">
                    {formatCurrency(child.fees.balance)}
                  </td>
                </tr>
              </tbody>
            </table>
            {school.currentSemester && (
              <p className="mt-3 text-xs text-slate-500">Fee schedule: {school.currentSemester}</p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft lg:col-span-5">
            <h2 className="flex items-center gap-2 font-serif text-lg font-bold text-theresa-green-950">
              <Receipt className="h-4 w-4 text-theresa-gold-600" />
              Receipts
            </h2>
            {child.fees.payments.length > 0 ? (
              <ul className="mt-4 divide-y divide-slate-100 text-sm">
                {child.fees.payments.slice(0, 8).map((payment) => (
                  <li key={payment.id} className="flex items-center justify-between gap-3 py-2.5">
                    <span>
                      <span className="block font-semibold text-slate-800">{payment.receiptNo}</span>
                      <span className="block text-xs text-slate-500">
                        {payment.date} &middot; {payment.category} &middot; {payment.method}
                      </span>
                    </span>
                    <span className="font-semibold text-theresa-green-800">
                      {formatCurrency(payment.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-slate-600">
                No payments have been recorded yet. Receipts appear here as the office enters them.
              </p>
            )}
          </div>
        </section>
      )}

      {/* Feeding */}
      {tab === 'feeding' && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="font-serif text-lg font-bold text-theresa-green-950">
            {child.fullName.split(' ')[0]}&apos;s midday meals
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {child.feeding.mealsLogged} meals have been logged
            {child.feeding.exemptDays > 0 ? `, with ${child.feeding.exemptDays} exempt days` : ''}
            {child.feeding.unpaidDays > 0 ? `, and ${child.feeding.unpaidDays} days not yet paid` : ''}
            .
          </p>
          {child.feeding.recent.length > 0 ? (
            <ul className="mt-4 divide-y divide-slate-100 text-sm">
              {child.feeding.recent.map((entry) => (
                <li key={entry.id} className="flex items-center justify-between py-2.5">
                  <span className="text-slate-700">{entry.date}</span>
                  <span className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
                        entry.status === 'paid'
                          ? 'bg-theresa-green-50 text-theresa-green-800'
                          : entry.status === 'exempt'
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-amber-50 text-amber-800'
                      }`}
                    >
                      {entry.status}
                    </span>
                    <span className="font-semibold text-slate-900">{formatCurrency(entry.amount)}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 rounded-xl border border-dashed border-slate-300 bg-[#FCFBF7] p-4 text-sm text-slate-600">
              No meals have been logged for this term yet.
            </p>
          )}
        </section>
      )}

      {/* Marks */}
      {tab === 'results' && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="font-serif text-lg font-bold text-theresa-green-950">Subject marks</h2>
          {child.results.length > 0 ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-sm">
                <thead>
                  <tr className="bg-theresa-green-900 text-left text-xs uppercase tracking-wider text-emerald-50">
                    <th className="rounded-l-lg px-3 py-2.5 font-semibold">Subject</th>
                    <th className="px-3 py-2.5 text-right font-semibold">Class (30)</th>
                    <th className="px-3 py-2.5 text-right font-semibold">Exam (70)</th>
                    <th className="px-3 py-2.5 text-right font-semibold">Total</th>
                    <th className="px-3 py-2.5 font-semibold">Grade</th>
                    <th className="rounded-r-lg px-3 py-2.5 font-semibold">Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {child.results.map((row) => (
                    <tr key={row.id}>
                      <td className="px-3 py-2.5 font-semibold text-slate-800">{row.subject}</td>
                      <td className="px-3 py-2.5 text-right text-slate-700">{row.classScore}</td>
                      <td className="px-3 py-2.5 text-right text-slate-700">{row.examScore}</td>
                      <td className="px-3 py-2.5 text-right font-bold text-theresa-green-900">
                        {row.totalScore}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="rounded-full bg-theresa-gold-50 px-2.5 py-0.5 text-xs font-bold text-theresa-gold-800">
                          {row.grade}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-slate-600">{row.remark}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-4 rounded-xl border border-dashed border-slate-300 bg-[#FCFBF7] p-4 text-sm text-slate-600">
              No marks have been entered for this term yet. They appear here as the class teacher
              records them.
            </p>
          )}
        </section>
      )}

      {/* Report card */}
      {tab === 'report' && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="font-serif text-lg font-bold text-theresa-green-950">Terminal report</h2>
            <div className="flex flex-wrap gap-2 print:hidden">
              <a
                href={`/api/reports/${child.id}/pdf`}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-theresa-green-800 to-theresa-green-700 px-4 py-2.5 text-sm font-bold text-white shadow-soft transition hover:shadow-lift"
              >
                <Download className="h-4 w-4 text-theresa-gold-300" />
                Download PDF
              </a>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-theresa-green-500"
              >
                <Printer className="h-4 w-4" />
                Print
              </button>
            </div>
          </div>

          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-4">
              <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Attendance
              </dt>
              <dd className="mt-1 font-semibold text-slate-800">
                {child.attendanceTotal > 0
                  ? `${child.attendancePresent} of ${child.attendanceTotal} days`
                  : 'Not yet recorded'}
              </dd>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Conduct
              </dt>
              <dd className="mt-1 font-semibold text-slate-800">{child.conduct || '—'}</dd>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Interest &amp; talent
              </dt>
              <dd className="mt-1 font-semibold text-slate-800">{child.interestTalent || '—'}</dd>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Headmaster&apos;s endorsement
              </dt>
              <dd className="mt-1 font-semibold text-slate-800">
                {child.reportEndorsed ? 'Endorsed' : 'Awaiting endorsement'}
              </dd>
            </div>
          </dl>

          {child.teacherRemark && (
            <blockquote className="mt-5 rounded-xl border border-theresa-green-100 bg-[#F7FBF8] p-4 text-sm text-slate-700">
              <p className="text-[11px] font-bold uppercase tracking-wider text-theresa-green-800">
                Class teacher
              </p>
              <p className="mt-1.5 leading-relaxed">{child.teacherRemark}</p>
            </blockquote>
          )}
          {child.headmasterRemark && (
            <blockquote className="mt-3 rounded-xl border border-theresa-gold-100 bg-theresa-gold-50/50 p-4 text-sm text-slate-700">
              <p className="text-[11px] font-bold uppercase tracking-wider text-theresa-gold-800">
                Headmaster
              </p>
              <p className="mt-1.5 leading-relaxed">{child.headmasterRemark}</p>
            </blockquote>
          )}

          <p className="mt-5 flex items-start gap-2 text-xs text-slate-500">
            <School className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {school.name}
            {school.mainPhone ? ` · ${school.mainPhone}` : ''}
            {school.generalEmail ? ` · ${school.generalEmail}` : ''}
          </p>
        </section>
      )}

      {/* School particulars footer */}
      <footer className="rounded-2xl border border-slate-200 bg-[#FCFBF7] p-5 text-xs text-slate-600">
        <p className="font-semibold text-slate-700">{school.name}</p>
        {school.officeHours && <p className="mt-1">Office hours: {school.officeHours}</p>}
        {school.nextReopening && <p className="mt-1">Next reopening: {school.nextReopening}</p>}
        {school.mainPhone && <p className="mt-1">Telephone: {school.mainPhone}</p>}
        <p className="mt-1">Signed in as {guardianName}.</p>
      </footer>
    </div>
  );
}
