import Link from 'next/link';
import { getSchoolState } from '@/lib/store';
import { formatCurrency } from '@/lib/grading';
import { ADMISSION_STEPS, OFFICE_CONTACTS, TERM_DATES } from '@/lib/constants';
import { ProspectusDownload } from '@/components/site/ProspectusDownload';
import { PageHero } from '@/components/site/PageHero';
import { Reveal } from '@/components/site/Reveal';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admissions | St. Teresa Aubyn Memorial School',
  description:
    'How to apply for a place at St. Teresa Aubyn Memorial School, the documents required, assessment arrangements and the current fee schedule.',
};

const REQUIREMENTS = [
  ['KG 1 – KG 2', 'Birth certificate, immunisation card, two passport photographs. The pupil must be four years old by the start of the semester.'],
  ['Basic 1 – Basic 3', 'Birth certificate, most recent school report, transfer letter where applicable. A short reading and number assessment is given.'],
  ['Basic 4 – Basic 6', 'Birth certificate, two years of school reports, transfer letter. Assessment in English and Mathematics.'],
  ['JHS 1 – JHS 3', 'Transfer letter, BECE registration details where applicable, and the last two terminal reports. Interview with the Headmaster.'],
];

export default function AdmissionsPage() {
  const state = getSchoolState();
  const sampleFees = state.classFeeStructures.filter((row) =>
    ['KG 1', 'Basic 4', 'JHS 1'].includes(row.className)
  );

  return (
    <>
      <PageHero
        eyebrow="Admissions"
        title="Applying for a place"
        image="/images/campus-hero.jpg"
      >
          <p className="max-w-3xl leading-relaxed">
            Places are offered throughout the year when a class has room, and in good time for the
            semester beginning {TERM_DATES[4].detail}. Applications are considered in the order they
            are received, and brothers and sisters of current pupils are given preference.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <ProspectusDownload state={state} />
            <Link
              href="/contact"
              className="inline-flex items-center rounded-xl bg-teresa-green-800 px-5 py-3 text-sm font-semibold text-white hover:bg-teresa-green-900 magnetic-btn shine"
            >
              Book a visit or ask a question
            </Link>
          </div>
      </PageHero>

      <Reveal as="section" variant="fade" className="border-b border-slate-200 bg-[#FCFBF7]">
        <div className="mx-auto max-w-6xl px-4 py-14 lg:px-6">
          <h2 className="font-serif text-2xl font-bold text-teresa-green-950">
            Four steps from enquiry to registration
          </h2>
          <ol className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ADMISSION_STEPS.map((step) => (
              <li key={step.step} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft card-lift">
                <span className="font-serif text-2xl font-bold text-teresa-gold-600">{step.step}</span>
                <h3 className="mt-2 font-serif text-lg font-bold text-teresa-green-950">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </Reveal>

      <Reveal as="section" variant="fade" className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-14 lg:grid-cols-12 lg:px-6">
          <div className="lg:col-span-7">
            <h2 className="font-serif text-2xl font-bold text-teresa-green-950">
              What to bring with the application
            </h2>
            <dl className="mt-6 divide-y divide-slate-200 border-y border-slate-200">
              {REQUIREMENTS.map(([level, detail]) => (
                <div key={level} className="py-4">
                  <dt className="font-semibold text-slate-900">{level}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-slate-600">{detail}</dd>
                </div>
              ))}
            </dl>

            <h2 className="mt-12 font-serif text-2xl font-bold text-teresa-green-950">
              Assessment for older applicants
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-700">
              Applicants to Basic 2 and above sit a forty-five minute assessment in English and
              Mathematics, set from the previous year&apos;s syllabus. There is nothing to prepare
              beyond the work the child has already done at their present school. Results are given
              to parents by telephone within three working days.
            </p>
          </div>

          <aside className="lg:col-span-5">
            <div className="rounded-2xl border border-slate-200/80 bg-[#FCFBF7] p-6 shadow-soft card-lift">
              <h2 className="font-serif text-lg font-bold text-teresa-green-950">
                Fees for a few classes
              </h2>
              <p className="mt-1 text-xs text-slate-500">{state.currentSemester}</p>
              <table className="mt-4 w-full border-collapse text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                    <th className="py-2 font-semibold">Class</th>
                    <th className="py-2 font-semibold">Tuition</th>
                    <th className="py-2 font-semibold">Meal / day</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {sampleFees.map((row) => (
                    <tr key={row.id}>
                      <th scope="row" className="py-2.5 text-left font-semibold text-slate-900">
                        {row.className}
                      </th>
                      <td className="py-2.5 text-slate-700">{formatCurrency(row.tuitionFee)}</td>
                      <td className="py-2.5 text-slate-700">{formatCurrency(row.dailyMealFee)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Link
                href="/academics#fees"
                className="mt-4 inline-block text-sm font-semibold text-teresa-green-800 hover:underline"
              >
                Full fee schedule for all classes
              </Link>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-soft card-lift">
              <h2 className="font-serif text-lg font-bold text-teresa-green-950">
                Questions about a place?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                The school office answers admission enquiries on weekdays from 7:00 a.m. to 5:00 p.m.
              </p>
              <dl className="mt-4 space-y-2 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-wider text-slate-500">Office</dt>
                  <dd className="font-semibold text-slate-800">{OFFICE_CONTACTS.mainPhone}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-slate-500">Email</dt>
                  <dd className="font-semibold text-slate-800">{OFFICE_CONTACTS.generalEmail}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </Reveal>

      <Reveal as="section" variant="fade" className="bg-[#FCFBF7]">
        <div className="mx-auto max-w-6xl px-4 py-14 lg:px-6">
          <h2 className="font-serif text-2xl font-bold text-teresa-green-950">
            Frequently asked questions
          </h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {[
              [
                'Is there a school bus?',
                'No. The school does not operate a bus service, though parents in several neighbourhoods arrange a shared taxi. The office can put new families in touch with them.',
              ],
              [
                'What is the school uniform?',
                'Green and gold checked shirts with dark green shorts or skirts, bought from the school shop. Wednesday is the sports kit and Friday is the Friday wear agreed by the PTA.',
              ],
              [
                'Do you accept pupils mid-term?',
                'Yes, where the class has room and the pupil can be assessed before joining. The fees for the semester are not reduced for late entry after the fourth week.',
              ],
              [
                'How are reports issued?',
                'Terminal report cards are printed and signed by the class teacher and the Headmaster, and issued to parents at the end of the semester. A digital copy can be requested from the office.',
              ],
            ].map(([question, answer]) => (
              <article key={question}>
                <h3 className="font-serif text-base font-bold text-slate-900">{question}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{answer}</p>
              </article>
            ))}
          </div>
        </div>
      </Reveal>
    </>
  );
}
