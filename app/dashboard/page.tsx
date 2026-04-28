'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadSection } from '@/components/UploadSection';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Database, LogOut, RefreshCw } from 'lucide-react';
import { useRequireAuth } from '@/components/AuthProvider';
import { DatasetMetadata, DatasetSummary, deleteDataset, listDatasets } from '@/lib/api';
import { ThemeToggle } from '@/components/ThemeToggle';
import { DatasetAnalysisModal } from '@/components/DatasetAnalysisModal';
import { DatasetsTable } from '@/components/DatasetsTable';
import { ModelsTable } from '@/components/ModelsTable';
import { SyntheticDataTable } from '@/components/SyntheticDataTable';

export default function DashboardPage() {
  const router = useRouter();
  const { session, isLoading, logout } = useRequireAuth();
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success'>('idle');
  const [datasetMetadata, setDatasetMetadata] = useState<DatasetMetadata | null>(null);
  const [selectedTarget, setSelectedTarget] = useState('fraud');
  const [datasets, setDatasets] = useState<DatasetSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [selectedDatasetForAnalysis, setSelectedDatasetForAnalysis] = useState<DatasetSummary | null>(null);
  const [selectedDataset, setSelectedDataset] = useState<DatasetSummary | null>(null);

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

  const handleViewAnalysis = async (dataset: DatasetSummary) => {
    setSelectedDatasetForAnalysis(dataset);
    if (!datasetMetadata || datasetMetadata.dataset_id !== dataset.id) {
      setDatasetMetadata({
        dataset_id: dataset.id,
        n_rows: dataset.n_rows,
        n_features: dataset.n_features,
        class_dist: dataset.class_dist,
        schema: dataset.schema
          ? { ...dataset.schema, features: dataset.schema.features ?? {} }
          : { features: {} },
        filename: dataset.filename,
        target_column: dataset.target,
      });
    }
    if (dataset.target) {
      setSelectedTarget(dataset.target);
    }
    setShowAnalysisModal(true);
  };

  if (isLoading || !session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Database className="h-6 w-6" />
            <h1 className="text-xl font-bold">Synthetic Data Generator</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <span className="hidden text-sm text-muted-foreground sm:inline">{session.user.email}</span>
            <Button variant="outline" size="sm" onClick={logout} className="gap-2">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dataset Workspace</h2>
            <p className="mt-2 text-muted-foreground">
              Manage your datasets through the ML pipeline from upload to synthetic data generation.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={refreshDatasets}
            disabled={isRefreshing}
            className="gap-2 w-fit"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20">
            {error}
          </div>
        )}

        <section className="space-y-6">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Datasets</h3>
              <Button variant="outline" size="sm" asChild>
                <a href="/dashboard/training-analysis">View Training Analysis</a>
              </Button>
            </div>
            <DatasetsTable
              datasets={realDatasets}
              onTrain={handleTrain}
              onGenerate={handleGenerate}
              onDelete={handleDelete}
              onViewAnalysis={handleViewAnalysis}
            />
          </section>

          {selectedDataset && (
            <section className="space-y-4">
              <h3 className="text-lg font-semibold">
                Models for {selectedDataset.filename || selectedDataset.id}
              </h3>
              <ModelsTable
                models={selectedDataset.models || []}
                onGenerate={(model) => {
                  router.push(`/generate?datasetId=${selectedDataset.id}&modelId=${model.id}`);
                }}
                onRetrain={(model) => {
                  router.push(`/train?datasetId=${selectedDataset.id}&modelId=${model.id}`);
                }}
                onDelete={(model) => {
                  if (!window.confirm('Delete this model?')) return;
                  // TODO: Implement model deletion
                }}
              />
            </section>
          )}

          {realDatasets.some((d) => (d.synthetic_data || []).length > 0) && (
            <section className="space-y-4">
              <h3 className="text-lg font-semibold">Generated Synthetic Data</h3>
              <div className="space-y-4">
                {realDatasets
                  .filter((d) => (d.synthetic_data || []).length > 0)
                  .map((dataset) => (
                    <SyntheticDataTable
                      key={dataset.id}
                      syntheticData={dataset.synthetic_data || []}
                      onDelete={(data) => {
                        if (!window.confirm('Delete this synthetic dataset?')) return;
                        // TODO: Implement synthetic data deletion
                      }}
                    />
                  ))}
              </div>
            </section>
          )}
        </section>

        <div className="fixed bottom-6 right-6 sm:relative sm:bottom-auto sm:right-auto sm:mt-8">
          <UploadSection
            onUploadComplete={handleUploadComplete}
            isLoading={uploadStatus === 'uploading'}
            error={null}
            onTargetChange={setSelectedTarget}
            selectedTarget={selectedTarget}
          />
        </div>
      </main>

      {selectedDatasetForAnalysis && (
        <DatasetAnalysisModal
          isOpen={showAnalysisModal}
          onClose={() => {
            setShowAnalysisModal(false);
            setSelectedDatasetForAnalysis(null);
          }}
          datasetMetadata={datasetMetadata}
          selectedTarget={selectedTarget}
          onTargetChange={setSelectedTarget}
        />
      )}
    </div>
  );
}
