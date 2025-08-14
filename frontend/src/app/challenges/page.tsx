/*
  Challenge Page UI (사진 참고)
  - 상단 헤더, 검색/필터, 내 챌린지, 진행률, 완료/진행 탭, 챌린지 리스트, 예정 챌린지, 내비게이션바
*/

'use client';

import React from 'react';
import styles from './Challenge.module.css';
import Navbar from '../../components/Navbar';

export default function ChallengePage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <span className={styles.logo}>Green Mint</span>
        <span className={styles.ecoPoints}>1,250 EcoPoints</span>
      </header>
      <section className={styles.titleRow}>
        <h2>Challenges</h2>
        <div className={styles.searchRow}>
          <button className={styles.filterBtn}>
            <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M3 5h14M6 10h8M9 15h2" stroke="#2e974c" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
          <input className={styles.searchInput} placeholder="Search" />
        </div>
      </section>
      <section className={styles.activeChallengeSection}>
        <div className={styles.activeCard}>
          <div className={styles.activeTitle}>Zero Waste Week</div>
          <div className={styles.activeDesc}>Reduce your waste by 50% this week</div>
          <div className={styles.progressBarWrap}>
            <div className={styles.progressBar}>
              <div className={styles.progress} style={{ width: '30%' }} />
            </div>
            <span className={styles.progressText}>30% complete</span>
            <span className={styles.daysLeft}>7 days left</span>
          </div>
          <div className={styles.activeStats}>
            <span>245 participants</span>
            <span>-25kg CO₂ potential</span>
          </div>
          <div className={styles.activeReward}>
            <span>🏅 Earn Green Guardian NFT</span>
          </div>
          <button className={styles.logBtn}>Log Progress</button>
        </div>
      </section>
      <section className={styles.tabSection}>
        <button className={styles.tabAvailable}>Available</button>
        <button className={styles.tabComplete}>Complete</button>
      </section>
      <section className={styles.challengeListSection}>
        <div className={styles.challengeCard}>
          <div className={styles.challengeTitleRow}>
            <span className={styles.challengeTitle}>Plastic Free Day</span>
            <span className={styles.completedBadge}>Completed</span>
          </div>
          <div className={styles.challengeDesc}>Avoid single-use plastics for a day</div>
          <div className={styles.challengeInfoRow}>
            <span>🗓️ May 10, 2025</span>
            <span>5kg CO₂ saved</span>
            <span>200 points earned</span>
          </div>
        </div>
        <div className={styles.challengeCard}>
          <div className={styles.challengeTitleRow}>
            <span className={styles.challengeTitle}>Meatless Monday</span>
            <span className={styles.completedBadge}>Completed</span>
          </div>
          <div className={styles.challengeDesc}>Eat plant-based meals for a day</div>
          <div className={styles.challengeInfoRow}>
            <span>🗓️ May 24, 2025</span>
            <span>5kg CO₂ saved</span>
            <span>150 points earned</span>
          </div>
        </div>
      </section>
      <section className={styles.upcomingSection}>
        <div className={styles.upcomingHeader}>
          <span>Upcoming Challenges</span>
          <button className={styles.calendarBtn}>View calendar</button>
        </div>
        <div className={styles.upcomingCard}>
          <div className={styles.upcomingDateBox}>
            <div className={styles.upcomingMonth}>Jun</div>
            <div className={styles.upcomingDay}>15</div>
          </div>
          <div className={styles.upcomingInfo}>
            <div className={styles.upcomingTitle}>Plastic Free Challenge</div>
            <div className={styles.upcomingDesc}>Avoid all single-use plastics for 21 days</div>
            <div className={styles.upcomingMeta}>21 days · <span className={styles.upcomingPeople}>45 signed up</span></div>
            <button className={styles.notifyBtn}>Get Notified</button>
          </div>
        </div>
      </section>
      <Navbar />
    </div>
  );
}
