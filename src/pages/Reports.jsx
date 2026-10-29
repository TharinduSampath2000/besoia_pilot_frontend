import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Button, Spinner } from '../components/ui.jsx';
import { useI18n } from '../i18n.jsx';

const STORAGE_KEY = 'besoia_reports_passcode';
const MAX_ATTEMPTS = 8;
const RETRY_DELAY = 8000;

function readPasscode() {
  try { return localStorage.getItem(STORAGE_KEY) || ''; } catch { return ''; }
}

function writePasscode(value) {
  try { value ? localStorage.setItem(STORAGE_KEY, value) : localStorage.removeItem(STORAGE_KEY); } catch {}
}

function saveFile(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

// the API may be asleep on Render's free plan, so retry until it gives a real answer
async function fetchReport(passcode, onWaiting) {
  for (let attempt = 1; ; attempt++) {
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode })
      });
      const type = response.headers.get('content-type') || '';
      if (response.ok && type.includes('spreadsheet')) {
        const filename = /filename="?([^"]+)"?/.exec(response.headers.get('content-disposition') || '')?.[1] || 'besoia-report.xlsx';
        return { blob: await response.blob(), filename };
      }
      if (type.includes('json')) {
        const body = await response.json();
        return { status: response.status, error: { code: body.code, message: body.error } };
      }
    } catch {}
    if (attempt === MAX_ATTEMPTS) return { error: { code: 'network' } };
    onWaiting();
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
  }
}

export default function Reports() {
  const [passcode, setPasscode] = useState(readPasscode);
  const [state, setState] = useState({ step: 'form' });
  const started = useRef(false);
  const { t, errorText } = useI18n();

  async function download(code) {
    setState({ step: 'downloading' });
    const result = await fetchReport(code, () => setState({ step: 'downloading', waking: true }));
    if (result.blob) {
      writePasscode(code);
      saveFile(result.blob, result.filename);
      return setState({ step: 'done', filename: result.filename });
    }
    if (result.status === 401) {
      writePasscode('');
      setPasscode('');
    }
    setState({ step: 'form', error: result.error });
  }

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (passcode) download(passcode);
  }, []);

  function forget() {
    writePasscode('');
    setPasscode('');
    setState({ step: 'form' });
  }

  return <section>
    <p className="eyebrow">{t('reports.eyebrow')}</p>
    <h1 className="mt-2 text-3xl font-semibold leading-tight sm:mt-3 sm:text-5xl">{t('reports.title')}</h1>

    <div className="card mt-6 p-6">
      {state.step === 'downloading' && <div className="flex items-center gap-3 text-ink-soft">
        <Spinner className="h-5 w-5 text-accent" />{state.waking ? t('reports.waking') : t('reports.preparing')}
      </div>}

      {state.step === 'done' && <>
        <Alert tone="info">{t('reports.downloaded', { file: state.filename })}</Alert>
        <Button variant="secondary" className="mt-4 w-full" onClick={() => download(passcode)}>{t('reports.again')}</Button>
        <Button variant="ghost" className="mt-2 w-full text-sm" onClick={forget}>{t('reports.forget')}</Button>
      </>}

      {state.step === 'form' && <form onSubmit={(event) => { event.preventDefault(); if (passcode.trim()) download(passcode.trim()); }} noValidate>
        <label className="text-sm font-semibold" htmlFor="passcode">{t('reports.passcode')}</label>
        <input className="input mt-2" id="passcode" type="password" value={passcode} onChange={(event) => setPasscode(event.target.value)} autoComplete="current-password" autoFocus />
        {state.error && <div className="mt-4"><Alert>{errorText(state.error)}</Alert></div>}
        <Button type="submit" className="mt-4 w-full" disabled={!passcode.trim()}>{t('reports.download')}</Button>
      </form>}

      <Link to="/" className="btn btn-primary mt-6 w-full no-underline">{t('common.goHome')}</Link>
    </div>
  </section>;
}
