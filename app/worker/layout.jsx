'use client';

import RoleGuard from '@/components/RoleGuard';
import AppShell from '@/components/AppShell';

export default function WorkerLayout({ children }) {
  return (
    <RoleGuard role="worker">
      <AppShell title="Laundrylanes">{children}</AppShell>
    </RoleGuard>
  );
}
