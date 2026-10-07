export function Spinner({ className = 'h-5 w-5' }) {
  return <svg className={`animate-spin motion-reduce:animate-none ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
    <path className="opacity-90" d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>;
}

// Full class names on purpose: Tailwind drops component classes it can't find
// written out literally, so `btn-${variant}` would compile to nothing.
const BUTTON_VARIANTS = {
  primary: 'btn-primary',
  accent: 'btn-accent',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost'
};

export function Button({ variant = 'primary', loading = false, className = '', type = 'button', disabled, children, ...props }) {
  return <button type={type} className={`btn ${BUTTON_VARIANTS[variant]} ${className}`} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
    {loading && <Spinner className="h-4 w-4" />}
    {children}
  </button>;
}

export function Alert({ children, action, tone = 'error' }) {
  const tones = {
    error: 'border-danger/20 bg-danger-soft text-danger',
    info: 'border-ink/10 bg-ink/5 text-ink'
  };
  return <div className={`flex items-start gap-3 rounded-2xl border p-4 text-sm leading-6 ${tones[tone]}`} role={tone === 'error' ? 'alert' : 'status'}>
    <svg className="mt-0.5 h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-4a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 6Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
    </svg>
    <div className="min-w-0 flex-1">
      <p>{children}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  </div>;
}

export function getInitials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join('') || '?';
}

export function Avatar({ name, tone = 'accent', className = 'h-11 w-11 text-sm' }) {
  const tones = {
    accent: 'bg-accent-soft text-accent-dark',
    ink: 'bg-ink text-cream'
  };
  return <span className={`grid shrink-0 place-items-center rounded-full font-semibold ${tones[tone]} ${className}`} aria-hidden="true">{getInitials(name)}</span>;
}

export function Logo() {
  return <svg className="h-7 w-7" viewBox="0 0 32 32" aria-hidden="true">
    <circle cx="12" cy="16" r="9" fill="#1B262C" />
    <circle cx="20" cy="16" r="9" fill="#3282B8" fillOpacity="0.85" />
  </svg>;
}
