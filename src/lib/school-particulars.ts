import { SchoolInformation } from '@/types/school';

/**
 * The school's particulars — the facts the website publishes about the school.
 *
 * They are not written into the code. The office types them once in the portal
 * (Super Administrator → School particulars) and they are stored in the
 * `school_information` row of the school's database; every page, the
 * prospectus and the report letterheads read them from there.
 */

export type ParticularGroup = 'identity' | 'contact' | 'leadership' | 'calendar';

export interface ParticularField {
  key: keyof SchoolInformation;
  column: string;
  label: string;
  group: ParticularGroup;
  kind: 'text' | 'textarea' | 'number' | 'list';
  hint?: string;
  placeholder?: string;
}

export const PARTICULAR_GROUPS: { id: ParticularGroup; label: string; blurb: string }[] = [
  {
    id: 'identity',
    label: 'The school itself',
    blurb: 'Name, motto, when it was founded and the words used to introduce it.',
  },
  {
    id: 'contact',
    label: 'Reaching the school',
    blurb: 'Telephones, email addresses, the digital address, the post and opening hours.',
  },
  {
    id: 'leadership',
    label: 'Leadership',
    blurb: 'Who signs the letters, and the welcome printed on the home page and report cards.',
  },
  {
    id: 'calendar',
    label: 'Semesters',
    blurb: 'The semester the school is in and when it reopens, shown across the site.',
  },
];

export const PARTICULAR_FIELDS: ParticularField[] = [
  {
    key: 'schoolName',
    column: 'school_name',
    label: 'School name',
    group: 'identity',
    kind: 'text',
    placeholder: 'St Theresa Aubyn Memorial School',
  },
  { key: 'motto', column: 'motto', label: 'Motto', group: 'identity', kind: 'text' },
  {
    key: 'foundedYear',
    column: 'founded_year',
    label: 'Year founded',
    group: 'identity',
    kind: 'number',
    placeholder: '1988',
  },
  {
    key: 'aboutSummary',
    column: 'about_summary',
    label: 'Short introduction',
    group: 'identity',
    kind: 'textarea',
    hint: 'One or two sentences: the welcome shown under the school name on the home page.',
  },
  {
    key: 'highlights',
    column: 'highlights',
    label: 'Highlights',
    group: 'identity',
    kind: 'list',
    hint: 'One per line — the figures and phrases that scroll across the home page.',
  },
  { key: 'mainPhone', column: 'main_phone', label: 'Office telephone', group: 'contact', kind: 'text' },
  {
    key: 'headmasterPhone',
    column: 'headmaster_phone',
    label: "Headmaster's telephone",
    group: 'contact',
    kind: 'text',
  },
  {
    key: 'bursaryPhone',
    column: 'bursary_phone',
    label: 'Bursary telephone',
    group: 'contact',
    kind: 'text',
  },
  {
    key: 'generalEmail',
    column: 'general_email',
    label: 'General email',
    group: 'contact',
    kind: 'text',
    placeholder: 'office@sttheresa-aubyn.edu.gh',
  },
  {
    key: 'headmasterEmail',
    column: 'headmaster_email',
    label: "Headmaster's email",
    group: 'contact',
    kind: 'text',
  },
  {
    key: 'ownerEmail',
    column: 'owner_email',
    label: "Proprietor's email",
    group: 'contact',
    kind: 'text',
  },
  {
    key: 'digitalAddress',
    column: 'digital_address',
    label: 'Ghana Post GPS address',
    group: 'contact',
    kind: 'text',
    placeholder: 'GA-000-0000',
  },
  {
    key: 'postalAddress',
    column: 'postal_address',
    label: 'Postal address',
    group: 'contact',
    kind: 'text',
  },
  { key: 'officeHours', column: 'office_hours', label: 'Office hours', group: 'contact', kind: 'text' },
  {
    key: 'tourHours',
    column: 'tour_hours',
    label: 'Parent tour hours',
    group: 'contact',
    kind: 'text',
  },
  {
    key: 'headmasterName',
    column: 'headmaster_name',
    label: 'Headmaster',
    group: 'leadership',
    kind: 'text',
  },
  {
    key: 'headmasterTitle',
    column: 'headmaster_title',
    label: 'Title',
    group: 'leadership',
    kind: 'text',
    placeholder: 'Headmaster',
  },
  {
    key: 'headmasterMessage',
    column: 'headmaster_message',
    label: "Headmaster's welcome",
    group: 'leadership',
    kind: 'textarea',
    hint: 'Leave a blank line between paragraphs. Printed on the home page and the sign-in pages.',
  },
  {
    key: 'currentSemester',
    column: 'current_semester',
    label: 'Current semester',
    group: 'calendar',
    kind: 'text',
    placeholder: '2026/2027 - First Semester',
  },
  {
    key: 'nextReopening',
    column: 'next_reopening',
    label: 'Next reopening',
    group: 'calendar',
    kind: 'text',
    placeholder: 'Monday, 5 January 2027',
  },
];

/** The columns the `school_information` row accepts. */
export function particularsToRow(values: Partial<SchoolInformation>): Record<string, unknown> {
  const row: Record<string, unknown> = { id: 1, updated_at: new Date().toISOString() };

  for (const field of PARTICULAR_FIELDS) {
    if (!(field.key in values)) continue;
    const value = values[field.key];

    if (field.kind === 'number') {
      const parsed = Number(value);
      row[field.column] = Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : null;
    } else if (field.kind === 'list') {
      row[field.column] = Array.isArray(value)
        ? value.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
        : [];
    } else {
      const text = typeof value === 'string' ? value.trim() : '';
      row[field.column] = text.length > 0 ? text : null;
    }
  }

  return row;
}

/** Turns the portal form's strings back into typed values. */
export function formToParticulars(form: Record<string, string | string[]>): Partial<SchoolInformation> {
  const values: Partial<SchoolInformation> = {};

  for (const field of PARTICULAR_FIELDS) {
    const raw = form[field.key as string];
    if (raw === undefined) continue;

    if (field.kind === 'list') {
      (values as Record<string, unknown>)[field.key] = Array.isArray(raw)
        ? raw
        : String(raw)
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean);
    } else if (field.kind === 'number') {
      const parsed = Number(raw);
      (values as Record<string, unknown>)[field.key] =
        Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    } else {
      (values as Record<string, unknown>)[field.key] = String(raw).trim() || null;
    }
  }

  return values;
}

/** A quick count of what is filled in, for the office's summary line. */
export function countPublished(values: Partial<SchoolInformation>): { filled: number; total: number } {
  const total = PARTICULAR_FIELDS.length;
  const filled = PARTICULAR_FIELDS.filter((field) => {
    const value = values[field.key];
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'number') return value > 0;
    return typeof value === 'string' && value.trim().length > 0;
  }).length;
  return { filled, total };
}
