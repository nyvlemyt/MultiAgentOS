'use client';

import { ErrorState } from '@/components/ErrorState';

export default function MemoryError({ reset }: Readonly<{ error: Error; reset: () => void }>) {
  return <ErrorState title="Could not load memory" hint="Something went wrong reading the memory center." reset={reset} />;
}
