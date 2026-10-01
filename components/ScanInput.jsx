'use client';

import { useState } from 'react';
import QrScannerModal from '@/components/QrScannerModal';

// A text input plus a camera-scan icon feeding the same value — the one
// pattern every bag/tag id field uses (rider pickup, lookup search). Manual
// entry always works; the scan button is an alternative, not a requirement.
export default function ScanInput({ value, onChange, placeholder, inputStyle }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ flex: '1 1 140px', ...inputStyle }}
        />
        <button type="button" className="btn btn-outline btn-sm" onClick={() => setOpen(true)} aria-label="Scan QR code">
          📷
        </button>
      </div>
      <QrScannerModal
        open={open}
        onClose={() => setOpen(false)}
        onScan={(text) => {
          onChange(text);
          setOpen(false);
        }}
      />
    </>
  );
}
