'use client';

import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Loader2,
  Phone,
  Search,
  UserPlus,
  X,
} from 'lucide-react';
import {
  ADMISSION_STATUSES,
  ADMISSION_STATUS_LABELS,
  AdmissionApplication,
  AdmissionStatus,
  SchoolStateSnapshot,
  UserRole,
} from '@/types/school';

interface AdmissionsRegisterProps {
  applications: AdmissionApplication[];
  currentUser: { fullName: string; role: UserRole };
  onStateChange: (state: SchoolStateSnapshot) => void;
  onNotify: (message: string, type?: 'success' | 'info') => void;
}

const STATUS_STYLES: Record<AdmissionStatus, string> = {
  new: 'bg-sky-50 text-sky-800 border-sky-200',
  contacted: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  assessment: 'bg-amber-50 text-amber-800 border-amber-200',
  offered: 'bg-theresa-gold-50 text-theresa-gold-800 border-theresa-gold-200',
  enrolled: 'bg-theresa-green-50 text-theresa-green-800 border-theresa-green-200',
  declined: 'bg-rose-50 text-rose-800 border-rose-200',
};

/**
 * The admission applications, searchable.
 *
 * The office searches by reference, child, guardian, telephone number or
 * class, filters by where each application stands, and moves it on — the last
 * step enrols the child onto the pupil roll with an admission code.
 */
export function AdmissionsRegister({
  applications,
  currentUser,
  onStateChange,
  onNotify,
}: AdmissionsRegisterProps) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<AdmissionStatus | 'all'>('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const base = { all: applications.length } as Record<string, number>;
    for (const entry of ADMISSION_STATUSES) {
      base[entry] = applications.filter((application) => application.status === entry).length;
    }
    return base;
  }, [applications]);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const digits = needle.replace(/\D/g, '');

    return applications
      .filter((application) => (status === 'all' ? true : application.status === status))
      .filter((application) => {
        if (!needle) return true;
        const haystack = [
          application.reference,
          application.childFullName,
          application.guardianName,
          application.guardianEmail || '',
          application.guardianPhone,
          application.classApplied,
          application.studentCode || '',
          ADMISSION_STATUS_LABELS[application.status],
        ]
          .join(' ')
          .toLowerCase();
        if (haystack.includes(needle)) return true;
        if (digits.length >= 3) {
          return (
            application.guardianPhone.replace(/\D/g, '').includes(digits) ||
            (application.studentCode || '').replace(/\D/g, '').includes(digits)
          );
        }
        return false;
      })
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  }, [applications, query, status]);

  async function moveOn(application: AdmissionApplication, next: AdmissionStatus) {
    setBusyId(application.id);
    try {
      const response = await fetch('/api/admissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: application.id,
          status: next,
          notes: notes[application.id] ?? application.notes ?? undefined,
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        onNotify(data.error || 'The application could not be updated.', 'info');
        return;
      }

      if (data.state) onStateChange(data.state as SchoolStateSnapshot);

      if (next === 'enrolled' && data.student) {
        onNotify(
          `${application.childFullName} is enrolled as ${data.student.studentCode} in ${data.student.className}.`
        );
      } else {
        onNotify(`${application.reference} moved to ${ADMISSION_STATUS_LABELS[next].toLowerCase()}.`);
      }
    } catch {
      onNotify('The server could not be reached.', 'info');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-100 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 font-serif text-lg font-bold text-theresa-green-950">
              <ClipboardList className="h-4 w-4 text-theresa-gold-600" />
              Admission applications
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Search by reference, child, guardian, telephone number or class, then move each
              application on.
            </p>
          </div>
          <span className="rounded-full bg-theresa-green-50 px-3 py-1 text-xs font-bold text-theresa-green-800">
            {results.length} of {applications.length} shown
          </span>
        </div>

        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="e.g. ADM/2026/0004, Ama Mensimah, 024 000 1111, KG 1"
            className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-theresa-green-700 focus:ring-4 focus:ring-theresa-green-100/70"
            aria-label="Search admission applications"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setStatus('all')}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-bold transition ${
              status === 'all'
                ? 'border-theresa-green-900 bg-theresa-green-900 text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:border-theresa-green-500'
            }`}
          >
            All ({counts.all})
          </button>
          {ADMISSION_STATUSES.map((entry) => (
            <button
              key={entry}
              type="button"
              onClick={() => setStatus(entry)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-bold transition ${
                status === entry
                  ? 'border-theresa-green-900 bg-theresa-green-900 text-white'
                  : `${STATUS_STYLES[entry]} hover:brightness-95`
              }`}
            >
              {ADMISSION_STATUS_LABELS[entry]} ({counts[entry]})
            </button>
          ))}
        </div>
      </header>

      {results.length === 0 ? (
        <p className="p-6 text-sm text-slate-600">
          {applications.length === 0
            ? 'No applications yet. Families can apply from the website at Admissions → Apply for a place.'
            : 'No application matches that search.'}
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {results.map((application) => {
            const open = openId === application.id;
            const busy = busyId === application.id;
            return (
              <li key={application.id} className="p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-theresa-gold-700">
                        {application.reference}
                      </span>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${STATUS_STYLES[application.status]}`}
                      >
                        {ADMISSION_STATUS_LABELS[application.status]}
                      </span>
                      {application.studentCode && (
                        <span className="rounded-full bg-theresa-green-900 px-2.5 py-0.5 text-[11px] font-bold text-white">
                          {application.studentCode}
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 font-serif text-base font-bold text-slate-900">
                      {application.childFullName}{' '}
                      <span className="font-sans text-sm font-normal text-slate-500">
                        → {application.classApplied}
                      </span>
                    </p>
                    <p className="mt-0.5 text-xs text-slate-600">
                      Guardian: {application.guardianName} &middot;{' '}
                      <span className="inline-flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {application.guardianPhone}
                      </span>
                      {application.guardianEmail ? ` · ${application.guardianEmail}` : ''}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      Applied {new Date(application.createdAt).toLocaleDateString()}
                      {application.previousSchool ? ` · from ${application.previousSchool}` : ''}
                      {application.reviewedBy ? ` · last moved by ${application.reviewedBy}` : ''}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setOpenId(open ? null : application.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-theresa-green-500"
                    >
                      {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      {open ? 'Close' : 'Open'}
                    </button>
                    {application.status !== 'enrolled' && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => moveOn(application, 'enrolled')}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-theresa-green-800 to-theresa-green-700 px-3.5 py-2 text-xs font-bold text-white shadow-soft transition hover:shadow-lift disabled:opacity-60"
                      >
                        {busy ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <UserPlus className="h-3.5 w-3.5" />
                        )}
                        Enrol child
                      </button>
                    )}
                  </div>
                </div>

                {open && (
                  <div className="mt-4 animate-fade-in rounded-2xl border border-slate-200 bg-[#FCFBF7] p-4">
                    <div className="grid gap-4 lg:grid-cols-12">
                      <div className="lg:col-span-7">
                        <label
                          htmlFor={`notes-${application.id}`}
                          className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500"
                        >
                          Office notes
                        </label>
                        <textarea
                          id={`notes-${application.id}`}
                          rows={4}
                          value={notes[application.id] ?? application.notes ?? ''}
                          onChange={(event) =>
                            setNotes((current) => ({ ...current, [application.id]: event.target.value }))
                          }
                          placeholder="Notes are kept with the application and are not shown to parents."
                          className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-theresa-green-700 focus:ring-4 focus:ring-theresa-green-100/70"
                        />
                      </div>
                      <div className="lg:col-span-5">
                        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Move to
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {ADMISSION_STATUSES.map((entry) => (
                            <button
                              key={entry}
                              type="button"
                              disabled={busy || entry === application.status}
                              onClick={() => moveOn(application, entry)}
                              className={`rounded-xl border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                entry === application.status
                                  ? 'border-theresa-green-900 bg-theresa-green-900 text-white'
                                  : 'border-slate-300 bg-white text-slate-700 hover:border-theresa-green-600'
                              }`}
                            >
                              {ADMISSION_STATUS_LABELS[entry]}
                            </button>
                          ))}
                        </div>
                        {application.status === 'enrolled' && application.studentCode && (
                          <p className="mt-3 flex items-center gap-2 rounded-xl border border-theresa-green-200 bg-theresa-green-50 px-3 py-2 text-xs font-semibold text-theresa-green-900">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            On the roll as {application.studentCode}
                          </p>
                        )}
                        <p className="mt-3 text-[11px] text-slate-500">
                          Moving to &ldquo;Enrolled&rdquo; adds the child to the pupil roll
                          {currentUser.role === 'headmaster' ? ' and the office is notified' : ''}.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
