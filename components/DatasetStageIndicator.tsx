'use client';

import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Upload, Database, Settings, Zap, Sparkles } from 'lucide-react';

export type DatasetStage = 'uploaded' | 'analyzed' | 'configured' | 'trained' | 'generated';

interface DatasetStageIndicatorProps {
  currentStage: DatasetStage;
  hasAnalysis?: boolean;
  hasModel?: boolean;
  hasSynthetic?: boolean;
}

const stages: Array<{
  id: DatasetStage;
  label: string;
  icon: React.ReactNode;
  description: string;
}> = [
  {
    id: 'uploaded',
    label: 'Uploaded',
    icon: <Upload className="h-4 w-4" />,
    description: 'Dataset uploaded',
  },
  {
    id: 'analyzed',
    label: 'Analyzed',
    icon: <Database className="h-4 w-4" />,
    description: 'Analysis complete',
  },
  {
    id: 'configured',
    label: 'Configured',
    icon: <Settings className="h-4 w-4" />,
    description: 'Training ready',
  },
  {
    id: 'trained',
    label: 'Trained',
    icon: <Zap className="h-4 w-4" />,
    description: 'Model trained',
  },
  {
    id: 'generated',
    label: 'Generated',
    icon: <Sparkles className="h-4 w-4" />,
    description: 'Synthetic data ready',
  },
];

export function DatasetStageIndicator({
  currentStage,
  hasAnalysis,
  hasModel,
  hasSynthetic,
}: DatasetStageIndicatorProps) {
  const currentIndex = stages.findIndex((s) => s.id === currentStage);

  const getStageStatus = (stageId: DatasetStage): 'completed' | 'current' | 'upcoming' => {
    const stageIndex = stages.findIndex((s) => s.id === stageId);
    if (stageIndex < currentIndex) return 'completed';
    if (stageIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">Pipeline Stage</p>
        <Badge variant="outline">{currentStage}</Badge>
      </div>
      
      <div className="flex items-center gap-2">
        {stages.map((stage, index) => {
          const status = getStageStatus(stage.id);
          const isCompleted = status === 'completed';
          const isCurrent = status === 'current';

          return (
            <div key={stage.id} className="flex items-center gap-1">
              <div
                className={`rounded-full p-1.5 transition-colors ${
                  isCompleted
                    ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                    : isCurrent
                      ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  stage.icon
                )}
              </div>

              {index < stages.length - 1 && (
                <div
                  className={`h-1 w-6 transition-colors ${
                    isCompleted ? 'bg-green-500/40' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="text-xs text-muted-foreground">
        {stages[currentIndex]?.description}
      </div>
    </div>
  );
}
