export interface GradeAssessment {
  totalScore: number;
  grade: string;
  remark: string;
  badgeColor: string;
}

export function calculateGrade(classScore: number, examScore: number): GradeAssessment {
  const safeClass = Math.min(30, Math.max(0, Number(classScore) || 0));
  const safeExam = Math.min(70, Math.max(0, Number(examScore) || 0));
  const totalScore = Math.round((safeClass + safeExam) * 10) / 10;

  if (totalScore >= 80) {
    return {
      totalScore,
      grade: 'A1',
      remark: 'Excellent (Distinction)',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    };
  }
  if (totalScore >= 75) {
    return {
      totalScore,
      grade: 'B2',
      remark: 'Very Good',
      badgeColor: 'bg-teal-100 text-teal-900 border-teal-300',
    };
  }
  if (totalScore >= 70) {
    return {
      totalScore,
      grade: 'B3',
      remark: 'Good',
      badgeColor: 'bg-green-100 text-green-900 border-green-300',
    };
  }
  if (totalScore >= 65) {
    return {
      totalScore,
      grade: 'C4',
      remark: 'Credit',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    };
  }
  if (totalScore >= 60) {
    return {
      totalScore,
      grade: 'C5',
      remark: 'Credit',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    };
  }
  if (totalScore >= 55) {
    return {
      totalScore,
      grade: 'C6',
      remark: 'Credit',
      badgeColor: 'bg-yellow-100 text-yellow-900 border-yellow-300',
    };
  }
  if (totalScore >= 50) {
    return {
      totalScore,
      grade: 'D7',
      remark: 'Pass',
      badgeColor: 'bg-orange-100 text-orange-900 border-orange-300',
    };
  }
  if (totalScore >= 45) {
    return {
      totalScore,
      grade: 'E8',
      remark: 'Weak Pass',
      badgeColor: 'bg-orange-100 text-orange-900 border-orange-300',
    };
  }
  return {
    totalScore,
    grade: 'F9',
    remark: 'Needs Improvement',
    badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
  };
}

export function formatCurrency(amount: number, currencySymbol = 'GH₵'): string {
  const num = Number(amount) || 0;
  return `${currencySymbol} ${num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export const SCHOOL_SUBJECTS = [
  'Mathematics',
  'English Language',
  'Integrated Science',
  'Social Studies',
  'Computing & ICT',
  'Religious & Moral Education',
  'Creative Arts & Design',
  'French & Ghanaian Language',
] as const;

export const SCHOOL_CLASSES = [
  'KG 1',
  'KG 2',
  'Basic 1',
  'Basic 2',
  'Basic 3',
  'Basic 4',
  'Basic 5',
  'Basic 6',
  'JHS 1',
  'JHS 2',
  'JHS 3',
] as const;
