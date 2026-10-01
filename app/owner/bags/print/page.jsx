'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/lib/AppProvider';
import QrPrintSheet from '@/components/QrPrintSheet';

// ?ids=BAG-1000,BAG-1001 prints just those (e.g. a freshly-generated batch,
// linked to from app/owner/bags/page.jsx) — omit it to print every bag.
function PrintBagsInner() {
  const { bags } = useApp();
  const idsParam = useSearchParams().get('ids');
  const ids = idsParam
    ? idsParam.split(',').filter((id) => bags.some((b) => b.id === id))
    : [...bags].map((b) => b.id).sort();
  return <QrPrintSheet title={idsParam ? 'New bag QR codes' : 'Bag QR codes'} ids={ids} />;
}

export default function PrintBagsPage() {
  return (
    <Suspense fallback={null}>
      <PrintBagsInner />
    </Suspense>
  );
}
