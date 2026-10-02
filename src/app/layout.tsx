import type { Metadata } from 'next';
import './globals.css';
import { SCHOOL_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: {
    default: SCHOOL_NAME,
    template: `%s | ${SCHOOL_NAME}`,
  },
  description: `Website and staff portal for ${SCHOOL_NAME}.`,
  applicationName: SCHOOL_NAME,
  authors: [{ name: SCHOOL_NAME }],
  openGraph: {
    title: SCHOOL_NAME,
    description: `Website and staff portal for ${SCHOOL_NAME}.`,
    type: 'website',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
