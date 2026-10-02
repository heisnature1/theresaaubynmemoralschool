import { requireRole } from '@/lib/auth';
import { getSchoolState, toClientState } from '@/lib/store';
import { PortalWorkspace } from '@/components/portal/PortalWorkspace';

export const dynamic = 'force-dynamic';

export default function AdministratorPortalPage() {
  const session = requireRole(['super_admin', 'headmaster']);
  const state = toClientState(getSchoolState());

  return (
    <PortalWorkspace
      initialState={state}
      workspace="headmaster"
      user={session}
      initialTab="student_payments"
    />
  );
}
