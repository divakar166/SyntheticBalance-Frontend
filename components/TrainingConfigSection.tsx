'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, Settings2, Zap, FlaskConical } from 'lucide-react';
import { useState } from 'react';
import type { TrainingConfig } from '@/lib/api';

interface TrainingConfigSectionProps {
    config: TrainingConfig;
    onConfigChange: (config: TrainingConfig) => void;
    onStartTraining: () => void;
}

function DimEditor({
    label,
    value,
    onChange,
    hint,
}: {
    label: string;
    value: number[];
    onChange: (v: number[]) => void;
    hint?: string;
}) {
    const [raw, setRaw] = useState(value.join(', '));
    const [error, setError] = useState('');

    const commit = (str: string) => {
        const parts = str
            .split(',')
            .map((s) => parseInt(s.trim(), 10))
            .filter((n) => !isNaN(n) && n > 0);
        if (parts.length < 1 || parts.length > 5) {
            setError('Enter 1-5 positive integers');
            return;
        }
        setError('');
        onChange(parts);
        setRaw(parts.join(', '));
    };

    return (
        <div className="space-y-1.5">
            <Label className="text-sm font-medium">{label}</Label>
            <Input
                value={raw}
                onChange={(e) => setRaw(e.target.value)}
                onBlur={(e) => commit(e.target.value)}
                placeholder="256, 256"
                className={error ? 'border-destructive' : ''}
            />
            {error ? (
                <p className="text-xs text-destructive">{error}</p>
            ) : (
                hint && <p className="text-xs text-muted-foreground">{hint}</p>
            )}
        </div>
    );
}

export function TrainingConfigSection({
    config,
    onConfigChange,
    onStartTraining,
}: TrainingConfigSectionProps) {
    const [advancedOpen, setAdvancedOpen] = useState(false);

    const set = <K extends keyof typeof config>(key: K, value: (typeof config)[K]) =>
        onConfigChange({ ...config, [key]: value });

    const estMin = Math.ceil((config.epochs / 100) * 5);
    const estMax = Math.ceil((config.epochs / 100) * 10);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Training Configuration
                    </CardTitle>
                    <CardDescription>
                        Configure the parameters for your synthetic data generation model
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {/* <div className="space-y-3">
                        <Label>Model Architecture</Label>
                        <Select
                            value={config.model}
                            onValueChange={(v) => set('model', v as 'CTGAN' | 'Tabular Diffusion')}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="CTGAN">CTGAN</SelectItem>
                                <SelectItem value="Tabular Diffusion">
                                    <span className="flex items-center gap-2">
                                        Tabular Diffusion
                                        <Badge variant="secondary" className="text-xs">Beta</Badge>
                                    </span>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            CTGAN is a proven approach for synthetic tabular data. Tabular Diffusion is experimental.
                        </p>
                    </div> */}

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label>Number of Epochs</Label>
                            <span className="text-2xl font-bold text-primary tabular-nums">{config.epochs}</span>
                        </div>
                        <Slider
                            value={[config.epochs]}
                            onValueChange={([v]) => set('epochs', v)}
                            min={10}
                            max={2000}
                            step={10}
                        />
                        <p className="text-xs text-muted-foreground">
                            Range: 10 - 2 000. Early stopping will halt training once loss converges.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <Label>Batch Size</Label>
                        <Select
                            value={config.batch_size.toString()}
                            onValueChange={(v) => set('batch_size', parseInt(v))}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {[32, 64, 128, 256, 512, 1024, 2048, 4096].map((n) => (
                                    <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            Larger batches train faster but consume more GPU memory.
                        </p>
                    </div>

                    <div className="rounded-lg bg-muted/50 p-4">
                        <h4 className="font-medium mb-3 text-sm">Training Summary</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            {/* <div>
                                <p className="text-muted-foreground">Model</p>
                                <p className="font-semibold">{config.model}</p>
                            </div> */}
                            <div>
                                <p className="text-muted-foreground">Epochs</p>
                                <p className="font-semibold">{config.epochs}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Batch Size</p>
                                <p className="font-semibold">{config.batch_size}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Est. Duration</p>
                                <p className="font-semibold">{estMin}–{estMax} min</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
                <Card>
                    <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer select-none hover:bg-muted/30 transition-colors rounded-t-lg">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Settings2 className="h-4 w-4" />
                                    Advanced Hyperparameters
                                </CardTitle>
                                <ChevronDown
                                    className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${advancedOpen ? 'rotate-180' : ''}`}
                                />
                            </div>
                            <CardDescription>
                                Architecture, optimiser, and early-stopping settings
                            </CardDescription>
                        </CardHeader>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                        <CardContent className="space-y-8 pt-0">
                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                    Architecture
                                </h4>

                                <div className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label>Embedding Dimension</Label>
                                            <span className="text-lg font-bold tabular-nums">{config.embedding_dim}</span>
                                        </div>
                                        <Slider
                                            value={[config.embedding_dim]}
                                            onValueChange={([v]) => set('embedding_dim', v)}
                                            min={32}
                                            max={512}
                                            step={32}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Dimension of the noise vector fed into the generator (32 – 512).
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <DimEditor
                                            label="Generator Layers"
                                            value={config.generator_dim}
                                            onChange={(v) => set('generator_dim', v)}
                                            hint="Hidden units per layer, e.g. 256, 256"
                                        />
                                        <DimEditor
                                            label="Discriminator Layers"
                                            value={config.discriminator_dim}
                                            onChange={(v) => set('discriminator_dim', v)}
                                            hint="Hidden units per layer, e.g. 256, 256"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                    Optimiser
                                </h4>

                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label>Generator LR</Label>
                                            <span className="font-mono text-sm font-semibold">
                                                {config.generator_lr.toExponential(0)}
                                            </span>
                                        </div>
                                        <Slider
                                            value={[Math.round(-Math.log10(config.generator_lr))]}
                                            onValueChange={([v]) => set('generator_lr', Math.pow(10, -v))}
                                            min={2}
                                            max={5}
                                            step={1}
                                        />
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>1e-2 (fast)</span>
                                            <span>1e-5 (slow)</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label>Discriminator LR</Label>
                                            <span className="font-mono text-sm font-semibold">
                                                {config.discriminator_lr.toExponential(0)}
                                            </span>
                                        </div>
                                        <Slider
                                            value={[Math.round(-Math.log10(config.discriminator_lr))]}
                                            onValueChange={([v]) => set('discriminator_lr', Math.pow(10, -v))}
                                            min={2}
                                            max={5}
                                            step={1}
                                        />
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>1e-2 (fast)</span>
                                            <span>1e-5 (slow)</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label>Discriminator Steps</Label>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                D updates per G update — higher improves D quality but slows training
                                            </p>
                                        </div>
                                        <span className="text-lg font-bold tabular-nums">{config.discriminator_steps}</span>
                                    </div>
                                    <Slider
                                        value={[config.discriminator_steps]}
                                        onValueChange={([v]) => set('discriminator_steps', v)}
                                        min={1}
                                        max={10}
                                        step={1}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                    Early Stopping
                                </h4>

                                <div className="flex items-center justify-between rounded-lg border p-3">
                                    <div>
                                        <Label htmlFor="early-stopping">Enable Early Stopping</Label>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Halt training when generator loss stops improving
                                        </p>
                                    </div>
                                    <Switch
                                        id="early-stopping"
                                        checked={config.early_stopping}
                                        onCheckedChange={(v) => set('early_stopping', v)}
                                    />
                                </div>

                                {config.early_stopping && (
                                    <div className="space-y-6 pl-1">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <Label>Patience (epochs)</Label>
                                                <span className="text-lg font-bold tabular-nums">
                                                    {config.early_stopping_patience}
                                                </span>
                                            </div>
                                            <Slider
                                                value={[config.early_stopping_patience]}
                                                onValueChange={([v]) => set('early_stopping_patience', v)}
                                                min={5}
                                                max={200}
                                                step={5}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Consecutive epochs with no improvement before stopping.
                                            </p>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label>Min Delta</Label>
                                            <Input
                                                type="number"
                                                step={0.0001}
                                                min={0.0001}
                                                max={1}
                                                value={config.early_stopping_min_delta}
                                                onChange={(e) =>
                                                    set('early_stopping_min_delta', parseFloat(e.target.value) || 0.001)
                                                }
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Minimum loss range change to count as progress.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                                    <FlaskConical className="h-3.5 w-3.5" />
                                    Post-Training Evaluation
                                </h4>

                                <div className="flex items-center justify-between rounded-lg border p-3">
                                    <div>
                                        <Label htmlFor="run-sdmetrics">Run SDMetrics Evaluation</Label>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Quality + Diagnostic reports immediately after training (~30 s extra)
                                        </p>
                                    </div>
                                    <Switch
                                        id="run-sdmetrics"
                                        checked={config.run_sdmetrics}
                                        onCheckedChange={(v) => set('run_sdmetrics', v)}
                                    />
                                </div>

                                {config.run_sdmetrics && (
                                    <div className="space-y-3 pl-1">
                                        <div className="flex items-center justify-between">
                                            <Label>Evaluation Sample Size</Label>
                                            <span className="text-lg font-bold tabular-nums">
                                                {config.sdmetrics_n_samples.toLocaleString()}
                                            </span>
                                        </div>
                                        <Slider
                                            value={[config.sdmetrics_n_samples]}
                                            onValueChange={([v]) => set('sdmetrics_n_samples', v)}
                                            min={100}
                                            max={20000}
                                            step={100}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Synthetic rows generated for the SDMetrics pass (100 - 20 000).
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </CollapsibleContent>
                </Card>
            </Collapsible>

            <Button onClick={onStartTraining} size="lg" className="w-full">
                Start Training
            </Button>
        </div>
    );
}