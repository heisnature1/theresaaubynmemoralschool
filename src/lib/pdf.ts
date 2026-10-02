/**
 * A small, dependency-free PDF writer.
 *
 * It supports exactly what the school needs: absolute positioned text in the
 * fourteen standard PDF fonts, filled/stroked rectangles and lines, automatic
 * word wrapping, and multi-page documents. Everything is emitted as a plain
 * PDF 1.4 byte stream, so it runs in the browser and on the server alike.
 */

export type PdfFont =
  | 'Helvetica'
  | 'Helvetica-Bold'
  | 'Helvetica-Oblique'
  | 'Times-Roman'
  | 'Times-Bold'
  | 'Times-Italic';

export type Rgb = [number, number, number];

/* Character widths (thousandths of an em) for ASCII 32–126. */
const ASCII_WIDTHS: Record<PdfFont, number[]> = {
  Helvetica: [
    278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556,
    556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556, 1015, 667, 667, 722, 722, 667,
    611, 778, 722, 278, 500, 667, 556, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667,
    667, 611, 278, 278, 278, 469, 556, 333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500,
    222, 833, 556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584,
  ],
  'Helvetica-Bold': [
    278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556,
    556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611, 975, 722, 722, 722, 722, 667,
    611, 778, 722, 278, 556, 722, 611, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667,
    667, 611, 333, 278, 333, 584, 556, 333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556,
    278, 889, 611, 611, 611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584,
  ],
  'Helvetica-Oblique': [] as number[],
  'Times-Roman': [
    250, 333, 408, 500, 500, 833, 778, 180, 333, 333, 500, 564, 250, 333, 250, 278, 500, 500, 500,
    500, 500, 500, 500, 500, 500, 500, 278, 278, 564, 564, 564, 444, 921, 722, 667, 667, 722, 611,
    556, 722, 722, 333, 389, 722, 611, 889, 722, 722, 556, 722, 667, 556, 611, 722, 722, 944, 722,
    722, 611, 333, 278, 333, 469, 500, 333, 444, 500, 444, 500, 444, 333, 500, 500, 278, 278, 500,
    278, 778, 500, 500, 500, 500, 333, 389, 278, 500, 500, 722, 500, 500, 444, 480, 200, 480, 541,
  ],
  'Times-Bold': [
    250, 333, 555, 500, 500, 1000, 833, 278, 333, 333, 500, 570, 250, 333, 250, 278, 500, 500, 500,
    500, 500, 500, 500, 500, 500, 500, 333, 333, 570, 570, 570, 500, 930, 722, 667, 722, 722, 667,
    611, 778, 778, 389, 500, 778, 667, 944, 722, 778, 611, 778, 722, 556, 667, 722, 722, 1000, 722,
    722, 667, 333, 278, 333, 581, 500, 333, 500, 556, 444, 556, 444, 333, 500, 556, 278, 333, 556,
    278, 833, 556, 500, 556, 556, 444, 389, 333, 556, 500, 722, 500, 500, 444, 394, 220, 394, 520,
  ],
  'Times-Italic': [
    250, 333, 420, 500, 500, 833, 778, 214, 333, 333, 500, 675, 250, 333, 250, 278, 500, 500, 500,
    500, 500, 500, 500, 500, 500, 500, 333, 333, 675, 675, 675, 500, 920, 611, 611, 667, 722, 611,
    611, 722, 722, 333, 444, 667, 556, 833, 667, 722, 611, 722, 611, 500, 556, 722, 611, 833, 611,
    556, 556, 389, 278, 389, 422, 500, 333, 500, 500, 444, 500, 444, 278, 500, 500, 278, 278, 444,
    278, 722, 500, 500, 500, 500, 389, 389, 278, 500, 444, 667, 444, 444, 389, 400, 275, 400, 541,
  ],
};
ASCII_WIDTHS['Helvetica-Oblique'] = ASCII_WIDTHS.Helvetica;

/** Unicode code points in the WinAnsi (CP1252) high range. */
const WIN_ANSI_EXTRAS: Record<number, number> = {
  0x20ac: 0x80, 0x201a: 0x82, 0x0192: 0x83, 0x201e: 0x84, 0x2026: 0x85, 0x2020: 0x86,
  0x2021: 0x87, 0x02c6: 0x88, 0x2030: 0x89, 0x0160: 0x8a, 0x2039: 0x8b, 0x0152: 0x8c,
  0x017d: 0x8e, 0x2018: 0x91, 0x2019: 0x92, 0x201c: 0x93, 0x201d: 0x94, 0x2022: 0x95,
  0x2013: 0x96, 0x2014: 0x97, 0x02dc: 0x98, 0x2122: 0x99, 0x0161: 0x9a, 0x203a: 0x9b,
  0x0153: 0x9c, 0x017e: 0x9e, 0x0178: 0x9f,
};

function encodeWinAnsi(text: string): number[] {
  const bytes: number[] = [];
  for (const char of text) {
    const code = char.codePointAt(0) as number;
    if (code === 0x09) {
      bytes.push(0x20);
    } else if (code >= 32 && code <= 126) {
      bytes.push(code);
    } else if (code >= 0xa0 && code <= 0xff) {
      bytes.push(code);
    } else if (WIN_ANSI_EXTRAS[code] !== undefined) {
      bytes.push(WIN_ANSI_EXTRAS[code]);
    } else {
      bytes.push(0x3f); // '?'
    }
  }
  return bytes;
}

function escapePdfString(bytes: number[]): string {
  let out = '';
  for (const byte of bytes) {
    if (byte === 0x28 || byte === 0x29 || byte === 0x5c) {
      out += '\\' + String.fromCharCode(byte);
    } else if (byte < 32 || byte > 126) {
      out += '\\' + byte.toString(8).padStart(3, '0');
    } else {
      out += String.fromCharCode(byte);
    }
  }
  return out;
}

export interface TextOptions {
  font?: PdfFont;
  size?: number;
  color?: Rgb;
  align?: 'left' | 'center' | 'right';
  /** When set, the text is wrapped to this width (points). */
  maxWidth?: number;
  lineHeight?: number;
  /** Return value of this line's height in points; handy for flowing layout. */
  characterSpacing?: number;
}

export interface RectOptions {
  fill?: Rgb;
  stroke?: Rgb;
  lineWidth?: number;
}

export class PdfDocument {
  readonly width: number;
  readonly height: number;

  private pages: string[][] = [];
  private ops: string[] = [];

  constructor(options?: { width?: number; height?: number }) {
    this.width = options?.width ?? 595.28; // A4 portrait
    this.height = options?.height ?? 841.89;
    this.pages.push(this.ops);
  }

  addPage(): void {
    this.ops = [];
    this.pages.push(this.ops);
  }

  get pageCount(): number {
    return this.pages.length;
  }

  /* ------------------------------- measuring ------------------------------ */

  measure(text: string, font: PdfFont = 'Helvetica', size = 10): number {
    const widths = ASCII_WIDTHS[font];
    let total = 0;
    for (const byte of encodeWinAnsi(text)) {
      total += byte >= 32 && byte <= 126 ? widths[byte - 32] : 556;
    }
    return (total * size) / 1000;
  }

  wrapText(text: string, maxWidth: number, font: PdfFont = 'Helvetica', size = 10): string[] {
    const lines: string[] = [];
    for (const rawLine of String(text ?? '').split('\n')) {
      const words = rawLine.split(/\s+/).filter(Boolean);
      if (words.length === 0) {
        lines.push('');
        continue;
      }
      let current = '';
      for (const word of words) {
        const candidate = current ? `${current} ${word}` : word;
        if (this.measure(candidate, font, size) <= maxWidth || !current) {
          current = candidate;
        } else {
          lines.push(current);
          current = word;
        }
      }
      if (current) lines.push(current);
    }
    return lines;
  }

  /* -------------------------------- drawing ------------------------------- */

  /** Draws text with the origin measured from the top-left corner of the page. */
  text(content: string, x: number, y: number, options: TextOptions = {}): void {
    const font = options.font ?? 'Helvetica';
    const size = options.size ?? 10;
    const color = options.color ?? [0.1, 0.1, 0.1];
    const align = options.align ?? 'left';
    const lineHeight = options.lineHeight ?? size * 1.35;

    const lines = options.maxWidth
      ? this.wrapText(content, options.maxWidth, font, size)
      : [content];

    lines.forEach((line, index) => {
      let drawX = x;
      if (align !== 'left') {
        const width = this.measure(line, font, size);
        drawX = align === 'center' ? x - width / 2 : x - width;
      }
      const drawY = this.height - (y + index * lineHeight) - size;
      const bytes = encodeWinAnsi(line);
      this.ops.push(
        `BT ${color[0].toFixed(3)} ${color[1].toFixed(3)} ${color[2].toFixed(3)} rg ` +
          `/${this.fontKey(font)} ${size} Tf ` +
          (options.characterSpacing ? `${options.characterSpacing} Tc ` : '') +
          `1 0 0 1 ${drawX.toFixed(2)} ${drawY.toFixed(2)} Tm (${escapePdfString(bytes)}) Tj ET`
      );
    });
  }

  /** Returns the y position immediately below the text block that was drawn. */
  textBlock(content: string, x: number, y: number, options: TextOptions = {}): number {
    const size = options.size ?? 10;
    const lineHeight = options.lineHeight ?? size * 1.35;
    const lines = options.maxWidth
      ? this.wrapText(content, options.maxWidth, options.font ?? 'Helvetica', size)
      : String(content ?? '').split('\n');
    this.text(content, x, y, options);
    return y + lines.length * lineHeight;
  }

  line(x1: number, y1: number, x2: number, y2: number, options: { color?: Rgb; lineWidth?: number } = {}): void {
    const color = options.color ?? [0.6, 0.6, 0.6];
    this.ops.push(
      `${color[0].toFixed(3)} ${color[1].toFixed(3)} ${color[2].toFixed(3)} RG ` +
        `${(options.lineWidth ?? 0.75).toFixed(2)} w ` +
        `${x1.toFixed(2)} ${(this.height - y1).toFixed(2)} m ${x2.toFixed(2)} ${(this.height - y2).toFixed(2)} l S`
    );
  }

  rect(x: number, y: number, w: number, h: number, options: RectOptions = {}): void {
    const drawY = this.height - y - h;
    let op = '';
    if (options.fill) {
      op += `${options.fill[0].toFixed(3)} ${options.fill[1].toFixed(3)} ${options.fill[2].toFixed(3)} rg `;
    }
    if (options.stroke) {
      op += `${options.stroke[0].toFixed(3)} ${options.stroke[1].toFixed(3)} ${options.stroke[2].toFixed(3)} RG `;
      op += `${(options.lineWidth ?? 0.75).toFixed(2)} w `;
    }
    op += `${x.toFixed(2)} ${drawY.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re `;
    op += options.fill && options.stroke ? 'B' : options.fill ? 'f' : 'S';
    this.ops.push(op);
  }

  /* -------------------------------- output -------------------------------- */

  private fontKey(font: PdfFont): string {
    const keys: Record<PdfFont, string> = {
      Helvetica: 'F1',
      'Helvetica-Bold': 'F2',
      'Helvetica-Oblique': 'F3',
      'Times-Roman': 'F4',
      'Times-Bold': 'F5',
      'Times-Italic': 'F6',
    };
    return keys[font];
  }

  build(): Uint8Array {
    const fontNames: PdfFont[] = [
      'Helvetica',
      'Helvetica-Bold',
      'Helvetica-Oblique',
      'Times-Roman',
      'Times-Bold',
      'Times-Italic',
    ];

    const objects: string[] = [];
    const pageObjectNumbers: number[] = [];

    // 1: catalog, 2: pages, 3..8: fonts
    const firstPageObject = 9;
    const pageObjects: number[] = [];
    this.pages.forEach((_, index) => pageObjects.push(firstPageObject + index * 2));

    objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
    objects[2] =
      `<< /Type /Pages /Count ${this.pages.length} /Kids [` +
      pageObjects.map((n) => `${n} 0 R`).join(' ') +
      '] >>';

    fontNames.forEach((font, index) => {
      objects[3 + index] =
        `<< /Type /Font /Subtype /Type1 /BaseFont /${font} /Encoding /WinAnsiEncoding >>`;
    });

    const fontResources =
      '<< ' +
      fontNames.map((font, index) => `/${this.fontKey(font)} ${3 + index} 0 R`).join(' ') +
      ' >>';

    this.pages.forEach((ops, index) => {
      const pageObj = pageObjects[index];
      const contentObj = pageObj + 1;
      objects[pageObj] =
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${this.width.toFixed(2)} ${this.height.toFixed(
          2
        )}] /Resources << /Font ${fontResources} >> /Contents ${contentObj} 0 R >>`;
      objects[contentObj] = `<< /Length ${ops.join('\n').length} >>\nstream\n${ops.join('\n')}\nendstream`;
    });

    let pdf = '%PDF-1.4\n';
    const offsets: number[] = [];
    const maxObject = objects.length;

    for (let i = 1; i < maxObject; i += 1) {
      if (!objects[i]) continue;
      offsets[i] = pdf.length;
      pdf += `${i} 0 obj\n${objects[i]}\nendobj\n`;
    }

    const xrefStart = pdf.length;
    pdf += `xref\n0 ${maxObject}\n`;
    pdf += '0000000000 65535 f \n';
    for (let i = 1; i < maxObject; i += 1) {
      const offset = offsets[i] ?? 0;
      pdf += `${offset.toString().padStart(10, '0')} 00000 n \n`;
    }
    pdf +=
      `trailer\n<< /Size ${maxObject} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;

    // Latin-1 byte mapping keeps the byte offsets above valid.
    const bytes = new Uint8Array(pdf.length);
    for (let i = 0; i < pdf.length; i += 1) {
      bytes[i] = pdf.charCodeAt(i) & 0xff;
    }
    return bytes;
  }
}

/** Triggers a browser download for a freshly built PDF. */
export function downloadPdf(bytes: Uint8Array, filename: string): void {
  const buffer = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer;
  const blob = new Blob([buffer], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = window.document.createElement('a');
  link.href = url;
  link.download = filename;
  window.document.body.appendChild(link);
  link.click();
  window.document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
