import { SchoolStateSnapshot } from '@/types/school';
import { PdfDocument, Rgb } from './pdf';
import { pdfCurrency, pdfSchoolDetails } from './report-pdf';
import type { SiteData } from './site-data';

const GREEN: Rgb = [0.035, 0.224, 0.165];
const GOLD: Rgb = [0.851, 0.686, 0.216];
const INK: Rgb = [0.12, 0.15, 0.18];
const MUTED: Rgb = [0.42, 0.45, 0.5];
const BORDER: Rgb = [0.78, 0.8, 0.82];

const MARGIN = 46;
const WIDTH = 595.28 - MARGIN * 2;

const NOT_PUBLISHED = 'The school has not published this information yet. Please contact the school office.';

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

/**
 * A short prospectus for parents, produced on the office computer from the
 * school's own published content. Sections whose content has not been published
 * are left out rather than filled with invented particulars.
 */
export function buildProspectusPdf(state: SchoolStateSnapshot, content?: SiteData): Uint8Array {
  const doc = new PdfDocument();
  const details = pdfSchoolDetails(content?.info ?? null);
  const semester = content?.info?.currentSemester || state.currentSemester;

  let y = MARGIN;

  if (details.name) {
    doc.text(details.name, MARGIN + WIDTH / 2, y, {
      font: 'Times-Bold',
      size: 18,
      color: GREEN,
      align: 'center',
    });
    y += 22;
  }
  if (details.motto) {
    doc.text(details.motto, MARGIN + WIDTH / 2, y, {
      font: 'Times-Italic',
      size: 9.5,
      color: MUTED,
      align: 'center',
    });
    y += 14;
  }
  if (details.addressLine) {
    doc.text(details.addressLine, MARGIN + WIDTH / 2, y, {
      size: 8.5,
      color: MUTED,
      align: 'center',
      maxWidth: WIDTH,
      lineHeight: 10,
    });
    y += 11;
  }
  if (details.contactLine) {
    doc.text(details.contactLine, MARGIN + WIDTH / 2, y, {
      size: 8.5,
      color: MUTED,
      align: 'center',
      maxWidth: WIDTH,
      lineHeight: 10,
    });
    y += 14;
  }
  doc.rect(MARGIN, y, WIDTH, 2.4, { fill: GOLD });
  y += 24;

  y = heading(doc, 'Prospectus and admissions information', y);

  y = doc.textBlock(content?.info?.aboutSummary || NOT_PUBLISHED, MARGIN, y, {
    size: 9.5,
    color: INK,
    maxWidth: WIDTH,
    lineHeight: 13.5,
  });
  if (semester) {
    y += 6;
    y = doc.textBlock(`Academic year ${semester}.`, MARGIN, y, {
      size: 9.5,
      color: INK,
      maxWidth: WIDTH,
      lineHeight: 13.5,
    });
  }
  y += 14;

  const admissionSteps = content?.admissionSteps ?? [];
  if (admissionSteps.length > 0) {
    y = heading(doc, 'Admission procedure', y);
    admissionSteps.forEach((step) => {
      if (step.step) {
        doc.text(step.step, MARGIN, y, { font: 'Helvetica-Bold', size: 10, color: GOLD });
      }
      doc.text(step.title, MARGIN + 26, y, { font: 'Helvetica-Bold', size: 10, color: INK });
      const next = doc.textBlock(step.body, MARGIN + 26, y + 14, {
        size: 9,
        color: MUTED,
        maxWidth: WIDTH - 26,
        lineHeight: 12,
      });
      y = next + 10;
    });
  }

  const termDates = content?.termDates ?? [];
  if (termDates.length > 0) {
    y = heading(doc, 'School calendar', y);
    termDates.forEach((entry) => {
      doc.text(entry.label, MARGIN, y, { size: 9.5, color: INK, maxWidth: WIDTH * 0.55 });
      doc.text(entry.detail, MARGIN + WIDTH, y, { size: 9.5, color: MUTED, align: 'right' });
      y += 15;
      doc.line(MARGIN, y - 3, MARGIN + WIDTH, y - 3, { color: BORDER, lineWidth: 0.4 });
    });
  }

  /* ----------------------------- second page ----------------------------- */
  doc.addPage();
  y = MARGIN;

  const feeRows = content?.feeRows?.length ? content.feeRows : state.classFeeStructures;

  y = heading(doc, semester ? `Fee schedule \u2014 ${semester}` : 'Fee schedule', y);

  if (feeRows.length > 0) {
    const columns = [76, 60, 70, 64, 84, 70, 79.28];
    const headers = ['Class', 'Tuition', 'Extra classes', 'Daily meal', 'Semester meal', 'ICT & books', 'Class teacher'];

    doc.rect(MARGIN, y, WIDTH, 18, { fill: GREEN });
    let x = MARGIN;
    headers.forEach((header, index) => {
      doc.text(header, x + 4, y + 5.5, { font: 'Helvetica-Bold', size: 7.4, color: [1, 1, 1] });
      x += columns[index];
    });
    y += 18;

    feeRows.forEach((row, index) => {
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
        row.classTeacher ? shortTeacherName(row.classTeacher) : '',
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
    y = doc.textBlock(
      'Fees may be paid in two instalments each semester at the Bursary, by mobile money, or by bank ' +
        'deposit. Receipts are issued for every payment.',
      MARGIN,
      y,
      { size: 9, color: MUTED, maxWidth: WIDTH, lineHeight: 12 }
    );
    y += 24;
  } else {
    y = doc.textBlock(NOT_PUBLISHED, MARGIN, y, {
      size: 9.5,
      color: MUTED,
      maxWidth: WIDTH,
      lineHeight: 13,
    });
    y += 18;
  }

  const info = content?.info;
  const contactLines: Array<[string, string]> = [];
  if (info?.mainPhone) contactLines.push(['School office', info.mainPhone]);
  if (info?.headmasterPhone) contactLines.push(['Headmaster', info.headmasterPhone]);
  if (info?.bursaryPhone) contactLines.push(['Bursary and feeding desk', info.bursaryPhone]);
  if (info?.generalEmail) contactLines.push(['General enquiries', info.generalEmail]);
  if (info?.headmasterEmail) contactLines.push(['Headmaster', info.headmasterEmail]);
  if (info?.postalAddress) contactLines.push(['Address', info.postalAddress]);
  if (info?.digitalAddress) contactLines.push(['Digital address', info.digitalAddress]);

  if (contactLines.length > 0) {
    y = heading(doc, 'Contacting the school', y);
    contactLines.forEach(([label, value]) => {
      doc.text(label, MARGIN, y, { size: 9.5, color: MUTED, maxWidth: 150 });
      doc.text(value, MARGIN + 160, y, {
        font: 'Helvetica-Bold',
        size: 9.5,
        color: INK,
        maxWidth: WIDTH - 160,
        lineHeight: 12,
      });
      y += 15;
    });
  }

  const hours: string[] = [];
  if (info?.officeHours) hours.push(`Office hours: ${info.officeHours}.`);
  if (info?.tourHours) hours.push(`Tours for parents: ${info.tourHours}.`);
  if (hours.length > 0) {
    y += info?.mainPhone || info?.generalEmail ? 14 : 8;
    doc.textBlock(hours.join(' '), MARGIN, y, {
      size: 9,
      color: MUTED,
      maxWidth: WIDTH,
      lineHeight: 12,
    });
  }

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
