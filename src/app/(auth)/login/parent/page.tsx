import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ParentLoginForm } from '@/components/auth/ParentLoginForm';
import { getParentSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Parent sign-in | St Theresa Aubyn Memorial School',
  description:
    "Parents sign in with their child's admission code to see fees, feeding, attendance and reports.",
};

export default function ParentLoginPage() {
  const session = getParentSession();
  if (session) redirect('/parents');

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="animate-pop-in overflow-hidden rounded-3xl border border-white/70 bg-white/90 p-7 shadow-lift backdrop-blur-xl sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-theresa-gold-700">
          Parents &amp; guardians
        </p>
        <h1 className="mt-2 font-serif text-2xl font-bold text-theresa-green-950">
          Parent sign-in
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          See your child&apos;s fee position, feeding account, attendance, subject marks and
          terminal report card. Brothers and sisters on the same telephone number open together.
        </p>

        <div className="mt-6">
          <ParentLoginForm />
        </div>
      </div>

      <div className="mt-5 space-y-1 text-center text-sm text-slate-600">
        <p>
          <Link
            href="/login/administrator"
            className="font-semibold text-theresa-green-800 hover:underline"
          >
            Staff sign-in
          </Link>
          <span className="mx-2 text-slate-400">|</span>
          <Link
            href="/register/teacher"
            className="font-semibold text-theresa-green-800 hover:underline"
          >
            Apply for a teaching post
          </Link>
        </p>
      </div>
    </div>
  );
}
