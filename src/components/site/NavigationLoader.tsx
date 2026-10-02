'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * A slim gold bar that sweeps across the top of the page while a new page is
 * being fetched, so moving around the site never looks frozen.
 */
export function NavigationLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const firstRender = pathname;

  useEffect(() => {
    if (pathname === firstRender) return;
    setLoading(true);
    const timer = window.setTimeout(() => setLoading(false), 900);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="pointer-events-none fixed left-0 top-0 z-[70] h-[3px] w-full overflow-hidden">
      <div className="h-full w-1/3 animate-loader-sweep bg-gradient-to-r from-transparent via-theresa-gold-400 to-transparent" />
    </div>
  );
}
