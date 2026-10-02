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
  /** scrypt hash, never exposed to the browser */
  passwordHash?: string;
  lastLoginAt?: string;
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
  category: 'fees' | 'feeding' | 'results' | 'teachers' | 'reports' | 'system';
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

export interface SchoolStateSnapshot {
  currentSemester: string;
  nextSemesterReopening: string;
  staff: StaffProfile[];
  teacherRegistrations: TeacherRegistrationRequest[];
  classFeeStructures: ClassFeeStructure[];
  students: StudentRecord[];
  feePayments: FeePaymentRecord[];
  dailyFeedingLogs: DailyFeedingLog[];
  academicResults: SubjectResult[];
  contactInquiries: ContactInquiry[];
  auditLogs: AuditLogEntry[];
  gallery: GalleryItem[];
}
