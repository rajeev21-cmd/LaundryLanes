'use client';

import { useApp } from '@/lib/AppProvider';
import { STATUS_LABELS, STATUS_ORDER } from '@/lib/constants';

export default function OwnerOverviewPage() {
  const { orders, stores, today } = useApp();

  const todayCount = orders.filter((o) => o.pickupDate === today).length;
  const activeCount = orders.filter((o) => !['delivered', 'cancelled'].includes(o.status)).length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;

  const byStatus = STATUS_ORDER.map((s) => ({ status: s, count: orders.filter((o) => o.status === s).length }));
  const byStore = stores.map((s) => ({ store: s, count: orders.filter((o) => o.storeId === s.id).length }));
  const maxStoreCount = Math.max(1, ...byStore.map((s) => s.count));

  return (
    <>
      <div className="app-page-head">
        <h1>Overview</h1>
        <p>Across all {stores.length} stores</p>
      </div>

      <div className="stat-grid">
        <div className="stat-tile">
          <strong>{orders.length}</strong>
          <span>Total orders</span>
        </div>
        <div className="stat-tile">
          <strong>{todayCount}</strong>
          <span>Pickups today</span>
        </div>
        <div className="stat-tile">
          <strong>{activeCount}</strong>
          <span>Active orders</span>
        </div>
        <div className="stat-tile">
          <strong>{deliveredCount}</strong>
          <span>Delivered</span>
        </div>
      </div>

      <div className="card-section">
        <h3>By status</h3>
        {byStatus.map(({ status, count }) => (
          <div key={status} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 14 }}>
            <span>{STATUS_LABELS[status]}</span>
            <strong>{count}</strong>
          </div>
        ))}
      </div>

      <div className="card-section">
        <h3>By store</h3>
        {byStore.map(({ store, count }) => (
          <div key={store.id} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
              <span>{store.name}</span>
              <strong>{count}</strong>
            </div>
            <div style={{ background: 'var(--navy-050)', borderRadius: 999, height: 8 }}>
              <div
                style={{
                  width: `${(count / maxStoreCount) * 100}%`,
                  background: 'var(--orange)',
                  height: 8,
                  borderRadius: 999,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
