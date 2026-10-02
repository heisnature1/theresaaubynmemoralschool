import {
  ADMISSION_STATUS_LABELS,
  ADMISSION_STATUSES,
  AdmissionApplication,
  AdmissionStatus,
  SchoolStateSnapshot,
} from '@/types/school';

/**
 * Admission applications.
 *
 * Applications arrive from the website or are entered at the office, and are
 * found again by searching: reference, child, guardian, telephone number or
 * class. The same search backs the public "check an application" box and the
 * register in the portal.
 */

/** The reference a parent quotes, e.g. ADM/2026/0142. */
export function nextAdmissionReference(state: SchoolStateSnapshot): string {
  const year = new Date().getFullYear();
  const used = state.admissionApplications
    .map((entry) => Number((entry.reference.split('/').pop() || '').replace(/\D/g, '')))
    .filter((value) => Number.isFinite(value));
  const next = (used.length > 0 ? Math.max(...used) : 0) + 1;
  return `ADM/${year}/${String(next).padStart(4, '0')}`;
}

/** Digits only, so that +233 24 000 1111 and 0240001111 compare equal. */
export function normalisePhone(value: string): string {
  const digits = String(value || '').replace(/\D/g, '');
  // Local numbers are written 024 000 1111; international ones +233 24 000 1111.
  return digits.startsWith('233') && digits.length > 9 ? `0${digits.slice(3)}` : digits;
}

export function isAdmissionStatus(value: unknown): value is AdmissionStatus {
  return typeof value === 'string' && (ADMISSION_STATUSES as string[]).includes(value);
}

export function admissionStatusLabel(status: AdmissionStatus): string {
  return ADMISSION_STATUS_LABELS[status] || status;
}

/**
 * The fields a search box looks through. Case-insensitive and forgiving of
 * spaces and punctuation in telephone numbers.
 */
export function admissionMatches(application: AdmissionApplication, rawQuery: string): boolean {
  const query = String(rawQuery || '').trim().toLowerCase();
  if (!query) return true;

  const haystack = [
    application.reference,
    application.childFullName,
    application.guardianName,
    application.guardianEmail || '',
    application.classApplied,
    admissionStatusLabel(application.status),
    application.studentCode || '',
    application.previousSchool || '',
  ]
    .join(' ')
    .toLowerCase();

  if (haystack.includes(query)) return true;

  // Telephone numbers: compare digits so "024 000 1111" finds "+233 24 000 1111".
  const digits = query.replace(/\D/g, '');
  if (digits.length >= 4) {
    return normalisePhone(application.guardianPhone).includes(normalisePhone(digits));
  }
  return false;
}

/** The status counts shown above the register. */
export function summariseAdmissions(applications: AdmissionApplication[]) {
  return ADMISSION_STATUSES.reduce<Record<AdmissionStatus, number>>(
    (counts, status) => {
      counts[status] = applications.filter((entry) => entry.status === status).length;
      return counts;
    },
    { new: 0, contacted: 0, assessment: 0, offered: 0, enrolled: 0, declined: 0 }
  );
}

/**
 * Finds the application a parent is asking about: by reference alone, or by
 * the child's name together with the guardian's telephone number.
 */
export function findApplicationForParent(
  applications: AdmissionApplication[],
  input: { reference?: string; childName?: string; guardianPhone?: string }
): AdmissionApplication | null {
  const reference = String(input.reference || '').trim().toLowerCase();
  if (reference.length >= 4) {
    const byReference = applications.find((entry) =>
      entry.reference.toLowerCase().includes(reference)
    );
    if (byReference) return byReference;
  }

  const childName = String(input.childName || '').trim().toLowerCase();
  const phone = normalisePhone(String(input.guardianPhone || ''));
  if (childName.length >= 3 || phone.length >= 6) {
    return (
      applications.find((entry) => {
        const nameMatches = childName.length >= 3 && entry.childFullName.toLowerCase().includes(childName);
        const phoneMatches = phone.length >= 6 && normalisePhone(entry.guardianPhone).includes(phone);
        return nameMatches || phoneMatches;
      }) || null
    );
  }

  return null;
}
