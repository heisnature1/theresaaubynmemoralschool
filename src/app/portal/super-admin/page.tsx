import { requireRole } from '@/lib/auth';
import { getSchoolState, toClientState } from '@/lib/store';
import { getSiteData } from '@/lib/site-data';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { PortalWorkspace } from '@/components/portal/PortalWorkspace';

export const dynamic = 'force-dynamic';

export default async function SuperAdminPortalPage() {
  const session = requireRole(['super_admin']);
  const state = toClientState(getSchoolState());
  const { info } = await getSiteData();

  return <PortalWorkspace websiteConfigured={isSupabaseConfigured()} siteInfo={info} initialState={state} workspace="super_admin" user={session} />;
}
