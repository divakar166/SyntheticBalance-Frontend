'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Info } from 'lucide-react';

interface ClassImbalanceWarningProps {
  classDistribution: Record<string, number>;
  selectedTarget: string;
}

export function ClassImbalanceWarning({
  classDistribution,
  selectedTarget,
}: ClassImbalanceWarningProps) {
  const total = Object.values(classDistribution).reduce((a, b) => a + b, 0);
  const entries = Object.entries(classDistribution).sort((a, b) => b[1] - a[1]);
  const minorityClass = entries[entries.length - 1][0];
  const minorityCount = entries[entries.length - 1][1];
  const minorityClassPercentage = (minorityCount / total) * 100;
  const majorityCount = entries[0][1];
  const classRatio = `${majorityCount}:${minorityCount}`;

  const isSevere = minorityClassPercentage < 10;

  return (
    <Alert
      variant={isSevere ? 'destructive' : 'default'}
      className="border-2"
    >
      {isSevere ? (
        <AlertTriangle className="h-5 w-5" />
      ) : (
        <Info className="h-5 w-5" />
      )}
      <AlertTitle>
        Class Imbalance Detected in &quot;{selectedTarget}&quot;
      </AlertTitle>
      <AlertDescription>
        <div className="space-y-3">
          <p>
            The minority class (&quot;<span className="font-semibold">{minorityClass}</span>&quot;) represents{' '}
            <span className="font-bold">{minorityClassPercentage.toFixed(1)}%</span> of the data
            with a ratio of <Badge variant="secondary">{classRatio}</Badge>
          </p>
          <p className="text-sm">
            Synthetic data generation can help create balanced training datasets
            and improve model performance on minority class predictions.
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
}
