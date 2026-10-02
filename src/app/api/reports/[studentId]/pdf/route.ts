import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getSchoolState } from '@/lib/store';
import { buildClassReportPdf, buildStudentReportPdf } from '@/lib/report-pdf';

export const dynamic = 'force-dynamic';

/**
 * GET /api/reports/:studentId/pdf            -> one pupil's terminal report
 * GET /api/reports/class.pdf?className=JHS+3 -> every report in a class
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { studentId: string } }
) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: 'Sign-in required.' }, { status: 401 });
  }

  const state = getSchoolState();
  const reportType =
    req.nextUrl.searchParams.get('type') === 'mid-term' ? ('mid-term' as const) : ('terminal' as const);

  if (params.studentId === 'class') {
    const className = req.nextUrl.searchParams.get('className');
    if (!className) {
      return NextResponse.json({ error: 'className is required.' }, { status: 400 });
    }
    const pdf = buildClassReportPdf(state, className);
    return new NextResponse(Buffer.from(pdf), {
      headers: pdfHeaders(`${className.replace(/\s+/g, '-')}-semester-reports.pdf`),
    });
  }

  const student = state.students.find((s) => s.id === params.studentId);
  if (!student) {
    return NextResponse.json({ error: 'Pupil not found.' }, { status: 404 });
  }

  const pdf = buildStudentReportPdf(state, { student, reportType });
  return new NextResponse(Buffer.from(pdf), {
    headers: pdfHeaders(
      `${student.fullName.replace(/\s+/g, '-')}-${reportType === 'mid-term' ? 'mid-term' : 'semester'}-report.pdf`
    ),
  });
}

function pdfHeaders(filename: string): Record<string, string> {
  return {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${filename}"`,
    'Cache-Control': 'no-store',
  };
}
