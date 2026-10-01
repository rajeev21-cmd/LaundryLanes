'use client';

export default function AddressModal({ ticket, onClose }) {
  if (!ticket) return null;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ticket.pickupAddress)}`;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3>📍 Pickup Address</h3>
        <p className="modal-address">{ticket.pickupAddress}</p>
        {ticket.pincode && <p className="form-hint">Pincode: {ticket.pincode}</p>}
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-block">
          🗺️ Open in Maps
        </a>
        <button className="btn btn-outline btn-block" style={{ marginTop: 8 }} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
