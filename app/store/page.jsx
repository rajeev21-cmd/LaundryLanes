'use client';

import { useState } from 'react';
import { useApp } from '@/lib/AppProvider';
import TicketCard from '@/components/TicketCard';
import { STATUS_LABELS } from '@/lib/constants';
import { TICKET_SORT_OPTIONS, sortTickets } from '@/lib/sortTickets';

const PICKUP_PHASE_STATUSES = ['pickup_scheduled', 'pickup_request_accepted', 'driver_arriving_for_pickup', 'pickup_in_progress'];

export default function StorePickupRequestsPage() {
  const { tickets, currentUser, today } = useApp();
  const [filter, setFilter] = useState('all');
  const [sortKey, setSortKey] = useState('pickup-asc');

  const todaysPickups = sortTickets(
    tickets
      .filter((t) => t.storeId === currentUser.storeId && t.pickupDate === today && PICKUP_PHASE_STATUSES.includes(t.status))
      .filter((t) => filter === 'all' || t.status === filter),
    sortKey
  );

  const scheduledCount = tickets.filter((t) => t.storeId === currentUser.storeId && t.pickupDate === today && t.status === 'pickup_scheduled').length;
  const acceptedCount = tickets.filter((t) => t.storeId === currentUser.storeId && t.pickupDate === today && t.status === 'pickup_request_accepted').length;
  const arrivingCount = tickets.filter((t) => t.storeId === currentUser.storeId && t.pickupDate === today && t.status === 'driver_arriving_for_pickup').length;
  const inProgressCount = tickets.filter((t) => t.storeId === currentUser.storeId && t.pickupDate === today && t.status === 'pickup_in_progress').length;

  return (
    <>
      <div className="app-page-head">
        <h1>Pickup Requests</h1>
        <p>{todaysPickups.length} in the pickup pipeline today</p>
      </div>

      <div className="stat-grid">
        <div className="stat-tile">
          <strong>{scheduledCount}</strong>
          <span>Awaiting rider</span>
        </div>
        <div className="stat-tile">
          <strong>{acceptedCount}</strong>
          <span>Accepted</span>
        </div>
        <div className="stat-tile">
          <strong>{arrivingCount}</strong>
          <span>Rider arriving</span>
        </div>
        <div className="stat-tile">
          <strong>{inProgressCount}</strong>
          <span>Pickup in progress</span>
        </div>
      </div>

      <div className="list-toolbar">
        <div className="filter-row">
          <button className={`filter-chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
            All
          </button>
          {PICKUP_PHASE_STATUSES.map((s) => (
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

      {todaysPickups.length === 0 ? (
        <div className="empty-state">No pickups in progress today.</div>
      ) : (
        <div className="order-list dense">
          {todaysPickups.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} href={`/store/tickets/${ticket.id}`} dense />
          ))}
        </div>
      )}
    </>
  );
}
