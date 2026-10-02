import React from 'react';
import Link from 'next/link';
import { SchoolCrest } from '@/components/SchoolCrest';
import { OFFICE_CONTACTS } from '@/lib/constants';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F4F1E8]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 lg:px-6">
          <Link href="/" className="flex items-center gap-3">
            <SchoolCrest size="sm" />
            <span className="leading-tight">
              <span className="block font-serif text-base font-bold text-teresa-green-900">
                St. Teresa Aubyn Memorial School
              </span>
              <span className="block text-[11px] uppercase tracking-[0.16em] text-teresa-gold-700">
                Staff portal
              </span>
            </span>
          </Link>
          <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-teresa-green-800">
            &larr; Back to the school website
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-start justify-center px-4 py-10 lg:py-14">{children}</main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-6">
          <p>
            Trouble signing in? Telephone the school office on{' '}
            <a href={`tel:${OFFICE_CONTACTS.mainPhone.replace(/\s/g, '')}`} className="font-semibold text-slate-700">
              {OFFICE_CONTACTS.mainPhone}
            </a>
            .
          </p>
          <p>&copy; {new Date().getFullYear()} St. Teresa Aubyn Memorial School</p>
        </div>
      </footer>
    </div>
  );
}
