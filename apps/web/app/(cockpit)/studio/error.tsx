'use client';

import { ErrorState } from '@/components/ErrorState';

export default function StudioError({ reset }: Readonly<{ error: Error; reset: () => void }>) {
  return <ErrorState title="Could not load the studio" hint="Something went wrong rendering the agent studio." reset={reset} />;
}
