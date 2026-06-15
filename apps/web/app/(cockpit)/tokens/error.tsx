'use client';

import { ErrorState } from '@/components/ErrorState';

export default function TokensError({ reset }: Readonly<{ error: Error; reset: () => void }>) {
  return <ErrorState title="Could not load token usage" hint="Something went wrong reading the quota meter." reset={reset} />;
}
