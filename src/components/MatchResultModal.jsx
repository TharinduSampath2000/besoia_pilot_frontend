import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Avatar } from './ui.jsx';

function scoreLabel(score) {
  if (score >= 86) return 'Practically twins';
  if (score >= 58) return 'Strong signal';
  if (score >= 29) return 'Some common ground';
  return 'Opposites attract';
}

function ScoreRing({ score }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  return <div className="relative mx-auto h-40 w-40">
    <svg className="h-full w-full -rotate-90" viewBox="0 0 128 128" aria-hidden="true">
      <circle cx="64" cy="64" r={radius} fill="none" stroke="rgba(27,38,44,0.08)" strokeWidth="10" />
      <circle cx="64" cy="64" r={radius} fill="none" stroke="#0F4C75" strokeWidth="10" strokeLinecap="round"
        strokeDasharray={circumference} strokeDashoffset={circumference * (1 - score / 100)} />
    </svg>
    <div className="absolute inset-0 grid place-items-center">
      <p className="font-display text-5xl font-semibold tabular-nums">{score}<span className="text-2xl text-ink/50">%</span></p>
    </div>
  </div>;
}

export default function MatchResultModal({ match, onClose, userName, celebrate = true }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!match) return undefined;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus({ preventScroll: true });
    const onKeyDown = (event) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      previousFocus?.focus?.();
    };
  }, [match, onClose]);

  if (!match) return null;
  const friendName = match.friend?.name || 'your friend';
  const shared = match.sharedAnswers || [];

  // Portal to body so the overlay covers the whole viewport, outside the page column.
  return createPortal(<div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 backdrop-blur-sm sm:items-center sm:p-5" role="dialog" aria-modal="true" aria-labelledby="match-result-title" onClick={(event) => event.target === event.currentTarget && onClose()}>
    <div ref={panelRef} tabIndex={-1} className="max-h-[92vh] max-h-[92dvh] w-full outline-none max-w-lg overflow-y-auto rounded-t-[2rem] bg-cream p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center shadow-2xl sm:rounded-[2rem] sm:p-9">
      <div className="flex items-center justify-center">
        <Avatar name={userName} tone="ink" className="h-12 w-12 text-base ring-4 ring-cream" />
        <Avatar name={friendName} className="-ml-3 h-12 w-12 text-base ring-4 ring-cream" />
      </div>
      <p className="eyebrow mt-4">{celebrate ? 'New connection' : 'Your connection'}</p>
      <h2 id="match-result-title" className="mt-2 text-2xl font-semibold leading-tight sm:text-3xl">You &amp; {friendName}</h2>

      <div className="mt-6"><ScoreRing score={match.score} /></div>
      <p className="mt-3 inline-flex rounded-full bg-accent-soft px-3 py-1 text-sm font-semibold text-accent-dark">{scoreLabel(match.score)}</p>

      <div className="mt-7 text-left">
        <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-ink/50">You both picked · {shared.length} of 7</h3>
        {shared.length > 0
          ? <ul className="mt-3 space-y-2">
            {shared.map((item) => <li className="flex items-start gap-3 rounded-2xl bg-cream/80 p-3.5 ring-1 ring-ink/5" key={item.questionId}>
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ink text-cream">
                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.58l7.3-7.3a1 1 0 0 1 1.4 0Z" clipRule="evenodd" /></svg>
              </span>
              <div className="min-w-0">
                <p className="font-semibold">{item.answer}</p>
                <p className="mt-0.5 text-sm leading-5 text-ink-soft">{item.question}</p>
              </div>
            </li>)}
          </ul>
          : <p className="mt-3 rounded-2xl bg-cream/80 p-4 text-sm leading-6 text-ink-soft ring-1 ring-ink/5">No identical picks, so you have plenty to talk about.</p>}
      </div>

      <div className="relative mt-6 rounded-2xl bg-ink p-5 text-left text-cream">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sage">Start with this</p>
        <p className="mt-2 font-display text-xl leading-snug">“{match.icebreaker}”</p>
      </div>

      <div className="sticky -bottom-6 -mx-6 mt-4 bg-gradient-to-t from-cream from-70% to-transparent px-6 pb-1 pt-5 sm:static sm:mx-0 sm:mt-7 sm:bg-none sm:p-0">
        <button type="button" className="btn btn-accent w-full" onClick={onClose}>Done</button>
      </div>
    </div>
  </div>, document.body);
}
