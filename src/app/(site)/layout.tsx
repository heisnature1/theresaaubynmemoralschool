import React from 'react';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SitePreloader } from '@/components/site/SitePreloader';
import { ScrollProgress } from '@/components/site/ScrollProgress';
import { NavigationLoader } from '@/components/site/NavigationLoader';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#FCFBF7]">
      <SitePreloader />
      <ScrollProgress />
      <NavigationLoader />
      <SiteHeader />
      <main className="flex-1 animate-fade-in">{children}</main>
      <SiteFooter />
    </div>
  );
}
