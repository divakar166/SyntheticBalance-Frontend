import { Suspense } from 'react';
import { TrainPageContent } from './client';

export const dynamic = 'force-dynamic';

export default function TrainPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <TrainPageContent />
    </Suspense>
  );
}
