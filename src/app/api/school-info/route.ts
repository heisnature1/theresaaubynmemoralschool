import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { appendAuditLog, getSchoolState, saveSchoolState } from '@/lib/store';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { formToParticulars, particularsToRow } from '@/lib/school-particulars';

export const dynamic = 'force-dynamic';

/**
 * The school's particulars.
 *
 * GET   the row as published (the same figures every page reads)
 * PATCH publish corrections from the portal
 *
 * The write goes to the `school_information` row with the service role, which
 * needs a connected Supabase project; without one the portal says so plainly
 * rather than pretending the website was updated.
 */

function hasServiceRole(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function text(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

export async function GET() {
  const client = getSupabaseServerClient();
  if (!client) {
    return NextResponse.json({ ok: true, configured: false, particulars: null });
  }

  try {
    const { data, error } = await client.from('school_information').select('*').limit(1);
    if (error || !Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ ok: true, configured: true, particulars: null, error: error?.message });
    }
    return NextResponse.json({ ok: true, configured: true, particulars: data[0] });
  } catch (error) {
    return NextResponse.json({
      ok: true,
      configured: true,
      particulars: null,
      error: error instanceof Error ? error.message : 'The row could not be read.',
    });
  }
}

export async function PATCH(req: NextRequest) {
  const session = getSession();
  if (!session || !['super_admin', 'headmaster'].includes(session.role)) {
    return NextResponse.json(
      { error: 'The school office publishes the particulars.' },
      { status: 403 }
    );
  }

  if (!isSupabaseConfigured() || !hasServiceRole()) {
    return NextResponse.json(
      {
        error:
          'The website reads its particulars from the school database. Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY, then publish again.',
        configured: false,
      },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    const values = formToParticulars((body?.particulars || {}) as Record<string, string | string[]>);
    const row = particularsToRow(values);

    const client = getSupabaseServerClient();
    if (!client) {
      return NextResponse.json({ error: 'The database is not reachable.' }, { status: 503 });
    }

    const { error } = await client
      .from('school_information')
      .upsert({ ...row, id: 1 }, { onConflict: 'id' });

    if (error) {
      // The row may predate a column: retry with only the columns that exist.
      const minimal = {
        id: 1,
        school_name: row.school_name ?? null,
        motto: row.motto ?? null,
        about_summary: row.about_summary ?? null,
        current_semester: row.current_semester ?? null,
        next_reopening: row.next_reopening ?? null,
      };
      const retry = await client.from('school_information').upsert(minimal, { onConflict: 'id' });
      if (retry.error) {
        return NextResponse.json(
          { error: `The particulars could not be saved: ${retry.error.message}` },
          { status: 502 }
        );
      }
    }

    const state = getSchoolState();
    const published = Object.entries(values).filter(([, value]) =>
      Array.isArray(value) ? value.length > 0 : Boolean(value)
    );
    appendAuditLog(state, {
      actorName: session.fullName,
      actorRole: session.role === 'headmaster' ? 'headmaster' : 'super_admin',
      action: 'Published the school particulars',
      category: 'website',
      details: `Published ${published.length} field${
        published.length === 1 ? '' : 's'
      } to the website: ${published.map(([key]) => key).join(', ')}.`,
    });
    saveSchoolState(state);

    const { data } = await client.from('school_information').select('*').limit(1);
    return NextResponse.json({
      ok: true,
      configured: true,
      particulars: (data && data[0]) || null,
      message: 'The school particulars are published; the website picks them up on the next visit.',
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'The particulars could not be published just now.',
      },
      { status: 500 }
    );
  }
}
