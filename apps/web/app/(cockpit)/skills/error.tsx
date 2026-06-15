'use client';

import { ErrorState } from '@/components/ErrorState';

export default function SkillsError({ reset }: Readonly<{ error: Error; reset: () => void }>) {
  return <ErrorState title="Could not load skills" hint="Something went wrong reading the skill registry." reset={reset} />;
}
