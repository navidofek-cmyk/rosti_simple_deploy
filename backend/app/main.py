from datetime import datetime, timezone
from os import getenv
from typing import List
from zoneinfo import ZoneInfo

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


WORLD_ZONES = [
    ("Europe/Prague", "Prague"),
    ("Europe/London", "London"),
    ("Europe/Dublin", "Dublin"),
    ("Europe/Lisbon", "Lisbon"),
    ("Europe/Madrid", "Madrid"),
    ("Europe/Paris", "Paris"),
    ("Europe/Amsterdam", "Amsterdam"),
    ("Europe/Berlin", "Berlin"),
    ("Europe/Rome", "Rome"),
    ("Europe/Athens", "Athens"),
    ("Europe/Helsinki", "Helsinki"),
    ("Europe/Istanbul", "Istanbul"),
    ("Africa/Cairo", "Cairo"),
    ("Africa/Johannesburg", "Johannesburg"),
    ("Africa/Nairobi", "Nairobi"),
    ("Asia/Dubai", "Dubai"),
    ("Asia/Jerusalem", "Jerusalem"),
    ("Asia/Riyadh", "Riyadh"),
    ("Asia/Karachi", "Karachi"),
    ("Asia/Kolkata", "Mumbai"),
    ("Asia/Dhaka", "Dhaka"),
    ("Asia/Bangkok", "Bangkok"),
    ("Asia/Singapore", "Singapore"),
    ("Asia/Hong_Kong", "Hong Kong"),
    ("Asia/Shanghai", "Shanghai"),
    ("Asia/Seoul", "Seoul"),
    ("America/New_York", "New York"),
    ("America/Toronto", "Toronto"),
    ("America/Chicago", "Chicago"),
    ("America/Denver", "Denver"),
    ("America/Los_Angeles", "Los Angeles"),
    ("America/Phoenix", "Phoenix"),
    ("America/Mexico_City", "Mexico City"),
    ("America/Bogota", "Bogota"),
    ("America/Lima", "Lima"),
    ("America/Santiago", "Santiago"),
    ("America/Sao_Paulo", "Sao Paulo"),
    ("America/Buenos_Aires", "Buenos Aires"),
    ("Asia/Tokyo", "Tokyo"),
    ("Asia/Jakarta", "Jakarta"),
    ("Australia/Perth", "Perth"),
    ("Australia/Sydney", "Sydney"),
    ("Pacific/Auckland", "Auckland"),
    ("Pacific/Honolulu", "Honolulu"),
]


class HealthResponse(BaseModel):
    status: str
    service: str


class TimePayload(BaseModel):
    label: str
    timezone: str
    iso_datetime: str
    unix_timestamp: int


class ServerTimeResponse(BaseModel):
    server: TimePayload


class TimeZonesResponse(BaseModel):
    zones: List[TimePayload]


def build_time_payload(timezone_name: str, label: str) -> TimePayload:
    now = datetime.now(ZoneInfo(timezone_name))
    return TimePayload(
        label=label,
        timezone=timezone_name,
        iso_datetime=now.isoformat(),
        unix_timestamp=int(now.timestamp()),
    )


def get_allowed_origins() -> list[str]:
    raw_origins = getenv(
        "APP_CORS_ORIGINS",
        "http://localhost:3010,http://127.0.0.1:3010,http://localhost:5173,http://127.0.0.1:5173",
    )
    return [origin.strip() for origin in raw_origins.split(",") if origin.strip()]


app = FastAPI(title="Clock Portal API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/api/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok", service="clock-portal-backend")


@app.get("/api/time/server", response_model=ServerTimeResponse)
def server_time() -> ServerTimeResponse:
    server_now = datetime.now(timezone.utc).astimezone()
    timezone_name = str(server_now.tzinfo)
    return ServerTimeResponse(
        server=TimePayload(
            label="Server",
            timezone=timezone_name,
            iso_datetime=server_now.isoformat(),
            unix_timestamp=int(server_now.timestamp()),
        )
    )


@app.get("/api/time/zones", response_model=TimeZonesResponse)
def zones() -> TimeZonesResponse:
    return TimeZonesResponse(
        zones=[build_time_payload(timezone_name, label) for timezone_name, label in WORLD_ZONES]
    )
