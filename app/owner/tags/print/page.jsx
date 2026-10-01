'use client';

import { useApp } from '@/lib/AppProvider';
import QrPrintSheet from '@/components/QrPrintSheet';

export default function PrintTagsPage() {
  const { clothTags } = useApp();
  const ids = [...clothTags].map((t) => t.id).sort();
  return <QrPrintSheet title="Tag QR codes" ids={ids} />;
}
