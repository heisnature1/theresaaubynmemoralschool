'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Award,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  Cpu,
  Eye,
  FileSpreadsheet,
  Globe,
  GraduationCap,
  HeartHandshake,
  Image as ImageIcon,
  Landmark,
  Layers,
  Lock,
  Mail,
  MapPin,
  Menu,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  UserCheck,
  UserPlus,
  Users,
  Utensils,
  X,
  ZoomIn,
} from 'lucide-react';
import {
  GalleryItem,
  SchoolStateSnapshot,
  UserRole,
} from '@/types/school';
import { SCHOOL_HISTORY_MILESTONES } from '@/lib/constants';
import { formatCurrency, SCHOOL_CLASSES } from '@/lib/grading';
import { SchoolCrest } from './SchoolCrest';
import { SuperAdminDashboard } from './SuperAdminDashboard';
import { HeadmasterDashboard } from './HeadmasterDashboard';
import { TeacherDashboard } from './TeacherDashboard';
import { ReportCardGenerator } from './ReportCardGenerator';

interface SchoolPlatformProps {
  initialState: SchoolStateSnapshot;
  defaultMode?: 'public' | 'portal';
  defaultRole?: UserRole;
}

export function SchoolPlatform({
  initialState,
  defaultMode = 'public',
  defaultRole = 'super_admin',
}: SchoolPlatformProps) {
  const [state, setState] = useState<SchoolStateSnapshot>(initialState);
  const [viewMode, setViewMode] = useState<'public' | 'portal' | 'reports_standalone'>(
    defaultMode
  );
  const [activeRole, setActiveRole] = useState<UserRole>(defaultRole);
  const [teacherInitialTab, setTeacherInitialTab] = useState<
    'results' | 'feeding' | 'signup' | 'reports'
  >('results');
  const [headmasterInitialTab, setHeadmasterInitialTab] = useState<
    'class_fees' | 'student_payments' | 'approvals' | 'reports'
  >('class_fees');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'info';
  } | null>(null);

  function showToast(message: string, type: 'success' | 'info' = 'success') {
    setToast({ message, type });
  }

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(timer);
  }, [toast]);

  // Gallery Filter & Lightbox state
  const [galleryCategory, setGalleryCategory] = useState<string>('All');
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  const filteredGallery = useMemo(() => {
    if (galleryCategory === 'All') return state.gallery;
    return state.gallery.filter((g) => g.category === galleryCategory);
  }, [state.gallery, galleryCategory]);

  // Public Contact Form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactSubject, setContactSubject] = useState(
    'Admissions & Campus Tour Inquiry'
  );
  const [contactClass, setContactClass] = useState('Basic 1');
  const [contactMessage, setContactMessage] = useState('');
  const [sendingContact, setSendingContact] = useState(false);

  async function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) return;
    setSendingContact(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: contactName,
          email: contactEmail,
          phone: contactPhone,
          subject: contactSubject,
          childClass: contactClass,
          message: contactMessage,
        }),
      });
      const data = await res.json();
      if (data.ok && data.state) {
        setState(data.state);
        setContactName('');
        setContactEmail('');
        setContactPhone('');
        setContactMessage('');
        showToast(
          'Thank you! Your message has been received by the St. Teresa Administration Office.'
        );
      }
    } finally {
      setSendingContact(false);
    }
  }

  function launchPortalRole(
    role: UserRole,
    options?: {
      teacherTab?: 'results' | 'feeding' | 'signup' | 'reports';
      headmasterTab?: 'class_fees' | 'student_payments' | 'approvals' | 'reports';
    }
  ) {
    setActiveRole(role);
    if (options?.teacherTab) setTeacherInitialTab(options.teacherTab);
    if (options?.headmasterTab) setHeadmasterInitialTab(options.headmasterTab);
    setViewMode('portal');
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const pendingTeacherCount = state.teacherRegistrations.filter(
    (r) => r.status === 'pending'
  ).length;

  return (
    <div className="min-h-screen flex flex-col bg-teresa-ivory text-slate-900 selection:bg-teresa-gold-300 selection:text-teresa-green-950">
      {/* Live Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md animate-slide-up print:hidden">
          <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-teresa-green-950 text-white border-2 border-teresa-gold-400 shadow-2xl">
            <CheckCircle2 className="w-5 h-5 text-teresa-gold-400 shrink-0" />
            <div className="text-sm font-medium leading-snug">{toast.message}</div>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-white ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Top Announcement Ribbon */}
      <div className="bg-teresa-green-950 text-emerald-100 border-b border-teresa-gold-500/30 text-xs py-2 px-4 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teresa-gold-400 text-teresa-green-950 font-extrabold text-[10px] uppercase">
              <Sparkles className="w-3 h-3" />
              {state.currentSemester}
            </span>
            <span className="hidden sm:inline text-emerald-100/90">
              St. Teresa Aubyn Memorial School • Hosted on Vercel & Connected to Supabase TypeScript Backend
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <a
              href="tel:+233244100888"
              className="hover:text-teresa-gold-300 flex items-center gap-1 transition"
            >
              <Phone className="w-3 h-3 text-teresa-gold-400" />
              +233 24 410 0888
            </a>
            <span className="text-emerald-700">|</span>
            <button
              type="button"
              onClick={() => launchPortalRole('teacher', { teacherTab: 'signup' })}
              className="text-teresa-gold-300 hover:underline font-semibold flex items-center gap-1"
            >
              <UserPlus className="w-3 h-3" />
              Teacher Sign-Up Request
            </button>
          </div>
        </div>
      </div>

      {/* Main Sticky Navigation Header */}
      <header className="sticky top-0 z-40 bg-teresa-green-900/95 backdrop-blur-md text-white border-b border-teresa-gold-400/30 shadow-lg print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Brand Crest & School Name */}
          <button
            type="button"
            onClick={() => {
              setViewMode('public');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-3 text-left group"
          >
            <SchoolCrest
              size="md"
              className="group-hover:scale-105 transition-transform duration-300"
            />
            <div>
              <div className="text-lg sm:text-xl font-serif font-bold tracking-tight text-white group-hover:text-teresa-gold-300 transition">
                ST. TERESA AUBYN
              </div>
              <div className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-teresa-gold-300 font-semibold -mt-0.5">
                Memorial School • Est. 1988
              </div>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-6 text-sm font-medium text-emerald-100">
            <button
              type="button"
              onClick={() => {
                setViewMode('public');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`hover:text-teresa-gold-300 transition ${
                viewMode === 'public' ? 'text-teresa-gold-300 font-bold' : ''
              }`}
            >
              Home
            </button>
            <a
              href="#history"
              onClick={() => setViewMode('public')}
              className="hover:text-teresa-gold-300 transition"
            >
              Our History
            </a>
            <a
              href="#academics"
              onClick={() => setViewMode('public')}
              className="hover:text-teresa-gold-300 transition"
            >
              Fees & Academics
            </a>
            <a
              href="#gallery"
              onClick={() => setViewMode('public')}
              className="hover:text-teresa-gold-300 transition"
            >
              Image Gallery
            </a>
            <a
              href="#contact"
              onClick={() => setViewMode('public')}
              className="hover:text-teresa-gold-300 transition"
            >
              Contact Details
            </a>
            <button
              type="button"
              onClick={() => {
                setViewMode('reports_standalone');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`inline-flex items-center gap-1.5 hover:text-teresa-gold-300 transition ${
                viewMode === 'reports_standalone' ? 'text-teresa-gold-300 font-bold' : ''
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-teresa-gold-400" />
              Semester Reports
            </button>
          </nav>

          {/* Role-Based Portal Switcher Pills */}
          <div className="hidden md:flex items-center gap-2">
            <div className="bg-teresa-green-950/90 p-1.5 rounded-2xl border border-teresa-gold-400/40 flex items-center gap-1">
              <button
                type="button"
                onClick={() => launchPortalRole('super_admin')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'portal' && activeRole === 'super_admin'
                    ? 'bg-teresa-gold-400 text-teresa-green-950 shadow'
                    : 'text-emerald-100 hover:bg-white/10'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Super Admin
              </button>

              <button
                type="button"
                onClick={() => launchPortalRole('headmaster')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'portal' && activeRole === 'headmaster'
                    ? 'bg-teresa-gold-400 text-teresa-green-950 shadow'
                    : 'text-emerald-100 hover:bg-white/10'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Headmaster
                {pendingTeacherCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px]">
                    {pendingTeacherCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => launchPortalRole('teacher')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'portal' && activeRole === 'teacher'
                    ? 'bg-teresa-gold-400 text-teresa-green-950 shadow'
                    : 'text-emerald-100 hover:bg-white/10'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Teacher Portal
              </button>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2.5 rounded-xl bg-white/10 text-teresa-gold-300 hover:bg-white/20"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-teresa-green-950 border-t border-teresa-gold-400/30 px-4 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setViewMode('public');
                  setMobileMenuOpen(false);
                }}
                className="px-3 py-2 rounded-xl bg-white/5 text-left text-sm font-semibold text-white"
              >
                Public Homepage
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode('reports_standalone');
                  setMobileMenuOpen(false);
                }}
                className="px-3 py-2 rounded-xl bg-white/5 text-left text-sm font-semibold text-teresa-gold-300"
              >
                Semester Reports
              </button>
            </div>

            <div className="border-t border-white/10 pt-3">
              <div className="text-xs uppercase tracking-wider text-teresa-gold-300 font-bold mb-2">
                Launch Role-Based Dashboards
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => launchPortalRole('super_admin')}
                  className="p-3 rounded-xl bg-teresa-gold-400 text-teresa-green-950 font-bold text-xs flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Super Admin (Owner)
                </button>
                <button
                  type="button"
                  onClick={() => launchPortalRole('headmaster')}
                  className="p-3 rounded-xl bg-teresa-green-800 text-white border border-teresa-gold-400/40 font-bold text-xs flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-teresa-gold-300" />
                  Headmaster Portal
                </button>
                <button
                  type="button"
                  onClick={() => launchPortalRole('teacher')}
                  className="p-3 rounded-xl bg-teresa-green-800 text-white border border-teresa-gold-400/40 font-bold text-xs flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-4 h-4 text-teresa-gold-300" />
                  Teacher Portal
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ===================================================================== */}
      {/* MODE A: ROLE-BASED PORTAL DASHBOARDS VIEW                             */}
      {/* ===================================================================== */}
      {viewMode === 'portal' && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Role Switcher Control Bar */}
          <div className="bg-white rounded-2xl border border-teresa-gold-300 p-4 shadow-sm flex flex-wrap items-center justify-between gap-4 print:hidden">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setViewMode('public')}
                className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-700 transition"
              >
                ← Back to Public Website
              </button>
              <div className="hidden sm:block h-5 w-px bg-slate-200" />
              <span className="text-xs font-semibold text-slate-600">
                Switch Active Role Dashboard:
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveRole('super_admin')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeRole === 'super_admin'
                    ? 'bg-teresa-green-900 text-teresa-gold-300 shadow-md ring-2 ring-teresa-gold-400'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Eye className="w-4 h-4" />
                Super Admin (Owner — Full Visibility)
              </button>

              <button
                type="button"
                onClick={() => setActiveRole('headmaster')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeRole === 'headmaster'
                    ? 'bg-teresa-green-900 text-teresa-gold-300 shadow-md ring-2 ring-teresa-gold-400'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Headmaster (Class Fees, Extra, Meals & Approvals)
                {pendingTeacherCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px]">
                    {pendingTeacherCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveRole('teacher')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeRole === 'teacher'
                    ? 'bg-teresa-green-900 text-teresa-gold-300 shadow-md ring-2 ring-teresa-gold-400'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Teacher Portal (Results, Daily Feeding & Sign-Up)
              </button>
            </div>
          </div>

          {/* Render Active Role Dashboard */}
          {activeRole === 'super_admin' && (
            <SuperAdminDashboard
              state={state}
              onStateChange={setState}
              onNotify={showToast}
              onSwitchRole={(r) => setActiveRole(r)}
            />
          )}

          {activeRole === 'headmaster' && (
            <HeadmasterDashboard
              key={headmasterInitialTab}
              state={state}
              onStateChange={setState}
              onNotify={showToast}
              initialTab={headmasterInitialTab}
            />
          )}

          {activeRole === 'teacher' && (
            <TeacherDashboard
              key={teacherInitialTab}
              state={state}
              onStateChange={setState}
              onNotify={showToast}
              initialTab={teacherInitialTab}
            />
          )}
        </main>
      )}

      {/* ===================================================================== */}
      {/* MODE B: STANDALONE END-OF-SEMESTER REPORTS VIEW                       */}
      {/* ===================================================================== */}
      {viewMode === 'reports_standalone' && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div className="flex items-center justify-between print:hidden">
            <button
              type="button"
              onClick={() => setViewMode('public')}
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700"
            >
              ← Return to Homepage
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => launchPortalRole('teacher', { teacherTab: 'results' })}
                className="px-4 py-2 rounded-xl bg-teresa-green-800 text-white text-xs font-bold"
              >
                Enter / Edit Scores in Teacher Portal →
              </button>
            </div>
          </div>

          <ReportCardGenerator
            state={state}
            activeRole={activeRole}
            actorName="St. Teresa Academic Records Office"
            onStateChange={setState}
            onNotify={showToast}
          />
        </main>
      )}

      {/* ===================================================================== */}
      {/* MODE C: PUBLIC WEBSITE (HERO, PORTALS, HISTORY, ACADEMICS, GALLERY, CONTACT) */}
      {/* ===================================================================== */}
      {viewMode === 'public' && (
        <main className="flex-1">
          {/* ----------------------------------------------------------------- */}
          {/* 1. HERO SECTION                                                   */}
          {/* ----------------------------------------------------------------- */}
          <section className="relative bg-gradient-to-br from-teresa-green-950 via-teresa-green-900 to-teresa-green-800 text-white overflow-hidden">
            {/* Decorative Gold Radial Glows */}
            <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-teresa-gold-400/15 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[32rem] h-[32rem] rounded-full bg-teresa-gold-500/10 blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                {/* Left 7 cols: Headline, Motto, CTAs, Key Metrics */}
                <div className="lg:col-span-7 space-y-6 animate-fade-in">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teresa-gold-400/15 border border-teresa-gold-400/40 text-teresa-gold-300 text-xs font-bold uppercase tracking-widest">
                    <Sparkles className="w-3.5 h-3.5 text-teresa-gold-400" />
                    Excellence in Early Childhood, Primary & Junior High Education
                  </div>

                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight leading-[1.12] text-white">
                    Shaping Tomorrow&apos;s{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-teresa-gold-200 via-teresa-gold-400 to-teresa-gold-200">
                      Scholars & Moral Leaders
                    </span>{' '}
                    in Green & Gold.
                  </h1>

                  <p className="text-base sm:text-lg text-emerald-100/90 max-w-2xl leading-relaxed">
                    Welcome to <strong>St. Teresa Aubyn Memorial School</strong>. Founded in 1988 on a proud heritage of academic rigor, character formation, balanced daily student nutrition, and digital innovation.
                  </p>

                  {/* Primary Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3.5 pt-2">
                    <button
                      type="button"
                      onClick={() => launchPortalRole('super_admin')}
                      className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-teresa-gold-400 via-teresa-gold-300 to-teresa-gold-400 text-teresa-green-950 font-extrabold text-sm shadow-xl hover:brightness-105 transition transform hover:-translate-y-0.5"
                    >
                      <Lock className="w-4 h-4" />
                      Launch Role-Based Portal
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setViewMode('reports_standalone')}
                      className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-teresa-gold-400/40 text-white font-bold text-sm backdrop-blur-sm transition"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-teresa-gold-300" />
                      View End-of-Semester Reports
                    </button>

                    <a
                      href="#history"
                      className="inline-flex items-center gap-1.5 px-4 py-3.5 rounded-2xl text-teresa-gold-200 hover:text-white text-sm font-semibold transition"
                    >
                      Explore Our Heritage →
                    </a>
                  </div>

                  {/* Quick Role Switcher Bar inside Hero */}
                  <div className="pt-4 border-t border-white/15">
                    <div className="text-xs uppercase tracking-widest text-teresa-gold-300 font-bold mb-2.5">
                      Direct Access to Role-Based Dashboards:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <button
                        type="button"
                        onClick={() => launchPortalRole('super_admin')}
                        className="p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-teresa-gold-400/30 text-left transition group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-teresa-gold-300 uppercase">
                            1. Super Admin
                          </span>
                          <Eye className="w-4 h-4 text-teresa-gold-300 group-hover:translate-x-0.5 transition" />
                        </div>
                        <div className="text-xs text-white font-semibold mt-0.5">
                          Owner Full Visibility
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => launchPortalRole('headmaster')}
                        className="p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-teresa-gold-400/30 text-left transition group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-teresa-gold-300 uppercase">
                            2. Headmaster
                          </span>
                          <ShieldCheck className="w-4 h-4 text-teresa-gold-300 group-hover:translate-x-0.5 transition" />
                        </div>
                        <div className="text-xs text-white font-semibold mt-0.5">
                          Class Fees & Approvals
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => launchPortalRole('teacher')}
                        className="p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-teresa-gold-400/30 text-left transition group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-teresa-gold-300 uppercase">
                            3. Teacher Portal
                          </span>
                          <BookOpen className="w-4 h-4 text-teresa-gold-300 group-hover:translate-x-0.5 transition" />
                        </div>
                        <div className="text-xs text-white font-semibold mt-0.5">
                          Grades, Feeding & Sign-Up
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right 5 cols: Featured Campus Hero Frame & Floating Badges */}
                <div className="lg:col-span-5 relative">
                  <div className="relative rounded-3xl overflow-hidden border-4 border-teresa-gold-400/80 shadow-2xl group">
                    <img
                      src="/images/campus-hero.jpg"
                      alt="St. Teresa Aubyn Memorial School Campus"
                      className="w-full h-[420px] object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-teresa-green-950/90 via-transparent to-transparent" />
                    <div className="absolute bottom-5 left-5 right-5 text-white">
                      <span className="px-2.5 py-1 rounded-full bg-teresa-gold-400 text-teresa-green-950 text-[11px] font-extrabold uppercase">
                        Main Campus Quadrangle
                      </span>
                      <p className="text-sm font-serif italic text-emerald-100 mt-1.5">
                        &ldquo;Per Ardua Ad Astra — Through Diligence to the Stars&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* Floating Metric Badge Top-Left */}
                  <div className="hidden sm:flex items-center gap-3 bg-white text-slate-900 p-3.5 rounded-2xl shadow-xl border-2 border-teresa-gold-400 absolute -top-5 -left-5 animate-float-slow">
                    <div className="w-10 h-10 rounded-xl bg-teresa-green-900 flex items-center justify-center text-teresa-gold-300">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-extrabold text-teresa-green-950">
                        100% BECE Pass Rate
                      </div>
                      <div className="text-[11px] text-slate-500">
                        38 Years of Academic Distinction
                      </div>
                    </div>
                  </div>

                  {/* Floating Metric Badge Bottom-Right */}
                  <div className="hidden sm:flex items-center gap-3 bg-teresa-green-950 text-white p-3.5 rounded-2xl shadow-xl border-2 border-teresa-gold-400 absolute -bottom-5 -right-4">
                    <div className="w-10 h-10 rounded-xl bg-teresa-gold-400 flex items-center justify-center text-teresa-green-950">
                      <Utensils className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-teresa-gold-300">
                        Daily Tracked Feeding
                      </div>
                      <div className="text-[11px] text-emerald-100">
                        Balanced Hot Meals & Extra Classes
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ----------------------------------------------------------------- */}
          {/* 2. INTERACTIVE ROLE-BASED PORTALS SHOWCASE SECTION                */}
          {/* ----------------------------------------------------------------- */}
          <section className="py-16 bg-white border-b border-teresa-green-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-12">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-teresa-green-100 text-teresa-green-900 text-xs font-extrabold uppercase tracking-wider">
                  <Cpu className="w-3.5 h-3.5 text-teresa-green-700" />
                  Cloud School Management System • TypeScript + Supabase
                </span>
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-teresa-green-950 mt-3">
                  Three Role-Based Portals & Terminal Report Engine
                </h2>
                <p className="text-slate-600 mt-2 text-sm sm:text-base">
                  Purpose-built workflows for the School Owner (Super Admin), the Headmaster, and Class/Subject Teachers—connected in real time.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Card 1: Super Admin (Owner) */}
                <div className="rounded-3xl bg-gradient-to-b from-teresa-green-950 to-teresa-green-900 text-white p-7 border-2 border-teresa-gold-400 shadow-xl flex flex-col justify-between hover:-translate-y-1 transition duration-300">
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <span className="px-3 py-1 rounded-full bg-teresa-gold-400 text-teresa-green-950 text-xs font-extrabold uppercase">
                        Owner Portal
                      </span>
                      <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center text-teresa-gold-300">
                        <Eye className="w-6 h-6" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-white">
                      Super Admin Dashboard
                    </h3>
                    <p className="text-sm text-emerald-100/85 mt-2 leading-relaxed">
                      Designed for the School Owner with <strong>100% full visibility</strong> across all financial streams, class fee schedules, teacher feeding collections, academic results, and audit logs.
                    </p>
                    <ul className="mt-5 space-y-2.5 text-xs text-emerald-100">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-teresa-gold-400 shrink-0" />
                        Real-time Tuition, Extra Classes & Meal Revenue Analytics
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-teresa-gold-400 shrink-0" />
                        Full Audit Log of Headmaster & Teacher actions
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-teresa-gold-400 shrink-0" />
                        Student Enrollment, Staff Directory & Supabase Status
                      </li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => launchPortalRole('super_admin')}
                    className="mt-7 w-full py-3.5 px-4 rounded-xl bg-teresa-gold-400 hover:bg-teresa-gold-300 text-teresa-green-950 font-extrabold text-sm flex items-center justify-center gap-2 transition"
                  >
                    Open Super Admin Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Card 2: Headmaster Portal */}
                <div className="rounded-3xl bg-teresa-ivory p-7 border-2 border-teresa-green-800/20 hover:border-teresa-gold-400 shadow-lg flex flex-col justify-between hover:-translate-y-1 transition duration-300">
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <span className="px-3 py-1 rounded-full bg-teresa-green-900 text-teresa-gold-300 text-xs font-extrabold uppercase">
                        Administration & Bursary
                      </span>
                      <div className="w-11 h-11 rounded-2xl bg-teresa-green-900 flex items-center justify-center text-teresa-gold-300">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-teresa-green-950">
                      Headmaster Dashboard
                    </h3>
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                      Central command for managing <strong>student fees by class, afternoon extra classes, and meal fees</strong>, plus reviewing and approving <strong>Teacher registration requests</strong>.
                    </p>
                    <ul className="mt-5 space-y-2.5 text-xs text-slate-700 font-medium">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-teresa-green-700 shrink-0" />
                        Configure Class Tuition, Extra Classes & Daily Meal Rates
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-teresa-green-700 shrink-0" />
                        Approve Teacher Sign-Up Requests ({pendingTeacherCount} Pending)
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-teresa-green-700 shrink-0" />
                        Record Fee Payments & Endorse Semester Reports
                      </li>
                    </ul>
                  </div>

                  <div className="mt-7 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        launchPortalRole('headmaster', { headmasterTab: 'class_fees' })
                      }
                      className="py-3 px-3 rounded-xl bg-teresa-green-900 hover:bg-teresa-green-950 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      Manage Class Fees
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        launchPortalRole('headmaster', { headmasterTab: 'approvals' })
                      }
                      className="py-3 px-3 rounded-xl bg-teresa-gold-400 hover:bg-teresa-gold-500 text-teresa-green-950 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      Approve Teachers ({pendingTeacherCount})
                    </button>
                  </div>
                </div>

                {/* Card 3: Teacher Portal */}
                <div className="rounded-3xl bg-teresa-ivory p-7 border-2 border-teresa-green-800/20 hover:border-teresa-gold-400 shadow-lg flex flex-col justify-between hover:-translate-y-1 transition duration-300">
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <span className="px-3 py-1 rounded-full bg-teresa-gold-200 text-teresa-green-950 text-xs font-extrabold uppercase">
                        Faculty & Classroom
                      </span>
                      <div className="w-11 h-11 rounded-2xl bg-teresa-green-900 flex items-center justify-center text-teresa-gold-300">
                        <BookOpen className="w-6 h-6" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-teresa-green-950">
                      Teacher Portal
                    </h3>
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                      Empowers teachers to <strong>enter student results</strong>, <strong>log daily feeding fee collections by student name and date</strong>, submit sign-up requests, and generate terminal reports.
                    </p>
                    <ul className="mt-5 space-y-2.5 text-xs text-slate-700 font-medium">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-teresa-green-700 shrink-0" />
                        Enter Continuous Class (30%) & Exam (70%) Results
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-teresa-green-700 shrink-0" />
                        Log Daily Feeding Fees by Student Name & Date
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-teresa-green-700 shrink-0" />
                        Submit New Teacher Sign-Up Requests & Print Reports
                      </li>
                    </ul>
                  </div>

                  <div className="mt-7 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        launchPortalRole('teacher', { teacherTab: 'results' })
                      }
                      className="py-3 px-3 rounded-xl bg-teresa-green-900 hover:bg-teresa-green-950 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      Enter Results
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        launchPortalRole('teacher', { teacherTab: 'feeding' })
                      }
                      className="py-3 px-3 rounded-xl bg-teresa-gold-400 hover:bg-teresa-gold-500 text-teresa-green-950 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      Log Daily Feeding
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ----------------------------------------------------------------- */}
          {/* 3. HISTORY & FOUNDING HERITAGE SECTION (#history)                 */}
          {/* ----------------------------------------------------------------- */}
          <section id="history" className="py-20 bg-teresa-ivory scroll-mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Section Heading */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-16">
                <div className="lg:col-span-6 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teresa-gold-200 text-teresa-green-950 text-xs font-extrabold uppercase tracking-wider">
                    <Landmark className="w-3.5 h-3.5 text-teresa-green-800" />
                    Our Rich History & Heritage • Since 1988
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-serif font-bold text-teresa-green-950 leading-tight">
                    A Living Tribute to Madam Teresa Aubyn&apos;s Vision of Holistic Education
                  </h2>
                  <p className="text-slate-700 leading-relaxed text-sm sm:text-base">
                    Established on <strong>October 2, 1988</strong>, <strong>St. Teresa Aubyn Memorial School</strong> began as a humble neighborhood sanctuary of learning with 42 pupils in four classrooms. Guided by the conviction that every child deserves rigorous scholarship paired with moral integrity and daily nourishment, the school has blossomed into one of the region&apos;s premier institutions.
                  </p>
                  <p className="text-slate-600 leading-relaxed text-sm">
                    Across nearly four decades, thousands of St. Teresa alumni have gone on to excel as engineers, medical doctors, educators, and civic leaders—carrying forward our timeless green and gold standard: <em>Per Ardua Ad Astra</em>.
                  </p>

                  <div className="grid grid-cols-3 gap-4 pt-2">
                    <div className="p-4 rounded-2xl bg-white border border-teresa-gold-300 shadow-sm">
                      <div className="text-2xl font-serif font-extrabold text-teresa-green-900">
                        1988
                      </div>
                      <div className="text-xs text-slate-600 font-medium mt-0.5">
                        Year Founded
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white border border-teresa-gold-300 shadow-sm">
                      <div className="text-2xl font-serif font-extrabold text-teresa-gold-700">
                        3,400+
                      </div>
                      <div className="text-xs text-slate-600 font-medium mt-0.5">
                        Graduated Alumni
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white border border-teresa-gold-300 shadow-sm">
                      <div className="text-2xl font-serif font-extrabold text-teresa-green-900">
                        11
                      </div>
                      <div className="text-xs text-slate-600 font-medium mt-0.5">
                        KG to JHS 3 Streams
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-6">
                  <div className="relative rounded-3xl overflow-hidden border-4 border-teresa-gold-400 shadow-xl">
                    <img
                      src="/images/heritage-courtyard.jpg"
                      alt="Founder's Memorial Courtyard at St. Teresa Aubyn Memorial School"
                      className="w-full h-96 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-teresa-green-950/85 via-transparent to-transparent" />
                    <div className="absolute bottom-5 left-5 right-5 text-white">
                      <div className="text-xs font-bold uppercase tracking-widest text-teresa-gold-300">
                        Founder&apos;s Memorial Courtyard
                      </div>
                      <div className="text-lg font-serif font-bold mt-0.5">
                        In Loving & Honored Memory of Late Madam Teresa Aubyn
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Historical Milestones Timeline */}
              <div className="relative">
                <h3 className="text-center text-xl font-serif font-bold text-teresa-green-950 mb-8">
                  Key Milestones in the History of St. Teresa (1988 – 2026)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
                  {SCHOOL_HISTORY_MILESTONES.map((item, idx) => (
                    <div
                      key={item.year}
                      className="bg-white rounded-3xl p-6 border border-teresa-green-100 hover:border-teresa-gold-400 shadow-sm hover:shadow-xl transition duration-300 flex flex-col justify-between relative group"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="px-3 py-1 rounded-xl bg-teresa-green-900 text-teresa-gold-300 font-mono text-sm font-extrabold">
                            {item.year}
                          </span>
                          <span className="text-xs font-bold text-teresa-gold-700">
                            0{idx + 1}
                          </span>
                        </div>
                        <div className="text-xs font-bold uppercase tracking-wider text-teresa-green-700">
                          {item.eraTitle}
                        </div>
                        <h4 className="text-base font-serif font-bold text-teresa-green-950 mt-1">
                          {item.headline}
                        </h4>
                        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-teresa-green-900 bg-teresa-gold-100 px-2.5 py-1 rounded-lg">
                          {item.highlightMetric}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ----------------------------------------------------------------- */}
          {/* 4. TRANSPARENT CLASS FEE SCHEDULE & ACADEMIC STREAMS (#academics) */}
          {/* ----------------------------------------------------------------- */}
          <section
            id="academics"
            className="py-20 bg-gradient-to-b from-teresa-green-950 to-teresa-green-900 text-white scroll-mt-20"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-teresa-gold-400/20 border border-teresa-gold-400/40 text-teresa-gold-300 text-xs font-bold uppercase tracking-wider">
                    <GraduationCap className="w-3.5 h-3.5" />
                    Live Bursary Schedule • Managed by the Headmaster
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mt-3">
                    Academic Departments & Class Fee Schedule
                  </h2>
                  <p className="text-emerald-100/80 text-sm sm:text-base mt-1 max-w-2xl">
                    Below is the live fee schedule for {state.currentSemester}, reflecting Class Tuition, Afternoon Extra Classes, and Daily Feeding rates configured in the Headmaster Portal.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    launchPortalRole('headmaster', { headmasterTab: 'class_fees' })
                  }
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-teresa-gold-400 hover:bg-teresa-gold-300 text-teresa-green-950 font-extrabold text-xs uppercase tracking-wider shrink-0 transition"
                >
                  Edit Class Fees in Headmaster Portal →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {(['Early Childhood', 'Lower Primary', 'Upper Primary', 'Junior High'] as const).map(
                  (dept) => {
                    const classesInDept = state.classFeeStructures.filter(
                      (c) => c.department === dept
                    );
                    return (
                      <div
                        key={dept}
                        className="rounded-3xl bg-white/10 backdrop-blur-md border border-teresa-gold-400/30 p-6 flex flex-col justify-between"
                      >
                        <div>
                          <div className="text-xs font-bold uppercase tracking-widest text-teresa-gold-300">
                            Department
                          </div>
                          <h3 className="text-xl font-serif font-bold text-white mt-1 mb-4">
                            {dept}
                          </h3>

                          <div className="space-y-3">
                            {classesInDept.map((cf) => (
                              <div
                                key={cf.id}
                                className="p-3.5 rounded-2xl bg-teresa-green-950/70 border border-white/10 space-y-1.5"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-teresa-gold-300 text-sm">
                                    {cf.className}
                                  </span>
                                  <span className="text-[11px] font-mono text-emerald-200">
                                    Tuition: {formatCurrency(cf.tuitionFee)}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-[11px] text-emerald-100/80">
                                  <span>Extra Classes: {formatCurrency(cf.extraClassesFee)}</span>
                                  <span>Meal: {formatCurrency(cf.dailyMealFee)}/day</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mt-5 pt-3 border-t border-white/10 text-[11px] text-emerald-200">
                          Includes STEM Lab access & continuous assessment tracking
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </section>

          {/* ----------------------------------------------------------------- */}
          {/* 5. INTERACTIVE IMAGE GALLERY (#gallery)                           */}
          {/* ----------------------------------------------------------------- */}
          <section id="gallery" className="py-20 bg-white scroll-mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-teresa-green-100 text-teresa-green-900 text-xs font-extrabold uppercase tracking-wider">
                    <ImageIcon className="w-3.5 h-3.5 text-teresa-green-700" />
                    Campus Life in Green & Gold
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-serif font-bold text-teresa-green-950 mt-2">
                    St. Teresa Campus & Student Life Gallery
                  </h2>
                  <p className="text-slate-600 text-sm sm:text-base mt-1">
                    Explore our architectural quadrangle, STEM and robotics labs, inter-house sports festival, memorial courtyard, and daily nutrition commons.
                  </p>
                </div>

                {/* Category Filter Pills */}
                <div className="flex flex-wrap gap-2">
                  {[
                    'All',
                    'Campus & Heritage',
                    'STEM & Academics',
                    'Sports & Culture',
                    'Student Life & Dining',
                  ].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setGalleryCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                        galleryCategory === cat
                          ? 'bg-teresa-green-900 text-teresa-gold-300 shadow-md'
                          : 'bg-teresa-ivory text-slate-700 hover:bg-teresa-gold-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gallery Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                {filteredGallery.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setLightboxItem(item)}
                    className="group cursor-pointer rounded-3xl overflow-hidden border border-slate-200 bg-teresa-ivory shadow-sm hover:shadow-xl hover:border-teresa-gold-400 transition duration-300 flex flex-col"
                  >
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-teresa-green-950/75 via-transparent to-transparent opacity-80 group-hover:opacity-95 transition" />
                      <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-teresa-green-950/85 backdrop-blur-sm border border-teresa-gold-400/50 text-teresa-gold-300 text-[11px] font-bold">
                        {item.category}
                      </span>
                      <div className="absolute bottom-3 right-3 w-9 h-9 rounded-xl bg-teresa-gold-400 text-teresa-green-950 flex items-center justify-center opacity-0 group-hover:opacity-100 transition transform translate-y-2 group-hover:translate-y-0">
                        <ZoomIn className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="text-[11px] font-semibold text-teresa-gold-700 uppercase">
                          {item.dateLabel}
                        </div>
                        <h3 className="text-lg font-serif font-bold text-teresa-green-950 mt-0.5 group-hover:text-teresa-green-700 transition">
                          {item.title}
                        </h3>
                        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                          {item.caption}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Lightbox Modal for Gallery */}
          {lightboxItem && (
            <div
              className="fixed inset-0 z-50 bg-teresa-green-950/90 backdrop-blur-md flex items-center justify-center p-4"
              onClick={() => setLightboxItem(null)}
            >
              <div
                className="max-w-4xl w-full bg-white rounded-3xl overflow-hidden border-2 border-teresa-gold-400 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative">
                  <img
                    src={lightboxItem.imageUrl}
                    alt={lightboxItem.title}
                    className="w-full max-h-[70vh] object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setLightboxItem(null)}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-teresa-green-950/85 text-white hover:bg-teresa-gold-400 hover:text-teresa-green-950 flex items-center justify-center transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 bg-teresa-ivory flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-teresa-green-900 text-teresa-gold-300 text-xs font-bold">
                      {lightboxItem.category} • {lightboxItem.dateLabel}
                    </span>
                    <h3 className="text-2xl font-serif font-bold text-teresa-green-950 mt-1">
                      {lightboxItem.title}
                    </h3>
                    <p className="text-sm text-slate-700 mt-1">{lightboxItem.caption}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLightboxItem(null)}
                    className="px-5 py-2.5 rounded-xl bg-teresa-green-900 text-white text-xs font-bold shrink-0"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* 6. CONTACT DETAILS & ADMISSIONS INQUIRY SECTION (#contact)        */}
          {/* ----------------------------------------------------------------- */}
          <section id="contact" className="py-20 bg-teresa-ivory border-t border-teresa-gold-200 scroll-mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left 5 cols: Official Contact Details & Visiting Hours */}
                <div className="lg:col-span-5 space-y-6">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-teresa-gold-200 text-teresa-green-950 text-xs font-extrabold uppercase tracking-wider">
                      <MapPin className="w-3.5 h-3.5 text-teresa-green-800" />
                      Connect With St. Teresa
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-serif font-bold text-teresa-green-950 mt-2">
                      Contact Details & Campus Directory
                    </h2>
                    <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                      Visit our campus for admissions assessments, fee inquiries, or parent-teacher consultations. All messages submitted here appear directly in the Super Admin dashboard.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-white border border-teresa-green-100 shadow-sm flex items-start gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-teresa-green-900 text-teresa-gold-300 flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-teresa-green-950">
                          Campus Location & Postal Address
                        </h4>
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                          No. 18 Teresa Aubyn Heritage Avenue, P.O. Box TA 188
                          <br />
                          Digital GPS Address: <strong>CC-018-1988</strong> • Ghana, West Africa
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-teresa-green-100 shadow-sm flex items-start gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-teresa-green-900 text-teresa-gold-300 flex items-center justify-center shrink-0">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-teresa-green-950">
                          Direct Telephone Lines
                        </h4>
                        <p className="text-xs text-slate-600 mt-0.5 space-y-0.5">
                          <span className="block">
                            <strong>Main Administration:</strong> +233 24 410 0888
                          </span>
                          <span className="block">
                            <strong>Headmaster&apos;s Office:</strong> +233 24 855 1920
                          </span>
                          <span className="block">
                            <strong>Bursary & Feeding Desk:</strong> +233 54 321 9087
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-teresa-green-100 shadow-sm flex items-start gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-teresa-green-900 text-teresa-gold-300 flex items-center justify-center shrink-0">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-teresa-green-950">
                          Official Email Directory
                        </h4>
                        <p className="text-xs text-slate-600 mt-0.5 space-y-0.5">
                          <span className="block">
                            <strong>General & Admissions:</strong> info@stteresa-aubyn.edu.gh
                          </span>
                          <span className="block">
                            <strong>Headmaster:</strong> headmaster@stteresa-aubyn.edu.gh
                          </span>
                          <span className="block">
                            <strong>Proprietor / Super Admin:</strong> owner@stteresa-aubyn.edu.gh
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-teresa-green-100 shadow-sm flex items-start gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-teresa-green-900 text-teresa-gold-300 flex items-center justify-center shrink-0">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-teresa-green-950">
                          School & Afternoon Extra Classes Hours
                        </h4>
                        <p className="text-xs text-slate-600 mt-0.5 space-y-0.5">
                          <span className="block">
                            <strong>Regular Academic Hours:</strong> Mon – Fri, 7:30 AM – 2:30 PM
                          </span>
                          <span className="block">
                            <strong>Afternoon Extra Classes:</strong> Mon – Fri, 2:30 PM – 4:15 PM
                          </span>
                          <span className="block">
                            <strong>Bursary & Admin Office:</strong> Mon – Fri, 7:00 AM – 5:00 PM
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right 7 cols: Interactive Contact & Admissions Inquiry Form */}
                <div className="lg:col-span-7 bg-white rounded-3xl border-2 border-teresa-gold-300 p-8 shadow-lg">
                  <div className="mb-6">
                    <span className="text-xs font-bold uppercase tracking-wider text-teresa-gold-700">
                      Direct Admissions & Parent Desk
                    </span>
                    <h3 className="text-2xl font-serif font-bold text-teresa-green-950 mt-1">
                      Send an Inquiry or Schedule a Campus Visit
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Complete the form below. Your inquiry is saved directly to our backend and visible in the Super Admin dashboard.
                    </p>
                  </div>

                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                          Parent / Visitor Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Mrs. Comfort Mensah"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teresa-green-600 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="comfort.mensah@example.com"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teresa-green-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="+233 24 000 0000"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                          Inquiry Topic
                        </label>
                        <select
                          value={contactSubject}
                          onChange={(e) => setContactSubject(e.target.value)}
                          className="w-full px-3.5 py-3 rounded-xl border border-slate-300 text-sm font-medium"
                        >
                          <option value="Admissions & Campus Tour Inquiry">
                            Admissions & Campus Tour
                          </option>
                          <option value="Class Fee & Meal Plan Schedule">
                            Class Fee & Meal Plan Schedule
                          </option>
                          <option value="End-of-Semester Academic Report">
                            Semester Report Verification
                          </option>
                          <option value="General Administration Inquiry">
                            General Administration
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                          Child&apos;s Target Class
                        </label>
                        <select
                          value={contactClass}
                          onChange={(e) => setContactClass(e.target.value)}
                          className="w-full px-3.5 py-3 rounded-xl border border-slate-300 text-sm font-bold text-teresa-green-950"
                        >
                          {SCHOOL_CLASSES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Your Message or Questions *
                      </label>
                      <textarea
                        rows={4}
                        required
                        placeholder="Tell us about your child or any questions regarding admissions, fees, extra classes, or our daily feeding program..."
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teresa-green-600 focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={sendingContact}
                      className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-teresa-green-900 via-teresa-green-800 to-teresa-green-900 hover:from-teresa-green-950 hover:to-teresa-green-900 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition"
                    >
                      <Send className="w-4 h-4 text-teresa-gold-300" />
                      {sendingContact
                        ? 'Sending Message...'
                        : 'Submit Official Inquiry to St. Teresa Administration'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* Footer (Hidden when printing report cards) */}
      <footer className="bg-teresa-green-950 text-emerald-100 border-t-4 border-teresa-gold-400 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-white/10">
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-3">
                <SchoolCrest size="sm" />
                <div>
                  <div className="text-lg font-serif font-bold text-white">
                    ST. TERESA AUBYN MEMORIAL SCHOOL
                  </div>
                  <div className="text-xs text-teresa-gold-300 italic">
                    &ldquo;Per Ardua Ad Astra — Through Diligence to the Stars&rdquo;
                  </div>
                </div>
              </div>
              <p className="text-xs text-emerald-100/80 max-w-md leading-relaxed">
                A complete, modern school management website and role-based portal engineered with Next.js, TypeScript, Tailwind CSS, and Supabase for seamless deployment on Vercel.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-teresa-gold-300 mb-3">
                Role-Based Portals
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button
                    type="button"
                    onClick={() => launchPortalRole('super_admin')}
                    className="hover:text-teresa-gold-300 transition"
                  >
                    → Super Admin (Owner Full Visibility)
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => launchPortalRole('headmaster')}
                    className="hover:text-teresa-gold-300 transition"
                  >
                    → Headmaster (Class Fees, Extra & Meal Fees)
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => launchPortalRole('teacher')}
                    className="hover:text-teresa-gold-300 transition"
                  >
                    → Teacher Portal (Results & Daily Feeding)
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setViewMode('reports_standalone')}
                    className="hover:text-teresa-gold-300 transition"
                  >
                    → End-of-Semester Report Generator
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-teresa-gold-300 mb-3">
                Quick Campus Links
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a
                    href="#history"
                    onClick={() => setViewMode('public')}
                    className="hover:text-teresa-gold-300 transition"
                  >
                    Our Founding History (1988)
                  </a>
                </li>
                <li>
                  <a
                    href="#academics"
                    onClick={() => setViewMode('public')}
                    className="hover:text-teresa-gold-300 transition"
                  >
                    Class Fee Schedule & Streams
                  </a>
                </li>
                <li>
                  <a
                    href="#gallery"
                    onClick={() => setViewMode('public')}
                    className="hover:text-teresa-gold-300 transition"
                  >
                    Campus Photo Gallery
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    onClick={() => setViewMode('public')}
                    className="hover:text-teresa-gold-300 transition"
                  >
                    Contact Details & Admissions
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-200/70">
            <div>
              © {new Date().getFullYear()} St. Teresa Aubyn Memorial School. All rights reserved.
            </div>
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-teresa-gold-300 font-mono text-[11px]">
                Vercel + Supabase TypeScript Stack
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
