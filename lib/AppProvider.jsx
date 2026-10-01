'use client';

import { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from 'react';
import STORES from '@/data/stores.json';
import SERVICES from '@/data/services.json';

// Identity ("who am I") is stored in sessionStorage, not localStorage — that's
// scoped per-TAB, not per-origin, so opening customer/store/rider in three
// tabs of the same browser gives each an independent login; logging out in
// one doesn't touch the others. (localStorage would be shared by every tab of
// the same browser profile, which is surprising — see CONTEXT.md.) Ticket/bag/
// cloth DATA lives on the server (see app/api/*) so every tab/device sees the
// same shared state regardless of which identity storage is used.
const AUTH_STORAGE_KEY = 'laundrylanes-auth-v1';
const POLL_INTERVAL_MS = 5000;

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [tickets, setTickets] = useState([]);
  const [bags, setBags] = useState([]);
  const [clothes, setClothes] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [users, setUsers] = useState([]);
  const [clothTags, setClothTags] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const currentUserIdRef = useRef(null);
  currentUserIdRef.current = currentUserId;

  const applyState = useCallback((data) => {
    if (!data) return;
    setTickets(data.tickets || []);
    setBags(data.bags || []);
    setClothes(data.clothes || []);
    setAddresses(data.addresses || []);
    setUsers(data.users || []);
    setClothTags(data.clothTags || []);
  }, []);

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch('/api/state', { cache: 'no-store' });
      applyState(await res.json());
    } catch {
      // Server unreachable — keep showing whatever we last had rather than crashing.
    }
  }, [applyState]);

  // Load identity from this tab's sessionStorage + first fetch of shared server state.
  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) setCurrentUserId(JSON.parse(raw).currentUserId || null);
    } catch {
      // ignore malformed storage
    }
    fetchState().finally(() => setIsHydrated(true));
  }, [fetchState]);

  // Poll + refetch on focus, so changes made from another device/tab show up
  // without a manual reload — a lightweight stand-in for realtime, since this
  // is a JSON-file store, not a database with subscriptions.
  useEffect(() => {
    const interval = setInterval(fetchState, POLL_INTERVAL_MS);
    const onFocus = () => fetchState();
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [fetchState]);

  useEffect(() => {
    if (!isHydrated) return;
    window.sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ currentUserId }));
  }, [currentUserId, isHydrated]);

  const currentUser = useMemo(() => users.find((u) => u.id === currentUserId) || null, [currentUserId, users]);

  const login = useCallback((email, password) => {
    const match = users.find(
      (u) => u.email.toLowerCase() === String(email).toLowerCase() && u.password === password
    );
    if (match) setCurrentUserId(match.id);
    return match || null;
  }, [users]);

  const loginAsRole = useCallback((role) => {
    const match = users.find((u) => u.role === role);
    if (match) setCurrentUserId(match.id);
    return match || null;
  }, [users]);

  const logout = useCallback(() => setCurrentUserId(null), []);

  const resetDemoData = useCallback(async () => {
    const res = await fetch('/api/reset', { method: 'POST' });
    applyState(await res.json());
  }, [applyState]);

  // Every ticket action is a PATCH to the server; the response is the full,
  // authoritative { tickets, bags, clothes, ... }, which we just adopt
  // wholesale — simpler and safer than trying to patch local state to match.
  // A few actions (scanBag, addCloth) can fail bag/tag pool validation and
  // respond with { error } instead — nothing changed server-side in that
  // case, so don't applyState (it would wipe every list back to empty,
  // since applyState defaults missing keys to []).
  const callAction = useCallback(
    async (ticketId, action, payload) => {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload, actingUserId: currentUserIdRef.current }),
      });
      const data = await res.json();
      if (!data.error) applyState(data);
      return data;
    },
    [applyState]
  );

  const bookPickup = useCallback(async ({ customerId, serviceId, pickupAddress, pincode, pickupDate, slot, notes }) => {
    const res = await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId, serviceId, pickupAddress, pincode, pickupDate, slot, notes }),
    });
    const data = await res.json();
    applyState(data);
    return data.ticket;
  }, [applyState]);

  const addAddress = useCallback(async ({ customerId, label, line1, line2, landmark, city, pincode }) => {
    const res = await fetch('/api/addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId, label, line1, line2, landmark, city, pincode }),
    });
    const data = await res.json();
    applyState(data);
    return data.address;
  }, [applyState]);

  const addEmployee = useCallback(async ({ name, email, password, role, storeId }) => {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role, storeId }),
    });
    const data = await res.json();
    applyState(data);
    return data.user;
  }, [applyState]);

  const updateEmployee = useCallback(async (userId, payload) => {
    const res = await fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.error) applyState(data);
    return data;
  }, [applyState]);

  const deleteEmployee = useCallback(async (userId) => {
    const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
    const data = await res.json();
    if (!data.error) applyState(data);
    return data;
  }, [applyState]);

  const generateBags = useCallback(async (count) => {
    const res = await fetch('/api/bags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count }),
    });
    const data = await res.json();
    applyState(data);
    return data.created;
  }, [applyState]);

  const assignBagToStore = useCallback(async (bagId, storeId) => {
    const res = await fetch(`/api/bags/${bagId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storeId }),
    });
    const data = await res.json();
    if (!data.error) applyState(data);
    return data;
  }, [applyState]);

  const generateClothTags = useCallback(async (count) => {
    const res = await fetch('/api/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count }),
    });
    const data = await res.json();
    applyState(data);
    return data.created;
  }, [applyState]);

  const cancelTicket = useCallback((ticketId) => callAction(ticketId, 'cancelTicket'), [callAction]);
  const assignStoreToTicket = useCallback((ticketId, storeId) => callAction(ticketId, 'assignStoreToTicket', { storeId }), [callAction]);
  const acceptOrder = useCallback((ticketId) => callAction(ticketId, 'acceptOrder'), [callAction]);
  const assignRiderForPickup = useCallback((ticketId, riderId) => callAction(ticketId, 'assignRiderForPickup', { riderId }), [callAction]);
  const riderCollect = useCallback((ticketId) => callAction(ticketId, 'riderCollect'), [callAction]);
  const scanBag = useCallback((ticketId, bagId) => callAction(ticketId, 'scanBag', { bagId }), [callAction]);
  const addCloth = useCallback(
    (ticketId, label, category, tagId) => callAction(ticketId, 'addCloth', { label, category, tagId }),
    [callAction]
  );
  const finishPickup = useCallback((ticketId) => callAction(ticketId, 'finishPickup'), [callAction]);
  const markArrivedAtStore = useCallback((ticketId) => callAction(ticketId, 'markArrivedAtStore'), [callAction]);
  const startWashing = useCallback((ticketId) => callAction(ticketId, 'startWashing'), [callAction]);
  const startIroning = useCallback((ticketId) => callAction(ticketId, 'startIroning'), [callAction]);
  const markPacked = useCallback((ticketId) => callAction(ticketId, 'markPacked'), [callAction]);
  const assignRiderForDelivery = useCallback((ticketId, riderId) => callAction(ticketId, 'assignRiderForDelivery', { riderId }), [callAction]);
  const startDelivery = useCallback((ticketId) => callAction(ticketId, 'startDelivery'), [callAction]);
  const markDelivered = useCallback((ticketId) => callAction(ticketId, 'markDelivered'), [callAction]);
  const rateTicket = useCallback(
    (ticketId, riderRating, serviceRating) => callAction(ticketId, 'rateTicket', { riderRating, serviceRating }),
    [callAction]
  );

  // ---- Shared lookups ----

  const getBagForTicket = useCallback((ticketId) => bags.find((b) => b.ticketId === ticketId) || null, [bags]);
  const getClothesForTicket = useCallback((ticketId) => clothes.filter((c) => c.ticketId === ticketId), [clothes]);

  const value = {
    isHydrated,
    users,
    stores: STORES,
    services: SERVICES,
    tickets,
    bags,
    clothes,
    clothTags,
    addresses,
    currentUser,
    today: todayStr(),
    login,
    loginAsRole,
    logout,
    resetDemoData,
    bookPickup,
    addAddress,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    generateBags,
    assignBagToStore,
    generateClothTags,
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
