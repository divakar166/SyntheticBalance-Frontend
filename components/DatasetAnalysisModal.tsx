'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { DatasetMetadata } from '@/lib/api';
import { SchemaDetectionTable } from '@/components/SchemaDetectionTable';
import { TargetColumnCard } from '@/components/TargetColumnCard';
import { FeatureStatisticsDashboard } from '@/components/FeatureStatisticsDashboard';
import { ClassImbalanceWarning } from '@/components/ClassImbalanceWarning';

interface DatasetAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  datasetMetadata: DatasetMetadata | null;
  selectedTarget: string;
  onTargetChange: (target: string) => void;
}

export function DatasetAnalysisModal({
  isOpen,
  onClose,
  datasetMetadata,
  selectedTarget,
  onTargetChange,
}: DatasetAnalysisModalProps) {
  if (!datasetMetadata) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl! max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Dataset Analysis</DialogTitle>
          <DialogDescription>
            {datasetMetadata.filename || datasetMetadata.dataset_id.slice(0, 12)}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-120px)] pr-4">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 rounded-lg bg-muted/50 p-6">
              <div>
                <p className="text-sm text-muted-foreground">Rows</p>
                <p className="text-2xl font-bold">{datasetMetadata.n_rows.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Features</p>
                <p className="text-2xl font-bold">{datasetMetadata.n_features}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dataset ID</p>
                <p className="text-lg font-bold font-mono truncate">
                  {datasetMetadata.dataset_id.slice(0, 12)}...
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Target</p>
                <p className="text-lg font-bold">{selectedTarget}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-3">Target Column</p>
              <div className="flex flex-wrap gap-2"> {datasetMetadata.target_column}
              </div>
            </div>

            <ClassImbalanceWarning
              classDistribution={datasetMetadata.class_dist}
              selectedTarget={datasetMetadata.target_column ?? "N/A"}
            />

            <TargetColumnCard
              targetColumn={selectedTarget}
              classDistribution={datasetMetadata.class_dist}
            />

            <SchemaDetectionTable features={datasetMetadata.schema.features} />

            <FeatureStatisticsDashboard features={datasetMetadata.schema.features} />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}