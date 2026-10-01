'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/AppProvider';
import { SLOT_LABELS } from '@/lib/constants';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function formatAddress(address) {
  return `${address.line1}${address.landmark ? `, near ${address.landmark}` : ''}, ${address.city} - ${address.pincode}`;
}

// Shared by both the pickup and delivery address fields below — same
// pick-a-saved-one-or-add-a-new-one shape either way, just with an optional
// serviceability hint that only makes sense for pickup (delivery never
// drives store assignment, the store's already fixed by then).
function AddressPicker({ myAddresses, selectedId, onSelect, showServiceabilityHint }) {
  const { stores, currentUser, addAddress } = useApp();
  const [showAddForm, setShowAddForm] = useState(myAddresses.length === 0);
  const [label, setLabel] = useState('Home');
  const [pincode, setPincode] = useState('');
  const [line1, setLine1] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [saving, setSaving] = useState(false);

  const pincodeReady = pincode.trim().length === 6;
  const matchedStore = pincodeReady ? stores.find((s) => s.pincode === pincode.trim()) : null;

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    const address = await addAddress({ customerId: currentUser.id, label, line1, landmark, city, pincode: pincode.trim() });
    setSaving(false);
    onSelect(address.id);
    setShowAddForm(false);
    setLine1('');
    setLandmark('');
    setPincode('');
  }

  if (!showAddForm) {
    return (
      <>
        <select value={selectedId} onChange={(e) => onSelect(e.target.value)}>
          <option value="" disabled>
            Choose a saved address…
          </option>
          {myAddresses.map((a) => (
            <option key={a.id} value={a.id}>
              {a.label} — {a.line1}, {a.city} {a.pincode}
            </option>
          ))}
        </select>
        <button type="button" className="btn btn-outline btn-sm" style={{ marginTop: 8 }} onClick={() => setShowAddForm(true)}>
          + Add new address
        </button>
      </>
    );
  }

  return (
    <div className="card-section" style={{ marginTop: 8, boxShadow: 'none', border: '1px solid rgba(11,37,69,0.12)' }}>
      <div className="form-field">
        <label>Pincode</label>
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="e.g. 560034"
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
          required
        />
        {showServiceabilityHint && pincodeReady && (
          <p className="form-hint" style={{ color: matchedStore ? '#21793A' : '#9A5B12' }}>
            {matchedStore
              ? `✅ We service this area (${matchedStore.name}).`
              : "⚠️ No store here yet — we'll still save this address and arrange pickup manually."}
          </p>
        )}
      </div>
      <div className="form-field">
        <label>Flat / House no., Street, Area</label>
        <textarea value={line1} onChange={(e) => setLine1(e.target.value)} required />
      </div>
      <div className="form-field">
        <label>Landmark (optional)</label>
        <input type="text" value={landmark} onChange={(e) => setLandmark(e.target.value)} />
      </div>
      <div className="form-field">
        <label>City</label>
        <input type="text" value={city} onChange={(e) => setCity(e.target.value)} required />
      </div>
      <div className="form-field" style={{ marginBottom: 0 }}>
        <label>Save as</label>
        <select value={label} onChange={(e) => setLabel(e.target.value)}>
          <option>Home</option>
          <option>Work</option>
          <option>Other</option>
        </select>
      </div>
      <button
        type="button"
        className="btn btn-primary btn-block"
        style={{ marginTop: 10 }}
        disabled={saving || !line1.trim() || !pincode.trim()}
        onClick={handleSave}
      >
        {saving ? 'Saving…' : 'Save Address'}
      </button>
      {myAddresses.length > 0 && (
        <button type="button" className="btn btn-outline btn-block" style={{ marginTop: 8 }} onClick={() => setShowAddForm(false)}>
          Cancel
        </button>
      )}
    </div>
  );
}

export default function BookPickupPage() {
  const { services, stores, currentUser, addresses, bookPickup } = useApp();
  const myAddresses = addresses.filter((a) => a.customerId === currentUser.id);

  const [serviceId, setServiceId] = useState(services[0].id);
  const [pickupDate, setPickupDate] = useState(todayStr());
  const [slot, setSlot] = useState(Object.keys(SLOT_LABELS)[0]);
  const [notes, setNotes] = useState('');
  const [createdOrder, setCreatedOrder] = useState(null);

  const [pickupMethod, setPickupMethod] = useState('pickup');
  const [dropoffStoreId, setDropoffStoreId] = useState('');
  const [pickupAddressId, setPickupAddressId] = useState('');

  const [deliveryMethod, setDeliveryMethod] = useState('delivery');
  const [deliveryAddressId, setDeliveryAddressId] = useState('');

  const pickupReady = pickupMethod === 'self_dropoff' ? !!dropoffStoreId : !!pickupAddressId;
  const deliveryReady = deliveryMethod === 'self_pickup' ? true : !!deliveryAddressId;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!pickupReady || !deliveryReady) return;
    const pickupAddr = pickupMethod === 'pickup' ? myAddresses.find((a) => a.id === pickupAddressId) : null;
    const deliveryAddr = deliveryMethod === 'delivery' ? myAddresses.find((a) => a.id === deliveryAddressId) : null;

    const order = await bookPickup({
      customerId: currentUser.id,
      serviceId,
      pickupMethod,
      storeId: pickupMethod === 'self_dropoff' ? dropoffStoreId : undefined,
      pickupAddress: pickupAddr ? formatAddress(pickupAddr) : undefined,
      pincode: pickupAddr ? pickupAddr.pincode : undefined,
      deliveryMethod,
      deliveryAddress: deliveryAddr ? formatAddress(deliveryAddr) : undefined,
      pickupDate,
      slot,
      notes,
    });
    setCreatedOrder(order);
  }

  if (createdOrder) {
    const assignedStore = stores.find((s) => s.id === createdOrder.storeId);
    return (
      <>
        <div className="app-page-head">
          <h1>Booked! 🎉</h1>
        </div>
        <div className="form-success">
          Your order is booked for <strong>{createdOrder.pickupDate}</strong> ({SLOT_LABELS[createdOrder.slot]}).
          <br />
          {pickupMethod === 'self_dropoff'
            ? `Drop it off at ${assignedStore?.name || 'the store you chose'} — `
            : assignedStore
              ? "It's been assigned to your nearest store — "
              : "It's in the queue, our team will assign a store shortly — "}
          {deliveryMethod === 'self_pickup' ? "you'll collect it in person once it's ready." : "it'll be delivered back to your address."}
        </div>
        <div className="card-section" style={{ marginTop: 16 }}>
          <Link href="/customer/tickets" className="btn btn-primary btn-block">
            View My Tickets
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="app-page-head">
        <h1>Book a Pickup</h1>
        <p>Tell us what you need and when.</p>
      </div>

      <form onSubmit={handleSubmit} className="card-section">
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
          <label>Getting it to us</label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <button
              type="button"
              className={`filter-chip ${pickupMethod === 'pickup' ? 'active' : ''}`}
              onClick={() => setPickupMethod('pickup')}
            >
              🚚 Pick up from my address
            </button>
            <button
              type="button"
              className={`filter-chip ${pickupMethod === 'self_dropoff' ? 'active' : ''}`}
              onClick={() => setPickupMethod('self_dropoff')}
            >
              🏬 I&apos;ll drop off myself
            </button>
          </div>

          {pickupMethod === 'pickup' ? (
            <AddressPicker myAddresses={myAddresses} selectedId={pickupAddressId} onSelect={setPickupAddressId} showServiceabilityHint />
          ) : (
            <select value={dropoffStoreId} onChange={(e) => setDropoffStoreId(e.target.value)}>
              <option value="" disabled>
                Which store will you visit?
              </option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="form-field">
          <label>Getting it back</label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <button
              type="button"
              className={`filter-chip ${deliveryMethod === 'delivery' ? 'active' : ''}`}
              onClick={() => setDeliveryMethod('delivery')}
            >
              🚚 Deliver to my address
            </button>
            <button
              type="button"
              className={`filter-chip ${deliveryMethod === 'self_pickup' ? 'active' : ''}`}
              onClick={() => setDeliveryMethod('self_pickup')}
            >
              🏬 I&apos;ll pick it up myself
            </button>
          </div>

          {deliveryMethod === 'delivery' ? (
            <AddressPicker myAddresses={myAddresses} selectedId={deliveryAddressId} onSelect={setDeliveryAddressId} />
          ) : (
            <p className="form-hint">You&apos;ll collect it from the store once it&apos;s ready — no delivery needed.</p>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="date">{pickupMethod === 'self_dropoff' ? 'Drop-off date' : 'Pickup date'}</label>
          <input
            id="date"
            type="date"
            min={todayStr()}
            value={pickupDate}
            onChange={(e) => setPickupDate(e.target.value)}
            required
          />
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
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Gate code, special instructions, etc."
          />
        </div>

        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={!pickupReady || !deliveryReady}>
          Confirm {pickupMethod === 'self_dropoff' ? 'Order' : 'Pickup'}
        </button>
      </form>
    </>
  );
}
