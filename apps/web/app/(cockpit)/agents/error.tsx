'use client';

import { ErrorState } from '@/components/ErrorState';

export default function AgentsError({ reset }: Readonly<{ error: Error; reset: () => void }>) {
  return <ErrorState title="Could not load agents" hint="Something went wrong reading the agent roster." reset={reset} />;
}
