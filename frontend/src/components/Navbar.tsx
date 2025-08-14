'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';

export default function Navbar() {
  const path = usePathname();

  return (
    <nav className={styles.tabbar} aria-label="Bottom Navigation">
      <Link href="/" className={`${styles.tab} ${path === '/' ? styles.active : ''}`}>
        <svg viewBox="0 0 24 24" className={styles.navIcon} aria-hidden="true">
          <path d="M3 10l9-7 9 7v9a2 2 0 0 1-2 2h-4v-6H9v6H5a2 2 0 0 1-2-2z" fill="currentColor"/>
        </svg>
        <span>Home</span>
      </Link>

      <Link href="/market" className={`${styles.tab} ${path === '/market' ? styles.active : ''}`}>
        <svg viewBox="0 0 24 24" className={styles.navIcon} aria-hidden="true">
          <path d="M3 6h18v12H3zM7 6v12M17 6v12" fill="none" stroke="currentColor" strokeWidth="2"/>
        </svg>
        <span>Market</span>
      </Link>

      <Link href="/carbon" className={`${styles.tab} ${path === '/carbon' ? styles.active : ''}`}>
        <svg viewBox="0 0 24 24" className={styles.navIcon} aria-hidden="true">
          <path d="M12 3v18M3 12h18" stroke="currentColor" strokeWidth="2"/>
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2"/>
        </svg>
        <span>Carbon</span>
      </Link>

      <Link href="/challenges" className={`${styles.tab} ${path === '/challenges' ? styles.active : ''}`}>
        <svg viewBox="0 0 24 24" className={styles.navIcon} aria-hidden="true">
          <path d="M8 21l4-3 4 3V5a4 4 0 10-8 0v16z" fill="none" stroke="currentColor" strokeWidth="2"/>
        </svg>
        <span>Challenges</span>
      </Link>

      <Link href="/more" className={`${styles.tab} ${path === '/more' ? styles.active : ''}`}>
        <svg viewBox="0 0 24 24" className={styles.navIcon} aria-hidden="true">
          <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
        </svg>
        <span>More</span>
      </Link>
    </nav>
  );
}