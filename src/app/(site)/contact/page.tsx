import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { EnquiryForm } from '@/components/site/EnquiryForm';
import { OFFICE_CONTACTS } from '@/lib/constants';

export const metadata = {
  title: 'Contact the School | St. Teresa Aubyn Memorial School',
  description:
    'Telephone numbers, email addresses, visiting hours and directions for St. Teresa Aubyn Memorial School.',
};

const TELEPHONES = [
  ['School office', OFFICE_CONTACTS.mainPhone, 'Admissions, general enquiries and records'],
  ['Headmaster', OFFICE_CONTACTS.headmasterPhone, 'Academic matters, discipline and staff'],
  ['Bursary and feeding desk', OFFICE_CONTACTS.bursaryPhone, 'Fees, receipts and meal plans'],
];

const EMAILS = [
  ['General and admissions', OFFICE_CONTACTS.generalEmail],
  ['Headmaster', OFFICE_CONTACTS.headmasterEmail],
  ['Proprietor', OFFICE_CONTACTS.ownerEmail],
];

export default function ContactPage() {
  return (
    <>
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 lg:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teresa-gold-700">
            Contact
          </p>
          <h1 className="mt-3 font-serif text-3xl font-bold text-teresa-green-950 sm:text-4xl">
            Speaking to the school
          </h1>
          <p className="mt-5 max-w-3xl text-[15px] leading-relaxed text-slate-700">
            The school office is open on weekdays from 7:00 a.m. to 5:00 p.m. Parents are welcome to
            call in without an appointment, though it helps to telephone ahead if you wish to meet a
            particular teacher.
          </p>
        </div>
      </section>

      <section className="bg-[#FCFBF7]">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 lg:grid-cols-12 lg:px-6">
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-md border border-slate-200 bg-white p-6">
              <h2 className="flex items-center gap-2 font-serif text-lg font-bold text-teresa-green-950">
                <MapPin className="h-4 w-4 text-teresa-gold-600" />
                Where to find us
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                {OFFICE_CONTACTS.postalAddress}
              </p>
              <p className="mt-2 text-sm text-slate-700">
                Digital address: <strong>{OFFICE_CONTACTS.digitalAddress}</strong>
              </p>
              <p className="mt-3 text-xs leading-relaxed text-slate-500">
                The compound is a short walk from the main lorry station. Visitors should report to
                the office at the gate, where they will be given a visitor&apos;s pass.
              </p>
            </div>

            <div className="rounded-md border border-slate-200 bg-white p-6">
              <h2 className="flex items-center gap-2 font-serif text-lg font-bold text-teresa-green-950">
                <Phone className="h-4 w-4 text-teresa-gold-600" />
                Telephone
              </h2>
              <dl className="mt-3 space-y-3 text-sm">
                {TELEPHONES.map(([label, number, purpose]) => (
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
            </div>

            <div className="rounded-md border border-slate-200 bg-white p-6">
              <h2 className="flex items-center gap-2 font-serif text-lg font-bold text-teresa-green-950">
                <Mail className="h-4 w-4 text-teresa-gold-600" />
                Email
              </h2>
              <dl className="mt-3 space-y-2 text-sm">
                {EMAILS.map(([label, address]) => (
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
            </div>

            <div className="rounded-md border border-slate-200 bg-white p-6">
              <h2 className="flex items-center gap-2 font-serif text-lg font-bold text-teresa-green-950">
                <Clock className="h-4 w-4 text-teresa-gold-600" />
                Hours
              </h2>
              <dl className="mt-3 space-y-2 text-sm text-slate-700">
                <div className="flex justify-between gap-4">
                  <dt>Lessons</dt>
                  <dd className="text-slate-600">Mon &ndash; Fri, 7:30 a.m. &ndash; 2:30 p.m.</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Afternoon extra classes</dt>
                  <dd className="text-slate-600">Mon &ndash; Fri, 2:30 p.m. &ndash; 4:15 p.m.</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Office and bursary</dt>
                  <dd className="text-slate-600">Mon &ndash; Fri, 7:00 a.m. &ndash; 5:00 p.m.</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Parent tours</dt>
                  <dd className="text-slate-600">Tue &amp; Thu, 9:00 a.m. &ndash; 12:00 noon</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-md border border-slate-200 bg-white p-6 sm:p-8">
              <h2 className="font-serif text-2xl font-bold text-teresa-green-950">
                Send an enquiry to the school office
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Use this form for admissions questions, fee arrangements or requests for records.
                Messages are received by the office and the Headmaster, and are answered within two
                working days.
              </p>
              <div className="mt-7">
                <EnquiryForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
