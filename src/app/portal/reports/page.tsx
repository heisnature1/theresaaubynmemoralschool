import { requireStaff } from '@/lib/auth';
import { getSchoolState, toClientState } from '@/lib/store';
import { getSiteData } from '@/lib/site-data';
import { PortalWorkspace } from '@/components/portal/PortalWorkspace';

export const dynamic = 'force-dynamic';

export default async function ReportsPortalPage() {
  const session = requireStaff();
  const state = toClientState(getSchoolState());
  const { info } = await getSiteData();

  return <PortalWorkspace siteInfo={info} initialState={state} workspace="reports" user={session} />;
}
