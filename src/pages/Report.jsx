import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Spinner } from '../components/ui.jsx';

const MAX_ATTEMPTS = 8;
const RETRY_DELAY = 8000;

// the API may be asleep on Render's free plan, so keep retrying until it answers with JSON
async function sendReport() {
  for (let attempt = 1; ; attempt++) {
    try {
      const response = await fetch('/api/report', { method: 'POST', credentials: 'include' });
      const body = await response.json();
      if (typeof body.ok === 'boolean') return body;
    } catch {}
    if (attempt === MAX_ATTEMPTS) return { ok: false, message: "Couldn't reach the server. Please try again in a minute." };
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
  }
}

export default function Report() {
  const [result, setResult] = useState(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    sendReport().then(setResult);
  }, []);

  return <section>
    <p className="eyebrow">Pilot data</p>
    <h1 className="mt-2 text-3xl font-semibold leading-tight sm:mt-3 sm:text-5xl">Report</h1>

    <div className="card mt-6 p-6">
      {result
        ? <Alert tone={result.ok ? 'info' : 'error'}>{result.message}</Alert>
        : <div className="flex items-center gap-3 text-ink-soft"><Spinner className="h-5 w-5 text-accent" />Sending the report…</div>}
      <Link to="/" className="btn btn-primary mt-6 w-full no-underline">Go to Besoia</Link>
    </div>
  </section>;
}
