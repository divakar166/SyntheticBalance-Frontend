import { Suspense } from 'react';
import { GeneratePageContent } from './client';

export const dynamic = 'force-dynamic';

export default function GeneratePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <GeneratePageContent />
    </Suspense>
  );
}
