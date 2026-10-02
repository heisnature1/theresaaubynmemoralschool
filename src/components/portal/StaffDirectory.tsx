'use client';

import { useMemo, useState } from 'react';
import {
  BadgeCheck,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Pencil,
  Search,
  ShieldOff,
  ShieldCheck,
  UserPlus,
  UserRound,
  X,
} from 'lucide-react';
import { DEPARTMENT_SUBJECTS_FULL, ROLE_LABELS } from '@/lib/constants';
import { SCHOOL_CLASSES } from '@/lib/grading';
import { SchoolStateSnapshot, StaffProfile, UserRole } from '@/types/school';

interface StaffDirectoryProps {
  staff: StaffProfile[];
  /** The signed-in Super Administrator, who may not suspend their own account. */
  currentUser: { fullName: string; staffId: string; role: UserRole };
  onStateChange: (state: SchoolStateSnapshot) => void;
  onNotify: (message: string, type?: 'success' | 'info') => void;
}

interface Draft {
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  assignedClass: string;
  qualification: string;
  subjects: string[];
}

const EMPTY_DRAFT: Draft = {
  fullName: '',
  email: '',
  phone: '',
  role: 'teacher',
  assignedClass: '',
  qualification: '',
  subjects: [],
};

const ROLE_STYLES: Record<UserRole, string> = {
  super_admin: 'bg-theresa-gold-100 text-theresa-gold-900',
  headmaster: 'bg-theresa-green-100 text-theresa-green-900',
  teacher: 'bg-slate-100 text-slate-700',
};

/**
 * Staff account management.
 *
 * The roll, searchable; accounts created here; details corrected; passwords
 * reset; accounts taken out of service and brought back. When the school has
 * connected Supabase, each account is created and kept in step in Supabase
 * Auth, and the badge beside the account says so.
 */
export function StaffDirectory({
  staff,
  currentUser,
  onStateChange,
  onNotify,
}: StaffDirectoryProps) {
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Draft>(EMPTY_DRAFT);
  const [revealed, setRevealed] = useState<{ name: string; password: string } | null>(null);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return staff.filter((member) => {
      if (roleFilter !== 'all' && member.role !== roleFilter) return false;
      if (!needle) return true;
      return [
        member.fullName,
        member.email,
        member.staffId,
        member.phone,
        member.assignedClass || '',
        member.qualification || '',
        ROLE_LABELS[member.role],
        ...member.subjects,
      ]
        .join(' ')
        .toLowerCase()
        .includes(needle);
    });
  }, [staff, query, roleFilter]);

  async function callApi(body: Record<string, unknown>, successMessage: string) {
    setBusy(true);
    try {
      const response = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        onNotify(data.error || 'The request could not be completed.', 'info');
        return null;
      }

      if (data.state) onStateChange(data.state as SchoolStateSnapshot);
      onNotify(successMessage);
      if (data.temporaryPassword) {
        setRevealed({ name: data.staff?.fullName || 'Staff account', password: data.temporaryPassword });
      }
      if (data.supabaseAuth) onNotify(String(data.supabaseAuth), 'info');
      return data;
    } catch {
      onNotify('The server could not be reached.', 'info');
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function createAccount(event: React.FormEvent) {
    event.preventDefault();
    const result = await callApi(
      { action: 'create', ...draft },
      `${draft.fullName} was added to the staff roll.`
    );
    if (result) {
      setDraft(EMPTY_DRAFT);
      setShowCreate(false);
    }
  }

  function startEditing(member: StaffProfile) {
    setEditingId(member.id);
    setEditDraft({
      fullName: member.fullName,
      email: member.email,
      phone: member.phone,
      role: member.role,
      assignedClass: member.assignedClass || '',
      qualification: member.qualification,
      subjects: member.subjects,
    });
  }

  async function saveEdit(member: StaffProfile) {
    const result = await callApi(
      { action: 'update', staffId: member.id, ...editDraft },
      `${editDraft.fullName}'s account was updated.`
    );
    if (result) setEditingId(null);
  }

  async function setActive(member: StaffProfile, isActive: boolean) {
    await callApi(
      { action: 'set_active', staffId: member.id, isActive },
      isActive
        ? `${member.fullName}'s account is active again.`
        : `${member.fullName}'s account is suspended.`
    );
  }

  async function resetPassword(member: StaffProfile) {
    await callApi(
      { action: 'reset_password', staffId: member.id },
      `A new password was issued for ${member.fullName}.`
    );
  }

  function toggleSubject(list: string[], subject: string): string[] {
    return list.includes(subject) ? list.filter((entry) => entry !== subject) : [...list, subject];
  }

  return (
    <section className="rounded-3xl border border-theresa-green-100 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="font-serif text-xl font-bold text-theresa-green-950">
            Staff accounts ({staff.length})
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Search the roll, add an account, correct details, reset a password or take an account
            out of service. Every change is written to the audit trail.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate((open) => !open)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-theresa-green-800 to-theresa-green-700 px-4 py-2.5 text-sm font-bold text-white shadow-soft transition hover:shadow-lift"
        >
          <UserPlus className="h-4 w-4 text-theresa-gold-300" />
          {showCreate ? 'Close' : 'Add a member of staff'}
        </button>
      </div>

      {revealed && (
        <div className="mt-4 flex animate-pop-in flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-dashed border-theresa-gold-400 bg-theresa-gold-50 px-4 py-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-theresa-gold-800">
              Hand this password over in person — it is shown once
            </p>
            <p className="mt-1 font-mono text-lg font-bold text-theresa-green-950">
              {revealed.password}
            </p>
            <p className="text-xs text-slate-600">{revealed.name}</p>
          </div>
          <button
            type="button"
            onClick={() => setRevealed(null)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-theresa-gold-300 bg-white px-3 py-2 text-xs font-semibold text-theresa-gold-800"
          >
            <EyeOff className="h-3.5 w-3.5" />
            I have written it down
          </button>
        </div>
      )}

      {/* Search and filters */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, email, staff number, class or subject"
            className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-9 text-sm outline-none transition focus:border-theresa-green-700 focus:ring-4 focus:ring-theresa-green-100/70"
            aria-label="Search staff accounts"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {(['all', 'super_admin', 'headmaster', 'teacher'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setRoleFilter(option)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-bold transition ${
                roleFilter === option
                  ? 'border-theresa-green-900 bg-theresa-green-900 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-theresa-green-500'
              }`}
            >
              {option === 'all' ? 'Everyone' : ROLE_LABELS[option]}
            </button>
          ))}
        </div>
      </div>

      {/* Create form */}
      {showCreate && (
        <form
          onSubmit={createAccount}
          className="mt-4 animate-fade-in rounded-2xl border border-theresa-green-200 bg-theresa-green-50/50 p-5"
        >
          <h4 className="font-serif text-base font-bold text-theresa-green-950">
            Add a member of staff
          </h4>
          <p className="mt-1 text-xs text-slate-600">
            An account is created with a password shown once; when Supabase is connected the account
            is created in Supabase Auth as well.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Full name *
              </label>
              <input
                required
                value={draft.fullName}
                onChange={(event) => setDraft({ ...draft, fullName: event.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Email address *
              </label>
              <input
                required
                type="email"
                value={draft.email}
                onChange={(event) => setDraft({ ...draft, email: event.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
                placeholder="name@sttheresa-aubyn.edu.gh"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Telephone
              </label>
              <input
                value={draft.phone}
                onChange={(event) => setDraft({ ...draft, phone: event.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Role
              </label>
              <select
                value={draft.role}
                onChange={(event) => setDraft({ ...draft, role: event.target.value as UserRole })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-semibold"
              >
                <option value="teacher">Teacher</option>
                <option value="headmaster">Administrator (Headmaster)</option>
                <option value="super_admin">Super Administrator</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Class
              </label>
              <select
                value={draft.assignedClass}
                onChange={(event) => setDraft({ ...draft, assignedClass: event.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
              >
                <option value="">All-school / not a class teacher</option>
                {SCHOOL_CLASSES.map((className) => (
                  <option key={className} value={className}>
                    {className}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Qualification
              </label>
              <input
                value={draft.qualification}
                onChange={(event) => setDraft({ ...draft, qualification: event.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
                placeholder="B.Ed, M.A…"
              />
            </div>
            <div className="sm:col-span-2">
              <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Subjects
              </span>
              <div className="flex flex-wrap gap-2">
                {DEPARTMENT_SUBJECTS_FULL.map((subject) => (
                  <button
                    key={subject}
                    type="button"
                    onClick={() =>
                      setDraft({ ...draft, subjects: toggleSubject(draft.subjects, subject) })
                    }
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      draft.subjects.includes(subject)
                        ? 'border-theresa-green-700 bg-theresa-green-800 text-white'
                        : 'border-slate-300 bg-white text-slate-600'
                    }`}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button
            type="submit"
            disabled={busy}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-theresa-green-800 to-theresa-green-700 px-5 py-2.5 text-sm font-bold text-white shadow-soft disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            Create the account
          </button>
        </form>
      )}

      {/* The roll */}
      {visible.length === 0 ? (
        <p className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-[#FCFBF7] p-5 text-sm text-slate-600">
          No member of staff matches that search.
        </p>
      ) : (
        <div className="mt-5 space-y-3">
          {visible.map((member) => {
            const editing = editingId === member.id;
            const isSelf =
              member.staffId === currentUser.staffId || member.fullName === currentUser.fullName;
            return (
              <div
                key={member.id}
                className={`rounded-2xl border p-4 transition ${
                  editing
                    ? 'border-theresa-green-400 bg-theresa-green-50/40'
                    : 'border-slate-200 hover:border-theresa-green-300'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    {member.photo ? (
                      <img
                        src={member.photo}
                        alt=""
                        className="h-12 w-12 shrink-0 rounded-xl border border-white object-cover shadow-sm"
                      />
                    ) : (
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-theresa-green-50 text-theresa-green-800">
                        <UserRound className="h-5 w-5" />
                      </span>
                    )}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-slate-900">{member.fullName}</p>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase ${
                            ROLE_STYLES[member.role]
                          }`}
                        >
                          {ROLE_LABELS[member.role]}
                        </span>
                        {!member.isActive && (
                          <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-bold uppercase text-rose-800">
                            Suspended
                          </span>
                        )}
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                            member.authUserId
                              ? 'border-theresa-green-300 bg-white text-theresa-green-800'
                              : 'border-slate-200 bg-white text-slate-500'
                          }`}
                          title={
                            member.authUserId
                              ? 'This account signs in through Supabase Auth'
                              : 'This account signs in with a portal password'
                          }
                        >
                          {member.authUserId ? (
                            <>
                              <BadgeCheck className="h-3 w-3" /> Supabase Auth
                            </>
                          ) : (
                            <>
                              <KeyRound className="h-3 w-3" /> Portal password
                            </>
                          )}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-slate-600">
                        {member.staffId} &middot; {member.email}
                        {member.phone ? ` · ${member.phone}` : ''}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {member.assignedClass || 'All-school'}
                        {member.qualification ? ` · ${member.qualification}` : ''}
                        {member.subjects.length > 0 ? ` · ${member.subjects.join(', ')}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => (editing ? setEditingId(null) : startEditing(member))}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      {editing ? 'Close' : 'Edit'}
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => resetPassword(member)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                    >
                      <KeyRound className="h-3.5 w-3.5" />
                      Reset password
                    </button>
                    {!isSelf && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => setActive(member, !member.isActive)}
                        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold disabled:opacity-60 ${
                          member.isActive
                            ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
                            : 'border-theresa-green-300 text-theresa-green-800 hover:bg-theresa-green-50'
                        }`}
                      >
                        {member.isActive ? (
                          <>
                            <ShieldOff className="h-3.5 w-3.5" /> Suspend
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="h-3.5 w-3.5" /> Reinstate
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {editing && (
                  <div className="mt-4 grid animate-fade-in gap-4 border-t border-slate-200 pt-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Full name
                      </label>
                      <input
                        value={editDraft.fullName}
                        onChange={(event) =>
                          setEditDraft({ ...editDraft, fullName: event.target.value })
                        }
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Email address
                      </label>
                      <input
                        value={editDraft.email}
                        onChange={(event) =>
                          setEditDraft({ ...editDraft, email: event.target.value })
                        }
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Telephone
                      </label>
                      <input
                        value={editDraft.phone}
                        onChange={(event) =>
                          setEditDraft({ ...editDraft, phone: event.target.value })
                        }
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Role
                      </label>
                      <select
                        value={editDraft.role}
                        onChange={(event) =>
                          setEditDraft({ ...editDraft, role: event.target.value as UserRole })
                        }
                        className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-semibold"
                      >
                        <option value="teacher">Teacher</option>
                        <option value="headmaster">Administrator (Headmaster)</option>
                        <option value="super_admin">Super Administrator</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Class
                      </label>
                      <select
                        value={editDraft.assignedClass}
                        onChange={(event) =>
                          setEditDraft({ ...editDraft, assignedClass: event.target.value })
                        }
                        className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
                      >
                        <option value="">All-school / not a class teacher</option>
                        {SCHOOL_CLASSES.map((className) => (
                          <option key={className} value={className}>
                            {className}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Qualification
                      </label>
                      <input
                        value={editDraft.qualification}
                        onChange={(event) =>
                          setEditDraft({ ...editDraft, qualification: event.target.value })
                        }
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Subjects
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {DEPARTMENT_SUBJECTS_FULL.map((subject) => (
                          <button
                            key={subject}
                            type="button"
                            onClick={() =>
                              setEditDraft({
                                ...editDraft,
                                subjects: toggleSubject(editDraft.subjects, subject),
                              })
                            }
                            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                              editDraft.subjects.includes(subject)
                                ? 'border-theresa-green-700 bg-theresa-green-800 text-white'
                                : 'border-slate-300 bg-white text-slate-600'
                            }`}
                          >
                            {subject}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 sm:col-span-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => saveEdit(member)}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-theresa-green-800 to-theresa-green-700 px-5 py-2.5 text-sm font-bold text-white shadow-soft disabled:opacity-60"
                      >
                        {busy ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                        Save changes
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
