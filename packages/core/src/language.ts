export type ProjectLanguage = 'fr' | 'en';

const DIRECTIVES: Record<ProjectLanguage, string> = {
  fr: 'Respond in French.',
  en: 'Respond in English.',
};

/**
 * One-line system-prompt directive pinning the agent's output language to the
 * project language (CLAUDE.md — project-level setting, identical across
 * providers so router grounding-parity stays byte-equal). Defaults to French.
 */
export function languageDirective(lang: ProjectLanguage | undefined | null): string {
  return DIRECTIVES[lang ?? 'fr'] ?? DIRECTIVES.fr;
}
