import fs from 'fs';
import path from 'path';
import {
  AuditLogEntry,
  SchoolStateSnapshot,
  StaffProfile,
  UserRole,
} from '@/types/school';

/**
 * The school's own records store.
 *
 * This file keeps no school particulars and no demonstration pupils: the
 * website's published content lives in the database (see `site-data.ts`) and
 * the portal's records are entered by the school itself. The only thing seeded
 * here are the two bootstrap staff accounts that the office signs in with.
 *
 * The store covers the whole working year: staff accounts, teaching
 * applications, admissions applications, class fees, pupils, fee receipts, the
 * feeding register, marks, enquiries and the audit trail. A store written by
 * an earlier version is migrated on read, so nothing entered so far is lost.
 */

const STORE_FILE_PATH = '/tmp/st-theresa-aubyn-state-v2.json';

/**
 * Passwords for the two accounts the school office is issued with. Change them
 * (Super Administrator → Staff Directory) before the school goes live.
 */
const ISSUED_CREDENTIALS: Record<string, string> = {
  'owner@sttheresa-aubyn.edu.gh':
    'scrypt$eb28181e90bac3141dcb2d541dc48c85$b004fdc7fcd4a215ca33ff70ba28486404d5ba3ec03b29c58de084773e8ddda692ae6006bcfbc7e0f83944f590da5cc6525141002edbc5258ca3be22ef8a1891',
  'headmaster@sttheresa-aubyn.edu.gh':
    'scrypt$c46924bf2d9afb8f44e6a94e27ba453c$ce9a8c5c74d2af1e5616b99c39a44609161cabf90fdaf9108da8a157c44fcfcfbf21bbd3754348471aba3790cdaa249024ed599aa2594e8700bb00b84f00bc42',
};

function createDefaultState(): SchoolStateSnapshot {
  const staff: StaffProfile[] = [
    {
      id: 'stf-owner',
      staffId: 'STA-OWN-001',
      fullName: 'School Proprietor',
      email: 'owner@sttheresa-aubyn.edu.gh',
      phone: '',
      role: 'super_admin',
      qualification: '',
      subjects: [],
      isActive: true,
      joinedDate: '',
      passwordHash: ISSUED_CREDENTIALS['owner@sttheresa-aubyn.edu.gh'],
    },
    {
      id: 'stf-hm',
      staffId: 'STA-HM-002',
      fullName: 'Headmaster',
      email: 'headmaster@sttheresa-aubyn.edu.gh',
      phone: '',
      role: 'headmaster',
      qualification: '',
      subjects: [],
      isActive: true,
      joinedDate: '',
      passwordHash: ISSUED_CREDENTIALS['headmaster@sttheresa-aubyn.edu.gh'],
    },
  ];

  return {
    currentSemester: '',
    nextSemesterReopening: '',
    staff,
    teacherRegistrations: [],
    admissionApplications: [],
    classFeeStructures: [],
    students: [],
    feePayments: [],
    dailyFeedingLogs: [],
    academicResults: [],
    contactInquiries: [],
    auditLogs: [],
    gallery: [],
  };
}

/**
 * Brings a store written by an earlier version up to date: collections added
 * since then are filled in so that a school that has been keeping records
 * through the portal keeps every one of them.
 */
function migrateState(state: SchoolStateSnapshot): SchoolStateSnapshot {
  return {
    ...state,
    teacherRegistrations: state.teacherRegistrations ?? [],
    admissionApplications: state.admissionApplications ?? [],
    classFeeStructures: state.classFeeStructures ?? [],
    students: state.students ?? [],
    feePayments: state.feePayments ?? [],
    dailyFeedingLogs: state.dailyFeedingLogs ?? [],
    academicResults: state.academicResults ?? [],
    contactInquiries: state.contactInquiries ?? [],
    auditLogs: state.auditLogs ?? [],
    gallery: state.gallery ?? [],
  };
}

let memoryState: SchoolStateSnapshot | null = null;

/**
 * Makes sure every staff account has a usable password. Accounts created before
 * the portal introduced staff sign-in inherit the password issued by the office.
 */
function ensureStaffCredentials(state: SchoolStateSnapshot): SchoolStateSnapshot {
  for (const member of state.staff) {
    if (member.passwordHash) continue;
    const email = member.email.toLowerCase();
    if (ISSUED_CREDENTIALS[email]) {
      member.passwordHash = ISSUED_CREDENTIALS[email];
    }
  }

  return state;
}

export function getSchoolState(): SchoolStateSnapshot {
  if (memoryState) return ensureStaffCredentials(memoryState);

  try {
    if (fs.existsSync(STORE_FILE_PATH)) {
      const raw = fs.readFileSync(STORE_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw) as SchoolStateSnapshot;
      if (parsed && Array.isArray(parsed.students) && Array.isArray(parsed.classFeeStructures)) {
        memoryState = ensureStaffCredentials(migrateState(parsed));
        return memoryState;
      }
    }
  } catch {
    // Fall back to a fresh state if the store file cannot be read
  }

  memoryState = createDefaultState();
  saveSchoolState(memoryState);
  return memoryState;
}

/**
 * Strips anything that must never reach the browser: staff and applicant
 * password hashes, and the parent access PINs held against pupil records.
 */
export function toClientState(state: SchoolStateSnapshot): SchoolStateSnapshot {
  return {
    ...state,
    staff: state.staff.map(({ passwordHash, ...rest }) => rest),
    teacherRegistrations: state.teacherRegistrations.map(({ passwordHash, ...rest }) => rest),
    students: state.students.map(({ accessPinHash, ...rest }) => rest),
  };
}

export function saveSchoolState(state: SchoolStateSnapshot): SchoolStateSnapshot {
  memoryState = state;
  try {
    const dir = path.dirname(STORE_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE_PATH, JSON.stringify(state, null, 2), 'utf-8');
  } catch {
    // Ignore write errors in read-only environments
  }
  return state;
}

export function appendAuditLog(
  state: SchoolStateSnapshot,
  entry: {
    actorName: string;
    actorRole: UserRole;
    action: string;
    category: AuditLogEntry['category'];
    details: string;
  }
) {
  const newLog: AuditLogEntry = {
    id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    actorName: entry.actorName,
    actorRole: entry.actorRole,
    action: entry.action,
    category: entry.category,
    details: entry.details,
    createdAt: new Date().toISOString(),
  };
  state.auditLogs.unshift(newLog);
}

export function resetSchoolState(): SchoolStateSnapshot {
  const fresh = createDefaultState();
  return saveSchoolState(fresh);
}
