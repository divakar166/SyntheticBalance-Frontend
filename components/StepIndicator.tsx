interface StepIndicatorProps {
    currentStep: number;
    totalSteps: number;
}

const STEP_LABELS: Record<number, string> = {
    1: 'Upload & Analyze',
    2: 'Train Model',
    3: 'Generate Data',
    4: 'Review Data',
    5: 'Configure Export',
    6: 'Complete',
};

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
    return (
        <div className="flex items-center justify-between">
            {Array.from({ length: totalSteps }).map((_, index) => {
                const stepNumber = index + 1;
                const isActive = stepNumber === currentStep;
                const isCompleted = stepNumber < currentStep;

                return (
                    <div key={stepNumber} className="flex flex-1 items-center">
                        {/* Step Circle */}
                        <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold transition-all ${isActive
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : isCompleted
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : 'border-border bg-muted text-muted-foreground'
                                }`}
                        >
                            {isCompleted ? '✓' : stepNumber}
                        </div>

                        {/* Step Label */}
                        <div className={`ml-3 text-sm font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                            {STEP_LABELS[stepNumber]}
                        </div>

                        {/* Connector Line */}
                        {stepNumber < totalSteps && (
                            <div
                                className={`mx-4 flex-1 h-1 rounded-full transition-all ${isCompleted ? 'bg-primary' : 'bg-border'
                                    }`}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
