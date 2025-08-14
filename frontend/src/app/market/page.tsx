'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './Market.module.css';
import { useRouter } from 'next/navigation';

type Condition = 'New' | 'Like New' | 'Good' | 'Fair';
type Product = {
  id: string | number;
  title: string;
  price: number;
  condition: Condition;
  co2SavedKg: number;
  image?: string;
};
type CartItem = {
  id: string | number;
  title: string;
  price: number;
  image?: string;
  qty: number;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000';

export default function MarketPage() {
  const [segment, setSegment] = useState<'buy' | 'sell'>('buy');
  const [query, setQuery] = useState('');
  const [ecoPoints, setEcoPoints] = useState(0);

  const [products, setProducts] = useState<Product[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  const router = useRouter();

  const itemCount = useMemo(() => cart.reduce((s, it) => s + it.qty, 0), [cart]);
  const cartSubtotal = useMemo(() => cart.reduce((s, it) => s + it.price * it.qty, 0), [cart]);

  // Sync badge count with cart
  useEffect(() => {
    setCartCount(itemCount);
  }, [itemCount]);

  function openCart() {
    setShowCart(true);
  }
  function closeCart() {
    setShowCart(false);
  }
  function incQty(id: string | number) {
    setCart(list => list.map(it => it.id === id ? { ...it, qty: it.qty + 1 } : it));
  }
  function decQty(id: string | number) {
    setCart(list => list.flatMap(it => {
      if (it.id !== id) return [it];
      const next = it.qty - 1;
      return next <= 0 ? [] : [{ ...it, qty: next }];
    }));
  }
  function removeItem(id: string | number) {
    setCart(list => list.filter(it => it.id !== id));
  }

  useEffect(() => {
    if (!showCart) {
      document.body.style.overflow = '';
      return;
    }
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [showCart]);

  // 토큰 가드 + 유저/포인트 초기화 + 제품 목록 가져오기
  useEffect(() => {
    (async () => {
      try {
        if (typeof window === 'undefined') return;

        const token = localStorage.getItem('token');
        if (!token) {
          router.replace('/login');
          return;
        }

        // 사용자 표시 정보(있으면 반영)
        const raw = localStorage.getItem('user');
        if (raw) {
          try {
            const u = JSON.parse(raw);
            if (u?.ecoPoints != null) setEcoPoints(Number(u.ecoPoints));
            else if (u?.carbon != null) setEcoPoints(Number(u.carbon));
          } catch {}
        }

        setReady(true);

        // 상품 불러오기
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE}/products`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (!res.ok) {
          // 401이면 토큰 리셋 후 로그인 이동
          if (res.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            router.replace('/login');
            return;
          }
          throw new Error(data?.error || 'Failed to load products');
        }

        const items: Product[] = Array.isArray(data) ? data : (data.items ?? []);
        setProducts(items);
      } catch (e: any) {
        setError(e?.message ?? 'Network error');
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const [ready, setReady] = useState(false);      // 토큰 확인 완료
  const [loading, setLoading] = useState(true);   // 상품 로딩
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = products.filter(p => p.title.toLowerCase().includes(q));
    return list.sort((a, b) => b.co2SavedKg - a.co2SavedKg);
  }, [products, query]);

  const addToCart = (p: Product) => {
    setCart(list => {
      const found = list.find(it => it.id === p.id);
      if (found) {
        return list.map(it => it.id === p.id ? { ...it, qty: it.qty + 1 } : it);
      }
      return [...list, { id: p.id, title: p.title, price: Number(p.price), image: p.image, qty: 1 }];
    });
    setShowCart(true);
  };

  if (!ready) return null;

  return (
    <main className={styles.market}>
      {/* Top App Bar */}
      <header className={styles.topbar}>
        <div className={styles.topbarRow}>
          <h1 className={styles.title}>Market</h1>
          <div className={styles.rightRow}>
            <span className={styles.points}>{ecoPoints} EcoPoints</span>
            <button className={styles.cartBtn} aria-label="Cart" onClick={openCart}>
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

      {/* 목록 영역 */}
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
      ) : loading ? (
        // 로딩 스켈레톤 (필요하면 더 꾸며도 OK)
        <section className={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <article key={i} className={styles.card} aria-busy="true">
              <div className={styles.thumb} style={{ background: '#f2f4f3', height: 160 }} />
              <div className={styles.body}>
                <div className={styles.cardTitle} style={{ background: '#eef2ef', height: 18, width: '60%', borderRadius: 6 }} />
                <div className={styles.metaRow} style={{ marginTop: 10 }}>
                  <div style={{ background: '#eef2ef', height: 16, width: 80, borderRadius: 6 }} />
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : error ? (
        <section className={styles.sellEmpty}>
          <div className={styles.sellCard}>
            <h2 className={styles.sellTitle}>Failed to load</h2>
            <p className={styles.sellSub}>{error}</p>
            <button
              className={`${styles.btn} ${styles.btnOutline}`}
              onClick={() => {
                // 간단 재시도
                setLoading(true);
                setError(null);
                // 트리거: 의존성 변경 위해 query 토글
                setQuery(q => q + '');
              }}
            >
              Retry
            </button>
          </div>
        </section>
      ) : (
        <section className={styles.grid}>
          {filtered.map((p) => (
            <article key={p.id} className={styles.card}>
              <div className={styles.thumb}>
                <img
                  src={p.image || 'https://via.placeholder.com/800x600?text=No+Image'}
                  alt={p.title}
                  className={styles.img}
                />
                <span className={styles.co2Badge}>-{p.co2SavedKg}kg CO₂</span>
              </div>

              <div className={styles.body}>
                <h3 className={styles.cardTitle}>{p.title}</h3>
                <div className={styles.metaRow}>
                  <div className={styles.price}>${Number(p.price).toFixed(2)}</div>
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

      {showCart && (
        <div className={styles.modalOverlay} onClick={closeCart}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cartTitle"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3 id="cartTitle" className={styles.modalTitle}>My Cart</h3>
              <button className={styles.modalClose} onClick={closeCart} aria-label="Close">×</button>
            </div>

            <ul className={styles.cartList}>
              {cart.length === 0 && (
                <li className={styles.cartEmpty}>Your cart is empty.</li>
              )}
              {cart.map(item => (
                <li key={item.id} className={styles.cartItem}>
                  <div className={styles.cartThumb}>
                    <img
                      src={item.image || 'https://via.placeholder.com/80x80?text=No+Image'}
                      alt=""
                    />
                  </div>
                  <div className={styles.cartBody}>
                    <div className={styles.cartTitle}>{item.title}</div>
                    <div className={styles.cartMeta}>${item.price.toFixed(2)}</div>
                    <div className={styles.qtyCtrl}>
                      <button type="button" className={styles.qtyBtn} onClick={() => decQty(item.id)} aria-label="Decrease">−</button>
                      <span className={styles.qtyNum}>{item.qty}</span>
                      <button type="button" className={styles.qtyBtn} onClick={() => incQty(item.id)} aria-label="Increase">+</button>
                      <button type="button" className={styles.removeBtn} onClick={() => removeItem(item.id)} aria-label="Remove">Remove</button>
                    </div>
                  </div>
                  <div className={styles.lineTotal}>${(item.price * item.qty).toFixed(2)}</div>
                </li>
              ))}
            </ul>

            <div className={styles.cartFooter}>
              <div className={styles.subtotal}>
                <span>Subtotal</span>
                <strong>${cartSubtotal.toFixed(2)}</strong>
              </div>
              <button
                className={`${styles.btn} ${styles.btnPrimary} ${cart.length === 0 ? styles.btnDisabled : ''}`}
                disabled={cart.length === 0}
                onClick={() => alert('Proceed to payment')}
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}