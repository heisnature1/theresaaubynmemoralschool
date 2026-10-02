import React from 'react';
import { requireStaff } from '@/lib/auth';
import { PortalShell } from '@/components/portal/PortalShell';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Staff portal | St. Teresa Aubyn Memorial School',
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = requireStaff();

  return (
    <PortalShell
      user={{
        fullName: session.fullName,
        role: session.role,
        staffId: session.staffId,
        email: session.email,
      }}
    >
      {children}
    </PortalShell>
  );
}
