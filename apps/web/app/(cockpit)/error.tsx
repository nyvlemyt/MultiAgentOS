'use client';

import { ErrorState } from '@/components/ErrorState';

export default function CockpitError({ reset }: Readonly<{ error: Error; reset: () => void }>) {
  return <ErrorState title="Something went wrong" hint="An unexpected error occurred in the cockpit." reset={reset} />;
}
