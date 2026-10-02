import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { isSupabaseConfigured } from '@/lib/supabase/client';

/**
 * Supabase Auth for the staff portal.
 *
 * The school's staff sign in through Supabase Auth when a Supabase project is
 * connected, and through the portal's own scrypt passwords when it is not. The
 * two paths are deliberately kept side by side: a school that has not yet set
 * up a database can use the portal at once, and connecting Supabase later does
 * not lock anybody out.
 *
 * Managing accounts (creating a member of staff, resetting a password) needs
 * the service-role key, which is only ever read on the server.
 */

export interface SupabaseAuthResult {
  ok: boolean;
  /** Present when ok: the Supabase user id. */
  userId?: string;
  /** Present when ok and the call issued tokens (never exposed to the browser). */
  accessToken?: string;
  /** A message suitable for the office. */
  error?: string;
  /** True when Supabase simply is not configured for this deployment. */
  notConfigured?: boolean;
}

function url(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || '';
}

function anonKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
}

function serviceKey(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || '';
}

/** True when staff can be provisioned in Supabase Auth (needs the service role). */
export function isSupabaseAdminConfigured(): boolean {
  return isSupabaseConfigured() && serviceKey().length > 0;
}

function anonClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  return createClient(url(), anonKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function adminClient(): SupabaseClient | null {
  if (!isSupabaseAdminConfigured()) return null;
  return createClient(url(), serviceKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function describe(error: unknown): string {
  if (!error) return 'Supabase Auth did not accept the request.';
  if (typeof error === 'string') return error;
  const message = (error as { message?: string }).message;
  return message || 'Supabase Auth did not accept the request.';
}

/* -------------------------------------------------------------------------- */
/*  Signing in and out                                                        */
/* -------------------------------------------------------------------------- */

/** Checks an email address and password against Supabase Auth. */
export async function signInWithSupabase(
  email: string,
  password: string
): Promise<SupabaseAuthResult> {
  const client = anonClient();
  if (!client) {
    return { ok: false, notConfigured: true, error: 'Supabase is not configured.' };
  }

  try {
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error || !data?.user) {
      return { ok: false, error: describe(error) };
    }
    return {
      ok: true,
      userId: data.user.id,
      accessToken: data.session?.access_token,
    };
  } catch (error) {
    return { ok: false, error: describe(error) };
  }
}

/** Best-effort sign-out of Supabase Auth (the portal session is a cookie). */
export async function signOutOfSupabase(): Promise<void> {
  const client = anonClient();
  if (!client) return;
  try {
    await client.auth.signOut();
  } catch {
    // The portal session is cleared regardless; nothing to report.
  }
}

/** The Supabase Auth user behind an access token, if it is still valid. */
export async function readSupabaseUser(accessToken: string): Promise<User | null> {
  const client = anonClient();
  if (!client) return null;
  try {
    const { data, error } = await client.auth.getUser(accessToken);
    if (error) return null;
    return data?.user ?? null;
  } catch {
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/*  Provisioning staff accounts (service role)                                */
/* -------------------------------------------------------------------------- */

/**
 * Creates the Supabase Auth user for a member of staff. The password is set
 * here and handed over in person; the address is marked confirmed so that the
 * office does not have to chase confirmation emails.
 */
export async function createSupabaseStaffUser(input: {
  email: string;
  password: string;
  fullName: string;
  role: string;
  staffId: string;
}): Promise<SupabaseAuthResult> {
  const client = adminClient();
  if (!client) {
    return { ok: false, notConfigured: true, error: 'Supabase service role is not configured.' };
  }

  try {
    const { data, error } = await client.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: {
        full_name: input.fullName,
        role: input.role,
        staff_id: input.staffId,
        school: 'St Theresa Aubyn Memorial School',
      },
    });

    if (error || !data?.user) {
      return { ok: false, error: describe(error) };
    }
    return { ok: true, userId: data.user.id };
  } catch (error) {
    return { ok: false, error: describe(error) };
  }
}

/** Sets a new password for a Supabase Auth user (used by staff management). */
export async function setSupabaseStaffPassword(
  userId: string,
  password: string
): Promise<SupabaseAuthResult> {
  const client = adminClient();
  if (!client) {
    return { ok: false, notConfigured: true, error: 'Supabase service role is not configured.' };
  }
  if (!userId) {
    return { ok: false, error: 'This staff account is not linked to Supabase Auth.' };
  }

  try {
    const { data, error } = await client.auth.admin.updateUserById(userId, { password });
    if (error || !data?.user) return { ok: false, error: describe(error) };
    return { ok: true, userId: data.user.id };
  } catch (error) {
    return { ok: false, error: describe(error) };
  }
}

/** Keeps the Supabase Auth address in step when the office corrects it. */
export async function updateSupabaseStaffUser(
  userId: string,
  changes: { email?: string; fullName?: string; role?: string; staffId?: string; disabled?: boolean }
): Promise<SupabaseAuthResult> {
  const client = adminClient();
  if (!client) {
    return { ok: false, notConfigured: true, error: 'Supabase service role is not configured.' };
  }
  if (!userId) {
    return { ok: false, error: 'This staff account is not linked to Supabase Auth.' };
  }

  try {
    const banned = changes.disabled ? 'none' : undefined;
    const { data, error } = await client.auth.admin.updateUserById(userId, {
      email: changes.email,
      ban_duration: changes.disabled ? '87600h' : banned,
      user_metadata: {
        ...(changes.fullName ? { full_name: changes.fullName } : {}),
        ...(changes.role ? { role: changes.role } : {}),
        ...(changes.staffId ? { staff_id: changes.staffId } : {}),
      },
    });
    if (error || !data?.user) return { ok: false, error: describe(error) };
    return { ok: true, userId: data.user.id };
  } catch (error) {
    return { ok: false, error: describe(error) };
  }
}

/* -------------------------------------------------------------------------- */
/*  Mirroring staff into the `profiles` table                                 */
/* -------------------------------------------------------------------------- */

/**
 * Writes a staff record to the `profiles` table when a database is connected,
 * so that the same roll is visible in Supabase and to the website's public
 * staff directory. Failures are ignored: the portal keeps working from its own
 * store either way.
 */
export async function upsertStaffProfile(profile: {
  staffId: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  assignedClass?: string;
  subjects: string[];
  qualification: string;
  isActive: boolean;
  authUserId?: string;
}): Promise<void> {
  const client = adminClient() ?? (
    isSupabaseConfigured()
      ? createClient(url(), anonKey(), { auth: { persistSession: false, autoRefreshToken: false } })
      : null
  );
  if (!client) return;

  try {
    await client.from('profiles').upsert(
      {
        staff_id: profile.staffId,
        full_name: profile.fullName,
        email: profile.email,
        phone: profile.phone,
        role: profile.role,
        assigned_class: profile.assignedClass ?? null,
        subjects: profile.subjects,
        qualification: profile.qualification,
        is_active: profile.isActive,
        auth_user_id: profile.authUserId ?? null,
      },
      { onConflict: 'staff_id' }
    );
  } catch {
    // The portal's own store remains the record of truth when the database is
    // unreachable or the table has not been created yet.
  }
}
