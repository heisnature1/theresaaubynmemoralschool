# St Theresa Aubyn Memorial School — Website & Staff Portal

[![Production Deployment](https://img.shields.io/badge/Production-Live-success)](https://theresaaubynmemoralschool.vercel.app)
[![Version](https://img.shields.io/badge/Version-1.3.0-blue)](https://github.com/heisnature1/theresaaubynmemoralschool)

**Production Website:** [https://theresaaubynmemoralschool.vercel.app](https://theresaaubynmemoralschool.vercel.app)

The public website and the staff records system for **St Theresa Aubyn Memorial School**, a day
school for KG 1 to JHS 3 founded in 1988.

The website carries the school's notices, term dates, academic programme, fee schedule, admissions
information, gallery and enquiry form, and families apply for a place online. Behind it sits a staff
portal where the Headmaster and the Bursary keep the fee books, class teachers enter marks and the
daily feeding register, and report cards are printed or downloaded as PDFs. Parents have their own
sign-in, with their child's fees, feeding account, attendance, marks and report card.

---

## The pages

**Public website** (`/`)

| Page | Address | What is on it |
| --- | --- | --- |
| Home | `/` | School introduction, notices for parents, term dates, headmaster's welcome, departments, fees at a glance |
| About the school | `/about` | History and the memorial, values, leadership and the teaching staff |
| Academics & fees | `/academics` | Departments, assessment method, grading key, the full fee schedule, extra classes, the feeding programme, calendar |
| Admissions | `/admissions` | The four steps, documents required, assessment for older applicants, fees, downloadable prospectus (PDF) and a check on an application |
| Apply for a place | `/admissions/apply` | The online application, which issues a reference the family can track |
| Gallery | `/gallery` | Photographs published by the office, filterable by category |
| Contact | `/contact` | Telephone numbers, email addresses, hours, directions and an enquiry form |

**Sign-in pages** (`/login/...`)

| Page | Address | Who uses it |
| --- | --- | --- |
| Parent | `/login/parent` | Parents and guardians, with the pupil's admission code |
| Super Administrator | `/login/super-admin` | The proprietor and governing council |
| Administrator | `/login/administrator` | The Headmaster, Bursary and school office |
| Teacher | `/login/teacher` | Class and subject teachers |

**Teacher applications** — `/register/teacher`. Applicants choose their own password and add a
**passport photograph** (taken with the device camera or uploaded). Once the Headmaster approves the
application the account becomes active and the applicant signs in with that password. The photograph
follows them onto the staff record, and is shown on the application and in the staff directory.

**Staff portal** (`/portal/...`, requires sign-in)

| Page | Address | What it does |
| --- | --- | --- |
| School overview | `/portal/super-admin` | Income by stream, fees outstanding by class, pupils registered, staff account management, the searchable admissions register, **school particulars publishing**, teaching applications, parent enquiries and a record of who changed what |
| Administration | `/portal/administrator` | Fee schedule by class, fee payments and receipts, **admissions (the searchable applications register and enrolling a pupil with a photograph)**, teaching applications, report endorsements |
| Class teacher | `/portal/teacher` | Continuous assessment and exam marks, the daily feeding register by pupil and date, report cards, password change |
| Report cards | `/portal/reports` | Report cards for any pupil, with a PDF download and a print view |

**Parents' area** (`/parents`, requires a parent sign-in)

| What is on it | Address |
| --- | --- |
| Each child's fee statement and receipts, midday meal account, attendance, subject marks, conduct and remarks, and the terminal report card as a PDF or print view | `/parents` |

A parent signs in with the pupil's admission code (`STA/2026/101`, printed on report cards and fee
receipts) and either the guardian telephone number the school holds or the six-digit access PIN the
office issues under **Administration → Admissions** (the key beside the pupil). Brothers and sisters
on the same telephone number open together; a parent can never open another family's records, and
the report-card endpoint refuses any pupil who is not named in that parent's session.

**Admissions online**

Families apply at `/admissions/apply` and receive a reference, `ADM/2026/0001`, immediately. They can
check its progress from **Admissions → Check an application**, using the reference alone or the
child's name with the telephone number on the application. The office works the same applications in
the portal: the register has a search box across reference, child, guardian, telephone number, class
and status; status filters with counts; office notes that parents never see; and a **move to** step
for the whole journey (*New → Contacted → Assessment → Offered → Enrolled*, or *Not proceeding*).
Moving an application to **Enrolled** puts the child on the pupil roll with an admission code.

---

## Website content

Nothing about the school is written into the code. The public website reads every school
particular from the database at request time, so the office can publish changes without a
deployment. Where a table is empty or missing, the page shows a short "nothing published yet"
note instead of inventing copy.

| Content | Table | Where it appears |
| --- | --- | --- |
| School name, motto, welcome summary, highlights, digital and postal address, phone numbers, email addresses, office and tour hours, headmaster name/title/message, current semester, next reopening | `school_information` (one row) | Header, footer, home hero, visit card, contact, admissions, academics, sign-in pages |
| Notices for parents | `site_notices` (with a `published` flag) | Home — notices for parents |
| History milestones | `history_milestones` | About — the timeline |
| Gallery photographs | `gallery_items` | Home preview and Gallery |
| Departments and their subjects | `departments` | Home and Academics |
| Values | `school_values` | About |
| Admission steps | `admission_steps` | Admissions |
| Term dates and calendar | `term_dates` | Home, Academics, footer |
| Class fee schedule | `class_fee_structures` | Home (first four classes), Academics, Admissions, prospectus PDF |
| Pupil and staff figures | `students`, `profiles` (counts only) | Home counters and closing line |
| Staff directory | `profiles` (name, role, class, subjects, qualification) | About |
| Report letterheads | `school_information` | Report cards and the prospectus PDF |

Run [`supabase/schema.sql`](./supabase/schema.sql) once to create these tables (and the portal
tables) with their row-level security policies: the website reads with the anon key, and only the
service role writes. Rows are inserted by the school, either in the Supabase table editor, with the
example `insert` at the foot of the schema file, or — for everything under *school_information* —
from the portal itself. Until the `school_information` row and the content tables are filled, the
live site will show empty states.

**Publishing from the portal.** The Super Administrator's **School particulars** tab edits every
field of the `school_information` row — name, motto, year founded, introduction, highlights,
telephone numbers, email addresses, GPS and postal addresses, office and tour hours, headmaster name,
title and welcome, current semester and next reopening — with a live preview of how the masthead
will read and a count of how many particulars are published. Saving writes the row with the service
role and the website picks it up on the next visit. Without a connected database the editor says so
plainly, listing the variables to set, rather than pretending the website was updated.

**Design note: no stock photography.** The website ships no photographs of its own. Every hero, page
banner, panel and backdrop is drawn by `src/components/site/GradientArt.tsx` — layered gradients in
the school colours, a slow drift of the colour field, the grid motif and the crest as a watermark —
so there is nothing to load over the network and no picture of another school on the page.
Photographs published by the office (the `gallery_items` table) still appear in the gallery.

---

## Passport photographs

Two forms capture a photograph, both using the same camera field (`src/components/ui/PhotoCapture.tsx`):

- **Teaching applications** (`/register/teacher`) — the applicant's passport photograph is required
  and is kept with the application. When the Headmaster approves it, the photograph is copied to the
  staff record and appears in the staff directory.
- **Admissions** (Administration → **Admissions** tab) — the office takes the pupil's photograph
  while enrolling them. It is stored on the pupil's record, shown in the pupil register, on the
  class teacher's mark sheet and on the report card.

Pictures are centre-cropped to a square, scaled down (480 px for staff, 420 px for pupils) and stored
as a JPEG data URL with the school's own records. Only small inline images are accepted by the API.
Cameras need a secure connection (https or localhost); where a camera is unavailable the file upload
works just as well.

---

## Design and motion

- A **welcome gate** plays the first time the site is opened in a session: the crest, the school
  name, a progress bar and the welcome message, then the site fades in. It does not play again while
  the tab stays open.
- The home page puts the **welcome message over the school's own gradient field**, with counters
  that count up when scrolled into view and a marquee of the school's particulars.
- Shared motion lives in `src/app/globals.css` (keyframes and utilities such as `animate-fade-up`,
  `animate-gradient-pan`, `card-lift`, `shine`). `src/components/site/Reveal.tsx` fades sections in as
  they scroll into view, and `src/components/site/CountUp.tsx` animates the figures.
- The parents' area has its own shell and wording, separate from the staff portal, because parents
  are not members of staff.
- The portal is laid out with a **sidebar of side tabs** (`src/components/portal/PortalShell.tsx`):
  collapsible on the desktop, a drawer on a phone, with the semester, pupil count and pending
  application count beside the signed-in member of staff.
- Everything respects the browser's *reduce motion* setting: animations are reduced to nothing when
  the reader has asked for less movement.

---

## Report cards as PDF

Report cards are produced as real PDF files, built by a small PDF writer in `src/lib/pdf.ts` that
needs no external library. Each card carries the school heading and motto, pupil details, the
subject table (continuous assessment out of 30, examination out of 70, total, grade, remarks and
subject teacher), the summary strip, teacher and headmaster remarks, fee clearance and the grading
key, with a signature block at the foot.

Two ways to obtain them:

- **Download PDF** in the portal saves the selected pupil's card.
- **Print** uses the browser's print dialogue, which also offers "Save as PDF".

Server-side, `GET /api/reports/:studentId/pdf` returns the same document (any signed-in member of
staff), and `GET /api/reports/class/pdf?className=JHS+3` returns a whole class, one pupil per page.
A prospectus for parents is generated the same way from `/admissions`.

---

## Staff accounts

Passwords are stored as scrypt hashes in the school records and are never sent to the browser.
Sessions are signed cookies that expire after eight hours of use.

The school is issued with two bootstrap accounts and no other staff records. Change both
passwords after the first sign-in:

| Role | Email | First password |
| --- | --- | --- |
| Super Administrator (proprietor) | `owner@sttheresa-aubyn.edu.gh` | `Theresa@1988` |
| Administrator (Headmaster) | `headmaster@sttheresa-aubyn.edu.gh` | `Campus@1988` |

The rest of the staff are added by the office: teachers apply through `/register/teacher` and the
Headmaster approves the application, after which the applicant signs in with the password they
chose. Five failed sign-in attempts from one address hold further attempts for ten minutes. Anyone
may change their own password.

### Managing accounts

**Super Administrator → Pupils, staff & appointments** is the staff roll, with a search box across
name, email, staff number, class, qualification and subjects, and filters by role. From here the
Super Administrator can:

- **Add a member of staff** — name, email, telephone, role (teacher, administrator or super
  administrator), class, subjects and qualification. The account is created with a password shown
  once, to be handed over in person and changed at the first sign-in.
- **Correct an account's details** — including its role and class.
- **Reset a password** — a fresh password is issued and shown once.
- **Suspend an account and reinstate it.** A suspended account cannot sign in; its records remain.

Every change is written to the audit trail, and each row carries a badge saying whether the account
signs in through Supabase Auth or with the portal's own password.

### Supabase Auth

When a Supabase project is connected, staff sign in through **Supabase Auth** rather than the
portal's own password check, and the `auth_user_id` on the staff record links the two:

1. Enable **Email** under Authentication → Providers in the Supabase dashboard.
2. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`
   in the deployment. The service-role key is read on the server only and is what lets the portal
   create accounts, set passwords and suspend users through the Supabase admin API.
3. Run the v1.3.0 section of [`supabase/schema.sql`](./supabase/schema.sql), which adds
   `profiles.auth_user_id` and a trigger that mirrors a Supabase Auth user's name, staff number and
   role onto the school record.

Accounts created, edited, suspended or password-reset in the staff directory are applied to
Supabase Auth at the same time. The portal's own scrypt passwords remain as a fallback: if Supabase
declines a sign-in — for example for one of the two bootstrap accounts, which exist only in the
portal — the same credentials are then checked against the school's record, so connecting the
database never locks the office out. A password changed by a member of staff is written to both.

### Signing in without Supabase

Without a database the portal is self-contained: accounts live on the server, passwords are scrypt
hashes, and the office issues and resets them from the staff directory. Set a long random
`AUTH_SECRET` in production so that session cookies cannot be forged.

---

## School records

The portal keeps one set of records covering staff, teaching applications, admission applications,
class fee structures, pupils, fee payments and receipts, the daily feeding register, subject marks,
parent enquiries and an activity record. Parent access PINs are held as scrypt hashes against the
pupil's record, and never leave the server.

- **Default (no setup):** records are held on the server, so the school can start work at once.
- **Hosted database (optional):** set the Supabase variables below, then run
  [`supabase/schema.sql`](./supabase/schema.sql) in the database's SQL editor to create the tables
  and row-level security policies. The portal writes to both, and the public website reads its
  published content from the `school_information`, `site_notices`, `history_milestones`,
  `gallery_items`, `departments`, `school_values`, `admission_steps` and `term_dates` tables.

The store lives at `/tmp/st-theresa-aubyn-state-v2.json` when no database is configured, which is
suitable for a single server but not for a fleet of them.

---

## Running the project

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run typecheck  # TypeScript
npm start          # serve the production build
```

Environment variables (copy `.env.example` to `.env.local`):

```env
# Optional — leave blank to keep records on the server
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Required in production — signs staff session cookies
AUTH_SECRET=
```

---

## How it is built

- **Next.js 14** (App Router) with **TypeScript** and **React 18**
- **Tailwind CSS**, school colours defined in `tailwind.config.ts`
- Route handlers under `src/app/api/` for sign-in, pupils, fees, feeding, marks, applications,
  enquiries and PDFs
- `src/lib/auth.ts` — password hashing, staff and parent session cookies, role guards
- `src/lib/pdf.ts` — the PDF writer
- `src/lib/report-pdf.ts` and `src/lib/prospectus-pdf.ts` — the printed documents
- `src/lib/store.ts` — school records, the two bootstrap staff accounts and store migration
- `src/lib/site-data.ts` — reads the website's published content from the database
- `src/lib/school-particulars.ts` — the particulars the office publishes, and how they are mapped
- `src/lib/admissions.ts` — references, searching and the status journey
- `src/lib/supabase/auth.ts` — Supabase Auth for staff, with the service-role admin calls

### Layout

```
src/
  app/
    (site)/           public pages, header and footer, admissions apply page
    (auth)/           sign-in pages (staff and parents) and teaching applications
    portal/           staff portal (sign-in required)
    parents/          parents' area (parent sign-in required)
    api/              route handlers
  components/
    site/             public website components, including GradientArt
    auth/             sign-in, parent sign-in and application forms
    portal/           portal shell, workspace, admissions register, staff directory
    *Dashboard.tsx    the three role workspaces
    ReportCardGenerator.tsx
  lib/                auth, store, site-data, admissions, particulars, Supabase, PDF writers
supabase/schema.sql   optional hosted database schema (v1.3.0 additions at the foot)
```

---

## Notes for the office

- The website's particulars are published under **School particulars** (Super Administrator) once a
  database is connected; everything else the site shows also lives in the database (see
  [Website content](#website-content)).
- Applications sent from `/admissions/apply` arrive under **Administration → Admissions**; search
  the register, move each application on, and use **Enrol child** when a place is accepted. The
  parent kept the reference (`ADM/…`) and can check it on the admissions page.
- A family that has lost its reference, or would rather not sign in with a telephone number, can be
  given an access PIN with the key beside the pupil under **Administration → Admissions**; it is
  shown once and must be handed over in person.
- Fee rates are entered by the Headmaster under **Administration → Fees by class** and appear on the
  public fee table straight away.
- Feeding may be recorded either per pupil and date, or for a whole class in one action.
- Marks are entered per pupil and subject; the grade and remark are worked out from the 30/70 split.
- Report cards cannot be edited after printing, but the remarks and attendance may be corrected in
  the portal before a card is downloaded.
