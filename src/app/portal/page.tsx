import React from 'react';
import { getSchoolState } from '@/lib/store';
import { SchoolPlatform } from '@/components/SchoolPlatform';

export const dynamic = 'force-dynamic';

export default function PortalPage() {
  const initialState = getSchoolState();
  return (
    <SchoolPlatform
      initialState={initialState}
      defaultMode="portal"
      defaultRole="super_admin"
    />
  );
}
