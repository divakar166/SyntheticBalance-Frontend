'use client';

import { TrainingModel } from '@/lib/api';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ModelsTableProps {
  models: TrainingModel[];
  onGenerate: (model: TrainingModel) => void;
  onRetrain: (model: TrainingModel) => void;
  onDelete: (model: TrainingModel) => void;
}

export function ModelsTable({ models, onGenerate, onRetrain, onDelete }: ModelsTableProps) {
  if (models.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trained Models</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No models trained yet for this dataset.</p>
            <p className="text-xs text-muted-foreground mt-2">
              Train a model to start generating synthetic data.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trained Models ({models.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Model ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Config</TableHead>
                <TableHead>Final Loss</TableHead>
                <TableHead>Training Time</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {models.map((model) => (
                <TableRow key={model.id}>
                  <TableCell className="font-mono text-sm max-w-xs truncate">
                    {model.id}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        model.status === 'completed'
                          ? 'default'
                          : model.status === 'failed'
                            ? 'destructive'
                            : 'secondary'
                      }
                    >
                      {model.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs space-y-1">
                      {model.config ? (
                        <>
                          <div>Epochs: {model.config.epochs}</div>
                          <div>Batch: {model.config.batch_size}</div>
                        </>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {model.final_loss !== null && model.final_loss !== undefined ? (
                      <span className="text-sm font-mono">{model.final_loss.toFixed(4)}</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {model.training_time_seconds ? (
                      <span className="text-sm">
                        {Math.round(model.training_time_seconds / 60)}m
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {model.created_at ? (
                      <span className="text-sm">
                        {new Date(model.created_at).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
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
                        {model.status === 'completed' && (
                          <DropdownMenuItem onClick={() => onGenerate(model)}>
                            Generate Data
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => onRetrain(model)}>
                          Retrain with Config
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(model)}
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
      </CardContent>
    </Card>
  );
}
