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
  Utensils,
  Users,
} from 'lucide-react';
import { getSchoolState } from '@/lib/store';
import { formatCurrency } from '@/lib/grading';
import {
  ACADEMIC_DEPARTMENTS,
  OFFICE_CONTACTS,
  SCHOOL_NOTICES,
  TERM_DATES,
} from '@/lib/constants';
import { Reveal } from '@/components/site/Reveal';
import { CountUp } from '@/components/site/CountUp';

export const dynamic = 'force-dynamic';

const FEES_AT_A_GLANCE = ['KG 1', 'Basic 3', 'Basic 6', 'JHS 3'];

const WELCOME_POINTS = [
  { icon: Users, label: 'Average class size', value: 24, suffix: ' pupils' },
  { icon: GraduationCap, label: 'Classes taught', value: 11, suffix: ' streams' },
  { icon: Utensils, label: 'Hot midday meals', value: 100, suffix: '%' },
  { icon: Award, label: 'Years of service', value: 38, suffix: ' yrs' },
];

export default function HomePage() {
  const state = getSchoolState();
  const feeRows = state.classFeeStructures.filter((row) => FEES_AT_A_GLANCE.includes(row.className));
  const campusLife = state.gallery.slice(0, 3);
  const pupils = state.students.length;
  const staff = state.staff.length;

  return (
    <>
      {/* ---------------------------------------------------------------- */}
      {/* Hero — welcome message over the campus photograph                */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative isolate flex min-h-[92vh] items-center overflow-hidden">
        {/* Background image with a slow zoom */}
        <div className="absolute inset-0 -z-10">
          <img
            src="/images/campus-hero.jpg"
            alt=""
            aria-hidden="true"
            className="h-full w-full scale-105 object-cover animate-ken-burns"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-teresa-green-950/92 via-teresa-green-900/85 to-[#04251a]/80" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(217,175,55,0.22),transparent_55%)]" />
          <div className="absolute inset-0 pattern-grid opacity-[0.13]" />
          <div className="hero-blob left-[-6rem] top-[18%] h-80 w-80 bg-teresa-green-600/40 animate-float-slow" />
          <div className="hero-blob right-[-8rem] bottom-[-6rem] h-96 w-96 bg-teresa-gold-600/25 animate-float" />
        </div>

        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-20 lg:grid-cols-12 lg:px-6 lg:py-24">
          <div className="lg:col-span-7">
            <div className="inline-flex animate-fade-down items-center gap-2 rounded-full border border-teresa-gold-400/40 bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.28em] text-teresa-gold-300 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 animate-wiggle" />
              Welcome &middot; Akwaaba &middot; Bienvenue
            </div>

            <h1 className="mt-6 animate-fade-up anim-delay-1 font-serif text-[34px] font-bold leading-[1.08] text-white sm:text-5xl lg:text-[58px]">
              Welcome to
              <span className="mt-2 block text-gradient-gold">St. Teresa Aubyn</span>
              <span className="block text-gradient-gold">Memorial School</span>
            </h1>

            <p className="mt-6 max-w-2xl animate-fade-up anim-delay-2 text-[16px] leading-relaxed text-emerald-50/90 sm:text-lg">
              A day school at {OFFICE_CONTACTS.digitalAddress}, teaching pupils from KG 1 through
              JHS 3 since 1988. Classes are kept small, written work is marked and returned
              promptly, and every child is given a hot midday meal. Parents are welcome on the
              compound at any time during school hours.
            </p>

            <div className="mt-9 flex animate-fade-up anim-delay-3 flex-wrap items-center gap-3">
              <Link
                href="/admissions"
                className="group inline-flex items-center gap-2 rounded-xl bg-teresa-gold-400 px-6 py-3.5 text-sm font-bold text-teresa-green-950 shadow-[0_16px_40px_-16px_rgba(217,175,55,0.7)] magnetic-btn shine"
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

            {/* Counters */}
            <dl className="mt-12 grid animate-fade-up anim-delay-4 grid-cols-2 gap-4 sm:grid-cols-4">
              {WELCOME_POINTS.map((point) => (
                <div
                  key={point.label}
                  className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md transition duration-500 hover:-translate-y-1 hover:border-teresa-gold-400/50 hover:bg-white/15"
                >
                  <point.icon className="mb-2 h-5 w-5 text-teresa-gold-300" />
                  <dd className="font-serif text-2xl font-bold text-white">
                    <CountUp value={point.value} suffix={point.suffix} />
                  </dd>
                  <dt className="mt-0.5 text-[11px] uppercase tracking-wider text-emerald-100/70">
                    {point.label}
                  </dt>
                </div>
              ))}
            </dl>
          </div>

          {/* Floating welcome card */}
          <div className="hidden lg:col-span-5 lg:block">
            <div className="relative animate-flip-in anim-delay-3">
              <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-teresa-gold-400/40 via-transparent to-teresa-green-400/30 blur-2xl" />
              <figure className="relative overflow-hidden rounded-[1.75rem] border border-white/25 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.75)]">
                <img
                  src="/images/heritage-courtyard.jpg"
                  alt="The memorial courtyard at St. Teresa Aubyn Memorial School"
                  className="h-[420px] w-full object-cover transition-transform duration-[1200ms] hover:scale-110"
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-teresa-green-950 via-teresa-green-950/80 to-transparent p-6 pt-16">
                  <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-teresa-gold-300">
                    The memorial courtyard
                  </p>
                  <p className="mt-2 font-serif text-lg leading-snug text-white">
                    &ldquo;We are not a large school, and we do not wish to be. Your child will be
                    known by name.&rdquo;
                  </p>
                </figcaption>
              </figure>

              <div className="absolute -bottom-8 -left-10 w-56 animate-float-slow rounded-2xl border border-white/20 bg-white/95 p-4 shadow-lift backdrop-blur-md">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teresa-gold-700">
                  This semester
                </p>
                <p className="mt-1 font-serif text-base font-bold leading-tight text-teresa-green-900">
                  {state.currentSemester}
                </p>
                <p className="mt-1 text-xs text-slate-500">Reopens {state.nextSemesterReopening}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 animate-fade-in anim-delay-9 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-100/60">
            Scroll to explore
          </p>
          <div className="mx-auto mt-2 flex h-9 w-5 justify-center rounded-full border border-white/40 pt-1.5">
            <span className="h-2 w-1 rounded-full bg-teresa-gold-300 animate-bounce-hint" />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Marquee strip                                                    */}
      {/* ---------------------------------------------------------------- */}
      <div className="overflow-hidden border-y border-teresa-green-900/10 bg-teresa-green-900 py-3">
        <div className="flex w-max animate-marquee gap-10 whitespace-nowrap text-[12px] font-bold uppercase tracking-[0.28em] text-emerald-100/80">
          {[...Array(2)].map((_, group) => (
            <div key={group} className="flex gap-10">
              <span>KG 1 &ndash; JHS 3</span>
              <span className="text-teresa-gold-400">&#9670;</span>
              <span>Daily hot midday meal</span>
              <span className="text-teresa-gold-400">&#9670;</span>
              <span>Qualified teaching staff</span>
              <span className="text-teresa-gold-400">&#9670;</span>
              <span>Continuous assessment</span>
              <span className="text-teresa-gold-400">&#9670;</span>
              <span>Founded 1988</span>
              <span className="text-teresa-gold-400">&#9670;</span>
              <span>Parents welcome on the compound</span>
              <span className="text-teresa-gold-400">&#9670;</span>
            </div>
          ))}
        </div>
      </div>

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
                  <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-teresa-gold-700">
                    Latest from the office
                  </p>
                  <h2 className="mt-2 font-serif text-3xl font-bold text-teresa-green-950">
                    Notices for parents
                  </h2>
                </div>
                <span className="rounded-full bg-teresa-green-50 px-3 py-1 text-xs font-semibold text-teresa-green-800">
                  Updated {SCHOOL_NOTICES[0].date}
                </span>
              </div>
            </Reveal>

            <ul className="mt-8 space-y-4">
              {SCHOOL_NOTICES.map((notice, index) => (
                <Reveal as="li" key={notice.id} delay={index * 90}>
                  <article className="group rounded-2xl border border-slate-200/80 bg-white p-6 card-lift hover:border-teresa-green-300">
                    <div className="flex flex-wrap items-center gap-3">
                      <time className="text-xs font-semibold uppercase tracking-wider text-teresa-gold-700">
                        {notice.date}
                      </time>
                      <span className="rounded-full bg-teresa-green-50 px-2.5 py-0.5 text-[11px] font-semibold text-teresa-green-800">
                        {notice.tag}
                      </span>
                    </div>
                    <h3 className="mt-2 font-serif text-xl font-bold text-slate-900 transition group-hover:text-teresa-green-800">
                      {notice.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{notice.body}</p>
                  </article>
                </Reveal>
              ))}
            </ul>
          </div>

          <aside className="space-y-5 lg:col-span-4">
            <Reveal variant="right">
              <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-soft">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teresa-green-50 text-teresa-green-800">
                    <CalendarDays className="h-4 w-4" />
                  </span>
                  <h2 className="font-serif text-lg font-bold text-teresa-green-950">Term dates</h2>
                </div>
                <dl className="mt-5 space-y-4">
                  {TERM_DATES.map((entry) => (
                    <div
                      key={entry.label}
                      className="border-l-2 border-teresa-gold-400 pl-4 transition hover:border-teresa-green-700"
                    >
                      <dt className="text-sm font-semibold text-slate-800">{entry.label}</dt>
                      <dd className="text-sm text-slate-600">{entry.detail}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Reveal>

            <Reveal variant="right" delay={120}>
              <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-teresa-green-900 to-teresa-green-950 p-6 text-white shadow-lift">
                <h2 className="font-serif text-lg font-bold">Visit the school</h2>
                <ul className="mt-4 space-y-3 text-sm text-emerald-50/90">
                  <li className="flex gap-3">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-teresa-gold-300" />
                    <span>
                      Parent tours: Tuesdays and Thursdays, 9:00 a.m. &ndash; 12:00 noon.
                      <br />
                      Office open weekdays 7:00 a.m. &ndash; 5:00 p.m.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teresa-gold-300" />
                    <span>{OFFICE_CONTACTS.postalAddress}</span>
                  </li>
                  <li className="flex gap-3">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-teresa-gold-300" />
                    <span>{OFFICE_CONTACTS.mainPhone}</span>
                  </li>
                </ul>
                <Link
                  href="/contact"
                  className="group mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-teresa-gold-300"
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
      {/* Headmaster's welcome                                             */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative overflow-hidden bg-white py-16 lg:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 lg:grid-cols-12 lg:px-6">
          <Reveal variant="left" className="lg:col-span-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-teresa-gold-700">
              A word from the Headmaster
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold text-teresa-green-950">
              From the Headmaster
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              Rev. Fr. Bernard Kweku Arthur, M.Ed.
              <br />
              Headmaster since 2014
            </p>
            <div className="group relative mt-6 overflow-hidden rounded-2xl shadow-soft">
              <img
                src="/images/heritage-courtyard.jpg"
                alt="The memorial courtyard"
                className="h-60 w-full object-cover transition-transform duration-[1400ms] group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-teresa-green-950/70 to-transparent" />
            </div>
          </Reveal>

          <Reveal variant="right" delay={120} className="lg:col-span-8">
            <blockquote className="relative rounded-3xl border border-teresa-green-100 bg-gradient-to-br from-[#F7FBF8] to-white p-8 shadow-soft lg:p-10">
              <Quote className="absolute right-8 top-8 h-12 w-12 text-teresa-green-100" />
              <div className="relative space-y-5 font-serif text-lg leading-relaxed text-slate-800 lg:text-xl">
                <p>
                  &ldquo;We are not a large school, and we do not wish to be. Our promise to parents
                  is simple: your child will be known by name, taught by a qualified teacher who
                  keeps a careful record of their progress, fed properly at midday, and corrected
                  firmly but kindly when they go wrong.
                </p>
                <p>
                  BECE results matter to us, but so does the character of the young person who
                  leaves this compound. Our teachers record marks continuously rather than relying
                  on one examination, and we report honestly to parents at the end of every
                  semester.&rdquo;
                </p>
              </div>
              <footer className="mt-7 flex items-center gap-3 border-t border-slate-100 pt-5">
                <span className="h-10 w-1 rounded-full bg-teresa-gold-400" />
                <span>
                  <span className="block text-sm font-bold text-teresa-green-900">
                    Rev. Fr. Bernard Kweku Arthur, M.Ed.
                  </span>
                  <span className="block text-xs text-slate-500">
                    Headmaster, St. Teresa Aubyn Memorial School
                  </span>
                </span>
              </footer>
            </blockquote>
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Academic departments                                             */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative overflow-hidden bg-[#FCFBF7] py-16 lg:py-20">
        <div className="pointer-events-none absolute inset-0 pattern-grid opacity-40" />
        <div className="relative mx-auto max-w-6xl px-4 lg:px-6">
          <Reveal className="max-w-3xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-teresa-gold-700">
              How we are arranged
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold text-teresa-green-950">
              How the school is organised
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Teaching is arranged in four departments, each with its own head of department and a
              written scheme of work for the year.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ACADEMIC_DEPARTMENTS.map((department, index) => (
              <Reveal key={department.name} delay={index * 110} variant="zoom">
                <article className="group h-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 card-lift hover:border-teresa-green-400">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teresa-green-800 to-teresa-green-600 font-serif text-sm font-bold text-white shadow-soft transition-transform duration-500 group-hover:scale-110">
                    {index + 1}
                  </span>
                  <h3 className="mt-4 font-serif text-lg font-bold text-teresa-green-950">
                    {department.name}
                  </h3>
                  <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-teresa-gold-700">
                    {department.classes}
                  </p>
                  <ul className="mt-4 space-y-1.5 text-sm text-slate-700">
                    {department.subjects.map((subject) => (
                      <li key={subject} className="flex gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teresa-green-600" />
                        {subject}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 border-t border-slate-100 pt-3 text-xs leading-relaxed text-slate-500">
                    {department.note}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Fees at a glance                                                 */}
      {/* ---------------------------------------------------------------- */}
      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-teresa-gold-700">
                {state.currentSemester}
              </p>
              <h2 className="mt-2 font-serif text-3xl font-bold text-teresa-green-950">
                Fees at a glance
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                Fees are set by the Headmaster and reviewed each semester; the table below shows
                four classes for reference.
              </p>
            </div>
            <Link
              href="/academics#fees"
              className="group inline-flex items-center gap-1.5 rounded-xl border border-teresa-green-800 px-4 py-2.5 text-sm font-semibold text-teresa-green-800 transition hover:bg-teresa-green-800 hover:text-white"
            >
              Full schedule for all eleven classes
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Reveal>

          <Reveal delay={120}>
            <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200/80 shadow-soft">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] border-collapse text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-teresa-green-900 to-teresa-green-800 text-left text-xs uppercase tracking-wider text-emerald-50">
                      <th className="px-5 py-4 font-semibold">Class</th>
                      <th className="px-5 py-4 font-semibold">Tuition (per semester)</th>
                      <th className="px-5 py-4 font-semibold">Extra classes</th>
                      <th className="px-5 py-4 font-semibold">Meal (per day)</th>
                      <th className="px-5 py-4 font-semibold">ICT &amp; books</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {feeRows.map((row) => (
                      <tr key={row.id} className="transition hover:bg-teresa-green-50/60">
                        <th scope="row" className="px-5 py-4 text-left font-semibold text-slate-900">
                          {row.className}
                          <span className="block text-xs font-normal text-slate-500">
                            {row.department}
                          </span>
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

          <p className="mt-4 text-xs text-slate-500">
            A prepaid semester meal plan is also available &mdash; see the{' '}
            <Link href="/academics#feeding" className="underline hover:text-teresa-green-800">
              feeding programme
            </Link>
            .
          </p>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Campus life                                                      */}
      {/* ---------------------------------------------------------------- */}
      <section className="bg-[#FCFBF7] py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-teresa-gold-700">
                Photographs
              </p>
              <h2 className="mt-2 font-serif text-3xl font-bold text-teresa-green-950">
                Life on the compound
              </h2>
            </div>
            <Link
              href="/gallery"
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-teresa-green-800"
            >
              See more photographs
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Reveal>

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
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-teresa-gold-700">
                      {item.dateLabel}
                    </p>
                    <h3 className="mt-1 font-serif text-lg font-bold text-slate-900">{item.title}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{item.caption}</p>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Closing call to action                                           */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative overflow-hidden bg-teresa-green-900 py-14 lg:py-16">
        <div className="absolute inset-0 opacity-25">
          <img
            src="/images/sports-culture.jpg"
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover animate-ken-burns"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-teresa-green-950 via-teresa-green-900/95 to-teresa-green-950/80" />
        <div className="hero-blob -right-10 top-[-30%] h-72 w-72 bg-teresa-gold-600/30 animate-float-slow" />

        <Reveal className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 lg:px-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-serif text-3xl font-bold text-white">
              Considering the school for your child?
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-emerald-100/90">
              Telephone the office on {OFFICE_CONTACTS.mainPhone} or send an enquiry and we will
              arrange a tour. Applications for the next semester are received throughout the term.
              We currently look after {pupils} pupils with {staff} members of staff.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link
              href="/admissions"
              className="rounded-xl bg-teresa-gold-400 px-6 py-3.5 text-sm font-bold text-teresa-green-950 shadow-[0_16px_40px_-16px_rgba(217,175,55,0.7)] magnetic-btn shine"
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
