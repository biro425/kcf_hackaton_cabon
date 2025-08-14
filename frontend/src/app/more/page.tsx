'use client';

import React from 'react';
import styles from './More.module.css';
import Navbar from '../../components/Navbar';

export default function MorePage() {
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
      <section className={styles.profileSection}>
        <div className={styles.profileCard}>
          <div className={styles.avatar}>👤</div>
          <div className={styles.profileInfo}>
            <div className={styles.profileName}>{name}</div>
            <div className={styles.profileEmail}>{email}</div>
          </div>
        </div>
      </section>
      <section className={styles.settingsSection}>
        <h3 className={styles.sectionTitle}>App Settings</h3>
        <ul className={styles.settingsList}>
          <li className={styles.settingsItem}>
            <span>Notifications</span>
            <input type="checkbox" defaultChecked />
          </li>
          <li className={styles.settingsItem}>
            <span>Dark Mode</span>
            <input type="checkbox" />
          </li>
          <li className={styles.settingsItem}>
            <span>Language</span>
            <select>
              <option>한국어</option>
              <option>English</option>
            </select>
          </li>
        </ul>
      </section>
      <section className={styles.etcSection}>
        <h3 className={styles.sectionTitle}>More</h3>
        <ul className={styles.etcList}>
          <li className={styles.etcItem}>My Achievements</li>
          <li className={styles.etcItem}>EcoPoints History</li>
          <li className={styles.etcItem}>Help & Support</li>
          <li className={styles.etcItem}>About</li>
          <li className={styles.etcItem} style={{color:'#e74c3c'}}>Logout</li>
        </ul>
      </section>
      <Navbar />
    </div>
  );
}