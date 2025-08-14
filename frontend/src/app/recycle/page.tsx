'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Recycle.module.css';

type AnalyzeResult = {
  material: 'plastic' | 'paper' | 'glass' | 'metal' | 'ewaste' | 'unknown';
  recyclable: boolean;
  confidence: number;
  instructions: string[];
  detected?: string[];
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000';

const MATERIAL_POINTS: Record<AnalyzeResult['material'], number> = {
  plastic: 6, paper: 4, glass: 3, metal: 5, ewaste: 8, unknown: 1,
};
function estimatePoints(r: AnalyzeResult): number {
  const base = MATERIAL_POINTS[r.material] ?? 1;
  const cf = Number.isFinite(r.confidence) ? Math.max(0, Math.min(1, r.confidence)) : 0.6;
  const canReward = r.recyclable || r.material === 'ewaste' || r.material === 'unknown';
  return canReward ? Math.max(1, Math.round(base * (0.6 + 0.4 * cf))) : 0;
}

export default function RecyclePage() {
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const [ecoPoints, setEcoPoints] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResult | null>(null);

  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [lastAward, setLastAward] = useState<number | null>(null);

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const token = localStorage.getItem('token');
      if (!token) {
        router.replace('/login?redirect=/recycle');
        return;
      }
      const raw = localStorage.getItem('user');
      if (raw) {
        try {
          const u = JSON.parse(raw);
          if (u?.ecoPoints != null) setEcoPoints(Number(u.ecoPoints));
          else if (u?.carbon != null) setEcoPoints(Number(u.carbon));
        } catch {}
      }
      setReady(true);
    } catch {
      router.replace('/login?redirect=/recycle');
    }
  }, [router]);

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  const confidencePct = useMemo(
    () => (result ? Math.round(Math.max(0, Math.min(1, result.confidence)) * 100) : 0),
    [result]
  );

  function pickFile() { fileInputRef.current?.click(); }
  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (f) acceptFile(f);
  }
  function acceptFile(f: File) {
    setError(null); setResult(null); setClaimed(false); setLastAward(null);
    setFile(f);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(f));
    analyze(f);
  }

  function onDragEnter(e: React.DragEvent) { e.preventDefault(); e.stopPropagation(); setDragActive(true); }
  function onDragOver(e: React.DragEvent) { e.preventDefault(); e.stopPropagation(); }
  function onDragLeave(e: React.DragEvent) { e.preventDefault(); e.stopPropagation(); setDragActive(false); }
  function onDrop(e: React.DragEvent) {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    const f = e.dataTransfer.files?.[0]; if (f) acceptFile(f);
  }

  async function analyze(f: File) {
    setLoading(true); setError(null); setResult(null);
    try {
      const token = localStorage.getItem('token') || '';
      const fd = new FormData(); fd.append('image', f);
      const res = await fetch(`${API_BASE}/recycle/analyze`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (res.ok) {
        const data = (await res.json()) as AnalyzeResult;
        setResult(sanitizeResult(data));
      } else {
        setResult(mockAnalyze());
      }
    } catch {
      setResult(mockAnalyze());
    } finally {
      setLoading(false);
    }
  }

  function sanitizeResult(d: AnalyzeResult): AnalyzeResult {
    const materialList: AnalyzeResult['material'][] = ['plastic', 'paper', 'glass', 'metal', 'ewaste', 'unknown'];
    const m = materialList.includes(d.material) ? d.material : 'unknown';
    const c = Number.isFinite(d.confidence) ? Math.max(0, Math.min(1, d.confidence)) : 0.5;
    const i = Array.isArray(d.instructions) ? d.instructions.slice(0, 6) : [];
    return { material: m, recyclable: !!d.recyclable, confidence: c, instructions: i, detected: d.detected || [] };
  }

  function mockAnalyze(): AnalyzeResult {
    const candidates: AnalyzeResult[] = [
      { material: 'plastic', recyclable: true,  confidence: 0.86, instructions: ['비우고 헹군 뒤 배출','라벨 제거','뚜껑은 분리'], detected: ['PET','Bottle'] },
      { material: 'paper',   recyclable: true,  confidence: 0.78, instructions: ['테이프/철핀 제거','깨끗이 말린 뒤 배출'], detected: ['Corrugated','Box'] },
      { material: 'glass',   recyclable: true,  confidence: 0.69, instructions: ['세척 후 배출','금속 뚜껑 분리'], detected: ['Jar'] },
      { material: 'metal',   recyclable: true,  confidence: 0.74, instructions: ['내용물 비우고 헹군 뒤 배출','라벨 제거 가능 시 제거'], detected: ['Aluminum Can'] },
      { material: 'ewaste',  recyclable: false, confidence: 0.82, instructions: ['지자체 전자폐기물 수거함 사용','배터리 분리 후 배출'], detected: ['Power Adapter'] },
      { material: 'unknown', recyclable: false, confidence: 0.4,  instructions: ['일반쓰레기로 배출','오염 심한 경우 세척 불가 시 일반배출'], detected: [] },
    ];
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  function reset() {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    setClaimed(false);
    setLastAward(null);
  }

  async function claimReward() {
    if (!result || claiming || claimed) return;
    setClaiming(true); setError(null);
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`${API_BASE}/recycle/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          material: result.material,
          recyclable: result.recyclable,
          confidence: result.confidence,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || data?.error || 'Failed to claim');

      const awarded = Number(data.pointsAwarded ?? 0);
      const total = Number(data.totalPoints ?? data.carbon ?? 0);
      setLastAward(awarded);
      setEcoPoints(total);
      setClaimed(true);

      // localStorage의 user 포인트 갱신
      const raw = localStorage.getItem('user');
      let u: any = {};
      try { u = raw ? JSON.parse(raw) : {}; } catch {}
      u.ecoPoints = total;
      u.carbon = total;
      localStorage.setItem('user', JSON.stringify(u));
    } catch (e: any) {
      setError(e?.message ?? 'Failed to claim');
    } finally {
      setClaiming(false);
    }
  }

  if (!ready) return null;

  const estimated = result ? estimatePoints(result) : 0;

  return (
    <main className={styles.screen}>
      {/* Top App Bar */}
      <header className={styles.topbar}>
        <div className={styles.topbarRow}>
          <h1 className={styles.title}>Recycle</h1>
          <div className={styles.rightRow}>
            <span className={styles.points}>{ecoPoints} EcoPoints</span>
          </div>
        </div>
        <div className={styles.brandRow}>
          <div className={styles.brand}>GreenMint</div>
          <button className={styles.linkBack} onClick={() => router.push('/')}>← Home</button>
        </div>
      </header>

      {/* Capture / Drop Zone */}
      {!file && (
        <section
          className={`${styles.drop} ${dragActive ? styles.dropActive : ''}`}
          onDragEnter={onDragEnter} onDragOver={onDragOver}
          onDragLeave={onDragLeave} onDrop={onDrop}
        >
          <div className={styles.dropInner}>
            <div className={styles.camCircle} aria-hidden>
              <svg className={styles.camIcon} viewBox="0 0 24 24">
                <path d="M4 7h3l1.5-2h7L17 7h3a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V9a2 2 0 012-2z" fill="none" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="13" r="4" fill="none" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h2 className={styles.dropTitle}>Take a photo or drop an image</h2>
            <p className={styles.dropSub}>깨끗이 비우고, 다른 재질은 분리해서 촬영하면 더 정확해요.</p>

            <div className={styles.btnRow}>
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={pickFile}>Take Photo</button>
              <label className={`${styles.btn} ${styles.btnOutline}`} htmlFor="file">Upload</label>
            </div>

            <input
              id="file" ref={fileInputRef} type="file" accept="image/*" capture="environment"
              className={styles.hidden} onChange={onFileChange}
            />
          </div>
        </section>
      )}

      {/* Preview */}
      {file && (
        <section className={styles.previewWrap} aria-live="polite">
          <div className={styles.previewCard}>
            {previewUrl && <img src={previewUrl} alt="Preview" className={styles.previewImg} />}
            <div className={styles.previewMeta}>
              <div className={styles.fileName} title={file.name}>{file.name}</div>
              <div className={styles.fileSize}>{(file.size / 1024).toFixed(1)} KB</div>
            </div>
            <div className={styles.previewActions}>
              <button className={`${styles.btn} ${styles.btnGhost}`} onClick={reset}>Retake</button>
              {!loading && (
                <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => analyze(file!)}>Re-analyze</button>
              )}
              {loading && (
                <div className={styles.loading}><span className={styles.spinner} /> Analyzing…</div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Result + Reward */}
      {result && !loading && (
        <section className={styles.result}>
          <div className={styles.resultHeader}>
            <span className={`${styles.badge} ${result.recyclable ? styles.badgeYes : styles.badgeNo}`}>
              {result.recyclable ? 'Recyclable' : 'Not Recyclable'}
            </span>
            <div className={styles.material}>
              {materialIcon(result.material)}
              <span className={styles.materialText}>{labelOf(result.material)}</span>
            </div>
            <div className={styles.confBox} title={`Confidence: ${confidencePct}%`}>
              <div className={styles.confBar}><span style={{ width: `${confidencePct}%` }} /></div>
              <div className={styles.confText}>Confidence {confidencePct}%</div>
            </div>
          </div>

          {result.detected && result.detected.length > 0 && (
            <div className={styles.detectedRow}>
              {result.detected.map((t, i) => <span key={i} className={styles.detectedChip}>{t}</span>)}
            </div>
          )}

          <div className={styles.instructions}>
            <h3 className={styles.secTitle}>How to dispose</h3>
            <ol className={styles.steps}>
              {result.instructions.map((s, i) => (
                <li key={i} className={styles.stepItem}>
                  <span className={styles.stepNum}>{i + 1}</span>
                  <span className={styles.stepText}>{s}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className={styles.rewardCard}>
            {!claimed ? (
              <>
                <div className={styles.rewardText}>
                  Complete pickup to earn about <strong>+{estimated}</strong> EcoPoints
                </div>
                <button
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  onClick={claimReward}
                  disabled={claiming}
                >
                  {claiming ? 'Claiming…' : 'Complete & Claim'}
                </button>
              </>
            ) : (
              <div className={styles.rewardDone}>
                🎉 Earned <strong>+{lastAward ?? 0}</strong> EcoPoints! Total: <b>{ecoPoints}</b>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Error */}
      {error && (
        <section className={styles.errWrap} role="alert">
          <div className={styles.errorCard}>
            <div className={styles.errTitle}>Failed</div>
            <p className={styles.errMsg}>{error}</p>
            <button className={`${styles.btn} ${styles.btnOutline}`} onClick={() => file && analyze(file)}>
              Retry
            </button>
          </div>
        </section>
      )}
    </main>
  );
}

function labelOf(m: AnalyzeResult['material']) {
  switch (m) {
    case 'plastic': return 'Plastic (플라스틱)';
    case 'paper':   return 'Paper (종이)';
    case 'glass':   return 'Glass (유리)';
    case 'metal':   return 'Metal (금속)';
    case 'ewaste':  return 'E-waste (전기전자)';
    default:        return 'Unknown (불명확)';
  }
}

function materialIcon(m: AnalyzeResult['material']) {
  const commonProps = { className: styles.materialIcon, viewBox: '0 0 24 24' } as any;
  switch (m) {
    case 'plastic':
      return (
        <svg {...commonProps} aria-hidden>
          <path d="M7 7h10l1 10a3 3 0 01-3 3H9a3 3 0 01-3-3l1-10z" fill="none" stroke="currentColor" strokeWidth="2"/>
          <path d="M10 7V5a2 2 0 012-2h0a2 2 0 012 2v2" fill="none" stroke="currentColor" strokeWidth="2"/>
        </svg>
      );
    case 'paper':
      return (
        <svg {...commonProps} aria-hidden>
          <path d="M6 3h9l5 5v13H6z" fill="none" stroke="currentColor" strokeWidth="2"/>
          <path d="M15 3v6h6" fill="none" stroke="currentColor" strokeWidth="2"/>
        </svg>
      );
    case 'glass':
      return (
        <svg {...commonProps} aria-hidden>
          <path d="M8 3h8l-2 10v6h-4v-6L8 3z" fill="none" stroke="currentColor" strokeWidth="2"/>
        </svg>
      );
    case 'metal':
      return (
        <svg {...commonProps} aria-hidden>
          <circle cx="8" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="2"/>
          <circle cx="16" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="2"/>
          <path d="M5 12h14" stroke="currentColor" strokeWidth="2"/>
        </svg>
      );
    case 'ewaste':
      return (
        <svg {...commonProps} aria-hidden>
          <rect x="4" y="7" width="16" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 3v4M9 3h6" stroke="currentColor" strokeWidth="2"/>
        </svg>
      );
    default:
      return (
        <svg {...commonProps} aria-hidden>
          <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2"/>
          <path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" strokeWidth="2"/>
        </svg>
      );
  }
}