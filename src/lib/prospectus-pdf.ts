import { SchoolStateSnapshot } from '@/types/school';
import { PdfDocument, Rgb } from './pdf';
import { SCHOOL_PDF_DETAILS, pdfCurrency } from './report-pdf';
import { ADMISSION_STEPS, OFFICE_CONTACTS, TERM_DATES } from './constants';

const GREEN: Rgb = [0.035, 0.224, 0.165];
const GOLD: Rgb = [0.851, 0.686, 0.216];
const INK: Rgb = [0.12, 0.15, 0.18];
const MUTED: Rgb = [0.42, 0.45, 0.5];
const BORDER: Rgb = [0.78, 0.8, 0.82];

const MARGIN = 46;
const WIDTH = 595.28 - MARGIN * 2;

/** Keeps the teacher column to a single line: "Mrs. Priscilla Mensah-Korsah" -> "P. Mensah-Korsah". */
function shortTeacherName(name: string): string {
  const cleaned = name.replace(/^(Mr\.|Mrs\.|Ms\.|Mad\.|Rev\. Fr\.|Dr\.)\s*/, '').trim();
  const parts = cleaned.split(/\s+/);
  if (parts.length < 2) return cleaned;
  return `${parts
    .slice(0, -1)
    .map((part) => `${part[0].toUpperCase()}.`)
    .join(' ')} ${parts[parts.length - 1]}`;
}

function heading(doc: PdfDocument, text: string, y: number): number {
  doc.text(text, MARGIN, y, { font: 'Times-Bold', size: 15, color: GREEN });
  doc.rect(MARGIN, y + 19, 60, 2, { fill: GOLD });
  return y + 34;
}

/** A short prospectus for parents, produced on the office computer. */
export function buildProspectusPdf(state: SchoolStateSnapshot): Uint8Array {
  const doc = new PdfDocument();
  let y = MARGIN;

  doc.text(SCHOOL_PDF_DETAILS.name, MARGIN + WIDTH / 2, y, {
    font: 'Times-Bold',
    size: 18,
    color: GREEN,
    align: 'center',
  });
  y += 22;
  doc.text(SCHOOL_PDF_DETAILS.motto, MARGIN + WIDTH / 2, y, {
    font: 'Times-Italic',
    size: 9.5,
    color: MUTED,
    align: 'center',
  });
  y += 14;
  doc.text(SCHOOL_PDF_DETAILS.addressLine, MARGIN + WIDTH / 2, y, {
    size: 8.5,
    color: MUTED,
    align: 'center',
  });
  y += 11;
  doc.text(SCHOOL_PDF_DETAILS.contactLine, MARGIN + WIDTH / 2, y, {
    size: 8.5,
    color: MUTED,
    align: 'center',
  });
  y += 14;
  doc.rect(MARGIN, y, WIDTH, 2.4, { fill: GOLD });
  y += 24;

  y = heading(doc, 'Prospectus and admissions information', y);

  doc.text(
    `St. Teresa Aubyn Memorial School is a day school for boys and girls from KG 1 to JHS 3, ` +
      `founded in 1988 in memory of Madam Teresa Aubyn. There are eleven classes on one compound, ` +
      `a library of over twelve thousand books, a science and computing laboratory, and a kitchen ` +
      `that prepares a hot midday meal for every pupil.\n\n` +
      `Academic year ${state.currentSemester}. The school is registered with the Ghana Education ` +
      `Service and presents candidates for the Basic Education Certificate Examination each year.`,
    MARGIN,
    y,
    { size: 9.5, color: INK, maxWidth: WIDTH, lineHeight: 13.5 }
  );
  y += 96;

  y = heading(doc, 'Admission procedure', y);
  ADMISSION_STEPS.forEach((step) => {
    doc.text(step.step, MARGIN, y, { font: 'Helvetica-Bold', size: 10, color: GOLD });
    doc.text(step.title, MARGIN + 26, y, { font: 'Helvetica-Bold', size: 10, color: INK });
    const next = doc.textBlock(step.body, MARGIN + 26, y + 14, {
      size: 9,
      color: MUTED,
      maxWidth: WIDTH - 26,
      lineHeight: 12,
    });
    y = next + 10;
  });

  y = heading(doc, 'Documents to bring', y);
  doc.text(
    '• The pupil\'s birth certificate and a recent passport photograph\n' +
      '• The immunisation record card\n' +
      '• The last school report from the previous school, where applicable\n' +
      '• A completed application form, available from the school office',
    MARGIN,
    y,
    { size: 9.5, color: INK, maxWidth: WIDTH, lineHeight: 13.5 }
  );
  y += 70;

  y = heading(doc, 'School calendar', y);
  TERM_DATES.forEach((entry) => {
    doc.text(entry.label, MARGIN, y, { size: 9.5, color: INK });
    doc.text(entry.detail, MARGIN + WIDTH, y, { size: 9.5, color: MUTED, align: 'right' });
    y += 15;
    doc.line(MARGIN, y - 3, MARGIN + WIDTH, y - 3, { color: BORDER, lineWidth: 0.4 });
  });

  /* ----------------------------- second page ----------------------------- */
  doc.addPage();
  y = MARGIN;

  y = heading(doc, `Fee schedule — ${state.currentSemester}`, y);

  const columns = [76, 60, 70, 64, 84, 70, 79.28];
  const headers = ['Class', 'Tuition', 'Extra classes', 'Daily meal', 'Semester meal', 'ICT & books', 'Class teacher'];

  doc.rect(MARGIN, y, WIDTH, 18, { fill: GREEN });
  let x = MARGIN;
  headers.forEach((header, index) => {
    doc.text(header, x + 4, y + 5.5, { font: 'Helvetica-Bold', size: 7.4, color: [1, 1, 1] });
    x += columns[index];
  });
  y += 18;

  state.classFeeStructures.forEach((row, index) => {
    if (index % 2 === 1) {
      doc.rect(MARGIN, y, WIDTH, 16, { fill: [0.968, 0.968, 0.955] });
    }
    const values = [
      row.className,
      pdfCurrency(row.tuitionFee),
      pdfCurrency(row.extraClassesFee),
      pdfCurrency(row.dailyMealFee),
      pdfCurrency(row.semesterMealFee),
      pdfCurrency(row.ictAndBooksFee),
      shortTeacherName(row.classTeacher),
    ];
    let cellX = MARGIN;
    values.forEach((value, cellIndex) => {
      doc.text(value, cellX + 4, y + 4.5, {
        size: 7.6,
        color: INK,
        maxWidth: columns[cellIndex] - 8,
        lineHeight: 9,
      });
      cellX += columns[cellIndex];
    });
    y += 16;
    doc.line(MARGIN, y, MARGIN + WIDTH, y, { color: BORDER, lineWidth: 0.3 });
  });

  y += 18;
  doc.text(
    'Fees may be paid in two instalments each semester at the Bursary, by mobile money, or by bank ' +
      'deposit. Receipts are issued for every payment. A 5% discount on tuition is allowed where a ' +
      'family settles the whole year in advance.',
    MARGIN,
    y,
    { size: 9, color: MUTED, maxWidth: WIDTH, lineHeight: 12 }
  );
  y += 46;

  y = heading(doc, 'Feeding', y);
  doc.text(
    'The school kitchen prepares one hot meal every school day, served in the dining commons from ' +
      '12:15 p.m. Parents may pay daily through the class teacher, or pay for the semester in ' +
      'advance and receive a meal card for the pupil.',
    MARGIN,
    y,
    { size: 9.5, color: INK, maxWidth: WIDTH, lineHeight: 13 }
  );
  y += 52;

  y = heading(doc, 'Contacting the school', y);
  const contactLines = [
    ['School office', OFFICE_CONTACTS.mainPhone],
    ['Headmaster', OFFICE_CONTACTS.headmasterPhone],
    ['Bursary and feeding desk', OFFICE_CONTACTS.bursaryPhone],
    ['General enquiries', OFFICE_CONTACTS.generalEmail],
    ['Headmaster', OFFICE_CONTACTS.headmasterEmail],
    ['Address', OFFICE_CONTACTS.postalAddress],
    ['Digital address', OFFICE_CONTACTS.digitalAddress],
  ];
  contactLines.forEach(([label, value]) => {
    doc.text(label, MARGIN, y, { size: 9.5, color: MUTED, maxWidth: 150 });
    doc.text(value, MARGIN + 160, y, { font: 'Helvetica-Bold', size: 9.5, color: INK });
    y += 15;
  });

  y += 14;
  doc.text(
    'Office hours: Monday to Friday, 7:00 a.m. to 5:00 p.m. Tours for parents run on Tuesdays and ' +
      'Thursdays between 9:00 a.m. and 12:00 noon and do not require an appointment.',
    MARGIN,
    y,
    { size: 9, color: MUTED, maxWidth: WIDTH, lineHeight: 12 }
  );

  doc.rect(MARGIN, 800, WIDTH, 1, { fill: BORDER });
  doc.text(
    `Prospectus issued ${new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })}`,
    MARGIN,
    806,
    { size: 7.5, color: MUTED }
  );

  return doc.build();
}
