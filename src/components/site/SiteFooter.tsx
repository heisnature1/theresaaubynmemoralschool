import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';
import { SchoolCrest } from '@/components/SchoolCrest';
import { OFFICE_CONTACTS, TERM_DATES } from '@/lib/constants';

export function SiteFooter() {
  return (
    <footer className="relative mt-16 overflow-hidden border-t-4 border-teresa-gold-500 bg-teresa-green-950 text-emerald-50">
      <div className="pointer-events-none absolute inset-0">
        <div className="hero-blob -left-20 -top-24 h-72 w-72 bg-teresa-green-700/30" />
        <div className="hero-blob -right-16 bottom-0 h-72 w-72 bg-teresa-gold-700/20" />
        <div className="absolute inset-0 pattern-grid opacity-[0.08]" />
      </div>
      <div className="relative mx-auto max-w-6xl px-4 lg:px-6 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-start gap-3">
              <SchoolCrest size="sm" className="transition-transform duration-500 hover:rotate-6" />
              <div>
                <p className="font-serif text-lg font-bold text-white">
                  St. Teresa Aubyn Memorial School
                </p>
                <p className="text-xs italic text-teresa-gold-300">
                  &ldquo;Per Ardua Ad Astra&rdquo; &mdash; through diligence to the stars
                </p>
              </div>
            </div>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-emerald-100/85">
              A day school for boys and girls from KG 1 to JHS 3, founded in 1988 in memory of
              Madam Teresa Aubyn. We keep small classes, a serious academic programme, a hot midday
              meal for every pupil and a firm hand on good manners.
            </p>
            <dl className="mt-5 space-y-2.5 text-sm text-emerald-100/85">
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-teresa-gold-300" />
                <dd>{OFFICE_CONTACTS.mainPhone}</dd>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-teresa-gold-300" />
                <dd>{OFFICE_CONTACTS.generalEmail}</dd>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teresa-gold-300" />
                <dd>{OFFICE_CONTACTS.postalAddress}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-teresa-gold-300">
              The School
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/about" className="group inline-flex items-center gap-1.5 transition hover:text-teresa-gold-200"><span className="h-1 w-1 rounded-full bg-teresa-gold-400 transition-all duration-300 group-hover:w-3" />Our history and values</Link></li>
              <li><Link href="/academics" className="hover:text-teresa-gold-200">Academic programme</Link></li>
              <li><Link href="/academics#fees" className="hover:text-teresa-gold-200">Fee schedule</Link></li>
              <li><Link href="/academics#feeding" className="hover:text-teresa-gold-200">Feeding programme</Link></li>
              <li><Link href="/admissions" className="hover:text-teresa-gold-200">Admissions</Link></li>
              <li><Link href="/gallery" className="hover:text-teresa-gold-200">Photo gallery</Link></li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-teresa-gold-300">
              Term dates
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-emerald-100/85">
              {TERM_DATES.slice(0, 4).map((entry) => (
                <li key={entry.label}>
                  <span className="block font-semibold text-white">{entry.label}</span>
                  <span className="block text-emerald-100/75">{entry.detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-emerald-100/70 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} St. Teresa Aubyn Memorial School. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/login/administrator" className="hover:text-teresa-gold-200">Administrator sign-in</Link>
            <Link href="/login/teacher" className="hover:text-teresa-gold-200">Teacher sign-in</Link>
            <Link href="/login/super-admin" className="hover:text-teresa-gold-200">Super Administrator</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
