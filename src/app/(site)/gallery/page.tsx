import { getSchoolState } from '@/lib/store';
import { GalleryGrid } from '@/components/site/GalleryGrid';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Gallery | St. Teresa Aubyn Memorial School',
  description:
    'Photographs of the compound, the science and computing laboratory, the library, sports day and the dining commons.',
};

export default function GalleryPage() {
  const state = getSchoolState();

  return (
    <>
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 lg:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teresa-gold-700">
            Gallery
          </p>
          <h1 className="mt-3 font-serif text-3xl font-bold text-teresa-green-950 sm:text-4xl">
            The compound, the classrooms and the field
          </h1>
          <p className="mt-5 max-w-3xl text-[15px] leading-relaxed text-slate-700">
            Photographs taken by the staff during the current academic year. Parents who would like
            copies of any photograph should ask at the school office.
          </p>
        </div>
      </section>

      <section className="bg-[#FCFBF7]">
        <div className="mx-auto max-w-6xl px-4 py-12 lg:px-6">
          <GalleryGrid items={state.gallery} />
        </div>
      </section>
    </>
  );
}
