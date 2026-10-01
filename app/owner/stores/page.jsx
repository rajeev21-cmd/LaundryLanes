'use client';

import Link from 'next/link';
import { useApp } from '@/lib/AppProvider';

export default function OwnerStoresPage() {
  const { stores, users, tickets, today } = useApp();

  return (
    <>
      <div className="app-page-head">
        <h1>Stores</h1>
        <p>{stores.length} store(s) — tap a store to see all of its tickets</p>
      </div>

      <div className="order-list">
        {stores.map((store) => {
          const riderCount = users.filter((u) => u.role === 'rider' && u.storeId === store.id).length;
          const todayCount = tickets.filter((t) => t.storeId === store.id && t.pickupDate === today).length;
          return (
            <Link key={store.id} href={`/owner/stores/${store.id}`} className="card-section clickable">
              <h3>{store.name}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>📍 {store.address}</p>
              <div className="ticket-card-tags">
                <span className="ticket-card-tag">🚚 {riderCount} rider(s)</span>
                <span className="ticket-card-tag">🎫 {todayCount} ticket(s) today</span>
              </div>
              <p className="card-link-hint">View all tickets →</p>
            </Link>
          );
        })}
      </div>
    </>
  );
}
