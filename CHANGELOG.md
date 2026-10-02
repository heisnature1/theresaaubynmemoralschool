# Changelog

All notable changes to the St Theresa Aubyn Memorial School website and staff portal.

## v1.3.0 — 2 October 2026

### Added

- **A parents' area.** Parents sign in at `/login/parent` with their child's admission code
  (`STA/2026/101`) and either the guardian telephone number on the school record or a six-digit
  access PIN issued by the office, and reach `/parents`. They see, for each of their children:
  the fee statement and receipts, the midday meal account, attendance, subject marks and the
  terminal report card — which they can download as a PDF. Brothers and sisters on the same
  telephone number open together, and a parent can never open another family's records.
- **Searchable admissions.** Families apply for a place on the website at `/admissions/apply` and
  receive a reference (`ADM/2026/0001`) at once; they can check the application's progress at any
  time from Admissions → *Check an application*. The office works the same register in the portal
  (Administrator → Admissions, and the Super Administrator's own tab): a search box across
  reference, child, guardian, telephone number, class and status; status filters with counts; office
  notes; and a *move to* step for the whole journey. Moving an application to **Enrolled** puts the
  child on the pupil roll with an admission code.
- **Staff account management.** The Super Administrator's staff directory now searches the whole
  roll and manages accounts: create an account (name, email, telephone, role, class, subjects and
  qualification), correct its details, reset a password (shown once, to hand over in person),
  suspend an account and reinstate it. Every change is written to the audit trail, and the badge
  beside each account says whether it signs in through Supabase Auth or with a portal password.
- **Supabase Auth.** When a Supabase project is connected, staff sign in through Supabase Auth; the
  `auth_user_id` on the staff record links the two. Accounts created, corrected, suspended or
  password-reset in the directory are kept in step in Supabase Auth with the service-role key, and
  the school record is mirrored into `profiles`. A deployment without a database carries on with
  the portal's own scrypt passwords, so connecting Supabase never locks the office out.
- **School particulars publishing.** Super Administrator → *School particulars* edits every fact the
  website publishes — name, motto, year founded, introduction, highlights, telephone numbers, email
  addresses, GPS and postal addresses, hours, headmaster name, title and welcome, semester and
  reopening — with a live preview and a count of what is published. Saving writes the
  `school_information` row the whole site, the prospectus and the report letterheads read.
- **Parent access PINs** issued from the office (Administrator → Admissions → the key beside a
  pupil): a six-digit PIN, hashed at rest and shown once, for families who would rather not sign in
  with the telephone number.

### Changed

- **Gradients instead of stock photographs.** The six bundled campus photographs are gone. Every
  hero, page banner, panel and backdrop is now drawn in the school's own colours by
  `src/components/site/GradientArt.tsx`: layered green-and-gold gradients, a slow drift of the
  colour field, the grid and the crest as a watermark. Nothing loads over the network, and no
  photograph of another school appears anywhere on the site.
- The sign-in cards no longer print preview credentials: passwords are issued by the office from the
  staff directory (and, where Supabase is connected, by Supabase Auth).
- The middleware gate now covers both signed-in areas (`/portal` for staff and `/parents` for
  families), each with its own cookie.
- Staff records, pupil records, applications and the audit trail are migrated on read, so a store
  written by an earlier version keeps every record it holds.

### Database

- `supabase/schema.sql` gains the `admission_applications` table with its row-level security
  policies and search indexes, the `guardian_email`, `access_pin_hash` and `access_pin_issued_at`
  columns on `students`, the `auth_user_id` column on `profiles`, and a trigger that mirrors a
  Supabase Auth user's details onto the school record. Everything is written to be run again on an
  existing database.

### Documentation

- The README documents the parents' area, the admissions journey, staff account management,
  Supabase Auth and the particulars editor, with the sign-in table and the office notes brought up
  to date.

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
