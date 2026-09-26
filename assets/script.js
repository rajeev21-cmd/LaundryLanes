// ===== Mobile nav toggle =====
document.getElementById('nav-toggle')?.addEventListener('click', () => {
  document.getElementById('main-nav').classList.toggle('open');
});

// ===== PLACEHOLDER store data =====
// TODO(open-question): replace with real Laundrylanes store addresses & coordinates.
// See OPEN_QUESTIONS.md — "Store locations".
const STORES = [
  { name: 'Laundrylanes — Koramangala', address: '5th Block, Koramangala, Bengaluru', lat: 12.9352, lng: 77.6245 },
  { name: 'Laundrylanes — Indiranagar', address: '100 Feet Road, Indiranagar, Bengaluru', lat: 12.9719, lng: 77.6412 },
  { name: 'Laundrylanes — HSR Layout', address: 'Sector 2, HSR Layout, Bengaluru', lat: 12.9116, lng: 77.6389 },
  { name: 'Laundrylanes — Whitefield', address: 'ITPL Main Road, Whitefield, Bengaluru', lat: 12.9698, lng: 77.7500 },
  { name: 'Laundrylanes — Jayanagar', address: '4th Block, Jayanagar, Bengaluru', lat: 12.9299, lng: 77.5823 },
];

function haversineDistanceKm(lat1, lng1, lat2, lng2) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

let map, markers = [];

function initMap() {
  map = L.map('map', { scrollWheelZoom: false }).setView([12.9716, 77.5946], 11);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 18,
  }).addTo(map);

  markers = STORES.map((store) => {
    const marker = L.marker([store.lat, store.lng]).addTo(map);
    marker.bindPopup(`<b>${store.name}</b><br>${store.address}`);
    marker.store = store;
    return marker;
  });
}

function renderStoreList(stores, userLoc) {
  const list = document.getElementById('store-list');
  list.innerHTML = '';
  stores.forEach((store) => {
    const card = document.createElement('div');
    card.className = 'store-card';
    let distanceHtml = '';
    if (userLoc) {
      const d = haversineDistanceKm(userLoc.lat, userLoc.lng, store.lat, store.lng);
      distanceHtml = `<span class="store-distance">${d.toFixed(1)} km away</span>`;
    }
    card.innerHTML = `<h4>${store.name}</h4><p>${store.address}</p>${distanceHtml}`;
    card.addEventListener('click', () => {
      document.querySelectorAll('.store-card').forEach((c) => c.classList.remove('active'));
      card.classList.add('active');
      map.setView([store.lat, store.lng], 14);
      markers.find((m) => m.store === store)?.openPopup();
    });
    list.appendChild(card);
  });
}

document.getElementById('locator-geolocate')?.addEventListener('click', () => {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by your browser.');
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const userLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      const sorted = [...STORES].sort(
        (a, b) =>
          haversineDistanceKm(userLoc.lat, userLoc.lng, a.lat, a.lng) -
          haversineDistanceKm(userLoc.lat, userLoc.lng, b.lat, b.lng)
      );
      renderStoreList(sorted, userLoc);
      map.setView([userLoc.lat, userLoc.lng], 13);
      L.marker([userLoc.lat, userLoc.lng], {
        icon: L.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          iconSize: [25, 41],
        }),
      })
        .addTo(map)
        .bindPopup('You are here')
        .openPopup();
    },
    () => alert('Unable to retrieve your location. Please allow location access and try again.')
  );
});

document.getElementById('locator-search')?.addEventListener('input', (e) => {
  const q = e.target.value.trim().toLowerCase();
  const filtered = STORES.filter(
    (s) => s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q)
  );
  renderStoreList(filtered);
});

window.addEventListener('DOMContentLoaded', () => {
  initMap();
  renderStoreList(STORES);
});
