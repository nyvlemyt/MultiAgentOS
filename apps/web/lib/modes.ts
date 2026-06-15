// Mode is the single quality/cost control; the model tier is derived from it.
// No redundant standalone model picker.
export type Mode = 'eco' | 'standard' | 'expert';

export const MODE_MODEL: Record<Mode, string> = {
  eco: 'claude-haiku-4-5',
  standard: 'claude-sonnet-4-6',
  expert: 'claude-opus-4-8',
};

export const MODE_LABEL: Record<Mode, string> = {
  eco: 'Eco — Haiku · prose compressée · budget mini',
  standard: 'Standard — Sonnet · équilibre coût/qualité',
  expert: 'Expert — Opus · qualité max sur les gros travaux',
};

export function isMode(v: string): v is Mode {
  return v === 'eco' || v === 'standard' || v === 'expert';
}
