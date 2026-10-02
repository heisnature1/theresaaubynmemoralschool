import { requireRole } from '@/lib/auth';
import { getSchoolState, toClientState } from '@/lib/store';
import { PortalWorkspace } from '@/components/portal/PortalWorkspace';

export const dynamic = 'force-dynamic';

export default function SuperAdminPortalPage() {
  const session = requireRole(['super_admin']);
  const state = toClientState(getSchoolState());

  return <PortalWorkspace initialState={state} workspace="super_admin" user={session} />;
}
