'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadSection } from '@/components/UploadSection';
import { SchemaDetectionTable } from '@/components/SchemaDetectionTable';
import { TargetColumnCard } from '@/components/TargetColumnCard';
import { ClassImbalanceWarning } from '@/components/ClassImbalanceWarning';
import { FeatureStatisticsDashboard } from '@/components/FeatureStatisticsDashboard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, FileUp, LogOut, Play, RefreshCw, Sparkles, Trash2 } from 'lucide-react';
import { useRequireAuth } from '@/components/AuthProvider';
import { DatasetMetadata, DatasetSummary, deleteDataset, listDatasets } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const { session, isLoading, logout } = useRequireAuth();
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success'>('idle');
  const [datasetMetadata, setDatasetMetadata] = useState<DatasetMetadata | null>(null);
  const [selectedTarget, setSelectedTarget] = useState('fraud');
  const [datasets, setDatasets] = useState<DatasetSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const realDatasets = useMemo(
    () => datasets.filter((dataset) => dataset.dataset_type !== 'synthetic'),
    [datasets]
  );

  const syntheticDatasets = useMemo(
    () => datasets.filter((dataset) => dataset.dataset_type === 'synthetic'),
    [datasets]
  );

  const refreshDatasets = useCallback(async () => {
    if (!session) return;
    setIsRefreshing(true);
    setError(null);
    try {
      const response = await listDatasets(session);
      setDatasets(response.datasets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load datasets.');
    } finally {
      setIsRefreshing(false);
    }
  }, [session]);

  useEffect(() => {
    refreshDatasets();
  }, [refreshDatasets]);

  const handleUploadComplete = async (data: DatasetMetadata) => {
    setDatasetMetadata(data);
    setUploadStatus('success');
    setError(null);
    await refreshDatasets();
  };

  const handleTrain = (dataset: DatasetSummary) => {
    router.push(`/train?datasetId=${dataset.id}`);
  };

  const handleGenerate = (dataset: DatasetSummary) => {
    router.push(`/generate?datasetId=${dataset.id}`);
  };

  const handleDelete = async (dataset: DatasetSummary) => {
    if (!window.confirm(`Delete ${dataset.filename || dataset.id}?`)) return;
    try {
      await deleteDataset(dataset.id, session);
      await refreshDatasets();
      if (datasetMetadata?.dataset_id === dataset.id) {
        setDatasetMetadata(null);
        setUploadStatus('idle');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed.');
    }
  };

  if (isLoading || !session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border/40 bg-background/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Database className="h-6 w-6" />
            <h1 className="text-xl font-bold">Synthetic Data Generator</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">{session.user.email}</span>
            <Button variant="outline" size="sm" onClick={logout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dataset Workspace</h1>
            <p className="mt-2 text-muted-foreground">
              Upload datasets, train Modal-backed models, and generate synthetic records.
            </p>
          </div>
          <Button variant="outline" onClick={refreshDatasets} disabled={isRefreshing} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
        )}

        <section className="grid gap-6 md:grid-cols-3">
          <MetricCard label="Real datasets" value={realDatasets.length} />
          <MetricCard label="Trained models" value={realDatasets.filter((dataset) => dataset.has_model).length} />
          <MetricCard label="Synthetic datasets" value={syntheticDatasets.length} />
        </section>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <Card>
            <CardHeader>
              <CardTitle>Datasets</CardTitle>
              <CardDescription>Owned by your signed-in account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {datasets.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-10 text-center">
                  <FileUp className="mb-3 h-8 w-8 text-muted-foreground" />
                  <p className="font-medium">No datasets yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">Upload a CSV to start the workflow.</p>
                </div>
              ) : (
                datasets.map((dataset) => (
                  <div
                    key={dataset.id}
                    className="flex flex-col gap-4 rounded-md border p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-medium">{dataset.filename || dataset.id}</p>
                        <Badge variant={dataset.dataset_type === 'synthetic' ? 'secondary' : 'outline'}>
                          {dataset.dataset_type}
                        </Badge>
                        {dataset.has_model && <Badge>trained</Badge>}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span>{dataset.n_rows.toLocaleString()} rows</span>
                        <span>{dataset.n_features} features</span>
                        {dataset.target && <span>target: {dataset.target}</span>}
                        {dataset.latest_training_job && (
                          <span>training: {dataset.latest_training_job.status}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      {dataset.dataset_type !== 'synthetic' && (
                        <Button size="sm" onClick={() => handleTrain(dataset)} className="gap-2">
                          <Play className="h-4 w-4" />
                          Train
                        </Button>
                      )}
                      {dataset.dataset_type !== 'synthetic' && dataset.has_model && (
                        <Button size="sm" variant="outline" onClick={() => handleGenerate(dataset)} className="gap-2">
                          <Sparkles className="h-4 w-4" />
                          Generate
                        </Button>
                      )}
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(dataset)} title="Delete dataset">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <UploadSection
            onUploadComplete={handleUploadComplete}
            isLoading={uploadStatus === 'uploading'}
            error={null}
            onTargetChange={setSelectedTarget}
            selectedTarget={selectedTarget}
          />
        </section>

        {uploadStatus === 'success' && datasetMetadata && (
          <section className="space-y-6">
            <div className="rounded-md bg-muted/50 p-6">
              <h2 className="text-2xl font-bold">Latest Upload Analysis</h2>
              <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                <Summary label="Rows" value={datasetMetadata.n_rows.toLocaleString()} />
                <Summary label="Features" value={datasetMetadata.n_features.toString()} />
                <Summary label="Dataset ID" value={`${datasetMetadata.dataset_id.slice(0, 12)}...`} />
                <Summary label="Target" value={selectedTarget} />
              </div>
            </div>

            {datasetMetadata.schema.features[selectedTarget] && (
              <ClassImbalanceWarning
                classDistribution={datasetMetadata.class_dist}
                selectedTarget={selectedTarget}
              />
            )}
            {datasetMetadata.schema.features[selectedTarget] && (
              <TargetColumnCard targetColumn={selectedTarget} classDistribution={datasetMetadata.class_dist} />
            )}
            <SchemaDetectionTable features={datasetMetadata.schema.features} />
            <FeatureStatisticsDashboard features={datasetMetadata.schema.features} />
          </section>
        )}
      </main>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="truncate text-xl font-bold">{value}</p>
    </div>
  );
}
