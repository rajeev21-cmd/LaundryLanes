'use client';

import { useState } from 'react';
import { useApp } from '@/lib/AppProvider';
import TicketCard from '@/components/TicketCard';
import { STATUS_LABELS, STATUS_ORDER } from '@/lib/constants';
import { TICKET_SORT_OPTIONS, sortTickets } from '@/lib/sortTickets';

export default function OwnerTicketsPage() {
  const { tickets, stores } = useApp();
  const [statusFilter, setStatusFilter] = useState('all');
  const [storeFilter, setStoreFilter] = useState('all');
  const [sortKey, setSortKey] = useState('pickup-desc');

  const filtered = sortTickets(
    tickets
      .filter((t) => statusFilter === 'all' || t.status === statusFilter)
      .filter((t) => storeFilter === 'all' || t.storeId === storeFilter),
    sortKey
  );

  return (
    <>
      <div className="app-page-head">
        <h1>All Tickets</h1>
        <p>{filtered.length} ticket(s)</p>
      </div>

      <div className="form-field" style={{ maxWidth: 320 }}>
        <label htmlFor="storeFilter">Store</label>
        <select id="storeFilter" value={storeFilter} onChange={(e) => setStoreFilter(e.target.value)}>
          <option value="all">All stores</option>
          {stores.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="list-toolbar">
        <div className="filter-row">
          <button className={`filter-chip ${statusFilter === 'all' ? 'active' : ''}`} onClick={() => setStatusFilter('all')}>
            All
          </button>
          {[...STATUS_ORDER, 'cancelled'].map((s) => (
            <button
              key={s}
              className={`filter-chip ${statusFilter === s ? 'active' : ''}`}
              onClick={() => setStatusFilter(s)}
            >
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
            <TicketCard key={ticket.id} ticket={ticket} showStore href={`/owner/tickets/${ticket.id}`} dense />
          ))}
        </div>
      )}
    </>
  );
}
