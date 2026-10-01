'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/AppProvider';
import TicketCard from '@/components/TicketCard';
import AddressModal from '@/components/AddressModal';
import { STATUS_LABELS } from '@/lib/constants';

// Every status where the rider themself has something to do next — kept as
// one combined list (not split pickups/deliveries) per explicit request.
const PENDING_STATUSES = ['pickup_request_accepted', 'driver_arriving_for_pickup', 'pickup_in_progress', 'ready_for_delivery', 'out_for_delivery'];

export default function RiderSchedulePage() {
  const { tickets, currentUser } = useApp();
  const [filter, setFilter] = useState('all');
  const [addressTicket, setAddressTicket] = useState(null);

  const mine = tickets.filter((t) => t.assignedRiderId === currentUser.id);
  const pending = mine
    .filter((t) => PENDING_STATUSES.includes(t.status))
    .filter((t) => filter === 'all' || t.status === filter)
    .sort((a, b) => a.slot.localeCompare(b.slot));
  const history = mine.filter((t) => !PENDING_STATUSES.includes(t.status));

  return (
    <>
      <div className="app-page-head">
        <h1>My Schedule</h1>
        <p>
          {pending.length} pending action{pending.length === 1 ? '' : 's'}
        </p>
      </div>

      <div className="filter-row">
        <button className={`filter-chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          All
        </button>
        {PENDING_STATUSES.map((s) => (
          <button key={s} className={`filter-chip ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {pending.length === 0 ? (
        <div className="empty-state">Nothing pending right now.</div>
      ) : (
        <div className="order-list">
          {pending.map((ticket) => (
            <div key={ticket.id}>
              <TicketCard ticket={ticket} />
              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                <button className="btn btn-outline btn-sm" onClick={() => setAddressTicket(ticket)}>
                  📍 Address
                </button>
                <Link href={`/rider/tickets/${ticket.id}`} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                  Open Ticket →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {history.length > 0 && (
        <>
          <div className="app-page-head" style={{ marginTop: 24 }}>
            <h1 style={{ fontSize: 17 }}>History</h1>
          </div>
          <div className="order-list">
            {history.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} href={`/rider/tickets/${ticket.id}`} />
            ))}
          </div>
        </>
      )}

      <AddressModal ticket={addressTicket} onClose={() => setAddressTicket(null)} />
    </>
  );
}
