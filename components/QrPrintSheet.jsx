'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

// Renders one QR code per id, meant to be printed and stuck on the physical
// bag/tag — a separate artifact from the CSV export, which is just plain
// ids for spreadsheets/lookups. QRCode.toDataURL() is async, so codes are
// generated in a batch on mount rather than per-render.
export default function QrPrintSheet({ title, ids }) {
  const [qrMap, setQrMap] = useState({});

  useEffect(() => {
    let cancelled = false;
    Promise.all(ids.map((id) => QRCode.toDataURL(id, { width: 180, margin: 1 }).then((url) => [id, url]))).then((pairs) => {
      if (!cancelled) setQrMap(Object.fromEntries(pairs));
    });
    return () => {
      cancelled = true;
    };
  }, [ids]);

  return (
    <>
      <div className="app-page-head no-print">
        <h1>{title}</h1>
        <p>{ids.length} code(s) — use your browser's print dialog to print this sheet</p>
      </div>
      <button className="btn btn-primary no-print" style={{ marginBottom: 20 }} onClick={() => window.print()}>
        🖨️ Print
      </button>
      <div className="qr-print-sheet">
        {ids.map((id) => (
          <div key={id} className="qr-print-cell">
            {qrMap[id] ? <img src={qrMap[id]} alt={id} width={120} height={120} /> : <div style={{ width: 120, height: 120 }} />}
            <p>{id}</p>
          </div>
        ))}
      </div>
    </>
  );
}
