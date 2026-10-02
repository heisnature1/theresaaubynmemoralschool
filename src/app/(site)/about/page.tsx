import Link from 'next/link';
import { getSchoolState } from '@/lib/store';
import { SCHOOL_HISTORY_MILESTONES, SCHOOL_VALUES } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'About the School | St. Teresa Aubyn Memorial School',
  description:
    'The history, values and leadership of St. Teresa Aubyn Memorial School, founded in 1988 in memory of Madam Teresa Aubyn.',
};

export default function AboutPage() {
  const state = getSchoolState();
  const leadership = state.staff.filter((member) =>
    ['super_admin', 'headmaster'].includes(member.role)
  );
  const teachers = state.staff.filter((member) => member.role === 'teacher' && member.isActive);

  return (
    <>
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 lg:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teresa-gold-700">
            About us
          </p>
          <h1 className="mt-3 font-serif text-3xl font-bold text-teresa-green-950 sm:text-4xl">
            Founded in 1988, in memory of Madam Teresa Aubyn
          </h1>
          <p className="mt-5 max-w-3xl text-[15px] leading-relaxed text-slate-700">
            The school began on 2 October 1988 with forty-two pupils in four rented classrooms. It
            was opened by the Aubyn family as a working memorial to Madam Teresa Aubyn, a teacher
            for thirty-one years who believed that literacy and good manners were the two gifts a
            school owed every child. Her photograph hangs in the entrance hall, and the courtyard
            between the two teaching blocks is named for her.
          </p>
          <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-slate-700">
            Today the school runs three streams &mdash; Early Childhood, Primary and Junior High
            &mdash; on a single compound. Governance rests with the proprietor and the school
            council; day-to-day academic and financial administration is the responsibility of the
            Headmaster and the Bursary.
          </p>
        </div>
      </section>

      {/* Founder and courtyard */}
      <section className="border-b border-slate-200 bg-[#FCFBF7]">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 lg:grid-cols-12 lg:px-6">
          <figure className="lg:col-span-6 overflow-hidden rounded-md border border-slate-200 bg-white">
            <img
              src="/images/heritage-courtyard.jpg"
              alt="The memorial courtyard named for Madam Teresa Aubyn"
              className="h-80 w-full object-cover"
            />
            <figcaption className="px-4 py-3 text-xs text-slate-600">
              The memorial courtyard and bronze plaque, laid at the school&apos;s twentieth
              anniversary.
            </figcaption>
          </figure>
          <div className="lg:col-span-6">
            <h2 className="font-serif text-2xl font-bold text-teresa-green-950">
              The memorial the school keeps
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-700">
              Madam Teresa Aubyn taught in this district from 1954 until her retirement in 1985. Her
              own teaching notes, her register books and the piano she used for morning assembly are
              kept in the school library. Each October, on Founder&apos;s Day, the school holds a
              short thanksgiving service at the plaque, followed by the Founder&apos;s Shield
              athletics finals.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-slate-700">
              Alumni of the school maintain a small endowment that pays the fees of two pupils each
              year. Applications for those places are considered by the Headmaster together with the
              Old Students&apos; Association.
            </p>
            <Link
              href="/gallery"
              className="mt-6 inline-flex text-sm font-semibold text-teresa-green-800 hover:underline"
            >
              Photographs of the compound
            </Link>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 lg:px-6">
          <h2 className="font-serif text-2xl font-bold text-teresa-green-950">
            Thirty-eight years on the same compound
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Five moments that shaped the school as it is today.
          </p>

          <ol className="mt-9 space-y-8 border-l-2 border-teresa-green-100 pl-6">
            {SCHOOL_HISTORY_MILESTONES.map((milestone) => (
              <li key={milestone.year} className="relative">
                <span className="absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-teresa-gold-500" />
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="font-serif text-xl font-bold text-teresa-green-900">
                    {milestone.year}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-teresa-gold-700">
                    {milestone.eraTitle}
                  </span>
                </div>
                <h3 className="mt-1 font-serif text-lg font-bold text-slate-900">
                  {milestone.headline}
                </h3>
                <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-600">
                  {milestone.description}
                </p>
                <p className="mt-2 text-xs font-semibold text-slate-500">
                  {milestone.highlightMetric}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Values */}
      <section className="border-b border-slate-200 bg-[#FCFBF7]">
        <div className="mx-auto max-w-6xl px-4 py-14 lg:px-6">
          <h2 className="font-serif text-2xl font-bold text-teresa-green-950">
            What we ask of our pupils
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
            Four habits are printed on the wall of every classroom and are the basis of the conduct
            grades reported to parents each semester.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {SCHOOL_VALUES.map((value) => (
              <article key={value.title} className="rounded-md border border-slate-200 bg-white p-5">
                <h3 className="font-serif text-lg font-bold text-teresa-green-950">{value.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{value.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership and staff */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 lg:px-6">
          <h2 className="font-serif text-2xl font-bold text-teresa-green-950">
            The people who run the school
          </h2>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {leadership.map((member) => (
              <article key={member.id} className="rounded-md border border-slate-200 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-teresa-gold-700">
                  {member.role === 'super_admin' ? 'Proprietor' : 'Headmaster'}
                </p>
                <h3 className="mt-1 font-serif text-lg font-bold text-teresa-green-950">
                  {member.fullName}
                </h3>
                <p className="mt-1 text-sm text-slate-600">{member.qualification}</p>
                <p className="mt-3 text-xs text-slate-500">
                  Staff number {member.staffId} &middot; with the school since{' '}
                  {new Date(member.joinedDate).toLocaleDateString('en-GB', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </article>
            ))}
          </div>

          <h3 className="mt-12 font-serif text-xl font-bold text-teresa-green-950">
            Teaching staff, {state.currentSemester}
          </h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-sm">
              <thead>
                <tr className="border-y border-slate-200 text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="py-3 pr-4 font-semibold">Teacher</th>
                  <th className="py-3 pr-4 font-semibold">Class</th>
                  <th className="py-3 pr-4 font-semibold">Subjects</th>
                  <th className="py-3 font-semibold">Qualification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teachers.map((teacher) => (
                  <tr key={teacher.id}>
                    <td className="py-3 pr-4">
                      <span className="font-semibold text-slate-900">{teacher.fullName}</span>
                      <span className="block text-xs text-slate-500">{teacher.staffId}</span>
                    </td>
                    <td className="py-3 pr-4 text-slate-700">{teacher.assignedClass || 'Relief'}</td>
                    <td className="py-3 pr-4 text-slate-600">{teacher.subjects.join(', ')}</td>
                    <td className="py-3 text-slate-600">{teacher.qualification}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-6 text-sm text-slate-600">
            Teachers are appointed by the Headmaster with the approval of the proprietor. New
            appointments are made through the{' '}
            <Link href="/register/teacher" className="font-semibold text-teresa-green-800 hover:underline">
              teaching application form
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
