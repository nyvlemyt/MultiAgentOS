'use client';

import { ErrorState } from '@/components/ErrorState';

export default function ProjectsError({ reset }: Readonly<{ error: Error; reset: () => void }>) {
  return <ErrorState title="Could not load projects" hint="Something went wrong reading the project list." reset={reset} />;
}
