'use client';

import { useState } from 'react';
import { useApp } from '@/lib/AppProvider';
import TicketCard from '@/components/TicketCard';
import { CUSTOMER_STATUS_ORDER, CUSTOMER_STATUS_LABELS, toCustomerStatus } from '@/lib/constants';
import { TICKET_SORT_OPTIONS, sortTickets } from '@/lib/sortTickets';

export default function CustomerTicketsPage() {
  const { tickets, currentUser } = useApp();
  const [filter, setFilter] = useState('all');
  const [sortKey, setSortKey] = useState('pickup-desc');

  const myTickets = sortTickets(
    tickets
      .filter((t) => t.customerId === currentUser.id)
      .filter((t) => filter === 'all' || toCustomerStatus(t.status) === filter),
    sortKey
  );

  return (
    <>
      <div className="app-page-head">
        <h1>My Tickets</h1>
        <p>{myTickets.length} ticket(s)</p>
      </div>

      <div className="list-toolbar">
        <div className="filter-row">
          <button className={`filter-chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
            All
          </button>
          {[...CUSTOMER_STATUS_ORDER, 'cancelled'].map((s) => (
            <button key={s} className={`filter-chip ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
              {CUSTOMER_STATUS_LABELS[s]}
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

      {myTickets.length === 0 ? (
        <div className="empty-state">No tickets match this filter.</div>
      ) : (
        <div className="order-list">
          {myTickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} showCustomer={false} showStore href={`/customer/tickets/${ticket.id}`} simplified />
          ))}
        </div>
      )}
    </>
  );
}
