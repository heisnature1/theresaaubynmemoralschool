import { requireParent } from '@/lib/auth';
import { getSchoolState } from '@/lib/store';
import { getSiteData } from '@/lib/site-data';
import { SCHOOL_NAME } from '@/lib/constants';
import { ParentPortal, type ParentChildView } from '@/components/portal/ParentPortal';

export const dynamic = 'force-dynamic';

/**
 * What a parent sees. The page narrows the school's records down to the
 * children named in the parent's session before anything is sent to the
 * browser: only their own children's figures leave the server.
 */
export default async function ParentsPage() {
  const session = requireParent();
  const state = getSchoolState();
  const { info } = await getSiteData();

  const children: ParentChildView[] = session.studentIds
    .map((id) => state.students.find((pupil) => pupil.id === id))
    .filter((pupil): pupil is NonNullable<typeof pupil> => Boolean(pupil))
    .map((pupil) => {
      const feeRow = state.classFeeStructures
        .filter((row) => row.className === pupil.className)
        .sort((a, b) => Date.parse(b.updatedAt || '') - Date.parse(a.updatedAt || ''))[0];

      const billedItems = feeRow
        ? [
            { label: 'Tuition', amount: feeRow.tuitionFee },
            { label: 'Extra classes', amount: feeRow.extraClassesFee },
            { label: 'Meals (semester)', amount: feeRow.semesterMealFee },
            { label: 'ICT & books', amount: feeRow.ictAndBooksFee },
          ].filter((item) => item.amount > 0)
        : [
            { label: 'Tuition', amount: pupil.tuitionPaid },
            { label: 'Extra classes', amount: pupil.extraClassesPaid },
            { label: 'Meals', amount: pupil.mealFeePaid },
          ].filter((item) => item.amount > 0);

      const totalBilled =
        billedItems.reduce((sum, item) => sum + item.amount, 0) || pupil.tuitionPaid;
      const payments = state.feePayments
        .filter((payment) => payment.studentId === pupil.id)
        .sort((a, b) => Date.parse(b.paymentDate) - Date.parse(a.paymentDate));
      const totalPaid =
        payments.reduce((sum, payment) => sum + payment.amount, 0) ||
        pupil.tuitionPaid + pupil.extraClassesPaid + pupil.mealFeePaid;

      const feeding = state.dailyFeedingLogs
        .filter((log) => log.studentId === pupil.id)
        .sort((a, b) => Date.parse(b.collectionDate) - Date.parse(a.collectionDate));

      const results = state.academicResults
        .filter((result) => result.studentId === pupil.id)
        .sort((a, b) => a.subject.localeCompare(b.subject));

      const termAverage =
        results.length > 0
          ? Math.round((results.reduce((sum, row) => sum + row.totalScore, 0) / results.length) * 10) / 10
          : null;

      return {
        id: pupil.id,
        fullName: pupil.fullName,
        studentCode: pupil.studentCode,
        className: pupil.className,
        photo: pupil.photo,
        attendancePresent: pupil.attendancePresent,
        attendanceTotal: pupil.attendanceTotal,
        conduct: pupil.conduct,
        interestTalent: pupil.interestTalent,
        teacherRemark: pupil.teacherRemark,
        headmasterRemark: pupil.headmasterRemark,
        reportEndorsed: pupil.reportEndorsed,
        fees: {
          items: billedItems,
          totalBilled,
          totalPaid,
          balance: Math.max(0, totalBilled - totalPaid),
          payments: payments.slice(0, 12).map((payment) => ({
            id: payment.id,
            receiptNo: payment.receiptNo,
            date: payment.paymentDate,
            category: payment.category.replace(/_/g, ' '),
            amount: payment.amount,
            method: payment.paymentMethod,
          })),
        },
        feeding: {
          mealsLogged: feeding.length,
          amountPaid: feeding.reduce((sum, log) => sum + log.amount, 0),
          exemptDays: feeding.filter((log) => log.status === 'exempt').length,
          unpaidDays: feeding.filter((log) => log.status === 'unpaid').length,
          recent: feeding.slice(0, 10).map((log) => ({
            id: log.id,
            date: log.collectionDate,
            status: log.status,
            amount: log.amount,
          })),
        },
        results: results.map((row) => ({
          id: row.id,
          subject: row.subject,
          classScore: row.classScore,
          examScore: row.examScore,
          totalScore: row.totalScore,
          grade: row.grade,
          remark: row.remark,
          semester: row.semester,
        })),
        termAverage,
      };
    });

  return (
    <ParentPortal
      guardianName={session.fullName}
      children={children}
      school={{
        name: info?.schoolName || SCHOOL_NAME,
        mainPhone: info?.mainPhone ?? null,
        generalEmail: info?.generalEmail ?? null,
        currentSemester: info?.currentSemester ?? null,
        nextReopening: info?.nextReopening ?? null,
        officeHours: info?.officeHours ?? null,
      }}
    />
  );
}
