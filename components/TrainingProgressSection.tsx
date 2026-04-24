import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

interface TrainingProgressSectionProps {
    config: TrainingConfig;
    status: TrainingStatus;
    onCancel: () => void;
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

export function TrainingProgressSection({
    config,
    status,
    onCancel,
}: TrainingProgressSectionProps) {
    const progress = (status.currentEpoch / config.epochs) * 100;

    // Prepare chart data
    const chartData = status.lossHistory.map((loss, index) => ({
        epoch: index + 1,
        loss: parseFloat(loss.toFixed(4)),
    }));

    return (
        <div className="space-y-8">
            {/* Progress Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Training in Progress</CardTitle>
                    <CardDescription>
                        {config.model} • {config.epochs} epochs • Batch size {config.batchSize}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Epoch Progress */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Epoch Progress</span>
                            <span className="text-sm font-bold text-primary">
                                {status.currentEpoch} / {config.epochs}
                            </span>
                        </div>
                        <Progress value={progress} className="h-3" />
                        <p className="text-xs text-muted-foreground">
                            {progress.toFixed(1)}% complete
                        </p>
                    </div>

                    {/* Elapsed Time */}
                    <div className="rounded-lg bg-muted/50 p-4">
                        <p className="text-sm text-muted-foreground mb-1">Elapsed Time</p>
                        <p className="text-2xl font-bold font-mono">
                            {formatTime(status.elapsedTime)}
                        </p>
                    </div>

                    {/* Loss Chart */}
                    {chartData.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium">Training Loss History</h4>
                            <div className="h-64 w-full rounded-lg border border-border bg-muted/20">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                        <XAxis
                                            dataKey="epoch"
                                            stroke="hsl(var(--muted-foreground))"
                                            style={{ fontSize: '12px' }}
                                        />
                                        <YAxis
                                            stroke="hsl(var(--muted-foreground))"
                                            style={{ fontSize: '12px' }}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'hsl(var(--background))',
                                                border: '1px solid hsl(var(--border))',
                                                borderRadius: '6px',
                                            }}
                                            formatter={(value: number) => value.toFixed(4)}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="loss"
                                            stroke="hsl(var(--primary))"
                                            strokeWidth={2}
                                            dot={false}
                                            isAnimationActive={false}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* Live Log Console */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium">Training Log</h4>
                        <div className="h-48 rounded-lg border border-border bg-slate-950 p-4 overflow-y-auto font-mono text-sm text-green-400">
                            {status.lossHistory.map((loss, index) => (
                                <div key={index} className="mb-1">
                                    <span className="text-muted-foreground">[Epoch {index + 1}]</span>{' '}
                                    <span>Loss: {loss.toFixed(4)}</span>
                                </div>
                            ))}
                            {status.currentEpoch === 0 && (
                                <div className="text-muted-foreground">Initializing training...</div>
                            )}
                        </div>
                    </div>

                    {/* Cancel Button */}
                    <Button onClick={onCancel} variant="outline" className="w-full">
                        Cancel Training
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
