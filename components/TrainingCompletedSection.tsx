import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
    CheckCircle2,
    Zap,
    Clock,
    TrendingDown,
    BarChart3,
    ShieldCheck,
    AlertTriangle,
    Trophy,
    Activity,
    Cpu,
} from 'lucide-react';
import type { SDMetricsReport, LossPoint } from '@/lib/api';

interface TrainingCompletedStatus {
    status: 'completed';
    currentEpoch: number;
    lossHistory: LossPoint[];
    elapsedTime: number;
    modelId?: string;
    epochsRun?: number;
    trainingTime?: number;
    finalLoss?: number;
    earlyStoppped?: boolean;
    convergenceEpoch?: number | null;
    totalEpochs?: number;
    finalGeneratorLoss?: number | null;
    finalDiscriminatorLoss?: number | null;
    finalLossRatio?: number | null;
    finalModeCollapseScore?: number | null;
    bestGeneratorLoss?: number | null;
    bestEpoch?: number | null;
    lossStabilityStd?: number | null;
    avgEpochTimeSeconds?: number | null;
    avgSamplesPerSecond?: number | null;
    nTrainingRows?: number | null;
    stepsPerEpoch?: number | null;
    source?: string | null;
    gpu?: string | null;
    sdmetrics?: SDMetricsReport | null;
}

interface TrainingCompletedSectionProps {
    status: TrainingCompletedStatus;
    onProceed: () => void;
}

function fmt(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
}

function Stat({
    label,
    value,
    sub,
    mono,
    icon: Icon,
}: {
    label: string;
    value: string | number;
    sub?: string;
    mono?: boolean;
    icon?: React.ComponentType<{ className?: string }>;
}) {
    return (
        <div className="rounded-lg border border-border bg-muted/40 p-4 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                {Icon && <Icon className="h-3 w-3" />}
                {label}
            </div>
            <p className={`text-xl font-bold leading-tight ${mono ? 'font-mono' : ''}`}>{value}</p>
            {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        </div>
    );
}

function ScoreBar({
    label,
    score,
    description,
}: {
    label: string;
    score: number;
    description?: string;
}) {
    const pct = Math.round(score * 100);
    const color =
        pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-yellow-500' : 'bg-red-500';

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{label}</span>
                <span className={`font-bold tabular-nums ${pct >= 80 ? 'text-green-600' : pct >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {pct}%
                </span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
            </div>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
    );
}

function ModeCollapseIndicator({ score }: { score: number }) {
    const risk = score < 0.005 ? 'high' : score < 0.02 ? 'medium' : 'low';
    const label = risk === 'high' ? 'High Risk' : risk === 'medium' ? 'Moderate' : 'Low Risk';
    const variant: 'destructive' | 'secondary' | 'default' =
        risk === 'high' ? 'destructive' : risk === 'medium' ? 'secondary' : 'default';

    return (
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium">Mode Collapse Risk</p>
                <p className="text-xs text-muted-foreground">
                    Rolling std of G-loss: {score.toFixed(5)} — {risk === 'low' ? 'generator exploring well' : risk === 'medium' ? 'monitor closely' : 'generator may be stuck'}
                </p>
            </div>
            <Badge variant={variant}>{label}</Badge>
        </div>
    );
}

export function TrainingCompletedSection({
    status,
    onProceed,
}: TrainingCompletedSectionProps) {
    const sd = status.sdmetrics;
    const hasSDMetrics =
        sd && !sd.error && (sd.quality_score !== undefined || sd.diagnostic_score !== undefined);

    return (
        <div className="space-y-6">
            <Alert className="border-2 border-green-500 bg-green-50 dark:bg-green-950">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                <AlertDescription className="ml-3 text-green-800 dark:text-green-200">
                    Model trained successfully!{' '}
                    {status.earlyStoppped
                        ? `Converged at epoch ${status.convergenceEpoch} (early stopping).`
                        : `Completed all ${status.epochsRun} epochs.`}
                </AlertDescription>
            </Alert>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Training Summary
                    </CardTitle>
                    <CardDescription>
                        {status.source === 'modal' && status.gpu ? (
                            <span className="flex items-center gap-1.5">
                                <Cpu className="h-3 w-3" /> Ran on Modal · {status.gpu} GPU
                            </span>
                        ) : (
                            'Local execution'
                        )}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Primary stats row */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <Stat
                            icon={Zap}
                            label="Epochs Completed"
                            value={status.epochsRun ?? 0}
                            sub={
                                status.earlyStoppped
                                    ? `Early stop at ${status.convergenceEpoch}`
                                    : `of ${status.totalEpochs ?? status.epochsRun}`
                            }
                        />
                        <Stat
                            icon={Clock}
                            label="Training Time"
                            value={fmt(status.trainingTime ?? status.elapsedTime)}
                            sub={
                                status.avgEpochTimeSeconds != null
                                    ? `~${status.avgEpochTimeSeconds.toFixed(2)}s / epoch`
                                    : undefined
                            }
                        />
                        <Stat
                            icon={TrendingDown}
                            label="Final G-Loss"
                            value={(status.finalGeneratorLoss ?? status.finalLoss ?? 0).toFixed(4)}
                            mono
                            sub={
                                status.bestGeneratorLoss != null
                                    ? `Best: ${status.bestGeneratorLoss.toFixed(4)} @ ep ${status.bestEpoch}`
                                    : undefined
                            }
                        />
                        <Stat
                            icon={BarChart3}
                            label="Throughput"
                            value={
                                status.avgSamplesPerSecond != null
                                    ? `${status.avgSamplesPerSecond.toFixed(0)} r/s`
                                    : status.nTrainingRows != null
                                        ? `${status.nTrainingRows.toLocaleString()} rows`
                                        : '—'
                            }
                            sub={
                                status.nTrainingRows != null && status.stepsPerEpoch != null
                                    ? `${status.nTrainingRows.toLocaleString()} rows · ${status.stepsPerEpoch} steps/epoch`
                                    : undefined
                            }
                        />
                    </div>

                    {(status.finalModeCollapseScore != null ||
                        status.finalLossRatio != null ||
                        status.lossStabilityStd != null) && (
                            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-4">
                                <h4 className="text-sm font-semibold">Training Health</h4>

                                {status.finalModeCollapseScore != null && status.finalModeCollapseScore >= 0 && (
                                    <ModeCollapseIndicator score={status.finalModeCollapseScore} />
                                )}

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    {status.finalLossRatio != null && (
                                        <div>
                                            <p className="text-muted-foreground text-xs">Final Loss Ratio (G/D)</p>
                                            <p className="font-mono font-semibold">{status.finalLossRatio.toFixed(3)}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {status.finalLossRatio < 0.5
                                                    ? 'D dominates — consider fewer D steps'
                                                    : status.finalLossRatio > 5
                                                        ? 'G struggling — training may be unstable'
                                                        : 'Balanced'}
                                            </p>
                                        </div>
                                    )}
                                    {status.lossStabilityStd != null && (
                                        <div>
                                            <p className="text-muted-foreground text-xs">Loss Stability (std)</p>
                                            <p className="font-mono font-semibold">{status.lossStabilityStd.toFixed(5)}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {status.lossStabilityStd < 0.05
                                                    ? 'Very stable'
                                                    : status.lossStabilityStd < 0.2
                                                        ? 'Normal variance'
                                                        : 'High variance — consider reducing LR'}
                                            </p>
                                        </div>
                                    )}
                                    {status.finalDiscriminatorLoss != null && (
                                        <div>
                                            <p className="text-muted-foreground text-xs">Final D-Loss</p>
                                            <p className="font-mono font-semibold">
                                                {status.finalDiscriminatorLoss.toFixed(4)}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                </CardContent>
            </Card>

            {sd && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4" />
                            SDMetrics Quality Report
                        </CardTitle>
                        <CardDescription>
                            Evaluated on a synthetic sample generated immediately after training
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {sd.error ? (
                            <Alert>
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription className="ml-2 text-sm">
                                    SDMetrics unavailable: {sd.error}
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <div className="space-y-6">
                                {/* Top-line scores */}
                                {hasSDMetrics && (
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                        {sd.quality_score != null && (
                                            <div className="rounded-lg border p-4 text-center space-y-1">
                                                <p className="text-xs text-muted-foreground font-medium">Quality Score</p>
                                                <p className={`text-3xl font-bold ${sd.quality_score >= 0.8 ? 'text-green-600' : sd.quality_score >= 0.6 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                    {Math.round(sd.quality_score * 100)}%
                                                </p>
                                                <p className="text-xs text-muted-foreground">Column shapes + pair trends</p>
                                            </div>
                                        )}
                                        {sd.diagnostic_score != null && (
                                            <div className="rounded-lg border p-4 text-center space-y-1">
                                                <p className="text-xs text-muted-foreground font-medium">Diagnostic Score</p>
                                                <p className={`text-3xl font-bold ${sd.diagnostic_score >= 0.8 ? 'text-green-600' : sd.diagnostic_score >= 0.6 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                    {Math.round(sd.diagnostic_score * 100)}%
                                                </p>
                                                <p className="text-xs text-muted-foreground">Coverage · Boundary · Synthesis</p>
                                            </div>
                                        )}
                                        {sd.ml_efficacy?.train_on_synthetic_test_on_real_f1 != null && (
                                            <div className="rounded-lg border p-4 text-center space-y-1">
                                                <p className="text-xs text-muted-foreground font-medium">TSTR F1</p>
                                                <p className={`text-3xl font-bold ${sd.ml_efficacy.train_on_synthetic_test_on_real_f1 >= 0.7 ? 'text-green-600' : sd.ml_efficacy.train_on_synthetic_test_on_real_f1 >= 0.5 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                    {sd.ml_efficacy.train_on_synthetic_test_on_real_f1.toFixed(3)}
                                                </p>
                                                <p className="text-xs text-muted-foreground">Train-synth / test-real F1</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {sd.quality_properties && Object.keys(sd.quality_properties).length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-semibold">Quality Properties</h4>
                                        {Object.entries(sd.quality_properties).map(([name, score]) => (
                                            <ScoreBar key={name} label={name} score={score} />
                                        ))}
                                    </div>
                                )}

                                {sd.diagnostic_properties && Object.keys(sd.diagnostic_properties).length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-semibold">Diagnostic Properties</h4>
                                        {Object.entries(sd.diagnostic_properties).map(([name, score]) => (
                                            <ScoreBar key={name} label={name} score={score} />
                                        ))}
                                    </div>
                                )}

                                {sd.column_shape_scores && Object.keys(sd.column_shape_scores).length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-semibold">Column Shape Scores</h4>
                                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                            {Object.entries(sd.column_shape_scores).map(([col, score]) => (
                                                <div
                                                    key={col}
                                                    className="flex items-center justify-between rounded border px-3 py-2"
                                                >
                                                    <span className="text-xs font-mono truncate max-w-[70%]" title={col}>
                                                        {col}
                                                    </span>
                                                    <Badge
                                                        variant={score >= 0.8 ? 'default' : score >= 0.6 ? 'secondary' : 'destructive'}
                                                        className="text-xs tabular-nums"
                                                    >
                                                        {Math.round(score * 100)}%
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {(sd.quality_error || sd.diagnostic_error || sd.ml_efficacy_error) && (
                                    <div className="space-y-1 rounded border border-yellow-300 bg-yellow-50 dark:bg-yellow-950 p-3">
                                        {sd.quality_error && (
                                            <p className="text-xs text-yellow-800 dark:text-yellow-200">Quality: {sd.quality_error}</p>
                                        )}
                                        {sd.diagnostic_error && (
                                            <p className="text-xs text-yellow-800 dark:text-yellow-200">Diagnostic: {sd.diagnostic_error}</p>
                                        )}
                                        {sd.ml_efficacy_error && (
                                            <p className="text-xs text-yellow-800 dark:text-yellow-200">ML Efficacy: {sd.ml_efficacy_error}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-4 w-4" />
                        What&apos;s Next?
                    </CardTitle>
                    <CardDescription>Your model is ready for synthetic data generation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {status.modelId && (
                        <div className="rounded-lg bg-muted/40 p-3">
                            <p className="text-xs text-muted-foreground mb-1">Model ID</p>
                            <p className="font-mono text-sm break-all">{status.modelId}</p>
                        </div>
                    )}
                    <p className="text-sm text-muted-foreground">
                        Proceed to generate a balanced synthetic dataset. The generated data can be mixed with
                        your real data to improve downstream classifier performance on minority classes.
                    </p>
                    <Button onClick={onProceed} size="lg" className="w-full">
                        Proceed to Generate Data
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}