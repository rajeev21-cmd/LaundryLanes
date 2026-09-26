'use client';

import { useState } from 'react';
import { useApp } from '@/lib/AppProvider';
import TicketCard from '@/components/TicketCard';
import { STATUS_LABELS, STATUS_ORDER } from '@/lib/constants';

export default function OwnerTicketsPage() {
  const { tickets, stores } = useApp();
  const [statusFilter, setStatusFilter] = useState('all');
  const [storeFilter, setStoreFilter] = useState('all');

  const filtered = [...tickets]
    .filter((t) => statusFilter === 'all' || t.status === statusFilter)
    .filter((t) => storeFilter === 'all' || t.storeId === storeFilter)
    .sort((a, b) => b.pickupDate.localeCompare(a.pickupDate));

  return (
    <>
      <div className="app-page-head">
        <h1>All Tickets</h1>
        <p>{filtered.length} ticket(s)</p>
      </div>

      <div className="form-field">
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

      {filtered.length === 0 ? (
        <div className="empty-state">No tickets match this filter.</div>
      ) : (
        <div className="order-list">
          {filtered.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} showStore href={`/owner/tickets/${ticket.id}`} />
          ))}
        </div>
      )}
    </>
  );
}
