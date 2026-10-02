'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, KeyRound, LogIn, Phone } from 'lucide-react';

/**
 * A parent signs in with the pupil's admission code and either the guardian
 * telephone number the school holds or the access PIN issued at the office.
 */
export function ParentLoginForm() {
  const router = useRouter();
  const [studentCode, setStudentCode] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/parent/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentCode, guardianPhone, pin }),
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        setError(data.error || 'Sign-in failed. Please try again.');
        return;
      }

      router.replace(data.redirect || '/parents');
      router.refresh();
    } catch {
      setError('The server could not be reached. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="studentCode" className="mb-1.5 block text-sm font-semibold text-slate-800">
          Pupil&apos;s admission code
        </label>
        <input
          id="studentCode"
          name="studentCode"
          type="text"
          required
          value={studentCode}
          onChange={(event) => setStudentCode(event.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm uppercase tracking-wide outline-none transition focus:border-theresa-green-700 focus:ring-4 focus:ring-theresa-green-100/70"
          placeholder="STA/2026/101"
        />
        <p className="mt-1.5 text-xs text-slate-500">
          The code is printed on the pupil&apos;s report card and fee receipts.
        </p>
      </div>

      <div>
        <label
          htmlFor="guardianPhone"
          className="mb-1.5 block text-sm font-semibold text-slate-800"
        >
          Guardian telephone number
        </label>
        <div className="relative">
          <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="guardianPhone"
            name="guardianPhone"
            type="tel"
            value={guardianPhone}
            onChange={(event) => setGuardianPhone(event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3.5 text-sm outline-none transition focus:border-theresa-green-700 focus:ring-4 focus:ring-theresa-green-100/70"
            placeholder="+233 24 000 1111"
          />
        </div>
        <p className="mt-1.5 text-xs text-slate-500">
          The number the school has on the pupil&apos;s record.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-slate-200" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">or</span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <div>
        <label htmlFor="pin" className="mb-1.5 block text-sm font-semibold text-slate-800">
          Parent access PIN
        </label>
        <div className="relative">
          <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="pin"
            name="pin"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={pin}
            onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 6))}
            className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3.5 text-sm tracking-[0.3em] outline-none transition focus:border-theresa-green-700 focus:ring-4 focus:ring-theresa-green-100/70"
            placeholder="••••••"
          />
        </div>
        <p className="mt-1.5 text-xs text-slate-500">
          Issued by the school office. Ask for one if you do not have it.
        </p>
      </div>

      {error && (
        <p className="flex animate-fade-in items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-theresa-green-800 to-theresa-green-700 px-5 py-3 text-sm font-bold text-white shadow-soft transition hover:shadow-lift disabled:opacity-60 magnetic-btn shine"
      >
        {busy ? (
          'Opening your children\u2019s records…'
        ) : (
          <>
            <LogIn className="h-4 w-4 text-theresa-gold-300" />
            Sign in as a parent
          </>
        )}
      </button>

      <p className="text-center text-xs text-slate-500">
        Not sure of the code?{' '}
        <Link href="/contact" className="font-semibold text-theresa-green-800 hover:underline">
          Contact the school office
        </Link>
        .
      </p>
    </form>
  );
}
