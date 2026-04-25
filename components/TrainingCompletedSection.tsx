import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2 } from 'lucide-react';

interface TrainingStatus {
    status: 'idle' | 'training' | 'completed' | 'failed';
    currentEpoch: number;
    lossHistory: unknown[];
    elapsedTime: number;
    modelId?: string;
    epochsRun?: number;
    trainingTime?: number;
    finalLoss?: number;
}

interface TrainingCompletedSectionProps {
    status: TrainingStatus;
    onProceed: () => void;
}

function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s`;
    }
    if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
}

export function TrainingCompletedSection({
    status,
    onProceed,
}: TrainingCompletedSectionProps) {
    return (
        <div className="space-y-8">
            {/* Success Alert */}
            <Alert className="border-2 border-green-500 bg-green-50 dark:bg-green-950">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-800 dark:text-green-200 ml-3">
                    Model trained successfully! Your synthetic data generation model is ready to use.
                </AlertDescription>
            </Alert>

            {/* Summary Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Training Summary</CardTitle>
                    <CardDescription>Review the training results</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                        {/* Epochs Run */}
                        <div className="rounded-lg border border-border bg-muted/50 p-4">
                            <p className="text-sm text-muted-foreground mb-1">Epochs Completed</p>
                            <p className="text-3xl font-bold">{status.epochsRun || 0}</p>
                        </div>

                        {/* Training Time */}
                        <div className="rounded-lg border border-border bg-muted/50 p-4">
                            <p className="text-sm text-muted-foreground mb-1">Total Training Time</p>
                            <p className="text-2xl font-bold">
                                {formatTime(status.trainingTime || 0)}
                            </p>
                        </div>

                        {/* Final Loss */}
                        <div className="rounded-lg border border-border bg-muted/50 p-4">
                            <p className="text-sm text-muted-foreground mb-1">Final Loss</p>
                            <p className="text-2xl font-bold font-mono">
                                {(status.finalLoss || 0).toFixed(4)}
                            </p>
                        </div>

                        {/* Model ID */}
                        <div className="rounded-lg border border-border bg-muted/50 p-4">
                            <p className="text-sm text-muted-foreground mb-1">Model ID</p>
                            <p className="text-xs font-mono truncate" title={status.modelId}>
                                {status.modelId?.slice(0, 12)}...
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
                <CardHeader>
                    <CardTitle>What&apos;s Next?</CardTitle>
                    <CardDescription>
                        Your model is ready for generating synthetic data
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        You can now proceed to generate balanced synthetic data using your trained model. This will help you create a balanced dataset for training your machine learning models.
                    </p>
                    <Button onClick={onProceed} size="lg" className="w-full">
                        Proceed to Generate Data
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
