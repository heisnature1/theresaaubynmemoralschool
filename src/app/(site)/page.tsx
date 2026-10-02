import Link from 'next/link';
import { ArrowRight, CalendarDays, Clock, MapPin, Phone } from 'lucide-react';
import { getSchoolState } from '@/lib/store';
import { formatCurrency } from '@/lib/grading';
import {
  ACADEMIC_DEPARTMENTS,
  OFFICE_CONTACTS,
  SCHOOL_NOTICES,
  TERM_DATES,
} from '@/lib/constants';

export const dynamic = 'force-dynamic';

const FEES_AT_A_GLANCE = ['KG 1', 'Basic 3', 'Basic 6', 'JHS 3'];

export default function HomePage() {
  const state = getSchoolState();
  const feeRows = state.classFeeStructures.filter((row) => FEES_AT_A_GLANCE.includes(row.className));
  const campusLife = state.gallery.slice(0, 3);

  return (
    <>
      {/* ---------------------------------------------------------------- */}
      {/* Introduction                                                     */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 lg:grid-cols-12 lg:px-6 lg:py-16">
          <div className="lg:col-span-7">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teresa-gold-700">
              Nursery &middot; Primary &middot; Junior High &middot; Since 1988
            </p>
            <h1 className="mt-3 font-serif text-4xl font-bold leading-tight text-teresa-green-950 sm:text-[42px]">
              A steady, thorough education for the children of our community
            </h1>
            <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-slate-700">
              St. Teresa Aubyn Memorial School is a day school at {OFFICE_CONTACTS.digitalAddress},
              teaching pupils from KG 1 through JHS 3. Classes are kept small, written work is marked
              and returned promptly, and every pupil is given a hot midday meal. Parents are welcome
              on the compound at any time during school hours.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/admissions"
                className="inline-flex items-center gap-2 rounded-md bg-teresa-green-800 px-5 py-3 text-sm font-semibold text-white hover:bg-teresa-green-900"
              >
                Admissions and school visits
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/academics#fees"
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                This term&apos;s fee schedule
              </Link>
            </div>

            <dl className="mt-9 grid grid-cols-2 gap-6 border-t border-slate-200 pt-6 sm:grid-cols-4">
              <div>
                <dt className="text-xs uppercase tracking-wider text-slate-500">Established</dt>
                <dd className="font-serif text-2xl font-bold text-teresa-green-900">1988</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-slate-500">Classes</dt>
                <dd className="font-serif text-2xl font-bold text-teresa-green-900">KG 1 &ndash; JHS 3</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-slate-500">Average class size</dt>
                <dd className="font-serif text-2xl font-bold text-teresa-green-900">24 pupils</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-slate-500">Midday meal</dt>
                <dd className="font-serif text-2xl font-bold text-teresa-green-900">Every pupil</dd>
              </div>
            </dl>
          </div>

          <div className="lg:col-span-5">
            <figure className="overflow-hidden rounded-md border border-slate-200 shadow-sm">
              <img
                src="/images/campus-hero.jpg"
                alt="The main teaching block at St. Teresa Aubyn Memorial School"
                className="h-[340px] w-full object-cover"
              />
              <figcaption className="bg-teresa-green-900 px-4 py-3 text-xs text-emerald-50">
                The main teaching block, seen from the memorial courtyard during morning assembly.
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Notices and term dates                                           */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-b border-slate-200 bg-[#FCFBF7]">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-12 lg:px-6">
          <div className="lg:col-span-8">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-serif text-2xl font-bold text-teresa-green-950">
                Notices for parents
              </h2>
              <span className="text-xs text-slate-500">Updated {SCHOOL_NOTICES[0].date}</span>
            </div>

            <ul className="mt-6 divide-y divide-slate-200 border-y border-slate-200">
              {SCHOOL_NOTICES.map((notice) => (
                <li key={notice.id} className="py-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <time className="text-xs font-semibold uppercase tracking-wider text-teresa-gold-700">
                      {notice.date}
                    </time>
                    <span className="rounded-sm bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                      {notice.tag}
                    </span>
                  </div>
                  <h3 className="mt-1.5 font-serif text-lg font-bold text-slate-900">{notice.title}</h3>
                  <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-600">{notice.body}</p>
                </li>
              ))}
            </ul>
          </div>

          <aside className="lg:col-span-4">
            <div className="rounded-md border border-slate-200 bg-white p-6">
              <h2 className="flex items-center gap-2 font-serif text-lg font-bold text-teresa-green-950">
                <CalendarDays className="h-4 w-4 text-teresa-gold-600" />
                Term dates
              </h2>
              <dl className="mt-4 space-y-3 text-sm">
                {TERM_DATES.map((entry) => (
                  <div key={entry.label}>
                    <dt className="font-semibold text-slate-800">{entry.label}</dt>
                    <dd className="text-slate-600">{entry.detail}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="mt-5 rounded-md border border-slate-200 bg-white p-6">
              <h2 className="font-serif text-lg font-bold text-teresa-green-950">Visit the school</h2>
              <ul className="mt-4 space-y-3 text-sm text-slate-700">
                <li className="flex gap-3">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-teresa-gold-600" />
                  <span>
                    Parent tours: Tuesdays and Thursdays, 9:00 a.m. &ndash; 12:00 noon.
                    <br />
                    Office open weekdays 7:00 a.m. &ndash; 5:00 p.m.
                  </span>
                </li>
                <li className="flex gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teresa-gold-600" />
                  <span>{OFFICE_CONTACTS.postalAddress}</span>
                </li>
                <li className="flex gap-3">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-teresa-gold-600" />
                  <span>{OFFICE_CONTACTS.mainPhone}</span>
                </li>
              </ul>
              <Link
                href="/contact"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-teresa-green-800 hover:underline"
              >
                Send an enquiry to the office
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Headmaster's welcome                                             */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 lg:grid-cols-12 lg:px-6">
          <div className="lg:col-span-4">
            <h2 className="font-serif text-2xl font-bold text-teresa-green-950">
              From the Headmaster
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              Rev. Fr. Bernard Kweku Arthur, M.Ed.
              <br />
              Headmaster since 2014
            </p>
            <img
              src="/images/heritage-courtyard.jpg"
              alt="The memorial courtyard"
              className="mt-6 hidden h-56 w-full rounded-md border border-slate-200 object-cover lg:block"
            />
          </div>
          <blockquote className="lg:col-span-8 border-l-4 border-teresa-gold-500 pl-6">
            <p className="font-serif text-lg leading-relaxed text-slate-800">
              &ldquo;We are not a large school, and we do not wish to be. Our promise to parents is
              simple: your child will be known by name, taught by a qualified teacher who keeps a
              careful record of their progress, fed properly at midday, and corrected firmly but
              kindly when they go wrong.
            </p>
            <p className="mt-4 font-serif text-lg leading-relaxed text-slate-800">
              BECE results matter to us, but so does the character of the young person who leaves
              this compound. Our teachers record marks continuously rather than relying on one
              examination, and we report honestly to parents at the end of every semester.&rdquo;
            </p>
            <footer className="mt-5 text-sm font-semibold text-teresa-green-800">
              Rev. Fr. Bernard Kweku Arthur, M.Ed.
            </footer>
          </blockquote>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Academic departments                                             */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-b border-slate-200 bg-[#FCFBF7]">
        <div className="mx-auto max-w-6xl px-4 py-14 lg:px-6">
          <div className="max-w-3xl">
            <h2 className="font-serif text-2xl font-bold text-teresa-green-950">
              How the school is organised
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Teaching is arranged in four departments, each with its own head of department and a
              written scheme of work for the year.
            </p>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ACADEMIC_DEPARTMENTS.map((department) => (
              <article key={department.name} className="rounded-md border border-slate-200 bg-white p-5">
                <h3 className="font-serif text-lg font-bold text-teresa-green-950">{department.name}</h3>
                <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-teresa-gold-700">
                  {department.classes}
                </p>
                <ul className="mt-3 space-y-1 text-sm text-slate-700">
                  {department.subjects.map((subject) => (
                    <li key={subject} className="flex gap-2">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-teresa-green-700" />
                      {subject}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 border-t border-slate-100 pt-3 text-xs leading-relaxed text-slate-500">
                  {department.note}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Fees at a glance                                                 */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 lg:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl font-bold text-teresa-green-950">
                Fees at a glance
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                {state.currentSemester}. Fees are set by the Headmaster and reviewed each semester;
                the table below shows four classes for reference.
              </p>
            </div>
            <Link
              href="/academics#fees"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-teresa-green-800 hover:underline"
            >
              Full schedule for all eleven classes
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[620px] border-collapse text-sm">
              <thead>
                <tr className="bg-teresa-green-900 text-left text-xs uppercase tracking-wider text-emerald-50">
                  <th className="px-4 py-3 font-semibold">Class</th>
                  <th className="px-4 py-3 font-semibold">Tuition (per semester)</th>
                  <th className="px-4 py-3 font-semibold">Extra classes</th>
                  <th className="px-4 py-3 font-semibold">Meal (per day)</th>
                  <th className="px-4 py-3 font-semibold">ICT &amp; books</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 border-b border-slate-200">
                {feeRows.map((row) => (
                  <tr key={row.id}>
                    <th scope="row" className="px-4 py-3 text-left font-semibold text-slate-900">
                      {row.className}
                      <span className="block text-xs font-normal text-slate-500">{row.department}</span>
                    </th>
                    <td className="px-4 py-3 text-slate-700">{formatCurrency(row.tuitionFee)}</td>
                    <td className="px-4 py-3 text-slate-700">{formatCurrency(row.extraClassesFee)}</td>
                    <td className="px-4 py-3 text-slate-700">{formatCurrency(row.dailyMealFee)}</td>
                    <td className="px-4 py-3 text-slate-700">{formatCurrency(row.ictAndBooksFee)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
      <section className="bg-[#FCFBF7]">
        <div className="mx-auto max-w-6xl px-4 py-14 lg:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-serif text-2xl font-bold text-teresa-green-950">Life on the compound</h2>
            <Link
              href="/gallery"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-teresa-green-800 hover:underline"
            >
              See more photographs
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            {campusLife.map((item) => (
              <figure key={item.id} className="overflow-hidden rounded-md border border-slate-200 bg-white">
                <img src={item.imageUrl} alt={item.title} className="h-52 w-full object-cover" />
                <figcaption className="p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-teresa-gold-700">
                    {item.dateLabel}
                  </p>
                  <h3 className="mt-1 font-serif text-base font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">{item.caption}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Closing call to action                                           */}
      {/* ---------------------------------------------------------------- */}
      <section className="bg-teresa-green-900">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 sm:flex-row sm:items-center sm:justify-between lg:px-6">
          <div>
            <h2 className="font-serif text-2xl font-bold text-white">
              Considering the school for your child?
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-emerald-100/90">
              Telephone the office on {OFFICE_CONTACTS.mainPhone} or send an enquiry and we will
              arrange a tour. Applications for the next semester are received throughout the term.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link
              href="/admissions"
              className="rounded-md bg-teresa-gold-400 px-5 py-3 text-sm font-semibold text-teresa-green-950 hover:bg-teresa-gold-300"
            >
              How to apply
            </Link>
            <Link
              href="/contact"
              className="rounded-md border border-emerald-200/50 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Enquire online
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
