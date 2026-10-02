export type UserRole = 'super_admin' | 'headmaster' | 'teacher';

export type RegistrationStatus = 'pending' | 'approved' | 'rejected';

export type FeeCategory = 'tuition' | 'extra_classes' | 'meal_fee';

export type FeedingStatus = 'paid' | 'exempt' | 'unpaid';

export interface StaffProfile {
  id: string;
  staffId: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  assignedClass?: string;
  subjects: string[];
  qualification: string;
  isActive: boolean;
  joinedDate: string;
  /** Passport photograph captured at registration, stored as a data URL */
  photo?: string;
  /** scrypt hash, never exposed to the browser */
  passwordHash?: string;
  /**
   * The matching Supabase Auth user, when the school has connected a Supabase
   * project. Sign-in is then handled by Supabase Auth; the scrypt hash stays
   * as the fallback for a deployment that runs without the database.
   */
  authUserId?: string;
  lastLoginAt?: string;
}

export type AdmissionStatus =
  | 'new'
  | 'contacted'
  | 'assessment'
  | 'offered'
  | 'enrolled'
  | 'declined';

/** An application for a place, from the website or entered at the office. */
export interface AdmissionApplication {
  id: string;
  /** Human reference quoted by parents, e.g. ADM/2026/0142 */
  reference: string;
  childFullName: string;
  childDateOfBirth?: string;
  gender?: 'Male' | 'Female';
  classApplied: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail?: string;
  previousSchool?: string;
  notes?: string;
  status: AdmissionStatus;
  /** Staff member who last moved the application along. */
  reviewedBy?: string;
  reviewedAt?: string;
  /** Set when the applicant is enrolled and becomes a pupil. */
  studentId?: string;
  studentCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherRegistrationRequest {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  qualification: string;
  requestedClass: string;
  subjects: string[];
  experienceYears: number;
  statement: string;
  /** Passport photograph captured with the application, stored as a data URL */
  passportPhoto?: string;
  status: RegistrationStatus;
  /** scrypt hash captured at application time, never exposed to the browser */
  passwordHash?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  assignedStaffId?: string;
  createdAt: string;
}

export interface ClassFeeStructure {
  id: string;
  className: string;
  department: 'Early Childhood' | 'Lower Primary' | 'Upper Primary' | 'Junior High';
  semester: string;
  tuitionFee: number;
  extraClassesFee: number;
  dailyMealFee: number;
  semesterMealFee: number;
  ictAndBooksFee: number;
  classTeacher: string;
  updatedBy: string;
  updatedAt: string;
}

export interface StudentRecord {
  id: string;
  studentCode: string;
  fullName: string;
  gender: 'Male' | 'Female';
  dateOfBirth: string;
  className: string;
  guardianName: string;
  guardianPhone: string;
  /** Used to send receipts and term reports when the office keeps one. */
  guardianEmail?: string;
  /** Passport photograph taken when the pupil was enrolled, stored as a data URL */
  photo?: string;
  /**
   * Optional parent access PIN issued by the office and hashed at rest. A
   * parent signs in with the pupil's code and this PIN, or with the guardian
   * telephone number already on the pupil's record.
   */
  accessPinHash?: string;
  accessPinIssuedAt?: string;
  tuitionPaid: number;
  extraClassesPaid: number;
  mealFeePaid: number;
  attendancePresent: number;
  attendanceTotal: number;
  conduct: string;
  interestTalent: string;
  teacherRemark: string;
  headmasterRemark: string;
  reportEndorsed: boolean;
}

export interface FeePaymentRecord {
  id: string;
  receiptNo: string;
  studentId: string;
  studentName: string;
  className: string;
  category: FeeCategory;
  amount: number;
  paymentMethod: 'Cash' | 'Mobile Money' | 'Bank Deposit' | 'Cheque';
  paymentDate: string;
  recordedBy: string;
  notes?: string;
}

export interface DailyFeedingLog {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  collectionDate: string; // YYYY-MM-DD
  amount: number;
  status: FeedingStatus;
  paymentMethod: 'Cash' | 'Mobile Money' | 'Prepaid Meal Card';
  loggedByTeacher: string;
  notes?: string;
  createdAt: string;
}

export interface SubjectResult {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  semester: string;
  subject: string;
  classScore: number; // max 30
  examScore: number;  // max 70
  totalScore: number; // max 100
  grade: string;      // A1, B2, B3, C4, C5, C6, D7, E8, F9
  remark: string;     // Excellent, Very Good, Good, Credit, Pass, Needs Improvement
  enteredBy: string;
  updatedAt: string;
}

export interface ContactInquiry {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  childClass?: string;
  message: string;
  status: 'unread' | 'reviewed' | 'responded';
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  category:
    | 'fees'
    | 'feeding'
    | 'results'
    | 'teachers'
    | 'reports'
    | 'admissions'
    | 'website'
    | 'parents'
    | 'system';
  details: string;
  createdAt: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Campus & Heritage' | 'STEM & Academics' | 'Sports & Culture' | 'Student Life & Dining';
  imageUrl: string;
  caption: string;
  dateLabel: string;
  featured?: boolean;
}

export interface HistoryMilestone {
  year: string;
  eraTitle: string;
  headline: string;
  description: string;
  highlightMetric: string;
  iconName: string;
}

/* -------------------------------------------------------------------------- */
/*  Website content, served from the database                                  */
/* -------------------------------------------------------------------------- */

/** A notice for parents as it appears on the website. */
export interface SiteNotice {
  id: string;
  date: string;
  title: string;
  body: string;
  tag: 'Term' | 'Examinations' | 'Feeding' | 'Event' | 'Notice';
}

/**
 * The single row of `school_information`. Every field is optional: the website
 * shows only what the school has actually published.
 */
export interface SchoolInformation {
  schoolName: string | null;
  motto: string | null;
  aboutSummary: string | null;
  digitalAddress: string | null;
  foundedYear: number | null;
  highlights: string[];
  tourHours: string | null;
  officeHours: string | null;
  mainPhone: string | null;
  headmasterPhone: string | null;
  bursaryPhone: string | null;
  generalEmail: string | null;
  headmasterEmail: string | null;
  ownerEmail: string | null;
  postalAddress: string | null;
  headmasterName: string | null;
  headmasterTitle: string | null;
  headmasterMessage: string | null;
  currentSemester: string | null;
  nextReopening: string | null;
}

/** A member of staff as shown in the public directory: no personal contacts. */
export interface PublicStaffMember {
  fullName: string;
  role: UserRole;
  assignedClass: string | null;
  subjects: string[];
  qualification: string | null;
}

/** A department as published for the academics page. */
export interface SiteDepartment {
  id: string;
  name: string;
  classes: string;
  subjects: string[];
  note: string;
}

/** One of the school's stated values. */
export interface SiteValue {
  id: string;
  title: string;
  body: string;
}

/** One step of the published admissions procedure. */
export interface SiteAdmissionStep {
  id: string;
  step: string;
  title: string;
  body: string;
}

/** A calendar entry shown on the home, academics and footer areas. */
export interface SiteTermDate {
  id: string;
  label: string;
  detail: string;
}

export interface SchoolStateSnapshot {
  currentSemester: string;
  nextSemesterReopening: string;
  staff: StaffProfile[];
  teacherRegistrations: TeacherRegistrationRequest[];
  admissionApplications: AdmissionApplication[];
  classFeeStructures: ClassFeeStructure[];
  students: StudentRecord[];
  feePayments: FeePaymentRecord[];
  dailyFeedingLogs: DailyFeedingLog[];
  academicResults: SubjectResult[];
  contactInquiries: ContactInquiry[];
  auditLogs: AuditLogEntry[];
  gallery: GalleryItem[];
}

/* -------------------------------------------------------------------------- */
/*  Admissions                                                                 */
/* -------------------------------------------------------------------------- */

export const ADMISSION_STATUSES: AdmissionStatus[] = [
  'new',
  'contacted',
  'assessment',
  'offered',
  'enrolled',
  'declined',
];

export const ADMISSION_STATUS_LABELS: Record<AdmissionStatus, string> = {
  new: 'New application',
  contacted: 'Family contacted',
  assessment: 'Assessment arranged',
  offered: 'Place offered',
  enrolled: 'Enrolled',
  declined: 'Not proceeding',
};

/** The order an application normally moves through, used for the timeline. */
export const ADMISSION_STATUS_FLOW: AdmissionStatus[] = [
  'new',
  'contacted',
  'assessment',
  'offered',
  'enrolled',
];
