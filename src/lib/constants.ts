/**
 * Only what the code needs in order to build itself.
 *
 * School details, notices, term dates, departments, values, admission steps and
 * contact numbers are NOT held here: they are published from the database and
 * read through `getSiteData()` in `src/lib/site-data.ts`.
 */

export const SCHOOL_NAME = 'St Theresa Aubyn Memorial School';

export const SHORT_SCHOOL_NAME = 'St Theresa';

/** Subject list used to build the subject pickers on the staff forms. */
export const DEPARTMENT_SUBJECTS_FULL = [
  'Mathematics',
  'English Language',
  'Integrated Science',
  'Social Studies',
  'Computing & ICT',
  'Religious & Moral Education',
  'Creative Arts & Design',
  'French & Ghanaian Language',
];
