'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/AppProvider';

export default function RoleGuard({ role, children }) {
  const { currentUser, isHydrated } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!isHydrated) return;
    if (!currentUser || currentUser.role !== role) {
      router.replace('/login');
    }
  }, [isHydrated, currentUser, role, router]);

  if (!isHydrated || !currentUser || currentUser.role !== role) {
    return <div className="app-loading">Loading…</div>;
  }

  return children;
}
