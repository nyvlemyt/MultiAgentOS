'use client';

import { ErrorState } from '@/components/ErrorState';

export default function MissionsError({ reset }: Readonly<{ error: Error; reset: () => void }>) {
  return <ErrorState title="Could not load missions" hint="Something went wrong reading the missions board." reset={reset} />;
}
