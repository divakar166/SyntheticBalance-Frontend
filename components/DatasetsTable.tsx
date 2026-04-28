'use client';

import { DatasetSummary } from '@/lib/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Database, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DatasetStageIndicator } from './DatasetStageIndicator';

interface DatasetsTableProps {
  datasets: DatasetSummary[];
  onTrain: (dataset: DatasetSummary) => void;
  onGenerate: (dataset: DatasetSummary) => void;
  onDelete: (dataset: DatasetSummary) => void;
  onViewAnalysis: (dataset: DatasetSummary) => void;
}

export function DatasetsTable({
  datasets,
  onTrain,
  onGenerate,
  onDelete,
  onViewAnalysis,
}: DatasetsTableProps) {
  if (datasets.length === 0) {
    return (
      <Card className="border-dashed">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Database className="mb-4 h-12 w-12 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold">No datasets yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Upload a CSV file to get started with your first dataset.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Rows / Features</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Stages</TableHead>
              <TableHead>Models</TableHead>
              <TableHead>Latest Training</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {datasets.map((dataset) => (
              <TableRow key={dataset.id}>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{dataset.filename || dataset.id}</span>
                    <span className="text-xs text-muted-foreground font-mono">{dataset.id}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <span className="font-semibold">{dataset.n_rows}</span>
                    <span className="text-muted-foreground"> / {dataset.n_features}</span>
                  </div>
                </TableCell>
                <TableCell>{dataset.target || '-'}</TableCell>
                <TableCell>
                  <DatasetStageIndicator hasModel={dataset.has_model} />
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{dataset.models?.length || 0}</Badge>
                </TableCell>
                <TableCell>
                  {dataset.latest_training_job ? (
                    <div className="flex flex-col gap-1">
                      <Badge
                        variant={
                          dataset.latest_training_job.status === 'completed'
                            ? 'default'
                            : dataset.latest_training_job.status === 'failed'
                              ? 'destructive'
                              : 'secondary'
                        }
                      >
                        {dataset.latest_training_job.status}
                      </Badge>
                      {dataset.latest_training_job.created_at && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(dataset.latest_training_job.created_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewAnalysis(dataset)}>
                        View Analysis
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTrain(dataset)}>
                        Train Model
                      </DropdownMenuItem>
                      {dataset.has_model && (
                        <DropdownMenuItem onClick={() => onGenerate(dataset)}>
                          Generate Data
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => onDelete(dataset)}
                        className="text-destructive focus:text-destructive"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
