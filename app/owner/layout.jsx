'use client';

import RoleGuard from '@/components/RoleGuard';
import AppShell from '@/components/AppShell';

export default function OwnerLayout({ children }) {
  return (
    <RoleGuard role="owner">
      <AppShell title="Laundrylanes">{children}</AppShell>
    </RoleGuard>
  );
}
