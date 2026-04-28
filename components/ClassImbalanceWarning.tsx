'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Info } from 'lucide-react';

interface ClassImbalanceInfo {
  minority_class: string;
  minority_count: number;
  minority_pct: number;
  majority_class: string;
  majority_count: number;
  majority_pct: number;
  class_ratio: string;
  is_severe: boolean;
  recommendation: string;
}

interface ClassImbalanceWarningProps {
  classDistribution: Record<string, number>;
  selectedTarget: string;
  classImbalanceInfo?: ClassImbalanceInfo;
}

export function ClassImbalanceWarning({
  classDistribution,
  selectedTarget,
  classImbalanceInfo,
}: ClassImbalanceWarningProps) {
  const total = Object.values(classDistribution).reduce((a, b) => a + b, 0);
  const entries = Object.entries(classDistribution).sort((a, b) => b[1] - a[1]);
  const minorityClass = classImbalanceInfo?.minority_class ?? entries[entries.length - 1][0];
  const minorityCount = classImbalanceInfo?.minority_count ?? entries[entries.length - 1][1];
  const minorityPct = classImbalanceInfo?.minority_pct ?? (minorityCount / total) * 100;
  const majorityCount = classImbalanceInfo?.majority_count ?? entries[0][1];
  const classRatio = classImbalanceInfo?.class_ratio ?? `${majorityCount}:${minorityCount}`;
  const isSevere = classImbalanceInfo?.is_severe ?? minorityPct < 10;
  const recommendation = classImbalanceInfo?.recommendation;

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
            <span className="font-bold">{minorityPct.toFixed(1)}%</span> of the data
            with a class ratio of <Badge variant="secondary">{classRatio}</Badge>
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-md bg-muted/50 px-3 py-2">
              <p className="text-xs text-muted-foreground">Minority Count</p>
              <p className="font-semibold">{minorityCount.toLocaleString()}</p>
            </div>
            <div className="rounded-md bg-muted/50 px-3 py-2">
              <p className="text-xs text-muted-foreground">Majority Count</p>
              <p className="font-semibold">{majorityCount.toLocaleString()}</p>
            </div>
            <div className="rounded-md bg-muted/50 px-3 py-2">
              <p className="text-xs text-muted-foreground">Severity</p>
              <p className="font-semibold">{isSevere ? 'Severe' : 'Moderate'}</p>
            </div>
          </div>
          {recommendation && (
            <p className="text-sm text-muted-foreground">{recommendation}</p>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}