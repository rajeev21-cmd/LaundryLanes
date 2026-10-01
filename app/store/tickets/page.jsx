'use client';

import { useState } from 'react';
import { useApp } from '@/lib/AppProvider';
import TicketCard from '@/components/TicketCard';
import { STATUS_LABELS, STATUS_ORDER } from '@/lib/constants';
import { TICKET_SORT_OPTIONS, sortTickets } from '@/lib/sortTickets';

export default function StoreTicketsPage() {
  const { tickets, currentUser } = useApp();
  const [filter, setFilter] = useState('all');
  const [sortKey, setSortKey] = useState('pickup-desc');

  const storeTickets = sortTickets(
    tickets.filter((t) => t.storeId === currentUser.storeId).filter((t) => filter === 'all' || t.status === filter),
    sortKey
  );

  return (
    <>
      <div className="app-page-head">
        <h1>All Tickets</h1>
        <p>Every ticket ever assigned to this store</p>
      </div>

      <div className="list-toolbar">
        <div className="filter-row">
          <button className={`filter-chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
            All
          </button>
          {STATUS_ORDER.map((s) => (
            <button key={s} className={`filter-chip ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
              {STATUS_LABELS[s]}
            </button>
          ))}
          <button className={`filter-chip ${filter === 'cancelled' ? 'active' : ''}`} onClick={() => setFilter('cancelled')}>
            Cancelled
          </button>
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

      {storeTickets.length === 0 ? (
        <div className="empty-state">No tickets match this filter.</div>
      ) : (
        <div className="order-list dense">
          {storeTickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} href={`/store/tickets/${ticket.id}`} dense />
          ))}
        </div>
      )}
    </>
  );
}
