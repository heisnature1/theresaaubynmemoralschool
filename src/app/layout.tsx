import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'St. Teresa Aubyn Memorial School',
    template: '%s | St. Teresa Aubyn Memorial School',
  },
  description:
    'St. Teresa Aubyn Memorial School, founded in 1988: a day school for KG 1 to JHS 3 with a strong academic programme, a daily midday meal and a staff portal for teachers and administrators.',
  applicationName: 'St. Teresa Aubyn Memorial School',
  authors: [{ name: 'St. Teresa Aubyn Memorial School' }],
  openGraph: {
    title: 'St. Teresa Aubyn Memorial School',
    description:
      'News, term dates, fees, admissions and the staff portal for St. Teresa Aubyn Memorial School.',
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
