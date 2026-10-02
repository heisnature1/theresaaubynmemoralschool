import Link from 'next/link';
import { SCHOOL_NAME } from '@/lib/constants';
import { getSiteData } from '@/lib/site-data';
import { PageHero } from '@/components/site/PageHero';
import { Reveal } from '@/components/site/Reveal';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'About the School',
  description: 'The history, values, leadership and teaching staff of the school.',
};

export default async function AboutPage() {
  const { info, milestones, values, staff } = await getSiteData();

  const headline = info?.schoolName || SCHOOL_NAME;
  const leadership = staff.filter((member) => member.role === 'super_admin' || member.role === 'headmaster');
  const teachers = staff.filter((member) => member.role === 'teacher');

  return (
    <>
      <PageHero eyebrow="About us" title={headline} image="/images/heritage-courtyard.jpg">
        <p className="max-w-3xl leading-relaxed">
          {info?.aboutSummary || 'Nothing published yet.'}
        </p>
      </PageHero>

      {/* Timeline */}
      <Reveal as="section" variant="fade" className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 lg:px-6">
          <h2 className="font-serif text-2xl font-bold text-theresa-green-950">Our history</h2>
          {milestones.length > 0 ? (
            <ol className="mt-9 space-y-8 border-l-2 border-theresa-green-100 pl-6">
              {milestones.map((milestone) => (
                <li key={`${milestone.year}-${milestone.headline}`} className="relative">
                  <span className="absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-theresa-gold-500" />
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="font-serif text-xl font-bold text-theresa-green-900">
                      {milestone.year}
                    </span>
                    {milestone.eraTitle && (
                      <span className="text-xs font-semibold uppercase tracking-wider text-theresa-gold-700">
                        {milestone.eraTitle}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-1 font-serif text-lg font-bold text-slate-900">
                    {milestone.headline}
                  </h3>
                  {milestone.description && (
                    <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-600">
                      {milestone.description}
                    </p>
                  )}
                  {milestone.highlightMetric && (
                    <p className="mt-2 text-xs font-semibold text-slate-500">
                      {milestone.highlightMetric}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-[#FCFBF7] p-6 text-sm text-slate-600">
              Nothing published yet.
            </p>
          )}
        </div>
      </Reveal>

      {/* Values */}
      <Reveal as="section" variant="fade" className="border-b border-slate-200 bg-[#FCFBF7]">
        <div className="mx-auto max-w-6xl px-4 py-14 lg:px-6">
          <h2 className="font-serif text-2xl font-bold text-theresa-green-950">Our values</h2>
          {values.length > 0 ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((value) => (
                <article key={value.id} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft card-lift">
                  <h3 className="font-serif text-lg font-bold text-theresa-green-950">{value.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{value.body}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white/70 p-6 text-sm text-slate-600">
              Nothing published yet.
            </p>
          )}
        </div>
      </Reveal>

      {/* Leadership and staff */}
      <Reveal as="section" variant="fade" className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 lg:px-6">
          <h2 className="font-serif text-2xl font-bold text-theresa-green-950">
            The people who run the school
          </h2>

          {staff.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-[#FCFBF7] p-6 text-sm text-slate-600">
              Nothing published yet.
            </p>
          ) : (
            <>
              {leadership.length > 0 && (
                <div className="mt-8 grid gap-5 md:grid-cols-2">
                  {leadership.map((member) => (
                    <article key={`${member.fullName}-${member.role}`} className="rounded-2xl border border-slate-200/80 p-5 shadow-soft card-lift">
                      <p className="text-xs font-semibold uppercase tracking-wider text-theresa-gold-700">
                        {member.role === 'super_admin' ? 'Proprietor' : 'Headmaster'}
                      </p>
                      <h3 className="mt-1 font-serif text-lg font-bold text-theresa-green-950">
                        {member.fullName}
                      </h3>
                      {member.qualification && (
                        <p className="mt-1 text-sm text-slate-600">{member.qualification}</p>
                      )}
                    </article>
                  ))}
                </div>
              )}

              {teachers.length > 0 && (
                <>
                  <h3 className="mt-12 font-serif text-xl font-bold text-theresa-green-950">
                    Teaching staff{info?.currentSemester ? `, ${info.currentSemester}` : ''}
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
                          <tr key={teacher.fullName}>
                            <td className="py-3 pr-4 font-semibold text-slate-900">{teacher.fullName}</td>
                            <td className="py-3 pr-4 text-slate-700">{teacher.assignedClass || 'Relief'}</td>
                            <td className="py-3 pr-4 text-slate-600">{teacher.subjects.join(', ')}</td>
                            <td className="py-3 text-slate-600">{teacher.qualification || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          )}

          <p className="mt-6 text-sm text-slate-600">
            Teachers are appointed by the Headmaster with the approval of the proprietor. New
            appointments are made through the{' '}
            <Link href="/register/teacher" className="font-semibold text-theresa-green-800 hover:underline">
              teaching application form
            </Link>
            .
          </p>
        </div>
      </Reveal>
    </>
  );
}
