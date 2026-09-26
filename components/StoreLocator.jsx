'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { useApp } from '@/lib/AppProvider';
import { haversineDistanceKm } from '@/lib/haversine';

export default function StoreLocator() {
  const { stores } = useApp();
  const [leafletReady, setLeafletReady] = useState(false);
  const [query, setQuery] = useState('');
  const [userLoc, setUserLoc] = useState(null);
  const mapDivRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.L) setLeafletReady(true);
  }, []);

  // Init map once Leaflet + stores are ready.
  useEffect(() => {
    if (!leafletReady || !mapDivRef.current || mapRef.current) return;
    const L = window.L;
    const map = L.map(mapDivRef.current, { scrollWheelZoom: false }).setView([12.9716, 77.5946], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);
    mapRef.current = map;
    markersRef.current = stores.map((store) => {
      const marker = L.marker([store.lat, store.lng]).addTo(map);
      marker.bindPopup(`<b>${store.name}</b><br>${store.address}`);
      marker.storeId = store.id;
      return marker;
    });
  }, [leafletReady, stores]);

  function focusStore(store) {
    const map = mapRef.current;
    if (!map) return;
    map.setView([store.lat, store.lng], 14);
    markersRef.current.find((m) => m.storeId === store.id)?.openPopup();
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLoc(loc);
        const map = mapRef.current;
        const L = window.L;
        if (map && L) {
          map.setView([loc.lat, loc.lng], 13);
          if (userMarkerRef.current) userMarkerRef.current.remove();
          userMarkerRef.current = L.marker([loc.lat, loc.lng]).addTo(map).bindPopup('You are here').openPopup();
        }
      },
      () => alert('Unable to retrieve your location. Please allow location access and try again.')
    );
  }

  const filtered = stores
    .filter(
      (s) => s.name.toLowerCase().includes(query.toLowerCase()) || s.address.toLowerCase().includes(query.toLowerCase())
    )
    .map((s) => ({ ...s, distance: userLoc ? haversineDistanceKm(userLoc.lat, userLoc.lng, s.lat, s.lng) : null }))
    .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));

  return (
    <>
      <Script
        src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        strategy="afterInteractive"
        onLoad={() => setLeafletReady(true)}
      />
      <div className="locator-controls">
        <input
          type="text"
          placeholder="Search by area or store name…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btn btn-outline" onClick={useMyLocation}>
          📍 Use My Location
        </button>
      </div>
      <div className="locator-layout">
        <div className="store-list">
          {filtered.map((store) => (
            <div key={store.id} className="store-card" onClick={() => focusStore(store)}>
              <h4>{store.name}</h4>
              <p>{store.address}</p>
              {store.distance != null && <span className="store-distance">{store.distance.toFixed(1)} km away</span>}
            </div>
          ))}
        </div>
        <div ref={mapDivRef} className="store-map" />
      </div>
    </>
  );
}
