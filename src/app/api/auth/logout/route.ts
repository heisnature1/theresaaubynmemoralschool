import { NextRequest, NextResponse } from 'next/server';
import { PARENT_SESSION_COOKIE, SESSION_COOKIE } from '@/lib/auth';
import { signOutOfSupabase } from '@/lib/supabase/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // Clear the Supabase Auth session too, when one is in use.
  await signOutOfSupabase();

  const response = NextResponse.json({ ok: true, redirect: '/' });
  response.cookies.set(SESSION_COOKIE, '', { path: '/', maxAge: 0 });
  response.cookies.set(PARENT_SESSION_COOKIE, '', { path: '/', maxAge: 0 });
  return response;
}
