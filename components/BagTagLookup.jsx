'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/AppProvider';
import { STATUS_LABELS } from '@/lib/constants';
import ScanInput from '@/components/ScanInput';

// Shared by /owner/lookup and /store/lookup — same search over the same
// shared bag/tag/cloth/ticket state, just linking onward to whichever
// role's own ticket-detail route.
export default function BagTagLookup({ ticketBasePath }) {
  const { bags, clothTags, clothes, tickets, stores } = useApp();
  const [query, setQuery] = useState('');

  const trimmed = query.trim().toUpperCase();
  let result = null;
  if (trimmed.startsWith('BAG-')) {
    const bag = bags.find((b) => b.id === trimmed);
    if (bag) {
      const ticket = bag.ticketId ? tickets.find((t) => t.id === bag.ticketId) : null;
      const store = bag.storeId ? stores.find((s) => s.id === bag.storeId) : null;
      result = {
        type: 'Bag',
        id: bag.id,
        status: ticket
          ? `In use on #${ticket.id.replace('tk-', '')} — ${STATUS_LABELS[ticket.status]}`
          : store
            ? `Available at ${store.name}`
            : 'Unassigned — no store yet',
        ticket,
      };
    }
  } else if (trimmed.startsWith('TAG-')) {
    const cloth = clothes.find((c) => c.tag === trimmed);
    const inPool = clothTags.some((t) => t.id === trimmed);
    if (cloth) {
      const ticket = tickets.find((t) => t.id === cloth.ticketId);
      result = {
        type: 'Tag',
        id: trimmed,
        status: `Used on #${cloth.ticketId.replace('tk-', '')} — ${cloth.label} (${cloth.category})${ticket ? `, ${STATUS_LABELS[ticket.status]}` : ''}`,
        ticket,
      };
    } else if (inPool) {
      result = { type: 'Tag', id: trimmed, status: 'Available — not yet used', ticket: null };
    }
  }

  return (
    <>
      <div className="app-page-head">
        <h1>Lookup</h1>
        <p>Search a bag or tag id to see its current status</p>
      </div>
      <div className="card-section">
        <ScanInput value={query} onChange={setQuery} placeholder="e.g. BAG-0001 or TAG-00001" />
        {trimmed && !result && (
          <p className="form-error" style={{ marginTop: 10 }}>
            No bag or tag found with id &quot;{trimmed}&quot;.
          </p>
        )}
        {result && (
          <div style={{ marginTop: 16 }}>
            <p className="form-hint" style={{ marginBottom: 2 }}>
              {result.type}
            </p>
            <h3 style={{ margin: '0 0 8px' }}>{result.id}</h3>
            <p style={{ fontSize: 14 }}>{result.status}</p>
            {result.ticket && (
              <Link href={`${ticketBasePath}/tickets/${result.ticket.id}`} className="btn btn-outline btn-sm" style={{ marginTop: 10 }}>
                View ticket →
              </Link>
            )}
          </div>
        )}
      </div>
    </>
  );
}
