'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/AppProvider';
import { SLOT_LABELS } from '@/lib/constants';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function BookPickupPage() {
  const { services, stores, currentUser, addresses, bookPickup, addAddress } = useApp();
  const myAddresses = addresses.filter((a) => a.customerId === currentUser.id);

  const [serviceId, setServiceId] = useState(services[0].id);
  const [pickupDate, setPickupDate] = useState(todayStr());
  const [slot, setSlot] = useState(Object.keys(SLOT_LABELS)[0]);
  const [notes, setNotes] = useState('');
  const [createdOrder, setCreatedOrder] = useState(null);

  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [showAddForm, setShowAddForm] = useState(myAddresses.length === 0);
  const [newLabel, setNewLabel] = useState('Home');
  const [newPincode, setNewPincode] = useState('');
  const [newLine1, setNewLine1] = useState('');
  const [newLandmark, setNewLandmark] = useState('');
  const [newCity, setNewCity] = useState('Bengaluru');
  const [savingAddress, setSavingAddress] = useState(false);

  const pincodeReady = newPincode.trim().length === 6;
  const matchedStore = pincodeReady ? stores.find((s) => s.pincode === newPincode.trim()) : null;

  async function handleSaveAddress(e) {
    e.preventDefault();
    setSavingAddress(true);
    const address = await addAddress({
      customerId: currentUser.id,
      label: newLabel,
      line1: newLine1,
      landmark: newLandmark,
      city: newCity,
      pincode: newPincode.trim(),
    });
    setSavingAddress(false);
    setSelectedAddressId(address.id);
    setShowAddForm(false);
    setNewLine1('');
    setNewLandmark('');
    setNewPincode('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const address = myAddresses.find((a) => a.id === selectedAddressId);
    if (!address) return;
    const pickupAddress = `${address.line1}${address.landmark ? `, near ${address.landmark}` : ''}, ${address.city} - ${address.pincode}`;
    const order = await bookPickup({
      customerId: currentUser.id,
      serviceId,
      pickupAddress,
      pincode: address.pincode,
      pickupDate,
      slot,
      notes,
    });
    setCreatedOrder(order);
  }

  if (createdOrder) {
    return (
      <>
        <div className="app-page-head">
          <h1>Booked! 🎉</h1>
        </div>
        <div className="form-success">
          Your pickup is booked for <strong>{createdOrder.pickupDate}</strong> ({SLOT_LABELS[createdOrder.slot]}).
          <br />
          {createdOrder.storeId
            ? "It's been assigned to your nearest store."
            : "It's in the queue — our team will assign a store shortly."}
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
          <label>Pickup address</label>

          {!showAddForm && (
            <>
              <select value={selectedAddressId} onChange={(e) => setSelectedAddressId(e.target.value)}>
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
          )}

          {showAddForm && (
            <div className="card-section" style={{ marginTop: 8, boxShadow: 'none', border: '1px solid rgba(11,37,69,0.12)' }}>
              <div className="form-field">
                <label htmlFor="pincode">Pincode</label>
                <input
                  id="pincode"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="e.g. 560034"
                  value={newPincode}
                  onChange={(e) => setNewPincode(e.target.value.replace(/\D/g, ''))}
                  required
                />
                {pincodeReady && (
                  <p className="form-hint" style={{ color: matchedStore ? '#21793A' : '#9A5B12' }}>
                    {matchedStore
                      ? `✅ We service this area (${matchedStore.name}).`
                      : "⚠️ No store here yet — we'll still save this address and arrange pickup manually."}
                  </p>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="line1">Flat / House no., Street, Area</label>
                <textarea id="line1" value={newLine1} onChange={(e) => setNewLine1(e.target.value)} required />
              </div>

              <div className="form-field">
                <label htmlFor="landmark">Landmark (optional)</label>
                <input id="landmark" type="text" value={newLandmark} onChange={(e) => setNewLandmark(e.target.value)} />
              </div>

              <div className="form-field">
                <label htmlFor="city">City</label>
                <input id="city" type="text" value={newCity} onChange={(e) => setNewCity(e.target.value)} required />
              </div>

              <div className="form-field">
                <label htmlFor="label">Save as</label>
                <select id="label" value={newLabel} onChange={(e) => setNewLabel(e.target.value)}>
                  <option>Home</option>
                  <option>Work</option>
                  <option>Other</option>
                </select>
              </div>

              <button type="button" className="btn btn-primary btn-block" disabled={savingAddress} onClick={handleSaveAddress}>
                {savingAddress ? 'Saving…' : 'Save Address'}
              </button>
              {myAddresses.length > 0 && (
                <button type="button" className="btn btn-outline btn-block" style={{ marginTop: 8 }} onClick={() => setShowAddForm(false)}>
                  Cancel
                </button>
              )}
            </div>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="date">Pickup date</label>
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

        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={!selectedAddressId || showAddForm}>
          Confirm Pickup
        </button>
      </form>
    </>
  );
}
