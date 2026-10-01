'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/AppProvider';
import { downloadCsv } from '@/lib/downloadCsv';

export default function OwnerTagsPage() {
  const { clothTags, clothes, tickets, generateClothTags } = useApp();
  const [count, setCount] = useState(20);
  const [generating, setGenerating] = useState(false);

  const sorted = [...clothTags].sort((a, b) => a.id.localeCompare(b.id));
  const usedCount = sorted.filter((t) => clothes.some((c) => c.tag === t.id)).length;

  async function handleGenerate(e) {
    e.preventDefault();
    setGenerating(true);
    await generateClothTags(count);
    setGenerating(false);
  }

  function statusFor(tag) {
    const cloth = clothes.find((c) => c.tag === tag.id);
    if (!cloth) return 'Available';
    const ticket = tickets.find((t) => t.id === cloth.ticketId);
    return `Used — ${cloth.label} on #${cloth.ticketId.replace('tk-', '')}${ticket ? ` (${ticket.status})` : ''}`;
  }

  function handleDownloadCsv() {
    downloadCsv(
      'tags.csv',
      ['id', 'status'],
      sorted.map((t) => [t.id, statusFor(t)])
    );
  }

  return (
    <>
      <div className="app-page-head">
        <h1>Tags</h1>
        <p>{clothTags.length} tag(s) — single-use, never returned to the pool once tagged on a garment</p>
      </div>

      <div className="stat-grid">
        <div className="stat-tile">
          <strong>{clothTags.length}</strong>
          <span>Total</span>
        </div>
        <div className="stat-tile">
          <strong>{usedCount}</strong>
          <span>Used</span>
        </div>
        <div className="stat-tile">
          <strong>{clothTags.length - usedCount}</strong>
          <span>Available</span>
        </div>
      </div>

      <div className="card-section">
        <h3>Generate tags</h3>
        <form onSubmit={handleGenerate} style={{ display: 'flex', gap: 8 }}>
          <input
            type="number"
            min="1"
            max="500"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            style={{ flex: '0 0 100px' }}
          />
          <button type="submit" className="btn btn-primary" disabled={generating} style={{ flex: 1 }}>
            {generating ? 'Generating…' : `Generate ${count || 0} tag(s)`}
          </button>
        </form>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button className="btn btn-outline btn-sm" onClick={handleDownloadCsv}>
          ⬇️ Download CSV
        </button>
        <Link href="/owner/tags/print" className="btn btn-outline btn-sm">
          🖨️ Print QR sheet
        </Link>
      </div>

      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((tag) => (
              <tr key={tag.id}>
                <td>{tag.id}</td>
                <td>{statusFor(tag)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
