'use client';

import RoleGuard from '@/components/RoleGuard';
import AppShell from '@/components/AppShell';

export default function RiderLayout({ children }) {
  return (
    <RoleGuard role="rider">
      <AppShell>{children}</AppShell>
    </RoleGuard>
  );
}
