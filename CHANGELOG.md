# Changelog

All notable changes to the St Theresa Aubyn Memorial School website and staff portal.

## v1.2.0 — 2 October 2026

### Changed

- **The school is now written "St Theresa Aubyn Memorial School" everywhere.** The previous
  spelling has been corrected across the website, the portal, the PDFs, the emails
  (`…@sttheresa-aubyn.edu.gh`), the Tailwind colour tokens (`theresa-green` / `theresa-gold`), the
  package name (`st-theresa-aubyn-memorial-school`) and the documentation. No occurrence of the old
  spelling remains in the repository.
- **Website content is now served from the database.** Every school particular — name, motto,
  welcome summary, highlights, contacts, office and tour hours, headmaster message, notices,
  history milestones, gallery, departments, values, admission steps, term dates and the public
  staff directory — is read through `src/lib/site-data.ts` from the `school_information`,
  `site_notices`, `history_milestones`, `gallery_items`, `departments`, `school_values`,
  `admission_steps` and `term_dates` tables (anon read, service-role write; see
  `supabase/schema.sql`). Nothing is hardcoded in the pages: where content has not been published,
  the site shows a short "nothing published yet" note.
- **Report cards and the prospectus** take their letterheads from the published school
  information, and leave out any line the school has not filled in.
- **The records store keeps no demonstration data.** `createDefaultState()` now creates only the
  two bootstrap staff accounts (proprietor and Headmaster); demonstration pupils, fee books,
  feeding logs, marks, applications and enquiries are gone. The store path is
  `/tmp/st-theresa-aubyn-state-v2.json`.
- `src/lib/constants.ts` keeps only the school name constants and the subject list used to build
  the staff forms.
- The teacher sign-in page no longer prints a preview account.
- Version bumped to **1.2.0** in `package.json` and `package-lock.json`.

### Added

- `src/lib/site-data.ts` — one `getSiteData()` call per request returning every published part of
  the website, degrading to empty values if a table is missing or unreadable.
- Website content tables, row-level security policies and a publishing example in
  `supabase/schema.sql`.
- A "Website content" section in the README mapping each table to the pages it feeds.

### Removed

- `NEXT_PUBLIC_SCHOOL_NAME` and `NEXT_PUBLIC_CURRENT_SEMESTER` environment variables (unused; the
  content lives in the database).
- Fabricated seed content from `src/lib/constants.ts` and `src/lib/store.ts`, including the invented
  "documents to bring", 5% discount and feeding passages in the prospectus PDF.

### Deploying this release

Run `supabase/schema.sql` on the project database. Until the `school_information` row and the
content tables are filled in, the live website will show empty states.

## v1.1.0 — 2 October 2026

- Modern design system: welcome gate, animated home page, gallery and page heroes.
- Rebuilt the site as an ordinary school website with a staff portal behind it.
- Passport photographs on teaching applications and pupil admissions.
- Sidebar portal shell, report cards and the prospectus as downloadable PDFs.
- Supabase schema, row-level security and environment documentation.

## v1.0.0 — initial release

- School management website and role-based portal: fees, feeding register, continuous assessment,
  report cards, teaching applications, parent enquiries and an audit trail.
- Sign-in for Super Administrator, Administrator (Headmaster) and teachers.
