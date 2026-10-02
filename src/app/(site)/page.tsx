import Link from 'next/link';
import {
  ArrowRight,
  Award,
  CalendarDays,
  Clock,
  GraduationCap,
  MapPin,
  Phone,
  Quote,
  Sparkles,
  Users,
} from 'lucide-react';
import { formatCurrency } from '@/lib/grading';
import { SCHOOL_NAME } from '@/lib/constants';
import { getSiteData } from '@/lib/site-data';
import { Reveal } from '@/components/site/Reveal';
import { CountUp } from '@/components/site/CountUp';
import { GradientArt } from '@/components/site/GradientArt';
import { SchoolCrest } from '@/components/SchoolCrest';

export const dynamic = 'force-dynamic';

const NOTHING_YET = 'Nothing published yet.';

export default async function HomePage() {
  const { info, notices, termDates, departments, gallery, feeRows, stats } = await getSiteData();

  const headline = info?.schoolName || SCHOOL_NAME;
  const glanceFees = feeRows.slice(0, 4);
  const featured = gallery.filter((item) => item.featured);
  const campusLife = (featured.length > 0 ? featured : gallery).slice(0, 3);

  const welcomePoints = [
    stats.pupils > 0
      ? { icon: Users, label: 'Pupils on roll', value: stats.pupils, suffix: '' }
      : null,
    stats.staff > 0
      ? { icon: GraduationCap, label: 'Members of staff', value: stats.staff, suffix: '' }
      : null,
    stats.classes > 0
      ? { icon: Award, label: 'Classes', value: stats.classes, suffix: '' }
      : null,
    info?.foundedYear
      ? { icon: Sparkles, label: 'Founded', value: info.foundedYear, suffix: '' }
      : null,
  ].filter((point): point is NonNullable<typeof point> => point !== null);

  const hasVisitDetails = Boolean(
    info?.tourHours || info?.officeHours || info?.postalAddress || info?.mainPhone
  );

  return (
    <>
      {/* ---------------------------------------------------------------- */}
      {/* Hero — welcome message over the school's own gradient field      */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative isolate flex min-h-[92vh] items-center overflow-hidden">
        {/* Layered gradients in the school colours, drifting slowly */}
        <div className="absolute inset-0 -z-10">
          <GradientArt variant="campus" className="h-full w-full" />
          <div className="absolute inset-0 bg-gradient-to-br from-theresa-green-950/80 via-theresa-green-900/60 to-[#04251a]/80" />
        </div>

        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-20 lg:grid-cols-12 lg:px-6 lg:py-24">
          <div className="lg:col-span-7">
            <div className="inline-flex animate-fade-down items-center gap-2 rounded-full border border-theresa-gold-400/40 bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.28em] text-theresa-gold-300 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 animate-wiggle" />
              Welcome &middot; Akwaaba &middot; Bienvenue
            </div>

            <h1 className="mt-6 animate-fade-up anim-delay-1 font-serif text-[34px] font-bold leading-[1.08] text-white sm:text-5xl lg:text-[58px]">
              Welcome to
              <span className="mt-2 block text-gradient-gold">{headline}</span>
            </h1>

            <p className="mt-6 max-w-2xl animate-fade-up anim-delay-2 text-[16px] leading-relaxed text-emerald-50/90 sm:text-lg">
              {info?.aboutSummary || NOTHING_YET}
              {info?.digitalAddress ? (
                <>
                  {' '}
                  The school&apos;s digital address is <strong>{info.digitalAddress}</strong>.
                </>
              ) : null}
            </p>

            <div className="mt-9 flex animate-fade-up anim-delay-3 flex-wrap items-center gap-3">
              <Link
                href="/admissions"
                className="group inline-flex items-center gap-2 rounded-xl bg-theresa-gold-400 px-6 py-3.5 text-sm font-bold text-theresa-green-950 shadow-[0_16px_40px_-16px_rgba(217,175,55,0.7)] magnetic-btn shine"
              >
                Admissions and school visits
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/academics#fees"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20 magnetic-btn"
              >
                This term&apos;s fee schedule
              </Link>
            </div>

            {/* Counters — shown for whatever the school has published */}
            {welcomePoints.length > 0 && (
              <dl className="mt-12 grid animate-fade-up anim-delay-4 grid-cols-2 gap-4 sm:grid-cols-4">
                {welcomePoints.map((point) => (
                  <div
                    key={point.label}
                    className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md transition duration-500 hover:-translate-y-1 hover:border-theresa-gold-400/50 hover:bg-white/15"
                  >
                    <point.icon className="mb-2 h-5 w-5 text-theresa-gold-300" />
                    <dd className="font-serif text-2xl font-bold text-white">
                      <CountUp value={point.value} suffix={point.suffix} />
                    </dd>
                    <dt className="mt-0.5 text-[11px] uppercase tracking-wider text-emerald-100/70">
                      {point.label}
                    </dt>
                  </div>
                ))}
              </dl>
            )}
          </div>

          {/* Floating welcome card */}
          <div className="hidden lg:col-span-5 lg:block">
            <div className="relative animate-flip-in anim-delay-3">
              <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-theresa-gold-400/40 via-transparent to-theresa-green-400/30 blur-2xl" />
              <figure className="relative overflow-hidden rounded-[1.75rem] border border-white/25 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.75)]">
                <GradientArt variant="memorial" className="h-[420px] w-full">
                  <div className="flex h-[420px] flex-col items-center justify-center gap-5 p-8 text-center">
                    <SchoolCrest size="xl" className="animate-float-slow" />
                    <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-theresa-gold-300">
                      {info?.schoolName || headline}
                    </p>
                    {info?.foundedYear && (
                      <p className="font-serif text-4xl font-bold text-white">
                        Since {info.foundedYear}
                      </p>
                    )}
                    <span className="h-px w-24 bg-gradient-to-r from-transparent via-theresa-gold-400 to-transparent" />
                    <p className="max-w-xs text-xs leading-relaxed text-emerald-50/80">
                      KG 1 to JHS 3 &middot; a day school in the heart of our community
                    </p>
                  </div>
                </GradientArt>
                {info?.motto && (
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-theresa-green-950 via-theresa-green-950/80 to-transparent p-6 pt-16">
                    <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-theresa-gold-300">
                      Our motto
                    </p>
                    <p className="mt-2 font-serif text-lg leading-snug text-white">
                      &ldquo;{info.motto}&rdquo;
                    </p>
                  </figcaption>
                )}
              </figure>

              {(info?.currentSemester || info?.nextReopening) && (
                <div className="absolute -bottom-8 -left-10 w-56 animate-float-slow rounded-2xl border border-white/20 bg-white/95 p-4 shadow-lift backdrop-blur-md">
                  {info?.currentSemester && (
                    <>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-theresa-gold-700">
                        This semester
                      </p>
                      <p className="mt-1 font-serif text-base font-bold leading-tight text-theresa-green-900">
                        {info.currentSemester}
                      </p>
                    </>
                  )}
                  {info?.nextReopening && (
                    <p className="mt-1 text-xs text-slate-500">Reopens {info.nextReopening}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 animate-fade-in anim-delay-9 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-100/60">
            Scroll to explore
          </p>
          <div className="mx-auto mt-2 flex h-9 w-5 justify-center rounded-full border border-white/40 pt-1.5">
            <span className="h-2 w-1 rounded-full bg-theresa-gold-300 animate-bounce-hint" />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Marquee strip — the school's own published highlights            */}
      {/* ---------------------------------------------------------------- */}
      {(info?.highlights.length ?? 0) > 0 && (
        <div className="overflow-hidden border-y border-theresa-green-900/10 bg-theresa-green-900 py-3">
          <div className="flex w-max animate-marquee gap-10 whitespace-nowrap text-[12px] font-bold uppercase tracking-[0.28em] text-emerald-100/80">
            {[...Array(2)].map((_, group) => (
              <div key={group} className="flex gap-10">
                {info?.highlights.map((highlight) => (
                  <span key={`${group}-${highlight}`} className="flex gap-10">
                    <span>{highlight}</span>
                    <span className="text-theresa-gold-400">&#9670;</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Notices and term dates                                           */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative overflow-hidden bg-[#FCFBF7] py-16 lg:py-20">
        <div className="pointer-events-none absolute inset-0 pattern-dots opacity-60" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-12 lg:px-6">
          <div className="lg:col-span-8">
            <Reveal>
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-theresa-gold-700">
                    Latest from the office
                  </p>
                  <h2 className="mt-2 font-serif text-3xl font-bold text-theresa-green-950">
                    Notices for parents
                  </h2>
                </div>
                {notices.length > 0 && (
                  <span className="rounded-full bg-theresa-green-50 px-3 py-1 text-xs font-semibold text-theresa-green-800">
                    Updated {notices[0].date}
                  </span>
                )}
              </div>
            </Reveal>

            {notices.length > 0 ? (
              <ul className="mt-8 space-y-4">
                {notices.map((notice, index) => (
                  <Reveal as="li" key={notice.id} delay={index * 90}>
                    <article className="group rounded-2xl border border-slate-200/80 bg-white p-6 card-lift hover:border-theresa-green-300">
                      <div className="flex flex-wrap items-center gap-3">
                        <time className="text-xs font-semibold uppercase tracking-wider text-theresa-gold-700">
                          {notice.date}
                        </time>
                        <span className="rounded-full bg-theresa-green-50 px-2.5 py-0.5 text-[11px] font-semibold text-theresa-green-800">
                          {notice.tag}
                        </span>
                      </div>
                      <h3 className="mt-2 font-serif text-xl font-bold text-slate-900 transition group-hover:text-theresa-green-800">
                        {notice.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">{notice.body}</p>
                    </article>
                  </Reveal>
                ))}
              </ul>
            ) : (
              <p className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white/70 p-6 text-sm text-slate-600">
                {NOTHING_YET} The office publishes notices for parents from the staff portal.
              </p>
            )}
          </div>

          <aside className="space-y-5 lg:col-span-4">
            <Reveal variant="right">
              <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-soft">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-theresa-green-50 text-theresa-green-800">
                    <CalendarDays className="h-4 w-4" />
                  </span>
                  <h2 className="font-serif text-lg font-bold text-theresa-green-950">Term dates</h2>
                </div>
                {termDates.length > 0 ? (
                  <dl className="mt-5 space-y-4">
                    {termDates.map((entry) => (
                      <div
                        key={entry.id}
                        className="border-l-2 border-theresa-gold-400 pl-4 transition hover:border-theresa-green-700"
                      >
                        <dt className="text-sm font-semibold text-slate-800">{entry.label}</dt>
                        <dd className="text-sm text-slate-600">{entry.detail}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="mt-4 text-sm text-slate-600">{NOTHING_YET}</p>
                )}
              </div>
            </Reveal>

            <Reveal variant="right" delay={120}>
              <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-theresa-green-900 to-theresa-green-950 p-6 text-white shadow-lift">
                <h2 className="font-serif text-lg font-bold">Visit the school</h2>
                {hasVisitDetails ? (
                  <ul className="mt-4 space-y-3 text-sm text-emerald-50/90">
                    {(info?.tourHours || info?.officeHours) && (
                      <li className="flex gap-3">
                        <Clock className="mt-0.5 h-4 w-4 shrink-0 text-theresa-gold-300" />
                        <span>
                          {info?.tourHours && <>Parent tours: {info.tourHours}.</>}
                          {info?.tourHours && info?.officeHours && <br />}
                          {info?.officeHours && <>Office hours: {info.officeHours}.</>}
                        </span>
                      </li>
                    )}
                    {(info?.postalAddress || info?.digitalAddress) && (
                      <li className="flex gap-3">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-theresa-gold-300" />
                        <span>
                          {info?.postalAddress}
                          {info?.postalAddress && info?.digitalAddress && <br />}
                          {info?.digitalAddress && <>Digital address: {info.digitalAddress}</>}
                        </span>
                      </li>
                    )}
                    {info?.mainPhone && (
                      <li className="flex gap-3">
                        <Phone className="mt-0.5 h-4 w-4 shrink-0 text-theresa-gold-300" />
                        <span>{info.mainPhone}</span>
                      </li>
                    )}
                  </ul>
                ) : (
                  <p className="mt-4 text-sm text-emerald-50/80">{NOTHING_YET}</p>
                )}
                <Link
                  href="/contact"
                  className="group mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-theresa-gold-300"
                >
                  Send an enquiry to the office
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </Reveal>
          </aside>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Headmaster's welcome — only when the school has published one    */}
      {/* ---------------------------------------------------------------- */}
      {info?.headmasterName && info?.headmasterMessage && (
        <section className="relative overflow-hidden bg-white py-16 lg:py-24">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 lg:grid-cols-12 lg:px-6">
            <Reveal variant="left" className="lg:col-span-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-theresa-gold-700">
                A word from the Headmaster
              </p>
              <h2 className="mt-2 font-serif text-3xl font-bold text-theresa-green-950">
                From the Headmaster
              </h2>
              <p className="mt-3 text-sm text-slate-600">
                {info.headmasterName}
                {info.headmasterTitle && (
                  <>
                    <br />
                    {info.headmasterTitle}
                  </>
                )}
              </p>
              <div className="group relative mt-6 overflow-hidden rounded-2xl shadow-soft">
                <GradientArt variant="heritage" className="h-60 w-full">
                  <div className="flex h-60 items-center justify-center">
                    <SchoolCrest size="xl" className="transition-transform duration-[1400ms] group-hover:scale-110" />
                  </div>
                </GradientArt>
                <div className="absolute inset-0 bg-gradient-to-t from-theresa-green-950/70 to-transparent" />
              </div>
            </Reveal>

            <Reveal variant="right" delay={120} className="lg:col-span-8">
              <blockquote className="relative rounded-3xl border border-theresa-green-100 bg-gradient-to-br from-[#F7FBF8] to-white p-8 shadow-soft lg:p-10">
                <Quote className="absolute right-8 top-8 h-12 w-12 text-theresa-green-100" />
                <div className="relative space-y-5 font-serif text-lg leading-relaxed text-slate-800 lg:text-xl">
                  {info.headmasterMessage.split(/\n{2,}/).map((paragraph, index) => (
                    <p key={index}>&ldquo;{paragraph}&rdquo;</p>
                  ))}
                </div>
                <footer className="mt-7 flex items-center gap-3 border-t border-slate-100 pt-5">
                  <span className="h-10 w-1 rounded-full bg-theresa-gold-400" />
                  <span>
                    <span className="block text-sm font-bold text-theresa-green-900">
                      {info.headmasterName}
                    </span>
                    <span className="block text-xs text-slate-500">
                      {info.headmasterTitle || 'Headmaster'}, {headline}
                    </span>
                  </span>
                </footer>
              </blockquote>
            </Reveal>
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Academic departments                                             */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative overflow-hidden bg-[#FCFBF7] py-16 lg:py-20">
        <div className="pointer-events-none absolute inset-0 pattern-grid opacity-40" />
        <div className="relative mx-auto max-w-6xl px-4 lg:px-6">
          <Reveal className="max-w-3xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-theresa-gold-700">
              How we are arranged
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold text-theresa-green-950">
              How the school is organised
            </h2>
          </Reveal>

          {departments.length > 0 ? (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {departments.map((department, index) => (
                <Reveal key={department.id} delay={index * 110} variant="zoom">
                  <article className="group h-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 card-lift hover:border-theresa-green-400">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-theresa-green-800 to-theresa-green-600 font-serif text-sm font-bold text-white shadow-soft transition-transform duration-500 group-hover:scale-110">
                      {index + 1}
                    </span>
                    <h3 className="mt-4 font-serif text-lg font-bold text-theresa-green-950">
                      {department.name}
                    </h3>
                    {department.classes && (
                      <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-theresa-gold-700">
                        {department.classes}
                      </p>
                    )}
                    <ul className="mt-4 space-y-1.5 text-sm text-slate-700">
                      {department.subjects.map((subject) => (
                        <li key={subject} className="flex gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-theresa-green-600" />
                          {subject}
                        </li>
                      ))}
                    </ul>
                    {department.note && (
                      <p className="mt-4 border-t border-slate-100 pt-3 text-xs leading-relaxed text-slate-500">
                        {department.note}
                      </p>
                    )}
                  </article>
                </Reveal>
              ))}
            </div>
          ) : (
            <p className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white/70 p-6 text-sm text-slate-600">
              {NOTHING_YET}
            </p>
          )}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Fees at a glance                                                 */}
      {/* ---------------------------------------------------------------- */}
      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <div>
              {info?.currentSemester && (
                <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-theresa-gold-700">
                  {info.currentSemester}
                </p>
              )}
              <h2 className="mt-2 font-serif text-3xl font-bold text-theresa-green-950">
                Fees at a glance
              </h2>
            </div>
            <Link
              href="/academics#fees"
              className="group inline-flex items-center gap-1.5 rounded-xl border border-theresa-green-800 px-4 py-2.5 text-sm font-semibold text-theresa-green-800 transition hover:bg-theresa-green-800 hover:text-white"
            >
              Full fee schedule
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Reveal>

          {glanceFees.length > 0 ? (
            <Reveal delay={120}>
              <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200/80 shadow-soft">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[620px] border-collapse text-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-theresa-green-900 to-theresa-green-800 text-left text-xs uppercase tracking-wider text-emerald-50">
                        <th className="px-5 py-4 font-semibold">Class</th>
                        <th className="px-5 py-4 font-semibold">Tuition (per semester)</th>
                        <th className="px-5 py-4 font-semibold">Extra classes</th>
                        <th className="px-5 py-4 font-semibold">Meal (per day)</th>
                        <th className="px-5 py-4 font-semibold">ICT &amp; books</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {glanceFees.map((row) => (
                        <tr key={row.id} className="transition hover:bg-theresa-green-50/60">
                          <th scope="row" className="px-5 py-4 text-left font-semibold text-slate-900">
                            {row.className}
                            {row.department && (
                              <span className="block text-xs font-normal text-slate-500">
                                {row.department}
                              </span>
                            )}
                          </th>
                          <td className="px-5 py-4 font-mono text-slate-700">
                            {formatCurrency(row.tuitionFee)}
                          </td>
                          <td className="px-5 py-4 font-mono text-slate-700">
                            {formatCurrency(row.extraClassesFee)}
                          </td>
                          <td className="px-5 py-4 font-mono text-slate-700">
                            {formatCurrency(row.dailyMealFee)}
                          </td>
                          <td className="px-5 py-4 font-mono text-slate-700">
                            {formatCurrency(row.ictAndBooksFee)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Reveal>
          ) : (
            <p className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white/70 p-6 text-sm text-slate-600">
              {NOTHING_YET}
            </p>
          )}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Campus life                                                      */}
      {/* ---------------------------------------------------------------- */}
      <section className="bg-[#FCFBF7] py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-theresa-gold-700">
                Photographs
              </p>
              <h2 className="mt-2 font-serif text-3xl font-bold text-theresa-green-950">
                Life on the compound
              </h2>
            </div>
            <Link
              href="/gallery"
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-theresa-green-800"
            >
              See more photographs
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Reveal>

          {campusLife.length > 0 ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-3">
              {campusLife.map((item, index) => (
                <Reveal key={item.id} delay={index * 120} variant="zoom">
                  <figure className="group h-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-soft card-lift">
                    <div className="overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="h-56 w-full object-cover transition-transform duration-[1200ms] group-hover:scale-110"
                      />
                    </div>
                    <figcaption className="p-5">
                      {item.dateLabel && (
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-theresa-gold-700">
                          {item.dateLabel}
                        </p>
                      )}
                      <h3 className="mt-1 font-serif text-lg font-bold text-slate-900">{item.title}</h3>
                      {item.caption && (
                        <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{item.caption}</p>
                      )}
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          ) : (
            <p className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white/70 p-6 text-sm text-slate-600">
              {NOTHING_YET}
            </p>
          )}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Closing call to action                                           */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative overflow-hidden bg-theresa-green-900 py-14 lg:py-16">
        <GradientArt variant="sport" className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-r from-theresa-green-950 via-theresa-green-900/85 to-theresa-green-950/70" />

        <Reveal className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 lg:px-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-serif text-3xl font-bold text-white">
              Considering the school for your child?
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-emerald-100/90">
              {info?.mainPhone
                ? `Telephone the office on ${info.mainPhone} or send an enquiry and we will arrange a tour.`
                : 'Send an enquiry and we will arrange a tour.'}{' '}
              Applications are received throughout the term.
              {stats.pupils > 0 || stats.staff > 0 ? (
                <>
                  {' '}
                  We currently look after {stats.pupils} {stats.pupils === 1 ? 'pupil' : 'pupils'} with{' '}
                  {stats.staff} {stats.staff === 1 ? 'member' : 'members'} of staff.
                </>
              ) : null}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link
              href="/admissions"
              className="rounded-xl bg-theresa-gold-400 px-6 py-3.5 text-sm font-bold text-theresa-green-950 shadow-[0_16px_40px_-16px_rgba(217,175,55,0.7)] magnetic-btn shine"
            >
              How to apply
            </Link>
            <Link
              href="/contact"
              className="rounded-xl border border-emerald-200/50 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10 magnetic-btn"
            >
              Enquire online
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
