import { API_BASE_URL } from "./config";
import { AuthSession, clearSession, getFreshSession } from "./auth";

export interface TrainingModel {
  id: string;
  dataset_id: string;
  status: string;
  config?: TrainingConfig | null;
  created_at?: string;
  training_time_seconds?: number | null;
  final_loss?: number | null;
  epochs_trained?: number | null;
  sdmetrics?: SDMetricsReport | null;
}

export interface SyntheticDataSummary {
  id: string;
  source_dataset_id: string;
  source_model_id?: string;
  n_rows: number;
  status: string;
  created_at?: string;
}

export interface DatasetSummary {
  id: string;
  filename?: string;
  dataset_type: "real" | "synthetic" | string;
  target?: string;
  n_rows: number;
  n_features: number;
  class_dist: Record<string, number>;
  schema?: {
    features?: Record<string, unknown>;
    target?: { name?: string };
  };
  created_at?: string;
  has_model: boolean;
  latest_training_job?: JobSummary | null;
  latest_generation_job?: JobSummary | null;
  models?: TrainingModel[];
  synthetic_data?: SyntheticDataSummary[];
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
    features: Record<string, unknown>;
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

export interface SDMetricsColumnPairTrend {
  column_1: string;
  column_2: string;
  score: number;
  metric: string;
}

export interface SDMetricsReport {
  quality_score?: number;
  quality_properties?: Record<string, number>;
  column_shape_scores?: Record<string, number>;
  column_pair_trend_scores?: SDMetricsColumnPairTrend[];
  quality_error?: string;
  diagnostic_score?: number;
  diagnostic_properties?: Record<string, number>;
  diagnostic_error?: string;
  ml_efficacy?: { train_on_synthetic_test_on_real_f1: number };
  ml_efficacy_error?: string;
  error?: string;
}

export interface TrainingConfig {
  epochs: number;
  batch_size: number;
  embedding_dim: number;
  generator_dim: number[];
  discriminator_dim: number[];
  generator_lr: number;
  discriminator_lr: number;
  discriminator_steps: number;
  early_stopping: boolean;
  early_stopping_patience: number;
  early_stopping_min_delta: number;
  run_sdmetrics: boolean;
  sdmetrics_n_samples: number;
}

export interface TrainingStatusPayload {
  job_id: string;
  dataset_id: string;
  status: string;
  current_epoch: number;
  total_epochs: number;
  loss_history: LossPoint[];
  last_heartbeat?: string | null;
  modal_call_id?: string | null;
  epochs_trained?: number | null;
  early_stopped?: boolean | null;
  convergence_epoch?: number | null;
  training_time_seconds?: number | null;
  avg_epoch_time_seconds?: number | null;
  steps_per_epoch?: number | null;
  final_loss?: number | null;
  final_generator_loss?: number | null;
  final_discriminator_loss?: number | null;
  final_loss_ratio?: number | null;
  final_mode_collapse_score?: number | null;
  best_generator_loss?: number | null;
  best_epoch?: number | null;
  loss_stability_std?: number | null;
  n_training_rows?: number | null;
  avg_samples_per_second?: number | null;
  sdmetrics?: SDMetricsReport | null;
  model_id?: string | null;
  model_path?: string | null;
  config?: TrainingConfig | null;
  source?: string | null;
  gpu?: string | null;
  error?: string | null;
}

export interface GenerationStatusPayload {
  job_id: string;
  dataset_id: string;
  status: string;
  n_samples: number;
  synthetic_id?: string | null;
  preview: Record<string, unknown>[];
  generation_time_seconds?: number | null;
  sdmetrics?: SDMetricsReport | null;
  error?: string | null;
}

async function readError(response: Response) {
  try {
    const payload = await response.json();
    return payload.error || payload.detail || "Request failed.";
  } catch {
    return "Request failed.";
  }
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  session?: AuthSession | null,
): Promise<T> {
  const nextSession = session || (await getFreshSession());
  if (!nextSession) {
    clearSession();
    throw new Error("Please sign in again.");
  }

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${nextSession.accessToken}`);

  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });

  if (response.status === 401) {
    clearSession();
    throw new Error("Your session expired. Please sign in again.");
  }

  if (!response.ok) throw new Error(await readError(response));

  return response.json() as Promise<T>;
}

export function listDatasets(session?: AuthSession | null) {
  return apiFetch<{ datasets: DatasetSummary[] }>("/api/datasets", {}, session);
}

export function uploadDataset(
  file: File,
  target: string,
  session?: AuthSession | null,
) {
  const body = new FormData();
  body.append("file", file);
  body.append("target", target);
  return apiFetch<DatasetMetadata>(
    "/api/upload",
    { method: "POST", body },
    session,
  );
}

export function deleteDataset(datasetId: string, session?: AuthSession | null) {
  return apiFetch<{ deleted: boolean; dataset_id: string }>(
    `/api/datasets/${datasetId}`,
    { method: "DELETE" },
    session,
  );
}

export function startTraining(
  datasetId: string,
  config: TrainingConfig,
  session?: AuthSession | null,
) {
  return apiFetch<{
    job_id: string;
    dataset_id: string;
    status: string;
    config: TrainingConfig;
  }>(
    "/api/train-ctgan",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "CTGAN",
        dataset_id: datasetId,
        epochs: config.epochs,
        batch_size: config.batch_size,
        embedding_dim: config.embedding_dim,
        generator_dim: config.generator_dim,
        discriminator_dim: config.discriminator_dim,
        generator_lr: config.generator_lr,
        discriminator_lr: config.discriminator_lr,
        discriminator_steps: config.discriminator_steps,
        early_stopping: config.early_stopping,
        early_stopping_patience: config.early_stopping_patience,
        early_stopping_min_delta: config.early_stopping_min_delta,
        run_sdmetrics: config.run_sdmetrics,
        sdmetrics_n_samples: config.sdmetrics_n_samples,
      }),
    },
    session,
  );
}

export function getTrainingStatus(jobId: string, session?: AuthSession | null) {
  return apiFetch<TrainingStatusPayload>(
    `/api/train-status/${jobId}`,
    {},
    session,
  );
}

export function startGeneration(
  datasetId: string,
  nSamples: number,
  session?: AuthSession | null,
) {
  const params = new URLSearchParams({
    dataset_id: datasetId,
    n_samples: String(nSamples),
  });
  return apiFetch<{
    job_id: string;
    dataset_id: string;
    status: string;
    n_samples: number;
  }>(`/api/generate?${params.toString()}`, { method: "POST" }, session);
}

export function getGenerationStatus(
  jobId: string,
  session?: AuthSession | null,
) {
  return apiFetch<GenerationStatusPayload>(
    `/api/generate-status/${jobId}`,
    {},
    session,
  );
}
