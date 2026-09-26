'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/AppProvider';
import { ROLE_HOME, ROLE_LABELS } from '@/lib/constants';
import MarketingHeader from '@/components/MarketingHeader';
import MarketingFooter from '@/components/MarketingFooter';

const DEMO_ROLES = [
  { role: 'customer', icon: '🧺' },
  { role: 'store', icon: '🏬' },
  { role: 'rider', icon: '🚚' },
  { role: 'owner', icon: '👑' },
];

export default function LoginPage() {
  const { currentUser, isHydrated, login, loginAsRole } = useApp();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isHydrated && currentUser) {
      router.replace(ROLE_HOME[currentUser.role]);
    }
  }, [isHydrated, currentUser, router]);

  function handleDemoLogin(role) {
    const user = loginAsRole(role);
    if (user) router.push(ROLE_HOME[role]);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const user = login(email, password);
    if (user) {
      router.push(ROLE_HOME[user.role]);
    } else {
      setError('Invalid email or password. Try one of the demo logins below.');
    }
  }

  return (
    <>
      <MarketingHeader showNav={false} />
      <div className="login-page">
        <div className="login-card">
          <h1>Welcome back</h1>
          <p>Sign in to your dashboard</p>

          <div className="demo-grid">
            {DEMO_ROLES.map(({ role, icon }) => (
              <button key={role} className="demo-chip" onClick={() => handleDemoLogin(role)}>
                {icon} Demo as {ROLE_LABELS[role]}
              </button>
            ))}
          </div>

          <div className="login-divider">or sign in manually</div>

          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@laundrylanes.com"
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            {error && <div className="form-error">{error}</div>}
            <button type="submit" className="btn btn-primary btn-block btn-lg">
              Log in
            </button>
          </form>

          <p className="form-hint" style={{ marginTop: 16, textAlign: 'center' }}>
            This is a demo build with mock accounts — no real signup. See{' '}
            <code>data/users.json</code> for the full list of demo credentials.
          </p>
        </div>
      </div>
      <MarketingFooter />
    </>
  );
}
