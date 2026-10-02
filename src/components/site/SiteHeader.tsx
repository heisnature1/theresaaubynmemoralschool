'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Mail, Menu, Phone, Sparkles, X } from 'lucide-react';
import { SchoolCrest } from '@/components/SchoolCrest';
import { OFFICE_CONTACTS } from '@/lib/constants';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About the School' },
  { href: '/academics', label: 'Academics & Fees' },
  { href: '/admissions', label: 'Admissions' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/contact', label: 'Contact' },
];

const PORTAL_LINKS = [
  { href: '/login/super-admin', label: 'Super Administrator', hint: 'Proprietor and governing council' },
  { href: '/login/administrator', label: 'Administrator', hint: 'Headmaster, bursary and office staff' },
  { href: '/login/teacher', label: 'Teacher', hint: 'Class and subject teachers' },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [portalOpen, setPortalOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const portalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 26);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (portalRef.current && !portalRef.current.contains(event.target as Node)) {
        setPortalOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => {
    setPortalOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'border-b border-slate-200/80 bg-white/85 shadow-[0_10px_30px_-24px_rgba(9,57,42,0.45)] backdrop-blur-xl'
          : 'border-b border-transparent bg-white'
      }`}
    >
      {/* Office contact strip — slides away once the reader scrolls */}
      <div
        className={`overflow-hidden bg-gradient-to-r from-teresa-green-950 via-teresa-green-900 to-teresa-green-950 text-[12px] text-emerald-50 transition-all duration-500 ${
          scrolled ? 'max-h-0 opacity-0' : 'max-h-12 opacity-100'
        }`}
      >
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2 lg:px-6">
          <p className="hidden items-center gap-2 text-emerald-100/90 sm:flex">
            <span className="inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-teresa-gold-400" />
            P.O. Box TA 188 &middot; No. 18 Teresa Aubyn Heritage Avenue &middot; {OFFICE_CONTACTS.digitalAddress}
          </p>
          <div className="flex items-center gap-5">
            <a
              href={`tel:${OFFICE_CONTACTS.mainPhone.replace(/\s/g, '')}`}
              className="flex items-center gap-1.5 transition hover:text-teresa-gold-300"
            >
              <Phone className="h-3.5 w-3.5" />
              {OFFICE_CONTACTS.mainPhone}
            </a>
            <a
              href={`mailto:${OFFICE_CONTACTS.generalEmail}`}
              className="hidden items-center gap-1.5 transition hover:text-teresa-gold-300 sm:flex"
            >
              <Mail className="h-3.5 w-3.5" />
              {OFFICE_CONTACTS.generalEmail}
            </a>
          </div>
        </div>
      </div>

      {/* Crest, name, navigation */}
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <div
          className={`flex items-center justify-between gap-6 transition-all duration-500 ${
            scrolled ? 'py-2.5' : 'py-4'
          }`}
        >
          <Link href="/" className="group flex items-center gap-3">
            <span className="relative">
              <SchoolCrest size="md" className="transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6" />
              <span className="absolute inset-0 -z-10 rounded-full bg-teresa-gold-400/30 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100" />
            </span>
            <span className="leading-tight">
              <span className="block font-serif text-[17px] font-bold text-teresa-green-900 sm:text-[21px]">
                St. Teresa Aubyn Memorial School
              </span>
              <span className="block text-[10px] uppercase tracking-[0.18em] text-teresa-gold-700 sm:text-[11px]">
                Nursery, Primary &amp; Junior High &middot; Est. 1988
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/admissions"
              className="group relative overflow-hidden rounded-xl border border-teresa-green-800 px-4 py-2 text-sm font-semibold text-teresa-green-900 transition hover:text-white"
            >
              <span className="absolute inset-0 -translate-y-full bg-teresa-green-800 transition-transform duration-400 group-hover:translate-y-0 ease-[cubic-bezier(0.16,1,0.3,1)]" />
              <span className="relative">Apply for admission</span>
            </Link>

            <div className="relative" ref={portalRef}>
              <button
                type="button"
                onClick={() => setPortalOpen((open) => !open)}
                aria-expanded={portalOpen}
                className="group inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teresa-green-800 to-teresa-green-700 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:shadow-lift magnetic-btn shine"
              >
                <Sparkles className="h-4 w-4 text-teresa-gold-300" />
                Staff sign-in
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-300 ${portalOpen ? 'rotate-180' : ''}`}
                />
              </button>

              <div
                className={`absolute right-0 z-40 mt-3 w-72 origin-top-right rounded-2xl border border-slate-200/80 bg-white/95 p-2 shadow-lift backdrop-blur-xl transition-all duration-300 ${
                  portalOpen
                    ? 'pointer-events-auto scale-100 opacity-100'
                    : 'pointer-events-none -translate-y-2 scale-95 opacity-0'
                }`}
              >
                {PORTAL_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block rounded-xl px-3 py-2 transition hover:bg-teresa-green-50"
                  >
                    <span className="block text-sm font-semibold text-slate-800">{link.label}</span>
                    <span className="block text-xs text-slate-500">{link.hint}</span>
                  </Link>
                ))}
                <div className="mt-1 border-t border-slate-100 pt-1">
                  <Link
                    href="/register/teacher"
                    className="block rounded-xl px-3 py-2 text-sm font-semibold text-teresa-green-800 transition hover:bg-teresa-green-50"
                  >
                    Apply for a teaching post
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="rounded-xl border border-slate-300 p-2 text-slate-700 transition hover:bg-slate-50 lg:hidden"
            aria-label="Open menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Primary navigation */}
        <nav className="hidden items-center gap-7 border-t border-slate-100 py-3 text-[14px] font-medium text-slate-700 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              data-active={isActive(link.href)}
              className={`underline-grow transition-colors ${
                isActive(link.href) ? 'font-semibold text-teresa-green-900' : 'hover:text-teresa-green-800'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/register/teacher"
            className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-teresa-gold-100 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-teresa-gold-800 transition hover:bg-teresa-gold-200"
          >
            <span className="inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-teresa-gold-600" />
            Teaching vacancies
          </Link>
        </nav>

        {/* Mobile drawer */}
        <div
          className={`overflow-hidden transition-all duration-500 lg:hidden ${
            mobileOpen ? 'max-h-[560px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="border-t border-slate-100 pb-5">
            <nav className="grid gap-1 py-3 text-sm">
              {NAV_LINKS.map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{ animationDelay: `${index * 40}ms` }}
                  className={`animate-fade-right rounded-xl px-3 py-2 ${
                    isActive(link.href)
                      ? 'bg-teresa-green-50 font-semibold text-teresa-green-900'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="grid gap-1 border-t border-slate-100 pt-3">
              <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Staff sign-in
              </p>
              {PORTAL_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/register/teacher"
                className="rounded-xl px-3 py-2 text-sm font-semibold text-teresa-green-800 hover:bg-teresa-green-50"
              >
                Apply for a teaching post
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
