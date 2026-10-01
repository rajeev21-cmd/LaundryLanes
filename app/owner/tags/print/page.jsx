'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/lib/AppProvider';
import QrPrintSheet from '@/components/QrPrintSheet';

// ?ids=TAG-00031,TAG-00032 prints just those (e.g. a freshly-generated batch,
// linked to from app/owner/tags/page.jsx) — omit it to print every tag.
function PrintTagsInner() {
  const { clothTags } = useApp();
  const idsParam = useSearchParams().get('ids');
  const ids = idsParam
    ? idsParam.split(',').filter((id) => clothTags.some((t) => t.id === id))
    : [...clothTags].map((t) => t.id).sort();
  return <QrPrintSheet title={idsParam ? 'New tag QR codes' : 'Tag QR codes'} ids={ids} />;
}

export default function PrintTagsPage() {
  return (
    <Suspense fallback={null}>
      <PrintTagsInner />
    </Suspense>
  );
}
