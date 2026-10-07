import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Spinner } from './ui.jsx';

function Tab({ active, onClick, children }) {
  return <button type="button" role="tab" aria-selected={active} onClick={onClick}
    className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold ${active ? 'bg-cream text-ink shadow-sm' : 'text-ink/55 hover:text-ink'}`}>{children}</button>;
}

export default function CameraScanner({ onScan, onError }) {
  const [mode, setMode] = useState('camera');
  const [cameraState, setCameraState] = useState('starting');
  const [fileState, setFileState] = useState({ name: '', scanning: false });
  const [isDragging, setIsDragging] = useState(false);
  // Keep the latest callbacks without restarting the camera on every parent render.
  const callbacks = useRef({ onScan, onError });
  callbacks.current = { onScan, onError };

  useEffect(() => {
    if (mode !== 'camera') return undefined;
    setCameraState('starting');
    const scanner = new Html5Qrcode('besoia-qr-reader', { verbose: false });
    let disposed = false;
    let scannerStarted = false;

    const stopScanner = async () => {
      if (!scannerStarted) return;
      scannerStarted = false;
      try {
        await scanner.stop();
      } catch {}
    };

    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: (width, height) => { const size = Math.floor(Math.min(width, height) * 0.7); return { width: size, height: size }; } },
      async (decodedText) => {
        await stopScanner();
        if (!disposed) {
          navigator.vibrate?.(60);
          callbacks.current.onScan(decodedText);
        }
      },
      () => {}
    ).then(() => {
      scannerStarted = true;
      if (disposed) stopScanner();
      else setCameraState('live');
    }).catch((error) => {
      if (disposed) return;
      setCameraState('error');
      callbacks.current.onError(error?.name === 'NotAllowedError' || String(error).includes('Permission')
        ? 'Camera access was blocked. Allow it in your browser settings, or upload a screenshot of their code instead.'
        : "The camera couldn't start. You can upload a screenshot of their code instead.");
    });
    return () => {
      disposed = true;
      stopScanner();
    };
  }, [mode]);

  async function scanFile(file) {
    if (!file) return;
    setFileState({ name: file.name, scanning: true });
    try {
      const scanner = new Html5Qrcode('besoia-file-reader', { verbose: false });
      const decodedText = await scanner.scanFile(file, false);
      try { scanner.clear(); } catch {}
      callbacks.current.onScan(decodedText);
    } catch {
      callbacks.current.onError('No QR code found in that image. Try a clearer screenshot of their code.');
    } finally {
      setFileState((current) => ({ ...current, scanning: false }));
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    scanFile(event.dataTransfer.files?.[0]);
  }

  return <div className="mt-5">
    <div className="flex gap-1 rounded-xl bg-ink/5 p-1" role="tablist" aria-label="Scan method">
      <Tab active={mode === 'camera'} onClick={() => setMode('camera')}>Camera</Tab>
      <Tab active={mode === 'file'} onClick={() => setMode('file')}>Upload image</Tab>
    </div>

    {mode === 'camera'
      ? <div className="relative mt-4 overflow-hidden rounded-2xl bg-ink">
        <div id="besoia-qr-reader" className="min-h-[260px] [&_video]:!w-full [&_video]:object-cover" />
        {cameraState === 'starting' && <div className="absolute inset-0 grid place-items-center text-cream/80">
          <div className="flex flex-col items-center gap-3 text-sm"><Spinner className="h-7 w-7" />Starting camera…</div>
        </div>}
        {cameraState === 'live' && <>
          <p className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-xs font-medium text-cream/85 [text-shadow:0_1px_4px_rgba(27,38,44,0.6)]">Point at their QR code</p>
        </>}
        {cameraState === 'error' && <div className="absolute inset-0 grid place-items-center p-6 text-center text-sm text-cream/80">
          <div>
            <p>Camera unavailable.</p>
            <button type="button" className="mt-3 rounded-lg bg-cream/15 px-4 py-2 font-semibold text-cream hover:bg-cream/25" onClick={() => setMode('file')}>Upload an image instead</button>
          </div>
        </div>}
      </div>
      : <div id="besoia-file-reader" className="mt-4">
        <label className={`flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center ${isDragging ? 'border-accent bg-accent-soft/50' : 'border-ink/20 bg-cream/50 hover:border-ink/35 hover:bg-cream'}`}
          onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={handleDrop}>
          {fileState.scanning
            ? <><Spinner className="h-7 w-7 text-accent" /><span className="mt-3 text-sm font-medium">Reading {fileState.name}…</span></>
            : <>
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent-soft text-accent-dark">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 16V4m0 0-4 4m4-4 4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></svg>
              </span>
              <span className="mt-4 font-semibold">Drop a screenshot of their code</span>
              <span className="mt-1 text-sm text-ink-soft">or tap to choose an image</span>
            </>}
          <input className="sr-only" type="file" accept="image/*" onChange={(event) => { scanFile(event.target.files?.[0]); event.target.value = ''; }} />
        </label>
      </div>}
  </div>;
}
