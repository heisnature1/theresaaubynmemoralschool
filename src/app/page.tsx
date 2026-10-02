import React from 'react';
import { getSchoolState } from '@/lib/store';
import { SchoolPlatform } from '@/components/SchoolPlatform';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const initialState = getSchoolState();
  return <SchoolPlatform initialState={initialState} defaultMode="public" />;
}
