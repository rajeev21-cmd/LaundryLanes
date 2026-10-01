'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/AppProvider';
import TicketCard from '@/components/TicketCard';
import { STATUS_LABELS, STATUS_ORDER, RIDER_ACTIVE_STATUSES } from '@/lib/constants';
import { TICKET_SORT_OPTIONS, sortTickets } from '@/lib/sortTickets';

// Read-only — a rider's full task history, for the owner to check in on.
// There is deliberately no status-changing action anywhere on this page;
// drilling into an individual ticket (which does have actions) is a
// separate, explicit click.
export default function OwnerRiderDetailPage({ params }) {
  const { users, stores, tickets } = useApp();
  const router = useRouter();
  const [filter, setFilter] = useState('all');
  const [sortKey, setSortKey] = useState('pickup-desc');

  const rider = users.find((u) => u.id === params.id && u.role === 'rider');
  if (!rider) {
    return <div className="empty-state">Rider not found.</div>;
  }
  const store = stores.find((s) => s.id === rider.storeId);

  const riderTickets = sortTickets(
    tickets.filter((t) => t.assignedRiderId === rider.id).filter((t) => filter === 'all' || t.status === filter),
    sortKey
  );
  const activeCount = tickets.filter((t) => t.assignedRiderId === rider.id && RIDER_ACTIVE_STATUSES.includes(t.status)).length;
  const deliveredCount = tickets.filter((t) => t.assignedRiderId === rider.id && t.status === 'delivered').length;

  return (
    <>
      <button className="btn btn-outline btn-sm" onClick={() => router.back()} style={{ marginBottom: 14 }}>
        ← Back
      </button>

      <div className="app-page-head">
        <h1>{rider.name}</h1>
        <p>
          🏬 {store?.name || '—'} · Read-only — view only, no status changes from here
        </p>
      </div>

      <div className="stat-grid">
        <div className="stat-tile">
          <strong>{tickets.filter((t) => t.assignedRiderId === rider.id).length}</strong>
          <span>Total tasks</span>
        </div>
        <div className="stat-tile">
          <strong>{activeCount}</strong>
          <span>On now</span>
        </div>
        <div className="stat-tile">
          <strong>{deliveredCount}</strong>
          <span>Delivered</span>
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

      {riderTickets.length === 0 ? (
        <div className="empty-state">No tasks match this filter.</div>
      ) : (
        <div className="order-list dense">
          {riderTickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} href={`/owner/tickets/${ticket.id}`} dense />
          ))}
        </div>
      )}
    </>
  );
}
