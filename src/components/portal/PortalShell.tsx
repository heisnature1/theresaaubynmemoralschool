'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  CalendarRange,
  ChevronsLeft,
  ChevronsRight,
  ClipboardList,
  FileSpreadsheet,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  School,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react';
import { SchoolCrest } from '@/components/SchoolCrest';
import { UserRole } from '@/types/school';

interface PortalShellProps {
  user: { fullName: string; role: UserRole; staffId: string; email: string; photo?: string };
  children: React.ReactNode;
  currentSemester?: string;
  pendingApplications?: number;
  pupilCount?: number;
}

const ROLE_LABEL: Record<UserRole, string> = {
  super_admin: 'Super Administrator',
  headmaster: 'Administrator',
  teacher: 'Teacher',
};

interface NavItem {
  href: string;
  label: string;
  shortLabel: string;
  icon: typeof LayoutDashboard;
  roles: UserRole[];
  hint: string;
  badge?: 'applications';
}

const NAV_ITEMS: NavItem[] = [
  {
    href: '/portal/super-admin',
    label: 'School overview',
    shortLabel: 'Overview',
    icon: LayoutDashboard,
    roles: ['super_admin'],
    hint: 'Income, pupils, staff and the audit trail',
  },
  {
    href: '/portal/administrator',
    label: 'Administration',
    shortLabel: 'Admin',
    icon: ShieldCheck,
    roles: ['super_admin', 'headmaster'],
    hint: 'Fees, receipts and teaching applications',
    badge: 'applications',
  },
  {
    href: '/portal/administrator?tab=admissions',
    label: 'Admissions',
    shortLabel: 'Admissions',
    icon: GraduationCap,
    roles: ['super_admin', 'headmaster'],
    hint: 'Enrol a pupil and capture their photograph',
  },
  {
    href: '/portal/teacher',
    label: 'Class teacher',
    shortLabel: 'Classes',
    icon: ClipboardList,
    roles: ['super_admin', 'headmaster', 'teacher'],
    hint: 'Marks, feeding register and remarks',
  },
  {
    href: '/portal/reports',
    label: 'Report cards',
    shortLabel: 'Reports',
    icon: FileSpreadsheet,
    roles: ['super_admin', 'headmaster', 'teacher'],
    hint: 'Terminal reports and PDF downloads',
  },
];

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/portal/super-admin': {
    title: 'School overview',
    subtitle: 'Fee income, pupil records, staff and the audit trail for the whole school.',
  },
  '/portal/administrator': {
    title: 'Administration',
    subtitle: 'Fee schedules, payments and receipts, admissions and teaching applications.',
  },
  '/portal/teacher': {
    title: 'Class teacher',
    subtitle: 'Continuous assessment, the daily feeding register and class remarks.',
  },
  '/portal/reports': {
    title: 'Report cards',
    subtitle: 'Terminal reports for every pupil, printable or downloadable as a PDF.',
  },
};

export function PortalShell({
  user,
  children,
  currentSemester,
  pendingApplications = 0,
  pupilCount = 0,
}: PortalShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem('theresa-portal-collapsed') === '1');
    } catch {
      /* storage unavailable — stay expanded */
    }
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  function toggleCollapsed() {
    setCollapsed((current) => {
      const next = !current;
      try {
        window.localStorage.setItem('theresa-portal-collapsed', next ? '1' : '0');
      } catch {
        /* ignore */
      }
      return next;
    });
  }

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

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(user.role));
  const activeTab = searchParams.get('tab');

  const isActive = (href: string) => {
    const [base, query] = href.split('?');
    if (base !== pathname) return false;
    const tab = new URLSearchParams(query || '').get('tab');
    return tab ? activeTab === tab : !activeTab;
  };

  const pageMeta = PAGE_TITLES[pathname] ?? {
    title: 'Staff portal',
    subtitle: 'The school’s working records.',
  };

  const initials = user.fullName
    .replace(/^(Rev\. Fr\.|Dr\.|Mr\.|Mrs\.|Ms\.|Mad\.|Ing\.|Engr\.)\s*/i, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <div className="relative isolate min-h-screen bg-[#F4F2EC] print:bg-white">
      {/* Faint grid over the workspace background */}
      <div className="pointer-events-none absolute inset-0 pattern-grid opacity-[0.35] print:hidden" />
      {/* ================================================================ */}
      {/* Sidebar                                                          */}
      {/* ================================================================ */}
      <aside
        className={`print:hidden fixed inset-y-0 left-0 z-50 flex flex-col bg-gradient-to-b from-theresa-green-950 via-theresa-green-900 to-[#04251a] text-white transition-[width,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          collapsed ? 'lg:w-[92px]' : 'lg:w-[288px]'
        } w-[288px] ${
          drawerOpen ? 'translate-x-0 shadow-[0_0_80px_rgba(0,0,0,0.5)]' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Decoration */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="hero-blob -left-16 top-10 h-56 w-56 bg-theresa-green-600/30 animate-float-slow" />
          <div className="hero-blob -right-14 bottom-24 h-52 w-52 bg-theresa-gold-600/20 animate-float" />
          <div className="absolute inset-0 pattern-grid opacity-[0.07]" />
        </div>

        {/* Crest + school name */}
        <div className="relative flex items-center gap-3 border-b border-white/10 px-5 py-5">
          <SchoolCrest size="md" className="shrink-0 drop-shadow-[0_6px_18px_rgba(0,0,0,0.45)]" />
          {!collapsed && (
            <div className="min-w-0 animate-fade-in">
              <p className="truncate font-serif text-[15px] font-bold leading-tight text-white">
                St Theresa Aubyn
              </p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-theresa-gold-300">
                Staff portal
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="ml-auto rounded-lg p-1.5 text-emerald-100/70 transition hover:bg-white/10 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="relative flex-1 space-y-1.5 overflow-y-auto px-3 py-5">
          {!collapsed && (
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-100/40">
              Workspace
            </p>
          )}

          {visibleItems.map((item, index) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                style={{ animationDelay: `${index * 60}ms` }}
                className={`group relative flex animate-fade-right items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-300 ${
                  active
                    ? 'bg-gradient-to-r from-theresa-gold-400 to-theresa-gold-500 text-theresa-green-950 shadow-[0_10px_30px_-14px_rgba(217,175,55,0.9)]'
                    : 'text-emerald-50/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span
                  className={`absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-theresa-gold-300 transition-all duration-300 ${
                    active ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
                  }`}
                />
                <item.icon
                  className={`h-[18px] w-[18px] shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                    active ? 'text-theresa-green-950' : 'text-theresa-gold-300'
                  }`}
                />
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge === 'applications' && pendingApplications > 0 && (
                      <span
                        className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-extrabold ${
                          active ? 'bg-theresa-green-950 text-theresa-gold-300' : 'bg-rose-500 text-white'
                        }`}
                      >
                        {pendingApplications}
                      </span>
                    )}
                  </>
                )}
                {collapsed && item.badge === 'applications' && pendingApplications > 0 && (
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
                )}
              </Link>
            );
          })}

          {!collapsed && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 animate-fade-in">
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-theresa-gold-300">
                <CalendarRange className="h-3.5 w-3.5" />
                {currentSemester || 'Current semester'}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-emerald-100/70">
                {pupilCount} pupils on the roll. Records shown here are the school&apos;s working
                records.
              </p>
            </div>
          )}
        </nav>

        {/* Collapse toggle: desktop only */}
        <button
          type="button"
          onClick={toggleCollapsed}
          className="relative mx-3 mb-3 hidden items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-semibold text-emerald-100/80 transition hover:bg-white/10 lg:flex"
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          {!collapsed && 'Collapse menu'}
        </button>

        {/* User card */}
        <div className="relative border-t border-white/10 p-3">
          <div
            className={`flex items-center gap-3 rounded-xl bg-white/5 p-2.5 transition ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            {user.photo ? (
              <img
                src={user.photo}
                alt={user.fullName}
                className="h-10 w-10 shrink-0 rounded-full border-2 border-theresa-gold-400/60 object-cover"
              />
            ) : (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-theresa-gold-400/60 bg-theresa-green-800 text-xs font-bold text-theresa-gold-200">
                {initials || <UserRound className="h-4 w-4" />}
              </span>
            )}
            {!collapsed && (
              <div className="min-w-0 flex-1 animate-fade-in">
                <p className="truncate text-sm font-bold text-white">{user.fullName}</p>
                <p className="truncate text-[11px] text-emerald-100/70">
                  {ROLE_LABEL[user.role]} &middot; {user.staffId}
                </p>
              </div>
            )}
            {!collapsed && (
              <button
                type="button"
                onClick={signOut}
                disabled={signingOut}
                title="Sign out"
                className="rounded-lg p-2 text-emerald-100/70 transition hover:bg-rose-500/20 hover:text-rose-200 disabled:opacity-60"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>

          {!collapsed && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/10 px-2 py-2 text-[11px] font-semibold text-emerald-100/80 transition hover:bg-white/10"
              >
                <School className="h-3.5 w-3.5" />
                Website
              </Link>
              <button
                type="button"
                onClick={signOut}
                disabled={signingOut}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/10 px-2 py-2 text-[11px] font-semibold text-emerald-100/80 transition hover:bg-white/10 disabled:opacity-60"
              >
                <LogOut className="h-3.5 w-3.5" />
                {signingOut ? 'Signing out…' : 'Sign out'}
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Drawer backdrop */}
      {drawerOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setDrawerOpen(false)}
          className="print:hidden fixed inset-0 z-40 animate-fade-in bg-theresa-green-950/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* ================================================================ */}
      {/* Main column                                                      */}
      {/* ================================================================ */}
      <div
        className={`flex min-h-screen flex-col transition-[padding] duration-500 print:pl-0 ${
          collapsed ? 'lg:pl-[92px]' : 'lg:pl-[288px]'
        }`}
      >
        <header className="print:hidden sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
          <div className="flex flex-wrap items-center gap-3 px-4 py-3.5 lg:px-8">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="rounded-xl border border-slate-300 p-2 text-slate-700 transition hover:bg-slate-50 lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-theresa-gold-700">
                {ROLE_LABEL[user.role]}
              </p>
              <h1 className="truncate font-serif text-xl font-bold text-theresa-green-950 lg:text-2xl">
                {pageMeta.title}
              </h1>
            </div>

            <div className="hidden items-center gap-3 md:flex">
              {currentSemester && (
                <span className="rounded-full border border-theresa-green-200 bg-theresa-green-50 px-3.5 py-1.5 text-[11px] font-bold text-theresa-green-800">
                  {currentSemester}
                </span>
              )}
              <span className="rounded-full bg-slate-100 px-3.5 py-1.5 text-[11px] font-mono font-bold text-slate-600">
                {user.staffId}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-bold text-slate-900">{user.fullName}</p>
                <p className="text-[11px] text-slate-500">{user.email}</p>
              </div>
              {user.photo ? (
                <img
                  src={user.photo}
                  alt={user.fullName}
                  className="h-10 w-10 rounded-full border-2 border-white object-cover shadow-soft"
                />
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-theresa-green-800 to-theresa-green-600 text-xs font-bold text-white shadow-soft">
                  {initials}
                </span>
              )}
            </div>
          </div>
        </header>

        <main
          key={pathname}
          className="mx-auto w-full max-w-[1480px] flex-1 animate-fade-up px-4 py-6 lg:px-8 lg:py-8"
        >
          {children}
        </main>

        <footer className="print:hidden px-4 pb-8 text-xs text-slate-500 lg:px-8">
          <p>
            Records shown here are the school&apos;s working records for{' '}
            <span className="font-medium text-slate-600">{currentSemester || 'the current semester'}</span>.
            Corrections should be raised with the Headmaster.
          </p>
        </footer>
      </div>
    </div>
  );
}
