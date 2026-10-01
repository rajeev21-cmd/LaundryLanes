'use client';

import { useState } from 'react';
import { useApp } from '@/lib/AppProvider';
import { SLOT_LABELS } from '@/lib/constants';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function StoreCreateOrderPage() {
  const { services, users, currentUser, createStoreOrder } = useApp();
  const customers = users.filter((u) => u.role === 'customer');

  const [customerMode, setCustomerMode] = useState(customers.length ? 'existing' : 'new');
  const [customerId, setCustomerId] = useState('');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [serviceId, setServiceId] = useState(services[0].id);
  const [line1, setLine1] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [pincode, setPincode] = useState('');
  const [pickupDate, setPickupDate] = useState(todayStr());
  const [slot, setSlot] = useState(Object.keys(SLOT_LABELS)[0]);
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [createdTicket, setCreatedTicket] = useState(null);

  const canSubmit =
    line1.trim() &&
    pincode.trim() &&
    (customerMode === 'existing' ? !!customerId : newName.trim() && newEmail.trim() && newPassword.trim());

  function resetForNextOrder() {
    setCreatedTicket(null);
    setCustomerId('');
    setNewName('');
    setNewPhone('');
    setNewEmail('');
    setNewPassword('');
    setLine1('');
    setLandmark('');
    setPincode('');
    setNotes('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError('');
    const pickupAddress = `${line1.trim()}${landmark.trim() ? `, near ${landmark.trim()}` : ''}, ${city.trim()} - ${pincode.trim()}`;
    const result = await createStoreOrder({
      storeId: currentUser.storeId,
      customerId: customerMode === 'existing' ? customerId : undefined,
      newCustomer: customerMode === 'new' ? { name: newName, phone: newPhone, email: newEmail, password: newPassword } : undefined,
      serviceId,
      pickupAddress,
      pincode: pincode.trim(),
      pickupDate,
      slot,
      notes,
    });
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
    } else {
      setCreatedTicket(result.ticket);
    }
  }

  return (
    <>
      <div className="app-page-head">
        <h1>Create Order</h1>
        <p>For walk-in or phone customers who aren't booking through the app themselves</p>
      </div>

      {createdTicket && (
        <div className="card-section">
          <p className="form-success" style={{ marginBottom: 14 }}>
            ✅ Order #{createdTicket.id.replace('tk-', '')} created and pre-accepted — ready to assign a rider.
          </p>
          <button className="btn btn-primary btn-block" onClick={resetForNextOrder}>
            + Create another order
          </button>
        </div>
      )}

      {!createdTicket && (
        <form onSubmit={handleSubmit} className="card-section">
          <div className="form-field">
            <label>Customer</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <button
                type="button"
                className={`filter-chip ${customerMode === 'existing' ? 'active' : ''}`}
                onClick={() => setCustomerMode('existing')}
              >
                Existing customer
              </button>
              <button
                type="button"
                className={`filter-chip ${customerMode === 'new' ? 'active' : ''}`}
                onClick={() => setCustomerMode('new')}
              >
                New customer
              </button>
            </div>

            {customerMode === 'existing' ? (
              <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} required>
                <option value="" disabled>
                  Choose a customer…
                </option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone || c.email})
                  </option>
                ))}
              </select>
            ) : (
              <div className="card-section" style={{ boxShadow: 'none', border: '1px solid rgba(11,37,69,0.12)' }}>
                <div className="form-field">
                  <label htmlFor="new-name">Name</label>
                  <input id="new-name" type="text" value={newName} onChange={(e) => setNewName(e.target.value)} required />
                </div>
                <div className="form-field">
                  <label htmlFor="new-phone">Phone (optional)</label>
                  <input id="new-phone" type="text" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
                </div>
                <div className="form-field">
                  <label htmlFor="new-email">Email</label>
                  <input id="new-email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required />
                </div>
                <div className="form-field" style={{ marginBottom: 0 }}>
                  <label htmlFor="new-password">Password</label>
                  <input id="new-password" type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                  <p className="form-hint">So they can log in later and track this order — plaintext demo auth, same as every other account here.</p>
                </div>
              </div>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="service">Service</label>
            <select id="service" value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="line1">Pickup address</label>
            <textarea id="line1" value={line1} onChange={(e) => setLine1(e.target.value)} placeholder="Flat / House no., Street, Area" required />
          </div>
          <div className="form-field">
            <label htmlFor="landmark">Landmark (optional)</label>
            <input id="landmark" type="text" value={landmark} onChange={(e) => setLandmark(e.target.value)} />
          </div>
          <div className="form-field">
            <label htmlFor="city">City</label>
            <input id="city" type="text" value={city} onChange={(e) => setCity(e.target.value)} required />
          </div>
          <div className="form-field">
            <label htmlFor="pincode">Pincode</label>
            <input
              id="pincode"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="date">Pickup date</label>
            <input id="date" type="date" min={todayStr()} value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} required />
          </div>
          <div className="form-field">
            <label htmlFor="slot">Time slot</label>
            <select id="slot" value={slot} onChange={(e) => setSlot(e.target.value)}>
              {Object.entries(SLOT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="notes">Notes (optional)</label>
            <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Gate code, special instructions, etc." />
          </div>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={!canSubmit || submitting}>
            {submitting ? 'Creating…' : 'Create Order'}
          </button>
        </form>
      )}
    </>
  );
}
