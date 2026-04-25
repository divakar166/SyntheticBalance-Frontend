import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface TrainingConfig {
    epochs: number;
    batchSize: number;
    model: 'CTGAN' | 'Tabular Diffusion';
}

interface TrainingConfigSectionProps {
    config: TrainingConfig;
    onConfigChange: (config: TrainingConfig) => void;
    onStartTraining: () => void;
}

export function TrainingConfigSection({
    config,
    onConfigChange,
    onStartTraining,
}: TrainingConfigSectionProps) {
    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Training Configuration</CardTitle>
                    <CardDescription>
                        Configure the parameters for your synthetic data generation model
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {/* Epochs Slider */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Number of Epochs</label>
                            <span className="text-2xl font-bold text-primary">{config.epochs}</span>
                        </div>
                        <Slider
                            value={[config.epochs]}
                            onValueChange={([value]) =>
                                onConfigChange({ ...config, epochs: value })
                            }
                            min={10}
                            max={500}
                            step={10}
                            className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">
                            Range: 10 - 500 epochs. More epochs may improve model quality but will take longer.
                        </p>
                    </div>

                    {/* Batch Size Dropdown */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium">Batch Size</label>
                        <Select
                            value={config.batchSize.toString()}
                            onValueChange={(value) =>
                                onConfigChange({ ...config, batchSize: parseInt(value) })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="128">128</SelectItem>
                                <SelectItem value="256">256</SelectItem>
                                <SelectItem value="512">512</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            Larger batch sizes may train faster but require more memory.
                        </p>
                    </div>

                    {/* Model Selector */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium">Model Architecture</label>
                        <Select
                            value={config.model}
                            onValueChange={(value) =>
                                onConfigChange({
                                    ...config,
                                    model: value as 'CTGAN' | 'Tabular Diffusion',
                                })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="CTGAN">
                                    <div className="flex items-center gap-2">
                                        CTGAN
                                    </div>
                                </SelectItem>
                                <SelectItem value="Tabular Diffusion">
                                    <div className="flex items-center gap-2">
                                        Tabular Diffusion
                                        <Badge variant="secondary" className="text-xs">
                                            Beta
                                        </Badge>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            CTGAN is a proven approach for synthetic tabular data. Tabular Diffusion is an experimental alternative.
                        </p>
                    </div>

                    {/* Summary Card */}
                    <div className="rounded-lg bg-muted/50 p-4">
                        <h4 className="font-medium mb-3">Training Summary</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">Model</p>
                                <p className="font-semibold">{config.model}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Epochs</p>
                                <p className="font-semibold">{config.epochs}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Batch Size</p>
                                <p className="font-semibold">{config.batchSize}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Est. Duration</p>
                                <p className="font-semibold">
                                    {Math.ceil((config.epochs / 100) * 5)}-{Math.ceil((config.epochs / 100) * 10)} min
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Start Button */}
                    <Button
                        onClick={onStartTraining}
                        size="lg"
                        className="w-full"
                    >
                        Start Training
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
