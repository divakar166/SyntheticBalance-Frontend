'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { StepIndicator } from '@/components/StepIndicator';
import { Badge } from '@/components/ui/badge';
import { useRequireAuth } from '@/components/AuthProvider';
import { GenerationStatusPayload, getGenerationStatus, startGeneration } from '@/lib/api';

type GenerationState = 'idle' | 'queued' | 'running' | 'completed' | 'failed';

function normalizeStatus(status: string): GenerationState {
  if (status === 'completed' || status === 'done') return 'completed';
  if (status === 'failed') return 'failed';
  if (status === 'queued') return 'queued';
  return 'running';
}

export default function GeneratePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, isLoading } = useRequireAuth();
  const [datasetId, setDatasetId] = useState('');
  const [nSamples, setNSamples] = useState(5000);
  const [jobId, setJobId] = useState('');
  const [status, setStatus] = useState<GenerationState>('idle');
  const [result, setResult] = useState<GenerationStatusPayload | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setDatasetId(searchParams.get('datasetId') || '');
  }, [searchParams]);

  useEffect(() => {
    if (!jobId || !['queued', 'running'].includes(status)) return;

    const interval = setInterval(async () => {
      try {
        const payload = await getGenerationStatus(jobId, session);
        const nextStatus = normalizeStatus(payload.status);
        setResult(payload);
        setStatus(nextStatus);
        if (payload.error) {
          setError(payload.error);
        }
      } catch (err) {
        setStatus('failed');
        setError(err instanceof Error ? err.message : 'Could not poll generation status.');
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [jobId, session, status]);

  const handleGenerate = async () => {
    if (!datasetId) return;
    setError('');
    setResult(null);
    setStatus('queued');

    try {
      const response = await startGeneration(datasetId, nSamples, session);
      setJobId(response.job_id);
      setStatus(normalizeStatus(response.status));
    } catch (err) {
      setStatus('failed');
      setError(err instanceof Error ? err.message : 'Generation failed to start.');
    }
  };

  const previewColumns = result?.preview?.[0] ? Object.keys(result.preview[0]) : [];

  if (isLoading || !session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <StepIndicator currentStep={3} totalSteps={3} />

        <div className="mb-8 mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Generate Synthetic Data</h1>
            <p className="mt-2 text-muted-foreground">
              Use the trained CTGAN model to create a new synthetic dataset.
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[380px_minmax(0,1fr)]">
          <Card>
            <CardHeader>
              <CardTitle>Generation Request</CardTitle>
              <CardDescription>Queued jobs run through the backend Modal workflow.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="datasetId" className="text-sm font-medium">
                  Source Dataset
                </label>
                <Input
                  id="datasetId"
                  value={datasetId}
                  onChange={(event) => setDatasetId(event.target.value)}
                  placeholder="Dataset ID"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="nSamples" className="text-sm font-medium">
                  Samples
                </label>
                <Input
                  id="nSamples"
                  type="number"
                  min={1}
                  value={nSamples}
                  onChange={(event) => setNSamples(Number(event.target.value))}
                />
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleGenerate}
                disabled={!datasetId || ['queued', 'running'].includes(status)}
              >
                {['queued', 'running'].includes(status) ? 'Generating...' : 'Generate Data'}
              </Button>

              {status !== 'idle' && (
                <div className="space-y-3 rounded-md bg-muted/50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge>{status}</Badge>
                  </div>
                  {['queued', 'running'].includes(status) && <Progress value={status === 'queued' ? 20 : 65} />}
                  {result?.synthetic_id && (
                    <div>
                      <p className="text-sm text-muted-foreground">Synthetic Dataset</p>
                      <p className="truncate font-mono text-sm">{result.synthetic_id}</p>
                    </div>
                  )}
                </div>
              )}

              {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>First rows returned by the generation job.</CardDescription>
            </CardHeader>
            <CardContent>
              {previewColumns.length === 0 ? (
                <div className="rounded-md border border-dashed p-10 text-center text-sm text-muted-foreground">
                  Generated rows will appear here when the job completes.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-md border">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        {previewColumns.map((column) => (
                          <th key={column} className="px-3 py-2 font-medium">
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result?.preview.map((row, index) => (
                        <tr key={index} className="border-t">
                          {previewColumns.map((column) => (
                            <td key={column} className="max-w-48 truncate px-3 py-2">
                              {String(row[column] ?? '')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
