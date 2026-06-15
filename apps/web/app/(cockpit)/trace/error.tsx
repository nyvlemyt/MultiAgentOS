'use client';

import { ErrorState } from '@/components/ErrorState';

export default function TraceError({ reset }: Readonly<{ error: Error; reset: () => void }>) {
  return <ErrorState title="Could not load the trace" hint="Something went wrong streaming the event trace." reset={reset} />;
}
