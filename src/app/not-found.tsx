import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FCFBF7]">
      <SiteHeader />
      <main className="mx-auto flex max-w-3xl flex-1 flex-col justify-center px-4 py-20 lg:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teresa-gold-700">
          Page not found
        </p>
        <h1 className="mt-3 font-serif text-3xl font-bold text-teresa-green-950">
          We could not find that page
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-700">
          The page may have been moved, or the address may have been typed incorrectly. The links
          below cover everything on the site.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-md bg-teresa-green-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teresa-green-900"
          >
            Return to the homepage
          </Link>
          <Link
            href="/contact"
            className="rounded-md border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-white"
          >
            Contact the school
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
