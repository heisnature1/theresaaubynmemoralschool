# St. Teresa Aubyn Memorial School — Website & Role-Based Management Portal

A complete, modern school management website and role-based cloud portal for **St. Teresa Aubyn Memorial School**, engineered with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase** for seamless hosting on **Vercel**.

---

## ✨ Key Features

### 1. Public Website (Emerald Green & Imperial Gold Aesthetic)
- **Public Homepage & Hero**: Modern emerald-green (`#09392A`) and imperial-gold (`#D9AF37`) design with smooth animations, institutional metrics, and direct role-portal launchers.
- **Our History & Heritage (`#history`)**: Interactive timeline chronicling the school's founding on October 2, 1988, in honor of Late Madam Teresa Aubyn through its 2026 cloud transformation.
- **Live Class Fee & Academic Stream Preview (`#academics`)**: Real-time display of Early Childhood, Lower Primary, Upper Primary, and Junior High fee schedules.
- **Interactive Image Gallery (`#gallery`)**: Filterable campus photography across *Campus & Heritage*, *STEM & Academics*, *Sports & Culture*, and *Student Life & Dining* with a full-screen Lightbox modal.
- **Contact Details & Admissions Inquiry (`#contact`)**: Official postal/GPS address, telephone directory, emails, visiting hours, and an interactive inquiry form connected to `/api/contact`.

---

### 2. Three Role-Based Dashboards (`/portal` or Instant Header Switcher)

1. **Super Admin Dashboard (School Owner — Full Visibility)**
   - Complete institutional visibility across all revenue streams (Class Tuition, Afternoon Extra Classes, Semester Meal Plans, and Daily Feeding Cash Collections).
   - Class-by-class financial & academic health matrix (`KG 1` through `JHS 3`).
   - Real-time **System Audit Log** tracking all Headmaster and Teacher actions.
   - Student enrollment form, full staff directory, owner override for teacher approvals, public inquiry inbox, and Supabase Cloud status inspector.

2. **Headmaster Dashboard**
   - **Manage Student Fees by Class, Extra Classes & Meal Fees**: Interactive rate configurator for every class (`KG 1`–`JHS 3`) covering Class Tuition Fee, Extra Classes Fee, Daily Meal Fee, Semester Meal Plan, and ICT/Books levy.
   - **Student Fee Collections & Receipts**: Record payments (`tuition`, `extra_classes`, `meal_fee`) and issue official receipts (`STA-RCP-2026-...`).
   - **Approve Teacher Registrations**: Review pending Teacher Sign-Up Requests submitted via the Teacher Portal, assign classes, and approve/decline with automatic Staff ID generation (`STA-TCH-...`).
   - **End-of-Semester Report Endorsements**: Review student academic performance and customize Headmaster remarks.

3. **Teacher Portal**
   - **Enter Student Results**: Record Continuous Assessment (`Class Score` out of 30) and `Exam Score` (out of 70) with automatic calculation of Total (`100%`), Grade (`A1`–`F9`), and Proficiency Remark.
   - **Log Daily Feeding Fee Collections by Student Name & Date**: Select any date and student name (or use the 1-click class roll-call table / batch class marker) to log daily feeding fees (`Paid`, `Exempt`, `Unpaid`) by payment method (`Cash`, `Mobile Money`, `Prepaid Meal Card`).
   - **Submit Teacher Sign-Up Requests**: Onboarding application form for new educators that routes directly to the Headmaster's approval queue.
   - **Generate End-of-Semester Reports**: Preview, customize remarks/attendance, export CSV, and print official terminal report cards.

---

## 🛠️ Tech Stack & TypeScript Backend

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons
- **Backend API Routes (TypeScript)**:
  - `GET / POST /api/school` — Full school state snapshot, student enrollment, and demo state reset
  - `PATCH / POST /api/fees` — Class fee structure management (Tuition, Extra Classes, Meal Fees) & student payment receipts
  - `POST / PATCH /api/teachers` — Teacher sign-up request submission & Headmaster approval workflow
  - `POST /api/feeding` — Single & batch daily feeding fee collection logging by student name and date
  - `POST / PATCH /api/results` — Student subject result entry (30% CA + 70% Exam) & terminal report remark updates
  - `POST / PATCH /api/contact` — Public contact & admissions inquiry submissions
- **Database**: Supabase PostgreSQL (`@supabase/supabase-js`, `@supabase/ssr`) with automatic fallback to a persistent server store when running in preview mode without external credentials.

---

## 🚀 Deploying to Vercel & Connecting Supabase

1. **Create a Supabase Project**:
   - Open the Supabase SQL Editor and run [`supabase/schema.sql`](./supabase/schema.sql) to create all tables, enums, and Row-Level Security (RLS) policies.
2. **Configure Environment Variables on Vercel**:
   - Copy `.env.example` to `.env.local` (or add in Vercel Project Settings → Environment Variables):
     ```env
     NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
     SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
     ```
3. **Run Locally**:
   ```bash
   npm install
   npm run dev
   ```
