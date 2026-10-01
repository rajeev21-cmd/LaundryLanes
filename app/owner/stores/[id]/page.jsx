'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/AppProvider';
import TicketCard from '@/components/TicketCard';
import { STATUS_LABELS, STATUS_ORDER } from '@/lib/constants';
import { TICKET_SORT_OPTIONS, sortTickets } from '@/lib/sortTickets';

export default function OwnerStoreDetailPage({ params }) {
  const { stores, users, tickets, today } = useApp();
  const router = useRouter();
  const [filter, setFilter] = useState('all');
  const [sortKey, setSortKey] = useState('pickup-desc');

  const store = stores.find((s) => s.id === params.id);
  if (!store) {
    return <div className="empty-state">Store not found.</div>;
  }

  const storeTicketsAll = tickets.filter((t) => t.storeId === store.id);
  const riderCount = users.filter((u) => u.role === 'rider' && u.storeId === store.id).length;
  const todayCount = storeTicketsAll.filter((t) => t.pickupDate === today).length;
  const activeCount = storeTicketsAll.filter((t) => !['delivered', 'cancelled'].includes(t.status)).length;
  const deliveredCount = storeTicketsAll.filter((t) => t.status === 'delivered').length;
  const rated = storeTicketsAll.filter((t) => t.serviceRating != null);
  const avgRating = rated.length ? rated.reduce((s, t) => s + t.serviceRating, 0) / rated.length : null;

  const filtered = sortTickets(storeTicketsAll.filter((t) => filter === 'all' || t.status === filter), sortKey);

  return (
    <>
      <button className="btn btn-outline btn-sm" onClick={() => router.back()} style={{ marginBottom: 14 }}>
        ← Back
      </button>

      <div className="app-page-head">
        <h1>{store.name}</h1>
        <p>📍 {store.address} · Pincode {store.pincode}</p>
      </div>

      <div className="stat-grid">
        <div className="stat-tile">
          <strong>{storeTicketsAll.length}</strong>
          <span>Total tickets</span>
        </div>
        <div className="stat-tile">
          <strong>{todayCount}</strong>
          <span>Today</span>
        </div>
        <div className="stat-tile">
          <strong>{activeCount}</strong>
          <span>Active</span>
        </div>
        <div className="stat-tile">
          <strong>{deliveredCount}</strong>
          <span>Delivered</span>
        </div>
        <div className="stat-tile">
          <strong>{riderCount}</strong>
          <span>Riders</span>
        </div>
        <div className="stat-tile">
          <strong>{avgRating != null ? `${avgRating.toFixed(1)} ★` : '—'}</strong>
          <span>Avg store rating</span>
        </div>
      </div>

      <div className="list-toolbar">
        <div className="filter-row">
          <button className={`filter-chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
            All
          </button>
          {[...STATUS_ORDER, 'cancelled'].map((s) => (
            <button key={s} className={`filter-chip ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
        <div className="select-inline">
          <select value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
            {TICKET_SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">No tickets match this filter.</div>
      ) : (
        <div className="order-list dense">
          {filtered.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} href={`/owner/tickets/${ticket.id}`} dense />
          ))}
        </div>
      )}
    </>
  );
}
