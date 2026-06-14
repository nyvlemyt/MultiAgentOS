import { describe, it, expect } from 'vitest';
import { languageDirective } from './language';

describe('languageDirective', () => {
  it('maps fr to a French directive', () => {
    expect(languageDirective('fr')).toBe('Respond in French.');
  });

  it('maps en to an English directive', () => {
    expect(languageDirective('en')).toBe('Respond in English.');
  });

  it('falls back to French for an unknown/undefined language', () => {
    expect(languageDirective(undefined)).toBe('Respond in French.');
  });
});
