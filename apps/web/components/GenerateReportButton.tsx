'use client';
import { FileText } from 'lucide-react';
import { generateMissionReport } from '@/app/(cockpit)/mission-report-actions';

// Generate the final mission report via the server action (redirects to its page).
export function GenerateReportButton({ missionId }: Readonly<{ missionId: string }>) {
  const action = generateMissionReport.bind(null, missionId);
  return (
    <form action={action}>
      <button
        type="submit"
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold"
        style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent-dim))', color: '#04141a' }}
      >
        <FileText size={13} /> Générer le rapport final
      </button>
    </form>
  );
}
