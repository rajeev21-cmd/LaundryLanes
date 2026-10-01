'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/AppProvider';
import { SLOT_LABELS, STATUS_DRIVER, CLOTH_CATEGORIES, calcOrderValue } from '@/lib/constants';
import StatusBadge from '@/components/StatusBadge';
import TicketTimeline from '@/components/TicketTimeline';
import TicketHistory from '@/components/TicketHistory';
import StarRating from '@/components/StarRating';
import ScanInput from '@/components/ScanInput';

export default function TicketDetail({ ticketId }) {
  const app = useApp();
  const {
    tickets,
    services,
    users,
    stores,
    currentUser,
    getBagForTicket,
    getClothesForTicket,
    cancelTicket,
    assignStoreToTicket,
    acceptOrder,
    assignRiderForPickup,
    riderCollect,
    scanBag,
    addCloth,
    finishPickup,
    markArrivedAtStore,
    startWashing,
    startIroning,
    markPacked,
    assignRiderForDelivery,
    startDelivery,
    markDelivered,
    rateTicket,
  } = app;
  const router = useRouter();
  const [clothLabel, setClothLabel] = useState('');
  const [clothCategory, setClothCategory] = useState(CLOTH_CATEGORIES[0]);
  const [riderRatingPick, setRiderRatingPick] = useState(0);
  const [serviceRatingPick, setServiceRatingPick] = useState(0);
  const [tagIdInput, setTagIdInput] = useState('');
  const [clothError, setClothError] = useState('');
  const [bagIdInput, setBagIdInput] = useState('');
  const [bagError, setBagError] = useState('');

  const ticket = tickets.find((t) => t.id === ticketId);
  if (!ticket) {
    return <div className="empty-state">Ticket not found.</div>;
  }

  const isCustomer = currentUser.role === 'customer';
  const service = services.find((s) => s.id === ticket.serviceId);
  const customer = users.find((u) => u.id === ticket.customerId);
  const store = stores.find((s) => s.id === ticket.storeId);
  const rider = users.find((u) => u.id === ticket.assignedRiderId);
  const bag = getBagForTicket(ticket.id);
  const ticketClothes = getClothesForTicket(ticket.id);
  const storeRiders = users.filter((u) => u.role === 'rider' && u.storeId === ticket.storeId);
  const isMyTicketAsRider = currentUser.role === 'rider' && ticket.assignedRiderId === currentUser.id;
  const isMyTicketAsStore = currentUser.role === 'store' && ticket.storeId === currentUser.storeId;

  const categoryCounts = ticketClothes.reduce((acc, c) => {
    const key = c.category || 'Other';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  async function handleAddCloth(e) {
    e.preventDefault();
    if (!clothLabel.trim() || !tagIdInput.trim()) return;
    const result = await addCloth(ticket.id, clothLabel.trim(), clothCategory, tagIdInput.trim());
    if (result.error) {
      setClothError(result.error);
    } else {
      setClothError('');
      setClothLabel('');
      setTagIdInput('');
    }
  }

  async function handleScanBag() {
    const result = await scanBag(ticket.id, bagIdInput.trim());
    if (result.error) {
      setBagError(result.error);
    } else {
      setBagError('');
      setBagIdInput('');
    }
  }

  const clothForm = (
    <form onSubmit={handleAddCloth} style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
        <input
          type="text"
          placeholder="e.g. Blue Shirt"
          value={clothLabel}
          onChange={(e) => setClothLabel(e.target.value)}
          style={{ flex: '1 1 140px' }}
        />
        <select value={clothCategory} onChange={(e) => setClothCategory(e.target.value)} style={{ flex: '0 0 110px' }}>
          {CLOTH_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <ScanInput value={tagIdInput} onChange={setTagIdInput} placeholder="Tag id, e.g. TAG-00001" />
      {clothError && <p className="form-error">{clothError}</p>}
      <button
        type="submit"
        className="btn btn-outline btn-block"
        style={{ marginTop: 8 }}
        disabled={!clothLabel.trim() || !tagIdInput.trim()}
      >
        Scan
      </button>
    </form>
  );

  return (
    <>
      <button className="btn btn-outline btn-sm" onClick={() => router.back()} style={{ marginBottom: 14 }}>
        ← Back
      </button>

      <div className="card-section">
        <div className="ticket-card-top">
          <div>
            <div className="ticket-card-service">
              {service?.name || ticket.serviceId} <span className="ticket-card-id">#{ticket.id.replace('tk-', '')}</span>
            </div>
            <div className="ticket-card-meta">
              {ticket.pickupDate} · {SLOT_LABELS[ticket.slot] || ticket.slot}
            </div>
          </div>
          <StatusBadge status={ticket.status} simplified={isCustomer} />
        </div>
        <div className="ticket-card-address">📍 {ticket.pickupAddress}</div>
        <div className="ticket-card-tags">
          {customer && <span className="ticket-card-tag">👤 {customer.name}</span>}
          {store ? (
            <span className="ticket-card-tag">🏬 {store.name}</span>
          ) : (
            ticket.status !== 'cancelled' && <span className="ticket-card-tag unclaimed">🏬 Unclaimed</span>
          )}
          {rider && <span className="ticket-card-tag">🚚 {rider.name}</span>}
        </div>
        {!isCustomer && ticket.status !== 'cancelled' && (
          <p className="form-hint" style={{ marginTop: 10 }}>{STATUS_DRIVER[ticket.status]}</p>
        )}
      </div>

      <div className="card-section">
        <h3>Timeline</h3>
        <TicketTimeline status={ticket.status} simplified={isCustomer} />
      </div>

      {ticketClothes.length > 0 && ticket.status !== 'cancelled' && (
        <div className="card-section">
          <h3>Items</h3>
          {!isCustomer && (
            <p className="form-hint" style={{ marginBottom: 10 }}>
              📦 Bag {bag ? <strong>{bag.id}</strong> : '—'}
            </p>
          )}
          <div className="ticket-card-tags" style={{ marginBottom: 10 }}>
            {Object.entries(categoryCounts).map(([category, count]) => (
              <span key={category} className="ticket-card-tag">
                {category} ×{count}
              </span>
            ))}
          </div>
          <p className="form-hint" style={{ marginBottom: !isCustomer ? 10 : 0 }}>
            Order value: <strong style={{ color: 'var(--navy)' }}>₹{calcOrderValue(ticketClothes)}</strong>
          </p>
          {!isCustomer && (
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13 }}>
              {ticketClothes.map((c) => (
                <li key={c.id}>
                  {c.label} <span style={{ color: 'var(--text-muted)' }}>({c.tag})</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {isCustomer && ticket.status === 'delivered' && (
        <div className="card-section">
          <h3>Rate this order</h3>
          {ticket.ratedAt ? (
            <>
              <p className="form-hint" style={{ marginBottom: 6 }}>Rider — {rider?.name}</p>
              <StarRating value={ticket.riderRating} />
              <p className="form-hint" style={{ marginTop: 14, marginBottom: 6 }}>Overall service</p>
              <StarRating value={ticket.serviceRating} />
            </>
          ) : (
            <>
              <p className="form-hint" style={{ marginBottom: 6 }}>Rider — {rider?.name}</p>
              <StarRating value={riderRatingPick} onChange={setRiderRatingPick} size={26} />
              <p className="form-hint" style={{ marginTop: 14, marginBottom: 6 }}>Overall service</p>
              <StarRating value={serviceRatingPick} onChange={setServiceRatingPick} size={26} />
              <button
                className="btn btn-primary btn-block"
                style={{ marginTop: 16 }}
                disabled={!riderRatingPick || !serviceRatingPick}
                onClick={() => rateTicket(ticket.id, riderRatingPick, serviceRatingPick)}
              >
                Submit Rating
              </button>
            </>
          )}
        </div>
      )}

      {(currentUser.role === 'owner' || currentUser.role === 'store') && (
        <div className="card-section">
          <h3>History</h3>
          <TicketHistory history={ticket.history} />
        </div>
      )}

      {/* ---- Role-specific actions ---- */}

      {isCustomer && ticket.status === 'pickup_scheduled' && (
        <div className="card-section">
          <button className="btn btn-outline btn-block" onClick={() => cancelTicket(ticket.id)}>
            Cancel this pickup
          </button>
        </div>
      )}

      {currentUser.role === 'owner' && !ticket.storeId && ticket.status !== 'cancelled' && (
        <div className="card-section">
          <h3>Assign to a store</h3>
          <p className="form-hint" style={{ marginBottom: 10 }}>
            No store's pincode matched this pickup — assign one manually.
          </p>
          <select defaultValue="" onChange={(e) => e.target.value && assignStoreToTicket(ticket.id, e.target.value)}>
            <option value="" disabled>
              Choose a store…
            </option>
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {currentUser.role === 'store' && (
        <>
          {!ticket.storeId && ticket.status !== 'cancelled' && (
            <div className="empty-state">Awaiting admin to assign this ticket to a store.</div>
          )}

          {ticket.storeId && !isMyTicketAsStore && (
            <div className="empty-state">This ticket belongs to a different store.</div>
          )}

          {isMyTicketAsStore && (
            <>
              {ticket.status === 'pickup_scheduled' && !ticket.storeAcceptedAt && (
                <div className="card-section">
                  <h3>New order</h3>
                  <p className="form-hint" style={{ marginBottom: 10 }}>
                    Review this pickup request and accept it before assigning a rider.
                  </p>
                  <button className="btn btn-primary btn-block" onClick={() => acceptOrder(ticket.id)}>
                    ✅ Accept Order
                  </button>
                </div>
              )}
              {ticket.status === 'pickup_scheduled' && ticket.storeAcceptedAt && (
                <div className="card-section">
                  <h3>Assign a rider for pickup</h3>
                  <select defaultValue="" onChange={(e) => e.target.value && assignRiderForPickup(ticket.id, e.target.value)}>
                    <option value="" disabled>
                      Choose a rider…
                    </option>
                    {storeRiders.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {ticket.status === 'picked_up' && (
                <div className="card-section">
                  <button className="btn btn-primary btn-block" onClick={() => markArrivedAtStore(ticket.id)}>
                    Mark Arrived at Store
                  </button>
                </div>
              )}
              {ticket.status === 'arrived_at_store' && (
                <div className="card-section">
                  <h3>Verify / add items</h3>
                  {clothForm}
                  <button className="btn btn-primary btn-block" onClick={() => startWashing(ticket.id)}>
                    Start Washing
                  </button>
                </div>
              )}
              {ticket.status === 'washing' && (
                <div className="card-section">
                  <button className="btn btn-primary btn-block" onClick={() => startIroning(ticket.id)}>
                    Start Ironing
                  </button>
                </div>
              )}
              {ticket.status === 'ironing' && (
                <div className="card-section">
                  <button className="btn btn-primary btn-block" onClick={() => markPacked(ticket.id)}>
                    Mark Packed
                  </button>
                </div>
              )}
              {ticket.status === 'packed' && (
                <div className="card-section">
                  <h3>Assign a rider for delivery</h3>
                  <select defaultValue="" onChange={(e) => e.target.value && assignRiderForDelivery(ticket.id, e.target.value)}>
                    <option value="" disabled>
                      Choose a rider…
                    </option>
                    {storeRiders.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}
        </>
      )}

      {currentUser.role === 'rider' && (
        <>
          {!isMyTicketAsRider && ticket.assignedRiderId && (
            <div className="empty-state">This ticket is assigned to another rider.</div>
          )}

          {isMyTicketAsRider && ticket.status === 'pickup_request_accepted' && (
            <div className="card-section">
              <button className="btn btn-primary btn-block" onClick={() => riderCollect(ticket.id)}>
                🚗 Collect Ticket
              </button>
            </div>
          )}

          {isMyTicketAsRider && ticket.status === 'driver_arriving_for_pickup' && (
            <div className="card-section">
              <h3>Scan the bag</h3>
              <ScanInput value={bagIdInput} onChange={setBagIdInput} placeholder="Bag id, e.g. BAG-0001" />
              {bagError && <p className="form-error">{bagError}</p>}
              <button
                className="btn btn-primary btn-block"
                style={{ marginTop: 10 }}
                disabled={!bagIdInput.trim()}
                onClick={handleScanBag}
              >
                📦 Confirm Bag
              </button>
            </div>
          )}

          {isMyTicketAsRider && ticket.status === 'pickup_in_progress' && (
            <div className="card-section">
              <h3>Tag &amp; scan each item</h3>
              {clothForm}
              <button
                className="btn btn-primary btn-block"
                disabled={ticketClothes.length === 0}
                onClick={() => finishPickup(ticket.id)}
              >
                ✅ Finish Pickup ({ticketClothes.length} item{ticketClothes.length === 1 ? '' : 's'})
              </button>
            </div>
          )}

          {isMyTicketAsRider && ticket.status === 'ready_for_delivery' && (
            <div className="card-section">
              <button className="btn btn-primary btn-block" onClick={() => startDelivery(ticket.id)}>
                🚚 Start Delivery
              </button>
            </div>
          )}

          {isMyTicketAsRider && ticket.status === 'out_for_delivery' && (
            <div className="card-section">
              <button className="btn btn-primary btn-block" onClick={() => markDelivered(ticket.id)}>
                📬 Mark Delivered
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
