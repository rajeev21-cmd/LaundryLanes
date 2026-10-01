'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/lib/AppProvider';
import { NAV_ITEMS } from '@/lib/nav';
import { ROLE_LABELS, ROLE_HOME } from '@/lib/constants';

export default function AppShell({ children }) {
  const [open, setOpen] = useState(false);
  const { currentUser, logout, resetDemoData } = useApp();
  const pathname = usePathname();
  const router = useRouter();

  if (!currentUser) return null;
  const items = NAV_ITEMS[currentUser.role] || [];

  function handleLogout() {
    logout();
    router.replace('/login');
  }

  // Shared between the mobile drawer and the persistent desktop sidebar —
  // same nav, same actions, just a different wrapping container (one is an
  // overlay you open/close, the other is always visible). Keeping this in
  // one place means the two can't drift out of sync with each other.
  function navLinks(onNavigate) {
    return (
      <>
        <ul className="app-drawer-list">
          {items.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={pathname === item.href ? 'active' : ''} onClick={onNavigate}>
                <span className="app-drawer-icon">{item.icon}</span> {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="app-drawer-footer">
          <button className="app-drawer-action" onClick={resetDemoData}>
            🔄 Reset demo data
          </button>
          <Link href="/" className="app-drawer-action">
            🌐 Marketing site
          </Link>
          <button className="app-drawer-action app-drawer-logout" onClick={handleLogout}>
            🚪 Log out
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-topbar">
        <button className="app-hamburger" aria-label="Open menu" onClick={() => setOpen(true)}>
          <span />
          <span />
          <span />
        </button>
        <Link href={ROLE_HOME[currentUser.role]} className="app-topbar-brand">
          <Image src="/images/logo.webp" width={140} height={70} alt="Laundrylanes" className="app-topbar-logo" />
        </Link>
        <span className="app-role-badge">{ROLE_LABELS[currentUser.role]}</span>
      </header>

      {open && (
        <div className="app-drawer-backdrop" onClick={() => setOpen(false)}>
          <nav className="app-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="app-drawer-header">
              <Image src="/images/logo.webp" width={40} height={40} alt="Laundrylanes" className="app-drawer-logo" />
              <div>
                <div className="app-drawer-name">{currentUser.name}</div>
                <div className="app-drawer-role">{ROLE_LABELS[currentUser.role]}</div>
              </div>
            </div>
            {navLinks(() => setOpen(false))}
          </nav>
        </div>
      )}

      <div className="app-shell-body">
        {/* Desktop-only persistent sidebar — same links as the mobile drawer
            above, just always visible instead of hidden behind the hamburger
            (see .app-sidebar's media query in globals.css). */}
        <nav className="app-sidebar">{navLinks(undefined)}</nav>
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
