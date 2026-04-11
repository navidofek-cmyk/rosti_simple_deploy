import { useEffect, useState } from 'react';

import { fetchHealth, fetchServerTime, fetchTimeZones } from './api';
import type { TimePayload } from './types';

type BackendState = 'checking' | 'online' | 'offline';

function formatDisplay(isoDatetime: string): string {
  return new Date(isoDatetime).toLocaleString([], {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function App() {
  const [browserNow, setBrowserNow] = useState<Date>(new Date());
  const [serverTime, setServerTime] = useState<TimePayload | null>(null);
  const [zones, setZones] = useState<TimePayload[]>([]);
  const [backendState, setBackendState] = useState<BackendState>('checking');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const timer = window.setInterval(() => {
      setBrowserNow(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let active = true;

    async function refresh() {
      try {
        const [health, serverResponse, zonesResponse] = await Promise.all([
          fetchHealth(),
          fetchServerTime(),
          fetchTimeZones(),
        ]);

        if (!active) {
          return;
        }

        setBackendState(health.status === 'ok' ? 'online' : 'offline');
        setServerTime(serverResponse.server);
        setZones(zonesResponse.zones);
        setErrorMessage('');
      } catch (error) {
        if (!active) {
          return;
        }

        setBackendState('offline');
        setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
      }
    }

    refresh();
    const interval = window.setInterval(refresh, 1000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <div className="app-shell">
      <main className="app-card">
        <section className="hero">
          <div>
            <p className="eyebrow">FastAPI + React + Vite</p>
            <h1>Clock Portal</h1>
            <p className="hero-copy">
              A compact time dashboard with browser time, server time, and curated world clocks.
            </p>
          </div>
          <div className={`status-pill status-${backendState}`}>
            <span className="status-dot" />
            Backend {backendState}
          </div>
        </section>

        {errorMessage ? (
          <section className="message-card">
            <strong>Backend unavailable.</strong>
            <span>{errorMessage}</span>
          </section>
        ) : null}

        <section className="clock-grid primary-grid">
          <article className="clock-card">
            <p className="card-label">Server Time</p>
            <h2>{serverTime ? formatDisplay(serverTime.iso_datetime) : 'Loading...'}</h2>
            <p className="card-meta">{serverTime?.timezone ?? 'Waiting for backend'}</p>
          </article>

          <article className="clock-card">
            <p className="card-label">Browser Time</p>
            <h2>{browserNow.toLocaleString()}</h2>
            <p className="card-meta">
              {Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local browser timezone'}
            </p>
          </article>
        </section>

        <section>
          <div className="section-heading">
            <h3>World Clocks</h3>
            <p>
              {zones.length > 0
                ? `${zones.length} cities refreshed every second from the backend API.`
                : 'Updated every second from the backend API.'}
            </p>
          </div>

          <div className="clock-grid">
            {zones.length === 0 ? (
              <article className="clock-card">
                <p className="card-label">Loading</p>
                <h2>Fetching time zones...</h2>
                <p className="card-meta">The backend will populate this grid.</p>
              </article>
            ) : (
              zones.map((zone) => (
                <article className="clock-card" key={zone.timezone}>
                  <p className="card-label">{zone.label}</p>
                  <h2>{formatDisplay(zone.iso_datetime)}</h2>
                  <p className="card-meta">{zone.timezone}</p>
                </article>
              ))
            )}
          </div>
        </section>

        <footer className="footer-card">
          <p>
            Stack: Python 3.12, FastAPI, React, TypeScript, Vite, Docker, Docker Compose.
          </p>
          <p>
            Production shape: frontend on one public port, backend internal behind `/api`.
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;
