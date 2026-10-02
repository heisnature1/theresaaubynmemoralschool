import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getSiteData } from '@/lib/site-data';
import { SCHOOL_CLASSES } from '@/lib/grading';
import { AdmissionApplicationForm } from '@/components/site/AdmissionApplicationForm';
import { PageHero } from '@/components/site/PageHero';
import { Reveal } from '@/components/site/Reveal';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Apply for a place',
  description: 'Apply to St Theresa Aubyn Memorial School and track the application.',
};

export default async function ApplyPage() {
  const { info, feeRows } = await getSiteData();

  const classChoices =
    feeRows.length > 0
      ? Array.from(new Set(feeRows.map((row) => row.className))).filter(Boolean)
      : [...SCHOOL_CLASSES];

  return (
    <>
      <PageHero
        eyebrow="Admissions"
        title="Apply for a place"
        art="admissions"
      >
        <p className="max-w-3xl leading-relaxed">
          Applications are received throughout the year and considered in the order they arrive.
          {info?.nextReopening ? ` The next semester begins ${info.nextReopening}.` : ''}
        </p>
      </PageHero>

      <Reveal as="section" variant="fade" className="bg-[#FCFBF7]">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 lg:grid-cols-12 lg:px-6">
          <div className="lg:col-span-7">
            <AdmissionApplicationForm classes={classChoices} officePhone={info?.mainPhone ?? null} />
          </div>

          <aside className="space-y-5 lg:col-span-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
              <h2 className="font-serif text-lg font-bold text-theresa-green-950">
                What happens next
              </h2>
              <ol className="mt-4 space-y-3 text-sm text-slate-600">
                <li>
                  <strong className="text-slate-800">1. The office reads your application.</strong>{' '}
                  You receive a reference on this page as soon as it is sent.
                </li>
                <li>
                  <strong className="text-slate-800">2. We telephone you.</strong> The office
                  arranges a tour, or a short assessment for children applying to the upper
                  classes.
                </li>
                <li>
                  <strong className="text-slate-800">3. A place is offered.</strong> Once you
                  accept, the child is enrolled and given an admission code.
                </li>
              </ol>
              <p className="mt-4 text-xs text-slate-500">
                The child&apos;s admission code is also the parent sign-in for the parents&apos;
                area, where you follow fees, feeding, marks and the report card.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
              <h2 className="font-serif text-lg font-bold text-theresa-green-950">
                Bring on the day
              </h2>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                <li>&middot; The child&apos;s birth certificate, or a copy</li>
                <li>&middot; The last report card from the present school</li>
                <li>&middot; A passport photograph for the school record</li>
                <li>&middot; A guardian telephone number the office can reach</li>
              </ul>
              {info?.mainPhone && (
                <p className="mt-4 text-sm text-slate-600">
                  Any questions? Telephone the office on{' '}
                  <a
                    href={`tel:${info.mainPhone.replace(/\s/g, '')}`}
                    className="font-semibold text-theresa-green-800 hover:underline"
                  >
                    {info.mainPhone}
                  </a>
                  .
                </p>
              )}
            </div>

            <Link
              href="/admissions"
              className="inline-flex items-center gap-2 text-sm font-semibold text-theresa-green-800 hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to admissions
            </Link>
          </aside>
        </div>
      </Reveal>
    </>
  );
}
