// Phase 3.5b — MINIMAL cockpit-shell i18n. Covers nav + topbar + a few headings
// only. Deep per-page i18n is DEFERRED (build-report). French is the default;
// every lookup falls back to French, then to the key itself.

export type Language = 'fr' | 'en';

const DICT: Record<Language, Record<string, string>> = {
  fr: {
    'nav.command': 'Centre de commande',
    'nav.projects': 'Projets',
    'nav.ideas': 'Idées',
    'nav.missions': 'Missions',
    'nav.priorities': 'Priorités',
    'nav.agents': 'Agents',
    'nav.studio': 'Studio',
    'nav.skills': 'Compétences',
    'nav.tokens': 'Jetons',
    'nav.trace': 'Trace',
    'nav.memory': 'Mémoire',
    'topbar.language': 'Langue',
    'topbar.autonomy': 'Autonomie',
    'topbar.mode': 'Mode',
    'card.dailyReport': 'Rapport quotidien',
    'card.dailyReport.subtitle': 'dernier réveil autopilote',
    'card.dailyReport.empty': 'Aucun rapport pour le moment.',
    'card.dailyReport.advanced': 'Missions avancées',
    'card.dailyReport.blocked': 'Missions bloquées',
    'card.dailyReport.tasksDone': 'Tâches terminées',
    'card.dailyReport.quota': "Unités de quota",
    'card.pendingValidations': 'Validations en attente',
  },
  en: {
    'nav.command': 'Command Center',
    'nav.projects': 'Projects',
    'nav.ideas': 'Ideas',
    'nav.missions': 'Missions',
    'nav.priorities': 'Priorities',
    'nav.agents': 'Agents',
    'nav.studio': 'Studio',
    'nav.skills': 'Skills',
    'nav.tokens': 'Tokens',
    'nav.trace': 'Trace',
    'nav.memory': 'Memory',
    'topbar.language': 'Language',
    'topbar.autonomy': 'Autonomy',
    'topbar.mode': 'Mode',
    'card.dailyReport': 'Daily report',
    'card.dailyReport.subtitle': 'last autopilot wake',
    'card.dailyReport.empty': 'No report yet.',
    'card.dailyReport.advanced': 'Missions advanced',
    'card.dailyReport.blocked': 'Missions blocked',
    'card.dailyReport.tasksDone': 'Tasks done',
    'card.dailyReport.quota': 'quotaUnits',
    'card.pendingValidations': 'Pending validations',
  },
};

export const COCKPIT_KEYS = Object.keys(DICT.fr);

export function t(key: string, lang: Language | undefined | null): string {
  const table = DICT[lang ?? 'fr'] ?? DICT.fr;
  return table[key] ?? DICT.fr[key] ?? key;
}
