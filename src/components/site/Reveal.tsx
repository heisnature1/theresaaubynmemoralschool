'use client';

import React, { useEffect, useRef, useState } from 'react';

type RevealVariant = 'up' | 'zoom' | 'left' | 'right' | 'fade';

interface RevealProps {
  children: React.ReactNode;
  /** Direction the element travels in from. */
  variant?: RevealVariant;
  /** Milliseconds to hold before the element animates (staggering). */
  delay?: number;
  className?: string;
  /** Render as a different element, e.g. "section" or "li". */
  as?: 'div' | 'section' | 'li' | 'article' | 'span' | 'figure';
  /** Anchor target, e.g. id="fees" for in-page links. */
  id?: string;
}

const VARIANT_CLASS: Record<RevealVariant, string> = {
  up: 'reveal',
  zoom: 'reveal-zoom',
  left: 'reveal-left',
  right: 'reveal-right',
  fade: 'reveal-fade',
};

/**
 * Fades content in once it scrolls into view. Uses one shared
 * IntersectionObserver per element, which is cheap enough for long pages.
 */
export function Reveal({
  children,
  variant = 'up',
  delay = 0,
  className = '',
  as = 'div',
  id,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return React.createElement(
    as,
    {
      ref,
      id,
      className: `${VARIANT_CLASS[variant]} ${visible ? 'is-visible' : ''} ${className}`,
      style: delay ? { transitionDelay: `${delay}ms` } : undefined,
    },
    children
  );
}
