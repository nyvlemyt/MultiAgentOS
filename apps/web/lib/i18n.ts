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
  },
};

export const COCKPIT_KEYS = Object.keys(DICT.fr);

export function t(key: string, lang: Language | undefined | null): string {
  const table = DICT[lang ?? 'fr'] ?? DICT.fr;
  return table[key] ?? DICT.fr[key] ?? key;
}
