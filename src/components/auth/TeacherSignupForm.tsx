'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Lock,
  PartyPopper,
  UserRound,
} from 'lucide-react';
import { SCHOOL_CLASSES, SCHOOL_SUBJECTS } from '@/lib/grading';
import { PhotoCapture } from '@/components/ui/PhotoCapture';

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
  passportPhoto: string;
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
  passportPhoto: '',
};

function SectionHeading({
  icon: Icon,
  step,
  title,
  description,
}: {
  icon: typeof UserRound;
  step: number;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-theresa-green-800 to-theresa-green-600 font-serif text-sm font-bold text-white shadow-soft">
        {step}
      </span>
      <div>
        <h2 className="flex items-center gap-2 font-serif text-lg font-bold text-theresa-green-950">
          <Icon className="h-4 w-4 text-theresa-gold-700" />
          {title}
        </h2>
        {description && <p className="mt-1 text-sm leading-relaxed text-slate-600">{description}</p>}
      </div>
    </div>
  );
}

const fieldClass =
  'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-theresa-green-700 focus:ring-4 focus:ring-theresa-green-100/70';

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
    if (!form.passportPhoto) {
      setError('Please add your passport photograph — take one with the camera or upload a file.');
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
          passportPhoto: form.passportPhoto,
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
      <div className="animate-pop-in overflow-hidden rounded-3xl border border-theresa-green-200 bg-gradient-to-br from-theresa-green-50 via-white to-theresa-green-50/60 p-8 text-center shadow-soft sm:p-10">
        <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-theresa-green-800 text-white shadow-lift animate-glow-pulse">
          <PartyPopper className="h-8 w-8" />
        </span>
        <h2 className="mt-5 font-serif text-2xl font-bold text-theresa-green-950">
          Your application has been received
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-700">
          Reference <strong className="font-mono">{reference}</strong>. The Headmaster reviews
          applications with the proprietor, normally within one week. Your passport photograph has
          been attached to the application. If you are approved you will be able to sign in with the
          email address and password you have just chosen.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/login/teacher"
            className="group inline-flex items-center gap-2 rounded-xl bg-theresa-green-800 px-5 py-3 text-sm font-bold text-white shadow-soft magnetic-btn shine"
          >
            Go to the teacher sign-in page
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-theresa-green-600 hover:text-theresa-green-800"
          >
            Back to the school website
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* ---------------------------------------------------------------- */}
      {/* Your details                                                     */}
      {/* ---------------------------------------------------------------- */}
      <section className="animate-fade-up rounded-2xl border border-slate-200/80 bg-white p-6 shadow-soft">
        <SectionHeading icon={UserRound} step={1} title="Your details" />

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
              className={fieldClass}
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
              className={fieldClass}
              placeholder="+233 24 000 0000"
            />
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-slate-800">
            Email address <span className="text-rose-600">*</span>
          </label>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(event) => update('email', event.target.value)}
            className={fieldClass}
            placeholder="you@example.com"
          />
          <p className="mt-1 text-xs text-slate-500">
            This becomes your sign-in name if the application is approved.
          </p>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Passport photograph                                              */}
      {/* ---------------------------------------------------------------- */}
      <section className="animate-fade-up anim-delay-2 rounded-2xl border border-theresa-green-200 bg-gradient-to-br from-white to-theresa-green-50/50 p-6 shadow-soft">
        <PhotoCapture
          value={form.passportPhoto || undefined}
          onChange={(dataUrl) => update('passportPhoto', dataUrl ?? '')}
          label="Passport photograph"
          caption="Applicant's passport photograph"
          hint="Take the picture here with your camera, or upload a recent passport-sized photograph. It is kept with your application and used on the staff record."
          required
          disabled={busy}
          shape="passport"
        />
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Teaching background                                              */}
      {/* ---------------------------------------------------------------- */}
      <section className="animate-fade-up anim-delay-3 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-soft">
        <SectionHeading
          icon={GraduationCap}
          step={2}
          title="Teaching background"
          description="Tell us what you are qualified to teach."
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label
              htmlFor="qualification"
              className="mb-1.5 block text-sm font-semibold text-slate-800"
            >
              Highest qualification <span className="text-rose-600">*</span>
            </label>
            <input
              id="qualification"
              required
              value={form.qualification}
              onChange={(event) => update('qualification', event.target.value)}
              className={fieldClass}
              placeholder="e.g. B.Ed. Mathematics (UEW)"
            />
          </div>
          <div>
            <label
              htmlFor="experienceYears"
              className="mb-1.5 block text-sm font-semibold text-slate-800"
            >
              Years of experience
            </label>
            <input
              id="experienceYears"
              type="number"
              min={0}
              max={45}
              value={form.experienceYears}
              onChange={(event) => update('experienceYears', event.target.value)}
              className={fieldClass}
            />
          </div>
        </div>

        <div className="mt-4">
          <label
            htmlFor="requestedClass"
            className="mb-1.5 block text-sm font-semibold text-slate-800"
          >
            Class you would prefer
          </label>
          <select
            id="requestedClass"
            value={form.requestedClass}
            onChange={(event) => update('requestedClass', event.target.value)}
            className={fieldClass}
          >
            {SCHOOL_CLASSES.map((className) => (
              <option key={className} value={className}>
                {className}
              </option>
            ))}
          </select>
        </div>

        <fieldset className="mt-5">
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
                  className={`rounded-xl border px-3.5 py-1.5 text-xs font-semibold transition-all duration-300 ${
                    selected
                      ? 'border-theresa-green-800 bg-theresa-green-800 text-white shadow-soft scale-105'
                      : 'border-slate-300 bg-white text-slate-700 hover:border-theresa-green-600 hover:text-theresa-green-800'
                  }`}
                >
                  {subject}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-5">
          <label htmlFor="statement" className="mb-1.5 block text-sm font-semibold text-slate-800">
            A short statement
          </label>
          <textarea
            id="statement"
            rows={4}
            value={form.statement}
            onChange={(event) => update('statement', event.target.value)}
            className={fieldClass}
            placeholder="Tell the Headmaster briefly about your teaching experience and why you would like to join the school."
          />
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Password                                                         */}
      {/* ---------------------------------------------------------------- */}
      <section className="animate-fade-up anim-delay-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-soft">
        <SectionHeading
          icon={Lock}
          step={3}
          title="Choose a password"
          description="You will use this password to sign in once your application has been approved. It must be at least eight characters and contain a letter and a number."
        />
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
              className={fieldClass}
            />
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1.5 block text-sm font-semibold text-slate-800"
            >
              Repeat password <span className="text-rose-600">*</span>
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              minLength={8}
              value={form.confirmPassword}
              onChange={(event) => update('confirmPassword', event.target.value)}
              className={fieldClass}
            />
          </div>
        </div>
      </section>

      {error && (
        <p className="flex animate-fade-in items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-theresa-green-900/95 p-5 text-white shadow-lift">
        <button
          type="submit"
          disabled={busy}
          className="group inline-flex items-center gap-2 rounded-xl bg-theresa-gold-400 px-6 py-3 text-sm font-bold text-theresa-green-950 transition hover:bg-theresa-gold-300 disabled:opacity-60 magnetic-btn shine"
        >
          {busy ? 'Submitting application…' : 'Submit application'}
          {!busy && (
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          )}
        </button>
        <p className="text-xs text-emerald-100/80">
          Already approved?{' '}
          <Link
            href="/login/teacher"
            className="font-semibold text-theresa-gold-300 hover:underline"
          >
            Sign in here
          </Link>
          .
        </p>
        <p className="ml-auto hidden items-center gap-1.5 text-xs text-emerald-100/70 sm:flex">
          <CheckCircle2 className="h-3.5 w-3.5 text-theresa-gold-300" />
          Reviewed by the Headmaster within a week
        </p>
      </div>
    </form>
  );
}
