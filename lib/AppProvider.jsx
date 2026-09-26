'use client';

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import USERS from '@/data/users.json';
import STORES from '@/data/stores.json';
import SERVICES from '@/data/services.json';
import TICKETS_SEED from '@/data/tickets.json';
import BAGS_SEED from '@/data/bags.json';
import CLOTHES_SEED from '@/data/clothes.json';
import { nearestStore } from '@/lib/haversine';

const STORAGE_KEY = 'laundrylanes-poc-v2';

function offsetToDateStr(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

function buildSeedTickets() {
  return TICKETS_SEED.map((t) => ({ ...t, pickupDate: offsetToDateStr(t.dayOffset) }));
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

  const patchTicket = useCallback((ticketId, patch) => {
    setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, ...patch } : t)));
  }, []);

  // ---- Customer ----

  const bookPickup = useCallback(({ customerId, serviceId, pickupAddress, lat, lng, pickupDate, slot, notes }) => {
    const store = lat != null && lng != null ? nearestStore(STORES, lat, lng) : STORES[0];
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
    };
    setTickets((prev) => [ticket, ...prev]);
    return ticket;
  }, []);

  const cancelTicket = useCallback(
    (ticketId) => {
      patchTicket(ticketId, { status: 'cancelled' });
    },
    [patchTicket]
  );

  // ---- Store: pickup-side ----

  const assignRiderForPickup = useCallback(
    (ticketId, riderId) => {
      patchTicket(ticketId, { assignedRiderId: riderId, status: 'pickup_request_accepted' });
    },
    [patchTicket]
  );

  // ---- Rider: pickup-side ----

  const riderCollect = useCallback(
    (ticketId) => {
      patchTicket(ticketId, { status: 'driver_arriving_for_pickup' });
    },
    [patchTicket]
  );

  const scanBag = useCallback(
    (ticketId) => {
      setBags((prev) => {
        const existing = prev.find((b) => b.ticketId === ticketId);
        if (existing) return prev.map((b) => (b.ticketId === ticketId ? { ...b, scanned: true } : b));
        const bag = { id: nextId('bag'), code: `BAG-${ticketId.split('-').pop().slice(-6).toUpperCase()}`, ticketId, scanned: true };
        return [...prev, bag];
      });
      patchTicket(ticketId, { status: 'pickup_in_progress' });
    },
    [patchTicket]
  );

  const addCloth = useCallback((ticketId, label) => {
    const id = nextId('cloth');
    const cloth = { id, ticketId, tag: `TAG-${id.split('-').pop()}`, label };
    setClothes((prev) => [...prev, cloth]);
    return cloth;
  }, []);

  const finishPickup = useCallback(
    (ticketId) => {
      patchTicket(ticketId, { status: 'picked_up' });
    },
    [patchTicket]
  );

  // ---- Store: processing-side (all manual) ----

  const markArrivedAtStore = useCallback((ticketId) => patchTicket(ticketId, { status: 'arrived_at_store' }), [patchTicket]);
  const startWashing = useCallback((ticketId) => patchTicket(ticketId, { status: 'washing' }), [patchTicket]);
  const startIroning = useCallback((ticketId) => patchTicket(ticketId, { status: 'ironing' }), [patchTicket]);
  const markPacked = useCallback((ticketId) => patchTicket(ticketId, { status: 'packed' }), [patchTicket]);

  // ---- Store: delivery-side ----

  const assignRiderForDelivery = useCallback(
    (ticketId, riderId) => {
      patchTicket(ticketId, { assignedRiderId: riderId, status: 'ready_for_delivery' });
    },
    [patchTicket]
  );

  // ---- Rider: delivery-side ----

  const startDelivery = useCallback((ticketId) => patchTicket(ticketId, { status: 'out_for_delivery' }), [patchTicket]);
  const markDelivered = useCallback((ticketId) => patchTicket(ticketId, { status: 'delivered' }), [patchTicket]);

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
