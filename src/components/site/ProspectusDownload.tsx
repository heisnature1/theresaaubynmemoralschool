'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { SchoolStateSnapshot } from '@/types/school';
import { buildProspectusPdf } from '@/lib/prospectus-pdf';
import type { SiteData } from '@/lib/site-data';
import { downloadPdf } from '@/lib/pdf';

export function ProspectusDownload({
  state,
  content,
}: {
  state: SchoolStateSnapshot;
  content?: SiteData;
}) {
  const [preparing, setPreparing] = useState(false);

  async function handleDownload() {
    setPreparing(true);
    try {
      const pdf = buildProspectusPdf(state, content);
      downloadPdf(pdf, 'St-Theresa-Aubyn-Prospectus.pdf');
    } finally {
      setPreparing(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={preparing}
      className="inline-flex items-center gap-2 rounded-md border border-theresa-green-800 px-5 py-3 text-sm font-semibold text-theresa-green-900 hover:bg-theresa-green-50 disabled:opacity-60"
    >
      <Download className="h-4 w-4" />
      {preparing ? 'Preparing the document…' : 'Download prospectus (PDF)'}
    </button>
  );
}
