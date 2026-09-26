'use client';

import { useApp } from '@/lib/AppProvider';

export default function OwnerStoresPage() {
  const { stores, users, orders, today } = useApp();

  return (
    <>
      <div className="app-page-head">
        <h1>Stores</h1>
        <p>{stores.length} store(s)</p>
      </div>

      <div className="order-list">
        {stores.map((store) => {
          const workerCount = users.filter((u) => u.role === 'worker' && u.storeId === store.id).length;
          const todayCount = orders.filter((o) => o.storeId === store.id && o.pickupDate === today).length;
          return (
            <div key={store.id} className="card-section">
              <h3>{store.name}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>📍 {store.address}</p>
              <div className="order-card-tags">
                <span className="order-card-tag">🚚 {workerCount} worker(s)</span>
                <span className="order-card-tag">📋 {todayCount} pickup(s) today</span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
