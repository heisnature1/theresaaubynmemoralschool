# St. Teresa Aubyn Memorial School — Website & Staff Portal

[![Production Deployment](https://img.shields.io/badge/Production-Live-success)](https://theresaaubynmemoralschool.vercel.app)
[![Version](https://img.shields.io/badge/Version-1.1.0-blue)](https://github.com/heisnature1/theresaaubynmemoralschool)

**Production Website:** [https://theresaaubynmemoralschool.vercel.app](https://theresaaubynmemoralschool.vercel.app)

The public website and the staff records system for **St. Teresa Aubyn Memorial School**, a day
school for KG 1 to JHS 3 founded in 1988.

The website carries the school's notices, term dates, academic programme, fee schedule, admissions
information, photo gallery and enquiry form. Behind it sits a staff portal where the Headmaster and
the Bursary keep the fee books, class teachers enter marks and the daily feeding register, and
report cards are printed or downloaded as PDFs.

---

## The pages

**Public website** (`/`)

| Page | Address | What is on it |
| --- | --- | --- |
| Home | `/` | School introduction, notices for parents, term dates, headmaster's welcome, departments, fees at a glance |
| About the school | `/about` | History and the memorial, values, leadership and the teaching staff |
| Academics & fees | `/academics` | Departments, assessment method, grading key, the full fee schedule, extra classes, the feeding programme, calendar |
| Admissions | `/admissions` | The four steps, documents required, assessment for older applicants, FAQs, downloadable prospectus (PDF) |
| Gallery | `/gallery` | Photographs of the compound, filterable by category |
| Contact | `/contact` | Telephone numbers, email addresses, hours, directions and an enquiry form |

**Sign-in pages** (`/login/...`)

| Page | Address | Who uses it |
| --- | --- | --- |
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
| School overview | `/portal/super-admin` | Income by stream, fees outstanding by class, pupils registered, staff, teaching applications, parent enquiries and a record of who changed what |
| Administration | `/portal/administrator` | Fee schedule by class, fee payments and receipts, **admissions (enrol a pupil with a photograph)**, teaching applications, report endorsements |
| Class teacher | `/portal/teacher` | Continuous assessment and exam marks, the daily feeding register by pupil and date, report cards, password change |
| Report cards | `/portal/reports` | Report cards for any pupil, with a PDF download and a print view |

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
- The home page puts the **welcome message over the campus photograph**, with a slow zoom on the
  image, counters that count up when scrolled into view and a marquee of the school's particulars.
- Shared motion lives in `src/app/globals.css` (keyframes and utilities such as `animate-fade-up`,
  `animate-ken-burns`, `card-lift`, `shine`). `src/components/site/Reveal.tsx` fades sections in as
  they scroll into view, and `src/components/site/CountUp.tsx` animates the figures.
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

The accounts created with the school, printed here for the office to change after the first
sign-in:

| Role | Email | First password |
| --- | --- | --- |
| Super Administrator | `owner@stteresa-aubyn.edu.gh` | `Teresa@1988` |
| Administrator (Headmaster) | `headmaster@stteresa-aubyn.edu.gh` | `Campus@1988` |
| Teacher | `e.oseitutu@stteresa-aubyn.edu.gh` | `Teacher@2026` |

Every other teacher on the seeded staff list may sign in with `Staff@2026` and should change it at
once from **My account**. Five failed sign-in attempts from one address hold further attempts for
ten minutes. Anyone may change their own password; a forgotten password is reset by the Super
Administrator from the staff directory.

Set a long random `AUTH_SECRET` in production so that session cookies cannot be forged.

---

## School records

The portal keeps one set of records covering staff, teaching applications, class fee structures,
pupils, fee payments and receipts, the daily feeding register, subject marks, parent enquiries and
an activity record.

- **Default (no setup):** records are held on the server, so the school can start work at once.
- **Hosted database (optional):** set the Supabase variables below, then run
  [`supabase/schema.sql`](./supabase/schema.sql) in the database's SQL editor to create the tables
  and row-level security policies. The portal writes to both.

The store lives at `/tmp/st-teresa-aubyn-state-v2.json` when no database is configured, which is
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
- `src/lib/auth.ts` — password hashing, session cookies, role guards
- `src/lib/pdf.ts` — the PDF writer
- `src/lib/report-pdf.ts` and `src/lib/prospectus-pdf.ts` — the printed documents
- `src/lib/store.ts` — school records and the seeded first-run data

### Layout

```
src/
  app/
    (site)/           public pages, header and footer
    (auth)/           sign-in pages and teaching applications
    portal/           staff portal (sign-in required)
    api/              route handlers
  components/
    site/             public website components
    auth/             sign-in and application forms
    portal/           portal shell and workspace
    *Dashboard.tsx    the three role workspaces
    ReportCardGenerator.tsx
  lib/                auth, store, grading, PDF writers
supabase/schema.sql   optional hosted database schema
```

---

## Notes for the office

- Fee rates are entered by the Headmaster under **Administration → Fees by class** and appear on the
  public fee table straight away.
- Feeding may be recorded either per pupil and date, or for a whole class in one action.
- Marks are entered per pupil and subject; the grade and remark are worked out from the 30/70 split.
- Report cards cannot be edited after printing, but the remarks and attendance may be corrected in
  the portal before a card is downloaded.
