import React from 'react';
import { SchoolCrest } from '@/components/SchoolCrest';

/**
 * The school's own artwork.
 *
 * The site does not ship stock photographs. Every banner, hero and panel is
 * drawn with layered CSS gradients in the school colours — deep Theresa green,
 * the gold of the crest and warm earth tones — with a soft grid, floating
 * blobs and the crest itself as a watermark. Nothing here is a file to load,
 * so the pages carry no photograph of somebody else's school.
 */
export type GradientArtVariant =
  | 'campus'
  | 'heritage'
  | 'memorial'
  | 'academics'
  | 'admissions'
  | 'contact'
  | 'gallery'
  | 'sport'
  | 'dining'
  | 'portal'
  | 'parent';

interface VariantLayers {
  /** The deep colour field. */
  base: string;
  /** A light wash laid over the field. */
  wash: string;
  /** The two floating shapes. */
  blobA: string;
  blobB: string;
}

/**
 * Class strings are written out in full so that Tailwind's compiler sees them.
 */
const VARIANTS: Record<GradientArtVariant, VariantLayers> = {
  campus: {
    base: 'bg-[linear-gradient(135deg,#052118_0%,#09392a_38%,#115940_74%,#052118_100%)]',
    wash: 'bg-[radial-gradient(circle_at_18%_22%,rgba(217,175,55,0.30),transparent_56%)]',
    blobA: 'left-[-6rem] top-[14%] h-80 w-80 bg-theresa-green-500/35',
    blobB: 'right-[-8rem] bottom-[-6rem] h-96 w-96 bg-theresa-gold-600/25',
  },
  heritage: {
    base: 'bg-[linear-gradient(160deg,#09392a_0%,#0d4734_46%,#381e0e_100%)]',
    wash: 'bg-[radial-gradient(circle_at_78%_18%,rgba(228,196,94,0.26),transparent_58%)]',
    blobA: 'left-[-5rem] bottom-[-5rem] h-72 w-72 bg-theresa-gold-700/30',
    blobB: 'right-[-6rem] top-[-4rem] h-80 w-80 bg-theresa-green-500/25',
  },
  memorial: {
    base: 'bg-[linear-gradient(150deg,#052118_0%,#115940_42%,#623b1e_100%)]',
    wash: 'bg-[radial-gradient(circle_at_30%_80%,rgba(217,175,55,0.32),transparent_60%)]',
    blobA: 'left-[-4rem] top-[-4rem] h-72 w-72 bg-theresa-gold-500/25',
    blobB: 'right-[-5rem] bottom-[-6rem] h-80 w-80 bg-theresa-green-600/30',
  },
  academics: {
    base: 'bg-[linear-gradient(140deg,#04251a_0%,#166f4f_56%,#09392a_100%)]',
    wash: 'bg-[radial-gradient(circle_at_72%_26%,rgba(238,220,153,0.22),transparent_55%)]',
    blobA: 'left-[-6rem] bottom-[-4rem] h-72 w-72 bg-theresa-green-300/20',
    blobB: 'right-[-6rem] top-[-5rem] h-80 w-80 bg-theresa-gold-400/22',
  },
  admissions: {
    base: 'bg-[linear-gradient(135deg,#0d4734_0%,#238b64_62%,#052118_100%)]',
    wash: 'bg-[radial-gradient(circle_at_22%_72%,rgba(217,175,55,0.28),transparent_58%)]',
    blobA: 'left-[-5rem] top-[-5rem] h-72 w-72 bg-theresa-gold-400/22',
    blobB: 'right-[-7rem] bottom-[-6rem] h-96 w-96 bg-theresa-green-800/40',
  },
  contact: {
    base: 'bg-[linear-gradient(135deg,#052118_0%,#0d4734_58%,#238b64_100%)]',
    wash: 'bg-[radial-gradient(circle_at_82%_70%,rgba(228,196,94,0.24),transparent_56%)]',
    blobA: 'left-[-5rem] top-[-5rem] h-72 w-72 bg-theresa-green-400/20',
    blobB: 'right-[-6rem] bottom-[-5rem] h-80 w-80 bg-theresa-gold-600/25',
  },
  gallery: {
    base: 'bg-[linear-gradient(180deg,#052118_0%,#115940_48%,#0d4734_100%)]',
    wash: 'bg-[radial-gradient(circle_at_50%_0%,rgba(217,175,55,0.26),transparent_60%)]',
    blobA: 'left-[-4rem] bottom-[-6rem] h-80 w-80 bg-theresa-gold-500/22',
    blobB: 'right-[-6rem] top-[10%] h-72 w-72 bg-theresa-green-400/20',
  },
  sport: {
    base: 'bg-[linear-gradient(120deg,#381e0e_0%,#0d4734_48%,#052118_100%)]',
    wash: 'bg-[radial-gradient(circle_at_78%_24%,rgba(217,175,55,0.28),transparent_56%)]',
    blobA: 'left-[-6rem] top-[-4rem] h-80 w-80 bg-theresa-gold-700/28',
    blobB: 'right-[-5rem] bottom-[-6rem] h-80 w-80 bg-theresa-green-600/30',
  },
  dining: {
    base: 'bg-[linear-gradient(135deg,#623b1e_0%,#0d4734_55%,#052118_100%)]',
    wash: 'bg-[radial-gradient(circle_at_24%_30%,rgba(238,220,153,0.24),transparent_58%)]',
    blobA: 'left-[-5rem] bottom-[-5rem] h-72 w-72 bg-theresa-gold-600/25',
    blobB: 'right-[-6rem] top-[-5rem] h-80 w-80 bg-theresa-green-700/35',
  },
  portal: {
    base: 'bg-[linear-gradient(140deg,#052118_0%,#09392a_50%,#0d4734_100%)]',
    wash: 'bg-[radial-gradient(circle_at_30%_18%,rgba(217,175,55,0.20),transparent_58%)]',
    blobA: 'left-[-6rem] top-[18%] h-80 w-80 bg-theresa-green-500/25',
    blobB: 'right-[-6rem] bottom-[-6rem] h-80 w-80 bg-theresa-gold-500/22',
  },
  parent: {
    base: 'bg-[linear-gradient(150deg,#052118_0%,#115940_52%,#166f4f_100%)]',
    wash: 'bg-[radial-gradient(circle_at_76%_76%,rgba(228,196,94,0.26),transparent_56%)]',
    blobA: 'left-[-5rem] top-[-5rem] h-72 w-72 bg-theresa-gold-400/22',
    blobB: 'right-[-6rem] bottom-[-5rem] h-80 w-80 bg-theresa-green-300/20',
  },
};

interface GradientArtProps {
  variant?: GradientArtVariant;
  /** Sizing and rounding for the artwork box (e.g. `h-[420px] w-full`). */
  className?: string;
  /** The crest watermark; on by default, as if pressed into the paper. */
  crest?: boolean;
  /** Floating shapes and a slow drift of the colour field. */
  animated?: boolean;
  /** Content laid over the artwork. */
  children?: React.ReactNode;
}

/**
 * A self-contained piece of artwork: put it behind text, or give it a height
 * and use it as a panel in the place where a photograph used to sit.
 */
export function GradientArt({
  variant = 'campus',
  className = '',
  crest = true,
  animated = true,
  children,
}: GradientArtProps) {
  const art = VARIANTS[variant];

  return (
    <div className={`relative isolate overflow-hidden ${className}`}>
      <div
        aria-hidden="true"
        className={`absolute inset-0 ${art.base} ${animated ? 'animate-gradient-pan' : ''}`}
      />
      <div aria-hidden="true" className={`absolute inset-0 ${art.wash}`} />
      <div aria-hidden="true" className="absolute inset-0 pattern-grid opacity-[0.14]" />
      <div
        aria-hidden="true"
        className={`hero-blob ${art.blobA} ${animated ? 'animate-float-slow' : ''}`}
      />
      <div
        aria-hidden="true"
        className={`hero-blob ${art.blobB} ${animated ? 'animate-float' : ''}`}
      />

      {crest && (
        <SchoolCrest
          size="xl"
          className="pointer-events-none absolute right-[-3rem] top-1/2 -translate-y-1/2 scale-[5] opacity-[0.09]"
        />
      )}

      {children}
    </div>
  );
}

/**
 * The artwork used by the page banners: one of our gradient fields, layered
 * with the school's grid and a gold glow so white text always has depth behind
 * it. Replaces the campus photographs the site used to ship.
 */
export function PageBannerArt({
  variant = 'campus',
  className = '',
}: {
  variant?: GradientArtVariant;
  className?: string;
}) {
  return <GradientArt variant={variant} className={`absolute inset-0 ${className}`} />;
}
