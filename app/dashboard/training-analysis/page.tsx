'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useRequireAuth } from '@/components/AuthProvider';
import { DatasetSummary, listDatasets } from '@/lib/api';
import { ArrowLeft } from 'lucide-react';

interface TrainingJob {
  id: string;
  dataset_id: string;
  dataset_name: string;
  status: string;
  started_at: string;
  training_time_seconds?: number;
  final_loss?: number;
  epochs_trained?: number;
  total_epochs: number;
}

export default function TrainingAnalysisPage() {
  const router = useRouter();
  const { session, isLoading } = useRequireAuth();
  const [datasets, setDatasets] = useState<DatasetSummary[]>([]);
  const [trainingJobs, setTrainingJobs] = useState<TrainingJob[]>([]);
  const [isLoading_, setIsLoading_] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const fetchDatasets = useCallback(async () => {
    if (!session) return;
    setIsLoading_(true);
    setError(null);
    try {
      const response = await listDatasets(session);
      setDatasets(response.datasets);

      // Extract all training models from datasets to build job list
      const jobs: TrainingJob[] = [];
      response.datasets.forEach((dataset) => {
        if (dataset.models && dataset.models.length > 0) {
          dataset.models.forEach((model) => {
            jobs.push({
              id: model.id,
              dataset_id: dataset.id,
              dataset_name: dataset.filename || dataset.id,
              status: model.status,
              started_at: model.created_at || new Date().toISOString(),
              training_time_seconds: model.training_time_seconds,
              final_loss: model.final_loss,
              epochs_trained: model.config?.epochs || 0,
              total_epochs: model.config?.epochs || 100,
            });
          });
        }

        // Also include latest training job if not in models
        if (
          dataset.latest_training_job &&
          !dataset.models?.some((m) => m.id === dataset.latest_training_job?.job_id)
        ) {
          jobs.push({
            id: dataset.latest_training_job.job_id,
            dataset_id: dataset.id,
            dataset_name: dataset.filename || dataset.id,
            status: dataset.latest_training_job.status,
            started_at: dataset.latest_training_job.created_at || new Date().toISOString(),
            training_time_seconds: undefined,
            final_loss: undefined,
            epochs_trained: dataset.latest_training_job.current_epoch,
            total_epochs: dataset.latest_training_job.total_epochs || 100,
          });
        }
      });

      setTrainingJobs(jobs.sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load training analysis.');
    } finally {
      setIsLoading_(false);
    }
  }, [session]);

  useEffect(() => {
    fetchDatasets();
  }, [fetchDatasets]);

  const filteredJobs = selectedStatus ? trainingJobs.filter((job) => job.status === selectedStatus) : trainingJobs;

  const statusCounts = {
    completed: trainingJobs.filter((j) => j.status === 'completed').length,
    failed: trainingJobs.filter((j) => j.status === 'failed').length,
    training: trainingJobs.filter((j) => ['queued', 'training'].includes(j.status)).length,
  };

  if (isLoading || !session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Training Analysis</h1>
            <p className="mt-2 text-muted-foreground">
              View all training jobs and their metrics across all datasets.
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push('/dashboard')} className="gap-2 w-fit">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20 mb-6">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{statusCounts.completed}</div>
              <p className="text-xs text-muted-foreground mt-1">successful trainings</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{statusCounts.training}</div>
              <p className="text-xs text-muted-foreground mt-1">active jobs</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{statusCounts.failed}</div>
              <p className="text-xs text-muted-foreground mt-1">failed trainings</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Buttons */}
        <div className="mb-6 flex flex-wrap gap-2">
          <Button
            variant={selectedStatus === null ? 'default' : 'outline'}
            onClick={() => setSelectedStatus(null)}
            size="sm"
          >
            All ({trainingJobs.length})
          </Button>
          <Button
            variant={selectedStatus === 'completed' ? 'default' : 'outline'}
            onClick={() => setSelectedStatus('completed')}
            size="sm"
          >
            Completed ({statusCounts.completed})
          </Button>
          <Button
            variant={selectedStatus === 'training' ? 'default' : 'outline'}
            onClick={() => setSelectedStatus('training')}
            size="sm"
          >
            In Progress ({statusCounts.training})
          </Button>
          <Button
            variant={selectedStatus === 'failed' ? 'default' : 'outline'}
            onClick={() => setSelectedStatus('failed')}
            size="sm"
          >
            Failed ({statusCounts.failed})
          </Button>
        </div>

        {/* Training Jobs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Training Jobs</CardTitle>
            <CardDescription>
              {selectedStatus ? `Showing ${selectedStatus} trainings` : 'All training jobs across datasets'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredJobs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  {selectedStatus ? 'No jobs with this status.' : 'No training jobs yet.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job ID</TableHead>
                      <TableHead>Dataset</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Training Time</TableHead>
                      <TableHead>Epochs</TableHead>
                      <TableHead>Final Loss</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredJobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-mono text-sm max-w-xs truncate">
                          {job.id}
                        </TableCell>
                        <TableCell className="font-medium">{job.dataset_name}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              job.status === 'completed'
                                ? 'default'
                                : job.status === 'failed'
                                  ? 'destructive'
                                  : 'secondary'
                            }
                          >
                            {job.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {new Date(job.started_at).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          {job.training_time_seconds ? (
                            <span className="text-sm">
                              {Math.round(job.training_time_seconds / 60)}m {Math.round(job.training_time_seconds % 60)}s
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {job.epochs_trained || 0} / {job.total_epochs}
                          </span>
                        </TableCell>
                        <TableCell>
                          {job.final_loss !== null && job.final_loss !== undefined ? (
                            <span className="text-sm font-mono">{job.final_loss.toFixed(4)}</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Future Analytics Section Placeholder */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Training Metrics & Visualization</CardTitle>
            <CardDescription>Coming soon: loss curves, model comparison, and detailed metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">
                Advanced training analytics and visualization tools will be available here.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                This section will include loss history charts, training comparison graphs, and detailed SDMetrics reports.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
