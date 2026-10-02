import Link from 'next/link';
import { TeacherSignupForm } from '@/components/auth/TeacherSignupForm';

export const metadata = {
  title: 'Teaching applications | St. Teresa Aubyn Memorial School',
  description:
    'Apply for a teaching post at St. Teresa Aubyn Memorial School. Applications are reviewed by the Headmaster and the proprietor.',
};

export default function TeacherRegisterPage() {
  return (
    <div className="w-full max-w-3xl">
      <div className="rounded-md border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teresa-gold-700">
          Teaching appointments
        </p>
        <h1 className="mt-2 font-serif text-2xl font-bold text-teresa-green-950 sm:text-3xl">
          Apply to teach at St. Teresa Aubyn Memorial School
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
          We appoint qualified teachers who are willing to keep careful records of their pupils&apos;
          work and to take a full part in the life of the compound. Complete the form below; the
          Headmaster reviews applications each week and will contact you if you are shortlisted.
        </p>

        <div className="mt-8">
          <TeacherSignupForm />
        </div>
      </div>

      <p className="mt-5 text-center text-sm text-slate-600">
        Already on the staff?{' '}
        <Link href="/login/teacher" className="font-semibold text-teresa-green-800 hover:underline">
          Go to the teacher sign-in page
        </Link>
        .
      </p>
    </div>
  );
}
