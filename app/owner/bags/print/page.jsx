'use client';

import { useApp } from '@/lib/AppProvider';
import QrPrintSheet from '@/components/QrPrintSheet';

export default function PrintBagsPage() {
  const { bags } = useApp();
  const ids = [...bags].map((b) => b.id).sort();
  return <QrPrintSheet title="Bag QR codes" ids={ids} />;
}
