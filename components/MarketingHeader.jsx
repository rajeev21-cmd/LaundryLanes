'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useApp } from '@/lib/AppProvider';
import { ROLE_HOME } from '@/lib/constants';

export default function MarketingHeader() {
  const [open, setOpen] = useState(false);
  const { currentUser, isHydrated } = useApp();

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand">
          <Image src="/images/logo.webp" alt="Laundrylanes logo" width={140} height={70} className="brand-logo" priority />
        </Link>
        <nav className={`main-nav ${open ? 'open' : ''}`} id="main-nav">
          <a href="#services">Services</a>
          <a href="#how">How It Works</a>
          <a href="#locate">Locate a Store</a>
          <a href="#about">About</a>
        </nav>
        <div className="header-actions">
          {isHydrated && currentUser ? (
            <Link href={ROLE_HOME[currentUser.role]} className="btn btn-primary">
              Go to Dashboard
            </Link>
          ) : (
            <Link href="/login" className="btn btn-primary">
              Login
            </Link>
          )}
        </div>
        <button className="nav-toggle" aria-label="Toggle menu" onClick={() => setOpen((v) => !v)}>
          ☰
        </button>
      </div>
    </header>
  );
}
