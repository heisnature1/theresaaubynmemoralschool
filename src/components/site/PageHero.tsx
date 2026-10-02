import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { GradientArt, type GradientArtVariant } from '@/components/site/GradientArt';

interface PageHeroProps {
  eyebrow: string;
  title: string;
  /**
   * Which of the school's gradient fields sits behind the title. The site
   * draws its own artwork — no stock photographs are shipped with the build.
   */
  art?: GradientArtVariant;
  /** Optional short line under the title before the children. */
  children?: React.ReactNode;
}

/**
 * The shared banner at the top of every public page: the page title over one
 * of the school's gradient fields, with a breadcrumb back to the home page.
 */
export function PageHero({ eyebrow, title, art = 'campus', children }: PageHeroProps) {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-theresa-green-950">
        <GradientArt variant={art} className="h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-br from-theresa-green-950/85 via-theresa-green-900/70 to-[#04251a]/85" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-16 lg:px-6 lg:py-20">
        <nav className="flex animate-fade-down items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-100/60">
          <Link href="/" className="transition hover:text-theresa-gold-300">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-theresa-gold-300">{eyebrow}</span>
        </nav>

        <p className="mt-6 animate-fade-down text-[11px] font-bold uppercase tracking-[0.34em] text-theresa-gold-300">
          {eyebrow}
        </p>

        <h1 className="mt-3 max-w-4xl animate-fade-up font-serif text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-[46px]">
          {title}
        </h1>

        <span className="mt-6 block h-1 w-24 animate-fade-up anim-delay-2 rounded-full bg-gradient-to-r from-theresa-gold-400 to-transparent" />

        {children && (
          <div className="mt-6 animate-fade-up anim-delay-3 text-[15px] leading-relaxed text-emerald-50/90 sm:text-base">
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
