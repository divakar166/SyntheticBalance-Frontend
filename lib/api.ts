import { API_BASE_URL } from './config';
import { AuthSession, clearSession, getFreshSession } from './auth';

export interface DatasetSummary {
  id: string;
  filename?: string;
  dataset_type: 'real' | 'synthetic' | string;
  target?: string;
  n_rows: number;
  n_features: number;
  class_dist: Record<string, number>;
  schema?: {
    features?: Record<string, any>;
    target?: { name?: string };
  };
  created_at?: string;
  has_model: boolean;
  latest_training_job?: JobSummary | null;
  latest_generation_job?: JobSummary | null;
}

export interface JobSummary {
  job_id: string;
  dataset_id: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  current_epoch?: number;
  total_epochs?: number;
  n_samples?: number;
  synthetic_id?: string | null;
}

export interface DatasetMetadata {
  dataset_id: string;
  n_rows: number;
  n_features: number;
  class_dist: Record<string, number>;
  schema: {
    features: Record<string, any>;
    target?: { name?: string };
  };
  filename?: string;
  target_column?: string;
  object_key?: string;
}

export interface LossPoint {
  epoch: number;
  generator_loss: number;
  discriminator_loss: number;
}

export interface TrainingStatusPayload {
  job_id: string;
  dataset_id: string;
  status: string;
  current_epoch: number;
  total_epochs: number;
  loss_history: LossPoint[];
  training_time_seconds?: number | null;
  final_loss?: number | null;
  error?: string | null;
  model_id?: string | null;
}

export interface GenerationStatusPayload {
  job_id: string;
  dataset_id: string;
  status: string;
  n_samples: number;
  synthetic_id?: string | null;
  preview: Record<string, unknown>[];
  generation_time_seconds?: number | null;
  error?: string | null;
}

async function readError(response: Response) {
  try {
    const payload = await response.json();
    return payload.error || payload.detail || 'Request failed.';
  } catch {
    return 'Request failed.';
  }
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  session?: AuthSession | null
): Promise<T> {
  const nextSession = session || (await getFreshSession());
  if (!nextSession) {
    clearSession();
    throw new Error('Please sign in again.');
  }

  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${nextSession.accessToken}`);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (response.status === 401) {
    clearSession();
    throw new Error('Your session expired. Please sign in again.');
  }

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response.json() as Promise<T>;
}

export function listDatasets(session?: AuthSession | null) {
  return apiFetch<{ datasets: DatasetSummary[] }>('/api/datasets', {}, session);
}

export function uploadDataset(file: File, target: string, session?: AuthSession | null) {
  const body = new FormData();
  body.append('file', file);
  body.append('target', target);

  return apiFetch<DatasetMetadata>(
    '/api/upload',
    {
      method: 'POST',
      body,
    },
    session
  );
}

export function deleteDataset(datasetId: string, session?: AuthSession | null) {
  return apiFetch<{ deleted: boolean; dataset_id: string }>(
    `/api/datasets/${datasetId}`,
    { method: 'DELETE' },
    session
  );
}

export function startTraining(datasetId: string, epochs: number, session?: AuthSession | null) {
  return apiFetch<{ job_id: string; dataset_id: string; status: string }>(
    '/api/train-ctgan',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataset_id: datasetId, epochs }),
    },
    session
  );
}

export function getTrainingStatus(jobId: string, session?: AuthSession | null) {
  return apiFetch<TrainingStatusPayload>(`/api/train-status/${jobId}`, {}, session);
}

export function startGeneration(datasetId: string, nSamples: number, session?: AuthSession | null) {
  const params = new URLSearchParams({
    dataset_id: datasetId,
    n_samples: String(nSamples),
  });

  return apiFetch<{ job_id: string; dataset_id: string; status: string; n_samples: number }>(
    `/api/generate?${params.toString()}`,
    { method: 'POST' },
    session
  );
}

export function getGenerationStatus(jobId: string, session?: AuthSession | null) {
  return apiFetch<GenerationStatusPayload>(`/api/generate-status/${jobId}`, {}, session);
}
