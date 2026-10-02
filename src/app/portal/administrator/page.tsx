import { requireRole } from '@/lib/auth';
import { getSchoolState, toClientState } from '@/lib/store';
import { getSiteData } from '@/lib/site-data';
import { PortalWorkspace } from '@/components/portal/PortalWorkspace';

export const dynamic = 'force-dynamic';

export default async function AdministratorPortalPage({
  searchParams,
}: {
  searchParams?: { tab?: string };
}) {
  const session = requireRole(['super_admin', 'headmaster']);
  const state = toClientState(getSchoolState());
  const { info } = await getSiteData();

  const requestedTab = searchParams?.tab;
  const initialTab = ['class_fees', 'student_payments', 'admissions', 'approvals', 'reports'].includes(
    requestedTab || ''
  )
    ? (requestedTab as 'class_fees' | 'student_payments' | 'admissions' | 'approvals' | 'reports')
    : 'student_payments';

  return (
    <PortalWorkspace
      siteInfo={info}
      initialState={state}
      workspace="headmaster"
      user={session}
      initialTab={initialTab}
    />
  );
}
