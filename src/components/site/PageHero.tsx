import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface PageHeroProps {
  eyebrow: string;
  title: string;
  /** One of the campus photographs in /public/images. */
  image: string;
  /** Optional short line under the title before the children. */
  children?: React.ReactNode;
}

/**
 * The shared banner at the top of every public page: the page title over a
 * photograph of the compound, with a breadcrumb back to the home page.
 */
export function PageHero({ eyebrow, title, image, children }: PageHeroProps) {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <img
          src={image}
          alt=""
          aria-hidden="true"
          className="h-full w-full scale-105 object-cover animate-ken-burns"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-theresa-green-950/95 via-theresa-green-900/90 to-[#04251a]/85" />
        <div className="absolute inset-0 pattern-grid opacity-[0.12]" />
        <div className="hero-blob left-[-8rem] top-[-4rem] h-72 w-72 bg-theresa-green-600/30 animate-float-slow" />
        <div className="hero-blob right-[-6rem] bottom-[-8rem] h-72 w-72 bg-theresa-gold-600/20 animate-float" />
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
