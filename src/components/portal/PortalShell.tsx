'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { SchoolCrest } from '@/components/SchoolCrest';
import { UserRole } from '@/types/school';

interface PortalShellProps {
  user: { fullName: string; role: UserRole; staffId: string; email: string };
  children: React.ReactNode;
}

const ROLE_LABEL: Record<UserRole, string> = {
  super_admin: 'Super Administrator',
  headmaster: 'Administrator',
  teacher: 'Teacher',
};

export function PortalShell({ user, children }: PortalShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const sections: Array<{ href: string; label: string; roles: UserRole[] }> = [
    { href: '/portal/super-admin', label: 'School overview', roles: ['super_admin'] },
    { href: '/portal/administrator', label: 'Administration', roles: ['super_admin', 'headmaster'] },
    { href: '/portal/teacher', label: 'Class teacher', roles: ['super_admin', 'headmaster', 'teacher'] },
    { href: '/portal/reports', label: 'Report cards', roles: ['super_admin', 'headmaster', 'teacher'] },
  ];

  const visibleSections = sections.filter((section) => section.roles.includes(user.role));

  async function signOut() {
    setSigningOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.replace('/');
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F2EC]">
      <header className="border-b border-slate-200 bg-white print:hidden">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4 py-4">
            <Link href="/portal" className="flex items-center gap-3">
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

            <div className="flex flex-wrap items-center gap-4">
              <div className="text-right text-sm">
                <p className="font-semibold text-slate-900">{user.fullName}</p>
                <p className="text-xs text-slate-500">
                  {ROLE_LABEL[user.role]} &middot; {user.staffId}
                </p>
              </div>
              <button
                type="button"
                onClick={signOut}
                disabled={signingOut}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                <LogOut className="h-3.5 w-3.5" />
                {signingOut ? 'Signing out…' : 'Sign out'}
              </button>
            </div>
          </div>

          <nav className="flex flex-wrap gap-1 border-t border-slate-100 py-2 text-sm">
            {visibleSections.map((section) => (
              <Link
                key={section.href}
                href={section.href}
                className={`rounded-md px-3.5 py-2 font-medium ${
                  pathname === section.href
                    ? 'bg-teresa-green-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {section.label}
              </Link>
            ))}
            <Link
              href="/"
              className="ml-auto rounded-md px-3.5 py-2 font-medium text-slate-500 hover:bg-slate-100"
            >
              Go to the school website
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-6">{children}</main>

      <footer className="mx-auto max-w-7xl px-4 pb-10 text-xs text-slate-500 lg:px-6 print:hidden">
        <p>
          Records shown here are the school&apos;s working records for {''}
          <span className="font-medium text-slate-600">the current semester</span>. Corrections
          should be raised with the Headmaster.
        </p>
      </footer>
    </div>
  );
}
