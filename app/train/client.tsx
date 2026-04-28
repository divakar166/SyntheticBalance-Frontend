'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StepIndicator } from '@/components/StepIndicator';
import { TrainingConfigSection } from '@/components/TrainingConfigSection';
import { TrainingProgressSection } from '@/components/TrainingProgressSection';
import { TrainingCompletedSection } from '@/components/TrainingCompletedSection';
import { useRequireAuth } from '@/components/AuthProvider';
import { type TrainingConfig, LossPoint, getTrainingStatus, startTraining } from '@/lib/api';

interface TrainingStatus {
  status: 'idle' | 'queued' | 'training' | 'completed' | 'failed';
  currentEpoch: number;
  totalEpochs: number;
  lossHistory: LossPoint[];
  elapsedTime: number;
  jobId?: string;
  modelId?: string;
  trainingTime?: number;
  finalLoss?: number;
  error?: string;
}

function normalizeStatus(status: string): TrainingStatus['status'] {
  if (status === 'completed' || status === 'done' || status === 'trained') return 'completed';
  if (status === 'failed') return 'failed';
  if (status === 'queued') return 'queued';
  return 'training';
}

export function TrainPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, isLoading } = useRequireAuth();
  const [datasetId, setDatasetId] = useState('');
  const [trainingConfig, setTrainingConfig] = useState<TrainingConfig>({
    epochs: 100,
    batch_size: 256,
    embedding_dim: 128,
    generator_dim: [128, 128],
    discriminator_dim: [128, 128],
    generator_lr: 2e-4,
    discriminator_lr: 2e-4,
    discriminator_steps: 1,
    early_stopping: true,
    early_stopping_patience: 20,
    early_stopping_min_delta: 0.001,
    run_sdmetrics: true,
    sdmetrics_n_samples: 2000,
  });
  const [trainingStatus, setTrainingStatus] = useState<TrainingStatus>({
    status: 'idle',
    currentEpoch: 0,
    totalEpochs: 100,
    lossHistory: [],
    elapsedTime: 0,
  });

  useEffect(() => {
    const queryDatasetId = searchParams.get('datasetId');
    if (queryDatasetId) {
      setDatasetId(queryDatasetId);
      return;
    }

    const metadata = sessionStorage.getItem('datasetMetadata');
    if (metadata) {
      try {
        const parsed = JSON.parse(metadata);
        setDatasetId(parsed.dataset_id);
      } catch (err) {
        console.error('Failed to parse dataset metadata:', err);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (!trainingStatus.jobId || !['queued', 'training'].includes(trainingStatus.status)) return;

    const interval = setInterval(async () => {
      try {
        const data = await getTrainingStatus(trainingStatus.jobId as string, session);
        const nextStatus = normalizeStatus(data.status);
        setTrainingStatus((prev) => ({
          ...prev,
          status: nextStatus,
          currentEpoch: data.current_epoch,
          totalEpochs: data.total_epochs,
          lossHistory: data.loss_history,
          modelId: data.model_id || undefined,
          trainingTime: data.training_time_seconds || undefined,
          finalLoss: data.final_loss || undefined,
          error: data.error || undefined,
        }));
      } catch (error) {
        setTrainingStatus((prev) => ({
          ...prev,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Could not poll training status.',
        }));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [session, trainingStatus.jobId, trainingStatus.status]);

  useEffect(() => {
    if (!['queued', 'training'].includes(trainingStatus.status)) return;

    const interval = setInterval(() => {
      setTrainingStatus((prev) => ({
        ...prev,
        elapsedTime: prev.elapsedTime + 1,
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [trainingStatus.status]);

  const handleStartTraining = async () => {
    if (!datasetId) return;

    setTrainingStatus({
      status: 'queued',
      currentEpoch: 0,
      totalEpochs: trainingConfig.epochs,
      lossHistory: [],
      elapsedTime: 0,
    });

    try {
      const data = await startTraining(datasetId, trainingConfig, session);
      setTrainingStatus((prev) => ({
        ...prev,
        status: normalizeStatus(data.status),
        jobId: data.job_id,
      }));
    } catch (error) {
      setTrainingStatus((prev) => ({
        ...prev,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Training failed to start.',
      }));
    }
  };

  const handleCancel = () => {
    setTrainingStatus({
      status: 'idle',
      currentEpoch: 0,
      totalEpochs: trainingConfig.epochs,
      lossHistory: [],
      elapsedTime: 0,
    });
  };

  const handleProceedToGenerate = () => {
    router.push(`/generate?datasetId=${datasetId}`);
  };

  if (isLoading || !session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <StepIndicator currentStep={2} totalSteps={3} />

        <div className="mb-8 mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Train Model</h1>
            <p className="mt-2 text-muted-foreground">
              Dispatch CTGAN training to the backend Modal GPU workflow.
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-base">Dataset</CardTitle>
          </CardHeader>
          <CardContent>
            {datasetId ? (
              <Badge variant="secondary" className="px-3 py-1 font-mono text-sm">
                {datasetId}
              </Badge>
            ) : (
              <p className="text-sm text-muted-foreground">Choose a dataset from the dashboard.</p>
            )}
          </CardContent>
        </Card>

        {trainingStatus.status === 'idle' && (
          <TrainingConfigSection
            config={trainingConfig}
            onConfigChange={setTrainingConfig}
            onStartTraining={handleStartTraining}
          />
        )}

        {['queued', 'training'].includes(trainingStatus.status) && (
          <TrainingProgressSection
            config={trainingConfig}
            status={{
              status: 'training',
              currentEpoch: trainingStatus.currentEpoch,
              totalEpochs: trainingStatus.totalEpochs,
              lossHistory: trainingStatus.lossHistory,
              elapsedTime: trainingStatus.elapsedTime,
            }}
            onCancel={handleCancel}
          />
        )}

        {trainingStatus.status === 'completed' && (
          <TrainingCompletedSection
            status={{
              status: 'completed',
              currentEpoch: trainingStatus.currentEpoch,
              lossHistory: trainingStatus.lossHistory,
              elapsedTime: trainingStatus.elapsedTime,
              modelId: trainingStatus.modelId,
              epochsRun: trainingStatus.currentEpoch || trainingStatus.totalEpochs,
              trainingTime: trainingStatus.trainingTime,
              finalLoss: trainingStatus.finalLoss,
            }}
            onProceed={handleProceedToGenerate}
          />
        )}

        {trainingStatus.status === 'failed' && (
          <Card className="border-2 border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Training Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-muted-foreground">
                {trainingStatus.error || 'An error occurred during model training.'}
              </p>
              <Button onClick={handleCancel} variant="outline">
                Back to Configuration
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
