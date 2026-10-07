import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api.js';
import { useUser } from '../context/UserContext.jsx';
import { Alert, Avatar, Button } from '../components/ui.jsx';

const MAX_NAME = 80;

const howItWorks = [
  { title: 'Say hi', body: 'Just your first name. No sign-up.', icon: 'M10 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm-6.5 7a6.5 6.5 0 0 1 13 0' },
  { title: '7 quick picks', body: 'Tap what feels most like you.', icon: 'M4 5h12M4 10h12M4 15h7' },
  { title: 'Swap codes', body: 'Scan each other and compare.', icon: 'M3 3h5v5H3zM12 3h5v5h-5zM3 12h5v5H3zM12 12h2m3 0v5m-5 0h2' }
];

export default function Home() {
  const { user, setUser, sessionExpired, startOver } = useUser();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const trimmed = name.trim();

  async function handleSubmit(event) {
    event.preventDefault();
    if (!trimmed) return;
    setError('');
    setLoading(true);
    try {
      const registered = await registerUser(trimmed);
      setUser({ ...registered, quizComplete: false });
      navigate('/quiz');
    } catch (requestError) {
      setError(requestError.message);
      setLoading(false);
    }
  }

  return <section>
    <p className="eyebrow">A two-minute icebreaker</p>
    <h1 className="mt-4 text-[2.75rem] font-semibold leading-[1.02] sm:text-6xl">Find your <span className="italic text-accent">shared</span> signal.</h1>
    <p className="mt-5 max-w-md text-lg leading-8 text-ink-soft">A quick, low-pressure way to discover what you have in common with someone new.</p>

    {user ? <div className="card mt-10 max-w-md p-6">
      <div className="flex items-center gap-4">
        <Avatar name={user.name} tone="ink" className="h-12 w-12 text-base" />
        <div className="min-w-0">
          <p className="text-sm text-ink-soft">Welcome back,</p>
          <p className="truncate font-display text-2xl font-semibold">{user.name}</p>
        </div>
      </div>
      <Button className="mt-6 w-full" onClick={() => navigate(user.quizComplete ? '/match' : '/quiz')}>
        {user.quizComplete ? 'Continue to connect' : 'Continue the questions'}
        <span aria-hidden="true">→</span>
      </Button>
      <Button variant="ghost" className="mt-2 w-full text-sm" onClick={startOver}>Not you? Start fresh</Button>
    </div> : <form className="card mt-10 max-w-md p-6" onSubmit={handleSubmit} noValidate>
      {sessionExpired && <div className="mb-5"><Alert tone="info">Your last session expired. Enter your name to start a new one.</Alert></div>}
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-semibold" htmlFor="name">What should we call you?</label>
        <span className={`text-xs tabular-nums ${name.length > MAX_NAME - 10 ? 'text-accent' : 'text-ink/40'}`}>{name.length}/{MAX_NAME}</span>
      </div>
      <input className="input mt-2" id="name" value={name} onChange={(event) => setName(event.target.value)} maxLength={MAX_NAME} placeholder="Your first name" autoComplete="given-name" autoFocus enterKeyHint="go" />
      <Button type="submit" className="mt-4 w-full" loading={loading} disabled={!trimmed}>
        {loading ? 'Getting ready…' : 'Start the seven questions'}
        {!loading && <span aria-hidden="true">→</span>}
      </Button>
      {error && <div className="mt-4"><Alert>{error}</Alert></div>}
      <p className="mt-4 text-center text-xs text-ink/45">No email, no password. Your session lasts 24 hours.</p>
    </form>}

    <ol className="mt-12 grid gap-3 sm:grid-cols-3">
      {howItWorks.map((step) => <li className="flex items-start gap-3 rounded-2xl border border-ink/10 bg-cream/40 p-4 sm:flex-col" key={step.title}>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-dark">
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={step.icon} /></svg>
        </span>
        <div>
          <p className="text-sm font-semibold">{step.title}</p>
          <p className="mt-0.5 text-sm leading-5 text-ink-soft">{step.body}</p>
        </div>
      </li>)}
    </ol>
  </section>;
}
