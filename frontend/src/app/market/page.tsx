'use client';

import { useMemo, useState } from 'react';
import styles from './Market.module.css';

type Product = {
  id: string;
  title: string;
  price: number;
  condition: 'New' | 'Like New' | 'Good' | 'Fair';
  co2SavedKg: number;
  image: string;
};

const PRODUCTS: Product[] = [
  {
    id: 'p1',
    title: 'Vintage Denim Jacket',
    price: 45,
    condition: 'Good',
    co2SavedKg: 8,
    image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'p2',
    title: 'Yoga Mat',
    price: 18.99,
    condition: 'Like New',
    co2SavedKg: 4,
    image: 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'p3',
    title: 'Reusable Bottle',
    price: 12.5,
    condition: 'New',
    co2SavedKg: 6,
    image: 'https://images.unsplash.com/photo-1526401281623-3593f0cdd26d?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'p4',
    title: 'Wireless Earbuds (Refurb.)',
    price: 29,
    condition: 'Good',
    co2SavedKg: 7,
    image: 'https://images.unsplash.com/photo-1585386959984-a4155223168f?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'p5',
    title: 'Upcycled Tote Bag',
    price: 14.2,
    condition: 'Like New',
    co2SavedKg: 3,
    image: 'https://images.unsplash.com/photo-1593031414759-b06f7c4a7c54?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'p6',
    title: 'Certified Pre-owned Phone',
    price: 199,
    condition: 'Fair',
    co2SavedKg: 22,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop',
  },
];

export default function MarketPage() {
  const [segment, setSegment] = useState<'buy' | 'sell'>('buy');
  const [query, setQuery] = useState('');
  const [ecoPoints] = useState(149);
  const [cartCount, setCartCount] = useState(0);

  const filtered = useMemo(() => {
    const list = PRODUCTS.filter(p =>
      p.title.toLowerCase().includes(query.trim().toLowerCase())
    );
    return list.sort((a, b) => b.co2SavedKg - a.co2SavedKg);
  }, [query]);

  const addToCart = (p: Product) => {
    // TODO: 실제 장바구니 API 연결
    setCartCount(c => c + 1);
    alert(`Added "${p.title}" to cart`);
  };

  return (
    <main className={styles.market}>
      {/* Top App Bar */}
      <header className={styles.topbar}>
        <div className={styles.topbarRow}>
          <h1 className={styles.title}>Market</h1>
          <div className={styles.rightRow}>
            <span className={styles.points}>{ecoPoints} EcoPoints</span>
            <button className={styles.cartBtn} aria-label="Cart">
              <svg viewBox="0 0 24 24" className={styles.cartIcon} aria-hidden="true">
                <path d="M6 6h15l-2 9H8L6 6z" fill="none" stroke="currentColor" strokeWidth="2"/>
                <circle cx="9" cy="20" r="1.6" fill="currentColor"/>
                <circle cx="18" cy="20" r="1.6" fill="currentColor"/>
              </svg>
              {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
            </button>
          </div>
        </div>

        <div className={styles.brandRow}>
          <div className={styles.brand}>GreenMint</div>

          <div className={styles.segmented}>
            <button
              className={`${styles.segmentBtn} ${segment === 'buy' ? styles.segmentActive : ''}`}
              onClick={() => setSegment('buy')}
              aria-pressed={segment === 'buy'}
            >
              Buy
            </button>
            <button
              className={`${styles.segmentBtn} ${segment === 'sell' ? styles.segmentActive : ''}`}
              onClick={() => setSegment('sell')}
              aria-pressed={segment === 'sell'}
            >
              Sell
            </button>
          </div>
        </div>

        <div className={styles.searchWrap}>
          <svg viewBox="0 0 24 24" className={styles.searchIcon} aria-hidden="true">
            <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2"/>
            <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input
            className={styles.searchInput}
            type="search"
            placeholder="Search marketplace"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </header>

      {segment === 'sell' ? (
        <section className={styles.sellEmpty}>
          <div className={styles.sellCard}>
            <h2 className={styles.sellTitle}>Sell your eco items</h2>
            <p className={styles.sellSub}>Earn EcoPoints by giving products a second life.</p>
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => alert('Create listing')}>
              Create Listing
            </button>
          </div>
        </section>
      ) : (
        <section className={styles.grid}>
          {filtered.map((p) => (
            <article key={p.id} className={styles.card}>
              <div className={styles.thumb}>
                {/* 일반 img (Next/Image 설정 없이 사용) */}
                <img src={p.image} alt={p.title} className={styles.img} />
                <span className={styles.co2Badge}>-{p.co2SavedKg}kg CO₂</span>
              </div>

              <div className={styles.body}>
                <h3 className={styles.cardTitle}>{p.title}</h3>
                <div className={styles.metaRow}>
                  <div className={styles.price}>${p.price.toFixed(2)}</div>
                  <span
                    className={`${styles.chip} ${
                      p.condition === 'New'
                        ? styles.chipNew
                        : p.condition === 'Like New'
                        ? styles.chipLikeNew
                        : p.condition === 'Good'
                        ? styles.chipGood
                        : styles.chipFair
                    }`}
                    aria-label={`Condition: ${p.condition}`}
                  >
                    {p.condition}
                  </span>
                </div>

                <div className={styles.btnRow}>
                  <button
                    className={`${styles.btn} ${styles.btnPrimary}`}
                    onClick={() => alert(`Details of ${p.title}`)}
                  >
                    View Details
                  </button>
                  <button
                    className={`${styles.btn} ${styles.btnOutline}`}
                    onClick={() => addToCart(p)}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}