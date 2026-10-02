import Link from 'next/link';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { HOME_FOR_ROLE, getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Super Administrator sign-in | St. Teresa Aubyn Memorial School',
  description: 'Sign-in for the proprietor and governing council of St. Teresa Aubyn Memorial School.',
};

export default function SuperAdminLoginPage() {
  const session = getSession();
  if (session) redirect(HOME_FOR_ROLE[session.role]);

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="animate-pop-in overflow-hidden rounded-3xl border border-white/70 bg-white/90 p-7 shadow-lift backdrop-blur-xl sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teresa-gold-700">
          Proprietor &amp; governing council
        </p>
        <h1 className="mt-2 font-serif text-2xl font-bold text-teresa-green-950">
          Super Administrator sign-in
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          This account sees the whole school: fee income from every stream, the daily feeding
          returns, pupil records and the activity log of the office and teaching staff.
        </p>

        <div className="mt-6">
          <LoginForm
            portal="super_admin"
            submitLabel="Sign in as Super Administrator"
            previewAccount={{ email: 'owner@stteresa-aubyn.edu.gh', password: 'Teresa@1988' }}
          />
        </div>
      </div>

      <div className="mt-5 space-y-1 text-center text-sm text-slate-600">
        <p>
          <Link href="/login/administrator" className="font-semibold text-teresa-green-800 hover:underline">
            Administrator sign-in
          </Link>
          <span className="mx-2 text-slate-400">|</span>
          <Link href="/login/teacher" className="font-semibold text-teresa-green-800 hover:underline">
            Teacher sign-in
          </Link>
        </p>
        <p className="text-xs text-slate-500">
          Passwords are issued by the school office and may be changed after signing in.
        </p>
      </div>
    </div>
  );
}
