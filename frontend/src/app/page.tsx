'use client';

import { JSX, useState } from "react";
import styles from "./page.module.css";

type Totals = {
  total: number;
  goal: number;
  daily: number;
  weekly: number;
  monthly: number;
};

const totals: Totals = {
  total: 74.5,
  goal: 200,
  daily: 74.5,
  weekly: 74.5,
  monthly: 74.5,
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
    label: "Second-hand Purchase",
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
  const { total, goal, daily, weekly, monthly } = totals;
  const pct = Math.round((total / goal) * 100);
  const [walletConnected, setWalletConnected] = useState(false);

  const handleAction = (key: string) => alert(`${key} logged!`);
  const connectWallet = () => {
    // TODO: 실제 지갑 연결 로직
    setWalletConnected(true);
  };
  const mintNFT = () => {
    if (!walletConnected) return;
    alert("Minting NFT…");
  };

  return (
    <main className={styles.wrap}>
      {/* Top App Bar */}
      <header className={styles.topBar}>
        <div className={styles.status}>Home</div>
        <div className={styles.points}>Total Points: 140</div>
      </header>

      {/* Welcome */}
      <section className={styles.welcome}>
        <h1 className={styles.welcomeTitle}>Welcome, Tech!</h1>
      </section>

      {/* Carbon Impact Card */}
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

      {/* Log Eco Action */}
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

      {/* Activity History */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Activity History</h2>
        <button className={`${styles.btn} ${styles.btnOutline} ${styles.fullWidth}`} onClick={() => alert("View All Activities")}>
          View All Activities
        </button>
      </section>

      {/* Upcoming Milestones */}
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

      {/* Blockchain Status */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Blockchain Status</h2>
        <div className={styles.walletCard}>
          <div className={styles.walletTitle}>
            {walletConnected ? "Wallet Connected" : "Wallet Not Connected"}
          </div>
          <div className={styles.walletSub}>
            {walletConnected
              ? "You're ready to claim rewards."
              : "Connect your wallet to claim rewards"}
          </div>
          <div className={styles.walletRow}>
            <button
              className={`${styles.btn} ${styles.btnOutline}`}
              onClick={connectWallet}
            >
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
    </main>
  );
}