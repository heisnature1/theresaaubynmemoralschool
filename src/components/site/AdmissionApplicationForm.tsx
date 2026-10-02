'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, ClipboardCheck, Send } from 'lucide-react';

interface AdmissionApplicationFormProps {
  /** The classes the school publishes fees for, if it has published any. */
  classes: string[];
  /** Shown in the confirmation so the parent knows where to telephone. */
  officePhone: string | null;
}

interface Submitted {
  reference: string;
  childFullName: string;
  classApplied: string;
}

/**
 * The application form parents fill in on the website. An application gets a
 * reference (ADM/…/….) immediately, which the parent can use to check on it.
 */
export function AdmissionApplicationForm({ classes, officePhone }: AdmissionApplicationFormProps) {
  const [form, setForm] = useState({
    childFullName: '',
    childDateOfBirth: '',
    gender: '',
    classApplied: classes[0] || 'KG 1',
    guardianName: '',
    guardianPhone: '',
    guardianEmail: '',
    previousSchool: '',
    notes: '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<Submitted | null>(null);

  function set(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const response = await fetch('/api/admissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        setError(data.error || 'The application could not be sent. Please try again.');
        return;
      }

      setSubmitted({
        reference: data.reference,
        childFullName: data.application.childFullName,
        classApplied: data.application.classApplied,
      });
    } catch {
      setError('The server could not be reached. Please try again, or telephone the office.');
    } finally {
      setBusy(false);
    }
  }

  if (submitted) {
    return (
      <div className="animate-pop-in rounded-3xl border border-theresa-green-200 bg-theresa-green-50 p-7">
        <CheckCircle2 className="h-8 w-8 text-theresa-green-700" />
        <h2 className="mt-3 font-serif text-2xl font-bold text-theresa-green-950">
          Application received
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-theresa-green-900">
          Thank you. {submitted.childFullName}&apos;s application for{' '}
          <strong>{submitted.classApplied}</strong> is with the school office. Quote this reference
          in any conversation about it:
        </p>
        <p className="mt-4 inline-flex rounded-2xl border-2 border-dashed border-theresa-green-400 bg-white px-5 py-3 font-mono text-xl font-bold tracking-wider text-theresa-green-900">
          {submitted.reference}
        </p>
        <p className="mt-4 text-sm text-theresa-green-900">
          Keep it safe — you can check the application&apos;s progress at any time with it
          {officePhone ? `, or telephone the office on ${officePhone}` : ''}.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/admissions#check"
            className="rounded-xl bg-theresa-green-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-theresa-green-900"
          >
            Check the application
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-theresa-green-300 bg-white px-5 py-2.5 text-sm font-semibold text-theresa-green-900 transition hover:border-theresa-green-600"
          >
            Back to the website
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-7"
    >
      <h2 className="flex items-center gap-2 font-serif text-xl font-bold text-theresa-green-950">
        <ClipboardCheck className="h-5 w-5 text-theresa-gold-600" />
        Apply for a place
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Fill this in and the school office will contact you. A place is offered after a short
        assessment or a meeting with the Headmaster.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="childFullName" className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600">
            Child&apos;s full name *
          </label>
          <input
            id="childFullName"
            required
            value={form.childFullName}
            onChange={(event) => set('childFullName', event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-theresa-green-700 focus:ring-4 focus:ring-theresa-green-100/70"
            placeholder="e.g. Nana Ama Mensimah"
          />
        </div>

        <div>
          <label htmlFor="childDateOfBirth" className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600">
            Date of birth
          </label>
          <input
            id="childDateOfBirth"
            type="date"
            value={form.childDateOfBirth}
            onChange={(event) => set('childDateOfBirth', event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-theresa-green-700 focus:ring-4 focus:ring-theresa-green-100/70"
          />
        </div>

        <div>
          <label htmlFor="gender" className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600">
            Gender
          </label>
          <select
            id="gender"
            value={form.gender}
            onChange={(event) => set('gender', event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-theresa-green-700 focus:ring-4 focus:ring-theresa-green-100/70"
          >
            <option value="">Not stated</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
          </select>
        </div>

        <div>
          <label htmlFor="classApplied" className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600">
            Class applied for *
          </label>
          <select
            id="classApplied"
            required
            value={form.classApplied}
            onChange={(event) => set('classApplied', event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-semibold outline-none transition focus:border-theresa-green-700 focus:ring-4 focus:ring-theresa-green-100/70"
          >
            {classes.map((className) => (
              <option key={className} value={className}>
                {className}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="previousSchool" className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600">
            Present or previous school
          </label>
          <input
            id="previousSchool"
            value={form.previousSchool}
            onChange={(event) => set('previousSchool', event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-theresa-green-700 focus:ring-4 focus:ring-theresa-green-100/70"
          />
        </div>

        <div>
          <label htmlFor="guardianName" className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600">
            Parent / guardian name *
          </label>
          <input
            id="guardianName"
            required
            value={form.guardianName}
            onChange={(event) => set('guardianName', event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-theresa-green-700 focus:ring-4 focus:ring-theresa-green-100/70"
            placeholder="e.g. Mr. Kofi Mensimah"
          />
        </div>

        <div>
          <label htmlFor="guardianPhone" className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600">
            Telephone number *
          </label>
          <input
            id="guardianPhone"
            type="tel"
            required
            value={form.guardianPhone}
            onChange={(event) => set('guardianPhone', event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-theresa-green-700 focus:ring-4 focus:ring-theresa-green-100/70"
            placeholder="+233 24 000 1111"
          />
        </div>

        <div>
          <label htmlFor="guardianEmail" className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600">
            Email address
          </label>
          <input
            id="guardianEmail"
            type="email"
            value={form.guardianEmail}
            onChange={(event) => set('guardianEmail', event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-theresa-green-700 focus:ring-4 focus:ring-theresa-green-100/70"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="notes" className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600">
            Anything the school should know
          </label>
          <textarea
            id="notes"
            rows={4}
            value={form.notes}
            onChange={(event) => set('notes', event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-theresa-green-700 focus:ring-4 focus:ring-theresa-green-100/70"
            placeholder="Dietary needs, siblings already in the school, and so on."
          />
        </div>
      </div>

      {error && (
        <p className="mt-5 flex animate-fade-in items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-theresa-green-800 to-theresa-green-700 px-5 py-3 text-sm font-bold text-white shadow-soft transition hover:shadow-lift disabled:opacity-60 sm:w-auto magnetic-btn shine"
      >
        <Send className="h-4 w-4 text-theresa-gold-300" />
        {busy ? 'Sending…' : 'Send the application'}
      </button>
      <p className="mt-3 text-xs text-slate-500">
        * Required. The school keeps the information you send here for admissions only.
      </p>
    </form>
  );
}
