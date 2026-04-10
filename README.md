# Clock Portal

Clock Portal is a small full-stack example project designed to be easy to understand, easy to run locally, and easy to deploy later as a Docker Compose based stack on Rosti.cz with Stacky.

It uses a FastAPI backend and a React + TypeScript + Vite frontend. The frontend is the only public service in production, while the backend stays internal to the Docker network and is reached through `/api`.

## Project overview

The app shows:

- current server time from FastAPI
- current browser/local time
- selected world clocks
- backend reachability status
- a small stack info footer

This repository is intentionally small and interview-friendly. There is no database, authentication, Redis, or extra infrastructure.

## Tech stack

- Python 3.12
- FastAPI
- Uvicorn
- Pytest
- React
- TypeScript
- Vite
- Docker
- Docker Compose
- Nginx for production frontend static serving and `/api` reverse proxy

## Folder structure

```text
clock_portal/
  backend/
    app/
      __init__.py
      main.py
    tests/
      test_health.py
    Dockerfile
    requirements.txt
  frontend/
    src/
      api.ts
      App.tsx
      main.tsx
      styles.css
      types.ts
      vite-env.d.ts
    Dockerfile
    index.html
    nginx.conf
    package.json
    tsconfig.json
    tsconfig.node.json
    vite.config.ts
  docker-compose.yml
  docker-compose.rosti.yml
  .gitignore
  README.md
```

## Ports used

### Local development

- Frontend: `3010`
- Backend: `8010`

### Rosti / production stack

- Frontend public HTTP port: `80`
- Backend: internal only, no public host port mapping

## API endpoints

- `GET /api/health`
- `GET /api/time/server`
- `GET /api/time/zones`

## Local run instructions without Docker

### 1. Start the backend

```bash
cd backend
python3.12 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8010
```

### 2. Start the frontend in a second terminal

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 3010
```

### 3. Open the app

```text
http://localhost:3010
```

The frontend uses `http://localhost:8010` as its development API base by default.

## Running tests

From the repository root:

```bash
cd backend
.venv/bin/pytest
```

## Docker run instructions

### Start local development stack

```bash
docker compose up --build
```

This uses `docker-compose.yml` and exposes:

- frontend on `http://localhost:3010`
- backend on `http://localhost:8010`

### Stop the stack

```bash
docker compose down
```

## Rosti deployment notes

This project includes a separate `docker-compose.rosti.yml` because local development and Rosti deployment have different needs:

- local development benefits from exposed frontend and backend ports
- Rosti should expose only one public HTTP port for the whole stack
- production uses the frontend container as the single public entrypoint
- production keeps the backend internal and routes `/api` requests through nginx inside the frontend container

This matches the Stacky deployment model well and keeps the stack easy to replace later with another application on the same account or domain.

## Rosti deployment instructions using docker-compose.rosti.yml

Build and run the production-style stack:

```bash
docker compose -f docker-compose.rosti.yml up --build -d
```

The exposed public endpoint is:

```text
http://localhost:80
```

In Rosti Stacky, use the same compose file as the stack definition. Only the frontend service exposes a host port. The backend remains reachable only through the internal Docker network and is proxied through `/api`.

To stop it locally:

```bash
docker compose -f docker-compose.rosti.yml down
```

## Why there are two compose files

- `docker-compose.yml`: local development with frontend and backend both exposed on host ports `3010` and `8010`
- `docker-compose.rosti.yml`: production-style stack for Rosti where only the frontend is public on port `80`

Keeping them separate avoids condition-heavy compose files and makes deployment intent obvious.

## How to push to GitHub

Initialize a new repository and push:

```bash
git init
git branch -M main
git add .
git commit -m "Initial commit: clock_portal"
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/clock_portal.git
git push -u origin main
```

## Notes for future extension

- add a database-backed feature such as saved favorite time zones
- add user preferences and persistence
- introduce a dedicated API client layer if the frontend grows
- add frontend tests with Vitest and React Testing Library
- replace the static time zone list with configuration or admin-managed data
- add observability, structured logging, and health checks if the app becomes part of a larger stack
