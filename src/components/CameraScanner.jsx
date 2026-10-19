import { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import { Spinner } from './ui.jsx';

export default function CameraScanner({ onScan, onError }) {
  const [cameraState, setCameraState] = useState('starting');
  const videoRef = useRef(null);
  // Keep the latest callbacks without restarting the camera on every parent render.
  const callbacks = useRef({ onScan, onError });
  callbacks.current = { onScan, onError };

  useEffect(() => {
    let done = false;
    const scanner = new QrScanner(videoRef.current, (result) => {
      if (done) return;
      done = true;
      scanner.stop();
      navigator.vibrate?.(60);
      callbacks.current.onScan(result.data);
    }, {
      preferredCamera: 'environment',
      maxScansPerSecond: 15,
      highlightScanRegion: true,
      returnDetailedScanResult: true
    });

    scanner.start().then(() => {
      if (!done) setCameraState('live');
    }).catch((error) => {
      if (done) return;
      setCameraState('error');
      callbacks.current.onError(error?.name === 'NotAllowedError' || String(error).includes('Permission')
        ? 'Camera access was blocked. Allow it in your browser settings and reload the page.'
        : "The camera couldn't start. Close other apps using the camera and try again.");
    });
    return () => {
      done = true;
      scanner.destroy();
    };
  }, []);

  return <div className="relative mt-5 overflow-hidden rounded-2xl bg-ink">
    <video ref={videoRef} className="block h-[300px] w-full object-cover" playsInline muted />
    {cameraState === 'starting' && <div className="absolute inset-0 grid place-items-center text-cream/80">
      <div className="flex flex-col items-center gap-3 text-sm"><Spinner className="h-7 w-7" />Starting camera…</div>
    </div>}
    {cameraState === 'live' && <p className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-xs font-medium text-cream/85 [text-shadow:0_1px_4px_rgba(27,38,44,0.6)]">Point at their QR code</p>}
    {cameraState === 'error' && <div className="absolute inset-0 grid place-items-center p-6 text-center text-sm text-cream/80">
      <p>Camera unavailable.</p>
    </div>}
  </div>;
}
