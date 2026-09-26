'use client';

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import USERS from '@/data/users.json';
import STORES from '@/data/stores.json';
import SERVICES from '@/data/services.json';
import TICKETS_SEED from '@/data/tickets.json';
import BAGS_SEED from '@/data/bags.json';
import CLOTHES_SEED from '@/data/clothes.json';
import { nearestStore } from '@/lib/haversine';
import { STATUS_ORDER, STATUS_LABELS } from '@/lib/constants';

const STORAGE_KEY = 'laundrylanes-poc-v3';

function offsetToDateStr(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

function seedHistoryFor(ticket) {
  const baseDate = offsetToDateStr(ticket.dayOffset);
  if (ticket.status === 'cancelled') {
    return [
      { at: `${baseDate}T09:00:00.000Z`, status: 'pickup_scheduled', byUserId: null, byName: 'Seed data', byRole: null, note: 'Ticket created' },
      { at: `${baseDate}T09:05:00.000Z`, status: 'cancelled', byUserId: null, byName: 'Seed data', byRole: null, note: 'Cancelled' },
    ];
  }
  const idx = STATUS_ORDER.indexOf(ticket.status);
  return STATUS_ORDER.slice(0, idx + 1).map((status, i) => ({
    at: `${baseDate}T${String(8 + i).padStart(2, '0')}:00:00.000Z`,
    status,
    byUserId: null,
    byName: 'Seed data',
    byRole: null,
    note: STATUS_LABELS[status],
  }));
}

function buildSeedTickets() {
  return TICKETS_SEED.map((t) => {
    const withDate = { ...t, pickupDate: offsetToDateStr(t.dayOffset) };
    return { ...withDate, history: seedHistoryFor(withDate) };
  });
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

let idCounter = 0;
function nextId(prefix) {
  idCounter += 1;
  return `${prefix}-${Date.now()}-${idCounter}`;
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [tickets, setTickets] = useState([]);
  const [bags, setBags] = useState([]);
  const [clothes, setClothes] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setTickets(parsed.tickets || buildSeedTickets());
        setBags(parsed.bags || BAGS_SEED);
        setClothes(parsed.clothes || CLOTHES_SEED);
        setCurrentUserId(parsed.currentUserId || null);
      } else {
        setTickets(buildSeedTickets());
        setBags(BAGS_SEED);
        setClothes(CLOTHES_SEED);
      }
    } catch {
      setTickets(buildSeedTickets());
      setBags(BAGS_SEED);
      setClothes(CLOTHES_SEED);
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ tickets, bags, clothes, currentUserId }));
  }, [tickets, bags, clothes, currentUserId, isHydrated]);

  const currentUser = useMemo(() => USERS.find((u) => u.id === currentUserId) || null, [currentUserId]);

  const login = useCallback((email, password) => {
    const match = USERS.find(
      (u) => u.email.toLowerCase() === String(email).toLowerCase() && u.password === password
    );
    if (match) setCurrentUserId(match.id);
    return match || null;
  }, []);

  const loginAsRole = useCallback((role) => {
    const match = USERS.find((u) => u.role === role);
    if (match) setCurrentUserId(match.id);
    return match || null;
  }, []);

  const logout = useCallback(() => setCurrentUserId(null), []);

  const resetDemoData = useCallback(() => {
    setTickets(buildSeedTickets());
    setBags(BAGS_SEED);
    setClothes(CLOTHES_SEED);
  }, []);

  // Applies `patch` to a ticket and appends a history entry recording what changed,
  // who did it, and any human-readable note — this is the single place every
  // ticket mutation goes through, so the history log can never fall out of sync.
  const logAndPatch = useCallback(
    (ticketId, patch, note) => {
      setTickets((prev) =>
        prev.map((t) => {
          if (t.id !== ticketId) return t;
          const merged = { ...t, ...patch };
          const entry = {
            at: new Date().toISOString(),
            status: merged.status,
            byUserId: currentUser?.id || null,
            byName: currentUser?.name || 'System',
            byRole: currentUser?.role || null,
            note,
          };
          merged.history = [...(t.history || []), entry];
          return merged;
        })
      );
    },
    [currentUser]
  );

  // ---- Customer ----

  const bookPickup = useCallback(
    ({ customerId, serviceId, pickupAddress, lat, lng, pickupDate, slot, notes }) => {
      const store = lat != null && lng != null ? nearestStore(STORES, lat, lng) : STORES[0];
      const customer = USERS.find((u) => u.id === customerId);
      const ticket = {
        id: nextId('tk'),
        customerId,
        serviceId,
        storeId: store.id,
        assignedRiderId: null,
        pickupDate,
        slot,
        status: 'pickup_scheduled',
        pickupAddress,
        notes: notes || '',
        history: [
          {
            at: new Date().toISOString(),
            status: 'pickup_scheduled',
            byUserId: customerId,
            byName: customer?.name || 'Customer',
            byRole: 'customer',
            note: `Ticket created, assigned to ${store.name}`,
          },
        ],
      };
      setTickets((prev) => [ticket, ...prev]);
      return ticket;
    },
    []
  );

  const cancelTicket = useCallback(
    (ticketId) => logAndPatch(ticketId, { status: 'cancelled' }, 'Cancelled by customer'),
    [logAndPatch]
  );

  // ---- Store: pickup-side ----

  const assignRiderForPickup = useCallback(
    (ticketId, riderId) => {
      const rider = USERS.find((u) => u.id === riderId);
      logAndPatch(ticketId, { assignedRiderId: riderId, status: 'pickup_request_accepted' }, `Rider assigned for pickup: ${rider?.name || riderId}`);
    },
    [logAndPatch]
  );

  // ---- Rider: pickup-side ----

  const riderCollect = useCallback(
    (ticketId) => logAndPatch(ticketId, { status: 'driver_arriving_for_pickup' }, 'Rider en route to pickup'),
    [logAndPatch]
  );

  const scanBag = useCallback(
    (ticketId) => {
      const code = `BAG-${ticketId.split('-').pop().slice(-6).toUpperCase()}`;
      setBags((prev) => {
        const existing = prev.find((b) => b.ticketId === ticketId);
        if (existing) return prev.map((b) => (b.ticketId === ticketId ? { ...b, scanned: true } : b));
        return [...prev, { id: nextId('bag'), code, ticketId, scanned: true }];
      });
      logAndPatch(ticketId, { status: 'pickup_in_progress' }, `Bag ${code} scanned`);
    },
    [logAndPatch]
  );

  const addCloth = useCallback(
    (ticketId, label) => {
      const id = nextId('cloth');
      const tag = `TAG-${id.split('-').pop()}`;
      const cloth = { id, ticketId, tag, label };
      setClothes((prev) => [...prev, cloth]);
      logAndPatch(ticketId, {}, `Item tagged & scanned: ${label} (${tag})`);
      return cloth;
    },
    [logAndPatch]
  );

  const finishPickup = useCallback(
    (ticketId) => logAndPatch(ticketId, { status: 'picked_up' }, 'Pickup completed by rider'),
    [logAndPatch]
  );

  // ---- Store: processing-side (all manual) ----

  const markArrivedAtStore = useCallback(
    (ticketId) => logAndPatch(ticketId, { status: 'arrived_at_store' }, 'Arrived at store'),
    [logAndPatch]
  );
  const startWashing = useCallback(
    (ticketId) => logAndPatch(ticketId, { status: 'washing' }, 'Washing started'),
    [logAndPatch]
  );
  const startIroning = useCallback(
    (ticketId) => logAndPatch(ticketId, { status: 'ironing' }, 'Ironing started'),
    [logAndPatch]
  );
  const markPacked = useCallback(
    (ticketId) => logAndPatch(ticketId, { status: 'packed' }, 'Packed and ready to assign for delivery'),
    [logAndPatch]
  );

  // ---- Store: delivery-side ----

  const assignRiderForDelivery = useCallback(
    (ticketId, riderId) => {
      const rider = USERS.find((u) => u.id === riderId);
      logAndPatch(ticketId, { assignedRiderId: riderId, status: 'ready_for_delivery' }, `Rider assigned for delivery: ${rider?.name || riderId}`);
    },
    [logAndPatch]
  );

  // ---- Rider: delivery-side ----

  const startDelivery = useCallback(
    (ticketId) => logAndPatch(ticketId, { status: 'out_for_delivery' }, 'Rider started delivery'),
    [logAndPatch]
  );
  const markDelivered = useCallback(
    (ticketId) => logAndPatch(ticketId, { status: 'delivered' }, 'Delivered to customer'),
    [logAndPatch]
  );

  // ---- Shared lookups ----

  const getBagForTicket = useCallback((ticketId) => bags.find((b) => b.ticketId === ticketId) || null, [bags]);
  const getClothesForTicket = useCallback((ticketId) => clothes.filter((c) => c.ticketId === ticketId), [clothes]);

  const value = {
    isHydrated,
    users: USERS,
    stores: STORES,
    services: SERVICES,
    tickets,
    bags,
    clothes,
    currentUser,
    today: todayStr(),
    login,
    loginAsRole,
    logout,
    resetDemoData,
    bookPickup,
    cancelTicket,
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
    getBagForTicket,
    getClothesForTicket,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
