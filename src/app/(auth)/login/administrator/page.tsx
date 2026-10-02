import Link from 'next/link';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { HOME_FOR_ROLE, getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Administrator sign-in | St. Teresa Aubyn Memorial School',
  description: 'Sign-in for the Headmaster, bursary and school office staff.',
};

export default function AdministratorLoginPage() {
  const session = getSession();
  if (session) redirect(HOME_FOR_ROLE[session.role]);

  return (
    <div className="w-full max-w-md">
      <div className="rounded-md border border-slate-200 bg-white p-7 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teresa-gold-700">
          Headmaster &amp; school office
        </p>
        <h1 className="mt-2 font-serif text-2xl font-bold text-teresa-green-950">
          Administrator sign-in
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          For the Headmaster and the Bursary. From here you set the class fee schedule, record fee
          payments and receipts, review teaching applications and endorse semester reports.
        </p>

        <div className="mt-6">
          <LoginForm
            portal="administrator"
            submitLabel="Sign in as Administrator"
            previewAccount={{ email: 'headmaster@stteresa-aubyn.edu.gh', password: 'Campus@1988' }}
          />
        </div>
      </div>

      <div className="mt-5 space-y-1 text-center text-sm text-slate-600">
        <p>
          <Link href="/login/super-admin" className="font-semibold text-teresa-green-800 hover:underline">
            Super Administrator sign-in
          </Link>
          <span className="mx-2 text-slate-400">|</span>
          <Link href="/login/teacher" className="font-semibold text-teresa-green-800 hover:underline">
            Teacher sign-in
          </Link>
        </p>
        <p className="text-xs text-slate-500">
          Forgotten passwords are reset by the Super Administrator from the staff directory.
        </p>
      </div>
    </div>
  );
}
