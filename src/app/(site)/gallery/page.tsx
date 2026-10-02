import { getSchoolState } from '@/lib/store';
import { GalleryGrid } from '@/components/site/GalleryGrid';
import { PageHero } from '@/components/site/PageHero';
import { Reveal } from '@/components/site/Reveal';

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
      <PageHero
        eyebrow="Gallery"
        title="The compound, the classrooms and the field"
        image="/images/sports-culture.jpg"
      >
          <p className="max-w-3xl leading-relaxed">
            Photographs taken by the staff during the current academic year. Parents who would like
            copies of any photograph should ask at the school office.
          </p>
      </PageHero>

      <Reveal as="section" variant="fade" className="bg-[#FCFBF7]">
        <div className="mx-auto max-w-6xl px-4 py-12 lg:px-6">
          <GalleryGrid items={state.gallery} />
        </div>
      </Reveal>
    </>
  );
}
