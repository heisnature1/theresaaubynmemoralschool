'use client';

import { useState } from 'react';
import { AlertCircle, Search, Sparkles } from 'lucide-react';
import { ADMISSION_STATUS_FLOW, ADMISSION_STATUS_LABELS, AdmissionStatus } from '@/types/school';

interface CheckedApplication {
  reference: string;
  childFullName: string;
  classApplied: string;
  guardianName: string;
  status: AdmissionStatus;
  studentCode: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * A parent can look up an application with its reference, or with the child's
 * name and the telephone number used on the form.
 */
export function ApplicationStatusChecker() {
  const [reference, setReference] = useState('');
  const [childName, setChildName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [application, setApplication] = useState<CheckedApplication | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setApplication(null);

    try {
      const params = new URLSearchParams({ check: '1' });
      if (reference.trim()) params.set('reference', reference.trim());
      if (childName.trim()) params.set('childName', childName.trim());
      if (guardianPhone.trim()) params.set('guardianPhone', guardianPhone.trim());

      const response = await fetch(`/api/admissions?${params.toString()}`, { cache: 'no-store' });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        setError(data.error || 'No application matches those details.');
        return;
      }
      setApplication(data.application as CheckedApplication);
    } catch {
      setError('The server could not be reached. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  const currentIndex = application ? ADMISSION_STATUS_FLOW.indexOf(application.status) : -1;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
      <h2 className="font-serif text-xl font-bold text-theresa-green-950">
        Check an application
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Use the reference the school gave you (it looks like ADM/2026/0001), or your child&apos;s
        name with the telephone number you applied with.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 grid gap-3 sm:grid-cols-3">
        <input
          value={reference}
          onChange={(event) => setReference(event.target.value)}
          placeholder="ADM/2026/0001"
          className="rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-theresa-green-700 focus:ring-4 focus:ring-theresa-green-100/70"
          aria-label="Application reference"
        />
        <input
          value={childName}
          onChange={(event) => setChildName(event.target.value)}
          placeholder="Child's name"
          className="rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-theresa-green-700 focus:ring-4 focus:ring-theresa-green-100/70"
          aria-label="Child's name"
        />
        <div className="flex gap-3">
          <input
            value={guardianPhone}
            onChange={(event) => setGuardianPhone(event.target.value)}
            placeholder="Telephone number"
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-theresa-green-700 focus:ring-4 focus:ring-theresa-green-100/70"
            aria-label="Guardian telephone number"
          />
          <button
            type="submit"
            disabled={busy || (!reference.trim() && !childName.trim() && !guardianPhone.trim())}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-theresa-green-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-theresa-green-900 disabled:opacity-50"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">{busy ? 'Checking…' : 'Check'}</span>
          </button>
        </div>
      </form>

      {error && (
        <p className="mt-4 flex animate-fade-in items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      {application && (
        <div className="mt-5 animate-fade-in rounded-2xl border border-theresa-green-200 bg-theresa-green-50/60 p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-serif text-lg font-bold text-theresa-green-950">
              {application.childFullName}
            </p>
            <p className="font-mono text-xs font-bold text-theresa-gold-700">
              {application.reference}
            </p>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            {application.classApplied} &middot; guardian {application.guardianName}
          </p>

          <ol className="mt-4 flex flex-wrap gap-2">
            {ADMISSION_STATUS_FLOW.map((step, index) => {
              const reached = application.status === 'declined' ? false : index <= currentIndex;
              return (
                <li
                  key={step}
                  className={`rounded-full border px-3 py-1.5 text-[11px] font-bold ${
                    reached
                      ? 'border-theresa-green-700 bg-theresa-green-800 text-white'
                      : 'border-slate-300 bg-white text-slate-500'
                  }`}
                >
                  {ADMISSION_STATUS_LABELS[step]}
                </li>
              );
            })}
          </ol>

          {application.status === 'declined' ? (
            <p className="mt-4 rounded-xl border border-rose-200 bg-white px-3.5 py-2.5 text-sm text-rose-800">
              The school is not able to offer a place on this occasion. Please contact the office if
              you would like to discuss it.
            </p>
          ) : (
            <p className="mt-4 text-sm leading-relaxed text-slate-700">
              {application.status === 'enrolled' && application.studentCode ? (
                <>
                  <Sparkles className="mr-1 inline h-4 w-4 text-theresa-gold-600" />
                  Enrolled: {application.childFullName} is on the roll as{' '}
                  <strong>{application.studentCode}</strong>.
                </>
              ) : (
                <>
                  Current stage: <strong>{ADMISSION_STATUS_LABELS[application.status]}</strong>. The
                  office will contact you at the number on the application.
                </>
              )}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
