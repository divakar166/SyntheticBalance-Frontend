'use client';

import { useState } from 'react';
import { UploadSection } from '@/components/UploadSection';
import { SchemaDetectionTable } from '@/components/SchemaDetectionTable';
import { TargetColumnCard } from '@/components/TargetColumnCard';
import { ClassImbalanceWarning } from '@/components/ClassImbalanceWarning';
import { FeatureStatisticsDashboard } from '@/components/FeatureStatisticsDashboard';
import { NavigationFooter } from '@/components/NavigationFooter';
import { useRouter } from 'next/navigation';

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

interface DatasetMetadata {
  dataset_id: string;
  n_rows: number;
  n_features: number;
  class_dist: Record<string, number>;
  schema: {
    features: Record<string, any>;
    target: {
      name: string;
      type: string;
      cardinality: number;
      missing_count: number;
      missing_pct: number;
      class_distribution: Record<string, number>;
    };
    skipped_features: string[];
  };
  class_imbalance: ClassImbalanceInfo;
  filename?: string;
  target_column?: string;
}

export default function Home() {
  const router = useRouter();
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [datasetMetadata, setDatasetMetadata] = useState<DatasetMetadata | null>(null);
  const [selectedTarget, setSelectedTarget] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleUploadComplete = (data: DatasetMetadata) => {
    setDatasetMetadata(data);
    setUploadStatus('success');
    setError(null);
    // Auto-set target from schema
    const targetName = data.schema?.target?.name ?? data.target_column ?? '';
    setSelectedTarget(targetName);
  };

  const handleProceed = () => {
    if (datasetMetadata) {
      sessionStorage.setItem('datasetMetadata', JSON.stringify({
        ...datasetMetadata,
        selectedTarget,
      }));
      router.push('/train');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight">
            Synthetic Data Generator
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Upload your dataset and explore its structure to generate balanced training data
          </p>
        </div>

        {/* Main Content */}
        {uploadStatus === 'idle' ? (
          // Initial Upload State
          <UploadSection
            onUploadComplete={handleUploadComplete}
            isLoading={uploadStatus === 'uploading'}
            error={error}
            onTargetChange={setSelectedTarget}
            selectedTarget={selectedTarget}
          />
        ) : uploadStatus === 'success' && datasetMetadata ? (
          // Post-Upload Analysis State
          <div className="space-y-8">
            {/* Dataset Summary Header */}
            <div className="rounded-lg bg-muted/50 p-6">
              <h2 className="text-2xl font-bold">Dataset Analysis</h2>
              <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Rows</p>
                  <p className="text-2xl font-bold">
                    {datasetMetadata.n_rows.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Features</p>
                  <p className="text-2xl font-bold">{datasetMetadata.n_features}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dataset ID</p>
                  <p className="truncate text-sm font-mono">{datasetMetadata.dataset_id.slice(0, 12)}...</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Target Column</p>
                  <p className="text-2xl font-bold">{selectedTarget}</p>
                </div>
              </div>
            </div>

            {/* Class Imbalance Warning — use backend's computed info when available */}
            <ClassImbalanceWarning
              classDistribution={datasetMetadata.class_dist}
              selectedTarget={selectedTarget}
              classImbalanceInfo={datasetMetadata.class_imbalance}
            />

            {/* Target Column Visualization */}
            <TargetColumnCard
              targetColumn={selectedTarget}
              classDistribution={datasetMetadata.class_dist}
            />

            {/* Feature Schema Table */}
            <SchemaDetectionTable features={datasetMetadata.schema.features} />

            {/* Feature Statistics Dashboard */}
            <FeatureStatisticsDashboard features={datasetMetadata.schema.features} />

            {/* Navigation Footer */}
            <NavigationFooter
              onProceed={handleProceed}
              isLoaded={uploadStatus === 'success'}
            />
          </div>
        ) : null}
      </main>
    </div>
  );
}