import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'St. Teresa Aubyn Memorial School | Official Website & Role-Based Portal',
  description:
    'Modern school management website and cloud portal for St. Teresa Aubyn Memorial School. Featuring Super Admin, Headmaster, and Teacher dashboards, class fee management, daily feeding logs, and end-of-semester reports.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
