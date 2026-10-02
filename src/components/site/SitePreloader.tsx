'use client';

import { useEffect, useMemo, useState } from 'react';
import { SchoolCrest } from '@/components/SchoolCrest';

const MESSAGES = [
  'Opening the memorial courtyard…',
  'Laying out the term’s notices…',
  'Warming the midday meal…',
  'Taking the morning register…',
  'Welcome to St. Teresa Aubyn Memorial School',
];

/**
 * The welcome gate shown while the site settles. It plays once per browser
 * session so that moving between pages never waits on it again.
 */
export function SitePreloader() {
  const [progress, setProgress] = useState(0);
  const [closing, setClosing] = useState(false);
  const [done, setDone] = useState(true); // server render: nothing shown
  const [step, setStep] = useState(0);

  useEffect(() => {
    let alreadySeen = false;
    try {
      alreadySeen = window.sessionStorage.getItem('teresa-welcome-seen') === '1';
    } catch {
      alreadySeen = false;
    }

    if (alreadySeen) {
      setDone(true);
      return;
    }

    setDone(false);
    document.body.style.overflow = 'hidden';

    let value = 0;
    const interval = window.setInterval(() => {
      // Ease the bar towards full so it never looks stuck.
      value += Math.max(3, Math.round((100 - value) * 0.14));
      if (value >= 100) value = 100;
      setProgress(value);
    }, 120);

    const stepTimer = window.setInterval(() => {
      setStep((current) => Math.min(current + 1, MESSAGES.length - 1));
    }, 620);

    const finishTimer = window.setTimeout(() => {
      try {
        window.sessionStorage.setItem('teresa-welcome-seen', '1');
      } catch {
        // Private browsing: the gate simply plays again next time.
      }
      setClosing(true);
      window.setTimeout(() => {
        setDone(true);
        document.body.style.overflow = '';
      }, 850);
    }, 2900);

    return () => {
      window.clearInterval(interval);
      window.clearInterval(stepTimer);
      window.clearTimeout(finishTimer);
      document.body.style.overflow = '';
    };
  }, []);

  const message = useMemo(() => MESSAGES[Math.min(step, MESSAGES.length - 1)], [step]);

  if (done) return null;

  return (
    <div
      className={`fixed inset-0 z-[999] flex items-center justify-center overflow-hidden transition-all duration-[850ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
        closing ? '-translate-y-2 scale-[1.03] opacity-0' : 'opacity-100'
      }`}
      role="status"
      aria-live="polite"
      aria-label="Loading the school website"
    >
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-teresa-green-950 via-teresa-green-900 to-[#07281d] animate-gradient-pan" />
      <div className="hero-blob -left-24 top-[-10%] h-72 w-72 bg-teresa-green-700 animate-float-slow" />
      <div className="hero-blob -right-20 bottom-[-15%] h-80 w-80 bg-teresa-gold-700/50 animate-float" />
      <div className="absolute inset-0 pattern-grid opacity-[0.12]" />
      <div className="absolute inset-0 hero-grain" />

      <div className="relative z-10 mx-auto flex w-full max-w-xl flex-col items-center px-6 text-center">
        {/* Crest with rotating rings */}
        <div className="relative mb-8 flex h-36 w-36 items-center justify-center">
          <span className="absolute inset-0 rounded-full border border-teresa-gold-400/30 animate-spin-slow" />
          <span className="absolute inset-3 rounded-full border-2 border-dashed border-teresa-gold-400/40 animate-spin-reverse" />
          <span className="absolute inset-0 rounded-full bg-teresa-gold-400/20 animate-pulse-ring" />
          <span className="absolute inset-6 rounded-full bg-teresa-gold-400/10 animate-pulse-ring [animation-delay:1.3s]" />
          <SchoolCrest size="xl" className="relative animate-pop-in drop-shadow-[0_10px_30px_rgba(0,0,0,0.45)]" />
        </div>

        <p className="animate-fade-down text-[11px] font-bold uppercase tracking-[0.42em] text-teresa-gold-300">
          Est. 1988 &middot; Accra
        </p>

        <h1 className="mt-4 animate-fade-up font-serif text-3xl font-bold leading-tight text-white sm:text-[42px]">
          Welcome to
          <span className="mt-1 block text-gradient-gold">St. Teresa Aubyn</span>
          <span className="block text-gradient-gold">Memorial School</span>
        </h1>

        <p
          key={message}
          className="mt-5 h-6 animate-tick text-sm font-medium text-emerald-100/90 sm:text-base"
        >
          {message}
        </p>

        {/* Progress bar */}
        <div className="mt-8 w-full">
          <div className="h-[6px] w-full overflow-hidden rounded-full bg-white/15">
            <div
              className="relative h-full rounded-full bg-gradient-to-r from-teresa-gold-300 via-teresa-gold-400 to-teresa-gold-200 shadow-[0_0_18px_rgba(217,175,55,0.7)] transition-[width] duration-300 ease-out"
              style={{ width: `${progress}%` }}
            >
              <span className="absolute inset-y-0 right-0 w-10 -translate-x-full animate-loader-sweep bg-white/50 blur-[2px]" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-100/60">
            <span>Loading</span>
            <span className="font-mono tabular-nums text-teresa-gold-300">{progress}%</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            try {
              window.sessionStorage.setItem('teresa-welcome-seen', '1');
            } catch {
              /* ignore */
            }
            setClosing(true);
            window.setTimeout(() => {
              setDone(true);
              document.body.style.overflow = '';
            }, 800);
          }}
          className="mt-9 rounded-full border border-white/25 px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 transition hover:border-teresa-gold-400 hover:text-teresa-gold-300 magnetic-btn"
        >
          Enter the site
        </button>
      </div>

      {/* Three bouncing dots, bottom of the screen */}
      <div className="absolute bottom-10 flex items-center gap-2">
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className="h-2 w-2 rounded-full bg-teresa-gold-300"
            style={{
              animation: 'bounceHint 1.1s ease-in-out infinite',
              animationDelay: `${index * 0.16}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
