import fs from 'fs';
import path from 'path';
import {
  AuditLogEntry,
  ClassFeeStructure,
  ContactInquiry,
  DailyFeedingLog,
  FeePaymentRecord,
  GalleryItem,
  HistoryMilestone,
  SchoolStateSnapshot,
  StaffProfile,
  StudentRecord,
  SubjectResult,
  TeacherRegistrationRequest,
  UserRole,
} from '@/types/school';
import { hashPassword } from './auth';
import { calculateGrade } from './grading';
import { INITIAL_GALLERY_ITEMS, SCHOOL_HISTORY_MILESTONES } from './constants';

export { INITIAL_GALLERY_ITEMS, SCHOOL_HISTORY_MILESTONES };

const STORE_FILE_PATH = '/tmp/st-teresa-aubyn-state-v2.json';

/**
 * Password hashes for the accounts the school office issues by hand.
 * Change these (Super Admin → Staff Directory) before going live.
 */
const ISSUED_CREDENTIALS: Record<string, string> = {
  'owner@stteresa-aubyn.edu.gh':
    'scrypt$e1b61c2645d4d5d87d35674c8353eddb$ab435b070eff555472cb6ba7798dbc40045665612be7a841fc3964486a9d5e4223e391f77bae6875ccb9c92c86ea76cf5827ba457cc92473648f93c3620595b5',
  'headmaster@stteresa-aubyn.edu.gh':
    'scrypt$c46924bf2d9afb8f44e6a94e27ba453c$ce9a8c5c74d2af1e5616b99c39a44609161cabf90fdaf9108da8a157c44fcfcfbf21bbd3754348471aba3790cdaa249024ed599aa2594e8700bb00b84f00bc42',
  'e.oseitutu@stteresa-aubyn.edu.gh':
    'scrypt$55505090f3c8def3a73c6d88539ddc6c$6e5484565d33ac719df964a07a4769011184357477e2944b3306e02d43d95ea41ea47a9a2cde09e3d3077a46fd8419036a4f79b99d6e2bf6708b3ae2bb0296c1',
};

/** First-run passwords for the remaining teachers created with the school. */
const NEW_TEACHER_PASSWORDS: Record<string, string> = {
  'p.mensahkorsah@stteresa-aubyn.edu.gh': 'Staff@2026',
  'a.owusuansah@stteresa-aubyn.edu.gh': 'Staff@2026',
  'i.dadzie@stteresa-aubyn.edu.gh': 'Staff@2026',
};

function buildInitialResults(): SubjectResult[] {
  const semester = '2026/2027 - First Semester';
  const rawEntries: Array<{
    studentId: string;
    studentName: string;
    className: string;
    subject: string;
    classScore: number;
    examScore: number;
    enteredBy: string;
  }> = [
    // stu-1: Kwame Boateng Mensah (JHS 3)
    { studentId: 'stu-1', studentName: 'Kwame Boateng Mensah', className: 'JHS 3', subject: 'Mathematics', classScore: 28, examScore: 64, enteredBy: 'Mr. Emmanuel Osei-Tutu' },
    { studentId: 'stu-1', studentName: 'Kwame Boateng Mensah', className: 'JHS 3', subject: 'English Language', classScore: 26, examScore: 61, enteredBy: 'Mrs. Priscilla Mensah-Korsah' },
    { studentId: 'stu-1', studentName: 'Kwame Boateng Mensah', className: 'JHS 3', subject: 'Integrated Science', classScore: 29, examScore: 65, enteredBy: 'Mr. Emmanuel Osei-Tutu' },
    { studentId: 'stu-1', studentName: 'Kwame Boateng Mensah', className: 'JHS 3', subject: 'Social Studies', classScore: 27, examScore: 60, enteredBy: 'Mrs. Priscilla Mensah-Korsah' },
    { studentId: 'stu-1', studentName: 'Kwame Boateng Mensah', className: 'JHS 3', subject: 'Computing & ICT', classScore: 29, examScore: 66, enteredBy: 'Mr. Emmanuel Osei-Tutu' },
    { studentId: 'stu-1', studentName: 'Kwame Boateng Mensah', className: 'JHS 3', subject: 'Religious & Moral Education', classScore: 28, examScore: 62, enteredBy: 'Mrs. Priscilla Mensah-Korsah' },
    { studentId: 'stu-1', studentName: 'Kwame Boateng Mensah', className: 'JHS 3', subject: 'Creative Arts & Design', classScore: 25, examScore: 58, enteredBy: 'Ms. Abigail Owusu-Ansah' },
    { studentId: 'stu-1', studentName: 'Kwame Boateng Mensah', className: 'JHS 3', subject: 'French & Ghanaian Language', classScore: 26, examScore: 59, enteredBy: 'Mrs. Priscilla Mensah-Korsah' },

    // stu-2: Abena Serwaa Aubyn (JHS 3)
    { studentId: 'stu-2', studentName: 'Abena Serwaa Aubyn', className: 'JHS 3', subject: 'Mathematics', classScore: 29, examScore: 67, enteredBy: 'Mr. Emmanuel Osei-Tutu' },
    { studentId: 'stu-2', studentName: 'Abena Serwaa Aubyn', className: 'JHS 3', subject: 'English Language', classScore: 29, examScore: 66, enteredBy: 'Mrs. Priscilla Mensah-Korsah' },
    { studentId: 'stu-2', studentName: 'Abena Serwaa Aubyn', className: 'JHS 3', subject: 'Integrated Science', classScore: 28, examScore: 64, enteredBy: 'Mr. Emmanuel Osei-Tutu' },
    { studentId: 'stu-2', studentName: 'Abena Serwaa Aubyn', className: 'JHS 3', subject: 'Social Studies', classScore: 28, examScore: 65, enteredBy: 'Mrs. Priscilla Mensah-Korsah' },
    { studentId: 'stu-2', studentName: 'Abena Serwaa Aubyn', className: 'JHS 3', subject: 'Computing & ICT', classScore: 30, examScore: 68, enteredBy: 'Mr. Emmanuel Osei-Tutu' },
    { studentId: 'stu-2', studentName: 'Abena Serwaa Aubyn', className: 'JHS 3', subject: 'Religious & Moral Education', classScore: 29, examScore: 66, enteredBy: 'Mrs. Priscilla Mensah-Korsah' },
    { studentId: 'stu-2', studentName: 'Abena Serwaa Aubyn', className: 'JHS 3', subject: 'Creative Arts & Design', classScore: 27, examScore: 62, enteredBy: 'Ms. Abigail Owusu-Ansah' },
    { studentId: 'stu-2', studentName: 'Abena Serwaa Aubyn', className: 'JHS 3', subject: 'French & Ghanaian Language', classScore: 28, examScore: 63, enteredBy: 'Mrs. Priscilla Mensah-Korsah' },

    // stu-3: Kofi Nkrumah Yankson (JHS 2)
    { studentId: 'stu-3', studentName: 'Kofi Nkrumah Yankson', className: 'JHS 2', subject: 'Mathematics', classScore: 25, examScore: 56, enteredBy: 'Mr. Emmanuel Osei-Tutu' },
    { studentId: 'stu-3', studentName: 'Kofi Nkrumah Yankson', className: 'JHS 2', subject: 'English Language', classScore: 24, examScore: 54, enteredBy: 'Mrs. Priscilla Mensah-Korsah' },
    { studentId: 'stu-3', studentName: 'Kofi Nkrumah Yankson', className: 'JHS 2', subject: 'Integrated Science', classScore: 27, examScore: 59, enteredBy: 'Mr. Emmanuel Osei-Tutu' },
    { studentId: 'stu-3', studentName: 'Kofi Nkrumah Yankson', className: 'JHS 2', subject: 'Social Studies', classScore: 26, examScore: 58, enteredBy: 'Mrs. Priscilla Mensah-Korsah' },
    { studentId: 'stu-3', studentName: 'Kofi Nkrumah Yankson', className: 'JHS 2', subject: 'Computing & ICT', classScore: 28, examScore: 63, enteredBy: 'Mr. Emmanuel Osei-Tutu' },
    { studentId: 'stu-3', studentName: 'Kofi Nkrumah Yankson', className: 'JHS 2', subject: 'Religious & Moral Education', classScore: 26, examScore: 60, enteredBy: 'Mrs. Priscilla Mensah-Korsah' },

    // stu-4: Esi Mansa Quansah (Basic 6)
    { studentId: 'stu-4', studentName: 'Esi Mansa Quansah', className: 'Basic 6', subject: 'Mathematics', classScore: 27, examScore: 61, enteredBy: 'Mrs. Priscilla Mensah-Korsah' },
    { studentId: 'stu-4', studentName: 'Esi Mansa Quansah', className: 'Basic 6', subject: 'English Language', classScore: 28, examScore: 64, enteredBy: 'Mrs. Priscilla Mensah-Korsah' },
    { studentId: 'stu-4', studentName: 'Esi Mansa Quansah', className: 'Basic 6', subject: 'Integrated Science', classScore: 26, examScore: 60, enteredBy: 'Mrs. Priscilla Mensah-Korsah' },
    { studentId: 'stu-4', studentName: 'Esi Mansa Quansah', className: 'Basic 6', subject: 'Social Studies', classScore: 27, examScore: 59, enteredBy: 'Mrs. Priscilla Mensah-Korsah' },
    { studentId: 'stu-4', studentName: 'Esi Mansa Quansah', className: 'Basic 6', subject: 'Computing & ICT', classScore: 29, examScore: 63, enteredBy: 'Mrs. Priscilla Mensah-Korsah' },
    { studentId: 'stu-4', studentName: 'Esi Mansa Quansah', className: 'Basic 6', subject: 'Creative Arts & Design', classScore: 28, examScore: 65, enteredBy: 'Ms. Abigail Owusu-Ansah' },

    // stu-5: Nana Yaw Asante (Basic 6)
    { studentId: 'stu-5', studentName: 'Nana Yaw Asante', className: 'Basic 6', subject: 'Mathematics', classScore: 24, examScore: 52, enteredBy: 'Mrs. Priscilla Mensah-Korsah' },
    { studentId: 'stu-5', studentName: 'Nana Yaw Asante', className: 'Basic 6', subject: 'English Language', classScore: 23, examScore: 50, enteredBy: 'Mrs. Priscilla Mensah-Korsah' },
    { studentId: 'stu-5', studentName: 'Nana Yaw Asante', className: 'Basic 6', subject: 'Integrated Science', classScore: 25, examScore: 55, enteredBy: 'Mrs. Priscilla Mensah-Korsah' },
    { studentId: 'stu-5', studentName: 'Nana Yaw Asante', className: 'Basic 6', subject: 'Computing & ICT', classScore: 27, examScore: 60, enteredBy: 'Mrs. Priscilla Mensah-Korsah' },

    // stu-6: Akosua Pokua Boadu (Basic 4)
    { studentId: 'stu-6', studentName: 'Akosua Pokua Boadu', className: 'Basic 4', subject: 'Mathematics', classScore: 26, examScore: 62, enteredBy: 'Ms. Abigail Owusu-Ansah' },
    { studentId: 'stu-6', studentName: 'Akosua Pokua Boadu', className: 'Basic 4', subject: 'English Language', classScore: 28, examScore: 63, enteredBy: 'Ms. Abigail Owusu-Ansah' },
    { studentId: 'stu-6', studentName: 'Akosua Pokua Boadu', className: 'Basic 4', subject: 'Integrated Science', classScore: 27, examScore: 61, enteredBy: 'Ms. Abigail Owusu-Ansah' },
    { studentId: 'stu-6', studentName: 'Akosua Pokua Boadu', className: 'Basic 4', subject: 'Creative Arts & Design', classScore: 29, examScore: 66, enteredBy: 'Ms. Abigail Owusu-Ansah' },

    // stu-7: Fiifi Baiden-Amissah (Basic 2)
    { studentId: 'stu-7', studentName: 'Fiifi Baiden-Amissah', className: 'Basic 2', subject: 'Mathematics', classScore: 28, examScore: 61, enteredBy: 'Ms. Abigail Owusu-Ansah' },
    { studentId: 'stu-7', studentName: 'Fiifi Baiden-Amissah', className: 'Basic 2', subject: 'English Language', classScore: 27, examScore: 60, enteredBy: 'Ms. Abigail Owusu-Ansah' },
    { studentId: 'stu-7', studentName: 'Fiifi Baiden-Amissah', className: 'Basic 2', subject: 'Creative Arts & Design', classScore: 29, examScore: 65, enteredBy: 'Ms. Abigail Owusu-Ansah' },

    // stu-8: Adwoa Nyamekye Appiah (KG 2)
    { studentId: 'stu-8', studentName: 'Adwoa Nyamekye Appiah', className: 'KG 2', subject: 'English Language', classScore: 29, examScore: 64, enteredBy: 'Ms. Abigail Owusu-Ansah' },
    { studentId: 'stu-8', studentName: 'Adwoa Nyamekye Appiah', className: 'KG 2', subject: 'Mathematics', classScore: 28, examScore: 63, enteredBy: 'Ms. Abigail Owusu-Ansah' },
    { studentId: 'stu-8', studentName: 'Adwoa Nyamekye Appiah', className: 'KG 2', subject: 'Creative Arts & Design', classScore: 30, examScore: 67, enteredBy: 'Ms. Abigail Owusu-Ansah' },
  ];

  return rawEntries.map((entry, idx) => {
    const g = calculateGrade(entry.classScore, entry.examScore);
    return {
      id: `res-${idx + 1}`,
      studentId: entry.studentId,
      studentName: entry.studentName,
      className: entry.className,
      semester,
      subject: entry.subject,
      classScore: entry.classScore,
      examScore: entry.examScore,
      totalScore: g.totalScore,
      grade: g.grade,
      remark: g.remark,
      enteredBy: entry.enteredBy,
      updatedAt: '2026-10-02T09:15:00Z',
    };
  });
}

function createDefaultState(): SchoolStateSnapshot {
  const staff: StaffProfile[] = [
    {
      id: 'stf-owner',
      staffId: 'STA-OWN-001',
      fullName: 'Dr. Lady Victoria Aubyn-Donkor',
      email: 'owner@stteresa-aubyn.edu.gh',
      phone: '+233 24 410 0888',
      role: 'super_admin',
      qualification: 'Ph.D. Educational Leadership & Policy',
      subjects: ['Executive Governance', 'Institutional Quality Assurance'],
      isActive: true,
      joinedDate: '1988-10-02',
      passwordHash: ISSUED_CREDENTIALS['owner@stteresa-aubyn.edu.gh'],
    },
    {
      id: 'stf-hm',
      staffId: 'STA-HM-002',
      fullName: 'Rev. Fr. Bernard Kweku Arthur, M.Ed.',
      email: 'headmaster@stteresa-aubyn.edu.gh',
      phone: '+233 24 855 1920',
      role: 'headmaster',
      qualification: 'M.Ed. Educational Administration (UCC)',
      subjects: ['School Administration', 'Religious & Moral Education'],
      isActive: true,
      joinedDate: '2014-09-01',
      passwordHash: ISSUED_CREDENTIALS['headmaster@stteresa-aubyn.edu.gh'],
    },
    {
      id: 'stf-t1',
      staffId: 'STA-TCH-101',
      fullName: 'Mr. Emmanuel Osei-Tutu',
      email: 'e.oseitutu@stteresa-aubyn.edu.gh',
      phone: '+233 54 321 9087',
      role: 'teacher',
      assignedClass: 'JHS 3',
      qualification: 'B.Ed. Mathematics & Science (UEW)',
      subjects: ['Mathematics', 'Integrated Science', 'Computing & ICT'],
      isActive: true,
      joinedDate: '2019-09-10',
      passwordHash: ISSUED_CREDENTIALS['e.oseitutu@stteresa-aubyn.edu.gh'],
    },
    {
      id: 'stf-t2',
      staffId: 'STA-TCH-102',
      fullName: 'Mrs. Priscilla Mensah-Korsah',
      email: 'p.mensahkorsah@stteresa-aubyn.edu.gh',
      phone: '+233 20 914 3321',
      role: 'teacher',
      assignedClass: 'Basic 6',
      qualification: 'B.Ed. Upper Primary & English Studies (UCC)',
      subjects: ['English Language', 'Social Studies', 'Religious & Moral Education', 'French & Ghanaian Language'],
      isActive: true,
      joinedDate: '2020-01-15',
      passwordHash: hashPassword(NEW_TEACHER_PASSWORDS['p.mensahkorsah@stteresa-aubyn.edu.gh']),
    },
    {
      id: 'stf-t3',
      staffId: 'STA-TCH-103',
      fullName: 'Ms. Abigail Owusu-Ansah',
      email: 'a.owusuansah@stteresa-aubyn.edu.gh',
      phone: '+233 55 709 4412',
      role: 'teacher',
      assignedClass: 'Basic 4',
      qualification: 'B.Ed. Early Grade & Lower Primary (UCC)',
      subjects: ['Creative Arts & Design', 'English Language', 'Mathematics'],
      isActive: true,
      joinedDate: '2022-09-05',
      passwordHash: hashPassword(NEW_TEACHER_PASSWORDS['a.owusuansah@stteresa-aubyn.edu.gh']),
    },
    {
      id: 'stf-t4',
      staffId: 'STA-TCH-104',
      fullName: 'Mr. Isaac Kwesi Dadzie',
      email: 'i.dadzie@stteresa-aubyn.edu.gh',
      phone: '+233 27 899 5401',
      role: 'teacher',
      assignedClass: 'JHS 2',
      qualification: 'B.A. French & Francophone Studies (UG)',
      subjects: ['French & Ghanaian Language', 'Social Studies'],
      isActive: true,
      joinedDate: '2026-10-01',
      passwordHash: hashPassword(NEW_TEACHER_PASSWORDS['i.dadzie@stteresa-aubyn.edu.gh']),
    },
  ];

  const teacherRegistrations: TeacherRegistrationRequest[] = [
    {
      id: 'reg-1',
      fullName: 'Mr. Daniel Kobby Enninful',
      email: 'd.enninful@gmail.com',
      phone: '+233 24 678 1123',
      qualification: 'B.Sc. Computer Science & PGDE (KNUST)',
      requestedClass: 'JHS 1',
      subjects: ['Computing & ICT', 'Mathematics'],
      experienceYears: 4,
      statement:
        'Passionate about practical coding, robotics, and BECE mathematics preparation. Ready to mentor JHS 1 and JHS 2 learners.',
      status: 'pending',
      createdAt: '2026-10-01T14:20:00Z',
    },
    {
      id: 'reg-2',
      fullName: 'Mad. Cecilia Aba Forson',
      email: 'cecilia.forson@yahoo.com',
      phone: '+233 50 412 8890',
      qualification: 'B.Ed. Early Childhood Care & Development (UEW)',
      requestedClass: 'KG 2',
      subjects: ['English Language', 'Creative Arts & Design', 'Mathematics'],
      experienceYears: 6,
      statement:
        'Experienced Montessori and phonics specialist dedicated to nurturing confident readers in Early Childhood.',
      status: 'pending',
      createdAt: '2026-10-02T08:05:00Z',
    },
    {
      id: 'reg-3',
      fullName: 'Mr. Isaac Kwesi Dadzie',
      email: 'i.dadzie@stteresa-aubyn.edu.gh',
      phone: '+233 27 899 5401',
      qualification: 'B.A. French & Francophone Studies (UG)',
      requestedClass: 'JHS 2',
      subjects: ['French & Ghanaian Language', 'Social Studies'],
      experienceYears: 5,
      statement:
        'Bilingual educator committed to oral and written French proficiency across Upper Primary and Junior High.',
      status: 'approved',
      reviewedBy: 'Rev. Fr. Bernard Kweku Arthur, M.Ed.',
      reviewedAt: '2026-09-25T11:30:00Z',
      assignedStaffId: 'STA-TCH-104',
      createdAt: '2026-09-22T09:00:00Z',
    },
  ];

  const classFeeStructures: ClassFeeStructure[] = [
    {
      id: 'cfs-kg1',
      className: 'KG 1',
      department: 'Early Childhood',
      semester: '2026/2027 - First Semester',
      tuitionFee: 1150,
      extraClassesFee: 180,
      dailyMealFee: 15,
      semesterMealFee: 975,
      ictAndBooksFee: 220,
      classTeacher: 'Ms. Abigail Owusu-Ansah',
      updatedBy: 'Rev. Fr. Bernard Kweku Arthur, M.Ed.',
      updatedAt: '2026-09-15T10:00:00Z',
    },
    {
      id: 'cfs-kg2',
      className: 'KG 2',
      department: 'Early Childhood',
      semester: '2026/2027 - First Semester',
      tuitionFee: 1200,
      extraClassesFee: 200,
      dailyMealFee: 15,
      semesterMealFee: 975,
      ictAndBooksFee: 240,
      classTeacher: 'Ms. Abigail Owusu-Ansah',
      updatedBy: 'Rev. Fr. Bernard Kweku Arthur, M.Ed.',
      updatedAt: '2026-09-15T10:00:00Z',
    },
    {
      id: 'cfs-b1',
      className: 'Basic 1',
      department: 'Lower Primary',
      semester: '2026/2027 - First Semester',
      tuitionFee: 1350,
      extraClassesFee: 250,
      dailyMealFee: 18,
      semesterMealFee: 1170,
      ictAndBooksFee: 280,
      classTeacher: 'Ms. Abigail Owusu-Ansah',
      updatedBy: 'Rev. Fr. Bernard Kweku Arthur, M.Ed.',
      updatedAt: '2026-09-15T10:00:00Z',
    },
    {
      id: 'cfs-b2',
      className: 'Basic 2',
      department: 'Lower Primary',
      semester: '2026/2027 - First Semester',
      tuitionFee: 1380,
      extraClassesFee: 250,
      dailyMealFee: 18,
      semesterMealFee: 1170,
      ictAndBooksFee: 280,
      classTeacher: 'Ms. Abigail Owusu-Ansah',
      updatedBy: 'Rev. Fr. Bernard Kweku Arthur, M.Ed.',
      updatedAt: '2026-09-15T10:00:00Z',
    },
    {
      id: 'cfs-b3',
      className: 'Basic 3',
      department: 'Lower Primary',
      semester: '2026/2027 - First Semester',
      tuitionFee: 1420,
      extraClassesFee: 260,
      dailyMealFee: 18,
      semesterMealFee: 1170,
      ictAndBooksFee: 300,
      classTeacher: 'Ms. Abigail Owusu-Ansah',
      updatedBy: 'Rev. Fr. Bernard Kweku Arthur, M.Ed.',
      updatedAt: '2026-09-15T10:00:00Z',
    },
    {
      id: 'cfs-b4',
      className: 'Basic 4',
      department: 'Upper Primary',
      semester: '2026/2027 - First Semester',
      tuitionFee: 1550,
      extraClassesFee: 320,
      dailyMealFee: 20,
      semesterMealFee: 1300,
      ictAndBooksFee: 350,
      classTeacher: 'Ms. Abigail Owusu-Ansah',
      updatedBy: 'Rev. Fr. Bernard Kweku Arthur, M.Ed.',
      updatedAt: '2026-09-15T10:00:00Z',
    },
    {
      id: 'cfs-b5',
      className: 'Basic 5',
      department: 'Upper Primary',
      semester: '2026/2027 - First Semester',
      tuitionFee: 1600,
      extraClassesFee: 340,
      dailyMealFee: 20,
      semesterMealFee: 1300,
      ictAndBooksFee: 360,
      classTeacher: 'Mrs. Priscilla Mensah-Korsah',
      updatedBy: 'Rev. Fr. Bernard Kweku Arthur, M.Ed.',
      updatedAt: '2026-09-15T10:00:00Z',
    },
    {
      id: 'cfs-b6',
      className: 'Basic 6',
      department: 'Upper Primary',
      semester: '2026/2027 - First Semester',
      tuitionFee: 1680,
      extraClassesFee: 380,
      dailyMealFee: 20,
      semesterMealFee: 1300,
      ictAndBooksFee: 390,
      classTeacher: 'Mrs. Priscilla Mensah-Korsah',
      updatedBy: 'Rev. Fr. Bernard Kweku Arthur, M.Ed.',
      updatedAt: '2026-09-15T10:00:00Z',
    },
    {
      id: 'cfs-jhs1',
      className: 'JHS 1',
      department: 'Junior High',
      semester: '2026/2027 - First Semester',
      tuitionFee: 1850,
      extraClassesFee: 450,
      dailyMealFee: 25,
      semesterMealFee: 1625,
      ictAndBooksFee: 450,
      classTeacher: 'Mr. Emmanuel Osei-Tutu',
      updatedBy: 'Rev. Fr. Bernard Kweku Arthur, M.Ed.',
      updatedAt: '2026-09-15T10:00:00Z',
    },
    {
      id: 'cfs-jhs2',
      className: 'JHS 2',
      department: 'Junior High',
      semester: '2026/2027 - First Semester',
      tuitionFee: 1920,
      extraClassesFee: 480,
      dailyMealFee: 25,
      semesterMealFee: 1625,
      ictAndBooksFee: 470,
      classTeacher: 'Mr. Isaac Kwesi Dadzie',
      updatedBy: 'Rev. Fr. Bernard Kweku Arthur, M.Ed.',
      updatedAt: '2026-09-15T10:00:00Z',
    },
    {
      id: 'cfs-jhs3',
      className: 'JHS 3',
      department: 'Junior High',
      semester: '2026/2027 - First Semester',
      tuitionFee: 2100,
      extraClassesFee: 600,
      dailyMealFee: 25,
      semesterMealFee: 1625,
      ictAndBooksFee: 550,
      classTeacher: 'Mr. Emmanuel Osei-Tutu',
      updatedBy: 'Rev. Fr. Bernard Kweku Arthur, M.Ed.',
      updatedAt: '2026-09-15T10:00:00Z',
    },
  ];

  const students: StudentRecord[] = [
    {
      id: 'stu-1',
      studentCode: 'STA/2024/001',
      fullName: 'Kwame Boateng Mensah',
      gender: 'Male',
      dateOfBirth: '2012-03-14',
      className: 'JHS 3',
      guardianName: 'Ing. Samuel Boateng Mensah',
      guardianPhone: '+233 24 419 8201',
      tuitionPaid: 2100,
      extraClassesPaid: 600,
      mealFeePaid: 850,
      attendancePresent: 64,
      attendanceTotal: 65,
      conduct: 'Exemplary Leadership & Discipline',
      interestTalent: 'Robotics, Mathematics Olympiad & Debate',
      teacherRemark: 'An outstanding scholar and Senior Boys Prefect. Consistently demonstrates analytical maturity.',
      headmasterRemark: 'Distinguished academic performance. Keep the banner of St. Teresa flying high in the BECE.',
      reportEndorsed: true,
    },
    {
      id: 'stu-2',
      studentCode: 'STA/2024/002',
      fullName: 'Abena Serwaa Aubyn',
      gender: 'Female',
      dateOfBirth: '2012-07-22',
      className: 'JHS 3',
      guardianName: 'Mrs. Comfort Aubyn-Hammond',
      guardianPhone: '+233 20 811 4500',
      tuitionPaid: 2100,
      extraClassesPaid: 600,
      mealFeePaid: 1625,
      attendancePresent: 65,
      attendanceTotal: 65,
      conduct: 'Highly Respectful & Industrious',
      interestTalent: 'Scientific Research, Public Speaking & Choir',
      teacherRemark: 'Overall best student in JHS 3. Displays remarkable precision across STEM and languages.',
      headmasterRemark: 'Exceptional all-round excellence! A true ambassador of the founder’s academic legacy.',
      reportEndorsed: true,
    },
    {
      id: 'stu-3',
      studentCode: 'STA/2025/014',
      fullName: 'Kofi Nkrumah Yankson',
      gender: 'Male',
      dateOfBirth: '2013-05-09',
      className: 'JHS 2',
      guardianName: 'Mr. Joseph K. Yankson',
      guardianPhone: '+233 54 602 3389',
      tuitionPaid: 1500,
      extraClassesPaid: 480,
      mealFeePaid: 650,
      attendancePresent: 61,
      attendanceTotal: 65,
      conduct: 'Polite & Cooperative',
      interestTalent: 'Coding Club & Track Athletics',
      teacherRemark: 'Strong aptitude in Computing and Science; encouraged to read more literature to boost English scores.',
      headmasterRemark: 'Good progress this semester. Regular attendance at afternoon Extra Classes is yielding results.',
      reportEndorsed: true,
    },
    {
      id: 'stu-4',
      studentCode: 'STA/2025/028',
      fullName: 'Esi Mansa Quansah',
      gender: 'Female',
      dateOfBirth: '2014-11-03',
      className: 'Basic 6',
      guardianName: 'Dr. Grace Quansah-Biney',
      guardianPhone: '+233 24 900 7712',
      tuitionPaid: 1680,
      extraClassesPaid: 380,
      mealFeePaid: 900,
      attendancePresent: 63,
      attendanceTotal: 65,
      conduct: 'Courteous & Attentive',
      interestTalent: 'Creative Writing, Spelling Bee & Violin',
      teacherRemark: 'Esi participates enthusiastically in class discussions and leads her reading group admirably.',
      headmasterRemark: 'Very impressive terminal report. Keep up the dedication as you prepare for Junior High.',
      reportEndorsed: true,
    },
    {
      id: 'stu-5',
      studentCode: 'STA/2025/031',
      fullName: 'Nana Yaw Asante',
      gender: 'Male',
      dateOfBirth: '2014-08-18',
      className: 'Basic 6',
      guardianName: 'Chief Kwabena Asante',
      guardianPhone: '+233 27 445 1098',
      tuitionPaid: 1200,
      extraClassesPaid: 200,
      mealFeePaid: 540,
      attendancePresent: 59,
      attendanceTotal: 65,
      conduct: 'Energetic & Friendly',
      interestTalent: 'Football Captain & Cultural Drumming',
      teacherRemark: 'Has strong potential in ICT and Science; needs closer focus on written English exercises.',
      headmasterRemark: 'Creditable effort. Parents are encouraged to clear the remaining tuition balance before next term.',
      reportEndorsed: true,
    },
    {
      id: 'stu-6',
      studentCode: 'STA/2026/045',
      fullName: 'Akosua Pokua Boadu',
      gender: 'Female',
      dateOfBirth: '2016-02-11',
      className: 'Basic 4',
      guardianName: 'Mr. & Mrs. Kingsley Boadu',
      guardianPhone: '+233 55 230 9841',
      tuitionPaid: 1550,
      extraClassesPaid: 320,
      mealFeePaid: 800,
      attendancePresent: 64,
      attendanceTotal: 65,
      conduct: 'Neat, Cheerful & Diligent',
      interestTalent: 'Visual Arts, Poetry Recitation & Chess',
      teacherRemark: 'Akosua produces neat work and helps her classmates during group mathematics activities.',
      headmasterRemark: 'An inspiring young learner with sterling character and strong academic habits.',
      reportEndorsed: true,
    },
    {
      id: 'stu-7',
      studentCode: 'STA/2026/062',
      fullName: 'Fiifi Baiden-Amissah',
      gender: 'Male',
      dateOfBirth: '2018-06-29',
      className: 'Basic 2',
      guardianName: 'Mrs. Theodora Baiden-Amissah',
      guardianPhone: '+233 24 318 6543',
      tuitionPaid: 1380,
      extraClassesPaid: 250,
      mealFeePaid: 720,
      attendancePresent: 62,
      attendanceTotal: 65,
      conduct: 'Inquisitive & Well-Behaved',
      interestTalent: 'Mental Arithmetic & Drawing',
      teacherRemark: 'Reads fluently above grade level and shows keen excitement during numeracy lessons.',
      headmasterRemark: 'Well done, Fiifi! Continue shining brightly.',
      reportEndorsed: true,
    },
    {
      id: 'stu-8',
      studentCode: 'STA/2026/088',
      fullName: 'Adwoa Nyamekye Appiah',
      gender: 'Female',
      dateOfBirth: '2020-09-12',
      className: 'KG 2',
      guardianName: 'Mr. Francis K. Appiah',
      guardianPhone: '+233 20 667 1234',
      tuitionPaid: 1200,
      extraClassesPaid: 200,
      mealFeePaid: 975,
      attendancePresent: 65,
      attendanceTotal: 65,
      conduct: 'Joyful & Expressive',
      interestTalent: 'Phonics Rhymes, Storytelling & Painting',
      teacherRemark: 'Adwoa has mastered all KG 2 phonics blends and number bonds ahead of schedule.',
      headmasterRemark: 'Delightful progress! Ready for transition to Lower Primary with distinction.',
      reportEndorsed: true,
    },
  ];

  const feePayments: FeePaymentRecord[] = [
    {
      id: 'pay-1',
      receiptNo: 'STA-RCP-2026-901',
      studentId: 'stu-1',
      studentName: 'Kwame Boateng Mensah',
      className: 'JHS 3',
      category: 'tuition',
      amount: 2100,
      paymentMethod: 'Bank Deposit',
      paymentDate: '2026-09-12',
      recordedBy: 'Rev. Fr. Bernard Kweku Arthur, M.Ed.',
      notes: 'Full First Semester Tuition & Class Fee settled.',
    },
    {
      id: 'pay-2',
      receiptNo: 'STA-RCP-2026-902',
      studentId: 'stu-1',
      studentName: 'Kwame Boateng Mensah',
      className: 'JHS 3',
      category: 'extra_classes',
      amount: 600,
      paymentMethod: 'Mobile Money',
      paymentDate: '2026-09-14',
      recordedBy: 'Rev. Fr. Bernard Kweku Arthur, M.Ed.',
      notes: 'JHS 3 BECE Intensive Afternoon Extra Classes Fee.',
    },
    {
      id: 'pay-3',
      receiptNo: 'STA-RCP-2026-903',
      studentId: 'stu-2',
      studentName: 'Abena Serwaa Aubyn',
      className: 'JHS 3',
      category: 'tuition',
      amount: 2100,
      paymentMethod: 'Bank Deposit',
      paymentDate: '2026-09-10',
      recordedBy: 'Rev. Fr. Bernard Kweku Arthur, M.Ed.',
      notes: 'Full First Semester Tuition Fee.',
    },
    {
      id: 'pay-4',
      receiptNo: 'STA-RCP-2026-904',
      studentId: 'stu-2',
      studentName: 'Abena Serwaa Aubyn',
      className: 'JHS 3',
      category: 'meal_fee',
      amount: 1625,
      paymentMethod: 'Bank Deposit',
      paymentDate: '2026-09-10',
      recordedBy: 'Rev. Fr. Bernard Kweku Arthur, M.Ed.',
      notes: 'Full Semester Prepaid Meal Plan.',
    },
    {
      id: 'pay-5',
      receiptNo: 'STA-RCP-2026-905',
      studentId: 'stu-4',
      studentName: 'Esi Mansa Quansah',
      className: 'Basic 6',
      category: 'extra_classes',
      amount: 380,
      paymentMethod: 'Mobile Money',
      paymentDate: '2026-09-18',
      recordedBy: 'Rev. Fr. Bernard Kweku Arthur, M.Ed.',
      notes: 'Upper Primary Afternoon Extra Classes Fee.',
    },
    {
      id: 'pay-6',
      receiptNo: 'STA-RCP-2026-906',
      studentId: 'stu-6',
      studentName: 'Akosua Pokua Boadu',
      className: 'Basic 4',
      category: 'tuition',
      amount: 1550,
      paymentMethod: 'Mobile Money',
      paymentDate: '2026-09-20',
      recordedBy: 'Rev. Fr. Bernard Kweku Arthur, M.Ed.',
      notes: 'Full Basic 4 Tuition settled.',
    },
  ];

  const dailyFeedingLogs: DailyFeedingLog[] = [
    {
      id: 'feed-1',
      studentId: 'stu-1',
      studentName: 'Kwame Boateng Mensah',
      className: 'JHS 3',
      collectionDate: '2026-10-02',
      amount: 25,
      status: 'paid',
      paymentMethod: 'Cash',
      loggedByTeacher: 'Mr. Emmanuel Osei-Tutu',
      notes: 'Morning roll-call feeding collection',
      createdAt: '2026-10-02T07:45:00Z',
    },
    {
      id: 'feed-2',
      studentId: 'stu-2',
      studentName: 'Abena Serwaa Aubyn',
      className: 'JHS 3',
      collectionDate: '2026-10-02',
      amount: 25,
      status: 'paid',
      paymentMethod: 'Prepaid Meal Card',
      loggedByTeacher: 'Mr. Emmanuel Osei-Tutu',
      notes: 'Deducted from semester meal card',
      createdAt: '2026-10-02T07:46:00Z',
    },
    {
      id: 'feed-3',
      studentId: 'stu-3',
      studentName: 'Kofi Nkrumah Yankson',
      className: 'JHS 2',
      collectionDate: '2026-10-02',
      amount: 25,
      status: 'paid',
      paymentMethod: 'Cash',
      loggedByTeacher: 'Mr. Emmanuel Osei-Tutu',
      notes: 'Paid cash in class',
      createdAt: '2026-10-02T07:50:00Z',
    },
    {
      id: 'feed-4',
      studentId: 'stu-4',
      studentName: 'Esi Mansa Quansah',
      className: 'Basic 6',
      collectionDate: '2026-10-02',
      amount: 20,
      status: 'paid',
      paymentMethod: 'Cash',
      loggedByTeacher: 'Mrs. Priscilla Mensah-Korsah',
      notes: 'Daily hot lunch token issued',
      createdAt: '2026-10-02T08:00:00Z',
    },
    {
      id: 'feed-5',
      studentId: 'stu-5',
      studentName: 'Nana Yaw Asante',
      className: 'Basic 6',
      collectionDate: '2026-10-02',
      amount: 20,
      status: 'paid',
      paymentMethod: 'Mobile Money',
      loggedByTeacher: 'Mrs. Priscilla Mensah-Korsah',
      notes: 'Parent paid via MoMo to class teacher',
      createdAt: '2026-10-02T08:02:00Z',
    },
    {
      id: 'feed-6',
      studentId: 'stu-6',
      studentName: 'Akosua Pokua Boadu',
      className: 'Basic 4',
      collectionDate: '2026-10-02',
      amount: 20,
      status: 'paid',
      paymentMethod: 'Cash',
      loggedByTeacher: 'Ms. Abigail Owusu-Ansah',
      notes: 'Collected during morning assembly',
      createdAt: '2026-10-02T08:10:00Z',
    },
    {
      id: 'feed-7',
      studentId: 'stu-7',
      studentName: 'Fiifi Baiden-Amissah',
      className: 'Basic 2',
      collectionDate: '2026-10-02',
      amount: 18,
      status: 'paid',
      paymentMethod: 'Cash',
      loggedByTeacher: 'Ms. Abigail Owusu-Ansah',
      notes: 'Paid in class',
      createdAt: '2026-10-02T08:12:00Z',
    },
    {
      id: 'feed-8',
      studentId: 'stu-8',
      studentName: 'Adwoa Nyamekye Appiah',
      className: 'KG 2',
      collectionDate: '2026-10-02',
      amount: 15,
      status: 'paid',
      paymentMethod: 'Prepaid Meal Card',
      loggedByTeacher: 'Ms. Abigail Owusu-Ansah',
      notes: 'Prepaid semester meal plan active',
      createdAt: '2026-10-02T08:14:00Z',
    },
    {
      id: 'feed-9',
      studentId: 'stu-1',
      studentName: 'Kwame Boateng Mensah',
      className: 'JHS 3',
      collectionDate: '2026-10-01',
      amount: 25,
      status: 'paid',
      paymentMethod: 'Cash',
      loggedByTeacher: 'Mr. Emmanuel Osei-Tutu',
      notes: 'Paid on time',
      createdAt: '2026-10-01T07:45:00Z',
    },
    {
      id: 'feed-10',
      studentId: 'stu-4',
      studentName: 'Esi Mansa Quansah',
      className: 'Basic 6',
      collectionDate: '2026-10-01',
      amount: 20,
      status: 'paid',
      paymentMethod: 'Cash',
      loggedByTeacher: 'Mrs. Priscilla Mensah-Korsah',
      notes: 'Paid on time',
      createdAt: '2026-10-01T08:00:00Z',
    },
  ];

  const contactInquiries: ContactInquiry[] = [
    {
      id: 'inq-1',
      fullName: 'Mrs. Matilda Ofori-Atta',
      email: 'matilda.ofori@gmail.com',
      phone: '+233 24 772 9104',
      subject: 'Admissions Inquiry for Basic 3 & JHS 1',
      childClass: 'Basic 3',
      message:
        'Good day. My family is relocating next month and we would love to tour St. Teresa Aubyn Memorial School and learn about your entrance assessment and feeding program.',
      status: 'unread',
      createdAt: '2026-10-01T16:40:00Z',
    },
    {
      id: 'inq-2',
      fullName: 'Engr. Patrick Koomson',
      email: 'p.koomson@alumni-teresa.org',
      phone: '+233 50 118 3390',
      subject: '1999 Alumni Year Group STEM Book Donation',
      childClass: 'JHS 3',
      message:
        'On behalf of the 1999 Old Students Association, we wish to donate 40 illustrated Integrated Science textbooks and 5 robotics starter kits during Founder’s Week.',
      status: 'reviewed',
      createdAt: '2026-09-29T11:15:00Z',
    },
  ];

  const auditLogs: AuditLogEntry[] = [
    {
      id: 'aud-1',
      actorName: 'Mr. Emmanuel Osei-Tutu',
      actorRole: 'teacher',
      action: 'Logged Daily Feeding Fee',
      category: 'feeding',
      details: 'Recorded GH₵ 25.00 feeding fee for Kwame Boateng Mensah (JHS 3) on 2026-10-02.',
      createdAt: '2026-10-02T07:45:00Z',
    },
    {
      id: 'aud-2',
      actorName: 'Mrs. Priscilla Mensah-Korsah',
      actorRole: 'teacher',
      action: 'Entered Continuous Assessment & Exam Score',
      category: 'results',
      details: 'Updated English Language grade (92% - A1) for Esi Mansa Quansah (Basic 6).',
      createdAt: '2026-10-02T08:30:00Z',
    },
    {
      id: 'aud-3',
      actorName: 'Rev. Fr. Bernard Kweku Arthur, M.Ed.',
      actorRole: 'headmaster',
      action: 'Approved Teacher Registration',
      category: 'teachers',
      details: 'Approved registration request for Mr. Isaac Kwesi Dadzie (Assigned ID: STA-TCH-104, Class: JHS 2).',
      createdAt: '2026-09-25T11:30:00Z',
    },
    {
      id: 'aud-4',
      actorName: 'Rev. Fr. Bernard Kweku Arthur, M.Ed.',
      actorRole: 'headmaster',
      action: 'Updated Class Fee Schedule',
      category: 'fees',
      details: 'Confirmed JHS 3 Tuition (GH₵ 2,100), Extra Classes (GH₵ 600), and Daily Meal Fee (GH₵ 25/day).',
      createdAt: '2026-09-15T10:00:00Z',
    },
    {
      id: 'aud-5',
      actorName: 'Dr. Lady Victoria Aubyn-Donkor',
      actorRole: 'super_admin',
      action: 'End-of-Semester Report Audit',
      category: 'reports',
      details: 'Verified 2026/2027 First Semester grading rubric and financial clearance templates.',
      createdAt: '2026-09-10T09:00:00Z',
    },
  ];

  return {
    currentSemester: '2026/2027 - First Semester',
    nextSemesterReopening: 'January 12, 2027',
    staff,
    teacherRegistrations,
    classFeeStructures,
    students,
    feePayments,
    dailyFeedingLogs,
    academicResults: buildInitialResults(),
    contactInquiries,
    auditLogs,
    gallery: INITIAL_GALLERY_ITEMS,
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
    } else if (NEW_TEACHER_PASSWORDS[email]) {
      member.passwordHash = hashPassword(NEW_TEACHER_PASSWORDS[email]);
    }
  }

  for (const registration of state.teacherRegistrations) {
    if (registration.status === 'pending' && !registration.passwordHash) {
      // Applications submitted before sign-in was introduced: the office issues
      // a fresh password when the request is approved.
      registration.passwordHash = undefined;
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
        memoryState = ensureStaffCredentials(parsed);
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

/** Strips anything that must never reach the browser (password hashes). */
export function toClientState(state: SchoolStateSnapshot): SchoolStateSnapshot {
  return {
    ...state,
    staff: state.staff.map(({ passwordHash, ...rest }) => rest),
    teacherRegistrations: state.teacherRegistrations.map(({ passwordHash, ...rest }) => rest),
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
