-- =============================================================================
-- ST THERESA AUBYN MEMORIAL SCHOOL - SCHOOL RECORDS DATABASE (POSTGRESQL)
--
-- Optional. The portal runs on the server's own store out of the box; run this
-- file only if the school wants its records held in a hosted PostgreSQL
-- database (for example Supabase, hosted on Vercel or elsewhere).
-- =============================================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- 1. Role Enum & Status Enums
do $$ begin
  create type user_role as enum ('super_admin', 'headmaster', 'teacher');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type registration_status as enum ('pending', 'approved', 'rejected');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type fee_category as enum ('tuition', 'extra_classes', 'meal_fee');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type feeding_status as enum ('paid', 'exempt', 'unpaid');
exception
  when duplicate_object then null;
end $$;

-- 2. Staff records. Staff sign in through the portal, which stores a scrypt
--    hash of each password in password_hash.
create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  staff_id text unique not null,
  full_name text not null,
  email text unique not null,
  phone text not null,
  role user_role not null default 'teacher',
  assigned_class text,
  subjects text[] default '{}',
  qualification text,
  is_active boolean not null default true,
  password_hash text,
  photo text, -- passport photograph captured at registration (data URL)
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Teacher Registration Requests (Submitted via Teacher Portal, Approved by Headmaster)
create table if not exists public.teacher_registrations (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  email text not null,
  phone text not null,
  qualification text not null,
  requested_class text not null,
  subjects text[] not null default '{}',
  experience_years integer not null default 1,
  statement text,
  password_hash text,
  passport_photo text, -- passport photograph sent with the application (data URL)
  status registration_status not null default 'pending',
  reviewed_by text,
  reviewed_at timestamptz,
  assigned_staff_id text,
  created_at timestamptz not null default now()
);

-- 4. Class Fee Structures (Managed by Headmaster & Super Admin)
-- Covers Student Fees by Class, Extra Classes Fees, and Meal / Feeding Fees
create table if not exists public.class_fee_structures (
  id uuid primary key default uuid_generate_v4(),
  class_name text unique not null,
  department text not null, -- 'Early Childhood', 'Lower Primary', 'Upper Primary', 'Junior High'
  semester text not null default '2026/2027 - First Semester',
  tuition_fee numeric(10, 2) not null default 0,
  extra_classes_fee numeric(10, 2) not null default 0,
  daily_meal_fee numeric(10, 2) not null default 0,
  semester_meal_fee numeric(10, 2) not null default 0,
  ict_and_books_fee numeric(10, 2) not null default 0,
  class_teacher text,
  updated_by text not null default 'Headmaster',
  updated_at timestamptz not null default now()
);

-- 5. Students Roster Table
create table if not exists public.students (
  id uuid primary key default uuid_generate_v4(),
  student_code text unique not null,
  full_name text not null,
  gender text not null check (gender in ('Male', 'Female')),
  date_of_birth date,
  class_name text not null references public.class_fee_structures(class_name) on update cascade,
  guardian_name text not null,
  guardian_phone text not null,
  photo text, -- passport photograph taken at enrolment (data URL)
  tuition_paid numeric(10, 2) not null default 0,
  extra_classes_paid numeric(10, 2) not null default 0,
  meal_fee_paid numeric(10, 2) not null default 0,
  attendance_present integer not null default 62,
  attendance_total integer not null default 65,
  conduct text not null default 'Exemplary & Respectful',
  interest_talent text not null default 'STEM & Debate',
  teacher_remark text not null default 'Shows commendable diligence and active class participation.',
  headmaster_remark text not null default 'A promising scholar; keep striving for excellence.',
  report_endorsed boolean not null default true,
  created_at timestamptz not null default now()
);

-- 6. Student Fee Payments Ledger (Tuition, Extra Classes, Meal Fee Prepayments)
create table if not exists public.fee_payments (
  id uuid primary key default uuid_generate_v4(),
  receipt_no text unique not null,
  student_id uuid not null references public.students(id) on delete cascade,
  student_name text not null,
  class_name text not null,
  category fee_category not null,
  amount numeric(10, 2) not null check (amount > 0),
  payment_method text not null default 'Cash / Mobile Money',
  payment_date date not null default current_date,
  recorded_by text not null,
  notes text,
  created_at timestamptz not null default now()
);

-- 7. Daily Feeding Fee Collections (Logged by Teachers by Student Name and Date)
create table if not exists public.daily_feeding_logs (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references public.students(id) on delete cascade,
  student_name text not null,
  class_name text not null,
  collection_date date not null default current_date,
  amount numeric(10, 2) not null default 0,
  status feeding_status not null default 'paid',
  payment_method text not null default 'Cash',
  logged_by_teacher text not null,
  notes text,
  created_at timestamptz not null default now(),
  unique(student_id, collection_date)
);

-- 8. Academic Results (Entered by Teachers for End-of-Semester Reports)
create table if not exists public.academic_results (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references public.students(id) on delete cascade,
  student_name text not null,
  class_name text not null,
  semester text not null default '2026/2027 - First Semester',
  subject text not null,
  class_score numeric(5, 2) not null check (class_score >= 0 and class_score <= 30),
  exam_score numeric(5, 2) not null check (exam_score >= 0 and exam_score <= 70),
  total_score numeric(5, 2) generated always as (class_score + exam_score) stored,
  grade text not null,
  remark text not null,
  entered_by text not null,
  updated_at timestamptz not null default now(),
  unique(student_id, semester, subject)
);

-- 9. Public Contact Inquiries
create table if not exists public.contact_inquiries (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  email text not null,
  phone text not null,
  subject text not null,
  child_class text,
  message text not null,
  status text not null default 'unread',
  created_at timestamptz not null default now()
);

-- 10. Audit Logs (Full Visibility for Super Admin)
create table if not exists public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  actor_name text not null,
  actor_role user_role not null,
  action text not null,
  category text not null,
  details text not null,
  created_at timestamptz not null default now()
);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================
alter table public.profiles enable row level security;
alter table public.teacher_registrations enable row level security;
alter table public.class_fee_structures enable row level security;
alter table public.students enable row level security;
alter table public.fee_payments enable row level security;
alter table public.daily_feeding_logs enable row level security;
alter table public.academic_results enable row level security;
alter table public.contact_inquiries enable row level security;
alter table public.audit_logs enable row level security;

-- Read access for authenticated portal operations and service role
create policy "Allow public read on fee structures" on public.class_fee_structures
  for select using (true);

create policy "Allow public insert on teacher registrations" on public.teacher_registrations
  for insert with check (true);

create policy "Allow public insert on contact inquiries" on public.contact_inquiries
  for insert with check (true);

create policy "Allow service and authenticated full access to profiles" on public.profiles
  for all using (true) with check (true);

create policy "Allow service and authenticated full access to registrations" on public.teacher_registrations
  for all using (true) with check (true);

create policy "Allow service and authenticated full access to class fees" on public.class_fee_structures
  for all using (true) with check (true);

create policy "Allow service and authenticated full access to students" on public.students
  for all using (true) with check (true);

create policy "Allow service and authenticated full access to fee payments" on public.fee_payments
  for all using (true) with check (true);

create policy "Allow service and authenticated full access to feeding logs" on public.daily_feeding_logs
  for all using (true) with check (true);

create policy "Allow service and authenticated full access to academic results" on public.academic_results
  for all using (true) with check (true);

create policy "Allow service and authenticated full access to contact inquiries" on public.contact_inquiries
  for all using (true) with check (true);

create policy "Allow service and authenticated full access to audit logs" on public.audit_logs
  for all using (true) with check (true);

-- -----------------------------------------------------------------------------
-- Passport photographs. Added for schools that had already run this file: the
-- three statements below are safe to run again on an existing database.
-- -----------------------------------------------------------------------------
alter table public.profiles add column if not exists photo text;
alter table public.teacher_registrations add column if not exists passport_photo text;
alter table public.students add column if not exists photo text;

-- =============================================================================
-- WEBSITE CONTENT
--
-- The public website reads these tables with the anon key and writes nothing.
-- The school's own staff publish through the portal (service role) only.
-- Every table is optional: where a table is missing or empty the website shows
-- its "nothing published yet" placeholder instead of inventing particulars.
-- =============================================================================

-- 11. School Information (one row; the website's masthead, contacts and welcome)
create table if not exists public.school_information (
  id integer primary key default 1 check (id = 1),
  school_name text,
  motto text,
  about_summary text,
  digital_address text,
  founded_year integer,
  highlights text[] not null default '{}',
  tour_hours text,
  office_hours text,
  main_phone text,
  headmaster_phone text,
  bursary_phone text,
  general_email text,
  headmaster_email text,
  owner_email text,
  postal_address text,
  headmaster_name text,
  headmaster_title text,
  headmaster_message text,
  current_semester text,
  next_reopening text,
  updated_at timestamptz not null default now()
);

-- 12. Notices for parents (published flag controls what the website shows)
create table if not exists public.site_notices (
  id uuid primary key default uuid_generate_v4(),
  date_label text not null,
  title text not null,
  body text not null default '',
  tag text not null default 'Notice',
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- 13. History milestones (About → the school's timeline)
create table if not exists public.history_milestones (
  id uuid primary key default uuid_generate_v4(),
  year text not null,
  era_title text,
  headline text not null default '',
  description text not null default '',
  highlight_metric text,
  icon_name text,
  sort_order integer not null default 0
);

-- 14. Gallery photographs (ordered on the site as each was added)
create table if not exists public.gallery_items (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  category text not null default 'Campus & Heritage',
  image_url text not null,
  caption text not null default '',
  date_label text,
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- 15. Academic departments (About and Academics pages)
create table if not exists public.departments (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  classes text,
  subjects text[] not null default '{}',
  note text,
  sort_order integer not null default 0
);

-- 16. The school's values (About page)
create table if not exists public.school_values (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  body text not null default '',
  sort_order integer not null default 0
);

-- 17. Admission steps (Admissions page)
create table if not exists public.admission_steps (
  id uuid primary key default uuid_generate_v4(),
  step text not null,
  title text not null,
  body text not null default '',
  sort_order integer not null default 0
);

-- 18. Term dates and school calendar (Home, Academics and the footer)
create table if not exists public.term_dates (
  id uuid primary key default uuid_generate_v4(),
  label text not null,
  detail text not null,
  sort_order integer not null default 0
);

-- -----------------------------------------------------------------------------
-- Row level security: the website (anon) may read; only the service role writes.
-- -----------------------------------------------------------------------------
alter table public.school_information enable row level security;
alter table public.site_notices enable row level security;
alter table public.history_milestones enable row level security;
alter table public.gallery_items enable row level security;
alter table public.departments enable row level security;
alter table public.school_values enable row level security;
alter table public.admission_steps enable row level security;
alter table public.term_dates enable row level security;

create policy "Public read school information" on public.school_information
  for select using (true);
create policy "Public read site notices" on public.site_notices
  for select using (true);
create policy "Public read history milestones" on public.history_milestones
  for select using (true);
create policy "Public read gallery items" on public.gallery_items
  for select using (true);
create policy "Public read departments" on public.departments
  for select using (true);
create policy "Public read school values" on public.school_values
  for select using (true);
create policy "Public read admission steps" on public.admission_steps
  for select using (true);
create policy "Public read term dates" on public.term_dates
  for select using (true);

create policy "Service role writes school information" on public.school_information
  for all to service_role using (true) with check (true);
create policy "Service role writes site notices" on public.site_notices
  for all to service_role using (true) with check (true);
create policy "Service role writes history milestones" on public.history_milestones
  for all to service_role using (true) with check (true);
create policy "Service role writes gallery items" on public.gallery_items
  for all to service_role using (true) with check (true);
create policy "Service role writes departments" on public.departments
  for all to service_role using (true) with check (true);
create policy "Service role writes school values" on public.school_values
  for all to service_role using (true) with check (true);
create policy "Service role writes admission steps" on public.admission_steps
  for all to service_role using (true) with check (true);
create policy "Service role writes term dates" on public.term_dates
  for all to service_role using (true) with check (true);

-- -----------------------------------------------------------------------------
-- Publishing content. Replace the values with the school's own particulars and
-- run the insert once; the website picks it up on the next request.
-- -----------------------------------------------------------------------------
-- insert into public.school_information (id, school_name, about_summary, current_semester)
-- values (1, 'St Theresa Aubyn Memorial School', 'A short welcome to parents.', '2026/2027 - First Semester')
-- on conflict (id) do update set
--   school_name = excluded.school_name,
--   about_summary = excluded.about_summary,
--   current_semester = excluded.current_semester,
--   updated_at = now();
