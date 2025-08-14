'use client';

import { JSX, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

type Activity = {
  id: string;
  title: string;
  type: 'recycle' | 'market' | 'challenge' | 'carbon' | 'other';
  points: number;
  at: number;
  icon?: JSX.Element;
  note?: string;
};

type Totals = {
  total: number;
  goal: number;
  daily: number;
  weekly: number;
  monthly: number;
};


const actions: Array<{ key: string; label: string; icon: JSX.Element }> = [
  {
    key: "cycling",
    label: "Cycling",
    icon: (
      <svg viewBox="0 0 24 24" className={styles.icon} aria-hidden="true">
        <path d="M5 17a4 4 0 1 0 0 .1M19 17a4 4 0 1 0 0 .1" fill="none" stroke="currentColor" strokeWidth="2"/>
        <path d="M6 17l5-9h3l-3 5h4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="12" cy="6" r="1.5" fill="currentColor"/>
      </svg>
    ),
  },
  {
    key: "public-transport",
    label: "Public Transport",
    icon: (
      <svg viewBox="0 0 24 24" className={styles.icon} aria-hidden="true">
        <rect x="5" y="3" width="14" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/>
        <path d="M7 17l-1.5 2M17 17l1.5 2M7 8h10M7 12h10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    key: "walking",
    label: "Walking",
    icon: (
      <svg viewBox="0 0 24 24" className={styles.icon} aria-hidden="true">
        <circle cx="12" cy="5" r="2" fill="currentColor"/>
        <path d="M12 7l-2 4-3 2M10 11l3 2 1 5M7 21l2-5M16 21l-2-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    key: "plant-meal",
    label: "Plant Based Meal",
    icon: (
      <svg viewBox="0 0 24 24" className={styles.icon} aria-hidden="true">
        <path d="M12 4c-2 3-2 6 0 8 2-2 2-5 0-8z" fill="currentColor"/>
        <path d="M12 12c-4 0-7 3-7 7h14c0-4-3-7-7-7z" fill="none" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 4v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    key: "second-hand",
    label: "Recycle",
    icon: (
      <svg viewBox="0 0 24 24" className={styles.icon} aria-hidden="true">
        <path d="M4 7h16l-2 10H6L4 7z" fill="none" stroke="currentColor" strokeWidth="2"/>
        <path d="M9 11l2 2 4-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
];

const milestones = [
  {
    key: "green-guardian",
    title: "Green Guardian NFT",
    subtitle: "Save 50kg more CO₂ to earn",
    progress: 0.05,
    icon: (
      <svg viewBox="0 0 24 24" className={styles.milestoneIconSvg} aria-hidden="true">
        <circle cx="12" cy="12" r="9" fill="currentColor" />
        <path d="M9 12l2 2 4-5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    key: "energy-master",
    title: "Energy Master NFT",
    subtitle: "Log 10 more energy-saving actions",
    progress: 0.25,
    icon: (
      <svg viewBox="0 0 24 24" className={styles.milestoneIconSvg} aria-hidden="true">
        <path d="M13 2l-9 12h7l-2 8 9-12h-7l2-8z" fill="currentColor" />
      </svg>
    ),
  },
];

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={styles.progress} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)}>
      <span className={styles.progressFill} style={{ width: `${pct}%` }} />
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statTitle}>{title}</div>
      <div className={styles.statValue}>{value.toFixed(2)}kg</div>
    </div>
  );
}

export default function HomePage() {
  const totals: Totals = {
  total: 74.5,
  goal: 200,
  daily: 1.5,
  weekly: 10.5,
  monthly: 74.5,
};
  const { total, goal, daily, weekly, monthly } = totals;
  const pct = Math.round((total / goal) * 100);
  const [walletConnected, setWalletConnected] = useState(false);

  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);

  const [name, setName] = useState<string>("User");
  const [ecoPoints, setEcoPoints] = useState<number>(0);

  const handleAction = (key: string) => {
    router.push(`/recycle`);
  }
  const connectWallet = () => setWalletConnected(true);
  const mintNFT = () => {
    if (!walletConnected) return;
    alert("Minting NFT…");
  };

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  function fmtDate(ts: number) {
    try {
      return new Date(ts).toLocaleString();
    } catch {
      return '';
    }
  }

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;

      const token = localStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        return;
      }

      const raw = localStorage.getItem("user");
      if (raw) {
        try {
          const u = JSON.parse(raw);
          if (u?.name) setName(String(u.name));
          if (u?.ecoPoints != null) setEcoPoints(Number(u.ecoPoints));
        } catch {
          console.error("Failed to parse user data from localStorage");
        }
      }

      // Load activity history from localStorage (fallback demo data)
      const rawActs = localStorage.getItem('activities');
      if (rawActs) {
        try {
          const arr = JSON.parse(rawActs) as Activity[];
          if (Array.isArray(arr)) {
            setActivities(arr.sort((a,b) => b.at - a.at));
          }
        } catch {}
      } else {
        // demo list (will be shown until real data is saved)
        const demo: Activity[] = [
          { id: 'a3', title: 'Recycled PET bottle', type: 'recycle', points: 6, at: Date.now() - 1000 * 60 * 15 },
          { id: 'a2', title: 'Logged walking (2km)', type: 'carbon', points: 3, at: Date.now() - 1000 * 60 * 60 * 5 },
          { id: 'a1', title: 'Bought second‑hand jacket', type: 'market', points: 12, at: Date.now() - 1000 * 60 * 60 * 24 },
        ];
        setActivities(demo);
      }

      setReady(true);
    } catch {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    if (!showModal) {
      document.body.style.overflow = '';
      return;
    }
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [showModal]);

  if (!ready) return null;

  return (
    <main className={styles.wrap}>
      <header className={styles.topBar}>
        <div className={styles.status}>Home</div>
        <div className={styles.points}>Total Points: {ecoPoints}</div>
      </header>

      <section className={styles.welcome}>
        <h1 className={styles.welcomeTitle}>환영합니다, {name}님</h1>
      </section>

      <section className={styles.card}>
        <div className={styles.cardHeader}>Carbon Impact</div>
        <div className={styles.subtle}>Total CO₂ Saved</div>
        <div className={styles.bigNumber}>{total.toFixed(1)}kg</div>

        <ProgressBar value={total} max={goal} />
        <div className={styles.progressMeta}>
          <span>{pct}% complete</span>
          <span>Goal {goal}kg CO₂</span>
        </div>

        <div className={styles.statsRow}>
          <StatCard title="Daily" value={daily} />
          <StatCard title="Weekly" value={weekly} />
          <StatCard title="Monthly" value={monthly} />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Log Eco Action</h2>
        <div className={styles.grid}>
          {actions.map((a) => (
            <button key={a.key} className={styles.actionBtn} onClick={() => handleAction(a.key)}>
              <div className={styles.actionIcon}>{a.icon}</div>
              <div className={styles.actionLabel}>{a.label}</div>
            </button>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Activity History</h2>
        <button className={`${styles.btn} ${styles.btnOutline} ${styles.fullWidth}`} onClick={openModal}>
          View All Activities
        </button>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Upcoming Milestones</h2>
        <ul className={styles.milestoneList}>
          {milestones.map((m) => (
            <li key={m.key} className={styles.milestoneItem}>
              <div className={styles.milestoneIcon}>{m.icon}</div>
              <div className={styles.milestoneBody}>
                <div className={styles.milestoneTitle}>{m.title}</div>
                <div className={styles.milestoneSub}>{m.subtitle}</div>
                <div className={styles.milestoneBar}>
                  <span style={{ width: `${Math.round(m.progress * 100)}%` }} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Blockchain Status</h2>
        <div className={styles.walletCard}>
          <div className={styles.walletTitle}>
            {walletConnected ? "Wallet Connected" : "Wallet Not Connected"}
          </div>
          <div className={styles.walletSub}>
            {walletConnected ? "You're ready to claim rewards." : "Connect your wallet to claim rewards"}
          </div>
          <div className={styles.walletRow}>
            <button className={`${styles.btn} ${styles.btnOutline}`} onClick={connectWallet}>
              Connect Wallet
            </button>
            <button
              className={`${styles.btn} ${styles.btnPrimary} ${!walletConnected ? styles.btnDisabled : ""}`}
              onClick={mintNFT}
              disabled={!walletConnected}
            >
              Mint NFT
            </button>
          </div>
        </div>
      </section>

      {showModal && (
        <div className={styles.modalOverlay} onClick={closeModal} aria-hidden={!showModal}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="activityModalTitle"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3 id="activityModalTitle" className={styles.modalTitle}>Activity History</h3>
              <button className={styles.modalClose} onClick={closeModal} aria-label="Close">×</button>
            </div>

            <ul className={styles.activityList}>
              {activities.map(a => (
                <li key={a.id} className={styles.activityItem}>
                  <div className={styles.activityIcon} aria-hidden="true">
                    {/* simple icons by type */}
                    {a.type === 'recycle' ? (
                      <svg viewBox="0 0 24 24"><path d="M4 7h3l1.5-2h7L17 7h3a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V9a2 2 0 012-2z" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="13" r="4" fill="none" stroke="currentColor" strokeWidth="2"/></svg>
                    ) : a.type === 'market' ? (
                      <svg viewBox="0 0 24 24"><path d="M6 6h15l-2 9H8L6 6z" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="9" cy="20" r="1.6"/><circle cx="18" cy="20" r="1.6"/></svg>
                    ) : a.type === 'challenge' ? (
                      <svg viewBox="0 0 24 24"><path d="M8 21l4-3 4 3V5a4 4 0 10-8 0v16z" fill="none" stroke="currentColor" strokeWidth="2"/></svg>
                    ) : a.type === 'carbon' ? (
                      <svg viewBox="0 0 24 24"><path d="M12 3v18M3 12h18" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2"/></svg>
                    ) : (
                      <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2"/></svg>
                    )}
                  </div>
                  <div className={styles.activityBody}>
                    <div className={styles.activityTitle}>{a.title}</div>
                    <div className={styles.activityMeta}>{fmtDate(a.at)}</div>
                  </div>
                  <div className={styles.activityPoints}>+{a.points}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </main>
  );
}