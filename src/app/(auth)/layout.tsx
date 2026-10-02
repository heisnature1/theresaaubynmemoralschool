import React from 'react';
import Link from 'next/link';
import { ArrowLeft, GraduationCap, Quote, ShieldCheck, Utensils } from 'lucide-react';
import { SchoolCrest } from '@/components/SchoolCrest';
import { GradientArt } from '@/components/site/GradientArt';
import { SCHOOL_NAME } from '@/lib/constants';
import { getSiteData } from '@/lib/site-data';

const HIGHLIGHTS = [
  {
    icon: GraduationCap,
    title: 'Continuous assessment',
    body: 'Class scores and exam marks are recorded as they are earned, not at the end of term.',
  },
  {
    icon: Utensils,
    title: 'Daily feeding register',
    body: 'Every midday meal is logged per pupil, per day, with the method of payment.',
  },
  {
    icon: ShieldCheck,
    title: 'Careful records',
    body: 'Fee receipts, report endorsements and every change are kept in the school audit trail.',
  },
];

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const { info } = await getSiteData();
  const headmasterQuote =
    info?.headmasterName && info.headmasterMessage ? info.headmasterMessage : null;
  const headmasterCredit = [info?.headmasterName, info?.headmasterTitle || 'Headmaster']
    .filter(Boolean)
    .join(' \u00b7 ');

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#F4F1E8]">
      {/* Animated backdrop, drawn with the school's own gradients */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <GradientArt variant="portal" className="h-full w-full opacity-[0.28]" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#F7F5EE] via-white/85 to-theresa-green-50" />
        <div className="absolute inset-0 pattern-grid opacity-40" />
      </div>

      <header className="animate-fade-down border-b border-white/60 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 lg:px-6">
          <Link href="/" className="group flex items-center gap-3">
            <SchoolCrest size="sm" className="transition-transform duration-500 group-hover:scale-110" />
            <span className="leading-tight">
              <span className="block font-serif text-base font-bold text-theresa-green-900">
                {info?.schoolName || SCHOOL_NAME}
              </span>
              <span className="block text-[11px] uppercase tracking-[0.16em] text-theresa-gold-700">
                Staff portal
              </span>
            </span>
          </Link>
          <Link
            href="/"
            className="group inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-600 transition hover:border-theresa-green-600 hover:text-theresa-green-800"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
            Back to the school website
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-start justify-center px-4 py-10 lg:py-14">
        <div className="grid w-full max-w-6xl items-start gap-10 lg:grid-cols-12">
          {/* Left: the school's own pitch, shown beside every sign-in card */}
          <aside className="hidden lg:col-span-5 lg:block">
            <div className="animate-fade-right sticky top-28 space-y-6">
              <div className="overflow-hidden rounded-3xl border border-theresa-green-900/10 bg-gradient-to-br from-theresa-green-900 to-theresa-green-950 p-8 text-white shadow-lift">
                <div className="absolute" />
                <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-theresa-gold-300">
                  {info?.foundedYear ? `Since ${info.foundedYear} \u00b7 ` : ''}KG 1 &ndash; JHS 3
                </p>
                <h2 className="mt-3 font-serif text-3xl font-bold leading-tight">
                  A steady, thorough education for the children of our community
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-emerald-50/85">
                  The portal carries the school&apos;s working records: the fee books, the feeding
                  register, continuous assessment and the terminal report cards.
                </p>
                <ul className="mt-7 space-y-4">
                  {HIGHLIGHTS.map((item, index) => (
                    <li
                      key={item.title}
                      className="flex animate-fade-up gap-3"
                      style={{ animationDelay: `${index * 120}ms` }}
                    >
                      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-theresa-gold-300">
                        <item.icon className="h-4 w-4" />
                      </span>
                      <span>
                        <span className="block text-sm font-bold text-white">{item.title}</span>
                        <span className="block text-xs leading-relaxed text-emerald-100/75">
                          {item.body}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {headmasterQuote && (
                <figure className="animate-fade-up anim-delay-4 rounded-3xl border border-theresa-green-900/10 bg-white/80 p-6 backdrop-blur-md">
                  <Quote className="h-6 w-6 text-theresa-gold-500" />
                  <blockquote className="mt-2 font-serif text-sm leading-relaxed text-slate-700">
                    &ldquo;{headmasterQuote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-3 text-xs font-semibold text-theresa-green-800">
                    {headmasterCredit}
                  </figcaption>
                </figure>
              )}
            </div>
          </aside>

          {/* Right: the sign-in or application card */}
          <div className="animate-fade-up anim-delay-2 lg:col-span-7">{children}</div>
        </div>
      </main>

      <footer className="border-t border-white/60 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-6">
          {info?.mainPhone ? (
            <p>
              Trouble signing in? Telephone the school office on{' '}
              <a
                href={`tel:${info.mainPhone.replace(/\s/g, '')}`}
                className="font-semibold text-theresa-green-800 hover:underline"
              >
                {info.mainPhone}
              </a>
              .
            </p>
          ) : (
            <p>Trouble signing in? Please contact the school office.</p>
          )}
          <p>
            &copy; {new Date().getFullYear()} {info?.schoolName || SCHOOL_NAME}
          </p>
        </div>
      </footer>
    </div>
  );
}
