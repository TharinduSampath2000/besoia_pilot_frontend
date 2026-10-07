import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import QRDisplay from '../components/QRDisplay.jsx';
import MatchResultModal from '../components/MatchResultModal.jsx';
import { Alert, Avatar, Button, Spinner } from '../components/ui.jsx';
import { fetchPendingMatch, logQrGenerated, scanMatch } from '../services/api.js';
import { friendToMatch, matchToFriend, useUser } from '../context/UserContext.jsx';

const POLL_INTERVAL = 2500;
// The QR decoder is most of the bundle, so load it only when someone opens the scanner.
const CameraScanner = lazy(() => import('../components/CameraScanner.jsx'));

function timeAgo(isoDate) {
  const seconds = Math.round((Date.now() - new Date(isoDate).getTime()) / 1000);
  if (!Number.isFinite(seconds) || seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} h ago`;
  return new Date(isoDate).toLocaleDateString();
}

function ModeSwitch({ tab, onChange }) {
  const tabs = [{ id: 'show', label: 'My code' }, { id: 'scan', label: 'Scan theirs' }];
  return <div className="relative grid grid-cols-2 rounded-2xl bg-ink/5 p-1" role="tablist" aria-label="Connect method">
    <span className={`absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-xl bg-ink shadow ${tab === 'scan' ? 'translate-x-full' : ''}`} aria-hidden="true" />
    {tabs.map((item) => <button key={item.id} type="button" role="tab" aria-selected={tab === item.id} onClick={() => onChange(item.id)}
      className={`relative z-10 rounded-xl py-2.5 text-sm font-semibold ${tab === item.id ? 'text-cream' : 'text-ink/60 hover:text-ink'}`}>{item.label}</button>)}
  </div>;
}

export default function ScanOrShow() {
  const { user, friends, addFriend } = useUser();
  const [tab, setTab] = useState('show');
  const [error, setError] = useState('');
  const [matching, setMatching] = useState(false);
  const [scanKey, setScanKey] = useState(0);
  const [result, setResult] = useState(null);
  const knownMatchIds = useRef(new Set());
  const qrLogged = useRef(false);

  knownMatchIds.current = new Set(friends.map((friend) => friend.matchId).filter(Boolean));

  const showMatch = useCallback((match) => {
    knownMatchIds.current.add(match.matchId);
    addFriend(matchToFriend(match));
    setResult({ match, celebrate: true });
  }, [addFriend]);

  // User A never scans: poll while their code is on screen and surface any match we haven't shown yet.
  useEffect(() => {
    if (tab !== 'show') return undefined;
    if (!qrLogged.current) {
      qrLogged.current = true;
      logQrGenerated().catch(() => {});
    }
    let active = true;
    const check = async () => {
      if (document.hidden) return;
      try {
        const { match } = await fetchPendingMatch();
        if (active && match && !knownMatchIds.current.has(match.matchId)) showMatch(match);
      } catch {}
    };
    check();
    const timer = setInterval(check, POLL_INTERVAL);
    return () => { active = false; clearInterval(timer); };
  }, [tab, showMatch]);

  const handleScan = useCallback(async (scannedId) => {
    setError('');
    setMatching(true);
    try {
      const { match } = await scanMatch(scannedId);
      showMatch(match);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setMatching(false);
    }
  }, [showMatch]);

  const handleScannerError = useCallback((message) => setError(message), []);

  function switchTab(next) {
    setError('');
    setTab(next);
  }

  function rescan() {
    setError('');
    setScanKey((key) => key + 1);
  }

  const closeResult = useCallback(() => {
    setResult(null);
    setScanKey((key) => key + 1);
  }, []);

  return <section>
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="eyebrow">Almost there, {user?.name}</p>
        <h1 className="mt-2 text-3xl font-semibold leading-tight sm:mt-3 sm:text-5xl">Swap your signal.</h1>
      </div>
    </div>
    <p className="mt-3 max-w-md leading-7 text-ink-soft">One of you shows a code, the other scans it. You'll both see the result at the same time.</p>

    <div className="card mt-6 p-4 sm:mt-8 sm:p-7">
      <ModeSwitch tab={tab} onChange={switchTab} />

      {tab === 'show' && <div className="mt-8 text-center" key="show">
        <QRDisplay sessionId={user?.sessionId} name={user?.name} />
        <p className="mt-5 font-display text-xl font-semibold">{user?.name}</p>
        <p className="mx-auto mt-1 max-w-xs text-sm leading-6 text-ink-soft">Hold your phone up so they can scan this.</p>
        <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-ink/5 px-4 py-2 text-xs font-semibold text-ink/70" role="status">
          <span className="h-2 w-2 rounded-full bg-accent" />
          Waiting for them to scan…
        </div>
      </div>}

      {tab === 'scan' && <div className="relative" key="scan">
        <Suspense fallback={<div className="mt-5 grid h-[300px] place-items-center rounded-2xl bg-ink/5 text-ink/50"><Spinner className="h-7 w-7" /></div>}>
          <CameraScanner key={scanKey} onScan={handleScan} onError={handleScannerError} />
        </Suspense>
        {matching && <div className="absolute inset-0 z-10 grid place-items-center rounded-2xl bg-cream/90 backdrop-blur-sm" role="status">
          <div className="flex flex-col items-center gap-3 text-center">
            <Spinner className="h-8 w-8 text-accent" />
            <p className="font-display text-lg font-semibold">Comparing answers…</p>
          </div>
        </div>}
      </div>}

      {error && <div className="mt-5"><Alert action={tab === 'scan' && <Button variant="secondary" className="px-4 py-2 text-sm" onClick={rescan}>Scan again</Button>}>{error}</Alert></div>}
    </div>

    <div className="card mt-5 p-5 sm:p-7">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Your connections</h2>
          <p className="mt-0.5 text-sm text-ink-soft">Tap someone to see your result again.</p>
        </div>
        <span className="grid h-8 min-w-8 place-items-center rounded-full bg-ink px-2 text-sm font-semibold text-cream">{friends.length}</span>
      </div>

      {friends.length > 0
        ? <ul className="mt-4 space-y-2" aria-label="Connections">
          {friends.map((friend) => <li key={friend.id}>
            <button type="button" className="flex w-full min-w-0 items-center gap-3 rounded-2xl p-3 text-left hover:bg-ink/5" onClick={() => setResult({ match: friendToMatch(friend), celebrate: false })}>
              <Avatar name={friend.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{friend.name}</p>
                <p className="mt-0.5 truncate text-sm text-ink-soft">{friend.matchedAt ? timeAgo(friend.matchedAt) : 'Connected'} · {(friend.sharedAnswers || []).length} in common</p>
              </div>
              <span className="shrink-0 rounded-full bg-accent-soft px-2.5 py-1 text-sm font-bold tabular-nums text-accent-dark">{friend.score}%</span>
              <svg className="h-4 w-4 shrink-0 text-ink/30" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M7.2 14.8a1 1 0 0 1 0-1.4L10.58 10 7.2 6.6a1 1 0 1 1 1.4-1.4l4.1 4.1a1 1 0 0 1 0 1.4l-4.1 4.1a1 1 0 0 1-1.4 0Z" clipRule="evenodd" /></svg>
            </button>
          </li>)}
        </ul>
        : <div className="mt-4 rounded-2xl border-2 border-dashed border-ink/10 py-10 text-center">
          <div className="mx-auto flex w-fit items-center">
            <span className="h-9 w-9 rounded-full bg-ink/10" />
            <span className="-ml-3 h-9 w-9 rounded-full bg-accent/20 ring-4 ring-cream" />
          </div>
          <p className="mt-4 font-semibold">No connections yet</p>
          <p className="mx-auto mt-1 max-w-xs text-sm leading-6 text-ink-soft">Swap codes with someone nearby and they'll show up here.</p>
        </div>}
    </div>

    <p className="mt-6 text-center text-sm text-ink-soft">Want to change a pick? <Link to="/quiz" className="inline-block py-2.5 font-semibold text-ink underline decoration-accent/40 underline-offset-4 hover:decoration-accent">Edit your answers</Link></p>

    <MatchResultModal match={result?.match} celebrate={result?.celebrate} userName={user?.name} onClose={closeResult} />
  </section>;
}
