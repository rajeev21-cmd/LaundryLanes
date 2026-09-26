'use client';

import RoleGuard from '@/components/RoleGuard';
import AppShell from '@/components/AppShell';

export default function StoreLayout({ children }) {
  return (
    <RoleGuard role="store">
      <AppShell>{children}</AppShell>
    </RoleGuard>
  );
}
