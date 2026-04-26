'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadSection } from '@/components/UploadSection';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, LogOut, RefreshCw } from 'lucide-react';
import { useRequireAuth } from '@/components/AuthProvider';
import { DatasetMetadata, DatasetSummary, deleteDataset, listDatasets } from '@/lib/api';
import { ThemeToggle } from '@/components/ThemeToggle';
import { DatasetCard } from '@/components/DatasetCard';
import { DatasetAnalysisModal } from '@/components/DatasetAnalysisModal';

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
    // If we have the metadata already, show modal. Otherwise, need to fetch it
    if (datasetMetadata?.dataset_id === dataset.id) {
      setShowAnalysisModal(true);
    } else {
      // For now, just show a message. In production, you'd fetch the analysis
      setShowAnalysisModal(true);
    }
  };

  if (isLoading || !session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
        {/* Header Section */}
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

        {/* Error Alert */}
        {error && (
          <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20">
            {error}
          </div>
        )}

        {/* Metrics */}
        <section className="grid gap-4 md:grid-cols-3">
          <MetricCard
            label="Real Datasets"
            value={realDatasets.length}
            description="Uploaded datasets"
          />
          <MetricCard
            label="Trained Models"
            value={realDatasets.filter((d) => d.has_model).length}
            description="Ready to generate"
          />
          <MetricCard
            label="Synthetic Datasets"
            value={syntheticDatasets.length}
            description="Generated data"
          />
        </section>

        {/* Main Layout */}
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Datasets Section */}
          <div className="space-y-6">
            {/* Real Datasets */}
            {realDatasets.length > 0 && (
              <section className="space-y-4">
                <h3 className="text-lg font-semibold">Real Datasets</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {realDatasets.map((dataset) => (
                    <DatasetCard
                      key={dataset.id}
                      dataset={dataset}
                      onViewAnalysis={handleViewAnalysis}
                      onTrain={handleTrain}
                      onGenerate={handleGenerate}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Synthetic Datasets */}
            {syntheticDatasets.length > 0 && (
              <section className="space-y-4">
                <h3 className="text-lg font-semibold">Generated Synthetic Data</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {syntheticDatasets.map((dataset) => (
                    <DatasetCard
                      key={dataset.id}
                      dataset={dataset}
                      onViewAnalysis={handleViewAnalysis}
                      onTrain={handleTrain}
                      onGenerate={handleGenerate}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Empty State */}
            {datasets.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Database className="mb-4 h-12 w-12 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold">No datasets yet</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Upload a CSV file to get started with your first dataset.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Upload Section */}
          <div>
            <UploadSection
              onUploadComplete={handleUploadComplete}
              isLoading={uploadStatus === 'uploading'}
              error={null}
              onTargetChange={setSelectedTarget}
              selectedTarget={selectedTarget}
            />
          </div>
        </div>
      </main>

      {/* Analysis Modal */}
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

function MetricCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="mt-2 text-4xl font-bold">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
