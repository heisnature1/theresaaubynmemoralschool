'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { SchoolStateSnapshot } from '@/types/school';
import { buildProspectusPdf } from '@/lib/prospectus-pdf';
import { downloadPdf } from '@/lib/pdf';

export function ProspectusDownload({ state }: { state: SchoolStateSnapshot }) {
  const [preparing, setPreparing] = useState(false);

  async function handleDownload() {
    setPreparing(true);
    try {
      const pdf = buildProspectusPdf(state);
      downloadPdf(pdf, 'St-Teresa-Aubyn-Prospectus.pdf');
    } finally {
      setPreparing(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={preparing}
      className="inline-flex items-center gap-2 rounded-md border border-teresa-green-800 px-5 py-3 text-sm font-semibold text-teresa-green-900 hover:bg-teresa-green-50 disabled:opacity-60"
    >
      <Download className="h-4 w-4" />
      {preparing ? 'Preparing the document…' : 'Download prospectus (PDF)'}
    </button>
  );
}
