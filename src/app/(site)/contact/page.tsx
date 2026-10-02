import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { getSiteData } from '@/lib/site-data';
import { EnquiryForm } from '@/components/site/EnquiryForm';
import { PageHero } from '@/components/site/PageHero';
import { Reveal } from '@/components/site/Reveal';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Contact the School',
  description: 'Telephone numbers, email addresses, visiting hours and an enquiry form.',
};

export default async function ContactPage() {
  const { info } = await getSiteData();

  const telephones: Array<[string, string, string]> = [];
  if (info?.mainPhone) telephones.push(['School office', info.mainPhone, 'Admissions, general enquiries and records']);
  if (info?.headmasterPhone) telephones.push(['Headmaster', info.headmasterPhone, 'Academic matters, discipline and staff']);
  if (info?.bursaryPhone) telephones.push(['Bursary and feeding desk', info.bursaryPhone, 'Fees, receipts and meal plans']);

  const emails: Array<[string, string]> = [];
  if (info?.generalEmail) emails.push(['General and admissions', info.generalEmail]);
  if (info?.headmasterEmail) emails.push(['Headmaster', info.headmasterEmail]);
  if (info?.ownerEmail) emails.push(['Proprietor', info.ownerEmail]);

  const hasHours = Boolean(info?.officeHours || info?.tourHours);

  return (
    <>
      <PageHero eyebrow="Contact" title="Speaking to the school" image="/images/library-dining.jpg">
        <p className="max-w-3xl leading-relaxed">
          {info?.officeHours
            ? `The school office is open ${info.officeHours}. Parents are welcome to call in; it helps to telephone ahead if you wish to meet a particular teacher.`
            : 'The school office can be reached through the details on this page, or through the enquiry form below.'}
        </p>
      </PageHero>

      <Reveal as="section" variant="fade" className="bg-[#FCFBF7]">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 lg:grid-cols-12 lg:px-6">
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-soft card-lift">
              <h2 className="flex items-center gap-2 font-serif text-lg font-bold text-theresa-green-950">
                <MapPin className="h-4 w-4 text-theresa-gold-600" />
                Where to find us
              </h2>
              {info?.postalAddress || info?.digitalAddress ? (
                <>
                  {info?.postalAddress && (
                    <p className="mt-3 text-sm leading-relaxed text-slate-700">{info.postalAddress}</p>
                  )}
                  {info?.digitalAddress && (
                    <p className="mt-2 text-sm text-slate-700">
                      Digital address: <strong>{info.digitalAddress}</strong>
                    </p>
                  )}
                </>
              ) : (
                <p className="mt-3 text-sm text-slate-600">Nothing published yet.</p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-soft card-lift">
              <h2 className="flex items-center gap-2 font-serif text-lg font-bold text-theresa-green-950">
                <Phone className="h-4 w-4 text-theresa-gold-600" />
                Telephone
              </h2>
              {telephones.length > 0 ? (
                <dl className="mt-3 space-y-3 text-sm">
                  {telephones.map(([label, number, purpose]) => (
                    <div key={label}>
                      <dt className="font-semibold text-slate-900">{label}</dt>
                      <dd className="text-slate-700">
                        <a href={`tel:${number.replace(/\s/g, '')}`} className="hover:underline">
                          {number}
                        </a>
                        <span className="block text-xs text-slate-500">{purpose}</span>
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="mt-3 text-sm text-slate-600">Nothing published yet.</p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-soft card-lift">
              <h2 className="flex items-center gap-2 font-serif text-lg font-bold text-theresa-green-950">
                <Mail className="h-4 w-4 text-theresa-gold-600" />
                Email
              </h2>
              {emails.length > 0 ? (
                <dl className="mt-3 space-y-2 text-sm">
                  {emails.map(([label, address]) => (
                    <div key={address}>
                      <dt className="text-xs uppercase tracking-wider text-slate-500">{label}</dt>
                      <dd>
                        <a href={`mailto:${address}`} className="font-medium text-slate-800 hover:underline">
                          {address}
                        </a>
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="mt-3 text-sm text-slate-600">Nothing published yet.</p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-soft card-lift">
              <h2 className="flex items-center gap-2 font-serif text-lg font-bold text-theresa-green-950">
                <Clock className="h-4 w-4 text-theresa-gold-600" />
                Hours
              </h2>
              {hasHours ? (
                <dl className="mt-3 space-y-2 text-sm text-slate-700">
                  {info?.officeHours && (
                    <div className="flex justify-between gap-4">
                      <dt>School office</dt>
                      <dd className="text-slate-600">{info.officeHours}</dd>
                    </div>
                  )}
                  {info?.tourHours && (
                    <div className="flex justify-between gap-4">
                      <dt>Parent tours</dt>
                      <dd className="text-slate-600">{info.tourHours}</dd>
                    </div>
                  )}
                </dl>
              ) : (
                <p className="mt-3 text-sm text-slate-600">Nothing published yet.</p>
              )}
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-soft card-lift sm:p-8">
              <h2 className="font-serif text-2xl font-bold text-theresa-green-950">
                Send an enquiry to the school office
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Use this form for admissions questions, fee arrangements or requests for records.
                Messages are received by the office and the Headmaster.
              </p>
              <div className="mt-7">
                <EnquiryForm phone={info?.mainPhone ?? null} />
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </>
  );
}
