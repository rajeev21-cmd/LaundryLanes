'use client';

import RoleGuard from '@/components/RoleGuard';
import AppShell from '@/components/AppShell';

export default function CustomerLayout({ children }) {
  return (
    <RoleGuard role="customer">
      <AppShell>{children}</AppShell>
    </RoleGuard>
  );
}
