'use client';

import { useApp } from '@/lib/AppProvider';
import { STATUS_LABELS, STATUS_ORDER, calcOrderValue } from '@/lib/constants';

const PROCESSING_STATUSES = ['arrived_at_store', 'washing', 'ironing', 'packed'];

export default function OwnerOverviewPage() {
  const { tickets, stores, users, clothes, today } = useApp();

  const todayCount = tickets.filter((t) => t.pickupDate === today).length;
  const activeCount = tickets.filter((t) => !['delivered', 'cancelled'].includes(t.status)).length;
  const deliveredTickets = tickets.filter((t) => t.status === 'delivered');
  const deliveredCount = deliveredTickets.length;
  const cancelledCount = tickets.filter((t) => t.status === 'cancelled').length;
  const unclaimedCount = tickets.filter((t) => !t.storeId && t.status !== 'cancelled').length;
  const awaitingRiderCount = tickets.filter((t) => t.storeId && t.status === 'pickup_scheduled').length;
  const processingCount = tickets.filter((t) => PROCESSING_STATUSES.includes(t.status)).length;
  const riderCount = users.filter((u) => u.role === 'rider').length;
  const revenue = deliveredTickets.reduce((sum, t) => sum + calcOrderValue(clothes.filter((c) => c.ticketId === t.id)), 0);
  const ratedTickets = tickets.filter((t) => t.ratedAt);
  const avgRiderRating = ratedTickets.length ? ratedTickets.reduce((s, t) => s + (t.riderRating || 0), 0) / ratedTickets.length : 0;
  const avgServiceRating = ratedTickets.length ? ratedTickets.reduce((s, t) => s + (t.serviceRating || 0), 0) / ratedTickets.length : 0;

  const byStatus = [...STATUS_ORDER, 'cancelled'].map((s) => ({
    status: s,
    count: tickets.filter((t) => t.status === s).length,
  }));
  const byStore = stores.map((s) => ({ store: s, count: tickets.filter((t) => t.storeId === s.id).length }));
  const maxStoreCount = Math.max(1, unclaimedCount, ...byStore.map((s) => s.count));

  return (
    <>
      <div className="app-page-head">
        <h1>Overview</h1>
        <p>Across all {stores.length} stores</p>
      </div>

      <div className="stat-grid">
        <div className="stat-tile">
          <strong>{tickets.length}</strong>
          <span>Total tickets</span>
        </div>
        <div className="stat-tile">
          <strong>{todayCount}</strong>
          <span>Pickups today</span>
        </div>
        <div className="stat-tile">
          <strong>{activeCount}</strong>
          <span>Active tickets</span>
        </div>
        <div className="stat-tile">
          <strong>{unclaimedCount}</strong>
          <span>Unclaimed</span>
        </div>
        <div className="stat-tile">
          <strong>{awaitingRiderCount}</strong>
          <span>Awaiting rider</span>
        </div>
        <div className="stat-tile">
          <strong>{processingCount}</strong>
          <span>In processing</span>
        </div>
        <div className="stat-tile">
          <strong>{deliveredCount}</strong>
          <span>Delivered</span>
        </div>
        <div className="stat-tile">
          <strong>{cancelledCount}</strong>
          <span>Cancelled</span>
        </div>
        <div className="stat-tile">
          <strong>{riderCount}</strong>
          <span>Riders</span>
        </div>
        <div className="stat-tile">
          <strong>₹{revenue}</strong>
          <span>Revenue</span>
        </div>
        <div className="stat-tile">
          <strong>{ratedTickets.length ? `${avgRiderRating.toFixed(1)} ★` : '—'}</strong>
          <span>Avg rider rating</span>
        </div>
        <div className="stat-tile">
          <strong>{ratedTickets.length ? `${avgServiceRating.toFixed(1)} ★` : '—'}</strong>
          <span>Avg service rating</span>
        </div>
      </div>

      <div className="stats-columns">
        <div className="card-section wide">
          <h3>By status</h3>
          {byStatus.map(({ status, count }) => (
            <div key={status} className="stat-row">
              <span>{STATUS_LABELS[status]}</span>
              <strong>{count}</strong>
            </div>
          ))}
        </div>

        <div className="card-section wide">
          <h3>By store</h3>
          {unclaimedCount > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span>Unclaimed</span>
                <strong>{unclaimedCount}</strong>
              </div>
              <div style={{ background: 'var(--navy-050)', borderRadius: 999, height: 8 }}>
                <div
                  style={{
                    width: `${(unclaimedCount / maxStoreCount) * 100}%`,
                    background: 'var(--orange)',
                    height: 8,
                    borderRadius: 999,
                  }}
                />
              </div>
            </div>
          )}
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
      </div>
    </>
  );
}
