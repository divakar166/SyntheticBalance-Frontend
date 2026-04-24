'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StepIndicator } from '@/components/StepIndicator';
import { TrainingConfigSection } from '@/components/TrainingConfigSection';
import { TrainingProgressSection } from '@/components/TrainingProgressSection';
import { TrainingCompletedSection } from '@/components/TrainingCompletedSection';

interface TrainingConfig {
    epochs: number;
    batchSize: number;
    model: 'CTGAN' | 'Tabular Diffusion';
}

interface TrainingStatus {
    status: 'idle' | 'training' | 'completed' | 'failed';
    currentEpoch: number;
    lossHistory: number[];
    elapsedTime: number;
    modelId?: string;
    epochsRun?: number;
    trainingTime?: number;
    finalLoss?: number;
}

export default function TrainPage() {
    const [datasetId, setDatasetId] = useState('');
    const [selectedTarget, setSelectedTarget] = useState('');
    const [trainingConfig, setTrainingConfig] = useState<TrainingConfig>({
        epochs: 100,
        batchSize: 256,
        model: 'CTGAN',
    });
    const [trainingStatus, setTrainingStatus] = useState<TrainingStatus>({
        status: 'idle',
        currentEpoch: 0,
        lossHistory: [],
        elapsedTime: 0,
    });

    // Load dataset metadata from sessionStorage
    useEffect(() => {
        const metadata = sessionStorage.getItem('datasetMetadata');
        if (metadata) {
            try {
                const parsed = JSON.parse(metadata);
                setDatasetId(parsed.dataset_id);
                setSelectedTarget(parsed.selectedTarget);
            } catch (err) {
                console.error('Failed to parse dataset metadata:', err);
            }
        }
    }, []);

    // Poll training status
    useEffect(() => {
        if (trainingStatus.status !== 'training') return;

        const interval = setInterval(async () => {
            try {
                const response = await fetch(
                    `http://localhost:8000/api/train-status/${datasetId}`
                );
                const data = await response.json();

                setTrainingStatus((prev) => ({
                    ...prev,
                    status: data.status === 'done' ? 'completed' : data.status === 'failed' ? 'failed' : 'training',
                    currentEpoch: data.current_epoch,
                    lossHistory: data.loss_history,
                }));

                if (data.status === 'done') {
                    clearInterval(interval);
                }
            } catch (error) {
                console.error('Error polling training status:', error);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [trainingStatus.status, datasetId]);

    // Track elapsed time
    useEffect(() => {
        if (trainingStatus.status !== 'training') return;

        const interval = setInterval(() => {
            setTrainingStatus((prev) => ({
                ...prev,
                elapsedTime: prev.elapsedTime + 1,
            }));
        }, 1000);

        return () => clearInterval(interval);
    }, [trainingStatus.status]);

    const handleStartTraining = async () => {
        setTrainingStatus({
            status: 'training',
            currentEpoch: 0,
            lossHistory: [],
            elapsedTime: 0,
        });

        try {
            const response = await fetch('http://localhost:8000/api/train-ctgan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dataset_id: datasetId,
                    epochs: trainingConfig.epochs,
                    batch_size: trainingConfig.batchSize,
                }),
            });

            const data = await response.json();
            if (data.status === 'trained') {
                setTrainingStatus((prev) => ({
                    ...prev,
                    status: 'completed',
                    modelId: data.model_id,
                    epochsRun: data.epochs_run,
                    trainingTime: data.training_time_seconds,
                    finalLoss: data.final_loss,
                }));
            }
        } catch (error) {
            console.error('Training error:', error);
            setTrainingStatus((prev) => ({
                ...prev,
                status: 'failed',
            }));
        }
    };

    const handleCancel = () => {
        setTrainingStatus({
            status: 'idle',
            currentEpoch: 0,
            lossHistory: [],
            elapsedTime: 0,
        });
    };

    const handleProceedToGenerate = () => {
        console.log('Proceeding to generate synthetic data with model:', trainingStatus.modelId);
        // TODO: Navigate to generation page
    };

    return (
        <div className="min-h-screen bg-background">
            <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Step Indicator */}
                <StepIndicator currentStep={2} totalSteps={6} />

                {/* Header */}
                <div className="mb-12 mt-8">
                    <h1 className="text-4xl font-bold tracking-tight">
                        Train Model
                    </h1>
                    <p className="mt-2 text-lg text-muted-foreground">
                        Configure and train your synthetic data generation model
                    </p>
                </div>

                {/* Target Column Display */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="text-base">Selected Target Column</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Badge variant="secondary" className="text-sm px-3 py-1">
                            {selectedTarget}
                        </Badge>
                    </CardContent>
                </Card>

                {/* Main Content */}
                {trainingStatus.status === 'idle' && (
                    <TrainingConfigSection
                        config={trainingConfig}
                        onConfigChange={setTrainingConfig}
                        onStartTraining={handleStartTraining}
                    />
                )}

                {trainingStatus.status === 'training' && (
                    <TrainingProgressSection
                        config={trainingConfig}
                        status={trainingStatus}
                        onCancel={handleCancel}
                    />
                )}

                {trainingStatus.status === 'completed' && (
                    <TrainingCompletedSection
                        status={trainingStatus}
                        onProceed={handleProceedToGenerate}
                    />
                )}

                {trainingStatus.status === 'failed' && (
                    <Card className="border-2 border-destructive">
                        <CardHeader>
                            <CardTitle className="text-destructive">Training Failed</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground mb-4">
                                An error occurred during model training. Please review your configuration and try again.
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
