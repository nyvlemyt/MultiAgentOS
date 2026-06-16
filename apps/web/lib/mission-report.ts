import type { MissionProgress } from './mission-progress';

export interface FinalReportContent {
  title: string;
  humanMd: string;
  ai: string;
}

const STATUS_FR: Record<string, string> = {
  todo: 'à faire',
  running: 'en cours',
  done: 'terminée',
  blocked: 'bloquée',
  needs_validation: 'à valider',
};

function stepLine(s: MissionProgress['steps'][number]): string {
  const agent = s.agentId ?? '—';
  const status = STATUS_FR[s.status] ?? s.status;
  const link = s.reportId ? ` · rapport \`${s.reportId}\`` : '';
  return `- **${s.title}** — agent \`${agent}\` · ${status}${link}`;
}

// Pure builder for the mock final mission report. Aggregates the per-task progress
// index into a structured what/why/how/tests document + a parseable JSON payload.
//
// SEAM: this is the deterministic, LLM-free placeholder. When the real aggregator
// lands (LLM grounded on the task reports + knowledge/ECC skills), swap this body
// for that call — the server action, storage (createReport), and report page stay
// unchanged; only the content produced here changes.
export function buildFinalReport(mission: string, progress: MissionProgress): FinalReportContent {
  const index = progress.steps.map(stepLine).join('\n');
  const humanMd = [
    `# Rapport final — ${mission}`,
    '',
    `**Avancement : ${progress.done}/${progress.total} tâches terminées.**`,
    '',
    '## Quoi',
    `Synthèse de la mission « ${mission} » : agrégation des rapports de tâche produits par les agents.`,
    '',
    '## Pourquoi',
    "Donner au manager (et à un agent qui reprend) une vue d'ensemble sans relire chaque rapport.",
    '',
    '## Comment',
    'Chaque tâche a été dispatchée à un agent, exécutée, puis a laissé un rapport. Index ci-dessous.',
    '',
    '## Tests',
    'Les vérifications de chaque tâche figurent dans son rapport dédié (lien dans l\'index).',
    '',
    '## Index des étapes',
    index || '_Aucune tâche._',
    '',
    '_Rapport mock structuré — le contenu enrichi viendra du vrai agrégateur (SEAM)._',
  ].join('\n');

  const ai = JSON.stringify({
    kind: 'mission',
    mission,
    done: progress.done,
    total: progress.total,
    steps: progress.steps,
  });

  return { title: `Rapport final — ${mission}`, humanMd, ai };
}
