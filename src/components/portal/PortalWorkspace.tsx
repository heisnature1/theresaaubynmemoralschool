'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Info, X } from 'lucide-react';
import { SchoolStateSnapshot, UserRole } from '@/types/school';
import { SuperAdminDashboard } from '@/components/SuperAdminDashboard';
import { HeadmasterDashboard } from '@/components/HeadmasterDashboard';
import { TeacherDashboard } from '@/components/TeacherDashboard';
import { ReportCardGenerator } from '@/components/ReportCardGenerator';

type Workspace = 'super_admin' | 'headmaster' | 'teacher' | 'reports';

interface PortalWorkspaceProps {
  initialState: SchoolStateSnapshot;
  workspace: Workspace;
  user: { fullName: string; role: UserRole; staffId: string; email: string };
  initialTab?: string;
}

export function PortalWorkspace({
  initialState,
  workspace,
  user,
  initialTab,
}: PortalWorkspaceProps) {
  const [state, setState] = useState<SchoolStateSnapshot>(initialState);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  function notify(message: string, type: 'success' | 'info' = 'success') {
    setToast({ message, type });
  }

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md print:hidden animate-toast-in">
          <div className="flex items-start gap-3 rounded-2xl border border-teresa-green-700/40 bg-white/95 px-4 py-3.5 shadow-lift backdrop-blur-md">
            {toast.type === 'info' ? (
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
            ) : (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teresa-green-700" />
            )}
            <p className="text-sm leading-snug text-slate-800">{toast.message}</p>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="ml-1 text-slate-400 hover:text-slate-700"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {workspace === 'super_admin' && (
        <SuperAdminDashboard state={state} onStateChange={setState} onNotify={notify} />
      )}

      {workspace === 'headmaster' && (
        <HeadmasterDashboard
          state={state}
          onStateChange={setState}
          onNotify={notify}
          initialTab={
            (initialTab as 'class_fees' | 'student_payments' | 'approvals' | 'reports') || 'class_fees'
          }
        />
      )}

      {workspace === 'teacher' && (
        <TeacherDashboard
          state={state}
          onStateChange={setState}
          onNotify={notify}
          currentUser={{ fullName: user.fullName, staffId: user.staffId, email: user.email }}
          initialTab={
            (initialTab as 'results' | 'feeding' | 'reports' | 'profile') || 'results'
          }
        />
      )}

      {workspace === 'reports' && (
        <ReportCardGenerator
          state={state}
          activeRole={user.role}
          actorName={user.fullName}
          onStateChange={setState}
          onNotify={notify}
        />
      )}
    </div>
  );
}
