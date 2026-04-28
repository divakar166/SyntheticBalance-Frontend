'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Database, Lock, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { cn } from '@/lib/utils';

type Mode = 'signin' | 'signup';

function getPasswordStrength(pw: string): { score: number; color: string; label: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  const map = [
    { color: 'bg-red-500', label: 'Weak' },
    { color: 'bg-orange-500', label: 'Fair' },
    { color: 'bg-yellow-400', label: 'Good' },
    { color: 'bg-emerald-500', label: 'Strong' },
  ];
  return { score, ...(map[score - 1] ?? { color: 'bg-red-500', label: '' }) };
}

export default function LoginPage() {
  const router = useRouter();
  const { session, isLoading, signIn, signUp } = useAuth();

  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [shakeEmail, setShakeEmail] = useState(false);
  const [shakePw, setShakePw] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (!isLoading && session) router.replace('/dashboard');
  }, [isLoading, router, session]);

  const strength = getPasswordStrength(password);

  const triggerShake = (field: 'email' | 'pw' | 'both') => {
    if (field === 'email' || field === 'both') {
      setShakeEmail(true);
      setTimeout(() => setShakeEmail(false), 400);
    }
    if (field === 'pw' || field === 'both') {
      setShakePw(true);
      setTimeout(() => setShakePw(false), 400);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email && !password) { triggerShake('both'); setError('Please fill in all fields.'); return; }
    if (!email) { triggerShake('email'); setError('Email is required.'); return; }
    if (!email.includes('@')) { triggerShake('email'); setError('Enter a valid email address.'); return; }
    if (!password) { triggerShake('pw'); setError('Password is required.'); return; }
    if (password.length < 6) { triggerShake('pw'); setError('Password must be at least 6 characters.'); return; }
    if (mode === 'signup' && strength.score < 2) {
      triggerShake('pw');
      setError('Password is too weak. Add uppercase letters, numbers, or symbols.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'signin') {
        await signIn(email, password);
        router.replace('/dashboard');
      } else {
        const signedIn = await signUp(email, password);
        if (signedIn) {
          router.replace('/dashboard');
        } else {
          setMessage('Check your inbox to confirm the account, then sign in.');
          setMode('signin');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setIsSubmitting(false);
      setPassword('');
    }
  };

  if (isLoading || session) return null;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#09090f] px-4 py-10">

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 animate-pulse rounded-full bg-indigo-600 opacity-[0.12] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 h-52 w-52 animate-pulse rounded-full bg-sky-500 opacity-[0.10] blur-3xl" style={{ animationDelay: '1.5s' }} />

      <div
        className={cn(
          'relative w-full max-w-md rounded-2xl border border-white/10 bg-white/4 p-8 backdrop-blur-sm',
          mounted ? 'animate-in fade-in slide-in-from-bottom-4 duration-500' : 'opacity-0',
        )}
      >
        <div className="mb-6 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-indigo-500/50 bg-indigo-500/10">
            <Database className="h-4 w-4 text-indigo-400" />
          </div>
          <span className="font-mono text-sm font-bold tracking-widest text-white/90">SYNTH_DATA</span>
          <span className="ml-auto rounded border border-indigo-500/30 px-2 py-0.5 font-mono text-[10px] tracking-widest text-indigo-400">
            v2.1
          </span>
        </div>

        <h1 className="text-2xl font-medium tracking-tight text-white">
          {mode === 'signin' ? 'Welcome back' : 'Create account'}
        </h1>
        <p className="mt-1 mb-6 text-sm text-white/35">
          {mode === 'signin'
            ? 'Sign in to access your datasets and GPU workflows'
            : 'Start generating synthetic datasets today'}
        </p>

        <div className="relative mb-6 grid grid-cols-2 rounded-lg bg-white/5 p-1">
          <div
            className={cn(
              'absolute top-1 h-[calc(100%-8px)] w-[calc(50%-4px)] rounded-md border border-indigo-500/40 bg-indigo-500/20 transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)]',
              mode === 'signup' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0',
            )}
          />
          {(['signin', 'signup'] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setError(''); setMessage(''); }}
              className={cn(
                'relative z-10 rounded-md py-1.5 text-sm font-medium transition-colors duration-200',
                mode === m ? 'text-white' : 'text-white/40 hover:text-white/60',
              )}
            >
              {m === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2.5 text-sm text-red-300">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-4 rounded-lg border border-indigo-500/25 bg-indigo-500/10 px-3 py-2.5 text-sm text-indigo-300">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className={cn('transition-transform', shakeEmail && 'animate-[shake_0.35s_ease]')}>
            <label htmlFor="email" className="mb-1.5 block font-mono text-[11px] font-medium uppercase tracking-widest text-white/40">
              Email address
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/25 transition-colors" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className={cn(
                  'w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-9 pr-4 text-sm text-white placeholder:text-white/20',
                  'outline-none ring-0 transition-colors duration-200',
                  'focus:border-indigo-500/60 focus:bg-indigo-500/5',
                  'disabled:opacity-50',
                )}
              />
            </div>
          </div>

          <div className={cn('transition-transform', shakePw && 'animate-[shake_0.35s_ease]')}>
            <label htmlFor="password" className="mb-1.5 block font-mono text-[11px] font-medium uppercase tracking-widest text-white/40">
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/25" />
              <input
                id="password"
                type={showPw ? 'text' : 'password'}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                placeholder="••••••••"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                className={cn(
                  'w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-9 pr-10 text-sm text-white placeholder:text-white/20',
                  'outline-none ring-0 transition-colors duration-200',
                  'focus:border-indigo-500/60 focus:bg-indigo-500/5',
                  'disabled:opacity-50',
                )}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 transition-colors hover:text-white/60"
                aria-label="Toggle password visibility"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {mode === 'signup' && password.length > 0 && (
              <div className="mt-2 space-y-1">
                <div className="h-0.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className={cn('h-full rounded-full transition-all duration-300', strength.color)}
                    style={{ width: `${(strength.score / 4) * 100}%` }}
                  />
                </div>
                <p className="text-right font-mono text-[10px] text-white/30">{strength.label}</p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              'relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white',
              'transition-all duration-150 hover:bg-indigo-500 active:scale-[0.985]',
              'disabled:cursor-not-allowed disabled:opacity-50',
            )}
          >
            {isSubmitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                <span>{mode === 'signin' ? 'Signing in…' : 'Creating account…'}</span>
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4 opacity-70" />
                <span>{mode === 'signin' ? 'Sign in' : 'Create account'}</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/[0.07]" />
          <span className="font-mono text-[10px] tracking-widest text-white/20">secured by supabase</span>
          <div className="h-px flex-1 bg-white/[0.07]" />
        </div>
        <p className="mt-3 text-center font-mono text-[10px] tracking-wide text-white/15">
          GPU cluster access · Dataset versioning · Audit logs
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%,60%  { transform: translateX(-5px); }
          40%,80%  { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}