'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './page.module.css';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000';

export default function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Login failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({ id: data.id, name: data.name, email: data.email, role: data.role, carbon: data.carbon }));

      router.replace(sp.get('redirect') || '/');
    } catch (e: any) {
      setErr(e?.message ?? 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.screen}>
      <header className={styles.topbar}>
        <div className={styles.brandRow}>
          <h1 className={styles.brand}>GreenMint</h1>
          <span className={styles.badge}>Eco · Login</span>
        </div>
        <p className={styles.subtitle}>Welcome back! Save more CO₂ today.</p>
      </header>

      <section className={styles.cardWrap}>
        <div className={styles.card}>
          <h2 className={styles.title}>Sign in</h2>
          <p className={styles.sub}>Continue to your dashboard</p>

          {err && <div className={styles.error} role="alert">{err}</div>}

          <form className={styles.form} onSubmit={onSubmit}>
            <label className={styles.label}>
              <span className={styles.labelText}>Email</span>
              <div className={styles.inputRow}>
                <svg viewBox="0 0 24 24" className={styles.inputIcon} aria-hidden="true">
                  <path d="M3 6h18v12H3z" fill="none" stroke="currentColor" strokeWidth="2"/>
                  <path d="M3 7l9 6 9-6" fill="none" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <input
                  className={styles.input}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </label>

            <label className={styles.label}>
              <span className={styles.labelText}>Password</span>
              <div className={styles.inputRow}>
                <svg viewBox="0 0 24 24" className={styles.inputIcon} aria-hidden="true">
                  <rect x="4" y="10" width="16" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/>
                  <path d="M8 10V7a4 4 0 018 0v3" fill="none" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <input
                  className={styles.input}
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPw((s) => !s)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  title={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </label>

            <div className={styles.actionRow}>
              <label className={styles.remember}>
                <input type="checkbox" className={styles.checkbox}/>
                <span>Remember me</span>
              </label>
              <a className={styles.link} href="#">Forgot password?</a>
            </div>

            <button className={`${styles.btn} ${styles.btnPrimary}`} type="submit" disabled={loading}>
              {loading ? <span className={styles.spinner} aria-hidden="true" /> : 'Sign in'}
            </button>
          </form>

          <div className={styles.divider}><span>or</span></div>

          <div className={styles.socialRow}>
            <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => alert('Google OAuth')}>
              <span className={styles.btnIcon}>🟢</span> Continue with Google
            </button>
            <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => alert('Apple OAuth')}>
              <span className={styles.btnIcon}></span> Continue with Apple
            </button>
          </div>

          <p className={styles.switchLine}>
            New here? <a className={styles.linkStrong} href="/signup">Create an account</a>
          </p>
        </div>
      </section>
    </main>
  );
}