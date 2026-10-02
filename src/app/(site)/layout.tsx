import React from 'react';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SitePreloader } from '@/components/site/SitePreloader';
import { ScrollProgress } from '@/components/site/ScrollProgress';
import { NavigationLoader } from '@/components/site/NavigationLoader';
import { getSiteData } from '@/lib/site-data';
import { SCHOOL_NAME } from '@/lib/constants';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { info, termDates } = await getSiteData();

  return (
    <div className="flex min-h-screen flex-col bg-[#FCFBF7]">
      <SitePreloader schoolName={info?.schoolName || SCHOOL_NAME} foundedYear={info?.foundedYear ?? null} />
      <ScrollProgress />
      <NavigationLoader />
      <SiteHeader
        contacts={{
          mainPhone: info?.mainPhone ?? null,
          generalEmail: info?.generalEmail ?? null,
          postalAddress: info?.postalAddress ?? null,
          digitalAddress: info?.digitalAddress ?? null,
        }}
      />
      <main className="flex-1 animate-fade-in">{children}</main>
      <SiteFooter info={info} termDates={termDates} />
    </div>
  );
}
