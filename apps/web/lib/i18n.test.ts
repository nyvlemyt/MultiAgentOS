import { describe, it, expect } from 'vitest';
import { t, COCKPIT_KEYS } from './i18n';

describe('cockpit-shell i18n', () => {
  it('returns the French label by default', () => {
    expect(t('nav.command', 'fr')).toBe('Centre de commande');
    expect(t('topbar.language', 'fr')).toBe('Langue');
  });

  it('returns the English label for en', () => {
    expect(t('nav.command', 'en')).toBe('Command Center');
    expect(t('topbar.language', 'en')).toBe('Language');
  });

  it('falls back to French when language is undefined', () => {
    expect(t('topbar.language', undefined)).toBe('Langue');
  });

  it('falls back to the key itself when the key is unknown', () => {
    expect(t('nope.missing', 'fr')).toBe('nope.missing');
  });

  it('covers every cockpit key in both languages', () => {
    for (const key of COCKPIT_KEYS) {
      expect(t(key, 'fr')).not.toBe(key);
      expect(t(key, 'en')).not.toBe(key);
    }
  });
});
