'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { SCHOOL_CLASSES, SCHOOL_SUBJECTS } from '@/lib/grading';

interface SignupFormState {
  fullName: string;
  email: string;
  phone: string;
  qualification: string;
  requestedClass: string;
  experienceYears: string;
  statement: string;
  password: string;
  confirmPassword: string;
}

const INITIAL_STATE: SignupFormState = {
  fullName: '',
  email: '',
  phone: '',
  qualification: '',
  requestedClass: 'Basic 4',
  experienceYears: '2',
  statement: '',
  password: '',
  confirmPassword: '',
};

export function TeacherSignupForm() {
  const [form, setForm] = useState<SignupFormState>(INITIAL_STATE);
  const [subjects, setSubjects] = useState<string[]>(['Mathematics']);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [reference, setReference] = useState<string | null>(null);

  function update<K extends keyof SignupFormState>(key: K, value: SignupFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleSubject(subject: string) {
    setSubjects((current) =>
      current.includes(subject) ? current.filter((item) => item !== subject) : [...current, subject]
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError('The two passwords do not match.');
      return;
    }
    if (subjects.length === 0) {
      setError('Please choose at least one subject you can teach.');
      return;
    }

    setBusy(true);
    try {
      const response = await fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          qualification: form.qualification,
          requestedClass: form.requestedClass,
          subjects,
          experienceYears: Number(form.experienceYears) || 1,
          statement: form.statement,
          password: form.password,
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        setError(data.error || 'The application could not be submitted. Please try again.');
        return;
      }

      setReference(data.registration?.id ?? 'received');
      setForm(INITIAL_STATE);
      setSubjects(['Mathematics']);
    } catch {
      setError('The application could not be submitted. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  if (reference) {
    return (
      <div className="rounded-md border border-teresa-green-200 bg-teresa-green-50 p-8">
        <CheckCircle2 className="h-7 w-7 text-teresa-green-700" />
        <h2 className="mt-3 font-serif text-xl font-bold text-teresa-green-950">
          Your application has been received
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          Reference <strong>{reference}</strong>. The Headmaster reviews applications with the
          proprietor, normally within one week. If your application is approved you will be able to
          sign in with the email address and password you have just chosen.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/login/teacher"
            className="rounded-md bg-teresa-green-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teresa-green-900"
          >
            Go to the teacher sign-in page
          </Link>
          <Link
            href="/"
            className="rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-white"
          >
            Back to the school website
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="space-y-4">
        <h2 className="font-serif text-lg font-bold text-teresa-green-950">Your details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="fullName" className="mb-1.5 block text-sm font-semibold text-slate-800">
              Full name <span className="text-rose-600">*</span>
            </label>
            <input
              id="fullName"
              required
              value={form.fullName}
              onChange={(event) => update('fullName', event.target.value)}
              className="w-full rounded-md border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-teresa-green-700 focus:ring-2 focus:ring-teresa-green-100"
              placeholder="e.g. Daniel Kobby Enninful"
            />
          </div>
          <div>
            <label htmlFor="phone" className="mb-1.5 block text-sm font-semibold text-slate-800">
              Telephone <span className="text-rose-600">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              required
              value={form.phone}
              onChange={(event) => update('phone', event.target.value)}
              className="w-full rounded-md border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-teresa-green-700 focus:ring-2 focus:ring-teresa-green-100"
              placeholder="+233 24 000 0000"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-slate-800">
            Email address <span className="text-rose-600">*</span>
          </label>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(event) => update('email', event.target.value)}
            className="w-full rounded-md border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-teresa-green-700 focus:ring-2 focus:ring-teresa-green-100"
            placeholder="you@example.com"
          />
          <p className="mt-1 text-xs text-slate-500">
            This becomes your sign-in name if the application is approved.
          </p>
        </div>
      </section>

      <section className="space-y-4 border-t border-slate-200 pt-6">
        <h2 className="font-serif text-lg font-bold text-teresa-green-950">Teaching background</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label htmlFor="qualification" className="mb-1.5 block text-sm font-semibold text-slate-800">
              Highest qualification <span className="text-rose-600">*</span>
            </label>
            <input
              id="qualification"
              required
              value={form.qualification}
              onChange={(event) => update('qualification', event.target.value)}
              className="w-full rounded-md border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-teresa-green-700 focus:ring-2 focus:ring-teresa-green-100"
              placeholder="e.g. B.Ed. Mathematics (UEW)"
            />
          </div>
          <div>
            <label htmlFor="experienceYears" className="mb-1.5 block text-sm font-semibold text-slate-800">
              Years of experience
            </label>
            <input
              id="experienceYears"
              type="number"
              min={0}
              max={45}
              value={form.experienceYears}
              onChange={(event) => update('experienceYears', event.target.value)}
              className="w-full rounded-md border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-teresa-green-700 focus:ring-2 focus:ring-teresa-green-100"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="requestedClass" className="mb-1.5 block text-sm font-semibold text-slate-800">
              Class you would prefer
            </label>
            <select
              id="requestedClass"
              value={form.requestedClass}
              onChange={(event) => update('requestedClass', event.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teresa-green-700 focus:ring-2 focus:ring-teresa-green-100"
            >
              {SCHOOL_CLASSES.map((className) => (
                <option key={className} value={className}>
                  {className}
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-slate-800">
            Subjects you can teach <span className="text-rose-600">*</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {SCHOOL_SUBJECTS.map((subject) => {
              const selected = subjects.includes(subject);
              return (
                <button
                  key={subject}
                  type="button"
                  onClick={() => toggleSubject(subject)}
                  aria-pressed={selected}
                  className={`rounded-md border px-3 py-1.5 text-xs font-medium transition ${
                    selected
                      ? 'border-teresa-green-800 bg-teresa-green-800 text-white'
                      : 'border-slate-300 bg-white text-slate-700 hover:border-teresa-green-600'
                  }`}
                >
                  {subject}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div>
          <label htmlFor="statement" className="mb-1.5 block text-sm font-semibold text-slate-800">
            A short statement
          </label>
          <textarea
            id="statement"
            rows={4}
            value={form.statement}
            onChange={(event) => update('statement', event.target.value)}
            className="w-full rounded-md border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-teresa-green-700 focus:ring-2 focus:ring-teresa-green-100"
            placeholder="Tell the Headmaster briefly about your teaching experience and why you would like to join the school."
          />
        </div>
      </section>

      <section className="space-y-4 border-t border-slate-200 pt-6">
        <h2 className="font-serif text-lg font-bold text-teresa-green-950">Choose a password</h2>
        <p className="text-sm text-slate-600">
          You will use this password to sign in once your application has been approved. It must be
          at least eight characters and contain a letter and a number.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-slate-800">
              Password <span className="text-rose-600">*</span>
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(event) => update('password', event.target.value)}
              className="w-full rounded-md border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-teresa-green-700 focus:ring-2 focus:ring-teresa-green-100"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-semibold text-slate-800">
              Repeat password <span className="text-rose-600">*</span>
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              minLength={8}
              value={form.confirmPassword}
              onChange={(event) => update('confirmPassword', event.target.value)}
              className="w-full rounded-md border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-teresa-green-700 focus:ring-2 focus:ring-teresa-green-100"
            />
          </div>
        </div>
      </section>

      {error && (
        <p className="flex items-start gap-2 rounded-md border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4 border-t border-slate-200 pt-6">
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-teresa-green-800 px-6 py-3 text-sm font-semibold text-white hover:bg-teresa-green-900 disabled:opacity-60"
        >
          {busy ? 'Submitting application…' : 'Submit application'}
        </button>
        <p className="text-xs text-slate-500">
          Already approved?{' '}
          <Link href="/login/teacher" className="font-semibold text-teresa-green-800 hover:underline">
            Sign in here
          </Link>
          .
        </p>
      </div>
    </form>
  );
}
