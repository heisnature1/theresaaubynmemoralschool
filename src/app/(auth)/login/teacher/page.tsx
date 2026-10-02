import Link from 'next/link';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { HOME_FOR_ROLE, getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Teacher sign-in | St. Teresa Aubyn Memorial School',
  description: 'Sign-in for class and subject teachers.',
};

export default function TeacherLoginPage() {
  const session = getSession();
  if (session) redirect(HOME_FOR_ROLE[session.role]);

  return (
    <div className="w-full max-w-md">
      <div className="rounded-md border border-slate-200 bg-white p-7 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teresa-gold-700">
          Class &amp; subject teachers
        </p>
        <h1 className="mt-2 font-serif text-2xl font-bold text-teresa-green-950">Teacher sign-in</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Enter continuous assessment and examination marks, keep the daily feeding register for
          your class, and print the end-of-semester report cards.
        </p>

        <div className="mt-6">
          <LoginForm
            portal="teacher"
            submitLabel="Sign in as Teacher"
            previewAccount={{ email: 'e.oseitutu@stteresa-aubyn.edu.gh', password: 'Teacher@2026' }}
          />
        </div>

        <p className="mt-6 border-t border-slate-100 pt-5 text-sm text-slate-600">
          Not yet on the staff?{' '}
          <Link href="/register/teacher" className="font-semibold text-teresa-green-800 hover:underline">
            Apply for a teaching post
          </Link>
          .
        </p>
      </div>

      <div className="mt-5 space-y-1 text-center text-sm text-slate-600">
        <p>
          <Link href="/login/administrator" className="font-semibold text-teresa-green-800 hover:underline">
            Administrator sign-in
          </Link>
          <span className="mx-2 text-slate-400">|</span>
          <Link href="/login/super-admin" className="font-semibold text-teresa-green-800 hover:underline">
            Super Administrator sign-in
          </Link>
        </p>
      </div>
    </div>
  );
}
