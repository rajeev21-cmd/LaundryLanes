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
  const { currentUser, isHydrated, login, loginAsRole, claimAccount } = useApp();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Set once login() reports a passwordless account (a customer a store
  // created for a walk-in/phone order — see storeOrderActions.js) —
  // swaps the form for a one-time "set a password" step instead of
  // showing a normal (and misleading) "invalid email or password".
  const [pendingUser, setPendingUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [claiming, setClaiming] = useState(false);

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
    setError('');
    const result = login(email, password);
    if (result.status === 'ok') {
      router.push(ROLE_HOME[result.user.role]);
    } else if (result.status === 'needs-password') {
      setPendingUser(result.user);
    } else {
      setError('Invalid email or password. Try one of the demo logins below.');
    }
  }

  async function handleClaimAccount(e) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setClaiming(true);
    const result = await claimAccount(pendingUser.id, newPassword);
    setClaiming(false);
    if (result.error) {
      setError(result.error);
    } else {
      router.push(ROLE_HOME[pendingUser.role]);
    }
  }

  if (pendingUser) {
    return (
      <>
        <MarketingHeader showNav={false} />
        <div className="login-page">
          <div className="login-card">
            <h1>Welcome, {pendingUser.name.split(' ')[0]} 👋</h1>
            <p>This is your first time signing in — set a password to continue.</p>

            <form onSubmit={handleClaimAccount}>
              <div className="form-field">
                <label htmlFor="new-password">New password</label>
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="confirm-password">Confirm password</label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              {error && <div className="form-error">{error}</div>}
              <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={claiming}>
                {claiming ? 'Setting password…' : 'Set password & continue'}
              </button>
            </form>

            <button
              type="button"
              className="btn btn-outline btn-block"
              style={{ marginTop: 10 }}
              onClick={() => {
                setPendingUser(null);
                setError('');
              }}
            >
              ← Back
            </button>
          </div>
        </div>
        <MarketingFooter />
      </>
    );
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
                placeholder="•••••••• (leave blank if you've never set one)"
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
