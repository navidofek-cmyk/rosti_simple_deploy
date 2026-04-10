import type { HealthResponse, ServerTimeResponse, TimeZonesResponse } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function fetchHealth(): Promise<HealthResponse> {
  return fetchJson<HealthResponse>('/api/health');
}

export function fetchServerTime(): Promise<ServerTimeResponse> {
  return fetchJson<ServerTimeResponse>('/api/time/server');
}

export function fetchTimeZones(): Promise<TimeZonesResponse> {
  return fetchJson<TimeZonesResponse>('/api/time/zones');
}
