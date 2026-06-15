'use client';

import { ErrorState } from '@/components/ErrorState';

export default function PrioritiesError({ reset }: Readonly<{ error: Error; reset: () => void }>) {
  return <ErrorState title="Could not load priorities" hint="Something went wrong scoring the priorities board." reset={reset} />;
}
