'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DatasetSummary } from '@/lib/api';
import { DatasetStageIndicator, type DatasetStage } from '@/components/DatasetStageIndicator';
import {
  MoreVertical,
  Eye,
  Play,
  Sparkles,
  Trash2,
  FileJson,
  BarChart3,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DatasetCardProps {
  dataset: DatasetSummary;
  onViewAnalysis: (dataset: DatasetSummary) => void;
  onTrain: (dataset: DatasetSummary) => void;
  onGenerate: (dataset: DatasetSummary) => void;
  onDelete: (dataset: DatasetSummary) => void;
}

function getDatasetStage(dataset: DatasetSummary): DatasetStage {
  if (dataset.dataset_type === 'synthetic') {
    return 'generated';
  }
  if (dataset.has_model) {
    return 'trained';
  }
  // We assume if data is in the system, it's at least analyzed
  return 'analyzed';
}

export function DatasetCard({
  dataset,
  onViewAnalysis,
  onTrain,
  onGenerate,
  onDelete,
}: DatasetCardProps) {
  const stage = getDatasetStage(dataset);
  const isSynthetic = dataset.dataset_type === 'synthetic';
  const isTrained = dataset.has_model;

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="truncate text-lg">{dataset.filename || dataset.id}</CardTitle>
            <CardDescription className="text-xs mt-1">
              ID: {dataset.id.slice(0, 12)}...
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onDelete(dataset)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Dataset
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stage Indicator */}
        <DatasetStageIndicator
          currentStage={stage}
          hasAnalysis={true}
          hasModel={isTrained}
          hasSynthetic={isSynthetic}
        />

        <Separator className="my-2" />

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Rows</p>
            <p className="text-sm font-bold">{dataset.n_rows.toLocaleString()}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Features</p>
            <p className="text-sm font-bold">{dataset.n_features}</p>
          </div>
          {dataset.target && (
            <div className="rounded-lg bg-muted/50 p-3 col-span-2">
              <p className="text-xs text-muted-foreground">Target</p>
              <p className="text-sm font-bold truncate">{dataset.target}</p>
            </div>
          )}
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant={isSynthetic ? 'secondary' : 'outline'} className="text-xs">
            {isSynthetic ? 'Synthetic' : 'Real'}
          </Badge>
          {isTrained && (
            <Badge className="text-xs bg-green-500/20 text-green-700 dark:text-green-400">
              Trained
            </Badge>
          )}
          {dataset.latest_training_job && (
            <Badge variant="outline" className="text-xs">
              {dataset.latest_training_job.status}
            </Badge>
          )}
        </div>

        <Separator className="my-2" />

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {!isSynthetic && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onViewAnalysis(dataset)}
                className="flex-1 gap-2 text-xs"
              >
                <Eye className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Analysis</span>
              </Button>
              {!isTrained ? (
                <Button
                  size="sm"
                  onClick={() => onTrain(dataset)}
                  className="flex-1 gap-2 text-xs"
                >
                  <Play className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Train</span>
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => onGenerate(dataset)}
                  className="flex-1 gap-2 text-xs"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Generate</span>
                </Button>
              )}
            </>
          )}
          {isSynthetic && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onViewAnalysis(dataset)}
                className="flex-1 gap-2 text-xs"
              >
                <FileJson className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">View</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 gap-2 text-xs"
              >
                <BarChart3 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Compare</span>
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
