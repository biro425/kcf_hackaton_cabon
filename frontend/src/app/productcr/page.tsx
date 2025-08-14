'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './NewProduct.module.css';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000';

export default function NewProductPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [priceStr, setPriceStr] = useState('');
  const [co2Str, setCo2Str] = useState('');
  const [image, setImage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) return null;

  const price = Number(priceStr);
  const co2 = co2Str.trim() === '' ? 0 : Number(co2Str);

  const isValidUrl = (u: string) => {
    try { new URL(u); return true; } catch { return false; }
  };

  const nameValid = name.trim().length >= 2;
  const priceValid = priceStr.trim().length > 0 && Number.isFinite(price) && price > 0;
  const co2Valid = co2Str.trim() === '' || (Number.isFinite(co2) && co2 >= 0);
  const imageValid = image.trim().length > 0 && isValidUrl(image);

  const disabled = submitting || !nameValid || !priceValid || !co2Valid || !imageValid;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (disabled) return;

    try {
      setSubmitting(true);
      setErr(null);

      const token = localStorage.getItem('token');
      if (!token) {
        router.replace('/login?redirect=/market/new');
        return;
      }

      const res = await fetch(`${API_BASE}/productcr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        // ⚠️ 스키마 키에 맞춰 ci2savedkg 로 보냄
        body: JSON.stringify({
          name: name.trim(),
          price,
          ci2savedkg: co2Str.trim() === '' ? 0 : co2,
          image: image.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || data?.error || 'Failed to create product');
      }

      router.replace('/market');
    } catch (e: any) {
      setErr(e?.message ?? 'Unexpected error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className={styles.screen}>
      <header className={styles.topbar}>
        <div className={styles.row}>
          <button className={styles.backBtn} onClick={() => router.back()} aria-label="Back">←</button>
          <h1 className={styles.title}>New Product</h1>
          <span className={styles.spacer} />
        </div>
        <p className={styles.subtitle}>Register an eco-friendly item to the market</p>
      </header>

      <section className={styles.wrap}>
        <form className={styles.card} onSubmit={onSubmit}>
          <h2 className={styles.cardTitle}>Basic Info</h2>

          {err && <div className={styles.error} role="alert">{err}</div>}

          <label className={styles.label}>
            <span className={styles.labelText}>Product name</span>
            <div className={styles.inputRow}>
              <svg viewBox="0 0 24 24" className={styles.icon} aria-hidden="true">
                <path d="M4 7h16l-2 10H6L4 7z" fill="none" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <input
                className={styles.input}
                type="text"
                placeholder="e.g., Vintage Denim Jacket"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
              />
            </div>
            {!nameValid && name.length > 0 && <span className={styles.hint}>Name must be at least 2 characters.</span>}
          </label>

          <label className={styles.label}>
            <span className={styles.labelText}>Price (USD)</span>
            <div className={styles.inputRow}>
              <svg viewBox="0 0 24 24" className={styles.icon} aria-hidden="true">
                <path d="M12 3v18M6 8h7a4 4 0 010 8H6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <input
                className={styles.input}
                inputMode="decimal"
                pattern="^[0-9]*[.]?[0-9]*$"
                placeholder="e.g., 29.99"
                value={priceStr}
                onChange={(e) => setPriceStr(e.target.value)}
                required
              />
            </div>
            {!priceValid && priceStr.length > 0 && <span className={styles.hint}>Enter a number greater than 0.</span>}
          </label>

          <label className={styles.label}>
            <span className={styles.labelText}>CO₂ saved (kg)</span>
            <div className={styles.inputRow}>
              <svg viewBox="0 0 24 24" className={styles.icon} aria-hidden="true">
                <path d="M8 13a4 4 0 118 0v4H8z" fill="none" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <input
                className={styles.input}
                inputMode="decimal"
                pattern="^[0-9]*[.]?[0-9]*$"
                placeholder="e.g., 5"
                value={co2Str}
                onChange={(e) => setCo2Str(e.target.value)}
              />
            </div>
            {!co2Valid && co2Str.length > 0 && <span className={styles.hint}>Must be 0 or a positive number.</span>}
          </label>

          <label className={styles.label}>
            <span className={styles.labelText}>Image URL</span>
            <div className={styles.inputRow}>
              <svg viewBox="0 0 24 24" className={styles.icon} aria-hidden="true">
                <rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/>
                <path d="M7 13l3-3 3 3 3-4 3 4" fill="none" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <input
                className={styles.input}
                type="url"
                placeholder="https://images.example.com/your-image.jpg"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                required
              />
            </div>
            {!imageValid && image.length > 0 && <span className={styles.hint}>Enter a valid URL.</span>}
          </label>

          <div className={styles.actions}>
            <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={() => router.push('/market')}>
              Cancel
            </button>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={disabled}>
              {submitting ? <span className={styles.spinner} aria-hidden /> : 'Create'}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}