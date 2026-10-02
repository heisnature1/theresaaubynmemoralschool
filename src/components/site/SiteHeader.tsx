'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Mail, Menu, Phone, X } from 'lucide-react';
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
  const portalRef = useRef<HTMLDivElement>(null);

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
    <header className="bg-white border-b border-slate-200">
      {/* Office contact strip */}
      <div className="bg-teresa-green-900 text-emerald-50 text-[12px]">
        <div className="mx-auto max-w-6xl px-4 lg:px-6 py-2 flex flex-wrap items-center justify-between gap-2">
          <p className="hidden sm:block text-emerald-100/90">
            P.O. Box TA 188 &middot; No. 18 Teresa Aubyn Heritage Avenue &middot; Digital address{' '}
            {OFFICE_CONTACTS.digitalAddress}
          </p>
          <div className="flex items-center gap-5">
            <a href={`tel:${OFFICE_CONTACTS.mainPhone.replace(/\s/g, '')}`} className="flex items-center gap-1.5 hover:text-white">
              <Phone className="h-3.5 w-3.5" />
              {OFFICE_CONTACTS.mainPhone}
            </a>
            <a href={`mailto:${OFFICE_CONTACTS.generalEmail}`} className="hidden sm:flex items-center gap-1.5 hover:text-white">
              <Mail className="h-3.5 w-3.5" />
              {OFFICE_CONTACTS.generalEmail}
            </a>
          </div>
        </div>
      </div>

      {/* Crest, name, navigation */}
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <div className="flex items-center justify-between gap-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <SchoolCrest size="md" />
            <span className="leading-tight">
              <span className="block font-serif text-[19px] sm:text-[21px] font-bold text-teresa-green-900">
                St. Teresa Aubyn Memorial School
              </span>
              <span className="block text-[11px] uppercase tracking-[0.18em] text-teresa-gold-700">
                Nursery, Primary &amp; Junior High &middot; Est. 1988
              </span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-4">
            <Link
              href="/admissions"
              className="rounded-md border border-teresa-green-800 px-4 py-2 text-sm font-semibold text-teresa-green-900 hover:bg-teresa-green-50"
            >
              Apply for admission
            </Link>

            <div className="relative" ref={portalRef}>
              <button
                type="button"
                onClick={() => setPortalOpen((open) => !open)}
                aria-expanded={portalOpen}
                className="flex items-center gap-1.5 rounded-md bg-teresa-green-800 px-4 py-2 text-sm font-semibold text-white hover:bg-teresa-green-900"
              >
                Staff sign-in
                <ChevronDown className={`h-4 w-4 transition ${portalOpen ? 'rotate-180' : ''}`} />
              </button>

              {portalOpen && (
                <div className="absolute right-0 z-40 mt-2 w-72 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
                  {PORTAL_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block rounded-md px-3 py-2 hover:bg-slate-50"
                    >
                      <span className="block text-sm font-semibold text-slate-800">{link.label}</span>
                      <span className="block text-xs text-slate-500">{link.hint}</span>
                    </Link>
                  ))}
                  <div className="mt-1 border-t border-slate-100 pt-1">
                    <Link
                      href="/register/teacher"
                      className="block rounded-md px-3 py-2 text-sm font-semibold text-teresa-green-800 hover:bg-teresa-green-50"
                    >
                      Apply for a teaching post
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="lg:hidden rounded-md border border-slate-300 p-2 text-slate-700"
            aria-label="Open menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Primary navigation */}
        <nav className="hidden lg:flex items-center gap-7 border-t border-slate-100 py-3 text-[14px] font-medium text-slate-700">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                isActive(link.href)
                  ? 'text-teresa-green-900 font-semibold border-b-2 border-teresa-gold-500 pb-0.5'
                  : 'hover:text-teresa-green-800'
              }
            >
              {link.label}
            </Link>
          ))}
          <Link href="/register/teacher" className="ml-auto text-teresa-green-800 hover:underline">
            Teaching vacancies
          </Link>
        </nav>

        {mobileOpen && (
          <div className="lg:hidden border-t border-slate-100 pb-5">
            <nav className="grid gap-1 py-3 text-sm">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-md px-3 py-2 ${
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
                <Link key={link.href} href={link.href} className="rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                  {link.label}
                </Link>
              ))}
              <Link href="/register/teacher" className="rounded-md px-3 py-2 text-sm font-semibold text-teresa-green-800 hover:bg-teresa-green-50">
                Apply for a teaching post
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
