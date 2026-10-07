const steps = [
  { path: '/', label: 'You' },
  { path: '/quiz', label: 'Questions' },
  { path: '/match', label: 'Connect' }
];

export default function Stepper({ pathname }) {
  const current = Math.max(0, steps.findIndex((step) => step.path === pathname));

  return <ol className="flex items-center gap-1.5 sm:gap-2" aria-label="Progress">
    {steps.map((step, index) => {
      const done = index < current;
      const active = index === current;
      return <li className="flex items-center gap-1.5 sm:gap-2" key={step.path} aria-current={active ? 'step' : undefined}>
        {index > 0 && <span className={`h-px w-3 sm:w-6 ${done || active ? 'bg-accent' : 'bg-ink/15'}`} aria-hidden="true" />}
        <span className={`grid h-6 w-6 place-items-center rounded-full text-[11px] font-bold ${active ? 'scale-110 bg-accent text-cream shadow-[0_0_0_4px_rgba(27,38,44,0.15)]' : done ? 'bg-ink text-cream' : 'bg-ink/10 text-ink/50'}`}>
          {done
            ? <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.58l7.3-7.3a1 1 0 0 1 1.4 0Z" clipRule="evenodd" /></svg>
            : index + 1}
        </span>
        <span className={`hidden text-xs font-semibold sm:inline ${active ? 'text-ink' : 'text-ink/45'}`}>{step.label}</span>
        <span className="sr-only">{done ? '(completed)' : ''}</span>
      </li>;
    })}
  </ol>;
}
