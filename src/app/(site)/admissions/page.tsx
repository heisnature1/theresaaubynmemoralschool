import Link from 'next/link';
import { Clock, Mail, Phone } from 'lucide-react';
import { formatCurrency } from '@/lib/grading';
import { getSiteData } from '@/lib/site-data';
import { getSchoolState } from '@/lib/store';
import { ProspectusDownload } from '@/components/site/ProspectusDownload';
import { PageHero } from '@/components/site/PageHero';
import { Reveal } from '@/components/site/Reveal';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admissions',
  description: 'How to apply for a place, the steps in the process and the current fee schedule.',
};

const SAMPLE_CLASSES = ['KG 1', 'Basic 4', 'JHS 1'];

export default async function AdmissionsPage() {
  const content = await getSiteData();
  const state = getSchoolState();

  const { info, admissionSteps, feeRows } = content;
  const requested = feeRows.filter((row) => SAMPLE_CLASSES.includes(row.className));
  const sampleFees = requested.length > 0 ? requested : feeRows.slice(0, 3);
  const hasContactDetails = Boolean(info?.tourHours || info?.officeHours || info?.mainPhone || info?.generalEmail);

  return (
    <>
      <PageHero
        eyebrow="Admissions"
        title="Applying for a place"
        image="/images/campus-hero.jpg"
      >
        <p className="max-w-3xl leading-relaxed">
          Places are offered throughout the year when a class has room.
          {info?.nextReopening ? ` The next semester begins ${info.nextReopening}.` : ''} Applications
          are considered in the order they are received.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <ProspectusDownload state={state} content={content} />
          <Link
            href="/contact"
            className="inline-flex items-center rounded-xl bg-theresa-green-800 px-5 py-3 text-sm font-semibold text-white hover:bg-theresa-green-900 magnetic-btn shine"
          >
            Book a visit or ask a question
          </Link>
        </div>
      </PageHero>

      <Reveal as="section" variant="fade" className="border-b border-slate-200 bg-[#FCFBF7]">
        <div className="mx-auto max-w-6xl px-4 py-14 lg:px-6">
          <h2 className="font-serif text-2xl font-bold text-theresa-green-950">
            From enquiry to registration
          </h2>
          {admissionSteps.length > 0 ? (
            <ol className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {admissionSteps.map((step) => (
                <li key={step.id} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft card-lift">
                  {step.step && (
                    <span className="font-serif text-2xl font-bold text-theresa-gold-600">{step.step}</span>
                  )}
                  <h3 className="mt-2 font-serif text-lg font-bold text-theresa-green-950">{step.title}</h3>
                  {step.body && (
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.body}</p>
                  )}
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white/70 p-6 text-sm text-slate-600">
              Nothing published yet.
            </p>
          )}
        </div>
      </Reveal>

      <Reveal as="section" variant="fade" className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-14 lg:grid-cols-12 lg:px-6">
          <div className="lg:col-span-7">
            <h2 className="font-serif text-2xl font-bold text-theresa-green-950">
              Visiting the school
            </h2>
            {info?.tourHours || info?.officeHours ? (
              <dl className="mt-6 divide-y divide-slate-200 border-y border-slate-200 text-sm">
                {info?.tourHours && (
                  <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:gap-6">
                    <dt className="flex w-48 shrink-0 items-center gap-2 font-semibold text-slate-900">
                      <Clock className="h-4 w-4 text-theresa-gold-600" />
                      Parent tours
                    </dt>
                    <dd className="text-slate-600">{info.tourHours}</dd>
                  </div>
                )}
                {info?.officeHours && (
                  <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:gap-6">
                    <dt className="flex w-48 shrink-0 items-center gap-2 font-semibold text-slate-900">
                      <Clock className="h-4 w-4 text-theresa-gold-600" />
                      Office hours
                    </dt>
                    <dd className="text-slate-600">{info.officeHours}</dd>
                  </div>
                )}
              </dl>
            ) : (
              <p className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-[#FCFBF7] p-6 text-sm text-slate-600">
                Nothing published yet. Please use the contact page to reach the school office.
              </p>
            )}

            <p className="mt-6 text-sm leading-relaxed text-slate-700">
              The school office answers admission enquiries directly. Applicants may be invited to a
              short assessment or a meeting with the Headmaster before a place is offered.
            </p>
          </div>

          <aside className="lg:col-span-5">
            <div className="rounded-2xl border border-slate-200/80 bg-[#FCFBF7] p-6 shadow-soft card-lift">
              <h2 className="font-serif text-lg font-bold text-theresa-green-950">
                Fees for a few classes
              </h2>
              {info?.currentSemester && (
                <p className="mt-1 text-xs text-slate-500">{info.currentSemester}</p>
              )}
              {sampleFees.length > 0 ? (
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
              ) : (
                <p className="mt-4 text-sm text-slate-600">Nothing published yet.</p>
              )}
              <Link
                href="/academics#fees"
                className="mt-4 inline-block text-sm font-semibold text-theresa-green-800 hover:underline"
              >
                Full fee schedule for all classes
              </Link>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-soft card-lift">
              <h2 className="font-serif text-lg font-bold text-theresa-green-950">
                Questions about a place?
              </h2>
              {hasContactDetails ? (
                <dl className="mt-4 space-y-3 text-sm">
                  {info?.mainPhone && (
                    <div>
                      <dt className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500">
                        <Phone className="h-3.5 w-3.5" /> Office
                      </dt>
                      <dd className="font-semibold text-slate-800">{info.mainPhone}</dd>
                    </div>
                  )}
                  {info?.generalEmail && (
                    <div>
                      <dt className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500">
                        <Mail className="h-3.5 w-3.5" /> Email
                      </dt>
                      <dd className="font-semibold text-slate-800">{info.generalEmail}</dd>
                    </div>
                  )}
                </dl>
              ) : (
                <p className="mt-3 text-sm text-slate-600">
                  Please use the contact page and the school office will respond.
                </p>
              )}
            </div>
          </aside>
        </div>
      </Reveal>
    </>
  );
}
