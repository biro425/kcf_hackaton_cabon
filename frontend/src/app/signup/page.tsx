'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './page.module.css';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000';

export default function SignupPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    if (!name.trim()) return setErr('Please enter your name.');
    if (!email.includes('@')) return setErr('Please enter a valid email.');
    if (password.length < 8) return setErr('Password must be at least 8 characters.');
    if (password !== confirm) return setErr('Passwords do not match.');
    if (!agree) return setErr('Please agree to the Terms and Privacy Policy.');

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Sign up failed');

      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      localStorage.setItem(
        'user',
        JSON.stringify({ id: data.id, name: data.name ?? name, email: data.email ?? email, role: data.role ?? 'user' })
      );

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
          <span className={styles.badge}>Eco · Sign up</span>
        </div>
        <p className={styles.subtitle}>Join us and start reducing CO₂.</p>
      </header>

      <section className={styles.cardWrap}>
        <div className={styles.card}>
          <h2 className={styles.title}>Create account</h2>
          <p className={styles.sub}>It takes less than a minute.</p>

          {err && <div className={styles.error} role="alert">{err}</div>}

          <form className={styles.form} onSubmit={onSubmit}>
            <label className={styles.label}>
              <span className={styles.labelText}>Name</span>
              <div className={styles.inputRow}>
                <svg viewBox="0 0 24 24" className={styles.inputIcon} aria-hidden="true">
                  <circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" strokeWidth="2"/>
                  <path d="M4 20c2.5-3 5.5-4.5 8-4.5S17.5 17 20 20" fill="none" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <input
                  className={styles.input}
                  type="text"
                  autoComplete="name"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </label>

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
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
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

            <label className={styles.label}>
              <span className={styles.labelText}>Confirm password</span>
              <div className={styles.inputRow}>
                <svg viewBox="0 0 24 24" className={styles.inputIcon} aria-hidden="true">
                  <rect x="4" y="10" width="16" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/>
                  <path d="M8 10V7a4 4 0 018 0v3" fill="none" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <input
                  className={styles.input}
                  type={showPw2 ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Re-enter password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPw2((s) => !s)}
                  aria-label={showPw2 ? 'Hide password' : 'Show password'}
                  title={showPw2 ? 'Hide password' : 'Show password'}
                >
                  {showPw2 ? '🙈' : '👁️'}
                </button>
              </div>
            </label>

            <div className={styles.actionRow}>
              <label className={styles.remember}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                />
                <span>I agree to the <a className={styles.link} href="#">Terms</a> and <a className={styles.link} href="#">Privacy</a></span>
              </label>
              <span />
            </div>

            <button className={`${styles.btn} ${styles.btnPrimary}`} type="submit" disabled={loading}>
              {loading ? <span className={styles.spinner} aria-hidden="true" /> : 'Create account'}
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
            Already have an account? <a className={styles.linkStrong} href="/login">Sign in</a>
          </p>
        </div>
      </section>
    </main>
  );
}