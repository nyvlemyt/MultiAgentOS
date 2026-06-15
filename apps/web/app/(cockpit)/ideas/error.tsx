'use client';

import { ErrorState } from '@/components/ErrorState';

export default function IdeasError({ reset }: Readonly<{ error: Error; reset: () => void }>) {
  return <ErrorState title="Could not load ideas" hint="Something went wrong reading the idea inbox." reset={reset} />;
}
