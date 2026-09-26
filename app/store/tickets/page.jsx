'use client';

import { useState } from 'react';
import { useApp } from '@/lib/AppProvider';
import TicketCard from '@/components/TicketCard';
import { STATUS_LABELS, STATUS_ORDER } from '@/lib/constants';

export default function StoreTicketsPage() {
  const { tickets, currentUser } = useApp();
  const [filter, setFilter] = useState('all');

  const storeTickets = [...tickets]
    .filter((t) => t.storeId === currentUser.storeId)
    .filter((t) => filter === 'all' || t.status === filter)
    .sort((a, b) => b.pickupDate.localeCompare(a.pickupDate));

  return (
    <>
      <div className="app-page-head">
        <h1>All Tickets</h1>
        <p>Every ticket ever assigned to this store</p>
      </div>

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
