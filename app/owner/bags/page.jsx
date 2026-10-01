'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/AppProvider';
import { downloadCsv } from '@/lib/downloadCsv';

export default function OwnerBagsPage() {
  const { bags, stores, tickets, generateBags, assignBagToStore } = useApp();
  const [count, setCount] = useState(10);
  const [generating, setGenerating] = useState(false);

  const sorted = [...bags].sort((a, b) => a.id.localeCompare(b.id));
  const inUseCount = bags.filter((b) => b.ticketId).length;
  const availableCount = bags.filter((b) => !b.ticketId && b.storeId).length;
  const unassignedCount = bags.filter((b) => !b.storeId).length;

  async function handleGenerate(e) {
    e.preventDefault();
    setGenerating(true);
    await generateBags(count);
    setGenerating(false);
  }

  function statusFor(bag) {
    if (bag.ticketId) {
      const ticket = tickets.find((t) => t.id === bag.ticketId);
      return `In use — #${bag.ticketId.replace('tk-', '')}${ticket ? ` (${ticket.status})` : ''}`;
    }
    if (bag.storeId) return 'Available';
    return 'Unassigned';
  }

  function handleDownloadCsv() {
    downloadCsv(
      'bags.csv',
      ['id', 'store', 'status'],
      sorted.map((b) => [b.id, stores.find((s) => s.id === b.storeId)?.name || '', statusFor(b)])
    );
  }

  return (
    <>
      <div className="app-page-head">
        <h1>Bags</h1>
        <p>{bags.length} bag(s) — reusable, returned to the pool once a ticket is delivered or cancelled</p>
      </div>

      <div className="stat-grid">
        <div className="stat-tile">
          <strong>{bags.length}</strong>
          <span>Total</span>
        </div>
        <div className="stat-tile">
          <strong>{inUseCount}</strong>
          <span>In use</span>
        </div>
        <div className="stat-tile">
          <strong>{availableCount}</strong>
          <span>Available</span>
        </div>
        <div className="stat-tile">
          <strong>{unassignedCount}</strong>
          <span>Unassigned</span>
        </div>
      </div>

      <div className="card-section">
        <h3>Generate bags</h3>
        <form onSubmit={handleGenerate} style={{ display: 'flex', gap: 8 }}>
          <input
            type="number"
            min="1"
            max="200"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            style={{ flex: '0 0 100px' }}
          />
          <button type="submit" className="btn btn-primary" disabled={generating} style={{ flex: 1 }}>
            {generating ? 'Generating…' : `Generate ${count || 0} bag(s)`}
          </button>
        </form>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button className="btn btn-outline btn-sm" onClick={handleDownloadCsv}>
          ⬇️ Download CSV
        </button>
        <Link href="/owner/bags/print" className="btn btn-outline btn-sm">
          🖨️ Print QR sheet
        </Link>
      </div>

      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Store</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((bag) => (
              <tr key={bag.id}>
                <td>{bag.id}</td>
                <td>
                  <select
                    value={bag.storeId || ''}
                    disabled={!!bag.ticketId}
                    onChange={(e) => assignBagToStore(bag.id, e.target.value || null)}
                  >
                    <option value="">Unassigned</option>
                    {stores.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td>{statusFor(bag)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
