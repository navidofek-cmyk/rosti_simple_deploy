export interface HealthResponse {
  status: string;
  service: string;
}

export interface TimePayload {
  label: string;
  timezone: string;
  iso_datetime: string;
  unix_timestamp: number;
}

export interface ServerTimeResponse {
  server: TimePayload;
}

export interface TimeZonesResponse {
  zones: TimePayload[];
}
