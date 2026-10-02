import { requireStaff } from '@/lib/auth';
import { getSchoolState, toClientState } from '@/lib/store';
import { PortalWorkspace } from '@/components/portal/PortalWorkspace';

export const dynamic = 'force-dynamic';

export default function TeacherPortalPage() {
  const session = requireStaff();
  const state = toClientState(getSchoolState());

  return <PortalWorkspace initialState={state} workspace="teacher" user={session} />;
}
