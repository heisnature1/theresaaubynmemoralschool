'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Database,
  Globe2,
  Loader2,
  RefreshCw,
  Save,
} from 'lucide-react';
import { SchoolInformation } from '@/types/school';
import {
  PARTICULAR_FIELDS,
  PARTICULAR_GROUPS,
  countPublished,
} from '@/lib/school-particulars';

interface SchoolParticularsEditorProps {
  /** The particulars as the website currently has them. */
  info: SchoolInformation | null;
  /** True when Supabase is reachable for reading the published row. */
  configured: boolean;
  onNotify: (message: string, type?: 'success' | 'info') => void;
}

type FormState = Record<string, string>;

/** Turns the published row into the editor's string fields. */
function toForm(info: SchoolInformation | null): FormState {
  const form: FormState = {};
  for (const field of PARTICULAR_FIELDS) {
    const value = info ? (info[field.key] as unknown) : null;
    if (Array.isArray(value)) {
      form[field.key as string] = value.join('\n');
    } else if (value === null || value === undefined) {
      form[field.key as string] = '';
    } else {
      form[field.key as string] = String(value);
    }
  }
  return form;
}

/**
 * The office publishes the school's particulars here: the name, motto,
 * contacts, hours, leadership and semester. They are written to the
 * `school_information` row the whole website reads, so a correction goes live
 * without a deployment.
 */
export function SchoolParticularsEditor({
  info,
  configured,
  onNotify,
}: SchoolParticularsEditorProps) {
  const [form, setForm] = useState<FormState>(() => toForm(info));
  const [published, setPublished] = useState<SchoolInformation | null>(info);
  const [databaseReady, setDatabaseReady] = useState(configured);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/api/school-info', { cache: 'no-store' });
      const data = await response.json();
      if (data?.configured !== undefined) setDatabaseReady(Boolean(data.configured));
      if (data?.particulars) {
        setPublished(data.particulars as SchoolInformation);
        setForm(toForm(data.particulars as SchoolInformation));
      }
    } catch {
      // The editor keeps whatever the server gave it.
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const summary = useMemo(() => countPublished(published || {}), [published]);

  function set(key: string, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
    setSaved(null);
  }

  async function publish() {
    setBusy(true);
    setError(null);
    setSaved(null);

    try {
      const response = await fetch('/api/school-info', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ particulars: form }),
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        setError(data.error || 'The particulars could not be published.');
        if (data.configured === false) setDatabaseReady(false);
        onNotify('The particulars were not published.', 'info');
        return;
      }

      setSaved(data.message || 'Published.');
      if (data.particulars) setPublished(data.particulars as SchoolInformation);
      onNotify('School particulars published to the website.');
    } catch {
      setError('The server could not be reached. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Standing */}
      <div className="overflow-hidden rounded-3xl border border-theresa-gold-400/30 bg-gradient-to-r from-theresa-green-950 via-theresa-green-900 to-theresa-green-800 p-6 text-white shadow-lift">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-theresa-gold-300">
              Website content
            </p>
            <h2 className="mt-1 font-serif text-2xl font-bold">School particulars</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-emerald-50/85">
              These are the facts the website publishes about the school, from the masthead to the
              report-card letterheads. Publishing here updates the site on the next visit.
            </p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 text-center backdrop-blur-md">
            <p className="font-serif text-3xl font-bold text-theresa-gold-200">{summary.filled}</p>
            <p className="text-[11px] uppercase tracking-wider text-emerald-100/80">
              of {summary.total} particulars published
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={publish}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-xl bg-theresa-gold-400 px-5 py-2.5 text-sm font-bold text-theresa-green-950 shadow-soft transition hover:shadow-lift disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {busy ? 'Publishing…' : 'Publish to the website'}
          </button>
          <button
            type="button"
            onClick={() => {
              setForm(toForm(published));
              setSaved(null);
              setError(null);
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
          >
            <RefreshCw className="h-4 w-4" />
            Undo unsaved changes
          </button>
          <span
            className={`inline-flex items-center gap-2 text-xs ${
              databaseReady ? 'text-emerald-100/85' : 'text-amber-200'
            }`}
          >
            <Database className="h-3.5 w-3.5" />
            {databaseReady
              ? 'Connected to the school database'
              : 'No database connected — the site is showing empty states'}
          </span>
        </div>
      </div>

      {!databaseReady && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-semibold">Connect the school database to publish from here.</p>
            <p className="mt-1 leading-relaxed">
              Set <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_URL</code>,{' '}
              <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> and{' '}
              <code className="font-mono text-xs">SUPABASE_SERVICE_ROLE_KEY</code>, run{' '}
              <code className="font-mono text-xs">supabase/schema.sql</code>, and the website will
              read every particular you publish. Until then the pages show their
              &ldquo;nothing published yet&rdquo; notes.
            </p>
          </div>
        </div>
      )}

      {error && (
        <p className="flex animate-fade-in items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      )}
      {saved && (
        <p className="flex animate-fade-in items-start gap-2 rounded-2xl border border-theresa-green-200 bg-theresa-green-50 px-4 py-3 text-sm text-theresa-green-900">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          {saved}
        </p>
      )}

      {/* The form, grouped as the office thinks about it */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          {PARTICULAR_GROUPS.map((group) => (
            <section
              key={group.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h3 className="font-serif text-lg font-bold text-theresa-green-950">{group.label}</h3>
              <p className="mt-1 text-xs text-slate-500">{group.blurb}</p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {PARTICULAR_FIELDS.filter((field) => field.group === group.id).map((field) => {
                  const wide = field.kind === 'textarea' || field.kind === 'list';
                  return (
                    <div key={field.key as string} className={wide ? 'sm:col-span-2' : ''}>
                      <label
                        htmlFor={`particular-${field.key as string}`}
                        className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600"
                      >
                        {field.label}
                      </label>
                      {field.kind === 'textarea' || field.kind === 'list' ? (
                        <textarea
                          id={`particular-${field.key as string}`}
                          rows={field.kind === 'list' ? 4 : 5}
                          value={form[field.key as string] || ''}
                          onChange={(event) => set(field.key as string, event.target.value)}
                          placeholder={field.placeholder}
                          className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-theresa-green-700 focus:ring-4 focus:ring-theresa-green-100/70"
                        />
                      ) : (
                        <input
                          id={`particular-${field.key as string}`}
                          type={field.kind === 'number' ? 'number' : 'text'}
                          value={form[field.key as string] || ''}
                          onChange={(event) => set(field.key as string, event.target.value)}
                          placeholder={field.placeholder}
                          className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-theresa-green-700 focus:ring-4 focus:ring-theresa-green-100/70"
                        />
                      )}
                      {field.hint && <p className="mt-1 text-xs text-slate-500">{field.hint}</p>}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {/* Live preview */}
        <aside className="lg:col-span-4">
          <div className="sticky top-24 space-y-4">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
              <div className="bg-gradient-to-br from-theresa-green-950 via-theresa-green-900 to-theresa-green-800 p-5 text-white">
                <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-theresa-gold-300">
                  <Globe2 className="h-3.5 w-3.5" />
                  On the website
                </p>
                <p className="mt-3 font-serif text-xl font-bold">
                  {form.schoolName || 'The school name'}
                </p>
                {form.motto && (
                  <p className="mt-1 text-sm italic text-emerald-100/85">&ldquo;{form.motto}&rdquo;</p>
                )}
                {form.foundedYear && (
                  <p className="mt-2 text-[11px] uppercase tracking-wider text-theresa-gold-200">
                    Since {form.foundedYear}
                  </p>
                )}
              </div>
              <div className="space-y-3 p-5 text-sm text-slate-600">
                <p>{form.aboutSummary || 'The short introduction appears here.'}</p>
                {(form.mainPhone || form.generalEmail) && (
                  <p className="border-t border-slate-100 pt-3 text-xs">
                    {[form.mainPhone, form.generalEmail].filter(Boolean).join(' · ')}
                  </p>
                )}
                {(form.currentSemester || form.nextReopening) && (
                  <p className="text-xs">
                    {form.currentSemester}
                    {form.nextReopening ? ` · reopens ${form.nextReopening}` : ''}
                  </p>
                )}
                {form.highlights && (
                  <div className="flex flex-wrap gap-1.5 border-t border-slate-100 pt-3">
                    {form.highlights
                      .split('\n')
                      .map((line) => line.trim())
                      .filter(Boolean)
                      .slice(0, 5)
                      .map((line) => (
                        <span
                          key={line}
                          className="rounded-full bg-theresa-green-50 px-2.5 py-1 text-[11px] font-semibold text-theresa-green-800"
                        >
                          {line}
                        </span>
                      ))}
                  </div>
                )}
              </div>
            </div>

            <p className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-4 text-xs leading-relaxed text-slate-600">
              Notices for parents, term dates, departments, values, admission steps and gallery
              photographs are published in the school database (see{' '}
              <code className="font-mono">supabase/schema.sql</code>); the website reads them the
              same way.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
