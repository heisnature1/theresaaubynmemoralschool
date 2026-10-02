import { getSiteData } from '@/lib/site-data';
import { GalleryGrid } from '@/components/site/GalleryGrid';
import { PageHero } from '@/components/site/PageHero';
import { Reveal } from '@/components/site/Reveal';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Gallery',
  description: 'Photographs of the school published by the office.',
};

export default async function GalleryPage() {
  const { gallery } = await getSiteData();

  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title="The compound, the classrooms and the field"
        image="/images/sports-culture.jpg"
      >
        <p className="max-w-3xl leading-relaxed">
          Photographs published by the school office. Parents who would like copies of any
          photograph should ask at the school office.
        </p>
      </PageHero>

      <Reveal as="section" variant="fade" className="bg-[#FCFBF7]">
        <div className="mx-auto max-w-6xl px-4 py-12 lg:px-6">
          {gallery.length > 0 ? (
            <GalleryGrid items={gallery} />
          ) : (
            <p className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-6 text-sm text-slate-600">
              Nothing published yet.
            </p>
          )}
        </div>
      </Reveal>
    </>
  );
}
