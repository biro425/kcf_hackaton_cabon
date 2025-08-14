'use client';

import React from 'react';
import styles from './CarbonPage.module.css';
import Navbar from '../../components/Navbar';

const actions = [
  { key: 'cycling', label: 'Cycling', icon: '🚴‍♂️' },
  { key: 'public-transport', label: 'Public Transport', icon: '🚌' },
  { key: 'recycling', label: 'Recycling', icon: '♻️' },
  { key: 'energy-saving', label: 'Energy Saving', icon: '💡' },
  { key: 'plant-meal', label: 'Plant Based Meal', icon: '🥗' },
  { key: 'second-hand', label: 'Second-hand Purchase', icon: '🛒' },
];

const activities = [
  { action: 'Cycled to work', co2: '2.5kg', date: 'Today', points: 25 },
  { action: 'Recycled paper and plastic', co2: '2.5kg', date: 'Yesterday', points: 35 },
  { action: 'Used energy-efficient appliances', co2: '2.5kg', date: '2 days ago', points: 35 },
];

export default function CarbonPage() {
    const user = localStorage.getItem('user');
    const userData = user ? JSON.parse(user) : { name: '홍길동', email: '' };
    const ecoPoints = userData.ecoPoints || 1250;
    const name = userData.name || '홍길동';
    const email = userData.email || '';
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <span className={styles.logo}>Green Mint</span>
        <span className={styles.ecoPoints}>{ecoPoints} EcoPoints</span>
      </header>
      <section className={styles.impactSection}>
        <h2>Carbon Impact</h2>
        <div className={styles.impactCard}>
          <div className={styles.impactRow}>
            <span className={styles.impactValue}>125kg</span>
            <select className={styles.periodSelect}>
              <option>This Week</option>
              <option>Today</option>
              <option>This Month</option>
            </select>
          </div>
          <div className={styles.progressBarWrap}>
            <div className={styles.progressBar}>
              <div className={styles.progress} style={{ width: '65%' }} />
            </div>
            <span className={styles.progressText}>65% complete</span>
          </div>
          <div className={styles.goalRow}>
            <span>Goal 200kg CO₂</span>
          </div>
          <div className={styles.statsRow}>
            <div>
              <div className={styles.statsValue}>4.2kg</div>
              <div className={styles.statsLabel}>Daily</div>
            </div>
            <div>
              <div className={styles.statsValue}>28.5kg</div>
              <div className={styles.statsLabel}>Weekly</div>
            </div>
            <div>
              <div className={styles.statsValue}>125kg</div>
              <div className={styles.statsLabel}>Monthly</div>
            </div>
          </div>
        </div>
      </section>
      <section className={styles.actionSection}>
        <h3>Log Eco Action</h3>
        <div className={styles.actionGrid}>
          {actions.map((a) => (
            <button key={a.key} className={styles.actionBtn}>
              <span className={styles.actionIcon}>{a.icon}</span>
              <span className={styles.actionLabel}>{a.label}</span>
            </button>
          ))}
        </div>
      </section>
      <section className={styles.historySection}>
        <div className={styles.historyTabs}>
          <button className={styles.tabActive}>Activities</button>
          <button className={styles.tabInactive}>Statistics</button>
        </div>
        <ul className={styles.activityList}>
          {activities.map((act, i) => (
            <li key={i} className={styles.activityItem}>
              <div className={styles.activityMain}>
                <span className={styles.activityTitle}>{act.action}</span>
                <span className={styles.activityDate}>{act.date}</span>
              </div>
              <div className={styles.activitySub}>
                <span className={styles.activityCo2}>CO₂ saved: <b>{act.co2}</b></span>
                <span className={styles.activityPoints}>+{act.points} points</span>
              </div>
            </li>
          ))}
        </ul>
        <button className={styles.viewAllBtn}>View All Activities</button>
      </section>
      <Navbar />
    </div>
  );
}