import React from 'react';
import { requireStaff } from '@/lib/auth';
import { getSchoolState } from '@/lib/store';
import { PortalShell } from '@/components/portal/PortalShell';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Staff portal | St. Teresa Aubyn Memorial School',
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = requireStaff();
  const state = getSchoolState();

  const profile = state.staff.find(
    (member) =>
      member.staffId === session.staffId || member.email.toLowerCase() === session.email.toLowerCase()
  );

  return (
    <PortalShell
      currentSemester={state.currentSemester}
      pendingApplications={state.teacherRegistrations.filter((reg) => reg.status === 'pending').length}
      pupilCount={state.students.length}
      user={{
        fullName: session.fullName,
        role: session.role,
        staffId: session.staffId,
        email: session.email,
        photo: profile?.photo,
      }}
    >
      {children}
    </PortalShell>
  );
}
