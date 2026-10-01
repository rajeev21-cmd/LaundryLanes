'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/AppProvider';
import { SLOT_LABELS } from '@/lib/constants';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// A walk-in/phone order is for right now, not a future scheduled pickup —
// there's no slot picker in this form (see the page component below), so
// pick whichever slot bucket the current time actually falls into instead
// of defaulting to a fixed one regardless of when the order was created.
function currentSlotKey() {
  const hour = new Date().getHours();
  const keys = Object.keys(SLOT_LABELS);
  const match = keys.find((key) => {
    const [start, end] = key.split('-').map(Number);
    return hour >= start && hour < end;
  });
  if (match) return match;
  return hour < 8 ? keys[0] : keys[keys.length - 1];
}

export default function StoreCreateOrderPage() {
  const { services, users, addresses, currentUser, createStoreOrder } = useApp();
  const router = useRouter();
  const customers = users.filter((u) => u.role === 'customer');

  const [customerMode, setCustomerMode] = useState('existing');
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const [serviceId, setServiceId] = useState(services[0].id);
  const [notes, setNotes] = useState('');

  // Who brings it back to the customer — not "how do the clothes get to the
  // store" (that's always self_dropoff here, see createStoreOrder) — just
  // whether this walk-in needs a delivery rider once it's done.
  const [deliveryMethod, setDeliveryMethod] = useState('self_pickup');
  const [deliveryAddressId, setDeliveryAddressId] = useState('');
  const [addNewAddress, setAddNewAddress] = useState(false);
  const [addrLabel, setAddrLabel] = useState('Home');
  const [addrLine1, setAddrLine1] = useState('');
  const [addrLandmark, setAddrLandmark] = useState('');
  const [addrCity, setAddrCity] = useState('Bengaluru');
  const [addrPincode, setAddrPincode] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const selectedCustomer = customers.find((c) => c.id === customerId);
  const searchTerm = customerSearch.trim().toLowerCase();
  const matchingCustomers = searchTerm
    ? customers.filter((c) => (c.phone || '').toLowerCase().includes(searchTerm) || (c.email || '').toLowerCase().includes(searchTerm))
    : [];
  const savedAddresses = customerMode === 'existing' && selectedCustomer ? addresses.filter((a) => a.customerId === selectedCustomer.id) : [];
  // No saved addresses to pick from (brand-new customer, or an existing one
  // with none yet) — go straight to the new-address fields instead of
  // showing an empty, useless picker.
  const needsNewAddressForm = deliveryMethod === 'delivery' && (addNewAddress || savedAddresses.length === 0);

  const canSubmit =
    (customerMode === 'existing' ? !!customerId : newName.trim() && newEmail.trim()) &&
    (deliveryMethod === 'self_pickup' ||
      (needsNewAddressForm ? addrLine1.trim() && addrPincode.trim() : !!deliveryAddressId));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError('');
    const result = await createStoreOrder({
      storeId: currentUser.storeId,
      customerId: customerMode === 'existing' ? customerId : undefined,
      newCustomer: customerMode === 'new' ? { name: newName, phone: newPhone, email: newEmail } : undefined,
      serviceId,
      deliveryMethod,
      deliveryAddressId: deliveryMethod === 'delivery' && !needsNewAddressForm ? deliveryAddressId : undefined,
      newDeliveryAddress:
        deliveryMethod === 'delivery' && needsNewAddressForm
          ? { label: addrLabel, line1: addrLine1, landmark: addrLandmark, city: addrCity, pincode: addrPincode.trim() }
          : undefined,
      pickupDate: todayStr(),
      slot: currentSlotKey(),
      notes,
    });
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
    } else {
      // No success interstitial — bagging & tagging is the very next thing
      // that needs to happen, so go straight to it instead of making the
      // store find the ticket themselves.
      router.push(`/store/tickets/${result.ticket.id}`);
    }
  }

  return (
    <>
      <div className="app-page-head">
        <h1>Create Order</h1>
        <p>For walk-in or phone customers who aren't booking through the app themselves</p>
      </div>

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
            selectedCustomer ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="ticket-card-tag">
                  👤 {selectedCustomer.name} — {selectedCustomer.phone || selectedCustomer.email}
                </span>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    setCustomerId('');
                    setCustomerSearch('');
                    setDeliveryAddressId('');
                    setAddNewAddress(false);
                  }}
                >
                  Change
                </button>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Search by phone number or email"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                />
                {searchTerm &&
                  (matchingCustomers.length ? (
                    <ul style={{ listStyle: 'none', margin: '8px 0 0', padding: 0 }}>
                      {matchingCustomers.map((c) => (
                        <li key={c.id} style={{ marginBottom: 6 }}>
                          <button
                            type="button"
                            className="btn btn-outline btn-block"
                            style={{ textAlign: 'left' }}
                            onClick={() => setCustomerId(c.id)}
                          >
                            👤 {c.name} — {c.phone || c.email}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="form-hint">No customer found — switch to &quot;New customer&quot; to add them.</p>
                  ))}
              </>
            )
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
              <div className="form-field" style={{ marginBottom: 0 }}>
                <label htmlFor="new-email">Email</label>
                <input id="new-email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required />
                <p className="form-hint">No password needed now — they&apos;ll set one the first time they log in.</p>
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
          <label>Getting it back</label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <button
              type="button"
              className={`filter-chip ${deliveryMethod === 'self_pickup' ? 'active' : ''}`}
              onClick={() => setDeliveryMethod('self_pickup')}
            >
              🏬 Self pickup
            </button>
            <button
              type="button"
              className={`filter-chip ${deliveryMethod === 'delivery' ? 'active' : ''}`}
              onClick={() => setDeliveryMethod('delivery')}
            >
              🚚 Deliver to address
            </button>
          </div>

          {deliveryMethod === 'self_pickup' && (
            <p className="form-hint">Customer will come back to the store to collect it — no delivery rider needed.</p>
          )}

          {deliveryMethod === 'delivery' && (
            <div className="card-section" style={{ boxShadow: 'none', border: '1px solid rgba(11,37,69,0.12)' }}>
              {!needsNewAddressForm && (
                <>
                  <select value={deliveryAddressId} onChange={(e) => setDeliveryAddressId(e.target.value)}>
                    <option value="" disabled>
                      Choose a saved address…
                    </option>
                    {savedAddresses.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.label} — {a.line1}, {a.city} {a.pincode}
                      </option>
                    ))}
                  </select>
                  <button type="button" className="btn btn-outline btn-sm" style={{ marginTop: 8 }} onClick={() => setAddNewAddress(true)}>
                    + Add new address
                  </button>
                </>
              )}

              {needsNewAddressForm && (
                <>
                  <div className="form-field">
                    <label htmlFor="addr-line1">Flat / House no., Street, Area</label>
                    <textarea id="addr-line1" value={addrLine1} onChange={(e) => setAddrLine1(e.target.value)} required />
                  </div>
                  <div className="form-field">
                    <label htmlFor="addr-landmark">Landmark (optional)</label>
                    <input id="addr-landmark" type="text" value={addrLandmark} onChange={(e) => setAddrLandmark(e.target.value)} />
                  </div>
                  <div className="form-field">
                    <label htmlFor="addr-city">City</label>
                    <input id="addr-city" type="text" value={addrCity} onChange={(e) => setAddrCity(e.target.value)} required />
                  </div>
                  <div className="form-field">
                    <label htmlFor="addr-pincode">Pincode</label>
                    <input
                      id="addr-pincode"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={addrPincode}
                      onChange={(e) => setAddrPincode(e.target.value.replace(/\D/g, ''))}
                      required
                    />
                  </div>
                  <div className="form-field" style={{ marginBottom: 0 }}>
                    <label htmlFor="addr-label">Save as</label>
                    <select id="addr-label" value={addrLabel} onChange={(e) => setAddrLabel(e.target.value)}>
                      <option>Home</option>
                      <option>Work</option>
                      <option>Other</option>
                    </select>
                    <p className="form-hint">Saved to the customer&apos;s address book for next time.</p>
                  </div>
                  {savedAddresses.length > 0 && (
                    <button type="button" className="btn btn-outline btn-block" style={{ marginTop: 10 }} onClick={() => setAddNewAddress(false)}>
                      Cancel — pick a saved address instead
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="notes">Notes (optional)</label>
          <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Special instructions, handling notes, etc." />
        </div>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={!canSubmit || submitting}>
          {submitting ? 'Creating…' : 'Create Order & Bag It'}
        </button>
      </form>
    </>
  );
}
