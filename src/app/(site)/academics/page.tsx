import Link from 'next/link';
import { formatCurrency } from '@/lib/grading';
import { getSiteData } from '@/lib/site-data';
import { PageHero } from '@/components/site/PageHero';
import { Reveal } from '@/components/site/Reveal';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Academics & Fees',
  description: 'The academic programme, assessment, the fee schedule and the school calendar.',
};

const DEPARTMENTS = ['Early Childhood', 'Lower Primary', 'Upper Primary', 'Junior High'] as const;

const GRADING_KEY = [
  ['A1', '80 – 100', 'Excellent'],
  ['B2', '75 – 79', 'Very good'],
  ['B3', '70 – 74', 'Good'],
  ['C4', '65 – 69', 'Credit'],
  ['C5', '60 – 64', 'Credit'],
  ['C6', '55 – 59', 'Credit'],
  ['D7', '50 – 54', 'Pass'],
  ['E8', '45 – 49', 'Weak pass'],
  ['F9', 'Below 45', 'Needs improvement'],
];

export default async function AcademicsPage() {
  const { info, departments, feeRows, termDates } = await getSiteData();

  const mealPlan = feeRows[0];
  const dailyMeal = mealPlan?.dailyMealFee ?? 0;
  const semesterMealFee = mealPlan?.semesterMealFee ?? 0;
  const subjects = Array.from(new Set(departments.flatMap((department) => department.subjects)));

  return (
    <>
      <PageHero
        eyebrow="Academics and fees"
        title="The teaching programme and what it costs"
        art="academics"
      >
        <p className="max-w-3xl leading-relaxed">
          {info?.currentSemester
            ? `${info.currentSemester}. Marks are recorded continuously, so that parents are never surprised by a terminal report.`
            : 'The school publishes its departments, fee schedule and calendar here as they are issued.'}
        </p>
      </PageHero>

      {/* Departments */}
      <Reveal as="section" variant="fade" className="border-b border-slate-200 bg-[#FCFBF7]">
        <div className="mx-auto max-w-6xl px-4 py-14 lg:px-6">
          <h2 className="font-serif text-2xl font-bold text-theresa-green-950">Departments</h2>

          {departments.length > 0 ? (
            <>
              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                {departments.map((department) => (
                  <article key={department.id} className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-soft card-lift">
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="font-serif text-lg font-bold text-theresa-green-950">
                        {department.name}
                      </h3>
                      {department.classes && (
                        <span className="text-xs font-semibold uppercase tracking-wider text-theresa-gold-700">
                          {department.classes}
                        </span>
                      )}
                    </div>
                    <ul className="mt-4 space-y-1.5 text-sm text-slate-700">
                      {department.subjects.map((subject) => (
                        <li key={subject} className="flex gap-2">
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-theresa-green-700" />
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
                ))}
              </div>

              {subjects.length > 0 && (
                <div className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-soft card-lift">
                  <h3 className="font-serif text-lg font-bold text-theresa-green-950">
                    Subjects taught across the school
                  </h3>
                  <ul className="mt-4 grid gap-2 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-4">
                    {subjects.map((subject) => (
                      <li key={subject} className="rounded-sm bg-[#FCFBF7] px-3 py-2">
                        {subject}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white/70 p-6 text-sm text-slate-600">
              Nothing published yet.
            </p>
          )}
        </div>
      </Reveal>

      {/* Assessment */}
      <Reveal as="section" variant="fade" className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 lg:grid-cols-12 lg:px-6">
          <div className="lg:col-span-7">
            <h2 className="font-serif text-2xl font-bold text-theresa-green-950">
              How pupils are assessed
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-700">
              Each subject mark is made up of continuous assessment out of 30 and the end-of-semester
              examination out of 70. Continuous assessment is built from class exercises, homework,
              projects and written tests. Subject teachers enter marks through the staff portal as
              they are marked, and the class teacher reviews them before reports are printed.
            </p>
            <div className="mt-6 inline-flex flex-col gap-2 rounded-md border border-slate-200 bg-[#FCFBF7] px-5 py-4 text-sm">
              <span className="font-semibold text-slate-800">Continuous assessment</span>
              <span className="text-slate-600">30 marks &mdash; exercises, homework, tests, projects</span>
              <span className="mt-1 font-semibold text-slate-800">Semester examination</span>
              <span className="text-slate-600">70 marks &mdash; written papers in every subject</span>
            </div>
          </div>

          <div className="lg:col-span-5">
            <table className="w-full border-collapse text-sm">
              <caption className="pb-3 text-left font-serif text-lg font-bold text-theresa-green-950">
                Grading key
              </caption>
              <thead>
                <tr className="bg-theresa-green-900 text-left text-xs uppercase tracking-wider text-emerald-50">
                  <th className="px-3 py-2.5 font-semibold">Grade</th>
                  <th className="px-3 py-2.5 font-semibold">Mark</th>
                  <th className="px-3 py-2.5 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 border-b border-slate-200">
                {GRADING_KEY.map(([grade, mark, description]) => (
                  <tr key={grade}>
                    <td className="px-3 py-2 font-semibold text-slate-900">{grade}</td>
                    <td className="px-3 py-2 text-slate-700">{mark}</td>
                    <td className="px-3 py-2 text-slate-600">{description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Reveal>

      {/* Fees */}
      <Reveal as="section" variant="fade" id="fees" className="scroll-mt-24 border-b border-slate-200 bg-[#FCFBF7]">
        <div className="mx-auto max-w-6xl px-4 py-14 lg:px-6">
          <h2 className="font-serif text-2xl font-bold text-theresa-green-950">
            Fee schedule{info?.currentSemester ? `, ${info.currentSemester}` : ''}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
            Fees may be paid in two instalments at the Bursary, by mobile money, or by bank deposit
            into the school account. Receipts are issued for every payment.
          </p>

          {feeRows.length === 0 && (
            <p className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white/70 p-6 text-sm text-slate-600">
              Nothing published yet.
            </p>
          )}

          {DEPARTMENTS.map((department) => {
            const rows = feeRows.filter((row) => row.department === department);
            if (rows.length === 0) return null;
            return (
              <div key={department} className="mt-8">
                <h3 className="font-serif text-lg font-bold text-theresa-green-900">{department}</h3>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full min-w-[760px] border-collapse text-sm">
                    <thead>
                      <tr className="bg-theresa-green-900 text-left text-xs uppercase tracking-wider text-emerald-50">
                        <th className="px-3 py-2.5 font-semibold">Class</th>
                        <th className="px-3 py-2.5 font-semibold">Tuition</th>
                        <th className="px-3 py-2.5 font-semibold">Extra classes</th>
                        <th className="px-3 py-2.5 font-semibold">Daily meal</th>
                        <th className="px-3 py-2.5 font-semibold">Semester meal plan</th>
                        <th className="px-3 py-2.5 font-semibold">ICT &amp; books</th>
                        <th className="px-3 py-2.5 font-semibold">Class teacher</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 border-b border-slate-200 bg-white">
                      {rows.map((row) => (
                        <tr key={row.id}>
                          <th scope="row" className="px-3 py-3 text-left font-semibold text-slate-900">
                            {row.className}
                          </th>
                          <td className="px-3 py-3 text-slate-700">{formatCurrency(row.tuitionFee)}</td>
                          <td className="px-3 py-3 text-slate-700">{formatCurrency(row.extraClassesFee)}</td>
                          <td className="px-3 py-3 text-slate-700">{formatCurrency(row.dailyMealFee)}</td>
                          <td className="px-3 py-3 text-slate-700">{formatCurrency(row.semesterMealFee)}</td>
                          <td className="px-3 py-3 text-slate-700">{formatCurrency(row.ictAndBooksFee)}</td>
                          <td className="px-3 py-3 text-slate-600">{row.classTeacher}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}

        </div>
      </Reveal>

      {/* Extra classes */}
      <Reveal as="section" variant="fade" className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 lg:grid-cols-12 lg:px-6">
          <div className="lg:col-span-6">
            <h2 className="font-serif text-2xl font-bold text-theresa-green-950">
              Afternoon extra classes
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-700">
              Where the school runs extra classes they are supervised by the subject teachers and
              used for revision, past questions and individual help rather than for new material.
              Attendance is recorded daily and reported to parents with the semester report.
            </p>
          </div>

          <div className="lg:col-span-6" id="feeding">
            <h2 className="font-serif text-2xl font-bold text-theresa-green-950">
              The feeding programme
            </h2>
            {dailyMeal > 0 || semesterMealFee > 0 ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {dailyMeal > 0 && (
                  <div className="rounded-2xl border border-slate-200/80 bg-[#FCFBF7] p-5 shadow-soft card-lift">
                    <h3 className="font-serif text-base font-bold text-theresa-green-950">Pay daily</h3>
                    <p className="mt-1 text-sm text-slate-700">
                      {formatCurrency(dailyMeal)} per pupil per day, collected by the class teacher
                      each morning and recorded in the daily feeding register.
                    </p>
                  </div>
                )}
                {semesterMealFee > 0 && (
                  <div className="rounded-2xl border border-slate-200/80 bg-[#FCFBF7] p-5 shadow-soft card-lift">
                    <h3 className="font-serif text-base font-bold text-theresa-green-950">
                      Prepaid meal card
                    </h3>
                    <p className="mt-1 text-sm text-slate-700">
                      {formatCurrency(semesterMealFee)} for the semester, loaded onto a meal card. A
                      receipt is issued at the Bursary and each meal taken is recorded.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-[#FCFBF7] p-6 text-sm text-slate-600">
                Nothing published yet.
              </p>
            )}
          </div>
        </div>
      </Reveal>

      {/* Calendar */}
      <Reveal as="section" variant="fade" className="bg-[#FCFBF7]">
        <div className="mx-auto max-w-6xl px-4 py-14 lg:px-6">
          <h2 className="font-serif text-2xl font-bold text-theresa-green-950">School calendar</h2>
          {termDates.length > 0 ? (
            <ol className="mt-6 divide-y divide-slate-200 border-y border-slate-200">
              {termDates.map((entry) => (
                <li key={entry.id} className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:gap-6">
                  <span className="w-64 shrink-0 text-sm font-semibold text-slate-900">{entry.label}</span>
                  <span className="text-sm text-slate-600">{entry.detail}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white/70 p-6 text-sm text-slate-600">
              Nothing published yet.
            </p>
          )}
          {info?.bursaryPhone && (
            <p className="mt-6 text-sm text-slate-600">
              Parents with a question about fees or reports should contact the Bursary on{' '}
              <a
                href={`tel:${info.bursaryPhone.replace(/\s/g, '')}`}
                className="font-semibold text-theresa-green-800 hover:underline"
              >
                {info.bursaryPhone}
              </a>{' '}
              or{' '}
              <Link href="/contact" className="font-semibold text-theresa-green-800 hover:underline">
                send an enquiry
              </Link>
              .
            </p>
          )}
        </div>
      </Reveal>
    </>
  );
}
