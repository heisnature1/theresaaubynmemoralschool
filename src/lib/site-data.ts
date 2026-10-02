import { isSupabaseConfigured } from '@/lib/supabase/client';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getSchoolState } from '@/lib/store';
import {
  ClassFeeStructure,
  GalleryItem,
  HistoryMilestone,
  PublicStaffMember,
  SchoolInformation,
  SiteAdmissionStep,
  SiteDepartment,
  SiteNotice,
  SiteTermDate,
  SiteValue,
  UserRole,
} from '@/types/school';

/**
 * Everything the public website shows, in one shape.
 *
 * Every part is read from the database. When a table is missing, empty or the
 * project is not configured at all, that part comes back empty and the pages
 * fall back to their "nothing published yet" placeholders — the site never
 * invents school particulars.
 */
export interface SiteData {
  /** True when a Supabase project is configured for this deployment. */
  configured: boolean;
  info: SchoolInformation | null;
  notices: SiteNotice[];
  milestones: HistoryMilestone[];
  gallery: GalleryItem[];
  departments: SiteDepartment[];
  values: SiteValue[];
  admissionSteps: SiteAdmissionStep[];
  termDates: SiteTermDate[];
  /** Published class fees: the latest row per class, for the current semester when set. */
  feeRows: ClassFeeStructure[];
  /** Public directory: name, role, class, subjects and qualification only. */
  staff: PublicStaffMember[];
  stats: { pupils: number; staff: number; classes: number };
}

export function emptySiteData(): SiteData {
  return {
    configured: false,
    info: null,
    notices: [],
    milestones: [],
    gallery: [],
    departments: [],
    values: [],
    admissionSteps: [],
    termDates: [],
    feeRows: [],
    staff: [],
    stats: { pupils: 0, staff: 0, classes: 0 },
  };
}

/* -------------------------------------------------------------------------- */
/*  Row mapping (snake_case in the database, camelCase in the app)             */
/* -------------------------------------------------------------------------- */

function text(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function list(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0);
}

function mapInfo(row: Record<string, unknown>): SchoolInformation {
  return {
    schoolName: text(row.school_name),
    motto: text(row.motto),
    aboutSummary: text(row.about_summary),
    digitalAddress: text(row.digital_address),
    foundedYear: typeof row.founded_year === 'number' ? row.founded_year : null,
    highlights: list(row.highlights),
    tourHours: text(row.tour_hours),
    officeHours: text(row.office_hours),
    mainPhone: text(row.main_phone),
    headmasterPhone: text(row.headmaster_phone),
    bursaryPhone: text(row.bursary_phone),
    generalEmail: text(row.general_email),
    headmasterEmail: text(row.headmaster_email),
    ownerEmail: text(row.owner_email),
    postalAddress: text(row.postal_address),
    headmasterName: text(row.headmaster_name),
    headmasterTitle: text(row.headmaster_title),
    headmasterMessage: text(row.headmaster_message),
    currentSemester: text(row.current_semester),
    nextReopening: text(row.next_reopening),
  };
}

function mapNotice(row: Record<string, unknown>): SiteNotice {
  const tags: SiteNotice['tag'][] = ['Term', 'Examinations', 'Feeding', 'Event', 'Notice'];
  const tag = text(row.tag);
  return {
    id: String(row.id ?? ''),
    date: text(row.date_label) ?? '',
    title: text(row.title) ?? '',
    body: text(row.body) ?? '',
    tag: tag && (tags as string[]).includes(tag) ? (tag as SiteNotice['tag']) : 'Notice',
  };
}

function mapMilestone(row: Record<string, unknown>): HistoryMilestone {
  return {
    year: text(row.year) ?? '',
    eraTitle: text(row.era_title) ?? '',
    headline: text(row.headline) ?? '',
    description: text(row.description) ?? '',
    highlightMetric: text(row.highlight_metric) ?? '',
    iconName: text(row.icon_name) ?? 'Sparkles',
  };
}

function mapGalleryItem(row: Record<string, unknown>): GalleryItem {
  return {
    id: String(row.id ?? ''),
    title: text(row.title) ?? '',
    category: (text(row.category) ?? 'Campus & Heritage') as GalleryItem['category'],
    imageUrl: text(row.image_url) ?? '',
    caption: text(row.caption) ?? '',
    dateLabel: text(row.date_label) ?? '',
    featured: row.featured === true,
  };
}

function mapDepartment(row: Record<string, unknown>): SiteDepartment {
  return {
    id: String(row.id ?? ''),
    name: text(row.name) ?? '',
    classes: text(row.classes) ?? '',
    subjects: list(row.subjects),
    note: text(row.note) ?? '',
  };
}

function mapValue(row: Record<string, unknown>): SiteValue {
  return {
    id: String(row.id ?? ''),
    title: text(row.title) ?? '',
    body: text(row.body) ?? '',
  };
}

function mapAdmissionStep(row: Record<string, unknown>): SiteAdmissionStep {
  return {
    id: String(row.id ?? ''),
    step: text(row.step) ?? '',
    title: text(row.title) ?? '',
    body: text(row.body) ?? '',
  };
}

function mapTermDate(row: Record<string, unknown>): SiteTermDate {
  return {
    id: String(row.id ?? ''),
    label: text(row.label) ?? '',
    detail: text(row.detail) ?? '',
  };
}

function mapFeeRow(row: Record<string, unknown>): ClassFeeStructure {
  const numeric = (value: unknown) => (typeof value === 'number' ? value : Number(value) || 0);
  return {
    id: String(row.id ?? ''),
    className: text(row.class_name) ?? '',
    department: (text(row.department) ?? 'Lower Primary') as ClassFeeStructure['department'],
    semester: text(row.semester) ?? '',
    tuitionFee: numeric(row.tuition_fee),
    extraClassesFee: numeric(row.extra_classes_fee),
    dailyMealFee: numeric(row.daily_meal_fee),
    semesterMealFee: numeric(row.semester_meal_fee),
    ictAndBooksFee: numeric(row.ict_and_books_fee),
    classTeacher: text(row.class_teacher) ?? '',
    updatedBy: text(row.updated_by) ?? '',
    updatedAt: text(row.updated_at) ?? '',
  };
}

function mapStaff(row: Record<string, unknown>): PublicStaffMember {
  return {
    fullName: text(row.full_name) ?? '',
    role: ((text(row.role) ?? 'teacher') as UserRole) || 'teacher',
    assignedClass: text(row.assigned_class),
    subjects: list(row.subjects),
    qualification: text(row.qualification),
  };
}

/** Keeps only the newest row for each class, newest first when dates allow. */
function latestPerClass(rows: ClassFeeStructure[]): ClassFeeStructure[] {
  const seen = new Map<string, ClassFeeStructure>();
  for (const row of rows) {
    if (!row.className) continue;
    const existing = seen.get(row.className);
    if (!existing) {
      seen.set(row.className, row);
      continue;
    }
    const current = Date.parse(row.updatedAt || '');
    const kept = Date.parse(existing.updatedAt || '');
    if (Number.isFinite(current) && (!Number.isFinite(kept) || current > kept)) {
      seen.set(row.className, row);
    }
  }
  return Array.from(seen.values());
}

/* -------------------------------------------------------------------------- */
/*  Reading the content tables                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Runs one content query. A missing table, a permissions problem or an empty
 * result all degrade to an empty list: the website simply shows what it has.
 */
async function readRows(table: string, orderBy?: string | null): Promise<Record<string, unknown>[]> {
  const client = getSupabaseServerClient();
  if (!client) return [];

  try {
    let query = client.from(table).select('*');
    if (orderBy) query = query.order(orderBy, { ascending: true });
    const { data, error } = await query;
    if (error || !Array.isArray(data)) return [];
    return data as unknown as Record<string, unknown>[];
  } catch {
    return [];
  }
}

async function readInfo(): Promise<SchoolInformation | null> {
  const client = getSupabaseServerClient();
  if (!client) return null;

  try {
    const { data, error } = await client.from('school_information').select('*').limit(1);
    if (error || !Array.isArray(data) || data.length === 0) return null;
    return mapInfo(data[0] as unknown as Record<string, unknown>);
  } catch {
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/*  getSiteData                                                                */
/* -------------------------------------------------------------------------- */

export async function getSiteData(): Promise<SiteData> {
  const data = emptySiteData();

  if (!isSupabaseConfigured()) {
    // No database: the portal still runs on the server's own store, and the
    // website shows the records it keeps (fees and a staff directory) with no
    // published text. Everything else stays empty.
    const state = getSchoolState();
    return {
      ...data,
      feeRows: latestPerClass(state.classFeeStructures),
      staff: state.staff
        .filter((member) => member.isActive)
        .map((member) => ({
          fullName: member.fullName,
          role: member.role,
          assignedClass: member.assignedClass ?? null,
          subjects: member.subjects,
          qualification: member.qualification || null,
        })),
      stats: {
        pupils: state.students.length,
        staff: state.staff.filter((member) => member.isActive).length,
        classes: new Set(state.classFeeStructures.map((row) => row.className)).size,
      },
    };
  }

  const info = await readInfo();

  const [notices, milestones, gallery, departments, values, admissionSteps, termDates, feeTable, pupilRows, staffRows] =
    await Promise.all([
      readRows('site_notices', 'sort_order'),
      readRows('history_milestones', 'sort_order'),
      readRows('gallery_items', 'sort_order'),
      readRows('departments', 'sort_order'),
      readRows('school_values', 'sort_order'),
      readRows('admission_steps', 'sort_order'),
      readRows('term_dates', 'sort_order'),
      readRows('class_fee_structures', null),
      readRows('students', null),
      readRows('profiles', null),
    ]);

  const allFeeRows = feeTable.map(mapFeeRow);
  let feeRows = latestPerClass(allFeeRows);
  if (info?.currentSemester) {
    feeRows = feeRows.filter((row) => row.semester === info.currentSemester);
  }

  const classNames = new Set<string>(feeRows.map((row) => row.className));
  for (const row of pupilRows) {
    const className = text(row.class_name);
    if (className) classNames.add(className);
  }

  return {
    configured: true,
    info,
    notices: notices.filter((row) => row.published !== false).map(mapNotice),
    milestones: milestones.map(mapMilestone).filter((entry) => entry.year || entry.headline),
    gallery: gallery
      .map(mapGalleryItem)
      .filter((entry) => entry.imageUrl)
      .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured))),
    departments: departments.map(mapDepartment).filter((entry) => entry.name),
    values: values.map(mapValue).filter((entry) => entry.title),
    admissionSteps: admissionSteps.map(mapAdmissionStep).filter((entry) => entry.title),
    termDates: termDates.map(mapTermDate).filter((entry) => entry.label),
    feeRows,
    staff: staffRows
      .filter((row) => row.is_active !== false)
      .map(mapStaff)
      .filter((member) => member.fullName),
    stats: {
      pupils: pupilRows.length,
      staff: staffRows.filter((row) => row.is_active !== false).length,
      classes: classNames.size,
    },
  };
}
