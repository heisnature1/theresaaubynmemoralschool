'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, Eye, EyeOff, LogIn } from 'lucide-react';

interface LoginFormProps {
  portal: 'super_admin' | 'administrator' | 'teacher';
  submitLabel: string;
}

export function LoginForm({ portal, submitLabel }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, portal }),
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        setError(data.error || 'Sign-in failed. Please try again.');
        return;
      }

      router.replace(data.redirect);
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
        <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-slate-800">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-theresa-green-700 focus:ring-4 focus:ring-theresa-green-100/70"
          placeholder="name@sttheresa-aubyn.edu.gh"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-slate-800">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 pr-11 text-sm outline-none transition focus:border-theresa-green-700 focus:ring-4 focus:ring-theresa-green-100/70"
          />
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {error && (
        <p className="flex animate-fade-in items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            {error}
            {error.includes('page') && (
              <>
                {' '}
                <Link href="/login/administrator" className="font-semibold underline">
                  Sign in here
                </Link>
                .
              </>
            )}
          </span>
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-theresa-green-800 to-theresa-green-700 px-5 py-3 text-sm font-bold text-white shadow-soft transition hover:shadow-lift disabled:opacity-60 magnetic-btn shine"
      >
        {busy ? (
          'Signing in…'
        ) : (
          <>
            <LogIn className="h-4 w-4 text-theresa-gold-300" />
            {submitLabel}
          </>
        )}
      </button>
    </form>
  );
}
