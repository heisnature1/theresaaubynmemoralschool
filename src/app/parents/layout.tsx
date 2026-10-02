import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Users } from 'lucide-react';
import { SchoolCrest } from '@/components/SchoolCrest';
import { GradientArt } from '@/components/site/GradientArt';
import { SCHOOL_NAME } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Parents' area | St Theresa Aubyn Memorial School",
};

/**
 * The parents' area has its own shell: a quiet green field with the crest, the
 * school's name, and a way back to the website. It is separate from the staff
 * portal because parents are not members of staff.
 */
export default function ParentsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-[#F7F5EE]">
      <header className="relative isolate overflow-hidden">
        <GradientArt variant="parent" className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-r from-theresa-green-950/85 via-theresa-green-900/70 to-theresa-green-950/85" />

        <div className="relative mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-6 lg:px-6">
          <Link href="/" className="group flex items-center gap-3">
            <SchoolCrest size="sm" className="transition-transform duration-500 group-hover:scale-110" />
            <span className="leading-tight">
              <span className="block font-serif text-base font-bold text-white">{SCHOOL_NAME}</span>
              <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-theresa-gold-300">
                <Users className="h-3 w-3" />
                Parents&apos; area
              </span>
            </span>
          </Link>

          <Link
            href="/"
            className="group inline-flex items-center gap-1.5 rounded-xl border border-white/25 bg-white/10 px-3.5 py-2 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
            School website
          </Link>
        </div>

        <div className="relative mx-auto max-w-6xl px-4 pb-8 lg:px-6">
          <h1 className="font-serif text-2xl font-bold text-white sm:text-3xl">
            Your children&apos;s school records
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-emerald-50/85">
            Fees and receipts, the midday meal account, attendance, subject marks and the terminal
            report card — as the school office has recorded them.
          </p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 lg:px-6 lg:py-10">{children}</main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-6">
          <p>&copy; {new Date().getFullYear()} {SCHOOL_NAME}</p>
          <p>
            Something not right?{' '}
            <Link href="/contact" className="font-semibold text-theresa-green-800 hover:underline">
              Contact the school office
            </Link>
            .
          </p>
        </div>
      </footer>
    </div>
  );
}
