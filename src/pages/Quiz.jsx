import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchQuestions, submitAnswers } from '../services/api.js';
import { useUser } from '../context/UserContext.jsx';
import { Alert, Button } from '../components/ui.jsx';

const DRAFT_KEY = 'besoia_quiz_draft';
const LETTERS = ['A', 'B', 'C', 'D', 'E'];

function readDraft() {
  try { return JSON.parse(sessionStorage.getItem(DRAFT_KEY)) || {}; } catch { return {}; }
}

function QuestionSkeleton() {
  return <div className="card p-6 sm:p-8" aria-hidden="true">
    <div className="h-3 w-24 rounded bg-ink/10" />
    <div className="mt-5 h-7 w-4/5 rounded bg-ink/10" />
    <div className="mt-8 space-y-3">{[0, 1, 2].map((item) => <div className="h-16 rounded-2xl bg-ink/5" key={item} />)}</div>
  </div>;
}

export default function Quiz() {
  const { user, setUser } = useUser();
  const [questions, setQuestions] = useState([]);
  const [loadState, setLoadState] = useState('loading');
  const [answers, setAnswers] = useState(() => ({ ...(user?.answers || {}), ...readDraft() }));
  const [index, setIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const advanceTimer = useRef(null);
  const navigate = useNavigate();

  const loadQuestions = useCallback(() => {
    setLoadState('loading');
    fetchQuestions()
      .then((loaded) => {
        setQuestions(loaded);
        setLoadState('ready');
        const firstUnanswered = loaded.findIndex((question) => !answers[question.id]);
        setIndex(firstUnanswered === -1 ? loaded.length - 1 : firstUnanswered);
      })
      .catch((requestError) => { setError(requestError.message); setLoadState('error'); });
    // Only the answers present on first load decide where to resume.
  }, []);

  useEffect(loadQuestions, [loadQuestions]);
  useEffect(() => () => clearTimeout(advanceTimer.current), []);
  useEffect(() => {
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(answers)); } catch {}
  }, [answers]);

  const total = questions.length;
  const question = questions[index];
  const answeredCount = questions.filter((item) => answers[item.id]).length;
  const allAnswered = total > 0 && answeredCount === total;
  const isLast = index === total - 1;

  const goTo = useCallback((next) => {
    clearTimeout(advanceTimer.current);
    setIndex(Math.min(Math.max(next, 0), total - 1));
  }, [total]);

  const choose = useCallback((option) => {
    if (!question) return;
    setAnswers((current) => ({ ...current, [question.id]: option }));
    clearTimeout(advanceTimer.current);
    if (index < total - 1) advanceTimer.current = setTimeout(() => setIndex((current) => Math.min(current + 1, total - 1)), 380);
  }, [question, index, total]);

  async function handleSubmit() {
    if (!allAnswered) {
      goTo(questions.findIndex((item) => !answers[item.id]));
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await submitAnswers(answers);
      try { sessionStorage.removeItem(DRAFT_KEY); } catch {}
      setUser({ ...user, answers, quizComplete: true });
      navigate('/match');
    } catch (requestError) {
      setError(requestError.message);
      setSubmitting(false);
    }
  }

  useEffect(() => {
    function onKeyDown(event) {
      if (!question || submitting || event.metaKey || event.ctrlKey || event.altKey) return;
      const key = event.key.toUpperCase();
      const optionIndex = /^[1-9]$/.test(key) ? Number(key) - 1 : LETTERS.indexOf(key);
      if (optionIndex >= 0 && question.options[optionIndex]) choose(question.options[optionIndex]);
      else if (event.key === 'ArrowRight' && answers[question.id]) goTo(index + 1);
      else if (event.key === 'ArrowLeft') goTo(index - 1);
      else if (event.key === 'Enter' && isLast && allAnswered && event.target === document.body) handleSubmit();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  return <section>
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="eyebrow">Seven small choices</p>
        <h1 className="mt-2 text-3xl font-semibold leading-tight sm:mt-3 sm:text-5xl">No right answers.</h1>
      </div>
      {total > 0 && <p className="shrink-0 pb-1 text-sm font-semibold tabular-nums text-ink-soft"><span className="text-ink">{answeredCount}</span> / {total}</p>}
    </div>

    <div className="mt-4 h-1.5 overflow-hidden sm:mt-6 rounded-full bg-ink/10" role="progressbar" aria-valuemin={0} aria-valuemax={total || 7} aria-valuenow={answeredCount} aria-label="Questions answered">
      <div className="h-full rounded-full bg-accent" style={{ width: `${total ? (answeredCount / total) * 100 : 0}%` }} />
    </div>

    <div className="mt-4 sm:mt-6">
      {loadState === 'loading' && <QuestionSkeleton />}
      {loadState === 'error' && <Alert action={<Button variant="secondary" className="px-4 py-2 text-sm" onClick={loadQuestions}>Try again</Button>}>{error}</Alert>}

      {question && <div className="card p-5 sm:p-8">
        <div key={question.id}>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/45">Question {index + 1} of {total}</p>
          <h2 id={`question-${question.id}`} className="mt-3 text-2xl font-semibold leading-snug sm:text-[1.75rem]">{question.question}</h2>

          <div className="mt-5 space-y-2.5 sm:mt-7 sm:space-y-3" role="radiogroup" aria-labelledby={`question-${question.id}`}>
            {question.options.map((option, optionIndex) => {
              const selected = answers[question.id] === option;
              return <button type="button" role="radio" aria-checked={selected} key={option} onClick={() => choose(option)}
                className={`group flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left ${selected ? 'border-accent bg-accent-soft/60 shadow-[0_6px_18px_-10px_rgba(27,38,44,0.7)]' : 'border-ink/10 bg-cream hover:border-ink/25 hover:shadow-sm'}`}>
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-bold ${selected ? 'bg-accent text-cream' : 'bg-ink/5 text-ink/60 group-hover:bg-ink/10'}`}>
                  {selected
                    ? <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.58l7.3-7.3a1 1 0 0 1 1.4 0Z" clipRule="evenodd" /></svg>
                    : LETTERS[optionIndex]}
                </span>
                <span className="text-base font-medium">{option}</span>
              </button>;
            })}
          </div>
        </div>

        <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Jump to question">
          {questions.map((item, itemIndex) => <button type="button" key={item.id} onClick={() => goTo(itemIndex)} aria-label={`Question ${itemIndex + 1}${answers[item.id] ? ', answered' : ''}`} aria-current={itemIndex === index ? 'step' : undefined}
            className={`h-2.5 rounded-full ${itemIndex === index ? 'w-7 bg-ink' : answers[item.id] ? 'w-2.5 bg-accent' : 'w-2.5 bg-ink/15 hover:bg-ink/30'}`} />)}
        </nav>

        <div className="mt-8 flex gap-3">
          <Button variant="secondary" onClick={() => (index === 0 ? navigate('/') : goTo(index - 1))} aria-label={index === 0 ? 'Back to start' : 'Previous question'}>
            <span aria-hidden="true">←</span><span className="hidden sm:inline">Back</span>
          </Button>
          {isLast || allAnswered
            ? <Button variant="accent" className="flex-1" loading={submitting} onClick={handleSubmit}>
              {submitting ? 'Saving your answers…' : allAnswered ? 'See my QR code' : `Answer ${total - answeredCount} more`}
            </Button>
            : <Button className="flex-1" disabled={!answers[question.id]} onClick={() => goTo(index + 1)}>Next <span aria-hidden="true">→</span></Button>}
        </div>

        {error && loadState === 'ready' && <div className="mt-4"><Alert>{error}</Alert></div>}
      </div>}
    </div>
  </section>;
}
