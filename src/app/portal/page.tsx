import { redirect } from 'next/navigation';
import { HOME_FOR_ROLE, getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default function PortalIndexPage() {
  const session = getSession();
  if (!session) redirect('/login/administrator');
  redirect(HOME_FOR_ROLE[session.role]);
}
