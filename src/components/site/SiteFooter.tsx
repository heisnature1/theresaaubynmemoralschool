import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';
import { SchoolCrest } from '@/components/SchoolCrest';
import { SCHOOL_NAME } from '@/lib/constants';
import { SchoolInformation, SiteTermDate } from '@/types/school';

/**
 * The site footer. Contact lines, the motto and the term dates appear only when
 * the school has published them; nothing is filled in by hand here.
 */
export function SiteFooter({
  info,
  termDates,
}: {
  info: SchoolInformation | null;
  termDates: SiteTermDate[];
}) {
  const hasContacts = Boolean(info?.mainPhone || info?.generalEmail || info?.postalAddress);

  return (
    <footer className="relative mt-16 overflow-hidden border-t-4 border-theresa-gold-500 bg-theresa-green-950 text-emerald-50">
      <div className="pointer-events-none absolute inset-0">
        <div className="hero-blob -left-20 -top-24 h-72 w-72 bg-theresa-green-700/30" />
        <div className="hero-blob -right-16 bottom-0 h-72 w-72 bg-theresa-gold-700/20" />
        <div className="absolute inset-0 pattern-grid opacity-[0.08]" />
      </div>
      <div className="relative mx-auto max-w-6xl px-4 lg:px-6 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-start gap-3">
              <SchoolCrest size="sm" className="transition-transform duration-500 hover:rotate-6" />
              <div>
                <p className="font-serif text-lg font-bold text-white">
                  {info?.schoolName || SCHOOL_NAME}
                </p>
                {info?.motto && (
                  <p className="text-xs italic text-theresa-gold-300">&ldquo;{info.motto}&rdquo;</p>
                )}
              </div>
            </div>

            {info?.aboutSummary && (
              <p className="mt-4 max-w-md text-sm leading-relaxed text-emerald-100/85">
                {info.aboutSummary}
              </p>
            )}

            {hasContacts && (
              <dl className="mt-5 space-y-2.5 text-sm text-emerald-100/85">
                {info?.mainPhone && (
                  <div className="flex items-center gap-2.5">
                    <Phone className="h-4 w-4 shrink-0 text-theresa-gold-300" />
                    <dd>{info.mainPhone}</dd>
                  </div>
                )}
                {info?.generalEmail && (
                  <div className="flex items-center gap-2.5">
                    <Mail className="h-4 w-4 shrink-0 text-theresa-gold-300" />
                    <dd>{info.generalEmail}</dd>
                  </div>
                )}
                {info?.postalAddress && (
                  <div className="flex items-start gap-2.5">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-theresa-gold-300" />
                    <dd>{info.postalAddress}</dd>
                  </div>
                )}
              </dl>
            )}
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-theresa-gold-300">
              The School
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/about" className="group inline-flex items-center gap-1.5 transition hover:text-theresa-gold-200"><span className="h-1 w-1 rounded-full bg-theresa-gold-400 transition-all duration-300 group-hover:w-3" />Our history and values</Link></li>
              <li><Link href="/academics" className="hover:text-theresa-gold-200">Academic programme</Link></li>
              <li><Link href="/academics#fees" className="hover:text-theresa-gold-200">Fee schedule</Link></li>
              <li><Link href="/academics#feeding" className="hover:text-theresa-gold-200">Feeding programme</Link></li>
              <li><Link href="/admissions" className="hover:text-theresa-gold-200">Admissions</Link></li>
              <li><Link href="/gallery" className="hover:text-theresa-gold-200">Photo gallery</Link></li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-theresa-gold-300">
              Term dates
            </h2>
            {termDates.length > 0 ? (
              <ul className="mt-4 space-y-2 text-sm text-emerald-100/85">
                {termDates.slice(0, 4).map((entry) => (
                  <li key={entry.id}>
                    <span className="block font-semibold text-white">{entry.label}</span>
                    <span className="block text-emerald-100/75">{entry.detail}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-emerald-100/70">Nothing published yet.</p>
            )}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-emerald-100/70 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} {info?.schoolName || SCHOOL_NAME}. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/login/administrator" className="hover:text-theresa-gold-200">Administrator sign-in</Link>
            <Link href="/login/teacher" className="hover:text-theresa-gold-200">Teacher sign-in</Link>
            <Link href="/login/super-admin" className="hover:text-theresa-gold-200">Super Administrator</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
