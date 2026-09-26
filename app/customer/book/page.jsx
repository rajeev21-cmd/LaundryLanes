'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/AppProvider';
import { SLOT_LABELS } from '@/lib/constants';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function BookPickupPage() {
  const { services, currentUser, bookPickup } = useApp();
  const [serviceId, setServiceId] = useState(services[0].id);
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupDate, setPickupDate] = useState(todayStr());
  const [slot, setSlot] = useState('morning');
  const [notes, setNotes] = useState('');
  const [createdOrder, setCreatedOrder] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    const order = await bookPickup({
      customerId: currentUser.id,
      serviceId,
      pickupAddress,
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
          It&apos;s in the open queue now — a nearby store will claim it shortly.
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
        <p>Tell us what you need and when — any nearby store can pick it up.</p>
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
          <label htmlFor="address">Pickup address</label>
          <textarea
            id="address"
            value={pickupAddress}
            onChange={(e) => setPickupAddress(e.target.value)}
            placeholder="Flat / street / area / city"
            required
          />
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

        <button type="submit" className="btn btn-primary btn-block btn-lg">
          Confirm Pickup
        </button>
      </form>
    </>
  );
}
