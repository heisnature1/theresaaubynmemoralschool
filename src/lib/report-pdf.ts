import {
  ClassFeeStructure,
  DailyFeedingLog,
  SchoolStateSnapshot,
  StudentRecord,
  SubjectResult,
} from '@/types/school';
import { calculateGrade, formatOrdinal } from './grading';
import { PdfDocument, Rgb } from './pdf';

const GREEN: Rgb = [0.035, 0.224, 0.165];
const GOLD: Rgb = [0.851, 0.686, 0.216];
const INK: Rgb = [0.12, 0.15, 0.18];
const MUTED: Rgb = [0.42, 0.45, 0.5];
const BORDER: Rgb = [0.78, 0.8, 0.82];
const STRIPE: Rgb = [0.968, 0.968, 0.955];

const PAGE_MARGIN = 46;
const CONTENT_WIDTH = 595.28 - PAGE_MARGIN * 2;
const BOTTOM_LIMIT = 780;

export const SCHOOL_PDF_DETAILS = {
  name: 'ST. TERESA AUBYN MEMORIAL SCHOOL',
  motto: 'Per Ardua Ad Astra — Through Diligence to the Stars',
  addressLine: 'No. 18 Teresa Aubyn Heritage Avenue, P.O. Box TA 188, Ghana',
  contactLine: 'Tel: +233 24 410 0888 / +233 24 855 1920  •  info@stteresa-aubyn.edu.gh',
};

/** The cedi sign is outside the standard font encoding, so PDFs use GH¢. */
export function pdfCurrency(amount: number): string {
  return `GH¢ ${(Number(amount) || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

interface ReportContext {
  semester: string;
  classTeacher: string;
  classSize: number;
  position: number;
  averageScore: number;
  totalObtained: number;
  results: SubjectResult[];
  feeStructure?: ClassFeeStructure;
  feedingLogs: DailyFeedingLog[];
}

/** "Mr. Emmanuel Osei-Tutu" -> "E. Osei-Tutu" so the table column stays tidy. */
function shortTeacherName(name: string): string {
  const cleaned = name.replace(/^(Mr\.|Mrs\.|Ms\.|Mad\.|Rev\. Fr\.|Dr\.|Ing\.)\s*/, '').trim();
  const parts = cleaned.split(/\s+/);
  if (parts.length < 2) return cleaned;
  const surname = parts[parts.length - 1];
  const initials = parts
    .slice(0, -1)
    .map((part) => `${part[0].toUpperCase()}.`)
    .join(' ');
  return `${initials} ${surname}`;
}

function collectContext(state: SchoolStateSnapshot, student: StudentRecord): ReportContext {
  const results = state.academicResults.filter((r) => r.studentId === student.id);
  const classmates = state.students.filter((s) => s.className === student.className);

  const ranked = classmates
    .map((mate) => {
      const mateResults = state.academicResults.filter((r) => r.studentId === mate.id);
      const average =
        mateResults.length > 0
          ? mateResults.reduce((sum, r) => sum + r.totalScore, 0) / mateResults.length
          : 0;
      return { id: mate.id, average };
    })
    .sort((a, b) => b.average - a.average);

  const rankIndex = ranked.findIndex((entry) => entry.id === student.id);
  const totalObtained = results.reduce((sum, r) => sum + r.totalScore, 0);
  const averageScore =
    results.length > 0 ? Math.round((totalObtained / results.length) * 10) / 10 : 0;

  const feeStructure = state.classFeeStructures.find((c) => c.className === student.className);

  return {
    semester: state.currentSemester,
    classTeacher: feeStructure?.classTeacher || 'Class Teacher',
    classSize: classmates.length || 1,
    position: rankIndex >= 0 ? rankIndex + 1 : classmates.length,
    averageScore,
    totalObtained: Math.round(totalObtained * 10) / 10,
    results,
    feeStructure,
    feedingLogs: state.dailyFeedingLogs.filter(
      (log) => log.studentId === student.id && log.status === 'paid'
    ),
  };
}

function drawPageFurniture(doc: PdfDocument, title: string): number {
  let y = PAGE_MARGIN;

  doc.text(SCHOOL_PDF_DETAILS.name, PAGE_MARGIN + CONTENT_WIDTH / 2, y, {
    font: 'Times-Bold',
    size: 17,
    color: GREEN,
    align: 'center',
  });
  y += 22;
  doc.text(SCHOOL_PDF_DETAILS.motto, PAGE_MARGIN + CONTENT_WIDTH / 2, y, {
    font: 'Times-Italic',
    size: 9,
    color: MUTED,
    align: 'center',
  });
  y += 14;
  doc.text(SCHOOL_PDF_DETAILS.addressLine, PAGE_MARGIN + CONTENT_WIDTH / 2, y, {
    size: 8,
    color: MUTED,
    align: 'center',
  });
  y += 11;
  doc.text(SCHOOL_PDF_DETAILS.contactLine, PAGE_MARGIN + CONTENT_WIDTH / 2, y, {
    size: 8,
    color: MUTED,
    align: 'center',
  });
  y += 12;

  doc.rect(PAGE_MARGIN, y, CONTENT_WIDTH, 2.4, { fill: GOLD });
  doc.rect(PAGE_MARGIN, y + 2.4, CONTENT_WIDTH, 1, { fill: GREEN });
  y += 20;

  doc.text(title, PAGE_MARGIN + CONTENT_WIDTH / 2, y, {
    font: 'Times-Bold',
    size: 13,
    color: INK,
    align: 'center',
    characterSpacing: 0.6,
  });
  return y + 24;
}

function drawStudentDetails(doc: PdfDocument, student: StudentRecord, context: ReportContext, y: number): number {
  const rowHeight = 19;
  const colWidth = CONTENT_WIDTH / 2;
  const rows: Array<[string, string, string, string]> = [
    ['Student Name', student.fullName, 'Student ID', student.studentCode],
    ['Class', student.className, 'Class Teacher', context.classTeacher],
    ['Gender', student.gender, 'Date of Birth', student.dateOfBirth],
    ['Guardian', student.guardianName, 'Guardian Contact', student.guardianPhone],
    [
      'Attendance',
      `${student.attendancePresent} of ${student.attendanceTotal} days`,
      'Conduct',
      student.conduct,
    ],
    [
      'Position in Class',
      `${formatOrdinal(context.position)} of ${context.classSize}`,
      'Semester',
      context.semester,
    ],
  ];

  const boxHeight = rows.length * rowHeight + 8;
  doc.rect(PAGE_MARGIN, y, CONTENT_WIDTH, boxHeight, { fill: [0.984, 0.98, 0.965], stroke: BORDER });
  doc.line(PAGE_MARGIN + colWidth, y, PAGE_MARGIN + colWidth, y + boxHeight, { color: BORDER });

  rows.forEach((row, index) => {
    const rowY = y + 4 + index * rowHeight;
    doc.text(row[0].toUpperCase(), PAGE_MARGIN + 10, rowY + 2.5, {
      font: 'Helvetica-Bold',
      size: 6.6,
      color: MUTED,
      characterSpacing: 0.4,
    });
    doc.text(row[1], PAGE_MARGIN + 10, rowY + 9.5, { font: 'Helvetica-Bold', size: 9, color: INK });

    doc.text(row[2].toUpperCase(), PAGE_MARGIN + colWidth + 10, rowY + 2.5, {
      font: 'Helvetica-Bold',
      size: 6.6,
      color: MUTED,
      characterSpacing: 0.4,
    });
    doc.text(row[3], PAGE_MARGIN + colWidth + 10, rowY + 9.5, {
      font: 'Helvetica',
      size: 9,
      color: INK,
    });
  });

  return y + boxHeight + 20;
}

function drawResultsTable(doc: PdfDocument, context: ReportContext, y: number): number {
  const columns: Array<{
    label: string;
    width: number;
    align: 'left' | 'center' | 'right';
    size?: number;
  }> = [
    { label: 'Subject', width: 126, align: 'left' },
    { label: 'Class (30)', width: 48, align: 'center' },
    { label: 'Exam (70)', width: 48, align: 'center' },
    { label: 'Total (100)', width: 54, align: 'center' },
    { label: 'Grade', width: 38, align: 'center' },
    { label: 'Remarks', width: 100, align: 'left', size: 7.6 },
    { label: 'Teacher', width: 89.28, align: 'left' },
  ];

  const headerHeight = 20;
  doc.rect(PAGE_MARGIN, y, CONTENT_WIDTH, headerHeight, { fill: GREEN });
  let x = PAGE_MARGIN;
  columns.forEach((column) => {
    const textX =
      column.align === 'center' ? x + column.width / 2 : column.align === 'right' ? x + column.width - 6 : x + 6;
    doc.text(column.label, textX, y + 6, {
      font: 'Helvetica-Bold',
      size: 7.6,
      color: [1, 1, 1],
      align: column.align,
    });
    x += column.width;
  });
  y += headerHeight;

  const rowHeight = 19;
  context.results.forEach((result, index) => {
    if (index % 2 === 1) {
      doc.rect(PAGE_MARGIN, y, CONTENT_WIDTH, rowHeight, { fill: STRIPE });
    }
    let cellX = PAGE_MARGIN;
    const cells: Array<[string, (typeof columns)[number]]> = [
      [result.subject, columns[0]],
      [String(result.classScore), columns[1]],
      [String(result.examScore), columns[2]],
      [String(result.totalScore), columns[3]],
      [result.grade, columns[4]],
      [result.remark, columns[5]],
      [shortTeacherName(result.enteredBy), columns[6]],
    ];

    cells.forEach(([value, column]) => {
      const textX =
        column.align === 'center'
          ? cellX + column.width / 2
          : column.align === 'right'
          ? cellX + column.width - 6
          : cellX + 6;
      doc.text(value, textX, y + 5.5, {
        font: column.label === 'Subject' ? 'Helvetica-Bold' : 'Helvetica',
        size: column.size ?? 8,
        color: INK,
        align: column.align,
        maxWidth: column.width - 10,
        lineHeight: 9,
      });
      cellX += column.width;
    });

    doc.line(PAGE_MARGIN, y + rowHeight, PAGE_MARGIN + CONTENT_WIDTH, y + rowHeight, {
      color: BORDER,
    });
    y += rowHeight;
  });

  if (context.results.length === 0) {
    doc.rect(PAGE_MARGIN, y, CONTENT_WIDTH, 30, { fill: STRIPE });
    doc.text('No subject records were entered for this pupil this semester.', PAGE_MARGIN + CONTENT_WIDTH / 2, y + 10, {
      size: 8.5,
      color: MUTED,
      align: 'center',
    });
    y += 30;
  }

  doc.rect(PAGE_MARGIN, y, CONTENT_WIDTH, 0.8, { fill: BORDER });
  y += 16;

  // Summary strip
  const summary = [
    ['Total Marks', `${context.totalObtained}`],
    ['Average', `${context.averageScore}%`],
    ['Overall Grade', calculateGrade(context.averageScore * 0.3, context.averageScore * 0.7).grade],
    ['Position', `${formatOrdinal(context.position)} / ${context.classSize}`],
  ];
  const cardWidth = (CONTENT_WIDTH - 12 * 3) / 4;
  summary.forEach(([label, value], index) => {
    const cardX = PAGE_MARGIN + index * (cardWidth + 12);
    doc.rect(cardX, y, cardWidth, 42, { fill: [0.984, 0.98, 0.965], stroke: BORDER });
    doc.text(label.toUpperCase(), cardX + 8, y + 8, {
      font: 'Helvetica-Bold',
      size: 6.6,
      color: MUTED,
      characterSpacing: 0.4,
    });
    doc.text(value, cardX + 8, y + 19, { font: 'Times-Bold', size: 14, color: GREEN });
  });

  return y + 42 + 18;
}

function drawRemarks(doc: PdfDocument, student: StudentRecord, y: number): number {
  const blocks: Array<[string, string]> = [
    ["Class Teacher's Remarks", student.teacherRemark],
    ["Headmaster's Remarks", student.headmasterRemark],
  ];

  blocks.forEach(([title, body]) => {
    const lines = doc.wrapText(body, CONTENT_WIDTH - 24, 'Times-Italic', 9.5);
    const height = 30 + lines.length * 13;
    doc.rect(PAGE_MARGIN, y, CONTENT_WIDTH, height, { stroke: BORDER });
    doc.rect(PAGE_MARGIN, y, 3, height, { fill: GOLD });
    doc.text(title.toUpperCase(), PAGE_MARGIN + 12, y + 8, {
      font: 'Helvetica-Bold',
      size: 7,
      color: MUTED,
      characterSpacing: 0.4,
    });
    doc.text(body, PAGE_MARGIN + 12, y + 20, {
      font: 'Times-Italic',
      size: 9.5,
      color: INK,
      maxWidth: CONTENT_WIDTH - 24,
      lineHeight: 13,
    });
    y += height + 12;
  });

  const signatureY = y + 6;
  doc.line(PAGE_MARGIN + 8, signatureY, PAGE_MARGIN + 190, signatureY, { color: MUTED, lineWidth: 0.6 });
  doc.line(PAGE_MARGIN + CONTENT_WIDTH - 190, signatureY, PAGE_MARGIN + CONTENT_WIDTH - 8, signatureY, {
    color: MUTED,
    lineWidth: 0.6,
  });
  doc.text('Class Teacher', PAGE_MARGIN + 8, signatureY + 4, { size: 7.5, color: MUTED });
  doc.text('Headmaster / School Stamp', PAGE_MARGIN + CONTENT_WIDTH - 190, signatureY + 4, {
    size: 7.5,
    color: MUTED,
  });

  return signatureY + 22;
}

function drawFeeClearance(doc: PdfDocument, student: StudentRecord, context: ReportContext, y: number): number {
  const tuition = context.feeStructure?.tuitionFee ?? 0;
  const extra = context.feeStructure?.extraClassesFee ?? 0;
  const mealPlan = context.feeStructure?.semesterMealFee ?? 0;
  const feedingTaken = context.feedingLogs.reduce((sum, log) => sum + log.amount, 0);

  const rows: Array<[string, number, number]> = [
    ['Class tuition fee', tuition, student.tuitionPaid],
    ['Afternoon extra classes', extra, student.extraClassesPaid],
    ['Semester meal plan / feeding', mealPlan, student.mealFeePaid + feedingTaken],
  ];

  const headerY = y;
  doc.rect(PAGE_MARGIN, headerY, CONTENT_WIDTH, 18, { fill: [0.93, 0.95, 0.94] });
  doc.text('FEE CLEARANCE', PAGE_MARGIN + 8, headerY + 5, {
    font: 'Helvetica-Bold',
    size: 7.4,
    color: GREEN,
    characterSpacing: 0.4,
  });
  doc.text('Billed', PAGE_MARGIN + CONTENT_WIDTH - 200, headerY + 5, {
    font: 'Helvetica-Bold',
    size: 7.4,
    color: MUTED,
    align: 'right',
  });
  doc.text('Paid', PAGE_MARGIN + CONTENT_WIDTH - 110, headerY + 5, {
    font: 'Helvetica-Bold',
    size: 7.4,
    color: MUTED,
    align: 'right',
  });
  doc.text('Balance', PAGE_MARGIN + CONTENT_WIDTH - 10, headerY + 5, {
    font: 'Helvetica-Bold',
    size: 7.4,
    color: MUTED,
    align: 'right',
  });
  y = headerY + 18;

  let outstanding = 0;
  rows.forEach(([label, billed, paid]) => {
    const balance = Math.max(0, billed - paid);
    outstanding += balance;
    doc.text(label, PAGE_MARGIN + 8, y + 4, { size: 8.5, color: INK });
    doc.text(pdfCurrency(billed), PAGE_MARGIN + CONTENT_WIDTH - 200, y + 4, {
      size: 8.5,
      color: INK,
      align: 'right',
    });
    doc.text(pdfCurrency(paid), PAGE_MARGIN + CONTENT_WIDTH - 110, y + 4, {
      size: 8.5,
      color: INK,
      align: 'right',
    });
    doc.text(pdfCurrency(balance), PAGE_MARGIN + CONTENT_WIDTH - 10, y + 4, {
      size: 8.5,
      color: balance > 0 ? [0.7, 0.16, 0.2] : INK,
      align: 'right',
    });
    y += 15;
    doc.line(PAGE_MARGIN, y - 2, PAGE_MARGIN + CONTENT_WIDTH, y - 2, { color: BORDER, lineWidth: 0.4 });
  });

  const note =
    outstanding > 0
      ? `Outstanding balance of ${pdfCurrency(outstanding)} should be settled at the Bursary before the next semester begins.`
      : 'All fees for the semester have been settled in full. Thank you.';
  doc.text(note, PAGE_MARGIN, y + 2, {
    font: 'Times-Italic',
    size: 8.5,
    color: outstanding > 0 ? [0.7, 0.16, 0.2] : MUTED,
    maxWidth: CONTENT_WIDTH,
    lineHeight: 11,
  });

  return y + 26;
}

function drawGradingKey(doc: PdfDocument, y: number): number {
  const key =
    'Grading key:  A1 80–100 Excellent  •  B2 75–79 Very Good  •  B3 70–74 Good  •  C4 65–69 Credit  •  ' +
    'C5 60–64 Credit  •  C6 55–59 Credit  •  D7 50–54 Pass  •  E8 45–49 Weak Pass  •  F9 below 45 Needs Improvement';
  doc.text(key, PAGE_MARGIN, y, {
    size: 7,
    color: MUTED,
    maxWidth: CONTENT_WIDTH,
    lineHeight: 9.5,
  });
  return y + 22;
}

function drawFooter(doc: PdfDocument, student: StudentRecord, pageLabel: string): void {
  const y = 800;
  doc.line(PAGE_MARGIN, y, PAGE_MARGIN + CONTENT_WIDTH, y, { color: BORDER, lineWidth: 0.5 });
  doc.text(
    `${student.fullName}  •  ${student.studentCode}  •  Issued ${new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })}`,
    PAGE_MARGIN,
    y + 6,
    { size: 7, color: MUTED }
  );
  doc.text(pageLabel, PAGE_MARGIN + CONTENT_WIDTH, y + 6, {
    size: 7,
    color: MUTED,
    align: 'right',
  });
}

function drawReportPage(
  doc: PdfDocument,
  state: SchoolStateSnapshot,
  student: StudentRecord,
  context: ReportContext,
  title: string,
  isFirstPage: boolean
): void {
  let y = isFirstPage ? drawPageFurniture(doc, title) : PAGE_MARGIN + 10;

  if (!isFirstPage) {
    doc.text(`${student.fullName} (continued)`, PAGE_MARGIN, y, {
      font: 'Times-Bold',
      size: 11,
      color: GREEN,
    });
    y += 20;
  }

  drawFooter(doc, student, `Page ${doc.pageCount}`);

  const ensureSpace = (needed: number) => {
    if (y + needed <= BOTTOM_LIMIT) return;
    doc.addPage();
    y = PAGE_MARGIN + 10;
    doc.text(`${student.fullName} — report card (continued)`, PAGE_MARGIN, y, {
      font: 'Times-Bold',
      size: 11,
      color: GREEN,
    });
    y += 22;
  };

  y = drawStudentDetails(doc, student, context, y);

  const tableHeight = 20 + Math.max(1, context.results.length) * 19 + 16 + 42 + 18;
  ensureSpace(tableHeight);
  y = drawResultsTable(doc, context, y);

  const remarksHeight =
    [student.teacherRemark, student.headmasterRemark].reduce(
      (total, body) => total + 30 + doc.wrapText(body, CONTENT_WIDTH - 24, 'Times-Italic', 9.5).length * 13 + 12,
      0
    ) + 22;
  ensureSpace(remarksHeight + 12);
  y = drawRemarks(doc, student, y);

  ensureSpace(105);
  y = drawFeeClearance(doc, student, context, y);
  drawGradingKey(doc, y);
}

export interface ReportPdfOptions {
  student: StudentRecord;
  /** Optional marks to print instead of the records held for the pupil. */
  results?: SubjectResult[];
  /** 'terminal' (default) or 'mid-term' */
  reportType?: 'terminal' | 'mid-term';
}

/** Builds the printable report card for one pupil. */
export function buildStudentReportPdf(
  state: SchoolStateSnapshot,
  options: ReportPdfOptions
): Uint8Array {
  const student = options.student;
  const context = collectContext(state, student);

  if (options.results) {
    context.results = options.results;
    const total = options.results.reduce((sum, result) => sum + result.totalScore, 0);
    context.totalObtained = Math.round(total * 10) / 10;
    context.averageScore =
      options.results.length > 0 ? Math.round((total / options.results.length) * 10) / 10 : 0;
  }

  const doc = new PdfDocument();
  drawReportPage(
    doc,
    state,
    student,
    context,
    options.reportType === 'mid-term' ? 'MID-TERM PROGRESS REPORT' : 'END OF SEMESTER REPORT CARD',
    true
  );
  return doc.build();
}

/** One PDF containing every pupil in a class, each starting on a fresh page. */
export function buildClassReportPdf(state: SchoolStateSnapshot, className: string): Uint8Array {
  const students = state.students.filter((student) => student.className === className);
  const doc = new PdfDocument();

  students.forEach((student, index) => {
    if (index > 0) doc.addPage();
    const context = collectContext(state, student);
    drawReportPage(doc, state, student, context, 'END OF SEMESTER REPORT CARD', true);
  });

  if (students.length === 0) {
    drawPageFurniture(doc, 'END OF SEMESTER REPORT CARD');
    doc.text(`No pupils are currently registered in ${className}.`, PAGE_MARGIN, 160, {
      size: 10,
      color: MUTED,
    });
  }

  return doc.build();
}
